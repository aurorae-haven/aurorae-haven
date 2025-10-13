/**
 * Tests for routing helper utilities
 */

import { normalizeBaseUrl } from '../utils/routingHelpers'

describe('normalizeBaseUrl', () => {
  test('converts relative path "./" to "/"', () => {
    expect(normalizeBaseUrl('./')).toBe('/')
  })

  test('preserves absolute paths unchanged', () => {
    expect(normalizeBaseUrl('/aurorae-haven/')).toBe('/aurorae-haven/')
    expect(normalizeBaseUrl('/app/')).toBe('/app/')
    expect(normalizeBaseUrl('/')).toBe('/')
  })

  test('handles empty string by returning "/"', () => {
    expect(normalizeBaseUrl('')).toBe('/')
  })

  test('handles null or undefined by returning "/"', () => {
    expect(normalizeBaseUrl(null)).toBe('/')
    expect(normalizeBaseUrl(undefined)).toBe('/')
  })

  test('preserves paths without trailing slash', () => {
    expect(normalizeBaseUrl('/aurorae-haven')).toBe('/aurorae-haven')
  })
})
