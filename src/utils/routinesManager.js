// Routines Manager - Feature stub for routine management
// TODO: Implement full routines functionality with timer integration

import {
  put,
  putBatch,
  getAll,
  getById,
  deleteById,
  STORES
} from './indexedDBManager'
import { normalizeEntity, updateMetadata } from './idGenerator'

/**
 * Create a new routine
 * @param {object} routine - Routine data with steps
 * @returns {Promise<string>} Routine ID
 */
export async function createRoutine(routine) {
  // TODO: Implement routine validation and step validation
  const newRoutine = normalizeEntity({
    ...routine,
    steps: routine.steps || [],
    totalDuration: calculateTotalDuration(routine.steps || [])
  }, { idPrefix: 'routine' })
  await put(STORES.ROUTINES, newRoutine)
  return newRoutine.id
}

/**
 * Create multiple routines in a single batch operation
 * More efficient than calling createRoutine() multiple times
 * @param {Array<object>} routines - Array of routine data objects
 * @returns {Promise<Array<string>>} Array of routine IDs
 */
export async function createRoutineBatch(routines) {
  if (!Array.isArray(routines)) {
    throw new Error('Routines must be an array')
  }

  if (routines.length === 0) {
    return []
  }

  // Prepare all routines with proper structure
  // For batch operations, we need to ensure unique IDs when routines don't have them
  const baseTimestamp = Date.now()
  const newRoutines = routines.map((routine, index) => {
    // If routine has an ID, preserve it; otherwise generate with index suffix for uniqueness
    if (routine.id) {
      return normalizeEntity({
        ...routine,
        steps: routine.steps || [],
        totalDuration: calculateTotalDuration(routine.steps || [])
      })
    } else {
      // Generate unique ID with index suffix to prevent collisions in batch
      const uniqueId = `routine_${baseTimestamp}_${index}`
      return normalizeEntity({
        ...routine,
        id: uniqueId,
        steps: routine.steps || [],
        totalDuration: calculateTotalDuration(routine.steps || [])
      })
    }
  })

  // Use batch operation for efficiency
  await putBatch(STORES.ROUTINES, newRoutines)

  // Return array of IDs
  return newRoutines.map((r) => r.id)
}

/**
 * Get all routines
 * @param {Object} options - Query options
 * @param {string} options.sortBy - Sort field: 'title', 'lastUsed', 'duration', 'timestamp'
 * @param {string} options.order - Sort order: 'asc' or 'desc'
 * @returns {Promise<Array>} Array of routines
 */
export async function getRoutines(options = {}) {
  const routines = await getAll(STORES.ROUTINES)

  // Apply sorting if requested - TAB-RTN-07
  if (options.sortBy) {
    routines.sort((a, b) => {
      let aVal = a[options.sortBy]
      let bVal = b[options.sortBy]

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      // String comparison for title
      if (options.sortBy === 'title' || options.sortBy === 'name') {
        const titleA = (a.title || a.name || '').toLowerCase()
        const titleB = (b.title || b.name || '').toLowerCase()
        return options.order === 'desc'
          ? titleB.localeCompare(titleA)
          : titleA.localeCompare(titleB)
      }

      // Numeric comparison for duration and timestamps
      if (options.order === 'desc') {
        return bVal - aVal
      }
      return aVal - bVal
    })
  }

  return routines
}

/**
 * Get routine by ID
 * @param {string} id - Routine ID
 * @returns {Promise<object>} Routine data
 */
export async function getRoutine(id) {
  // TODO: Add error handling for missing routines
  return await getById(STORES.ROUTINES, id)
}

/**
 * Update routine
 * @param {object} routine - Updated routine data
 * @returns {Promise<string>} Routine ID
 */
export async function updateRoutine(routine) {
  // TODO: Add validation and recalculate total duration
  const updated = updateMetadata({
    ...routine,
    totalDuration: calculateTotalDuration(routine.steps || [])
  })
  await put(STORES.ROUTINES, updated)
  return updated.id
}

/**
 * Delete routine
 * @param {string} id - Routine ID
 * @returns {Promise<void>}
 */
export async function deleteRoutine(id) {
  // TODO: Add confirmation and cascade delete from schedule
  return await deleteById(STORES.ROUTINES, id)
}

/**
 * Add step to routine
 * @param {string} routineId - Routine ID
 * @param {object} step - Step data
 * @returns {Promise<object>} Updated routine
 */
