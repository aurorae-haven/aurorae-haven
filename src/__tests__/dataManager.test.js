// Tests for data import/export functionality
import { getDataTemplate, exportJSON, importJSON } from '../utils/dataManager'

describe('Data Manager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getDataTemplate', () => {
    it('should return a valid data structure with empty Brain Dump data', async () => {
      const data = await getDataTemplate()

      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('exportedAt')
      expect(data).toHaveProperty('brainDump')
      expect(data.brainDump).toHaveProperty('content')
      expect(data.brainDump).toHaveProperty('tags')
      expect(data.brainDump).toHaveProperty('versions')
      expect(data.brainDump).toHaveProperty('entries')
      expect(Array.isArray(data.tasks)).toBe(true)
      expect(Array.isArray(data.sequences)).toBe(true)
      expect(Array.isArray(data.habits)).toBe(true)
      expect(Array.isArray(data.dumps)).toBe(true)
      expect(Array.isArray(data.schedule)).toBe(true)
    })

    it('should collect Brain Dump content from localStorage', async () => {
      const testContent = '# My Brain Dump\n\nSome notes here'
      localStorage.setItem('brainDumpContent', testContent)

      const data = await getDataTemplate()

      expect(data.brainDump.content).toBe(testContent)
    })

    it('should collect Brain Dump tags from localStorage', async () => {
      const testTags =
        '<span class="tag">#idea</span><span class="tag">#task</span>'
      localStorage.setItem('brainDumpTags', testTags)

      const data = await getDataTemplate()

      expect(data.brainDump.tags).toBe(testTags)
    })

    it('should collect Brain Dump version history from localStorage', async () => {
      const versions = [
        { id: 1, content: 'Version 1', timestamp: '2025-01-01T00:00:00Z' },
        { id: 2, content: 'Version 2', timestamp: '2025-01-02T00:00:00Z' }
      ]
      localStorage.setItem('brainDumpVersions', JSON.stringify(versions))

      const data = await getDataTemplate()

      expect(data.brainDump.versions).toEqual(versions)
    })

    it('should collect Brain Dump entries from localStorage', async () => {
      const entries = [
        {
          id: 'entry_1',
          content: 'Entry 1',
          timestamp: '2025-01-01T00:00:00Z'
        },
        { id: 'entry_2', content: 'Entry 2', timestamp: '2025-01-02T00:00:00Z' }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(entries))

      const data = await getDataTemplate()

      expect(data.brainDump.entries).toEqual(entries)
    })

    it('should handle invalid JSON in localStorage gracefully', async () => {
      localStorage.setItem('brainDumpVersions', 'invalid json{')
      localStorage.setItem('brainDumpEntries', 'also invalid')

      const data = await getDataTemplate()

      expect(Array.isArray(data.brainDump.versions)).toBe(true)
      expect(data.brainDump.versions).toHaveLength(0)
      expect(Array.isArray(data.brainDump.entries)).toBe(true)
      expect(data.brainDump.entries).toHaveLength(0)
    })

    it('should collect schedule data from localStorage', async () => {
      const schedule = [
        { day: '2025-01-15', blocks: [{ type: 'task', start: '09:00' }] }
      ]
      localStorage.setItem('sj.schedule.events', JSON.stringify(schedule))

      const data = await getDataTemplate()

      expect(data.schedule).toEqual(schedule)
    })
  })

  describe('exportJSON', () => {
    it('should create a blob and trigger download', async () => {
      const mockAppendChild = jest.fn()
      const mockRemove = jest.fn()
      const mockClick = jest.fn()

      document.body.appendChild = mockAppendChild
      global.document.createElement = jest.fn((tag) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
            remove: mockRemove,
            appendChild: jest.fn(),
            style: {}
          }
        }
        return {}
      })

      const result = await exportJSON()

      expect(result).toBe(true)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemove).toHaveBeenCalled()
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('importJSON', () => {
    it('should import valid JSON data', async () => {
      const testData = {
        version: 1,
        tasks: [],
        sequences: [],
        habits: [],
        dumps: [],
        schedule: [],
        brainDump: {
          content: '# Test Content',
          tags: '<span class="tag">#test</span>',
          versions: [],
          entries: []
        }
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(true)
      expect(localStorage.getItem('brainDumpContent')).toBe('# Test Content')
      expect(localStorage.getItem('brainDumpTags')).toBe(
        '<span class="tag">#test</span>'
      )
    })

    it('should import Brain Dump version history', async () => {
      const versions = [
        { id: 1, content: 'Version 1', timestamp: '2025-01-01T00:00:00Z' }
      ]
      const testData = {
        version: 1,
        tasks: [],
        sequences: [],
        brainDump: {
          content: '',
          tags: '',
          versions: versions,
          entries: []
        }
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      await importJSON(mockFile)

      const storedVersions = JSON.parse(
        localStorage.getItem('brainDumpVersions')
      )
      expect(storedVersions).toEqual(versions)
    })

    it('should import Brain Dump entries', async () => {
      const entries = [
        { id: 'entry_1', content: 'Entry 1', timestamp: '2025-01-01T00:00:00Z' }
      ]
      const testData = {
        version: 1,
        tasks: [],
        sequences: [],
        brainDump: {
          content: '',
          tags: '',
          versions: [],
          entries: entries
        }
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      await importJSON(mockFile)

      const storedEntries = JSON.parse(localStorage.getItem('brainDumpEntries'))
      expect(storedEntries).toEqual(entries)
    })

    it('should handle missing version field', async () => {
      const testData = {
        tasks: [],
        sequences: []
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Missing required field: version')
    })

    it('should use default empty arrays for missing fields', async () => {
      const testData = {
        version: 1
        // Missing tasks, sequences, etc.
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(true)
      const storedData = JSON.parse(localStorage.getItem('aurorae_haven_data'))
      expect(Array.isArray(storedData.tasks)).toBe(true)
      expect(Array.isArray(storedData.sequences)).toBe(true)
      expect(storedData.tasks).toHaveLength(0)
    })

    it('should handle invalid JSON', async () => {
      const mockFile = {
        text: jest.fn().mockResolvedValue('invalid json{')
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Import failed')
    })

    it('should handle missing Brain Dump data gracefully', async () => {
      const testData = {
        version: 1,
        tasks: [],
        sequences: []
        // No brainDump field
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(true)
      // Brain Dump data should remain unchanged
      expect(localStorage.getItem('brainDumpContent')).toBeNull()
    })

    it('should import schedule data to separate key', async () => {
      const schedule = [
        { day: '2025-01-15', blocks: [{ type: 'task', start: '09:00' }] }
      ]
      const testData = {
        version: 1,
        tasks: [],
        sequences: [],
        schedule: schedule
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      await importJSON(mockFile)

      const storedSchedule = JSON.parse(
        localStorage.getItem('sj.schedule.events')
      )
      expect(storedSchedule).toEqual(schedule)
    })

    it('should support round-trip export and import', async () => {
      // Setup initial data
      const initialData = {
        version: 1,
        tasks: [{ id: 1, title: 'Test Task', done: false }],
        sequences: [{ id: 'seq_1', name: 'Morning Routine', steps: [] }],
        habits: [{ id: 'hab_1', name: 'Exercise', streak: 5 }],
        dumps: [{ id: 'dump_1', text: 'Note' }],
        schedule: [
          { day: '2025-01-15', blocks: [{ type: 'task', start: '09:00' }] }
        ],
        brainDump: {
          content: '# Brain Dump Content',
          tags: '<span class="tag">#idea</span>',
          versions: [
            {
              id: 1,
              content: 'Version 1',
              timestamp: '2025-01-01T00:00:00Z'
            }
          ],
          entries: [
            {
              id: 'entry_1',
              content: 'Entry 1',
              timestamp: '2025-01-01T00:00:00Z'
            }
          ]
        }
      }

      // Import initial data
      const mockFile1 = {
        text: jest.fn().mockResolvedValue(JSON.stringify(initialData))
      }
      await importJSON(mockFile1)

      // Export the data
      const exportedData = await getDataTemplate()

      // Re-import the exported data
      const mockFile2 = {
        text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
      }
      const result = await importJSON(mockFile2)

      // Verify import succeeded
      expect(result.success).toBe(true)

      // Verify data integrity
      const reimportedData = await getDataTemplate()
      expect(reimportedData.tasks).toEqual(initialData.tasks)
      expect(reimportedData.sequences).toEqual(initialData.sequences)
      expect(reimportedData.habits).toEqual(initialData.habits)
      expect(reimportedData.dumps).toEqual(initialData.dumps)
      expect(reimportedData.schedule).toEqual(initialData.schedule)
      expect(reimportedData.brainDump.content).toEqual(
        initialData.brainDump.content
      )
      expect(reimportedData.brainDump.tags).toEqual(initialData.brainDump.tags)
      expect(reimportedData.brainDump.versions).toEqual(
        initialData.brainDump.versions
      )
      expect(reimportedData.brainDump.entries).toEqual(
        initialData.brainDump.entries
      )
    })

    it('should reject data with invalid types', async () => {
      const invalidData = {
        version: 1,
        tasks: 'not an array', // Invalid!
        sequences: []
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(invalidData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid type for tasks')
    })

    it('should reject data with invalid brainDump structure', async () => {
      const invalidData = {
        version: 1,
        tasks: [],
        brainDump: 'not an object' // Invalid!
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(invalidData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid type for brainDump')
    })

    it('should reject data with invalid brainDump.versions type', async () => {
      const invalidData = {
        version: 1,
        tasks: [],
        brainDump: {
          content: '# Test',
          tags: '',
          versions: 'not an array', // Invalid!
          entries: []
        }
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(invalidData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid type for brainDump.versions')
    })

    it('should reject data with non-numeric version', async () => {
      const invalidData = {
        version: '1', // String instead of number!
        tasks: []
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(invalidData))
      }

      const result = await importJSON(mockFile)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid type for version')
    })
  })
})
