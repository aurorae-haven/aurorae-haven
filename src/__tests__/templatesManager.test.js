import {
  getAllTemplates,
  getTemplate,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  markTemplateUsed,
  filterTemplates,
  sortTemplates,
  exportTemplates,
  importTemplates
} from '../utils/templatesManager'
import * as indexedDBManager from '../utils/indexedDBManager'
import * as uuidGenerator from '../utils/uuidGenerator'

// Mock dependencies
jest.mock('../utils/indexedDBManager')
jest.mock('../utils/uuidGenerator')

describe('templatesManager', () => {
  let mockDB

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock database with proper transaction structure
    const mockStore = {
      getAll: jest.fn().mockReturnValue(Promise.resolve([])),
      get: jest.fn().mockReturnValue(Promise.resolve(null)),
      put: jest.fn().mockReturnValue(Promise.resolve()),
      delete: jest.fn().mockReturnValue(Promise.resolve())
    }

    const mockTransaction = {
      objectStore: jest.fn().mockReturnValue(mockStore),
      done: Promise.resolve()
    }

    mockDB = {
      transaction: jest.fn().mockReturnValue(mockTransaction),
      mockStore,
      mockTransaction
    }

    indexedDBManager.isIndexedDBAvailable.mockReturnValue(true)
    indexedDBManager.openDB.mockResolvedValue(mockDB)
    uuidGenerator.generateSecureUUID.mockReturnValue('test-uuid-123')
  })

  describe('getAllTemplates', () => {
    test('returns empty array when no templates exist', async () => {
      const result = await getAllTemplates()
      expect(result).toEqual([])
    })

    test('returns array of templates', async () => {
      const mockTemplates = [{ id: '1', type: 'task', title: 'Test' }]
      mockDB.mockStore.getAll.mockReturnValue(Promise.resolve(mockTemplates))

      const result = await getAllTemplates()
      expect(result).toEqual(mockTemplates)
    })

    test('returns empty array when IndexedDB is not available', async () => {
      indexedDBManager.isIndexedDBAvailable.mockReturnValue(false)

      const result = await getAllTemplates()
      expect(result).toEqual([])
    })
  })

  describe('saveTemplate', () => {
    test('saves a new task template', async () => {
      const template = {
        type: 'task',
        title: 'Test Task',
        tags: ['work'],
        category: 'Development',
        quadrant: 'urgent_important'
      }

      const result = await saveTemplate(template)

      expect(result).toBe('test-uuid-123')
      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readwrite')
    })

    test('saves a new routine template', async () => {
      const template = {
        type: 'routine',
        title: 'Morning Routine',
        tags: ['health'],
        steps: [
          { label: 'Wake up', duration: 60 },
          { label: 'Shower', duration: 300 }
        ],
        energyTag: 'high',
        estimatedDuration: 360
      }

      const result = await saveTemplate(template)

      expect(result).toBe('test-uuid-123')
    })

    test('throws error when IndexedDB is not available', async () => {
      indexedDBManager.isIndexedDBAvailable.mockReturnValue(false)

      const template = { type: 'task', title: 'Test' }

      await expect(saveTemplate(template)).rejects.toThrow(
        'IndexedDB not available'
      )
    })

    test('throws error when template type is missing', async () => {
      const template = { title: 'Test Task' }

      await expect(saveTemplate(template)).rejects.toThrow(
        'Invalid template data: Template type is required'
      )
    })

    test('throws error when template type is invalid', async () => {
      const template = { type: 'invalid', title: 'Test Task' }

      try {
        await saveTemplate(template)
        // If no error is thrown, fail the test
        throw new Error('Expected saveTemplate to throw')
      } catch (err) {
        expect(err.message).toContain('Invalid template data')
        expect(err.message).toContain('task, routine')
      }
    })

    test('throws error when title is missing', async () => {
      const template = { type: 'task' }

      await expect(saveTemplate(template)).rejects.toThrow(
        'Invalid template data: Template title is required'
      )
    })

    test('throws error when title is empty', async () => {
      const template = { type: 'task', title: '' }

      await expect(saveTemplate(template)).rejects.toThrow(
        'Invalid template data: Template title cannot be empty'
      )
    })

    test('throws error when title is not a string', async () => {
      const template = { type: 'task', title: 123 }

      await expect(saveTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
      await expect(saveTemplate(template)).rejects.toThrow('must be a string')
    })

    test('throws error when routine steps is not an array', async () => {
      const template = {
        type: 'routine',
        title: 'Test Routine',
        steps: 'not an array'
      }

      await expect(saveTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
      await expect(saveTemplate(template)).rejects.toThrow('must be an array')
    })

    test('throws error when routine step is invalid', async () => {
      const template = {
        type: 'routine',
        title: 'Test Routine',
        steps: [{ duration: 60 }]
      }

      await expect(saveTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
      await expect(saveTemplate(template)).rejects.toThrow('must have a label')
    })
  })

  describe('updateTemplate', () => {
    test('updates an existing template', async () => {
      const existingTemplate = {
        id: 'test-id',
        type: 'task',
        title: 'Old Title'
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(existingTemplate))

      await updateTemplate('test-id', { title: 'New Title' })

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readwrite')
    })

    test('throws error when template not found', async () => {
      mockDB.mockStore.get.mockReturnValue(Promise.resolve(null))

      await expect(updateTemplate('non-existent', {})).rejects.toThrow(
        'Template not found'
      )
    })

    test('throws error when update results in invalid template', async () => {
      const existingTemplate = {
        id: 'test-id',
        type: 'task',
        title: 'Old Title'
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(existingTemplate))

      await expect(updateTemplate('test-id', { title: '' })).rejects.toThrow(
        'Invalid template data'
      )
      await expect(updateTemplate('test-id', { title: '' })).rejects.toThrow(
        'title cannot be empty'
      )
    })

    test('throws error when updating to invalid type', async () => {
      const existingTemplate = {
        id: 'test-id',
        type: 'task',
        title: 'Test Title'
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(existingTemplate))

      await expect(
        updateTemplate('test-id', { type: 'invalid' })
      ).rejects.toThrow('Invalid template data')
    })
  })

  describe('deleteTemplate', () => {
    test('deletes a template by ID', async () => {
      await deleteTemplate('test-id')

      expect(mockDB.transaction).toHaveBeenCalledWith('templates', 'readwrite')
    })
  })

  describe('duplicateTemplate', () => {
    test('creates a copy of an existing template', async () => {
      const originalTemplate = {
        id: 'original-id',
        type: 'task',
        title: 'Original Template',
        tags: ['work']
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(originalTemplate))

      const newId = await duplicateTemplate('original-id')

      expect(newId).toBe('test-uuid-123')
      expect(mockDB.transaction).toHaveBeenCalled()
    })

    test('throws error when template not found', async () => {
      mockDB.mockStore.get.mockReturnValue(Promise.resolve(null))

      await expect(duplicateTemplate('non-existent')).rejects.toThrow(
        'Template not found'
      )
    })
  })

  describe('markTemplateUsed', () => {
    test('updates lastUsed timestamp', async () => {
      const existingTemplate = {
        id: 'test-id',
        type: 'task',
        title: 'Test'
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(existingTemplate))

      await markTemplateUsed('test-id')

      expect(mockDB.transaction).toHaveBeenCalled()
    })
  })

  describe('filterTemplates', () => {
    const mockTemplates = [
      {
        id: '1',
        type: 'task',
        title: 'Work Task',
        tags: ['work', 'urgent']
      },
      {
        id: '2',
        type: 'routine',
        title: 'Morning Routine',
        tags: ['health'],
        estimatedDuration: 600
      },
      {
        id: '3',
        type: 'task',
        title: 'Personal Task',
        tags: ['personal']
      }
    ]

    test('filters by type', () => {
      const result = filterTemplates(mockTemplates, { type: 'task' })
      expect(result).toHaveLength(2)
      expect(result.every((t) => t.type === 'task')).toBe(true)
    })

    test('filters by tags', () => {
      const result = filterTemplates(mockTemplates, { tags: ['work'] })
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Work Task')
    })

    test('filters by duration range', () => {
      const result = filterTemplates(mockTemplates, {
        durationMin: 500,
        durationMax: 700,
        type: 'routine' // Filter by routine type as well
      })
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Morning Routine')
    })

    test('filters by search query', () => {
      const result = filterTemplates(mockTemplates, { query: 'routine' })
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Morning Routine')
    })

    test('returns all templates when no filters applied', () => {
      const result = filterTemplates(mockTemplates, {})
      expect(result).toHaveLength(3)
    })
  })

  describe('sortTemplates', () => {
    const mockTemplates = [
      {
        id: '1',
        title: 'B Task',
        lastUsed: '2024-01-01T00:00:00Z',
        estimatedDuration: 300,
        createdAt: '2024-01-03T00:00:00Z'
      },
      {
        id: '2',
        title: 'A Task',
        lastUsed: '2024-01-02T00:00:00Z',
        estimatedDuration: 600,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        title: 'C Task',
        lastUsed: null,
        estimatedDuration: 150,
        createdAt: '2024-01-02T00:00:00Z'
      }
    ]

    test('sorts by title alphabetically', () => {
      const result = sortTemplates(mockTemplates, 'title')
      expect(result[0].title).toBe('A Task')
      expect(result[1].title).toBe('B Task')
      expect(result[2].title).toBe('C Task')
    })

    test('sorts by lastUsed date descending', () => {
      const result = sortTemplates(mockTemplates, 'lastUsed')
      expect(result[0].title).toBe('A Task')
      expect(result[1].title).toBe('B Task')
      expect(result[2].title).toBe('C Task')
    })

    test('sorts by duration ascending', () => {
      const result = sortTemplates(mockTemplates, 'duration')
      expect(result[0].estimatedDuration).toBe(150)
      expect(result[1].estimatedDuration).toBe(300)
      expect(result[2].estimatedDuration).toBe(600)
    })

    test('sorts by creation date descending', () => {
      const result = sortTemplates(mockTemplates, 'dateCreated')
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('3')
      expect(result[2].id).toBe('2')
    })

    test('returns original order for unknown sort field', () => {
      const result = sortTemplates(mockTemplates, 'unknown')
      expect(result).toEqual(mockTemplates)
    })
  })

  describe('exportTemplates', () => {
    test('exports all templates', async () => {
      const mockTemplates = [{ id: '1', type: 'task', title: 'Test' }]

      mockDB.mockStore.getAll.mockReturnValue(Promise.resolve(mockTemplates))

      const result = await exportTemplates()

      expect(result).toHaveProperty('version', '1.0')
      expect(result).toHaveProperty('exportDate')
      expect(result).toHaveProperty('templates')
      expect(result.templates).toEqual(mockTemplates)
    })

    test('exports specific templates by ID', async () => {
      const mockTemplates = [
        { id: '1', type: 'task', title: 'Test 1' },
        { id: '2', type: 'task', title: 'Test 2' }
      ]

      mockDB.mockStore.getAll.mockReturnValue(Promise.resolve(mockTemplates))

      const result = await exportTemplates(['1'])

      expect(result.templates).toHaveLength(1)
      expect(result.templates[0].id).toBe('1')
    })
  })

  describe('importTemplates', () => {
    test('imports valid templates', async () => {
      const importData = {
        version: '1.0',
        templates: [{ id: 'import-1', type: 'task', title: 'Imported Task' }]
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(null))

      const result = await importTemplates(importData)

      expect(result.imported).toBe(1)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
    })

    test('handles ID collisions by generating new IDs', async () => {
      const importData = {
        version: '1.0',
        templates: [{ id: 'existing-id', type: 'task', title: 'Imported Task' }]
      }

      mockDB.mockStore.get.mockReturnValue(
        Promise.resolve({ id: 'existing-id', title: 'Existing' })
      )

      const result = await importTemplates(importData)

      expect(result.imported).toBe(1)
      expect(uuidGenerator.generateSecureUUID).toHaveBeenCalled()
    })

    test('throws error for missing version field', async () => {
      const invalidData = { templates: [] }

      await expect(importTemplates(invalidData)).rejects.toThrow(
        'Invalid import data: missing version field'
      )
    })

    test('throws error for incompatible version', async () => {
      const invalidData = {
        version: '2.0',
        templates: []
      }

      await expect(importTemplates(invalidData)).rejects.toThrow(
        'Incompatible version: 2.0'
      )
    })

    test('throws error for null data', async () => {
      await expect(importTemplates(null)).rejects.toThrow(
        'Invalid import data: data must be an object'
      )
    })

    test('throws error for non-object data', async () => {
      await expect(importTemplates('string')).rejects.toThrow(
        'Invalid import data: data must be an object'
      )
    })

    test('throws error for invalid import data without templates', async () => {
      const invalidData = { version: '1.0' }

      await expect(importTemplates(invalidData)).rejects.toThrow(
        'Invalid import data: missing templates array'
      )
    })

    test('throws error when templates is not an array', async () => {
      const invalidData = {
        version: '1.0',
        templates: 'not an array'
      }

      await expect(importTemplates(invalidData)).rejects.toThrow(
        'Invalid import data: missing templates array'
      )
    })

    test('skips templates with invalid structure', async () => {
      const importData = {
        version: '1.0',
        templates: [
          { id: '1', type: 'task', title: 'Valid Task' },
          { id: '2', type: 'invalid-type', title: 'Invalid Task' }
        ]
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(null))

      const result = await importTemplates(importData)

      expect(result.imported).toBe(1)
      expect(result.skipped).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toContain('task, routine')
    })

    test('skips templates with missing required fields', async () => {
      const importData = {
        version: '1.0',
        templates: [
          { id: '1', type: 'task', title: 'Valid Task' },
          { id: '2', type: 'task' } // Missing title
        ]
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(null))

      const result = await importTemplates(importData)

      expect(result.imported).toBe(1)
      expect(result.skipped).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toContain('title is required')
    })

    test('handles errors during import gracefully', async () => {
      const importData = {
        version: '1.0',
        templates: [
          { id: '1', type: 'task', title: 'Task 1' },
          { id: '2', type: 'task', title: 'Task 2' }
        ]
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(null))
      mockDB.mockStore.put
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('Save failed'))

      const result = await importTemplates(importData)

      expect(result.imported).toBe(1)
      expect(result.skipped).toBe(1)
      expect(result.errors).toHaveLength(1)
    })

    test('validates template structure before importing', async () => {
      const importData = {
        version: '1.0',
        templates: [
          {
            id: '1',
            type: 'routine',
            title: 'Invalid Routine',
            steps: 'not an array'
          }
        ]
      }

      mockDB.mockStore.get.mockReturnValue(Promise.resolve(null))

      const result = await importTemplates(importData)

      expect(result.imported).toBe(0)
      expect(result.skipped).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toContain('must be an array')
    })
  })
})
