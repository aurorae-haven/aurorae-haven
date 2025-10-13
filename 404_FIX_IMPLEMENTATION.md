# 404 Refresh Error - Implementation and Next Steps

## Problem Statement

Users report that manually refreshing pages (F5) causes 404 errors:
- **GitHub Pages**: All pages show 404 on refresh
- **Offline mode**: Home page works, other pages show 404

## What We've Done

### 1. Analysis

We analyzed the complete architecture and identified how the SPA routing should work:

- **Layer 1**: `public/404.html` - GitHub Pages fallback
- **Layer 2**: Service Worker - Intercepts navigation after first visit
- **Layer 3**: `RedirectHandler` - React component that restores the original route

The code appears correct according to documentation and best practices.

### 2. Added Debug Logging

**In `src/index.jsx`**:
- RedirectHandler now logs every step of the redirect process
- Service worker status is logged when the app loads
- Shows: sessionStorage content, basename, path normalization, navigation

**Existing in `public/404.html`**:
- Already has comprehensive logging
- Shows: current location, pathname, stored path, computed base path, redirect timing

### 3. Created Test Infrastructure

**Test server (`scripts/test-spa-routing.js`)**:
- Mimics GitHub Pages behavior exactly
- Serves 404.html for non-existent routes
- Logs all requests
- Run with: `node scripts/test-spa-routing.js`

### 4. Created Documentation

**`DEBUGGING_404_ISSUE.md`**:
- Complete architecture explanation
- Expected behavior documentation
- Potential issues and how to diagnose them
- Manual testing checklist
- Common fixes
- Alternative solutions if current approach doesn't work

**`TESTING_404_FIX.md`**:
- Step-by-step testing instructions
- Expected console output examples
- Common issues and solutions
- Debugging commands to run in browser console
- What information to collect for diagnosis

## Current Configuration

### Production Build (GitHub Pages)
- `BASE_URL`: `/aurorae-haven/`
- Service Worker Scope: `/aurorae-haven/`
- React Router Basename: `/aurorae-haven/`
- Navigation Fallback: `index.html`

### Offline Build
- `BASE_URL`: `./` (relative)
- Service Worker Scope: `./` (normalized to `/` by browser)
- React Router Basename: `/` (normalized from `./`)
- Navigation Fallback: `index.html`

### Service Worker Configuration
```javascript
workbox: {
  skipWaiting: true,         // Activate immediately
  clientsClaim: true,        // Take control immediately
  navigateFallback: 'index.html',  // Serve this for navigation
  navigateFallbackAllowlist: [/.*/],  // Allow all navigation
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]  // Deny API calls and files
}
```

## Why This Should Work

### Theory

1. **First visit to `/aurorae-haven/schedule`**:
   - GitHub Pages doesn't find file → serves 404.html
   - 404.html stores `/aurorae-haven/schedule` in sessionStorage
   - Redirects to `/aurorae-haven/` after 10ms
   - Index.html loads, service worker registers
   - RedirectHandler reads sessionStorage → navigates to `/schedule`
   - User sees Schedule page ✅

2. **Subsequent visits (SW active)**:
   - User refreshes `/aurorae-haven/schedule`
   - Service worker intercepts navigation
   - Serves cached `index.html` from precache
   - React Router sees `/schedule` in URL → renders Schedule page
   - No 404.html, no redirect, instant load ✅

### Why It Might Not Work (Hypotheses)

1. **Service worker not installing**:
   - Browser doesn't support SW
   - HTTPS not available (GitHub Pages has this)
   - Registration failing silently

2. **Service worker not activating**:
   - Old SW still active
   - `skipWaiting`/`clientsClaim` not working
   - Browser cache issues

3. **Navigation fallback not working**:
   - `navigateFallback` URL doesn't match precached URL
   - Navigation route denylist matching incorrectly
   - Workbox version/config mismatch

4. **Basename mismatch**:
   - React Router basename doesn't match deployment path
   - Path normalization logic has bug
   - BASE_URL environment variable incorrect

## Next Steps

