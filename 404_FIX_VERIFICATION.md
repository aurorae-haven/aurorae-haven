# 404 Refresh Error - Fix Verification Guide

## Issue

Manual page refresh (F5) was causing 404 errors in both GitHub Pages and offline mode.

## Root Cause

The service worker's `navigateFallback` configuration had a path mismatch:

- **Precached URL**: `index.html`
- **Navigation fallback URL**: `/aurorae-haven/index.html` (production) or `./index.html` (offline)

Workbox's `createHandlerBoundToURL()` requires the exact precached URL to work. The mismatch prevented the service worker from properly intercepting navigation requests and serving the cached `index.html` for SPA routing.

## Fix Applied

Changed `vite.config.js` to use a simple `'index.html'` path for `navigateFallback`:

```javascript
// Before (incorrect)
navigateFallback: base === './' ? './index.html' : `${base}index.html`,

// After (correct)
navigateFallback: 'index.html',
```

The service worker's scope automatically resolves this relative to the base path, ensuring the URL matches the precached entry.

## How to Verify the Fix

### 1. GitHub Pages (Production)

1. Deploy the updated code to GitHub Pages
2. Navigate to https://aurorae-haven.github.io/aurorae-haven/
3. Wait for the service worker to install and activate (check browser DevTools > Application > Service Workers)
4. Navigate to a different route (e.g., click "Schedule")
5. **Press F5 or Ctrl+R to manually refresh the page**
6. ✅ Expected: Page loads correctly without 404 error
7. Test all routes: `/home`, `/schedule`, `/routines`, `/tasks`, `/habits`, `/stats`, `/library`, `/settings`

### 2. Offline Mode

1. Extract the offline package:

   ```bash
   cd dist-offline
   tar -xzf aurorae-haven-offline-*.tar.gz
   ```

2. Start a local web server:

   ```bash
   # Option 1: Python
   python3 -m http.server 8000

   # Option 2: Node.js (http-server)
   npx http-server -p 8000

   # Option 3: Use included launchers
   ./start-aurorae-haven-python.sh
   ```

3. Open http://localhost:8000 in your browser
4. Wait for the service worker to install and activate
5. Navigate to a different route (e.g., click "Schedule")
6. **Press F5 or Ctrl+R to manually refresh the page**
7. ✅ Expected: Page loads correctly without 404 error

### 3. Verify Service Worker Configuration

Open browser DevTools (F12) and check:

1. **Application > Service Workers**
   - Status should be "activated and is running"
   - Scope should be `/aurorae-haven/` (production) or `/` (offline)

2. **Application > Cache Storage**
   - Look for "workbox-precache" cache
   - Verify `index.html` is cached

3. **Console**
   - No service worker errors
   - Navigation requests should be served from service worker cache

4. **Network tab**
   - After service worker is active, manual refresh should show:
     - Request URL: `/aurorae-haven/schedule` (or similar route)
     - Status: `200 OK (from ServiceWorker)`
     - Size: (from ServiceWorker)

## Technical Details

### Workbox Navigation Fallback

- `navigateFallback` must reference a precached URL exactly
- The service worker resolves the URL relative to its scope
- For production: scope is `/aurorae-haven/`, navigateFallback is `index.html` → resolves to `/aurorae-haven/index.html`
- For offline: scope is `./`, navigateFallback is `index.html` → resolves to `./index.html`

### Precache Manifest

Files are precached with URLs relative to the service worker's scope:

```javascript
{url:"index.html", revision:"..."}
{url:"404.html", revision:"..."}
{url:"assets/index-xyz.js", revision:null}
```

### Navigation Route

The service worker creates a navigation route that intercepts all navigation requests:

```javascript
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('index.html'), // Must match precached URL!
    {
      allowlist: [/.*/],
      denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
    }
  )
)
```

## Fallback Mechanism (404.html)

The 404.html file is still needed as a fallback for:

1. First-time visitors (before service worker is installed)
2. Browsers that don't support service workers
3. Edge cases where service worker fails

It redirects to the base path and stores the requested path in `sessionStorage`, allowing React Router to restore the correct route.

## Test Coverage

Added comprehensive test suite in `src/__tests__/service-worker-navigation-fallback.test.js`:

- ✅ Validates `navigateFallback` uses simple `'index.html'` path
- ✅ Verifies precached URL and navigateFallback match
- ✅ Tests navigation fallback behavior for root and nested routes
- ✅ Validates allowlist and denylist patterns
- ✅ Documents the bug fix and root cause

All tests pass: 31 test suites, 699 tests ✓

## References

- [Workbox NavigationRoute Documentation](https://developers.google.com/web/tools/workbox/modules/workbox-routing#how_to_register_a_navigation_route)
- [Service Worker Scope](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#scope)
- [SPA on GitHub Pages](https://github.com/rafgraph/spa-github-pages)
