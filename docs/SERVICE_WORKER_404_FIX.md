# Service Worker 404 Fix Documentation

## Problem

Users reported 404 errors when refreshing pages:

- **GitHub Pages (production)**: All pages returned 404 on refresh
- **Offline mode**: Home page worked, but other pages returned 404 on refresh

## Root Cause

The service worker's `navigateFallback` configuration was using a **relative path** (`'index.html'`) instead of an **absolute path** that includes the base URL.

When the Workbox `NavigationRoute` handler tried to resolve the fallback URL, it couldn't correctly determine which file to serve for navigation requests.

## The Fix

### Changed Files

**`vite.config.js`** - Updated the Workbox configuration:

```javascript
// Before (broken):
navigateFallback: 'index.html',

// After (fixed):
navigateFallback: base === './' ? './index.html' : `${base}index.html`,
```

This ensures:

- **Production builds** (`VITE_BASE_URL=/aurorae-haven/`): `navigateFallback: '/aurorae-haven/index.html'`
- **Offline builds** (`VITE_BASE_URL=./`): `navigateFallback: './index.html'`

### How It Works Now

#### First Visit or Hard Refresh (Service Worker NOT Active)

1. User visits `/aurorae-haven/schedule`
2. GitHub Pages serves `404.html` (file doesn't exist)
3. `404.html` stores the path in `sessionStorage` and redirects to `/aurorae-haven/`
4. React app loads at `/aurorae-haven/`, service worker installs
5. `RedirectHandler` component reads `sessionStorage` and navigates to `/schedule`
6. ✅ User sees the correct page

#### Subsequent Refreshes (Service Worker Active)

1. User refreshes `/aurorae-haven/schedule`
2. Service worker intercepts the navigation request
3. Service worker serves `/aurorae-haven/index.html` (via absolute `navigateFallback`)
4. React Router handles the `/schedule` route
5. ✅ No 404 error, instant navigation!

## Technical Details

### Workbox NavigationRoute

The `NavigationRoute` in Workbox uses `createHandlerBoundToURL()` to create a handler that serves a specific URL for navigation requests.

**Before the fix:**

```javascript
e.registerRoute(
  new e.NavigationRoute(
    e.createHandlerBoundToURL('index.html'), // ❌ Relative path
    { allowlist: [/.*/], denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/] }
  )
)
```

**After the fix:**

```javascript
e.registerRoute(
  new e.NavigationRoute(
    e.createHandlerBoundToURL('/aurorae-haven/index.html'), // ✅ Absolute path
    { allowlist: [/.*/], denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/] }
  )
)
```

### Service Worker Scope

The service worker is registered with the correct scope:

**Production:**

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

### URL Resolution

With the correct absolute path:

- Workbox can properly resolve the fallback URL within the service worker scope
- Navigation requests are correctly intercepted and served
- React Router receives the correct HTML and handles client-side routing

## Testing

### Automated Tests

- ✅ All 739 tests pass (685 passing, 54 todo)
- ✅ Service worker configuration tests verify correct path resolution
- ✅ No linting errors

### Manual Testing (Required)

To fully verify the fix:

1. **Production (GitHub Pages):**
   - Visit the deployed site at `https://aurorae-haven.github.io/aurorae-haven/`
   - Navigate to any page (e.g., `/schedule`, `/tasks`, `/notes`)
   - Refresh the page (F5)
   - ✅ Page should load correctly, no 404 error

2. **Offline Build:**
   - Extract the offline package
   - Start a local web server: `python3 -m http.server 8000`
   - Open `http://localhost:8000` in browser
   - Navigate to any page
   - Refresh the page (F5)
   - ✅ Page should load correctly, no 404 error

### Verification Checklist

After deployment, verify:

- [ ] Home page loads correctly on direct visit
- [ ] Home page loads correctly on refresh
- [ ] Schedule page loads correctly on direct visit
- [ ] Schedule page loads correctly on refresh
- [ ] Tasks page loads correctly on direct visit
- [ ] Tasks page loads correctly on refresh
- [ ] Notes page loads correctly on direct visit
- [ ] Notes page loads correctly on refresh
- [ ] Routines page loads correctly on direct visit
- [ ] Routines page loads correctly on refresh
- [ ] Service worker is registered and active (check DevTools → Application → Service Workers)
- [ ] Navigation requests are intercepted by service worker (check DevTools → Network)

## References

- [Workbox NavigationRoute Documentation](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-routing.NavigationRoute)
- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)
- [GitHub Pages SPA Routing](https://github.com/rafgraph/spa-github-pages)

## Related Files

- `vite.config.js` - Workbox configuration
- `public/404.html` - GitHub Pages redirect handler (for first visit)
- `src/index.jsx` - RedirectHandler component (reads sessionStorage)
- `src/__tests__/service-worker-config.test.js` - Service worker tests
- `src/__tests__/404-redirect.test.js` - 404 redirect logic tests
