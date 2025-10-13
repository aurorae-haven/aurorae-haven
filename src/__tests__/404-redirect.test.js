/**
 * Tests for 404.html redirect logic
 * These tests verify the GitHub Pages SPA redirect behavior
 */

describe('404.html Redirect Logic', () => {
  let originalLocation

  beforeEach(() => {
    // Store original location
    originalLocation = window.location

    // Clear sessionStorage
    sessionStorage.clear()
  })

  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks()

    // Clear sessionStorage
    sessionStorage.clear()
  })

  describe('Path Storage', () => {
    test('stores full path with pathname, search, and hash in sessionStorage', () => {
      // Simulate location values
      const mockLocation = {
        pathname: '/aurorae-haven/schedule',
        search: '?id=123',
        hash: '#top',
        origin: 'https://example.github.io'
      }

      // Simulate 404.html logic
      const redirectPath = mockLocation.pathname + mockLocation.search + mockLocation.hash
      sessionStorage.setItem('redirectPath', redirectPath)

      expect(sessionStorage.getItem('redirectPath')).toBe(
        '/aurorae-haven/schedule?id=123#top'
      )
    })

    test('stores pathname only when no search or hash', () => {
      const mockLocation = {
        pathname: '/aurorae-haven/schedule',
        search: '',
        hash: '',
        origin: 'https://example.github.io'
      }

      const redirectPath = mockLocation.pathname + mockLocation.search + mockLocation.hash
      sessionStorage.setItem('redirectPath', redirectPath)

      expect(sessionStorage.getItem('redirectPath')).toBe(
        '/aurorae-haven/schedule'
      )
    })

    test('stores pathname with search but no hash', () => {
      const mockLocation = {
        pathname: '/aurorae-haven/tasks',
        search: '?filter=urgent',
        hash: '',
        origin: 'https://example.github.io'
      }

      const redirectPath = mockLocation.pathname + mockLocation.search + mockLocation.hash
      sessionStorage.setItem('redirectPath', redirectPath)

      expect(sessionStorage.getItem('redirectPath')).toBe(
        '/aurorae-haven/tasks?filter=urgent'
      )
    })

    test('stores pathname with hash but no search', () => {
      const mockLocation = {
        pathname: '/aurorae-haven/braindump',
        search: '',
        hash: '#notes',
        origin: 'https://example.github.io'
      }

      const redirectPath = mockLocation.pathname + mockLocation.search + mockLocation.hash
      sessionStorage.setItem('redirectPath', redirectPath)

      expect(sessionStorage.getItem('redirectPath')).toBe(
        '/aurorae-haven/braindump#notes'
      )
    })
  })

  describe('Base Path Calculation', () => {
    test('calculates base path correctly for /aurorae-haven/schedule', () => {
      const pathname = '/aurorae-haven/schedule'
      const origin = 'https://example.github.io'

      const basePath = origin + pathname.split('/').slice(0, -1).join('/') + '/'

      expect(basePath).toBe('https://example.github.io/aurorae-haven/')
    })

    test('calculates base path correctly for nested routes', () => {
      const pathname = '/aurorae-haven/tasks/urgent'
      const origin = 'https://example.github.io'

      const basePath = origin + pathname.split('/').slice(0, -1).join('/') + '/'

      expect(basePath).toBe('https://example.github.io/aurorae-haven/tasks/')
    })

    test('calculates base path correctly for root-level routes', () => {
      const pathname = '/schedule'
      const origin = 'https://example.github.io'

      const basePath = origin + pathname.split('/').slice(0, -1).join('/') + '/'

      expect(basePath).toBe('https://example.github.io/')
    })

    test('handles single segment paths', () => {
      const pathname = '/aurorae-haven'
      const origin = 'https://example.github.io'

      const basePath = origin + pathname.split('/').slice(0, -1).join('/') + '/'

      expect(basePath).toBe('https://example.github.io/')
    })

    test('handles trailing slash in pathname', () => {
      const pathname = '/aurorae-haven/schedule/'
      const origin = 'https://example.github.io'

      const basePath = origin + pathname.split('/').slice(0, -1).join('/') + '/'

      // When pathname has trailing slash, split creates empty string at end
      // ['', 'aurorae-haven', 'schedule', ''] -> slice(0, -1) -> ['', 'aurorae-haven', 'schedule']
      expect(basePath).toBe('https://example.github.io/aurorae-haven/schedule/')
    })
  })

  describe('Path Split Logic', () => {
    test('splits path correctly for standard route', () => {
      const pathname = '/aurorae-haven/schedule'
      const parts = pathname.split('/')

      expect(parts).toEqual(['', 'aurorae-haven', 'schedule'])
    })

    test('slice(0, -1) removes last segment', () => {
      const pathname = '/aurorae-haven/schedule'
      const parts = pathname.split('/').slice(0, -1)

      expect(parts).toEqual(['', 'aurorae-haven'])
    })

    test('join("/") reconstructs path without last segment', () => {
      const pathname = '/aurorae-haven/schedule'
      const reconstructed = pathname.split('/').slice(0, -1).join('/')

      expect(reconstructed).toBe('/aurorae-haven')
    })
  })

  describe('Integration Scenarios', () => {
    test('handles complete redirect flow for /aurorae-haven/schedule', () => {
      // Setup
      const mockLocation = {
        pathname: '/aurorae-haven/schedule',
        search: '',
        hash: '',
        origin: 'https://example.github.io',
        replace: jest.fn()
      }

      // Simulate 404.html logic
      const redirectPath = mockLocation.pathname + mockLocation.search + mockLocation.hash
      sessionStorage.setItem('redirectPath', redirectPath)

      const basePath =
        mockLocation.origin +
        mockLocation.pathname.split('/').slice(0, -1).join('/') +
        '/'

      // Verify storage
      expect(sessionStorage.getItem('redirectPath')).toBe(
        '/aurorae-haven/schedule'
      )

      // Verify base path
      expect(basePath).toBe('https://example.github.io/aurorae-haven/')
    })

    test('handles complete redirect flow with query and hash', () => {
      // Setup
      const mockLocation = {
        pathname: '/aurorae-haven/tasks',
        search: '?filter=urgent',
        hash: '#list',
        origin: 'https://example.github.io',
        replace: jest.fn()
      }

      // Simulate 404.html logic
      const redirectPath = mockLocation.pathname + mockLocation.search + mockLocation.hash
      sessionStorage.setItem('redirectPath', redirectPath)

      const basePath =
        mockLocation.origin +
        mockLocation.pathname.split('/').slice(0, -1).join('/') +
        '/'

      // Verify storage
      expect(sessionStorage.getItem('redirectPath')).toBe(
        '/aurorae-haven/tasks?filter=urgent#list'
      )

      // Verify base path
      expect(basePath).toBe('https://example.github.io/aurorae-haven/')
    })
  })

  describe('Edge Cases', () => {
    test('handles empty search and hash strings correctly', () => {
      const pathname = '/aurorae-haven/schedule'
      const search = ''
      const hash = ''

      const fullPath = pathname + search + hash

      expect(fullPath).toBe('/aurorae-haven/schedule')
      expect(fullPath).not.toContain('?')
      expect(fullPath).not.toContain('#')
    })

    test('handles special characters in pathname', () => {
      const pathname = '/aurorae-haven/schedule-2024'
      const basePath =
        'https://example.github.io' +
        pathname.split('/').slice(0, -1).join('/') +
        '/'

      expect(basePath).toBe('https://example.github.io/aurorae-haven/')
    })

    test('handles multiple consecutive slashes gracefully', () => {
      const pathname = '/aurorae-haven//schedule'
      const parts = pathname.split('/')

      // split will create empty strings for consecutive slashes
      expect(parts).toEqual(['', 'aurorae-haven', '', 'schedule'])

      const basePath =
        'https://example.github.io' +
        pathname.split('/').slice(0, -1).join('/') +
        '/'

      expect(basePath).toBe('https://example.github.io/aurorae-haven//')
    })
  })

  describe('sessionStorage Behavior', () => {
    test('sessionStorage persists within same session', () => {
      sessionStorage.setItem('redirectPath', '/aurorae-haven/schedule')
      expect(sessionStorage.getItem('redirectPath')).toBe(
        '/aurorae-haven/schedule'
      )
    })

    test('sessionStorage can be cleared', () => {
      sessionStorage.setItem('redirectPath', '/aurorae-haven/schedule')
      sessionStorage.removeItem('redirectPath')
      expect(sessionStorage.getItem('redirectPath')).toBeNull()
    })

    test('sessionStorage returns null for non-existent keys', () => {
      expect(sessionStorage.getItem('nonExistentKey')).toBeNull()
    })
  })

  describe('React Router Integration', () => {
    test('removes basename from redirectPath correctly', () => {
      const redirectPath = '/aurorae-haven/schedule'
      const basename = '/aurorae-haven/'

      // Simulate the logic in RedirectHandler
      const path = redirectPath.replace(basename, '/').replace(/^\/+/, '/')

      expect(path).toBe('/schedule')
    })

    test('handles redirectPath without trailing slash', () => {
      const redirectPath = '/aurorae-haven/tasks'
      const basename = '/aurorae-haven/'

      const path = redirectPath.replace(basename, '/').replace(/^\/+/, '/')

      expect(path).toBe('/tasks')
    })

    test('handles redirectPath with query params', () => {
      const redirectPath = '/aurorae-haven/tasks?filter=urgent'
      const basename = '/aurorae-haven/'

      const path = redirectPath.replace(basename, '/').replace(/^\/+/, '/')

      expect(path).toBe('/tasks?filter=urgent')
    })

    test('handles redirectPath with hash', () => {
      const redirectPath = '/aurorae-haven/braindump#notes'
      const basename = '/aurorae-haven/'

      const path = redirectPath.replace(basename, '/').replace(/^\/+/, '/')

      expect(path).toBe('/braindump#notes')
    })

    test('handles redirectPath with both query and hash', () => {
      const redirectPath = '/aurorae-haven/tasks?filter=urgent#list'
      const basename = '/aurorae-haven/'

      const path = redirectPath.replace(basename, '/').replace(/^\/+/, '/')

      expect(path).toBe('/tasks?filter=urgent#list')
    })

    test('handles root path correctly', () => {
      const redirectPath = '/aurorae-haven/'
      const basename = '/aurorae-haven/'

      const path = redirectPath.replace(basename, '/').replace(/^\/+/, '/')

      expect(path).toBe('/')
    })

    test('normalizes multiple leading slashes', () => {
      const redirectPath = '/aurorae-haven/schedule'
      const basename = '/aurorae-haven/'

      // If replace creates multiple slashes, they should be normalized
      const pathWithSlashes = redirectPath.replace(basename, '////')
      const normalized = pathWithSlashes.replace(/^\/+/, '/')

      expect(normalized).toBe('/schedule')
    })
  })
})
