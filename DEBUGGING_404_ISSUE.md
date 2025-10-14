# Debugging the 404 Refresh Issue

## Current Status

**Issue**: Manual page refresh (F5) causes 404 errors

- **GitHub Pages**: All pages show 404 on refresh
- **Offline**: Home page works, other pages show 404

## Investigation Steps

### 1. Understanding the Architecture

The app uses a multi-layered approach to handle SPA routing:

1. **404.html** (First line of defense - GitHub Pages only)
   - GitHub Pages serves this when a route doesn't exist as a file
   - JavaScript stores the requested path in `sessionStorage`
   - Redirects to the app base path (`/aurorae-haven/`)
2. **Service Worker** (Second line of defense - After first visit)
   - Intercepts navigation requests
   - Serves cached `index.html` directly
   - Bypasses GitHub Pages 404.html completely
3. **RedirectHandler** (React component)
   - Reads `sessionStorage` for the original path
   - Uses React Router to navigate to the correct route

### 2. What We've Added for Debugging

**In `src/index.jsx`:**

```javascript
// RedirectHandler now logs:
console.log('[RedirectHandler] Checking for redirectPath in sessionStorage...')
console.log('[RedirectHandler] redirectPath:', redirectPath)
console.log('[RedirectHandler] basename:', basename)
console.log('[RedirectHandler] Normalized path:', path)
console.log('[RedirectHandler] Navigating to:', path)

// Service worker status logging:
console.log('[ServiceWorker] Service worker is active and ready')
console.log('[ServiceWorker] Scope:', registration.scope)
console.log('[ServiceWorker] Active SW:', registration.active?.scriptURL)
```

**In `public/404.html` (already present):**

```javascript
console.log('[404.html] Current location:', location.href)
console.log('[404.html] Pathname:', location.pathname)
console.log(
  '[404.html] Stored redirectPath:',
  sessionStorage.getItem('redirectPath')
)
console.log('[404.html] Computed base path:', basePath)
```

### 3. Testing Locally

We've created a test server that mimics GitHub Pages behavior:

```bash
# Build the app
npm run build

# Start the test server (mimics GitHub Pages)
node scripts/test-spa-routing.js

# Open in browser
open http://localhost:8080/aurorae-haven/
```

**Test server features:**

- Serves static files from `dist/`
- Returns `404.html` for non-existent routes (like GitHub Pages)
- Logs all requests for debugging

### 4. Expected Behavior

#### First Visit (Service Worker Not Active Yet)

1. User navigates to `https://domain.com/aurorae-haven/schedule`
2. GitHub Pages doesn't find `/schedule` file → serves `404.html` with 404 status
3. Browser displays 404.html (shows "Redirecting to app...")
4. 404.html JavaScript runs:
   ```
   [404.html] Current location: https://domain.com/aurorae-haven/schedule
   [404.html] Pathname: /aurorae-haven/schedule
   [404.html] Stored redirectPath: /aurorae-haven/schedule
   [404.html] Computed base path: https://domain.com/aurorae-haven/
   [404.html] Redirecting in 10ms...
   ```
5. After 10ms delay, redirects to `/aurorae-haven/`
6. Browser loads `index.html`
7. React app starts, service worker registers
8. RedirectHandler runs:
   ```
   [RedirectHandler] Checking for redirectPath in sessionStorage...
   [RedirectHandler] redirectPath: /aurorae-haven/schedule
   [RedirectHandler] basename: /aurorae-haven/
   [RedirectHandler] Normalized path: /schedule
   [RedirectHandler] Navigating to: /schedule
   ```
9. React Router navigates to `/schedule`
10. User sees the Schedule page ✅

#### Subsequent Visits (Service Worker Active)

