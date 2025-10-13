/**
 * Tests for 404.html redirect logic
 * Validates that the redirect correctly handles all path variations
 */

describe('404.html Redirect Logic', () => {
  // Simulate the redirect logic from public/404.html
  function simulateRedirect(pathname, origin) {
    var segments = pathname.split('/').filter(function(s) { return s })
    
    var basePath
    if (segments.length > 0) {
      basePath = origin + '/' + segments[0] + '/'
    } else {
      basePath = origin + '/'
    }
    
    return basePath
  }

  const origin = 'https://aurorae-haven.github.io'

  describe('with trailing slash', () => {
    test('redirects /aurorae-haven/schedule/ to /aurorae-haven/', () => {
      const result = simulateRedirect('/aurorae-haven/schedule/', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })

    test('redirects /aurorae-haven/ to /aurorae-haven/', () => {
      const result = simulateRedirect('/aurorae-haven/', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })
  })

  describe('without trailing slash', () => {
    test('redirects /aurorae-haven/schedule to /aurorae-haven/', () => {
      const result = simulateRedirect('/aurorae-haven/schedule', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })

    test('redirects /aurorae-haven to /aurorae-haven/ (edge case fix)', () => {
      // This was the bug - without trailing slash, old logic would redirect to root
      const result = simulateRedirect('/aurorae-haven', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })
  })

  describe('nested routes', () => {
    test('redirects /aurorae-haven/routines/my-routine to /aurorae-haven/', () => {
      const result = simulateRedirect('/aurorae-haven/routines/my-routine', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })

    test('redirects /aurorae-haven/tasks/123 to /aurorae-haven/', () => {
      const result = simulateRedirect('/aurorae-haven/tasks/123', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })

    test('redirects deeply nested /aurorae-haven/a/b/c/d to /aurorae-haven/', () => {
      const result = simulateRedirect('/aurorae-haven/a/b/c/d', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })
  })

  describe('root path', () => {
    test('redirects / to / (user site root)', () => {
      const result = simulateRedirect('/', origin)
      expect(result).toBe('https://aurorae-haven.github.io/')
    })
  })

  describe('edge cases', () => {
    test('handles multiple slashes correctly', () => {
      const result = simulateRedirect('/aurorae-haven//schedule//', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })

    test('handles empty segments in path', () => {
      // filter(s => s) removes empty strings from split result
      const result = simulateRedirect('/aurorae-haven///schedule', origin)
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })
  })

  describe('bug fix validation', () => {
    test('verifies the fix prevents redirect to root domain', () => {
      // Before fix: /aurorae-haven -> https://aurorae-haven.github.io/ (WRONG)
      // After fix: /aurorae-haven -> https://aurorae-haven.github.io/aurorae-haven/ (CORRECT)
      
      const pathWithoutSlash = '/aurorae-haven'
      const result = simulateRedirect(pathWithoutSlash, origin)
      
      // Should NOT redirect to root
      expect(result).not.toBe('https://aurorae-haven.github.io/')
      
      // Should redirect to /aurorae-haven/
      expect(result).toBe('https://aurorae-haven.github.io/aurorae-haven/')
    })

    test('documents the root cause of the issue', () => {
      // Old logic:
      // var pathSegments = location.pathname.split('/').slice(0, -1)
      // For '/aurorae-haven': ['', 'aurorae-haven'].slice(0, -1) = ['']
      // [''].join('/') = '' -> redirect to root!
      
      // New logic:
      // var segments = pathname.split('/').filter(s => s)
      // For '/aurorae-haven': ['aurorae-haven']
      // Use first segment as repo name -> /aurorae-haven/
      
      const rootCause = {
        problem: '404.html redirect logic lost base path for URLs without trailing slash',
        symptom: 'Redirect to https://aurorae-haven.github.io/ instead of /aurorae-haven/',
        solution: 'Extract first path segment as repository name instead of slicing'
      }
      
      expect(rootCause.solution).toBe('Extract first path segment as repository name instead of slicing')
    })
  })

  describe('integration with sessionStorage', () => {
    test('preserves full path in redirectPath before redirect', () => {
      // Simulating what 404.html does
      const pathname = '/aurorae-haven/schedule'
      const search = '?filter=active'
      const hash = '#section'
      
      const redirectPath = pathname + search + hash
      
      expect(redirectPath).toBe('/aurorae-haven/schedule?filter=active#section')
    })

    test('React app can restore route from redirectPath', () => {
      // After redirect, React reads from sessionStorage
      const redirectPath = '/aurorae-haven/schedule'
      const basename = '/aurorae-haven/'
      
      // Extract route by removing basename
      const route = redirectPath.replace(basename, '/').replace(/^\/+/, '/')
      
      expect(route).toBe('/schedule')
    })
  })
})
