import {
  instantiateTaskFromTemplate,
  instantiateRoutineFromTemplate,
  instantiateTemplate
} from '../utils/templateInstantiation'
import * as uuidGenerator from '../utils/uuidGenerator'
import * as routinesManager from '../utils/routinesManager'

// Mock dependencies
jest.mock('../utils/uuidGenerator')
jest.mock('../utils/routinesManager')

describe('templateInstantiation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    uuidGenerator.generateSecureUUID.mockReturnValue('test-task-uuid-123')
  })

  describe('instantiateTaskFromTemplate', () => {
    test('creates a task from a task template with default quadrant', () => {
      const template = {
        type: 'task',
        title: 'Review pull request',
        tags: ['work', 'code-review']
      }

      const result = instantiateTaskFromTemplate(template)

      expect(result).toHaveProperty('task')
      expect(result).toHaveProperty('quadrant')
      expect(result.task.id).toBe('test-task-uuid-123')
      expect(result.task.text).toBe('Review pull request')
      expect(result.task.completed).toBe(false)
      expect(result.task.createdAt).toBeDefined()
      expect(result.quadrant).toBe('urgent_important')
    })

    test('creates a task in specified quadrant', () => {
      const template = {
        type: 'task',
        title: 'Plan vacation',
        quadrant: 'not_urgent_important'
      }

      const result = instantiateTaskFromTemplate(template)

      expect(result.quadrant).toBe('not_urgent_important')

      // Verify it was saved to localStorage
      const savedTasks = JSON.parse(localStorage.getItem('aurorae_tasks'))
      expect(savedTasks.not_urgent_important).toHaveLength(1)
      expect(savedTasks.not_urgent_important[0].text).toBe('Plan vacation')
    })

    test('creates a task with due date offset', () => {
      const template = {
        type: 'task',
        title: 'Submit report',
        dueOffset: 86400000 // 1 day in milliseconds
      }

      const result = instantiateTaskFromTemplate(template)

      expect(result.task.dueDate).toBeDefined()
      expect(result.task.dueDate).toBeGreaterThan(Date.now())
    })

    test('adds task to existing tasks in localStorage', () => {
      // Pre-populate localStorage with existing tasks
      const existingTasks = {
        urgent_important: [
          { id: 'existing-1', text: 'Existing task', completed: false }
        ],
        not_urgent_important: [],
        urgent_not_important: [],
        not_urgent_not_important: []
      }
      localStorage.setItem('aurorae_tasks', JSON.stringify(existingTasks))

      const template = {
        type: 'task',
        title: 'New task from template'
      }

      instantiateTaskFromTemplate(template)

      const savedTasks = JSON.parse(localStorage.getItem('aurorae_tasks'))
      expect(savedTasks.urgent_important).toHaveLength(2)
      expect(savedTasks.urgent_important[0].id).toBe('existing-1')
      expect(savedTasks.urgent_important[1].text).toBe('New task from template')
    })

    test('initializes tasks structure if localStorage is empty', () => {
      const template = {
        type: 'task',
        title: 'First task',
        quadrant: 'not_urgent_not_important'
      }

      instantiateTaskFromTemplate(template)

      const savedTasks = JSON.parse(localStorage.getItem('aurorae_tasks'))
      expect(savedTasks).toHaveProperty('urgent_important')
      expect(savedTasks).toHaveProperty('not_urgent_important')
      expect(savedTasks).toHaveProperty('urgent_not_important')
      expect(savedTasks).toHaveProperty('not_urgent_not_important')
      expect(savedTasks.not_urgent_not_important).toHaveLength(1)
    })

    test('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('aurorae_tasks', 'invalid json{')

      const template = {
        type: 'task',
        title: 'Task despite corruption'
      }

      const result = instantiateTaskFromTemplate(template)

      expect(result.task.text).toBe('Task despite corruption')
      const savedTasks = JSON.parse(localStorage.getItem('aurorae_tasks'))
      expect(savedTasks.urgent_important).toHaveLength(1)
    })

    test('throws error for null template', () => {
      expect(() => {
        instantiateTaskFromTemplate(null)
      }).toThrow('Invalid task template')
    })

    test('throws error for non-task template', () => {
      const template = {
        type: 'routine',
        title: 'Not a task'
      }

      expect(() => {
        instantiateTaskFromTemplate(template)
      }).toThrow('Invalid task template')
    })

    test('creates independent task (not linked to template)', () => {
      const template = {
        type: 'task',
        title: 'Template task',
        id: 'template-id-123'
      }

      const result = instantiateTaskFromTemplate(template)

      // Task should have a different ID than the template
      expect(result.task.id).not.toBe('template-id-123')
      expect(result.task.id).toBe('test-task-uuid-123')
    })

    test('throws error for negative dueOffset', () => {
      const template = {
        type: 'task',
        title: 'Task with invalid offset',
        dueOffset: -1000
      }

      expect(() => {
        instantiateTaskFromTemplate(template)
      }).toThrow('Template dueOffset must be a positive number')
    })

    test('throws error for non-numeric dueOffset', () => {
      const template = {
        type: 'task',
        title: 'Task with invalid offset',
        dueOffset: 'invalid'
      }

      expect(() => {
        instantiateTaskFromTemplate(template)
      }).toThrow('Template dueOffset must be a number')
    })

    test('throws error for invalid task template data', () => {
      const template = {
        type: 'task',
        title: '' // Empty title should fail validation
      }

      expect(() => {
        instantiateTaskFromTemplate(template)
      }).toThrow('Invalid template data')
    })

    test('handles quota exceeded error gracefully', () => {
      // Pre-populate with a task to ensure localStorage works
      const template = {
        type: 'task',
        title: 'Test task'
      }

      // Mock localStorage to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        error.code = 22
        throw error
      })

      expect(() => {
        instantiateTaskFromTemplate(template)
      }).toThrow('Storage quota exceeded')

      // Restore original
      Storage.prototype.setItem = originalSetItem
    })
  })

  describe('instantiateRoutineFromTemplate', () => {
    beforeEach(() => {
      routinesManager.createRoutine.mockResolvedValue(
        'test-routine-uuid-456'
      )
    })

    test('creates a routine from a routine template', async () => {
      const template = {
        type: 'routine',
        title: 'Morning routine',
        steps: [
          { label: 'Wake up', duration: 60 },
          { label: 'Exercise', duration: 1200 },
          { label: 'Shower', duration: 600 }
        ],
        tags: ['health', 'morning'],
        energyTag: 'high',
        estimatedDuration: 1860
      }

      const routineId = await instantiateRoutineFromTemplate(template)

      expect(routineId).toBe('test-routine-uuid-456')
      expect(routinesManager.createRoutine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Morning routine',
          steps: template.steps,
          tags: ['health', 'morning'],
          energyTag: 'high',
          estimatedDuration: 1860
        })
      )
    })

    test('creates routine with minimal template data', async () => {
      const template = {
        type: 'routine',
        title: 'Simple routine'
      }

      const routineId = await instantiateRoutineFromTemplate(template)

      expect(routineId).toBe('test-routine-uuid-456')
      expect(routinesManager.createRoutine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Simple routine',
          steps: [],
          tags: [],
          energyTag: null,
          estimatedDuration: null
        })
      )
    })

    test('throws error for null template', async () => {
      await expect(instantiateRoutineFromTemplate(null)).rejects.toThrow(
        'Invalid routine template'
      )
    })

    test('throws error for non-routine template', async () => {
      const template = {
        type: 'task',
        title: 'Not a routine'
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Invalid routine template'
      )
    })

    test('creates independent sequence (not linked to template)', async () => {
      const template = {
        type: 'routine',
        title: 'Template routine',
        id: 'template-id-789'
      }

      await instantiateRoutineFromTemplate(template)

      // The sequence should not have the template ID
      const createCall = routinesManager.createRoutine.mock.calls[0][0]
      expect(createCall.id).toBeUndefined()
      expect(createCall.name).toBe('Template routine')
    })

    test('throws error for invalid routine template data', async () => {
      const template = {
        type: 'routine',
        title: '' // Empty title should fail validation
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
    })

    test('throws error for invalid step structure', async () => {
      const template = {
        type: 'routine',
        title: 'Routine with invalid step',
        steps: [
          { label: 'Valid step', duration: 60 },
          { duration: 120 } // Missing label
        ]
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
    })

    test('throws error for invalid step duration', async () => {
      const template = {
        type: 'routine',
        title: 'Routine with invalid duration',
        steps: [
          { label: 'Step 1', duration: 'invalid' } // Non-numeric duration
        ]
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
    })

    test('throws error for negative step duration', async () => {
      const template = {
        type: 'routine',
        title: 'Routine with negative duration',
        steps: [
          { label: 'Step 1', duration: -10 } // Negative duration
        ]
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Step 0 duration must be a non-negative number'
      )
    })

    test('throws error for non-string tags', async () => {
      const template = {
        type: 'routine',
        title: 'Routine with invalid tags',
        tags: ['valid', 123, 'also-valid'] // Numeric tag
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
    })

    test('throws error for invalid estimatedDuration', async () => {
      const template = {
        type: 'routine',
        title: 'Routine with invalid duration',
        estimatedDuration: -100 // Negative duration
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
    })

    test('throws error for non-numeric estimatedDuration', async () => {
      const template = {
        type: 'routine',
        title: 'Routine with invalid duration',
        estimatedDuration: 'invalid' // String instead of number
      }

      await expect(instantiateRoutineFromTemplate(template)).rejects.toThrow(
        'Invalid template data'
      )
    })
  })

  describe('instantiateTemplate', () => {
    beforeEach(() => {
      routinesManager.createRoutine.mockResolvedValue(
        'test-routine-uuid-456'
      )
    })

    test('instantiates task template', async () => {
      const template = {
        type: 'task',
        title: 'Test task'
      }

      const result = await instantiateTemplate(template)

      expect(result.type).toBe('task')
      expect(result.id).toBe('test-task-uuid-123')
      expect(result.quadrant).toBe('urgent_important')
      expect(result.task).toBeDefined()
    })

    test('instantiates routine template', async () => {
      const template = {
        type: 'routine',
        title: 'Test routine'
      }

      const result = await instantiateTemplate(template)

      expect(result.type).toBe('routine')
      expect(result.id).toBe('test-routine-uuid-456')
    })

    test('throws error for null template', async () => {
      await expect(instantiateTemplate(null)).rejects.toThrow(
        'Template is required'
      )
    })

    test('throws error for unknown template type', async () => {
      const template = {
        type: 'unknown',
        title: 'Invalid type'
      }

      await expect(instantiateTemplate(template)).rejects.toThrow(
        'Unknown template type: unknown'
      )
    })
  })
})
