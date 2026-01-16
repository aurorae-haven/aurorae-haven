// Schedule Helpers - Utilities for searching and selecting routines/tasks for scheduling
import { getRoutines } from './routinesManager'
import { createLogger } from './logger'

const logger = createLogger('ScheduleHelpers')

/**
 * Get all available tasks from localStorage (Eisenhower matrix format)
 * @returns {Array} Array of tasks with quadrant information
 */
export function getAllTasks() {
  try {
    const tasksStr = localStorage.getItem('aurorae_tasks')
    if (!tasksStr) return []

    const tasksData = JSON.parse(tasksStr)
    const allTasks = []

    // Define quadrant priorities and labels
    const quadrants = [
      {
        key: 'urgent_important',
        label: 'Urgent & Important',
        priority: 1,
        isImportant: true
      },
      {
        key: 'not_urgent_important',
        label: 'Not Urgent & Important',
        priority: 2,
        isImportant: true
      },
      {
        key: 'urgent_not_important',
        label: 'Urgent & Not Important',
        priority: 3,
        isImportant: false
      },
      {
        key: 'not_urgent_not_important',
        label: 'Not Urgent & Not Important',
        priority: 4,
        isImportant: false
      }
    ]

    // Flatten tasks from all quadrants with metadata
    for (const quadrant of quadrants) {
      const tasks = tasksData[quadrant.key] || []
      tasks.forEach((task) => {
        if (!task.completed) {
          // Only include incomplete tasks
          allTasks.push({
            ...task,
            quadrant: quadrant.key,
            quadrantLabel: quadrant.label,
            priority: quadrant.priority,
            isImportant: quadrant.isImportant,
            type: 'task'
          })
        }
      })
    }

    return allTasks
  } catch (e) {
    logger.error('Failed to load tasks:', e)
    return []
  }
}

/**
 * Search routines and tasks by query string
 * Important tasks (urgent_important and not_urgent_important) are prioritized
 * @param {string} query - Search query
 * @param {string} eventType - Filter by event type ('routine', 'task', or null for all)
 * @returns {Promise<Array>} Array of matching items sorted by relevance
 */
export async function searchRoutinesAndTasks(query, eventType = null) {
  const results = []

  // Fetch routines if needed
  if (!eventType || eventType === 'routine') {
    try {
      const routines = await getRoutines()
      const normalizedQuery = query.toLowerCase().trim()

      routines.forEach((routine) => {
        const title = (routine.title || routine.name || '').toLowerCase()
        if (title.includes(normalizedQuery)) {
          results.push({
            id: routine.id,
            title: routine.title || routine.name,
            type: 'routine',
            sourceType: 'routine',
            duration: routine.totalDuration || routine.estimatedDuration || 0,
            tags: routine.tags || [],
            isImportant: false,
            priority: 0
          })
        }
      })
    } catch (e) {
      logger.error('Failed to search routines:', e)
    }
  }

  // Fetch tasks if needed
  if (!eventType || eventType === 'task') {
    const tasks = getAllTasks()
    const normalizedQuery = query.toLowerCase().trim()

    tasks.forEach((task) => {
      const text = (task.text || '').toLowerCase()
      if (text.includes(normalizedQuery)) {
        results.push({
          id: task.id,
          title: task.text,
          type: 'task',
          sourceType: 'task',
          quadrant: task.quadrant,
          quadrantLabel: task.quadrantLabel,
          isImportant: task.isImportant,
          priority: task.priority
        })
      }
    })
  }

  // Sort results: Important tasks first, then by type, then alphabetically
  results.sort((a, b) => {
    // 1. Important tasks first
    if (a.isImportant !== b.isImportant) {
      return a.isImportant ? -1 : 1
    }

    // 2. Among important tasks, sort by priority
    if (a.isImportant && b.isImportant && a.priority !== b.priority) {
      return a.priority - b.priority
    }

    // 3. Then by type (tasks before routines for consistency)
    if (a.type !== b.type) {
      return a.type === 'task' ? -1 : 1
    }

    // 4. Finally alphabetically by title
    return a.title.localeCompare(b.title)
  })

  return results
}

/**
 * Get all routines and tasks for display in dropdown
 * Important tasks are prioritized at the top
 * @param {string} eventType - Filter by event type ('routine', 'task', or null for all)
 * @returns {Promise<Array>} Array of all items sorted by priority
 */
export async function getAllRoutinesAndTasks(eventType = null) {
  const items = []

  // Fetch routines if needed
  if (!eventType || eventType === 'routine') {
    try {
      const routines = await getRoutines({ sortBy: 'title', order: 'asc' })
      routines.forEach((routine) => {
        items.push({
          id: routine.id,
          title: routine.title || routine.name,
          type: 'routine',
          sourceType: 'routine',
          duration: routine.totalDuration || routine.estimatedDuration || 0,
          tags: routine.tags || [],
          isImportant: false,
          priority: 0
        })
      })
    } catch (e) {
      logger.error('Failed to load routines:', e)
    }
  }

  // Fetch tasks if needed
  if (!eventType || eventType === 'task') {
    const tasks = getAllTasks()
    tasks.forEach((task) => {
      items.push({
        id: task.id,
        title: task.text,
        type: 'task',
        sourceType: 'task',
        quadrant: task.quadrant,
        quadrantLabel: task.quadrantLabel,
        isImportant: task.isImportant,
        priority: task.priority
      })
    })
  }

  // Sort: Important tasks first, then by type, then alphabetically
  items.sort((a, b) => {
    // 1. Important tasks first
    if (a.isImportant !== b.isImportant) {
      return a.isImportant ? -1 : 1
    }

    // 2. Among important tasks, sort by priority
    if (a.isImportant && b.isImportant && a.priority !== b.priority) {
      return a.priority - b.priority
    }

    // 3. Then by type (tasks before routines for consistency)
    if (a.type !== b.type) {
      return a.type === 'task' ? -1 : 1
    }

    // 4. Finally alphabetically by title
    return a.title.localeCompare(b.title)
  })

  return items
}
