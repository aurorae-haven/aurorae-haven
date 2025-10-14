/**
 * Tests for build directory constants
 * Ensures constants are properly defined and exported
 */

import {
  DIST_DIR,
  DIST_OFFLINE_DIR,
  OUTPUT_DIR
} from '../../scripts/buildConstants.js'

describe('Build Constants', () => {
  test('DIST_DIR is defined and has correct value', () => {
    expect(DIST_DIR).toBeDefined()
    expect(typeof DIST_DIR).toBe('string')
    expect(DIST_DIR).toBe('dist')
  })

  test('DIST_OFFLINE_DIR is defined and has correct value', () => {
    expect(DIST_OFFLINE_DIR).toBeDefined()
    expect(typeof DIST_OFFLINE_DIR).toBe('string')
    expect(DIST_OFFLINE_DIR).toBe('dist-offline-build')
  })

  test('OUTPUT_DIR is defined and has correct value', () => {
    expect(OUTPUT_DIR).toBeDefined()
    expect(typeof OUTPUT_DIR).toBe('string')
    expect(OUTPUT_DIR).toBe('dist-offline')
  })

  test('all constants are strings', () => {
    expect(typeof DIST_DIR).toBe('string')
    expect(typeof DIST_OFFLINE_DIR).toBe('string')
    expect(typeof OUTPUT_DIR).toBe('string')
  })

  test('constants are not empty strings', () => {
    expect(DIST_DIR.length).toBeGreaterThan(0)
    expect(DIST_OFFLINE_DIR.length).toBeGreaterThan(0)
    expect(OUTPUT_DIR.length).toBeGreaterThan(0)
  })

  test('constants have different values', () => {
    expect(DIST_DIR).not.toBe(DIST_OFFLINE_DIR)
    expect(DIST_DIR).not.toBe(OUTPUT_DIR)
    expect(DIST_OFFLINE_DIR).not.toBe(OUTPUT_DIR)
  })
})
