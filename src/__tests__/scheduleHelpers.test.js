import {
  getAllTasks,
  searchRoutinesAndTasks,
  getAllRoutinesAndTasks
} from '../utils/scheduleHelpers'
import { getRoutines } from '../utils/routinesManager'

// Mock dependencies
jest.mock('../utils/routinesManager', () => ({
  getRoutines: jest.fn()
}))

jest.mock('../utils/logger', () => ({
  createLogger: () => ({
    error: jest.fn(),
    log: jest.fn(),
    info: jest.fn()
  })
}))

describe('scheduleHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('getAllTasks', () => {
    it('should return empty array when no tasks in localStorage', () => {
      const tasks = getAllTasks()
      expect(tasks).toEqual([])
    })

    it('should return all incomplete tasks from all quadrants', () => {
      const mockTasks = {
        urgent_important: [
          {
            id: '1',
            text: 'Task 1',
            completed: false,
            createdAt: '2025-01-01'
          },
          { id: '2', text: 'Task 2', completed: true, createdAt: '2025-01-01' }
        ],
        not_urgent_important: [
          { id: '3', text: 'Task 3', completed: false, createdAt: '2025-01-01' }
        ],
        urgent_not_important: [],
        not_urgent_not_important: [
          { id: '4', text: 'Task 4', completed: false, createdAt: '2025-01-01' }
        ]
      }

      localStorage.setItem('aurorae_tasks', JSON.stringify(mockTasks))

      const tasks = getAllTasks()
      expect(tasks).toHaveLength(3)
      expect(tasks.map((t) => t.id)).toEqual(['1', '3', '4'])
    })

    it('should prioritize important tasks', () => {
      const mockTasks = {
        urgent_important: [
          { id: '1', text: 'Urgent Important', completed: false }
        ],
        not_urgent_important: [
          { id: '2', text: 'Not Urgent Important', completed: false }
        ],
        urgent_not_important: [
          { id: '3', text: 'Urgent Not Important', completed: false }
        ],
        not_urgent_not_important: []
      }

      localStorage.setItem('aurorae_tasks', JSON.stringify(mockTasks))

      const tasks = getAllTasks()
      expect(tasks[0].isImportant).toBe(true)
      expect(tasks[0].priority).toBe(1)
      expect(tasks[1].isImportant).toBe(true)
      expect(tasks[1].priority).toBe(2)
      expect(tasks[2].isImportant).toBe(false)
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('aurorae_tasks', 'invalid json')
      const tasks = getAllTasks()
      expect(tasks).toEqual([])
    })
  })

  describe('searchRoutinesAndTasks', () => {
    beforeEach(() => {
      const mockTasks = {
        urgent_important: [
          { id: '1', text: 'Buy groceries', completed: false }
        ],
        not_urgent_important: [
          { id: '2', text: 'Plan vacation', completed: false }
        ],
        urgent_not_important: [],
        not_urgent_not_important: []
      }
      localStorage.setItem('aurorae_tasks', JSON.stringify(mockTasks))
    })

    it('should search routines by title', async () => {
      getRoutines.mockResolvedValue([
        { id: 'r1', title: 'Morning Routine', totalDuration: 1800 },
        { id: 'r2', title: 'Evening Routine', totalDuration: 900 }
      ])

      const results = await searchRoutinesAndTasks('morning', 'routine')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Morning Routine')
      expect(results[0].type).toBe('routine')
    })

    it('should search tasks by text', async () => {
      const results = await searchRoutinesAndTasks('groceries', 'task')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Buy groceries')
      expect(results[0].type).toBe('task')
    })

    it('should prioritize important tasks in results', async () => {
      getRoutines.mockResolvedValue([])
      const results = await searchRoutinesAndTasks('plan', null)
      expect(results[0].isImportant).toBe(true)
    })

    it('should be case-insensitive', async () => {
      getRoutines.mockResolvedValue([])
      const results = await searchRoutinesAndTasks('GROCERIES', 'task')
      expect(results).toHaveLength(1)
    })

    it('should search both routines and tasks when eventType is null', async () => {
      getRoutines.mockResolvedValue([
        { id: 'r1', name: 'Morning Launch', totalDuration: 1800 }
      ])

      const mockTasks = {
        urgent_important: [
          { id: '1', text: 'Launch product', completed: false }
        ],
        not_urgent_important: [],
        urgent_not_important: [],
        not_urgent_not_important: []
      }
      localStorage.setItem('aurorae_tasks', JSON.stringify(mockTasks))

      const results = await searchRoutinesAndTasks('launch', null)
      expect(results).toHaveLength(2)
      expect(results.some((r) => r.type === 'routine')).toBe(true)
      expect(results.some((r) => r.type === 'task')).toBe(true)
    })
  })

  describe('getAllRoutinesAndTasks', () => {
    it('should get all routines and tasks sorted by priority', async () => {
      getRoutines.mockResolvedValue([
        { id: 'r1', title: 'Routine 1', totalDuration: 1800 }
      ])

      const mockTasks = {
        urgent_important: [
          { id: '1', text: 'Important task', completed: false }
        ],
        not_urgent_important: [],
        urgent_not_important: [],
        not_urgent_not_important: [
          { id: '2', text: 'Low priority task', completed: false }
        ]
      }
      localStorage.setItem('aurorae_tasks', JSON.stringify(mockTasks))

      const results = await getAllRoutinesAndTasks(null)
      // Important task should be first
      expect(results[0].isImportant).toBe(true)
      expect(results[0].title).toBe('Important task')
      // Then low priority tasks
      expect(results[1].isImportant).toBe(false)
      // Then routines
      expect(results[2].type).toBe('routine')
    })

    it('should filter by eventType when specified', async () => {
      getRoutines.mockResolvedValue([
        { id: 'r1', title: 'Routine 1', totalDuration: 1800 }
      ])

      const results = await getAllRoutinesAndTasks('routine')
      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('routine')
    })
  })
})
