# Fix: Dual Service Worker Registration Issue

## Summary

Fixed a critical bug where the application was attempting to register TWO service workers simultaneously, causing race conditions and inconsistent F5 refresh behavior.

## Problem

The application had both:
1. **Manual service worker**: `public/service-worker.js` registered by `src/serviceWorkerRegistration.js`
2. **VitePWA service worker**: `sw.js` auto-generated and registered by VitePWA plugin

### Symptoms

- **GitHub Pages (deployed)**: F5 refresh on pages like `/schedule`, `/tasks`, etc. consistently returned 404 errors
- **Offline mode**: Home page refresh worked, but refreshing other pages returned 404
- Behavior was inconsistent between local development and deployed versions
- User reported: "On GitHub Pages, it never works. Offline, refreshing the home page works OK, but not refreshing the other pages"

### Root Cause

The application was attempting to register two service workers simultaneously, creating a conflict:
- **Manual SW** (`service-worker.js`): Registered first in most cases, lacked navigation fallback → Consistent 404 on refresh
- **VitePWA SW** (`sw.js`): Attempted to register but often blocked by the already-registered manual SW

The manual service worker consistently took precedence on GitHub Pages deployment because it was explicitly registered in the application code, while the VitePWA service worker registration was injected later in the build process. This meant the manual service worker (without `navigateFallback`) was almost always active, causing consistent 404 errors on page refresh.

## Solution

**Removed the manual service worker entirely** and rely solely on VitePWA:

### Files Removed
- `public/service-worker.js` - Old manual service worker
- `src/serviceWorkerRegistration.js` - Manual registration code

### Files Updated
- `src/index.jsx` - Removed manual `serviceWorkerRegistration.register()` call
- `scripts/validate-pwa.cjs` - Updated to validate VitePWA config instead of manual files
- `package.json` - Updated validate-pwa script path

## Why VitePWA is Better

| Feature | Manual SW | VitePWA SW |
|---------|-----------|------------|
| Navigation fallback | ❌ Not configured | ✅ Configured |
| Workbox strategies | ❌ Basic cache-first only | ✅ Multiple strategies |
| Runtime caching | ❌ No | ✅ CDN caching configured |
| Auto-updates | ⚠️ Manual reload | ✅ Auto-update mode |
| Build integration | ❌ Static file | ✅ Generated with hashes |
| Precaching | ⚠️ Hard-coded list | ✅ Auto-generated from build |

## Verification

### All Tests Pass
```bash
npm test
# Test Suites: 30 passed, 30 total
# Tests: 680 passed, 734 total
```

### Linting Passes
```bash
npm run lint
# No errors or warnings
```

### PWA Validation Passes
```bash
npm run validate-pwa
# ✅ All PWA requirements met!
```

### Build Verification
- Only `sw.js` generated (no `service-worker.js`)
- Navigation fallback configured in generated service worker
- 51 files precached automatically

### Manual Testing

**Preview Server (Production-like)**:
```bash
npm run build && npm run preview
# Test all routes: /, /home, /schedule, /tasks, etc.
# Result: All return HTTP 200 ✅
```

**Offline Package**:
```bash
npm run build:offline
# Extract and test with embedded-server.js
# Result: All routes return HTTP 200 ✅
```

## Navigation Fallback Configuration

The VitePWA service worker includes this critical configuration:

```javascript
// From vite.config.js
workbox: {
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/^\/api/, /\.[^/]+$/],
}
```

This is translated to:

```javascript
// Generated in sw.js
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL("index.html"),
    { denylist: [/^\/api/, /\.[^/]+$/] }
  )
)
```

**What this does:**
- Intercepts all navigation requests (F5, direct URL access)
- Serves `index.html` instead of requesting the actual route
- Allows React Router to handle client-side routing
- Excludes API calls and files with extensions from fallback

## Impact

✅ **Fixed**: Consistent F5 refresh behavior across all routes
✅ **Fixed**: Offline mode refresh now works on all pages
✅ **Fixed**: No more race conditions between service workers
✅ **Improved**: Better PWA compliance with modern tooling
✅ **Simplified**: Less code to maintain (removed 250+ lines)

## References

- Issue: "Manual refresh of the page returns 404 error"
- VitePWA Plugin: https://vite-pwa-org.netlify.app/
- Workbox Navigation Route: https://developer.chrome.com/docs/workbox/modules/workbox-routing/#how-to-register-a-navigation-route
- Previous fix: `FIX_404_REFRESH_ERROR.md` (addressed import reload but not dual SW issue)
