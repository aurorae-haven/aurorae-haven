# Service Worker Fix - Visual Explanation

## Before the Fix (Problem State)

```
┌─────────────────────────────────────────────────────────────────┐
│ User visits: /aurorae-haven/schedule                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Browser checks for Service Worker                                │
│ Found: SW registered at ROOT SCOPE (/)                           │
│   - scriptURL: https://aurorae-haven.github.io/sw.js            │
│   - scope: https://aurorae-haven.github.io/                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ❌ PROBLEM: SW intercepts request for /aurorae-haven/schedule    │
│ ❌ SW tries to serve /schedule (without /aurorae-haven/ prefix)  │
│ ❌ Resource not found → 404 Error                                │
└─────────────────────────────────────────────────────────────────┘
```

## After the Fix (Solution)

```
┌─────────────────────────────────────────────────────────────────┐
│ User visits: /aurorae-haven/schedule                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Page loads → index.jsx executes                                  │
│ ✅ Cleanup code runs BEFORE React app mounts                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ navigator.serviceWorker.getRegistrations()                       │
│ Found: [                                                         │
│   {                                                              │
│     scope: "https://aurorae-haven.github.io/"  ← OLD, WRONG     │
│     scriptURL: "/sw.js"                                          │
│   }                                                              │
│ ]                                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Compare scopes:                                                  │
│ Expected: https://aurorae-haven.github.io/aurorae-haven/        │
│ Found:    https://aurorae-haven.github.io/                      │
│ Match?    ❌ NO                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Unregister old SW                                              │
│ registration.unregister() → Success                              │
│ Console: "[ServiceWorker] Successfully unregistered old SW"      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ VitePWA plugin registers NEW SW                                  │
│ ✅ scriptURL: /aurorae-haven/sw.js                                │
│ ✅ scope: /aurorae-haven/                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ User refreshes page → /aurorae-haven/schedule                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ NEW SW intercepts request                                      │
│ ✅ SW serves index.html (navigation fallback)                     │
│ ✅ React Router handles /schedule route                           │
│ ✅ Page loads correctly - NO 404!                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Concepts Illustrated

### Service Worker Scope Hierarchy

```
Root Scope (/)
│
├─ Intercepts ALL URLs:
│  ├─ / (root)
│  ├─ /aurorae-haven/
│  ├─ /any-path/
│  └─ /any-other-path/
│
└─ Problem: Too broad for subpath deployments

Subpath Scope (/aurorae-haven/)
│
├─ Intercepts ONLY matching URLs:
│  ├─ /aurorae-haven/ ✅
│  ├─ /aurorae-haven/schedule ✅
│  ├─ /aurorae-haven/tasks ✅
│  └─ /any-other-path/ ❌ (not intercepted)
│
└─ Solution: Correct scope for GitHub Pages projects
```

### Cleanup Flow Chart

```
START: Page Load
    │
    ▼
Is serviceWorker supported?
    │
    ├─ NO → Skip cleanup, continue to React
    │
    └─ YES
        │
        ▼
    Get all SW registrations
        │
        ▼
    Any registrations found?
        │
        ├─ NO → Continue to React
        │
        └─ YES
            │
            ▼
        For each registration:
            │
            ▼
        Calculate expected scope
        (BASE_URL + origin)
            │
            ▼
        Does scope match expected?
            │
            ├─ YES → Keep SW
            │       │
            │       └─ Log: "SW scope is correct"
            │
            └─ NO → Unregister SW
                    │
                    └─ Log: "Unregistering SW with wrong scope"
                            │
                            └─ Success? → Log: "Successfully unregistered"
                            └─ Failure? → Log error
    │
    ▼
Continue to React App Mount
    │
    ▼
VitePWA registers NEW SW
(if not already registered at correct scope)
    │
    ▼
END: App Ready
```

## Code Flow

### 1. Entry Point (src/index.jsx)

```javascript
// Before React app mounts:

