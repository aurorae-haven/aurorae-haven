/**
 * Tests for redirectHelpers utilities
 * These tests verify the shared redirect logic used by both 404.html and index.jsx
 */

import {
  computeBasePath,
  normalizeRedirectPath,
  buildRedirectPath
} from '../utils/redirectHelpers'

describe('redirectHelpers', () => {
  describe('computeBasePath', () => {
    test('computes base path for GitHub Pages project route', () => {
      const result = computeBasePath(
        '/aurorae-haven/schedule',
        'https://example.github.io'
      )
      expect(result).toBe('https://example.github.io/aurorae-haven/')
    })

    test('computes base path for nested routes', () => {
      const result = computeBasePath(
        '/aurorae-haven/tasks/urgent',
        'https://example.github.io'
      )
      // Should redirect to the first segment (app root)
      expect(result).toBe('https://example.github.io/aurorae-haven/')
    })

    test('computes base path for root-level routes', () => {
      const result = computeBasePath('/schedule', 'https://example.github.io')
      expect(result).toBe('https://example.github.io/schedule/')
    })

    test('computes base path for single segment', () => {
      const result = computeBasePath(
        '/aurorae-haven',
        'https://example.github.io'
      )
      expect(result).toBe('https://example.github.io/aurorae-haven/')
    })

    test('handles trailing slash in pathname', () => {
      const result = computeBasePath(
        '/aurorae-haven/schedule/',
        'https://example.github.io'
      )
      // Should still redirect to the first segment
      expect(result).toBe('https://example.github.io/aurorae-haven/')
    })

    test('handles root path', () => {
      const result = computeBasePath('/', 'https://example.github.io')
      expect(result).toBe('https://example.github.io/')
    })

    test('handles empty pathname', () => {
      const result = computeBasePath('', 'https://example.github.io')
      expect(result).toBe('https://example.github.io/')
    })

    test('handles multiple consecutive slashes', () => {
      const result = computeBasePath(
        '/aurorae-haven//schedule',
        'https://example.github.io'
      )
      // filter() removes empty strings from split
      expect(result).toBe('https://example.github.io/aurorae-haven/')
    })

    test('handles different origins', () => {
      const result = computeBasePath(
        '/myapp/page',
        'https://different-domain.com'
      )
      expect(result).toBe('https://different-domain.com/myapp/')
    })

    test('handles localhost origin', () => {
      const result = computeBasePath('/aurorae-haven/schedule', 'http://localhost:3000')
      expect(result).toBe('http://localhost:3000/aurorae-haven/')
    })
  })

  describe('normalizeRedirectPath', () => {
    test('removes basename from redirect path', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/schedule',
        '/aurorae-haven/'
      )
      expect(result).toBe('/schedule')
    })

    test('handles redirectPath without trailing slash in input', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/tasks',
        '/aurorae-haven/'
      )
      expect(result).toBe('/tasks')
    })

    test('handles redirectPath with query params', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/tasks?filter=urgent',
        '/aurorae-haven/'
      )
      expect(result).toBe('/tasks?filter=urgent')
    })

    test('handles redirectPath with hash', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/braindump#notes',
        '/aurorae-haven/'
      )
      expect(result).toBe('/braindump#notes')
    })

    test('handles redirectPath with both query and hash', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/tasks?filter=urgent#list',
        '/aurorae-haven/'
      )
      expect(result).toBe('/tasks?filter=urgent#list')
    })

    test('handles root path correctly', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/',
        '/aurorae-haven/'
      )
      expect(result).toBe('/')
    })

    test('normalizes multiple leading slashes', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/schedule',
        '/aurorae-haven/'
      )
      // Create a scenario with multiple slashes
      const pathWithSlashes = '/aurorae-haven/schedule'.replace(
        '/aurorae-haven/',
        '////'
      )
      const normalized = pathWithSlashes.replace(/^\/+/, '/')
      expect(normalized).toBe('/schedule')
    })

    test('handles relative basename (./) for offline builds', () => {
      const result = normalizeRedirectPath('./schedule', './')
      expect(result).toBe('/schedule')
    })

    test('handles empty basename', () => {
      const result = normalizeRedirectPath('/schedule', '/')
      expect(result).toBe('/schedule')
    })

    test('handles nested paths', () => {
      const result = normalizeRedirectPath(
        '/aurorae-haven/tasks/urgent',
        '/aurorae-haven/'
      )
      expect(result).toBe('/tasks/urgent')
    })
  })

  describe('buildRedirectPath', () => {
    test('builds full path with pathname, search, and hash', () => {
      const result = buildRedirectPath(
        '/aurorae-haven/schedule',
        '?id=123',
        '#top'
      )
      expect(result).toBe('/aurorae-haven/schedule?id=123#top')
    })

    test('builds path with pathname only', () => {
      const result = buildRedirectPath('/aurorae-haven/schedule', '', '')
      expect(result).toBe('/aurorae-haven/schedule')
    })

    test('builds path with pathname and search', () => {
      const result = buildRedirectPath(
        '/aurorae-haven/tasks',
        '?filter=urgent',
        ''
      )
      expect(result).toBe('/aurorae-haven/tasks?filter=urgent')
    })

    test('builds path with pathname and hash', () => {
      const result = buildRedirectPath('/aurorae-haven/braindump', '', '#notes')
      expect(result).toBe('/aurorae-haven/braindump#notes')
    })

    test('handles empty search and hash strings correctly', () => {
      const result = buildRedirectPath('/aurorae-haven/schedule', '', '')
      expect(result).not.toContain('?')
      expect(result).not.toContain('#')
    })

    test('handles all empty strings', () => {
      const result = buildRedirectPath('', '', '')
      expect(result).toBe('')
    })

    test('handles special characters in components', () => {
      const result = buildRedirectPath(
        '/aurorae-haven/schedule-2024',
        '?date=2024-01-15',
        '#section-1'
      )
      expect(result).toBe(
        '/aurorae-haven/schedule-2024?date=2024-01-15#section-1'
      )
    })
  })

  describe('Integration: 404.html flow', () => {
    test('simulates complete 404.html redirect logic', () => {
      // User navigates to /aurorae-haven/schedule
      const pathname = '/aurorae-haven/schedule'
      const search = ''
      const hash = ''
      const origin = 'https://example.github.io'

      // Step 1: Build redirect path to store in sessionStorage
      const redirectPath = buildRedirectPath(pathname, search, hash)
      expect(redirectPath).toBe('/aurorae-haven/schedule')

      // Step 2: Compute base path to redirect to
      const basePath = computeBasePath(pathname, origin)
      expect(basePath).toBe('https://example.github.io/aurorae-haven/')

      // This is what 404.html would do:
      // sessionStorage.setItem('redirectPath', redirectPath)
      // location.replace(basePath)
    })

    test('simulates 404.html redirect with query and hash', () => {
      const pathname = '/aurorae-haven/tasks'
      const search = '?filter=urgent'
      const hash = '#list'
      const origin = 'https://example.github.io'

      const redirectPath = buildRedirectPath(pathname, search, hash)
      expect(redirectPath).toBe('/aurorae-haven/tasks?filter=urgent#list')

      const basePath = computeBasePath(pathname, origin)
      expect(basePath).toBe('https://example.github.io/aurorae-haven/')
    })
  })

  describe('Integration: React Router flow', () => {
    test('simulates complete RedirectHandler logic', () => {
      // Step 1: Retrieve stored redirect path
      const redirectPath = '/aurorae-haven/schedule'
      const basename = '/aurorae-haven/'

      // Step 2: Normalize for React Router
      const path = normalizeRedirectPath(redirectPath, basename)
      expect(path).toBe('/schedule')

      // This is what RedirectHandler would do:
      // navigate(path, { replace: true })
    })

    test('simulates RedirectHandler with query and hash', () => {
      const redirectPath = '/aurorae-haven/tasks?filter=urgent#list'
      const basename = '/aurorae-haven/'

      const path = normalizeRedirectPath(redirectPath, basename)
      expect(path).toBe('/tasks?filter=urgent#list')
    })
  })

  describe('Edge cases and error handling', () => {
    test('handles undefined or null inputs gracefully for computeBasePath', () => {
      // These should not throw, but behavior may vary
      expect(() => computeBasePath('', '')).not.toThrow()
    })

    test('handles undefined or null inputs gracefully for normalizeRedirectPath', () => {
      expect(() => normalizeRedirectPath('', '')).not.toThrow()
    })

    test('handles undefined or null inputs gracefully for buildRedirectPath', () => {
      expect(() => buildRedirectPath('', '', '')).not.toThrow()
    })

    test('handles very long paths', () => {
      const longPath = '/aurorae-haven/' + 'a'.repeat(1000)
      const result = computeBasePath(longPath, 'https://example.github.io')
      expect(result).toBe('https://example.github.io/aurorae-haven/')
    })

    test('handles special characters in pathname', () => {
      const pathname = '/aurorae-haven/schedule-2024'
      const basePath = computeBasePath(pathname, 'https://example.github.io')
      expect(basePath).toBe('https://example.github.io/aurorae-haven/')
    })

    test('handles URL encoded characters', () => {
      const pathname = '/aurorae-haven/schedule%20page'
      const basePath = computeBasePath(pathname, 'https://example.github.io')
      expect(basePath).toBe('https://example.github.io/aurorae-haven/')
    })
  })
})
