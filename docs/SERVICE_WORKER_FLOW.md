# Service Worker Navigation Flow

This document illustrates how the service worker handles page refreshes to prevent 404 errors.

## Before the Fix (❌ Broken)

```
User refreshes /aurorae-haven/schedule
         ↓
GitHub Pages: "No file at /aurorae-haven/schedule"
         ↓
Serves 404.html
         ↓
404.html redirects to /aurorae-haven/
         ↓
React app loads
         ↓
RedirectHandler navigates to /schedule
         ↓
✅ Works!

BUT...

User refreshes again
         ↓
TWO service workers registered!
  • /service-worker.js (manual, no navigation fallback)
  • /aurorae-haven/sw.js (vite-plugin-pwa, with navigation fallback)
         ↓
Manual service worker wins (registered first)
         ↓
No navigation fallback configured
         ↓
GitHub Pages: "No file at /aurorae-haven/schedule"
         ↓
❌ 404 ERROR shown to user
```

## After the Fix (✅ Working)

### First Visit (Service Worker Not Active Yet)

```
User visits /aurorae-haven/schedule
         ↓
GitHub Pages: "No file at /aurorae-haven/schedule"
         ↓
Serves 404.html
         ↓
404.html:
  1. Stores path in sessionStorage
  2. Redirects to /aurorae-haven/
         ↓
React app loads at /aurorae-haven/
         ↓
RedirectHandler:
  1. Reads sessionStorage
  2. Navigates to /schedule
         ↓
✅ Correct page displayed

Service worker registers in background
  • /aurorae-haven/sw.js (only one!)
  • With NavigationRoute configured
```

### Subsequent Refreshes (Service Worker Active)

```
User refreshes /aurorae-haven/schedule
         ↓
Service Worker intercepts request
         ↓
Check navigation fallback rules:
  • Is path in allowlist? ✅ Yes (/.* matches all)
  • Is path in denylist? ❌ No (not a static file)
         ↓
Service Worker serves index.html from cache
         ↓
React Router handles /schedule client-side
         ↓
✅ Page loads instantly (no network request!)
         ↓
✅ No 404 error!
```

## Navigation Fallback Rules

### Allowlist (✅ What Gets Handled)

```javascript
navigateFallbackAllowlist: [/.*/]
```

**Matches:**

- `/` - Root path
- `/home` - Home page
- `/schedule` - Schedule page
- `/aurorae-haven/schedule` - Full path
- `/tasks?filter=urgent` - With query params
- `/braindump#notes` - With hash

**Result:** Service worker serves index.html

### Denylist (❌ What Gets Ignored)

```javascript
navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
```

**Pattern 1: `/^\/_/`** (paths starting with underscore)

- `/_api/data` ❌ Denied
- `/_internal/cache` ❌ Denied
- `/schedule` ✅ Allowed (doesn't start with `_`)

**Pattern 2: `/\/[^/?]+\.[^/]+$/`** (files with extensions)

- `/assets/index.js` ❌ Denied (has `.js` extension)
- `/icon-192x192.svg` ❌ Denied (has `.svg` extension)
- `/manifest.json` ❌ Denied (has `.json` extension)
- `/schedule` ✅ Allowed (no file extension)
- `/tasks?id=123` ✅ Allowed (no file extension before `?`)

**Result:** Browser fetches normally (not handled by navigation fallback)

## Offline Mode

In offline mode with relative paths (`BASE_URL='./'`):

```
User refreshes /schedule (served from file://)
         ↓
Browser: "No file at /schedule/index.html"
         ↓
Service Worker intercepts (scope: './')
         ↓
Navigation fallback rules apply
         ↓
Service Worker serves ./index.html from cache
         ↓
React Router handles /schedule
         ↓
✅ Page loads correctly offline!
```

## Technical Implementation

### Service Worker Scope

**Production (GitHub Pages):**

```javascript
navigator.serviceWorker.register('/aurorae-haven/sw.js', {
  scope: '/aurorae-haven/'
})
```

**Offline:**

```javascript
navigator.serviceWorker.register('./sw.js', {
  scope: './'
})
```

### Workbox Configuration

```javascript
// vite.config.js
VitePWA({
  workbox: {
    navigateFallback: 'index.html',
    navigateFallbackAllowlist: [/.*/],
    navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
  }
})
```

### Generated Service Worker

```javascript
// dist/sw.js (minified)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    allowlist: [/.*/],
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
  })
)
```

## Benefits Summary

| Scenario                   | Before Fix                   | After Fix                       |
| -------------------------- | ---------------------------- | ------------------------------- |
| First visit to `/schedule` | ✅ Works (404.html redirect) | ✅ Works (404.html redirect)    |
| Refresh `/schedule`        | ❌ 404 Error                 | ✅ Works (SW serves index.html) |
| Offline refresh            | ❌ 404 Error                 | ✅ Works (SW cache)             |
| Static files               | ✅ Load normally             | ✅ Load normally                |
| Network requests           | Multiple conflicts           | Single, clean SW                |

## Browser Support

All modern browsers that support Service Workers:

- ✅ Chrome 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+

## Performance

- ⚡ **Faster**: Cache-first serving of index.html
- ⚡ **Offline**: Full offline support
- 💾 **Storage**: No increase (same precaching strategy)
- 🌐 **Network**: Reduced (fewer 404 requests)