### Immediate (User Action Required)

1. **Deploy this branch to GitHub Pages**
2. **Test with DevTools open** (F12)
3. **Navigate to a page** (e.g., /schedule)
4. **Press F5 to refresh**
5. **Collect the following**:
   - Complete console output (from page load to error)
   - Network tab screenshot showing the request/response flow
   - Service worker status (DevTools → Application → Service Workers)

### Analysis Phase

Once we have the logs, we'll be able to see exactly where the flow breaks:

- If `[404.html]` logs appear on every refresh → SW not working
- If `[ServiceWorker]` logs don't appear → SW not installing
- If logs appear but wrong path → Basename or path normalization issue
- If SW intercepts but still 404 → Navigation fallback issue

### Implementation Phase

Based on the diagnosis, we'll implement a targeted fix:

**If SW not installing:**
- Check browser compatibility
- Verify HTTPS is working
- Check for registration errors

**If SW not activating:**
- Force SW update on deploy
- Clear old SW cache
- Verify skipWaiting/clientsClaim config

**If navigation fallback not working:**
- Fix navigateFallback URL to match precache exactly
- Adjust denylist patterns
- Consider using different Workbox config

**If basename mismatch:**
- Fix path normalization logic
- Ensure BASE_URL matches deployment
- Update basename computation

### Alternative Solutions (If Current Approach Fails)

1. **Hash Router**:
   ```javascript
   // Use HashRouter instead of BrowserRouter
   import { HashRouter } from 'react-router-dom'
   // URLs become /#/schedule instead of /schedule
   // No server config needed, works everywhere
   ```

2. **Server-side config**:
   ```javascript
   // Configure GitHub Actions to always serve index.html
   // More reliable than 404.html trick
   ```

3. **Workbox Navigation Route with explicit paths**:
   ```javascript
   // Manually register each route in service worker
   // More control but more code
   ```

## Files Modified

1. `src/index.jsx`:
   - Added debug logging to RedirectHandler
   - Added service worker status logging

2. `scripts/test-spa-routing.js`:
   - Created test server that mimics GitHub Pages

3. `DEBUGGING_404_ISSUE.md`:
   - Complete debugging guide

4. `TESTING_404_FIX.md`:
   - Step-by-step testing instructions

No changes to core routing logic yet - we need logs to identify the exact issue first.

## Expected Timeline

1. **User tests** (< 1 hour): Deploy and collect logs
2. **Diagnosis** (< 1 hour): Analyze logs and identify issue
3. **Fix implementation** (< 2 hours): Make targeted changes
4. **Verification** (< 1 hour): Test fix works in both modes
5. **Documentation** (< 1 hour): Update docs with final solution

Total: ~6 hours from user testing to verified fix

## Success Criteria

The fix will be considered successful when:

1. ✅ GitHub Pages: Refreshing any page works without 404
2. ✅ Offline: Refreshing any page works without 404  
3. ✅ First visit: 404.html redirect works correctly
4. ✅ Subsequent visits: Service worker intercepts and serves from cache
5. ✅ All existing tests continue to pass
6. ✅ No performance regression

## Questions for User

To help us debug effectively:

1. **What browser are you using?** (Chrome, Firefox, Safari, Edge, version?)
2. **What exactly do you see?** (404 page content, blank page, error message, browser default 404?)
3. **Does it happen every time?** (consistently or intermittently?)
4. **When did it start?** (after a specific change, always been broken, used to work?)
5. **Have you tried clearing cache?** (Hard refresh with Ctrl+Shift+R or Cmd+Shift+R?)

## Conclusion

We've added comprehensive debugging and testing infrastructure. The code appears correct according to documentation, but we need real-world logs to identify why it's not working in practice. Once we have the logs, we'll be able to make a targeted fix.

The debugging logs will tell us exactly where the flow is breaking, allowing us to implement the minimal change needed to fix the issue.

---

**Status**: Ready for user testing
**Blocker**: Need console logs from actual GitHub Pages deployment
**Next**: User tests and provides logs, then we diagnose and fix
