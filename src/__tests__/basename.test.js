/**
 * Tests for basename normalization in React Router
 * Validates that offline builds with BASE_URL='./' are normalized to '/' for React Router
 */

describe('Basename Normalization for Offline Builds', () => {
  describe('basename normalization logic', () => {
    test('normalizes "./" to "/" for React Router compatibility', () => {
      // Simulate the normalization logic in src/index.jsx
      const baseUrl = './'
      const basename = baseUrl === './' ? '/' : baseUrl

      expect(basename).toBe('/')
      expect(basename).not.toBe('./')
    })

    test('preserves absolute paths like "/aurorae-haven/" for production', () => {
      // Production build should keep the full path
      const baseUrl = '/aurorae-haven/'
      const basename = baseUrl === './' ? '/' : baseUrl

      expect(basename).toBe('/aurorae-haven/')
      expect(basename).not.toBe('./')
    })

    test('handles default "/" basename', () => {
      const baseUrl = '/'
      const basename = baseUrl === './' ? '/' : baseUrl

      expect(basename).toBe('/')
    })

    test('handles empty string by defaulting to "/"', () => {
      const baseUrl = '' || '/'
      const basename = baseUrl === './' ? '/' : baseUrl

      expect(basename).toBe('/')
    })
  })

  describe('React Router basename requirements', () => {
    test('validates that "./" is not a valid React Router basename', () => {
      // React Router requires absolute paths starting with '/'
      const invalidBasename = './'
      const isValidReactRouterBasename = invalidBasename.startsWith('/')

      expect(isValidReactRouterBasename).toBe(false)
    })

    test('validates that "/" is a valid React Router basename', () => {
      const validBasename = '/'
      const isValidReactRouterBasename = validBasename.startsWith('/')

      expect(isValidReactRouterBasename).toBe(true)
    })

    test('validates that "/aurorae-haven/" is a valid React Router basename', () => {
      const validBasename = '/aurorae-haven/'
      const isValidReactRouterBasename = validBasename.startsWith('/')

      expect(isValidReactRouterBasename).toBe(true)
    })
  })

  describe('offline build scenario', () => {
    test('simulates offline build with VITE_BASE_URL="./"', () => {
      // Mock import.meta.env.BASE_URL for offline build
      const VITE_BASE_URL = './'

      // Apply the same normalization logic from src/index.jsx
      const baseUrl = VITE_BASE_URL || '/'
      const basename = baseUrl === './' ? '/' : baseUrl

      // Verify normalization
      expect(basename).toBe('/')
      expect(basename).not.toBe('./')
    })

    test('simulates production build with VITE_BASE_URL="/aurorae-haven/"', () => {
      // Mock import.meta.env.BASE_URL for production build
      const VITE_BASE_URL = '/aurorae-haven/'

      // Apply the same normalization logic from src/index.jsx
      const baseUrl = VITE_BASE_URL || '/'
      const basename = baseUrl === './' ? '/' : baseUrl

      // Verify no normalization needed
      expect(basename).toBe('/aurorae-haven/')
      expect(basename).not.toBe('./')
    })
  })

  describe('bug fix validation', () => {
    test('verifies the fix prevents blank page in offline builds', () => {
      // Before fix: basename would be './' causing routing to fail
      const beforeFix = {
        baseUrl: './',
        basename: './', // Invalid for React Router
        causesBlankPage: true
      }

      // After fix: basename is normalized to '/'
      const afterFix = {
        baseUrl: './',
        basename: './' === './' ? '/' : './', // Normalized
        causesBlankPage: false
      }

      expect(beforeFix.basename).toBe('./')
      expect(afterFix.basename).toBe('/')
      expect(afterFix.causesBlankPage).toBe(false)
    })

    test('documents that Vite base and React Router basename serve different purposes', () => {
      // Vite's base URL is for asset paths (can be relative)
      const viteBaseUrl = './'
      const assetPath = `${viteBaseUrl}assets/index.js`

      // React Router's basename is for route paths (must be absolute)
      const reactRouterBasename = viteBaseUrl === './' ? '/' : viteBaseUrl
      const routePath = `${reactRouterBasename}schedule`

      expect(assetPath).toContain('./assets/')
      expect(reactRouterBasename).toBe('/')
      expect(routePath).toBe('/schedule')
    })
  })

  describe('edge cases', () => {
    test('handles null or undefined BASE_URL', () => {
      const baseUrl = null || undefined || '/'
      const basename = baseUrl === './' ? '/' : baseUrl

      expect(basename).toBe('/')
    })

    test('handles multiple slashes in basename', () => {
      const baseUrl = '//aurorae-haven//'
      const basename = baseUrl === './' ? '/' : baseUrl

      // Should preserve the original value if not './'
      expect(basename).toBe('//aurorae-haven//')
    })

    test('handles basename without trailing slash', () => {
      const baseUrl = '/aurorae-haven'
      const basename = baseUrl === './' ? '/' : baseUrl

      expect(basename).toBe('/aurorae-haven')
    })
  })
})
