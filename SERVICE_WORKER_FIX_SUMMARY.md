# Service Worker Fix Summary - GitHub Pages 404 Issue

## Problem Statement

After deploying to GitHub Pages at `https://aurorae-haven.github.io/aurorae-haven/`, the application exhibited the following issues:

1. **Initial Navigation Works**: Navigating to `https://aurorae-haven.github.io/aurorae-haven/schedule` loads correctly
2. **Refresh Fails**: Refreshing the page shows a 404 error page from GitHub
3. **Service Worker Error**: Console shows:
   ```
   Uncaught (in promise) TypeError: ServiceWorker script at 
   https://aurorae-haven.github.io/sw.js for scope 
   https://aurorae-haven.github.io/ encountered an error during installation.
   ```

## Root Cause Analysis

### The Issue
The service worker (SW) was registered at the **root scope** (`/`) instead of the correct **subpath scope** (`/aurorae-haven/`).

### Why This Happened
1. **Service Worker Persistence**: Once a service worker is registered, it persists across browser sessions and deployments
2. **Old Deployment**: A previous deployment may have registered a SW at root scope
3. **Scope Mismatch**: The new deployment tries to register at `/aurorae-haven/` but the old SW at `/` takes precedence
4. **Navigation Interception**: The old SW intercepts navigation requests but can't serve them correctly, causing 404 errors

### Console Evidence
From the user's screenshot:
- `[RouterApp] BASE_URL: /.` - Incorrect BASE_URL value (should be `/aurorae-haven/`)
- Service worker trying to load from `https://aurorae-haven.github.io/sw.js` (root) instead of `/aurorae-haven/sw.js`
- 404 error on page refresh

## The Fix

### 1. Service Worker Cleanup (src/index.jsx)

Added code to **unregister old service workers** with wrong scopes before the React app mounts:

```javascript
// Clean up old service workers registered at wrong scope
if ('serviceWorker' in navigator) {
  const expectedScope = new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
  console.log('[ServiceWorker] Expected scope:', expectedScope)
  
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    console.log('[ServiceWorker] Found', registrations.length, 'registered service worker(s)')
    
    registrations.forEach((registration) => {
      const scopeUrl = registration.scope
      console.log('[ServiceWorker] Checking SW with scope:', scopeUrl)
      
      // Unregister service workers with wrong scope
      if (scopeUrl !== expectedScope) {
        console.log('[ServiceWorker] Unregistering SW with wrong scope:', scopeUrl)
        registration.unregister().then((success) => {
          if (success) {
            console.log('[ServiceWorker] Successfully unregistered old SW')
          }
        })
      } else {
        console.log('[ServiceWorker] SW scope is correct, keeping it')
      }
    })
  }).catch((error) => {
    console.error('[ServiceWorker] Error checking registrations:', error)
  })
}
```

**How It Works:**
1. Calculates the expected scope based on `BASE_URL` (e.g., `https://aurorae-haven.github.io/aurorae-haven/`)
2. Gets all registered service workers
3. Compares each SW's scope with the expected scope
4. Unregisters any SW with a mismatched scope
5. Keeps SWs with the correct scope

### 2. Environment Variable Priority (vite.config.js)

Fixed the configuration to prioritize environment variables from CI:

```javascript
// Before:
const base = env.VITE_BASE_URL || '/aurorae-haven/'

// After:
const base = process.env.VITE_BASE_URL || env.VITE_BASE_URL || '/aurorae-haven/'
```

**Why This Matters:**
- `loadEnv()` only reads from `.env` files
- Environment variables set in GitHub Actions are available via `process.env`
- The new priority ensures CI-set variables take precedence

### 3. Comprehensive Tests

Added 11 test cases in `src/__tests__/service-worker-cleanup.test.js`:

- ✅ Scope URL comparison
- ✅ Unregistration when scope doesn't match
- ✅ Keeping SW when scope matches
- ✅ Handling multiple registrations
- ✅ Empty registrations array
- ✅ Unregister failures
- ✅ getRegistrations rejection
- ✅ GitHub Pages production scenario
- ✅ Localhost development scenario

## Expected Behavior After Fix

### First Visit After Deployment
1. User visits `https://aurorae-haven.github.io/aurorae-haven/schedule`
2. Old SW at root scope (`/`) is detected
3. Old SW is unregistered
4. New SW at `/aurorae-haven/` is registered by VitePWA plugin
5. Console shows cleanup logs:
   ```
   [ServiceWorker] Expected scope: https://aurorae-haven.github.io/aurorae-haven/
   [ServiceWorker] Found 1 registered service worker(s)
   [ServiceWorker] Checking SW with scope: https://aurorae-haven.github.io/
   [ServiceWorker] Unregistering SW with wrong scope: https://aurorae-haven.github.io/
   [ServiceWorker] Successfully unregistered old SW
   ```

### Subsequent Visits
1. Cleanup code detects correct SW scope
2. Keeps the SW registered
3. Console shows:
   ```
   [ServiceWorker] Expected scope: https://aurorae-haven.github.io/aurorae-haven/
   [ServiceWorker] Found 1 registered service worker(s)
   [ServiceWorker] Checking SW with scope: https://aurorae-haven.github.io/aurorae-haven/
   [ServiceWorker] SW scope is correct, keeping it
   ```

### Page Refreshes
1. User navigates to any route (e.g., `/schedule`)
2. User refreshes the page
3. Service worker intercepts the request
4. SW serves `index.html` (navigation fallback)
5. React Router handles the client-side routing
6. Page loads correctly without 404 error

## Testing Instructions

