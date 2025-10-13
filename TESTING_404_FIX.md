# Testing the 404 Refresh Fix

## Quick Test (For Maintainers)

### Test on GitHub Pages

1. **Deploy the latest code to GitHub Pages**
2. **Open the site** in your browser (e.g., `https://username.github.io/aurorae-haven/`)
3. **Open DevTools** (F12)
4. **Navigate to a page** (e.g., click "Schedule")
5. **Press F5 to refresh**
6. **Check the Console** for debug logs:
   - Look for `[404.html]` logs (first visit)
   - Look for `[RedirectHandler]` logs
   - Look for `[ServiceWorker]` logs
7. **Check the Network tab**:
   - First refresh: Should see `404.html` with status 404, then redirect
   - Subsequent refreshes: Should see `(from ServiceWorker)` for the page request
8. **Share the console output** if the issue persists

### Test Offline Mode

1. **Build the offline package**:
   ```bash
   npm run build:offline
   ```

2. **Extract the package**:
   ```bash
   cd dist-offline
   tar -xzf aurorae-haven-offline-v*.tar.gz
   cd dist
   ```

3. **Start a local server** (choose one):
   
   **Option A: Node.js**
   ```bash
   node embedded-server.js
   # or
   ./start-aurorae-haven.sh
   ```
   
   **Option B: Python**
   ```bash
   python3 embedded-server.py
   # or
   ./start-aurorae-haven-python.sh
   ```
   
   **Option C: Any HTTP server**
   ```bash
   npx http-server -p 8080
   # or
   python3 -m http.server 8080
   ```

4. **Open the site** in your browser (e.g., `http://localhost:8080/`)
5. **Repeat steps 3-8 from the GitHub Pages test above**

## What to Look For

### Expected Console Output (First Refresh After Deploy)

```
[404.html] Current location: https://username.github.io/aurorae-haven/schedule
[404.html] Pathname: /aurorae-haven/schedule
[404.html] Origin: https://username.github.io
[404.html] Stored redirectPath: /aurorae-haven/schedule
[404.html] Computed base path: https://username.github.io/aurorae-haven/
[404.html] Redirecting in 10ms...

[ServiceWorker] Service worker is active and ready
[ServiceWorker] Scope: https://username.github.io/aurorae-haven/
[ServiceWorker] Active SW: https://username.github.io/aurorae-haven/sw.js

[RedirectHandler] Checking for redirectPath in sessionStorage...
[RedirectHandler] redirectPath: /aurorae-haven/schedule
[RedirectHandler] basename: /aurorae-haven/
[RedirectHandler] Normalized path: /schedule
[RedirectHandler] Navigating to: /schedule
```

### Expected Console Output (Subsequent Refreshes)

```
[ServiceWorker] Service worker is active and ready
[ServiceWorker] Scope: https://username.github.io/aurorae-haven/
[ServiceWorker] Active SW: https://username.github.io/aurorae-haven/sw.js

[RedirectHandler] Checking for redirectPath in sessionStorage...
[RedirectHandler] redirectPath: null
[RedirectHandler] No redirectPath found, normal page load
```

### Expected Network Tab

**First refresh (before SW is active):**
- `https://username.github.io/aurorae-haven/schedule` - Status: 404
- `https://username.github.io/aurorae-haven/404.html` - Status: 404
- Redirect to `https://username.github.io/aurorae-haven/`
- `https://username.github.io/aurorae-haven/` - Status: 200
- Assets loaded normally

**Subsequent refreshes (after SW is active):**
- `https://username.github.io/aurorae-haven/schedule` - **(from ServiceWorker)** - Status: 200
- Assets loaded from cache

## Common Issues and Solutions

### Issue: Service Worker Not Installing

**Symptoms:**
- Console doesn't show `[ServiceWorker]` logs
- Network tab never shows `(from ServiceWorker)`
- Every refresh goes through 404.html redirect

**Solution:**
1. Check if service workers are supported:
   ```javascript
   console.log('SW supported:', 'serviceWorker' in navigator)
   ```
2. Check if page is served over HTTPS (GitHub Pages provides this)
3. Clear browser cache and try again
4. Check DevTools → Application → Service Workers for errors

### Issue: Old Service Worker Stuck

**Symptoms:**
- Changes not taking effect
- Old version still running

**Solution:**
1. Close all tabs with the app
2. Open DevTools → Application → Service Workers
3. Click "Unregister" on all service workers
4. Clear site data (DevTools → Application → Storage)
5. Refresh the page

### Issue: 404 Every Time

**Symptoms:**
- Service worker logs appear
- But still seeing 404.html on every refresh

**Solution:**
This suggests the service worker is active but the navigation fallback isn't working. Please share:
1. Full console output
2. Network tab screenshot
3. Service worker status from DevTools

### Issue: Works on Home, Not on Other Pages

**Symptoms:**
- Refreshing `/` works fine
- Refreshing `/schedule` shows 404

**Solution:**
This might be a service worker scope or navigation route issue. Please share:
1. Console logs when refreshing `/schedule`
2. Service worker scope from `[ServiceWorker]` logs
3. Precache URLs from service worker (run in console):
   ```javascript
   caches.keys().then(keys => console.log('Cache names:', keys))
   ```

## Debugging Commands

Run these in the browser console to gather information:

```javascript
// Check service worker registration
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('Registration:', {
      scope: reg.scope,
      active: reg.active?.state,
      installing: reg.installing?.state,
      waiting: reg.waiting?.state,
      scriptURL: reg.active?.scriptURL
    })
  } else {
    console.log('No service worker registered')
  }
})

// Check precached URLs
caches.open('workbox-precache-v2-' + location.origin + location.pathname).then(cache => {
  cache.keys().then(keys => {
    console.log('Precached URLs:', keys.map(k => k.url))
  })
})

// Check current BASE_URL
console.log('BASE_URL:', import.meta.env.BASE_URL)

// Check React Router basename
console.log('Current pathname:', location.pathname)
console.log('Expected basename:', '/aurorae-haven/')
```

## Manual Simulation (Advanced)

To test the exact flow:

1. Open DevTools → Application → Service Workers
2. Check "Update on reload" checkbox
3. Navigate to `/schedule`
4. Open Network tab
5. Refresh with DevTools open
6. Watch the request flow in real-time

## Need Help?

If the issue persists after these tests, please provide:

1. **Console output** (full, from page load to error)
2. **Network tab** (screenshot or HAR export)
3. **Service worker status** (from DevTools → Application → Service Workers)
4. **Browser and OS** (e.g., Chrome 120 on Windows 11)
5. **Deployment type** (GitHub Pages or offline)

This will help us diagnose the exact issue and provide a targeted fix.
