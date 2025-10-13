// Data export utilities
import { generateSecureUUID } from './uuidGenerator'
import { validateExportData } from './validation'
import {
  isIndexedDBAvailable,
  exportAllData as exportFromIndexedDB
} from './indexedDBManager'

// Data schema field names - centralized to prevent drift
const DATA_FIELDS = {
  TASKS: 'tasks',
  ROUTINES: 'routines',
  HABITS: 'habits',
  DUMPS: 'dumps',
  SCHEDULE: 'schedule'
}

// Schedule event types - used for type field in schedule blocks
export const SCHEDULE_EVENT_TYPES = {
  TASK: 'task',
  ROUTINE: 'routine',
  BREAK: 'break',
  MEETING: 'meeting'
}

/**
 * Get data template from localStorage or IndexedDB
 * @returns {Promise<object>} Data template object
 */
export async function getDataTemplate() {
  // Check if IndexedDB is available and has data
  if (isIndexedDBAvailable()) {
    try {
      const indexedDBData = await exportFromIndexedDB()
      // Only use IndexedDB if it has actual data
      if (
        indexedDBData &&
        (indexedDBData.tasks?.length > 0 ||
          indexedDBData.routines?.length > 0 ||
          indexedDBData.habits?.length > 0 ||
          indexedDBData.dumps?.length > 0 ||
          indexedDBData.schedule?.length > 0)
      ) {
        return indexedDBData
      }
    } catch (e) {
      console.warn('IndexedDB export failed, falling back to localStorage:', e)
    }
  }

  // Fallback to localStorage
  const data = {
    version: 1,
    exportedAt: new Date().toISOString()
  }

  // Load all data fields from localStorage
  for (const field of Object.values(DATA_FIELDS)) {
    try {
      const raw = localStorage.getItem(field)
      data[field] = raw ? JSON.parse(raw) : []
    } catch (e) {
      console.error(`Error loading ${field} from localStorage:`, e)
      data[field] = []
    }
  }

  // Backward compatibility: check for old 'sequences' localStorage key
  try {
    if (!data.routines || data.routines.length === 0) {
      const sequencesStr = localStorage.getItem('sequences')
      if (sequencesStr) {
        data.routines = JSON.parse(sequencesStr)
      }
    }
  } catch (e) {
    console.warn('Failed to parse sequences from localStorage:', e)
  }

  // Also check for aurorae_tasks (Eisenhower matrix format)
  try {
    const tasksStr = localStorage.getItem('aurorae_tasks')
    if (tasksStr) {
      const auroraeTasksData = JSON.parse(tasksStr)
      if (auroraeTasksData) {
        data.auroraeTasksData = auroraeTasksData
        // Also flatten to tasks array for backward compatibility
        data.tasks = []
        for (const quadrant of Object.values(auroraeTasksData)) {
          if (Array.isArray(quadrant)) {
            data.tasks.push(...quadrant)
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse aurorae_tasks during export:', e)
  }

  // Parse brainDumpEntries once for both dumps override and brainDump.entries
  let entries = []
  try {
    const entriesStr = localStorage.getItem('brainDumpEntries')
    if (entriesStr) {
      entries = JSON.parse(entriesStr)
      // Override dumps field with brainDumpEntries if it exists
      if (Array.isArray(entries)) {
        data.dumps = entries
      }
    }
  } catch (e) {
    console.warn('Failed to parse brainDumpEntries during export:', e)
    entries = []
  }

  // Parse brainDumpVersions for backward compatibility
  let versions = []
  try {
    const versionsStr = localStorage.getItem('brainDumpVersions')
    versions = versionsStr ? JSON.parse(versionsStr) : []
  } catch (e) {
    console.warn('Failed to parse brainDumpVersions during export:', e)
    versions = []
  }

  // Include brain dump data for backward compatibility
  data.brainDump = {
    content: localStorage.getItem('brainDumpContent') || '',
    tags: localStorage.getItem('brainDumpTags') || '',
    versions,
    entries
  }

  // Backward compatibility: include sequences field as alias for routines
  data.sequences = data.routines || []

  return data
}

/**
 * Export all data as JSON file
 * @returns {Promise<boolean>} True if export succeeded
 * @throws {Error} If export fails
 */
export async function exportJSON() {
  try {
    const dataTemplate = await getDataTemplate()

    // Validate data before export (includes serialization test)
    const validation = validateExportData(dataTemplate)
    if (!validation.valid) {
      throw new Error(
        `Export validation failed: ${validation.errors.join(', ')}`
      )
    }

    // Serialize data for export (reuse validation.stringified to avoid redundant serialization)
    const data =
      typeof validation.stringified === 'string'
        ? validation.stringified
        : JSON.stringify(dataTemplate)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Generate filename: aurorae_YYYY-MM-DD_UUID.json
    const date = new Date().toISOString().split('T')[0]
    const uuid = generateSecureUUID()
    const filename = `aurorae_${date}_${uuid}.json`

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  } catch (e) {
    console.error('Export failed:', e)
    throw new Error('Export failed: ' + e.message)
  }
}
