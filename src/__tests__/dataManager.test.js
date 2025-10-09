// Tests for data import/export functionality
import {
  getDataTemplate,
  exportJSON,
  importJSON,
  SCHEDULE_EVENT_TYPES
} from '../utils/dataManager'

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
        {
          day: '2025-01-15',
          blocks: [{ type: SCHEDULE_EVENT_TYPES.TASK, start: '09:00' }]
        }
      ]
      localStorage.setItem('sj.schedule.events', JSON.stringify(schedule))

      const data = await getDataTemplate()

      expect(data.schedule).toEqual(schedule)
    })

    it('should collect tasks from aurorae_tasks localStorage key', async () => {
      const tasksData = {
        urgent_important: [
          {
            id: 1,
            text: 'Important task',
            completed: false,
            createdAt: Date.now()
          }
        ],
        not_urgent_important: [],
        urgent_not_important: [],
        not_urgent_not_important: []
      }
      localStorage.setItem('aurorae_tasks', JSON.stringify(tasksData))

      const data = await getDataTemplate()

      expect(data.auroraeTasksData).toEqual(tasksData)
    })

    it('should handle missing aurorae_tasks gracefully', async () => {
      const data = await getDataTemplate()

      expect(data.auroraeTasksData).toBeNull()
    })

    it('should handle invalid JSON in aurorae_tasks', async () => {
      localStorage.setItem('aurorae_tasks', 'invalid json{')

      const data = await getDataTemplate()

      expect(data.auroraeTasksData).toBeNull()
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

    it('should validate data before export', async () => {
      // Store some valid data
      const testData = {
        version: 1,
        tasks: [{ id: 1, title: 'Test' }],
        sequences: [],
        habits: [],
        dumps: [],
        schedule: []
      }
      localStorage.setItem('aurorae_haven_data', JSON.stringify(testData))

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

      // Should succeed with valid data
      const result = await exportJSON()
      expect(result).toBe(true)
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
        {
          day: '2025-01-15',
          blocks: [{ type: SCHEDULE_EVENT_TYPES.TASK, start: '09:00' }]
        }
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

    it('should import tasks to aurorae_tasks', async () => {
      const tasksData = {
        urgent_important: [
          {
            id: 1,
            text: 'Important task',
            completed: false,
            createdAt: Date.now()
          }
        ],
        not_urgent_important: [],
        urgent_not_important: [],
        not_urgent_not_important: []
      }
      const testData = {
        version: 1,
        tasks: [],
        sequences: [],
        auroraeTasksData: tasksData
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      await importJSON(mockFile)

      const storedTasks = JSON.parse(localStorage.getItem('aurorae_tasks'))
      expect(storedTasks).toEqual(tasksData)
    })

    it('should handle missing auroraeTasksData gracefully', async () => {
      const testData = {
        version: 1,
        tasks: [],
        sequences: []
      }

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(testData))
      }

      await importJSON(mockFile)

      expect(localStorage.getItem('aurorae_tasks')).toBeNull()
    })

    it('should roundtrip export and import tasks correctly', async () => {
      const tasksData = {
        urgent_important: [
          {
            id: 1,
            text: 'Do this now',
            completed: false,
            createdAt: 1234567890
          }
        ],
        not_urgent_important: [
          { id: 2, text: 'Plan this', completed: false, createdAt: 1234567891 }
        ],
        urgent_not_important: [],
        not_urgent_not_important: [
          { id: 3, text: 'Maybe later', completed: true, createdAt: 1234567892 }
        ]
      }
      localStorage.setItem('aurorae_tasks', JSON.stringify(tasksData))

      // Export
      const exportedData = await getDataTemplate()
      expect(exportedData.auroraeTasksData).toEqual(tasksData)

      // Clear and import
      localStorage.clear()
      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
      }
      await importJSON(mockFile)

      // Verify
      const importedTasks = JSON.parse(localStorage.getItem('aurorae_tasks'))
      expect(importedTasks).toEqual(tasksData)
    })

    it('should export and import all data types with nominal example', async () => {
      // Setup nominal example data for all data types
      const nominalData = {
        // Tasks (IndexedDB)
        tasks: [
          {
            id: 1,
            title: 'Sample task',
            done: false,
            timestamp: 1704453600000
          },
          {
            id: 2,
            title: 'Completed task',
            done: true,
            timestamp: 1704453601000
          }
        ],
        // Sequences
        sequences: [
          {
            id: 'seq1',
            name: 'Morning Routine',
            steps: [
              { id: 1, text: 'Wake up', duration: 5 },
              { id: 2, text: 'Exercise', duration: 20 }
            ],
            timestamp: 1704453600000
          }
        ],
        // Habits
        habits: [
          {
            id: 1,
            name: 'Read daily',
            streak: 7,
            paused: false,
            timestamp: 1704453600000
          }
        ],
        // Dumps (brain dump entries)
        dumps: [
          {
            id: 1,
            content: 'Quick thought',
            tags: ['idea'],
            timestamp: 1704453600000
          }
        ],
        // Schedule
        schedule: [
          {
            id: 1,
            day: '2025-01-15',
            blocks: [{ type: 'task', start: '09:00', end: '10:00' }],
            timestamp: 1704453600000
          }
        ],
        // Aurorae Tasks (Eisenhower matrix)
        auroraeTasksData: {
          urgent_important: [
            {
              id: 1,
              text: 'Critical deadline',
              completed: false,
              createdAt: 1704453600000
            }
          ],
          not_urgent_important: [
            {
              id: 2,
              text: 'Long-term planning',
              completed: false,
              createdAt: 1704453601000
            }
          ],
          urgent_not_important: [
            {
              id: 3,
              text: 'Quick interruption',
              completed: true,
              createdAt: 1704453602000
            }
          ],
          not_urgent_not_important: []
        },
        // Brain Dump
        brainDump: {
          content: '# My Notes\n\n- [ ] Todo 1\n- [x] Done',
          tags: '<span class="tag">#work</span><span class="tag">#personal</span>',
          versions: [
            {
              id: 1704453600000,
              content: '# Old version',
              timestamp: '2025-01-15T10:00:00Z',
              preview: '# Old version'
            }
          ],
          entries: [
            {
              id: 'entry_1',
              title: 'Meeting Notes',
              content: 'Discussion points',
              timestamp: '2025-01-15T10:00:00Z'
            }
          ]
        }
      }

      // Populate localStorage with all data types
      localStorage.setItem(
        'aurorae_haven_data',
        JSON.stringify({
          tasks: nominalData.tasks,
          sequences: nominalData.sequences,
          habits: nominalData.habits,
          dumps: nominalData.dumps,
          schedule: nominalData.schedule
        })
      )
      localStorage.setItem(
        'aurorae_tasks',
        JSON.stringify(nominalData.auroraeTasksData)
      )
      localStorage.setItem(
        'sj.schedule.events',
        JSON.stringify(nominalData.schedule)
      )
      localStorage.setItem('brainDumpContent', nominalData.brainDump.content)
      localStorage.setItem('brainDumpTags', nominalData.brainDump.tags)
      localStorage.setItem(
        'brainDumpVersions',
        JSON.stringify(nominalData.brainDump.versions)
      )
      localStorage.setItem(
        'brainDumpEntries',
        JSON.stringify(nominalData.brainDump.entries)
      )

      // Export all data
      const exportedData = await getDataTemplate()

      // Verify all data types are present in export
      expect(exportedData.version).toBe(1)
      expect(exportedData.exportedAt).toBeDefined()
      expect(exportedData.tasks).toEqual(nominalData.tasks)
      expect(exportedData.sequences).toEqual(nominalData.sequences)
      expect(exportedData.habits).toEqual(nominalData.habits)
      expect(exportedData.dumps).toEqual(nominalData.dumps)
      expect(exportedData.schedule).toEqual(nominalData.schedule)
      expect(exportedData.auroraeTasksData).toEqual(
        nominalData.auroraeTasksData
      )
      expect(exportedData.brainDump).toEqual(nominalData.brainDump)

      // Clear all localStorage
      localStorage.clear()

      // Import the data back
      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
      }
      const result = await importJSON(mockFile)

      // Verify import succeeded
      expect(result.success).toBe(true)

      // Verify all data types were restored
      const restoredMainData = JSON.parse(
        localStorage.getItem('aurorae_haven_data')
      )
      expect(restoredMainData.tasks).toEqual(nominalData.tasks)
      expect(restoredMainData.sequences).toEqual(nominalData.sequences)
      expect(restoredMainData.habits).toEqual(nominalData.habits)
      expect(restoredMainData.dumps).toEqual(nominalData.dumps)
      expect(restoredMainData.schedule).toEqual(nominalData.schedule)

      const restoredAuroraeTasks = JSON.parse(
        localStorage.getItem('aurorae_tasks')
      )
      expect(restoredAuroraeTasks).toEqual(nominalData.auroraeTasksData)

      const restoredSchedule = JSON.parse(
        localStorage.getItem('sj.schedule.events')
      )
      expect(restoredSchedule).toEqual(nominalData.schedule)

      expect(localStorage.getItem('brainDumpContent')).toBe(
        nominalData.brainDump.content
      )
      expect(localStorage.getItem('brainDumpTags')).toBe(
        nominalData.brainDump.tags
      )

      const restoredVersions = JSON.parse(
        localStorage.getItem('brainDumpVersions')
      )
      expect(restoredVersions).toEqual(nominalData.brainDump.versions)

      const restoredEntries = JSON.parse(
        localStorage.getItem('brainDumpEntries')
      )
      expect(restoredEntries).toEqual(nominalData.brainDump.entries)
    })

    describe('Export-Delete-Import sequences for all tabs', () => {
      it('should restore deleted BrainDump entries after import', async () => {
        // Setup initial data with multiple entries
        const initialEntries = [
          {
            id: 'entry-1',
            title: 'Entry 1',
            content: 'Content 1',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          },
          {
            id: 'entry-2',
            title: 'Entry 2',
            content: 'Content 2',
            createdAt: '2025-01-02T00:00:00Z',
            updatedAt: '2025-01-02T00:00:00Z'
          },
          {
            id: 'entry-3',
            title: 'Entry 3',
            content: 'Content 3',
            createdAt: '2025-01-03T00:00:00Z',
            updatedAt: '2025-01-03T00:00:00Z'
          }
        ]
        localStorage.setItem('brainDumpEntries', JSON.stringify(initialEntries))

        // Export
        const exportedData = await getDataTemplate()
        expect(exportedData.brainDump.entries).toEqual(initialEntries)

        // Delete entry-2
        const afterDelete = initialEntries.filter((e) => e.id !== 'entry-2')
        localStorage.setItem('brainDumpEntries', JSON.stringify(afterDelete))
        expect(
          JSON.parse(localStorage.getItem('brainDumpEntries') || '[]').length
        ).toBe(2)

        // Import
        const mockFile = {
          text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
        }
        await importJSON(mockFile)

        // Verify restoration
        const restored = JSON.parse(localStorage.getItem('brainDumpEntries'))
        expect(restored.length).toBe(3)
        expect(restored.find((e) => e.id === 'entry-2')).toEqual(
          initialEntries[1]
        )
      })

      it('should restore deleted Tasks (Eisenhower matrix) after import', async () => {
        // Setup initial tasks
        const initialTasks = {
          urgent_important: [
            { id: 1, text: 'Task 1', completed: false, createdAt: 1000 },
            { id: 2, text: 'Task 2', completed: false, createdAt: 2000 }
          ],
          not_urgent_important: [
            { id: 3, text: 'Task 3', completed: false, createdAt: 3000 }
          ],
          urgent_not_important: [],
          not_urgent_not_important: [
            { id: 4, text: 'Task 4', completed: true, createdAt: 4000 }
          ]
        }
        localStorage.setItem('aurorae_tasks', JSON.stringify(initialTasks))

        // Export
        const exportedData = await getDataTemplate()
        expect(exportedData.auroraeTasksData).toEqual(initialTasks)

        // Delete task 2 from urgent_important
        const modifiedTasks = {
          ...initialTasks,
          urgent_important: [initialTasks.urgent_important[0]]
        }
        localStorage.setItem('aurorae_tasks', JSON.stringify(modifiedTasks))

        // Import
        const mockFile = {
          text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
        }
        await importJSON(mockFile)

        // Verify restoration
        const restored = JSON.parse(localStorage.getItem('aurorae_tasks'))
        expect(restored.urgent_important.length).toBe(2)
        expect(restored.urgent_important.find((t) => t.id === 2)).toEqual(
          initialTasks.urgent_important[1]
        )
      })

      it('should restore deleted Sequences after import', async () => {
        // Setup initial sequences
        const initialSequences = [
          {
            id: 'seq-1',
            name: 'Morning',
            steps: [
              { id: 1, text: 'Wake up', duration: 5 },
              { id: 2, text: 'Shower', duration: 10 }
            ]
          },
          {
            id: 'seq-2',
            name: 'Evening',
            steps: [{ id: 1, text: 'Dinner', duration: 30 }]
          }
        ]
        const mainData = {
          version: 1,
          tasks: [],
          sequences: initialSequences,
          habits: [],
          dumps: [],
          schedule: []
        }
        localStorage.setItem('aurorae_haven_data', JSON.stringify(mainData))

        // Export
        const exportedData = await getDataTemplate()
        expect(exportedData.sequences).toEqual(initialSequences)

        // Delete seq-1
        mainData.sequences = [initialSequences[1]]
        localStorage.setItem('aurorae_haven_data', JSON.stringify(mainData))

        // Import
        const mockFile = {
          text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
        }
        await importJSON(mockFile)

        // Verify restoration
        const restored = JSON.parse(localStorage.getItem('aurorae_haven_data'))
        expect(restored.sequences.length).toBe(2)
        expect(restored.sequences.find((s) => s.id === 'seq-1')).toEqual(
          initialSequences[0]
        )
      })

      it('should restore deleted Habits after import', async () => {
        // Setup initial habits
        const initialHabits = [
          { id: 1, name: 'Exercise', streak: 5, paused: false },
          { id: 2, name: 'Read', streak: 10, paused: false },
          { id: 3, name: 'Meditate', streak: 3, paused: true }
        ]
        const mainData = {
          version: 1,
          tasks: [],
          sequences: [],
          habits: initialHabits,
          dumps: [],
          schedule: []
        }
        localStorage.setItem('aurorae_haven_data', JSON.stringify(mainData))

        // Export
        const exportedData = await getDataTemplate()
        expect(exportedData.habits).toEqual(initialHabits)

        // Delete habit with id 2
        mainData.habits = initialHabits.filter((h) => h.id !== 2)
        localStorage.setItem('aurorae_haven_data', JSON.stringify(mainData))

        // Import
        const mockFile = {
          text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
        }
        await importJSON(mockFile)

        // Verify restoration
        const restored = JSON.parse(localStorage.getItem('aurorae_haven_data'))
        expect(restored.habits.length).toBe(3)
        expect(restored.habits.find((h) => h.id === 2)).toEqual(
          initialHabits[1]
        )
      })

      it('should restore deleted Schedule events after import', async () => {
        // Setup initial schedule
        const initialSchedule = [
          {
            id: 1,
            day: '2025-01-15',
            blocks: [
              { type: SCHEDULE_EVENT_TYPES.TASK, start: '09:00', end: '10:00' }
            ]
          },
          {
            id: 2,
            day: '2025-01-16',
            blocks: [
              {
                type: SCHEDULE_EVENT_TYPES.SEQUENCE,
                start: '10:00',
                end: '11:00'
              }
            ]
          }
        ]
        localStorage.setItem(
          'sj.schedule.events',
          JSON.stringify(initialSchedule)
        )

        // Export
        const exportedData = await getDataTemplate()
        expect(exportedData.schedule).toEqual(initialSchedule)

        // Delete schedule event with id 1
        const afterDelete = [initialSchedule[1]]
        localStorage.setItem('sj.schedule.events', JSON.stringify(afterDelete))

        // Import
        const mockFile = {
          text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
        }
        await importJSON(mockFile)

        // Verify restoration
        const restored = JSON.parse(
          localStorage.getItem('sj.schedule.events')
        )
        expect(restored.length).toBe(2)
        expect(restored.find((s) => s.id === 1)).toEqual(initialSchedule[0])
      })

      it('should restore all data types after deleting items from multiple tabs', async () => {
        // Setup comprehensive initial data
        const initialData = {
          version: 1,
          tasks: [{ id: 1, title: 'Task 1' }],
          sequences: [{ id: 'seq-1', name: 'Sequence 1', steps: [] }],
          habits: [{ id: 1, name: 'Habit 1', streak: 5 }],
          dumps: [{ id: 1, content: 'Dump 1' }],
          schedule: [{ id: 1, day: '2025-01-15', blocks: [] }]
        }
        const auroraeTasksData = {
          urgent_important: [{ id: 1, text: 'Important' }],
          not_urgent_important: [],
          urgent_not_important: [],
          not_urgent_not_important: []
        }
        const brainDumpEntries = [
          { id: 'note-1', title: 'Note 1', content: 'Content 1' }
        ]

        localStorage.setItem('aurorae_haven_data', JSON.stringify(initialData))
        localStorage.setItem('aurorae_tasks', JSON.stringify(auroraeTasksData))
        localStorage.setItem(
          'brainDumpEntries',
          JSON.stringify(brainDumpEntries)
        )
        localStorage.setItem(
          'sj.schedule.events',
          JSON.stringify(initialData.schedule)
        )

        // Export
        const exportedData = await getDataTemplate()

        // Delete items from multiple tabs
        localStorage.setItem(
          'aurorae_haven_data',
          JSON.stringify({
            version: 1,
            tasks: [],
            sequences: [],
            habits: [],
            dumps: [],
            schedule: []
          })
        )
        localStorage.setItem(
          'aurorae_tasks',
          JSON.stringify({
            urgent_important: [],
            not_urgent_important: [],
            urgent_not_important: [],
            not_urgent_not_important: []
          })
        )
        localStorage.setItem('brainDumpEntries', JSON.stringify([]))
        localStorage.setItem('sj.schedule.events', JSON.stringify([]))

        // Verify deletions
        expect(
          JSON.parse(localStorage.getItem('aurorae_haven_data')).tasks
        ).toHaveLength(0)
        expect(
          JSON.parse(localStorage.getItem('aurorae_tasks')).urgent_important
        ).toHaveLength(0)
        expect(
          JSON.parse(localStorage.getItem('brainDumpEntries'))
        ).toHaveLength(0)

        // Import
        const mockFile = {
          text: jest.fn().mockResolvedValue(JSON.stringify(exportedData))
        }
        const result = await importJSON(mockFile)

        // Verify success
        expect(result.success).toBe(true)

        // Verify all data restored
        const restoredMain = JSON.parse(
          localStorage.getItem('aurorae_haven_data')
        )
        expect(restoredMain.tasks).toEqual(initialData.tasks)
        expect(restoredMain.sequences).toEqual(initialData.sequences)
        expect(restoredMain.habits).toEqual(initialData.habits)

        const restoredTasks = JSON.parse(localStorage.getItem('aurorae_tasks'))
        expect(restoredTasks.urgent_important).toEqual(
          auroraeTasksData.urgent_important
        )

        const restoredEntries = JSON.parse(
          localStorage.getItem('brainDumpEntries')
        )
        expect(restoredEntries).toEqual(brainDumpEntries)

        const restoredSchedule = JSON.parse(
          localStorage.getItem('sj.schedule.events')
        )
        expect(restoredSchedule).toEqual(initialData.schedule)
      })
    })
  })
})
