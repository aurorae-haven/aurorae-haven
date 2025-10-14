# Service Worker Configuration Fix for 404 Errors on Page Refresh

## Problem Description

When refreshing pages (using F5 or browser refresh) on non-root routes, users were experiencing 404 errors in two scenarios:

1. **GitHub Pages**: All page refreshes (including the home page) resulted in 404 errors
2. **Offline Mode**: Refreshing the home page worked, but refreshing other pages (e.g., `/schedule`, `/tasks`) resulted in 404 errors

## Root Cause

The application had **two conflicting service worker registration systems**:

1. **Manual Registration** (`src/serviceWorkerRegistration.js`):
   - Registered `/service-worker.js`
   - Used custom registration logic from Create React App template
   - Located in `public/service-worker.js`

2. **Automatic Registration** (vite-plugin-pwa):
   - Generated `sw.js` with Workbox
   - Registered via `registerSW.js`
   - Included NavigationRoute for handling SPA routing

These two service workers were conflicting, and the manual one didn't have proper navigation fallback configuration to handle SPA routes.

## Solution

### 1. Removed Duplicate Service Worker Registration

**Removed:**

- `public/service-worker.js` - Old manual service worker file
- Service worker registration code from `src/index.jsx`
- Import of `serviceWorkerRegistration.js`

**Why:** vite-plugin-pwa automatically generates and registers a properly configured service worker.

### 2. Configured Workbox NavigationRoute

**Updated `vite.config.js`** to properly configure the service worker's navigation handling:

```javascript
workbox: {
  // Cache all static assets
  globPatterns: [
    '**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2}'
  ],
  // Configure navigation fallback to serve index.html for all navigation requests
  navigateFallback: 'index.html',
  // Allow all navigation requests to be handled by the fallback
  navigateFallbackAllowlist: [/.*/],
  // Deny list for URLs that should not use the fallback
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  // Runtime caching for external resources
  runtimeCaching: [ /* ... */ ]
}
```

**Configuration Explanation:**

- **`navigateFallback: 'index.html'`**: Serves `index.html` for navigation requests that would otherwise 404
- **`navigateFallbackAllowlist: [/.*/]`**: Allows ALL paths to use the navigation fallback (matches all routes)
- **`navigateFallbackDenylist`**:
  - `/^\/_/` - Denies paths starting with `_` (e.g., `/_api/`, `/_internal/`)
  - `/\/[^/?]+\.[^/]+$/` - Denies requests for static files with extensions (e.g., `/assets/index.js`, `/icon.svg`)

## How It Works

### First Visit (Cold Start)

1. User navigates to `/aurorae-haven/schedule` (GitHub Pages) or `/schedule` (offline)
2. Server doesn't have this file, so:
   - **GitHub Pages**: Serves `404.html`
   - **Offline**: Browser tries to fetch the file
3. `404.html` stores the requested path in `sessionStorage` and redirects to base path
4. React app loads at base path (`/aurorae-haven/` or `/`)
5. `RedirectHandler` component reads `sessionStorage` and navigates to the correct route
6. Service worker gets registered and activated

### Subsequent Navigation (Service Worker Active)

1. User refreshes the page or directly navigates to a route
2. **Service worker intercepts the navigation request**
3. Service worker checks navigation fallback rules:
   - Is it in the allowlist? (Yes - matches `/.*/`)
   - Is it in the denylist? (No - not a static file or `_` path)
4. **Service worker serves `index.html` from cache**
5. React Router handles the routing client-side
6. **No 404 error!**

## Benefits

1. **No more 404 errors** on page refresh for any route
2. **Works offline** - service worker serves cached `index.html`
3. **Works on GitHub Pages** - proper SPA routing support
4. **Faster loading** - service worker serves from cache
5. **Single source of truth** - one service worker managed by vite-plugin-pwa

## Testing

### Automated Tests

Added comprehensive tests in `src/__tests__/service-worker-config.test.js`:

- ✅ NavigationRoute configuration validation
- ✅ Allowlist pattern testing (all paths allowed)
- ✅ Denylist pattern testing (static files and `_` paths denied)
- ✅ Service worker scope configuration (production vs offline)
- ✅ 404.html redirect logic validation
- ✅ Integration flow documentation

### Manual Testing

To test the fix:

#### On GitHub Pages (Production)

1. Deploy to GitHub Pages
2. Navigate to any route (e.g., `https://username.github.io/aurorae-haven/schedule`)
3. Refresh the page (F5)
4. **Expected**: Page loads correctly, no 404 error

#### In Offline Mode

1. Build offline package: `npm run build:offline`
2. Extract and serve: `cd dist-offline && ./start-aurorae-haven.sh`
3. Navigate to any route (e.g., `http://localhost:8000/schedule`)
4. Refresh the page (F5)
5. **Expected**: Page loads correctly, no 404 error

#### In Development

1. Start dev server: `npm run dev`
2. Navigate to any route (e.g., `http://localhost:3000/schedule`)
3. Refresh the page (F5)
4. **Expected**: Page loads correctly (dev server handles routing automatically)

## Migration Notes

### For Developers

- **Before**: Manual service worker registration in `src/index.jsx`
- **After**: Automatic registration by vite-plugin-pwa
- **Breaking Change**: None - all PWA functionality preserved

### For Users

- No action required
- On first load after update, old service worker will be unregistered
- New service worker will be installed automatically
- All offline functionality preserved and improved

## Technical Details

### Service Worker Scope

- **Production (GitHub Pages)**: `/aurorae-haven/`
- **Offline**: `./`
- Both scopes correctly handle their respective base URLs

### Browser Compatibility

The NavigationRoute feature is supported by all modern browsers that support Service Workers:

- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

### Performance Impact

- **Positive**: Faster navigation (cache-first)
- **Positive**: Offline-first architecture
- **Neutral**: Same cache storage usage
- **Neutral**: Same network usage (precaching strategy unchanged)

## Related Files

- `vite.config.js` - Service worker configuration
- `src/index.jsx` - Removed manual registration
- `public/404.html` - GitHub Pages SPA redirect (unchanged)
- `src/__tests__/service-worker-config.test.js` - Automated tests

## References

- [Workbox NavigationRoute Documentation](https://developer.chrome.com/docs/workbox/modules/workbox-routing/#navigation-route)
- [vite-plugin-pwa Documentation](https://vite-plugin-pwa.netlify.app/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