export async function addStep(routineId, step) {
  // TODO: Implement step validation
  const routine = await getById(STORES.ROUTINES, routineId)
  if (!routine) {
    throw new Error('Routine not found')
  }

  const newStep = {
    ...step,
    id: step.id || `step_${Date.now()}`,
    order: routine.steps.length,
    duration: step.duration || 60 // Default 60 seconds
  }

  routine.steps.push(newStep)
  routine.totalDuration = calculateTotalDuration(routine.steps)
  
  const updated = updateMetadata(routine)
  await put(STORES.ROUTINES, updated)
  return updated
}

/**
 * Remove step from routine
 * @param {string} routineId - Routine ID
 * @param {string} stepId - Step ID
 * @returns {Promise<object>} Updated routine
 */
export async function removeStep(routineId, stepId) {
  // TODO: Implement step removal with order recalculation
  const routine = await getById(STORES.ROUTINES, routineId)
  if (!routine) {
    throw new Error('Routine not found')
  }

  routine.steps = routine.steps.filter((s) => s.id !== stepId)
  routine.steps.forEach((step, index) => {
    step.order = index
  })
  routine.totalDuration = calculateTotalDuration(routine.steps)
  
  const updated = updateMetadata(routine)
  await put(STORES.ROUTINES, updated)
  return updated
}

/**
 * Reorder steps in routine
 * @param {string} routineId - Routine ID
 * @param {string} stepId - Step ID to move
 * @param {number} newOrder - New order position
 * @returns {Promise<object>} Updated routine
 */
export async function reorderStep(routineId, stepId, newOrder) {
  // TODO: Implement drag-and-drop reordering logic
  const routine = await getById(STORES.ROUTINES, routineId)
  if (!routine) {
    throw new Error('Routine not found')
  }

  const stepIndex = routine.steps.findIndex((s) => s.id === stepId)
  if (stepIndex === -1) {
    throw new Error('Step not found')
  }

  const [step] = routine.steps.splice(stepIndex, 1)
  routine.steps.splice(newOrder, 0, step)

  routine.steps.forEach((s, index) => {
    s.order = index
  })
  
  const updated = updateMetadata(routine)
  await put(STORES.ROUTINES, updated)
  return updated
}

/**
 * Calculate total duration of steps
 * @param {Array} steps - Array of steps
 * @returns {number} Total duration in seconds
 */
function calculateTotalDuration(steps) {
  return steps.reduce((total, step) => total + (step.duration || 0), 0)
}

/**
 * Clone routine as template
 * @param {string} routineId - Routine ID to clone
 * @param {string} newName - Name for cloned routine
 * @returns {Promise<string>} New routine ID
 */
export async function cloneRoutine(routineId, newName) {
  // TODO: Implement routine cloning for templates
  const routine = await getById(STORES.ROUTINES, routineId)
  if (!routine) {
    throw new Error('Routine not found')
  }

  // Create a copy excluding metadata fields that should be regenerated
  const routineData = { ...routine }
  delete routineData.id
  delete routineData.timestamp
  delete routineData.createdAt
  delete routineData.updatedAt
  
  const cloned = normalizeEntity({
    ...routineData,
    name: newName || `${routine.name} (Copy)`
  }, { idPrefix: 'routine' })

  await put(STORES.ROUTINES, cloned)
  return cloned.id
}

/**
 * Get routine execution state
 * @param {string} routineId - Routine ID
 * @returns {object} Execution state (for timer integration)
 */
export function getRoutineState(routineId) {
  // TODO: Implement timer state management
  return {
    routineId,
    currentStepIndex: 0,
    isRunning: false,
    isPaused: false,
    elapsedTime: 0,
    startedAt: null
  }
}

/**
 * Filter routines by criteria
 * TAB-RTN-06: Filter by Tag, Duration range, Last Used, Energy tags
 * @param {Array} routines - Array of routines to filter
 * @param {Object} filters - Filter criteria
 * @param {Array} filters.tags - Tags to filter by
 * @param {number} filters.minDuration - Minimum duration in seconds
 * @param {number} filters.maxDuration - Maximum duration in seconds
 * @param {string} filters.energyTag - Energy level: 'low', 'medium', 'high'
 * @param {boolean} filters.recentlyUsed - Only recently used routines
 * @returns {Array} Filtered routines
 */
