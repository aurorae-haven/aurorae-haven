import { DEFAULT_GITHUB_PAGES_BASE_PATH, DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH } from '../utils/configConstants'

describe('configConstants', () => {
  describe('DEFAULT_GITHUB_PAGES_BASE_PATH', () => {
    test('should be defined and not empty', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH).toBeDefined()
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH).not.toBe('')
    })

    test('should be a string', () => {
      expect(typeof DEFAULT_GITHUB_PAGES_BASE_PATH).toBe('string')
    })

    test('should start with a forward slash', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH.startsWith('/')).toBe(true)
    })

    test('should end with a forward slash', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH.endsWith('/')).toBe(true)
    })

    test('should be a valid path for React Router basename', () => {
      // React Router requires absolute paths starting with '/'
      const isValidReactRouterBasename = DEFAULT_GITHUB_PAGES_BASE_PATH.startsWith('/')
      expect(isValidReactRouterBasename).toBe(true)
    })

    test('should match the expected GitHub Pages base path format', () => {
      // GitHub Pages project sites use the format: /repository-name/
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH).toBe('/aurorae-haven/')
    })

    test('should be usable in Vite config as default base', () => {
      // Simulate how it's used in vite.config.js
      const base = process.env.VITE_BASE_URL || DEFAULT_GITHUB_PAGES_BASE_PATH
      expect(base).toBeDefined()
      expect(typeof base).toBe('string')
    })

    test('should be usable with import.meta.env.BASE_URL pattern', () => {
      // Simulate the normalization logic in src/index.jsx
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const basename = baseUrl === './' ? '/' : baseUrl
      expect(basename).toBe(DEFAULT_GITHUB_PAGES_BASE_PATH)
    })
  })

  describe('DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH', () => {
    test('should be defined and not empty', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH).toBeDefined()
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH).not.toBe('')
    })

    test('should be a string', () => {
      expect(typeof DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH).toBe('string')
    })

    test('should start with a forward slash', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH.startsWith('/')).toBe(true)
    })

    test('should not end with a forward slash', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH.endsWith('/')).toBe(false)
    })

    test('should be derived from DEFAULT_GITHUB_PAGES_BASE_PATH', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH).toBe(
        DEFAULT_GITHUB_PAGES_BASE_PATH.slice(0, -1)
      )
    })

    test('should match the expected format', () => {
      expect(DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH).toBe('/aurorae-haven')
    })

    test('should be usable for Express route paths', () => {
      // Simulate Express route path construction
      const routePath = DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH + '/api'
      expect(routePath).toBe('/aurorae-haven/api')
      expect(routePath).not.toContain('//')
    })

    test('should be usable for URL construction without double slashes', () => {
      // Simulate URL construction
      const url = `http://localhost:8080${DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH}/`
      expect(url).toBe('http://localhost:8080/aurorae-haven/')
      expect(url).not.toContain('///')
    })
  })
})