if ('serviceWorker' in navigator) {
  // Step 1: Calculate expected scope
  const expectedScope = new URL(
    import.meta.env.BASE_URL || '/', 
    window.location.origin
  ).href
  // Result: https://aurorae-haven.github.io/aurorae-haven/

  // Step 2: Get all registrations
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      
      // Step 3: Check each registration
      registrations.forEach((registration) => {
        if (registration.scope !== expectedScope) {
          // Step 4: Unregister wrong scope
          registration.unregister()
        }
      })
    })
}

// After cleanup:
const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

### 2. Service Worker Registration (via VitePWA)

```javascript
// Generated in dist/registerSW.js:

if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(
      '/aurorae-haven/sw.js',        // ← Correct path
      { scope: '/aurorae-haven/' }   // ← Correct scope
    )
  })
}
```

## Timeline of Events

```
T=0ms    │ User navigates to /aurorae-haven/schedule
         │
T=10ms   │ Browser loads index.html
         │
T=20ms   │ Browser loads JavaScript bundle
         │
T=30ms   │ Cleanup code executes
         │ ├─ Gets SW registrations
         │ ├─ Finds old SW at root scope
         │ └─ Unregisters old SW
         │
T=40ms   │ React app mounts
         │ └─ Shows Schedule page
         │
T=50ms   │ VitePWA plugin registers new SW
         │ ├─ Scope: /aurorae-haven/
         │ └─ scriptURL: /aurorae-haven/sw.js
         │
T=60ms   │ New SW installed and activated
         │
--- User refreshes page ---
         │
T=0ms    │ SW intercepts navigation request
         │
T=5ms    │ SW serves index.html (cached)
         │
T=10ms   │ React Router handles /schedule
         │
T=20ms   │ Page renders correctly ✅
```

## Comparison Table

| Aspect | Before Fix | After Fix |
|--------|-----------|-----------|
| **SW Scope** | `https://aurorae-haven.github.io/` (root) | `https://aurorae-haven.github.io/aurorae-haven/` (subpath) |
| **SW Script** | `/sw.js` (tries to load from root) | `/aurorae-haven/sw.js` (correct path) |
| **Page Refresh** | ❌ 404 Error | ✅ Works correctly |
| **Initial Navigation** | ✅ Works (no SW interference) | ✅ Works (correct SW) |
| **Console Errors** | ⚠️ "ServiceWorker script encountered an error" | ✅ Clean console logs |
| **User Experience** | 😞 Broken on refresh | 😊 Seamless navigation |

## Environment Variable Flow

```
GitHub Actions Workflow
│
├─ Sets: VITE_BASE_URL='/aurorae-haven/'
│
▼
vite.config.js
│
├─ Reads: process.env.VITE_BASE_URL
│         (Priority 1: CI environment variable)
│
├─ Fallback: env.VITE_BASE_URL
│            (Priority 2: .env.production file)
│
└─ Default: '/aurorae-haven/'
            (Priority 3: hardcoded fallback)
│
▼
Build Output
│
├─ All asset paths: /aurorae-haven/assets/*
├─ SW registration: /aurorae-haven/sw.js
└─ SW scope: /aurorae-haven/
```

## Why Manual Cleanup Wasn't Enough

```
User A visits site
    │
    ▼
Old SW registers at root scope
    │
    ▼
User A closes browser
    │
    ▼
Developer deploys NEW version with correct scope
    │
    ▼
User A opens browser and visits site again
    │
    ▼
❌ PROBLEM: Old SW still registered!
   (Service workers persist across sessions)
    │
    ▼
✅ SOLUTION: Cleanup code runs on EVERY page load
   - Detects old SW
   - Unregisters it
   - New SW can register correctly
```

## Prevention Strategy

```
Future Deployments
│
├─ Always verify BASE_URL is correct
│
├─ Test SW registration after deployment
│   └─ DevTools → Application → Service Workers
│       ├─ Check scope matches BASE_URL
│       └─ Check scriptURL path is correct
│
├─ Monitor console logs
│   └─ Look for SW-related warnings/errors
│
└─ On major changes (path/routing):
    └─ Consider manual SW cleanup
        └─ Unregister all SWs in DevTools
```

---

**Legend:**
- ✅ = Success / Correct behavior
- ❌ = Error / Incorrect behavior
- ⚠️ = Warning / Potential issue
- 😊 = Good user experience
- 😞 = Poor user experience
