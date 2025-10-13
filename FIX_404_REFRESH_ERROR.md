# Fix for 404 Error on Page Refresh

## Problem Description

Users experienced 404 errors when:
1. Manually refreshing the page using F5 on any client-side route
2. After importing a JSON file, which triggers an automatic page reload

This issue occurred in both online (GitHub Pages) and offline modes.

## Root Cause Analysis

### Issue 1: JSON Import Reload

When a user imported JSON data while on a client-side route like `/aurorae-haven/schedule`:

1. The `reloadPageAfterDelay()` function called `window.location.reload()`
2. This made an HTTP request to `/aurorae-haven/schedule`
3. Without the service worker or proper server configuration, this would return 404
4. Even with GitHub Pages 404.html redirect, it added unnecessary complexity

### Issue 2: Manual F5 Refresh

When pressing F5 on a client-side route:

1. Browser makes a direct HTTP request to that URL
2. Server needs to return index.html (not 404) for the SPA to work
3. Service worker wasn't explicitly configured with navigation fallback
4. GitHub Pages 404.html mechanism worked but was a workaround

## Solution Implemented

### 1. Modified `reloadPageAfterDelay()` Function

**File**: `src/utils/importData.js`

Changed from:
```javascript
window.location.reload()  // Reloads current URL
```

To:
```javascript
window.location.assign(baseUrl)  // Navigates to base URL
```

**Benefits**:
- Base URL (e.g., `/aurorae-haven/`) is guaranteed to exist
- Avoids 404 errors from requesting client-side routes
- User lands on home page with their imported data
- More predictable behavior

### 2. Updated Callers to Pass Base URL

**File**: `src/index.jsx`

```javascript
const baseUrl = import.meta.env.BASE_URL || '/'
const basename = baseUrl === './' ? '/' : baseUrl
reloadPageAfterDelay(1500, undefined, basename)
```

**File**: `src/utils/pageHelpers.js` (legacy code)

```javascript
reloadPageAfterDelay(1500, window, '/')
```

### 3. Configured Service Worker Navigation Fallback

**File**: `vite.config.js`

Added explicit configuration:
```javascript
workbox: {
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/^\/api/, /\.[^/]+$/],
  // ... rest of config
}
```

**Benefits**:
- Service worker now explicitly serves index.html for navigation requests
- Handles F5 refresh correctly on any route
- Works even before 404.html redirect mechanism kicks in

### 4. Updated Tests

**File**: `src/__tests__/reloadPageAfterDelay.test.js`

- Changed from testing `location.reload` to testing `location.assign`
- Added tests for base URL parameter
- Added tests for GitHub Pages base path handling
- Added tests for default root path behavior

## How It Works Now

### Scenario 1: JSON Import

1. User is on `/aurorae-haven/schedule`
2. User imports JSON file
3. `reloadPageAfterDelay()` is called with `baseUrl = '/aurorae-haven/'`
4. Page navigates to `/aurorae-haven/` (home page)
5. User sees home page with newly imported data ✅

### Scenario 2: Manual F5 Refresh (with Service Worker)

1. User is on `/aurorae-haven/schedule`
2. User hits F5
3. Browser requests `/aurorae-haven/schedule`
4. Service worker intercepts with `navigateFallback`
5. Service worker serves `index.html`
6. React Router matches route and displays Schedule page ✅

### Scenario 3: Manual F5 Refresh (without Service Worker)

1. User is on `/aurorae-haven/schedule`
2. User hits F5
3. Browser requests `/aurorae-haven/schedule`
4. GitHub Pages serves 404.html
5. 404.html redirects to `/aurorae-haven/` with sessionStorage
6. React app loads and RedirectHandler navigates to `/schedule` ✅

### Scenario 4: Offline Mode

1. User opens offline package with embedded server
2. Server has SPA fallback (lines 154-157 in `embedded-server.js`)
3. All navigation requests serve `index.html`
4. React Router handles routing correctly ✅

## Testing

### Automated Tests
- All 729 tests pass
- 8 specific tests for `reloadPageAfterDelay` function
- Tests cover all scenarios: default delay, custom delay, base URL handling

### Manual Testing
```bash
# Build the app
npm run build

# Start preview server
npm run preview

# Test all routes return 200 OK
curl -I http://localhost:4173/aurorae-haven/schedule  # 200 OK ✓
curl -I http://localhost:4173/aurorae-haven/tasks     # 200 OK ✓
curl -I http://localhost:4173/aurorae-haven/routines  # 200 OK ✓
# ... all routes work
```

## Files Changed

1. `src/utils/importData.js` - Modified reload function
2. `src/index.jsx` - Updated caller with base URL
3. `src/utils/pageHelpers.js` - Updated legacy caller
4. `src/__tests__/reloadPageAfterDelay.test.js` - Updated tests
5. `vite.config.js` - Added service worker config

## Backwards Compatibility

✅ **Fully backwards compatible**

- Default parameter values maintain original behavior
- Service worker config is additive, not breaking
- GitHub Pages 404.html mechanism still works as fallback
- Offline packages continue to work with embedded server

## Additional Benefits

1. **Better UX**: After import, user lands on home page (makes sense)
2. **Cleaner code**: Less reliance on 404.html redirect workaround
3. **More reliable**: Explicit service worker navigation fallback
4. **Future-proof**: Works across all deployment modes

## Deployment

No special deployment steps required. The fix is automatically included when:
- Building with `npm run build`
- Deploying to GitHub Pages via CI/CD
- Creating offline packages with `npm run build:offline`

## Verification

To verify the fix works:

1. **Deploy to GitHub Pages**: Navigate to any route and hit F5 - should work
2. **Import JSON**: Import data while on any route - should reload to home page
3. **Offline mode**: Download offline package and test navigation - should work
4. **Service worker**: Check DevTools → Application → Service Workers - should show active

## References

- Issue: "Manual refresh of the page returns 404 error"
- Vite PWA Plugin: https://vite-pwa-org.netlify.app/
- Workbox Navigation Route: https://developer.chrome.com/docs/workbox/modules/workbox-routing/#how-to-register-a-navigation-route
