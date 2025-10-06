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
    it('should return a valid data structure with empty Brain Dump data', () => {
      const data = getDataTemplate()

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

    it('should collect Brain Dump content from localStorage', () => {
      const testContent = '# My Brain Dump\n\nSome notes here'
      localStorage.setItem('brainDumpContent', testContent)

      const data = getDataTemplate()

      expect(data.brainDump.content).toBe(testContent)
    })

    it('should collect Brain Dump tags from localStorage', () => {
      const testTags =
        '<span class="tag">#idea</span><span class="tag">#task</span>'
      localStorage.setItem('brainDumpTags', testTags)

      const data = getDataTemplate()

      expect(data.brainDump.tags).toBe(testTags)
    })

    it('should collect Brain Dump version history from localStorage', () => {
      const versions = [
        { id: 1, content: 'Version 1', timestamp: '2025-01-01T00:00:00Z' },
        { id: 2, content: 'Version 2', timestamp: '2025-01-02T00:00:00Z' }
      ]
      localStorage.setItem('brainDumpVersions', JSON.stringify(versions))

      const data = getDataTemplate()

      expect(data.brainDump.versions).toEqual(versions)
    })

    it('should collect Brain Dump entries from localStorage', () => {
      const entries = [
        {
          id: 'entry_1',
          content: 'Entry 1',
          timestamp: '2025-01-01T00:00:00Z'
        },
        { id: 'entry_2', content: 'Entry 2', timestamp: '2025-01-02T00:00:00Z' }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(entries))

      const data = getDataTemplate()

      expect(data.brainDump.entries).toEqual(entries)
    })

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('brainDumpVersions', 'invalid json{')
      localStorage.setItem('brainDumpEntries', 'also invalid')

      const data = getDataTemplate()

      expect(Array.isArray(data.brainDump.versions)).toBe(true)
      expect(data.brainDump.versions).toHaveLength(0)
      expect(Array.isArray(data.brainDump.entries)).toBe(true)
      expect(data.brainDump.entries).toHaveLength(0)
    })

    it('should collect schedule data from localStorage', () => {
      const schedule = [
        { day: '2025-01-15', blocks: [{ type: 'task', start: '09:00' }] }
      ]
      localStorage.setItem('sj.schedule.events', JSON.stringify(schedule))

      const data = getDataTemplate()

      expect(data.schedule).toEqual(schedule)
    })
  })

  describe('exportJSON', () => {
    it('should create a blob and trigger download', () => {
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

      const result = exportJSON()

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
      expect(result.message).toContain('missing version')
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
  })
})
