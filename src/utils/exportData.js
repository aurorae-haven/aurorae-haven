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
  SEQUENCES: 'sequences',
  HABITS: 'habits',
  DUMPS: 'dumps',
  SCHEDULE: 'schedule'
}

// Schedule event types - used for type field in schedule blocks
export const SCHEDULE_EVENT_TYPES = {
  TASK: 'task',
  SEQUENCE: 'sequence',
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
          indexedDBData.sequences?.length > 0 ||
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
  const data = {}

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
