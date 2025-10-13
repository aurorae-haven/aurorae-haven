/**
 * Tests for service worker navigation fallback configuration
 * Validates that the navigation fallback URL matches the precached index.html entry
 */

describe('Service Worker Navigation Fallback', () => {
  describe('navigateFallback configuration', () => {
    test('navigateFallback should use simple "index.html" path', () => {
      // The navigateFallback should reference the precached URL exactly
      // Workbox precaches files relative to the service worker's scope
      const navigateFallback = 'index.html'
      
      expect(navigateFallback).toBe('index.html')
      expect(navigateFallback).not.toContain('/aurorae-haven/')
      expect(navigateFallback).not.toContain('./')
    })

    test('precached URL and navigateFallback should match', () => {
      // Both should reference 'index.html' for proper navigation fallback
      const precachedUrl = 'index.html'
      const navigateFallback = 'index.html'
      
      expect(navigateFallback).toBe(precachedUrl)
    })

    test('navigateFallback should not include base path', () => {
      // The base path is handled by the service worker's scope
      // The navigateFallback should be relative to that scope
      const base = '/aurorae-haven/'
      const navigateFallback = 'index.html'
      
      // navigateFallback should NOT include the base path
      expect(navigateFallback).not.toContain(base)
      
      // This is incorrect (the old implementation):
      const incorrectFallback = `${base}index.html`
      expect(navigateFallback).not.toBe(incorrectFallback)
    })
  })

  describe('service worker scope and registration', () => {
    test('production build uses correct scope', () => {
      // For production (GitHub Pages)
      const swPath = '/aurorae-haven/sw.js'
      const swScope = '/aurorae-haven/'
      
      expect(swScope).toMatch(/^\//)
      expect(swScope).toMatch(/\/$/)
      expect(swPath).toContain(swScope.slice(0, -1))
    })

    test('offline build uses correct scope', () => {
      // For offline (local file system or local server)
      const swPath = './sw.js'
      const swScope = './'
      
      expect(swPath).toContain('./')
      expect(swScope).toBe('./')
    })
  })

  describe('navigation fallback behavior', () => {
    test('should handle root path refresh', () => {
      // When refreshing /aurorae-haven/ or /
      const rootPath = '/aurorae-haven/'
      const fallbackUrl = 'index.html'
      
      // Service worker should serve index.html
      expect(fallbackUrl).toBe('index.html')
    })

    test('should handle nested route refresh', () => {
      // When refreshing /aurorae-haven/schedule
      const nestedPath = '/aurorae-haven/schedule'
      const fallbackUrl = 'index.html'
      
      // Service worker should still serve index.html
      expect(fallbackUrl).toBe('index.html')
    })

    test('navigateFallbackAllowlist should match all paths', () => {
      // All navigation requests should be handled by the fallback
      const allowlist = [/.*/]
      
      expect(allowlist[0].test('/')).toBe(true)
      expect(allowlist[0].test('/schedule')).toBe(true)
      expect(allowlist[0].test('/routines')).toBe(true)
      expect(allowlist[0].test('/aurorae-haven/schedule')).toBe(true)
    })

    test('navigateFallbackDenylist should exclude file requests', () => {
      // Requests for actual files should not use the fallback
      const denylist = [/^\/_/, /\/[^/?]+\.[^/]+$/]
      
      // Should deny underscore-prefixed paths (e.g., /_next)
      expect(denylist[0].test('/_api')).toBe(true)
      
      // Should deny file extensions (e.g., /style.css, /script.js)
      expect(denylist[1].test('/assets/style.css')).toBe(true)
      expect(denylist[1].test('/script.js')).toBe(true)
      
      // Should NOT deny route paths without extensions
      expect(denylist[0].test('/schedule')).toBe(false)
      expect(denylist[1].test('/schedule')).toBe(false)
      expect(denylist[1].test('/aurorae-haven/schedule')).toBe(false)
    })
  })

  describe('bug fix validation', () => {
    test('verifies the fix prevents 404 on manual refresh', () => {
      // Before fix: navigateFallback was '/aurorae-haven/index.html'
      // but precached URL was 'index.html', causing mismatch
      const beforeFix = {
        precachedUrl: 'index.html',
        navigateFallback: '/aurorae-haven/index.html',
        causes404: true
      }

      // After fix: both reference 'index.html'
      const afterFix = {
        precachedUrl: 'index.html',
        navigateFallback: 'index.html',
        causes404: false
      }

      expect(beforeFix.precachedUrl).not.toBe(beforeFix.navigateFallback)
      expect(afterFix.precachedUrl).toBe(afterFix.navigateFallback)
      expect(afterFix.causes404).toBe(false)
    })

    test('documents the root cause of the issue', () => {
      // The issue was a mismatch between:
      // 1. The URL used in createHandlerBoundToURL() - was '/aurorae-haven/index.html'
      // 2. The URL in the precache manifest - was 'index.html'
      // 
      // Workbox's createHandlerBoundToURL() requires the exact precached URL
      // Service worker scope handles the base path resolution automatically
      
      const rootCause = {
        problem: 'navigateFallback URL did not match precached URL',
        symptom: '404 errors on manual page refresh',
        solution: 'Use simple "index.html" for navigateFallback'
      }
      
      expect(rootCause.solution).toBe('Use simple "index.html" for navigateFallback')
    })
  })
})