1. User refreshes `/aurorae-haven/schedule` (presses F5)
2. Browser sends navigation request to `/aurorae-haven/schedule`
3. **Service worker intercepts the request** (doesn't reach GitHub Pages!)
4. Service worker checks navigation fallback rules:
   - allowlist: `/.*/` → matches everything
   - denylist: `/^\/_/` (underscore-prefixed), `/\/[^/?]+\.[^/]+$/` (file extensions) → doesn't match
5. Service worker serves cached `index.html` from precache
6. Browser loads index.html (from cache, instant!)
7. React Router sees `/schedule` in URL → renders Schedule page
8. No sessionStorage redirect needed!
9. User sees the Schedule page immediately ✅

**Network tab shows:**

```
/aurorae-haven/schedule  | (from ServiceWorker) | 200 OK
```

### 5. Potential Issues

#### Issue A: Service Worker Not Installing

**Symptoms:**

- Every refresh shows 404.html and redirects (slow)
- Never see "(from ServiceWorker)" in Network tab
- Console doesn't show service worker logs

**Causes:**

- Service worker registration failing
- Browser not supporting service workers
- HTTPS not enabled (GitHub Pages provides this)
- Service worker file not being served correctly

**Check:**

```javascript
// In browser console
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log('Registration:', reg)
  if (reg) {
    console.log('Scope:', reg.scope)
    console.log('Active:', reg.active)
    console.log('State:', reg.active?.state)
  }
})
```

#### Issue B: Service Worker Not Activating

**Symptoms:**

- Service worker installs but doesn't activate
- Old service worker still active
- Changes not taking effect

**Causes:**

- `skipWaiting` not working
- Multiple tabs open with old SW
- Browser caching issues

**Fix:**

1. Close all tabs with the app
2. Open DevTools → Application → Service Workers
3. Click "Unregister" on old SW
4. Refresh page
5. New SW should install and activate

#### Issue C: Navigation Fallback Not Working

**Symptoms:**

- Service worker is active
- But navigation requests still go to network
- 404.html is still being served

**Causes:**

- `navigateFallback` URL doesn't match precached URL
- Navigation route not registered correctly
- Workbox version mismatch

**Check:**

```javascript
// In service worker context (DevTools → Application → Service Workers → inspect)
caches
  .open('workbox-precache-v2-https://domain.com/aurorae-haven/')
  .then((cache) => {
    cache.keys().then((keys) => {
      console.log(
        'Precached URLs:',
        keys.map((k) => k.url)
      )
    })
  })
```

#### Issue D: Basename Mismatch

**Symptoms:**

- 404.html redirects work
- But React Router shows wrong page
- URL doesn't match page content

**Causes:**

- `import.meta.env.BASE_URL` doesn't match actual deployment path
- `basename` in `BrowserRouter` is wrong
- `normalizeRedirectPath` logic has bug

**Check:**

```javascript
// In browser console
console.log('BASE_URL:', import.meta.env.BASE_URL)
console.log('Current pathname:', window.location.pathname)
console.log('Expected basename:', '/aurorae-haven/')
```

### 6. Manual Testing Checklist

When deployed to GitHub Pages:

- [ ] Open DevTools before testing
- [ ] Navigate to `https://[username].github.io/aurorae-haven/`
- [ ] Check Console for `[ServiceWorker]` logs
- [ ] Navigate to `/schedule` page
- [ ] Check Console for navigation
- [ ] Press F5 to refresh
- [ ] Check Console for `[404.html]` or `[ServiceWorker]` logs
- [ ] Check Network tab for source of response:
  - First visit: Should see `404.html` (status 404) then redirect
  - After SW active: Should see `(from ServiceWorker)` (status 200)
- [ ] Try other routes: `/tasks`, `/habits`, `/notes`
- [ ] Check if all routes work after refresh

### 7. Common Fixes

#### Fix 1: Clear Service Worker Cache

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(function (registrations) {
  for (let registration of registrations) {
    registration.unregister()
  }
})

// Then refresh page
location.reload()
```

#### Fix 2: Clear Browser Cache

1. DevTools → Application → Storage
2. Click "Clear site data"
3. Refresh page

#### Fix 3: Force Service Worker Update

```javascript
// In browser console
navigator.serviceWorker.getRegistration().then((registration) => {
  if (registration) {
    registration.update()
  }
})
```

### 8. Next Steps

If the issue persists after adding debug logging:

1. **Deploy to GitHub Pages** with the new debug logs
2. **Test in browser** and collect console logs
3. **Check Network tab** to see request/response flow
4. **Share logs** so we can diagnose the exact issue
5. **Consider alternative approaches** if current solution doesn't work

### 9. Alternative Solutions (If Needed)

If the current approach doesn't work, we can try:

**Option A: Hash Router**

- Use `HashRouter` instead of `BrowserRouter`
- URLs become `#/schedule` instead of `/schedule`
- No server configuration needed
- Works everywhere, including `file://` URLs
- Downside: Less clean URLs, no SSR possible

**Option B: Server-Side Redirect**

- Configure GitHub Pages to always serve `index.html`
- Requires `.nojekyll` file (already present)
- May need custom GitHub Action workflow
- More reliable than 404.html trick

**Option C: Workbox NavigationRoute with Explicit URLs**

- Instead of `navigateFallback: 'index.html'`
- Manually register routes in service worker
- More control but more code

### 10. Questions for User

To help diagnose:

1. **Which browser** are you using? (Chrome, Firefox, Safari, Edge?)
2. **What do you see** when you refresh? (404 page content, blank page, error message?)
3. **Console logs**: Can you share the browser console output?
4. **Network tab**: Can you share a screenshot of the Network tab when refreshing?
5. **Service worker status**: DevTools → Application → Service Workers - what does it show?

### 11. Files Modified

- `src/index.jsx`: Added debug logging to RedirectHandler and SW status
- `scripts/test-spa-routing.js`: Created test server to simulate GitHub Pages

No changes to the core routing logic yet - first we need to understand what's failing.
