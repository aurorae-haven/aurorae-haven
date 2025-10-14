/**
 * Tests for centralized ID generation utilities
 */

import {
  generateTimestampId,
  generateUniqueId,
  generateRoutineId,
  generateStepId,
  generateHabitId,
  generateScheduleId,
  generateTemplateId,
  generateNoteId,
  shouldRegenerateId,
  ensureId
} from '../utils/idGenerator'

describe('idGenerator', () => {
  describe('generateTimestampId', () => {
    test('generates numeric timestamp without prefix', () => {
      const id = generateTimestampId()
      expect(typeof id).toBe('number')
      expect(id).toBeGreaterThan(0)
    })

    test('generates prefixed timestamp string', () => {
      const id = generateTimestampId('test')
      expect(typeof id).toBe('string')
      expect(id).toMatch(/^test_\d+$/)
    })

    test('generates unique IDs on subsequent calls', async () => {
      const id1 = generateTimestampId('item')
      await new Promise((resolve) => setTimeout(resolve, 5))
      const id2 = generateTimestampId('item')
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateUniqueId', () => {
    test('generates UUID without prefix', () => {
      const id = generateUniqueId()
      expect(typeof id).toBe('string')
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
    })

    test('generates prefixed UUID', () => {
      const id = generateUniqueId('entity')
      expect(typeof id).toBe('string')
      expect(id).toMatch(
        /^entity_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
    })

    test('generates unique UUIDs', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('specific ID generators', () => {
    test('generateRoutineId returns routine_ prefixed ID', () => {
      const id = generateRoutineId()
      expect(id).toMatch(/^routine_\d+$/)
    })

    test('generateStepId returns step_ prefixed ID', () => {
      const id = generateStepId()
      expect(id).toMatch(/^step_\d+$/)
    })

    test('generateHabitId returns numeric timestamp', () => {
      const id = generateHabitId()
      expect(typeof id).toBe('number')
      expect(id).toBeGreaterThan(0)
    })

    test('generateScheduleId returns numeric timestamp', () => {
      const id = generateScheduleId()
      expect(typeof id).toBe('number')
      expect(id).toBeGreaterThan(0)
    })

    test('generateTemplateId returns UUID', () => {
      const id = generateTemplateId()
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
    })

    test('generateNoteId returns UUID', () => {
      const id = generateNoteId()
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
    })
  })

  describe('shouldRegenerateId', () => {
    test('returns true for missing IDs', () => {
      expect(shouldRegenerateId(null)).toBe(true)
      expect(shouldRegenerateId(undefined)).toBe(true)
      expect(shouldRegenerateId('')).toBe(true)
    })

    test('returns false for valid IDs', () => {
      expect(shouldRegenerateId('valid-id')).toBe(false)
      expect(shouldRegenerateId(123)).toBe(false)
      expect(shouldRegenerateId('0')).toBe(false)
    })
  })

  describe('ensureId', () => {
    test('preserves existing valid ID', () => {
      const entity = { id: 'existing-id', name: 'Test' }
      const result = ensureId(entity)
      expect(result.id).toBe('existing-id')
      expect(result.name).toBe('Test')
    })

    test('generates ID when missing', () => {
      const entity = { name: 'Test' }
      const result = ensureId(entity)
      expect(result.id).toBeDefined()
      expect(result.name).toBe('Test')
    })

    test('uses custom ID generator', () => {
      const entity = { name: 'Test' }
      const customGenerator = () => 'custom-id'
      const result = ensureId(entity, customGenerator)
      expect(result.id).toBe('custom-id')
    })

    test('regenerates null ID', () => {
      const entity = { id: null, name: 'Test' }
      const result = ensureId(entity)
      expect(result.id).not.toBeNull()
      expect(result.id).toBeDefined()
    })
  })
})