export function filterRoutines(routines, filters = {}) {
  let filtered = [...routines]

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((routine) => {
      const routineTags = routine.tags || []
      return filters.tags.some((tag) => routineTags.includes(tag))
    })
  }

  // Filter by duration range
  if (filters.minDuration !== undefined) {
    filtered = filtered.filter(
      (routine) =>
        (routine.totalDuration || routine.estimatedDuration || 0) >=
        filters.minDuration
    )
  }
  if (filters.maxDuration !== undefined) {
    filtered = filtered.filter(
      (routine) =>
        (routine.totalDuration || routine.estimatedDuration || 0) <=
        filters.maxDuration
    )
  }

  // Filter by energy tag
  if (filters.energyTag) {
    filtered = filtered.filter(
      (routine) => routine.energyTag === filters.energyTag
    )
  }

  // Filter by recently used (within last 7 days)
  if (filters.recentlyUsed) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    filtered = filtered.filter((routine) => {
      const lastUsed = routine.lastUsed
        ? new Date(routine.lastUsed).getTime()
        : 0
      return lastUsed > sevenDaysAgo
    })
  }

  return filtered
}

/**
 * Start routine execution
 * Initializes a routine for execution with timer integration.
 * Returns the initial state including routine data and execution status.
 * @param {string} routineId - Routine ID
 * @returns {Promise<object>} Initial execution state with routine data and timer info
 */
export async function startRoutine(routineId) {
  // TODO: Implement routine execution with timer
  const routine = await getById(STORES.ROUTINES, routineId)
  if (!routine) {
    throw new Error('Routine not found')
  }

  return {
    routineId,
    routine,
    currentStepIndex: 0,
    isRunning: true,
    isPaused: false,
    elapsedTime: 0,
    startedAt: Date.now()
  }
}

/**
 * Export routines to JSON format.
 * TAB-RTN-47: Export routine data including id, title, tags, steps, etc.
 * 
 * @param {Array<string>} routineIds - Routine IDs to export (empty = all routines)
 * @returns {Promise<Object>} Resolves to an object with the following properties:
 *   - version {string}: Export format version (e.g., "1.0")
 *   - exportDate {string}: ISO date string of export time
 *   - routines {Array<Object>}: Array of exported routine objects
 * 
 * @throws {Error} If routines cannot be retrieved from the database
 * 
 * Example return value:
 * {
 *   version: "1.0",
 *   exportDate: "2024-06-01T12:34:56.789Z",
 *   routines: [
 *     { id: "routine_123", title: "Morning Routine", steps: [...] },
 *     ...
 *   ]
 * }
 */
export async function exportRoutines(routineIds = []) {
  const allRoutines = await getAll(STORES.ROUTINES)
  const routinesToExport =
    routineIds.length > 0
      ? allRoutines.filter((r) => routineIds.includes(r.id))
      : allRoutines

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    routines: routinesToExport
  }
}

/**
 * Import routines from JSON format
 * TAB-RTN-48: Import with validation and ID collision handling
 * TAB-RTN-49: Lossless round-trip for definitions (regenerate IDs on collision)
 * @param {Object} data - Import data with version and routines array
 * @returns {Promise<Object>} Import results with counts and errors
 */
export async function importRoutines(data) {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid import data: data must be an object')
  }

  // Validate version field
  if (!data.version) {
    throw new Error('Invalid import data: missing version field')
  }

  // Validate routines array
  if (!data.routines || !Array.isArray(data.routines)) {
    throw new Error('Invalid import data: missing routines array')
  }

  const results = {
    imported: 0,
    skipped: 0,
    errors: []
  }

  for (const routine of data.routines) {
    try {
      // Validate routine has required fields
      if (!routine.name && !routine.title) {
        throw new Error('Routine must have a name or title')
      }

      // Generate ID if missing or check for collision
      let routineToSave = routine
      const timestamp = Date.now()

      if (!routine.id) {
        // Generate new ID if missing
        routineToSave = {
          ...routine,
          id: `routine_${timestamp}_${results.imported}`
        }
      } else {
        // Check for ID collision
        const existing = await getById(STORES.ROUTINES, routine.id)
        if (existing) {
          // Regenerate ID on collision while preserving all other data
          routineToSave = {
            ...routine,
            id: `routine_${timestamp}_${results.imported}`,
            importedAt: new Date().toISOString()
          }
        }
      }

      // Ensure routine has required structure
      const normalizedRoutine = {
        ...routineToSave,
        steps: routineToSave.steps || [],
        totalDuration: calculateTotalDuration(routineToSave.steps || []),
        timestamp: routineToSave.timestamp || new Date().toISOString(),
        createdAt: routineToSave.createdAt || new Date().toISOString()
      }

      await put(STORES.ROUTINES, normalizedRoutine)
      results.imported++
    } catch (error) {
      results.errors.push({
        routine: routine.name || routine.title || 'Unknown',
        error: error.message
      })
      results.skipped++
    }
  }

  return results
}
