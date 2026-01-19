/**
 * Schedule Helpers - Utilities for searching and selecting routines/tasks for scheduling
 *
 * This module provides functions to:
 * - Fetch and filter tasks from localStorage (Eisenhower matrix format)
 * - Search through routines stored in IndexedDB
 * - Sort and prioritize items with Important tasks at the top
 *
 * @module scheduleHelpers
 */
import { getRoutines } from './routinesManager'
import { createLogger } from './logger'

const logger = createLogger('ScheduleHelpers')

/**
 * Sort items by importance, priority, type, and title
 * Sorting order:
 * 1. Important tasks first (urgent_important, not_urgent_important)
 * 2. Among important tasks, sort by priority number (lower = higher priority)
 * 3. Tasks before routines
 * 4. Alphabetically by title
 *
 * @param {Array<Object>} items - Array of items to sort
 * @param {boolean} items[].isImportant - Whether the item is important
 * @param {number} items[].priority - Priority number (1-4, lower is higher priority)
 * @param {string} items[].type - Type of item ('task' or 'routine')
 * @param {string} items[].title - Title of the item
 * @returns {Array<Object>} Sorted array (original array is mutated)
 */
function sortItemsByPriority(items) {
  return items.sort((a, b) => {
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
}

/**
 * Get all available tasks from localStorage (Eisenhower matrix format)
 * Tasks are stored in four quadrants based on urgency and importance.
 *
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.includeCompleted=false] - Whether to include completed tasks
 * @returns {Array<Object>} Array of tasks with quadrant information and metadata
 * @returns {string} return[].id - Task ID
 * @returns {string} return[].text - Task text/description
 * @returns {string} return[].quadrant - Quadrant key (e.g., 'urgent_important')
 * @returns {string} return[].quadrantLabel - Human-readable quadrant label
 * @returns {number} return[].priority - Priority number (1-4, lower = higher)
 * @returns {boolean} return[].isImportant - Whether task is in an important quadrant
 * @returns {string} return[].type - Always 'task'
 * @returns {boolean} [return[].completed] - Whether task is completed (if includeCompleted=true)
 *
 * @example
 * // Get only incomplete tasks
 * const tasks = getAllTasks()
 *
 * @example
 * // Get all tasks including completed ones
 * const allTasks = getAllTasks({ includeCompleted: true })
 */
export function getAllTasks(options = {}) {
  const { includeCompleted = false } = options

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
        if (includeCompleted || !task.completed) {
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
 * Performs case-insensitive substring matching on routine titles and task text.
 * Important tasks (urgent_important and not_urgent_important) are automatically prioritized.
 *
 * @param {string} query - Search query (case-insensitive)
 * @param {('routine'|'task'|null)} [eventType=null] - Filter by event type, or null for all
 * @returns {Promise<Array<Object>>} Array of matching items sorted by relevance and importance
 * @returns {string} return[].id - Item ID
 * @returns {string} return[].title - Item title/text
 * @returns {string} return[].type - Type ('routine' or 'task')
 * @returns {string} return[].sourceType - Original source type
 * @returns {boolean} return[].isImportant - Whether item is important (always false for routines)
 * @returns {number} return[].priority - Priority number (0 for routines, 1-4 for tasks)
 * @returns {number} [return[].duration] - Duration in minutes (routines only)
 * @returns {Array<string>} [return[].tags] - Tags array (routines only)
 * @returns {string} [return[].quadrant] - Quadrant key (tasks only)
 * @returns {string} [return[].quadrantLabel] - Quadrant label (tasks only)
 *
 * @example
 * // Search for tasks containing "email"
 * const results = await searchRoutinesAndTasks('email', 'task')
 *
 * @example
 * // Search all items containing "meeting"
 * const results = await searchRoutinesAndTasks('meeting')
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

  // Sort results using shared sorting function
  return sortItemsByPriority(results)
}

/**
 * Get all routines and tasks for display in dropdown
 * Fetches all items from both routines (IndexedDB) and tasks (localStorage).
 * Important tasks are automatically prioritized at the top of results.
 * Useful for showing a complete list of schedulable items.
 *
 * @param {('routine'|'task'|null)} [eventType=null] - Filter by event type, or null for all
 * @returns {Promise<Array<Object>>} Array of all items sorted by priority and importance
 * @returns {string} return[].id - Item ID
 * @returns {string} return[].title - Item title/text
 * @returns {string} return[].type - Type ('routine' or 'task')
 * @returns {string} return[].sourceType - Original source type
 * @returns {boolean} return[].isImportant - Whether item is important (always false for routines)
 * @returns {number} return[].priority - Priority number (0 for routines, 1-4 for tasks)
 * @returns {number} [return[].duration] - Duration in minutes (routines only)
 * @returns {Array<string>} [return[].tags] - Tags array (routines only)
 * @returns {string} [return[].quadrant] - Quadrant key (tasks only)
 * @returns {string} [return[].quadrantLabel] - Quadrant label (tasks only)
 *
 * @example
 * // Get all tasks
 * const tasks = await getAllRoutinesAndTasks('task')
 *
 * @example
 * // Get all routines and tasks
 * const allItems = await getAllRoutinesAndTasks()
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

  // Sort using shared sorting function
  return sortItemsByPriority(items)
}