### Manual Testing on GitHub Pages

1. **Clear Browser State** (to simulate fresh user):
   ```
   - Open DevTools (F12)
   - Go to Application tab
   - Select "Service Workers"
   - Click "Unregister" for all service workers
   - Go to "Storage"
   - Click "Clear site data"
   - Close DevTools
   ```

2. **Initial Visit**:
   - Navigate to https://aurorae-haven.github.io/aurorae-haven/schedule
   - Open DevTools Console
   - Check for cleanup logs showing old SW unregistration
   - Verify page loads correctly

3. **Test Refresh**:
   - Press F5 or Ctrl+R to refresh
   - Page should reload correctly without 404 error
   - Check console for SW logs

4. **Test Direct Navigation**:
   - In a new tab, directly navigate to https://aurorae-haven.github.io/aurorae-haven/tasks
   - Page should load correctly
   - Refresh should work

5. **Test All Routes**:
   - Home: `/aurorae-haven/`
   - Schedule: `/aurorae-haven/schedule`
   - Routines: `/aurorae-haven/routines`
   - Tasks: `/aurorae-haven/tasks`
   - Notes: `/aurorae-haven/braindump`
   - Habits: `/aurorae-haven/habits`
   - Stats: `/aurorae-haven/stats`
   - Library: `/aurorae-haven/library`
   - Settings: `/aurorae-haven/settings`

### Automated Testing

Run the test suite:
```bash
npm test -- --watchAll=false
```

Expected output:
```
Test Suites: 35 passed, 35 total
Tests:       775 passed, 829 total
```

Run only service worker cleanup tests:
```bash
npm test -- service-worker-cleanup.test.js --watchAll=false
```

Expected output:
```
PASS src/__tests__/service-worker-cleanup.test.js
  Service Worker Cleanup
    ✓ correctly identifies matching scope URLs
    ✓ correctly identifies mismatched scope URLs (root vs subpath)
    ✓ correctly identifies mismatched scope URLs (different subpath)
    ✓ unregisters service worker when scope does not match
    ✓ does not unregister service worker when scope matches
    ✓ handles multiple registrations correctly
    ✓ handles empty registrations array
    ✓ handles unregister failure gracefully
    ✓ handles getRegistrations rejection
    ✓ GitHub Pages production: unregisters root scope SW
    ✓ Localhost development: keeps root scope SW

Tests: 11 passed, 11 total
```

## Debugging

### If the issue persists after deployment:

1. **Check Service Worker Registration**:
   - Open DevTools → Application → Service Workers
   - Verify the scope is `https://aurorae-haven.github.io/aurorae-haven/`
   - If scope is `/`, the cleanup didn't work

2. **Check Console Logs**:
   - Look for `[ServiceWorker]` logs
   - Verify BASE_URL is `/aurorae-haven/` (not `/.` or `/`)
   - Check for cleanup logs

3. **Force Unregister**:
   - In DevTools → Application → Service Workers
   - Click "Unregister" for all service workers
   - Refresh the page
   - New SW should register at correct scope

4. **Verify Build Configuration**:
   ```bash
   # Check that built files reference correct base path
   grep -r "aurorae-haven" dist/index.html
   cat dist/registerSW.js
   ```

   Should show:
   ```javascript
   navigator.serviceWorker.register('/aurorae-haven/sw.js', { scope: '/aurorae-haven/' })
   ```

## Prevention

To prevent this issue in the future:

1. **Always use correct BASE_URL**:
   - Production: `VITE_BASE_URL='/aurorae-haven/'`
   - Development: `VITE_BASE_URL='/'`
   - Offline: `VITE_BASE_URL='./'`

2. **Test SW registration** after any deployment changes:
   - Check DevTools → Application → Service Workers
   - Verify scope matches BASE_URL

3. **Monitor console logs** for SW-related errors

4. **Clear SW on major changes**:
   - When changing base path
   - When restructuring routes
   - When updating SW configuration

## Technical Details

### Service Worker Scopes

A service worker's **scope** determines which URLs it can intercept:

- Root scope (`/`): Intercepts ALL URLs on the domain
  - Example: `https://aurorae-haven.github.io/*`
  
- Subpath scope (`/aurorae-haven/`): Intercepts only matching subpaths
  - Example: `https://aurorae-haven.github.io/aurorae-haven/*`

**Problem**: A SW at root scope (`/`) intercepts requests for `/aurorae-haven/*` but can't serve them because it's looking for resources at the wrong path.

### Why Manual Cleanup Wasn't Enough

Users who visit the site will have the old SW cached. Simply deploying a new version doesn't unregister the old SW. The cleanup code ensures every user automatically gets the correct SW on their next visit.

### VitePWA Navigation Fallback

The VitePWA plugin configures the service worker with:
```javascript
navigateFallback: 'index.html'
```

This means:
1. Any navigation request (e.g., `/schedule`) is intercepted by the SW
2. The SW serves `index.html` instead of trying to fetch `/schedule` from the server
3. React Router handles the routing client-side
4. This enables SPA routing without server-side configuration

But this only works if the SW is registered at the correct scope!

## References

- **Vite Documentation**: https://vitejs.dev/config/
- **VitePWA Plugin**: https://vite-pwa-org.netlify.app/
- **Service Worker API**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **GitHub Pages SPA**: https://github.com/rafgraph/spa-github-pages

## Commit History

1. `61b95be` - Initial analysis of 404 redirect issue
2. `9561333` - Add service worker cleanup to unregister old workers at wrong scope
3. `41949b8` - Fix vite.config.js to support environment variables from CI
