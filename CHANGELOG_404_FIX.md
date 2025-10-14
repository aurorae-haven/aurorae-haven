# Changelog - Fix 404 Errors on Page Refresh

## Issue

- **Issue #**: Manual refresh of the page returns 404 error
- **Reporter**: @ayanimea
- **Environments Affected**:
  - GitHub Pages (production) - All pages
  - Offline mode - Non-home pages

## Summary of Changes

### Fixed Files

#### 1. `vite.config.js`

**Before:**

```javascript
navigateFallback: 'index.html',
```

**After:**

```javascript
navigateFallback: base === './' ? './index.html' : `${base}index.html`,
```

**Why:** The service worker's `navigateFallback` must use an absolute path (including base URL) for Workbox to correctly resolve the URL for navigation requests.

**Result:**

- Production: `navigateFallback: '/aurorae-haven/index.html'`
- Offline: `navigateFallback: './index.html'`

#### 2. `src/__tests__/service-worker-config.test.js`

**Changes:**

- Added test for production path resolution (`/aurorae-haven/index.html`)
- Added test for offline path resolution (`./index.html`)
- Enhanced documentation of first visit vs subsequent refresh flows
- Added verification tests for path resolution logic

**Why:** To ensure the fix works correctly and prevent regression in future updates.

**Result:** 3 additional passing tests (from 685 to 688 passing tests)

#### 3. `docs/SERVICE_WORKER_404_FIX.md` (NEW)

**Contents:**

- Detailed explanation of the problem and solution
- Technical details about Workbox NavigationRoute
- Flow diagrams for first visit and subsequent refreshes
- Testing checklist for manual verification
- References to relevant documentation

**Why:** To document the fix for future maintainers and help users understand what was changed.

## Technical Details

### How Navigation Works Now

#### First Visit or Hard Refresh (Service Worker NOT Active)

```
User → /aurorae-haven/schedule
  ↓
GitHub Pages → 404.html (file doesn't exist)
  ↓
404.html → stores path in sessionStorage → redirects to /aurorae-haven/
  ↓
React app loads at /aurorae-haven/ → service worker installs
  ↓
RedirectHandler → reads sessionStorage → navigates to /schedule
  ↓
✅ User sees correct page
```

#### Subsequent Refreshes (Service Worker Active)

```
User → refreshes /aurorae-haven/schedule
  ↓
Service Worker → intercepts navigation request
  ↓
Service Worker → serves /aurorae-haven/index.html (via navigateFallback)
  ↓
React Router → handles /schedule route
  ↓
✅ No 404 error, instant navigation!
```

### Generated Service Worker Code

#### Production (`dist/sw.js`)

```javascript
e.registerRoute(
  new e.NavigationRoute(
    e.createHandlerBoundToURL('/aurorae-haven/index.html'), // ✅ Absolute path
    {
      allowlist: [/.*/],
      denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
    }
  )
)
```

#### Offline (`dist-offline-build/sw.js`)

```javascript
e.registerRoute(
  new e.NavigationRoute(
    e.createHandlerBoundToURL('./index.html'), // ✅ Relative path for offline
    {
      allowlist: [/.*/],
      denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
    }
  )
)
```

### Service Worker Registration

#### Production (`dist/registerSW.js`)

```javascript
navigator.serviceWorker.register('/aurorae-haven/sw.js', {
  scope: '/aurorae-haven/'
})
```

#### Offline (`dist-offline/registerSW.js`)

```javascript
navigator.serviceWorker.register('./sw.js', {
  scope: './'
})
```

## Testing Results

### Automated Tests ✅

- **Total Tests**: 742 (688 passing, 54 todo)
- **Test Suites**: 30 passed, 30 total
- **Coverage**: Maintained existing coverage
- **Linting**: Zero errors

### Build Verification ✅

- **Production Build**:
  - ✅ `navigateFallback: '/aurorae-haven/index.html'`
  - ✅ `scope: '/aurorae-haven/'`
  - ✅ Service worker generated correctly
- **Offline Build**:
  - ✅ `navigateFallback: './index.html'`
  - ✅ `scope: './'`
  - ✅ Service worker generated correctly
  - ✅ Package size: ~1.07 MB

### Manual Testing Required ⏳

The fix needs to be verified on the deployed site:

**Production (GitHub Pages):**

1. Visit https://aurorae-haven.github.io/aurorae-haven/
2. Navigate to different pages (schedule, tasks, notes, etc.)
3. Refresh each page (F5 or Ctrl+R)
4. Verify: No 404 errors, pages load correctly

**Offline Build:**

1. Extract the offline package
2. Start local server: `python3 -m http.server 8000`
3. Open http://localhost:8000
4. Navigate to different pages
5. Refresh each page (F5 or Ctrl+R)
6. Verify: No 404 errors, pages load correctly

### DevTools Verification

Check in Browser DevTools:

- **Application → Service Workers**: SW should be activated
- **Network**: Navigation requests should be intercepted by SW
- **Console**: No errors related to routing or service worker

## Migration Notes

### For Users

No action required. The fix is transparent to users:

- Pages will refresh correctly after deployment
- No data loss or migration needed
- Service worker will update automatically

### For Developers

If you're building on this codebase:

- The `navigateFallback` path must always include the base URL
- Test both production and offline builds after changes to `vite.config.js`
- Check generated `sw.js` to verify correct path resolution

## Related Issues

- Issue: "Manual refresh of the page returns 404 error"
- Affects: Both GitHub Pages and offline builds
- Status: Fixed ✅

## References

- [Workbox NavigationRoute](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-routing.NavigationRoute)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [GitHub Pages SPA Routing](https://github.com/rafgraph/spa-github-pages)

## Deployment Checklist

Before merging this PR:

- [x] All automated tests pass
- [x] No linting errors
- [x] Production build generates correct service worker
- [x] Offline build generates correct service worker
- [x] Documentation added
- [x] Tests updated

After merging and deployment:

- [ ] Verify production site on GitHub Pages
- [ ] Test page refresh on all routes
- [ ] Verify service worker activation
- [ ] Test offline build with local server
- [ ] Update issue with verification results

## Commit History

1. `669e64b` - Fix service worker navigateFallback path resolution
2. `c5d6a65` - Update service worker tests to document the fix
3. `1e2a0eb` - Add documentation for service worker 404 fix

---

**Fixed by**: @copilot  
**Reviewed by**: @ayanimea (pending)  
**Date**: 2025-10-13
