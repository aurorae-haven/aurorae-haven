// Data import utilities
import { validateImportData } from './validation'
import {
  isIndexedDBAvailable,
  importAllData as importToIndexedDB
} from './indexedDBManager'

// Data schema field names
const DATA_FIELDS = {
  TASKS: 'tasks',
  ROUTINES: 'routines',
  HABITS: 'habits',
  DUMPS: 'dumps',
  SCHEDULE: 'schedule'
}

// Import success message constant
export const IMPORT_SUCCESS_MESSAGE =
  'Data imported successfully. Page will reload...'

/**
 * Reload page after a delay
 * @param {number} delay - Delay in milliseconds (default: 1500ms)
 */
export function reloadPageAfterDelay(delay = 1500) {
  setTimeout(() => window.location.reload(), delay)
}

/**
 * Import data from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<boolean>} True if import succeeded
 * @throws {Error} If import fails
 */
export async function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const obj = JSON.parse(e.target.result)

        // Validate import data
        const validation = validateImportData(obj)
        if (!validation.valid) {
          throw new Error(
            `Import validation failed: ${validation.errors.join(', ')}`
          )
        }

        // Save to IndexedDB if available, otherwise localStorage
        if (isIndexedDBAvailable()) {
          try {
            await importToIndexedDB(obj)
            resolve(true)
            return
          } catch (e) {
            console.warn(
              'IndexedDB import failed, falling back to localStorage:',
              e
            )
          }
        }

        // Fallback to localStorage
        for (const field of Object.values(DATA_FIELDS)) {
          if (obj[field]) {
            localStorage.setItem(field, JSON.stringify(obj[field]))
          }
        }

        resolve(true)
      } catch (e) {
        console.error('Import failed:', e)
        reject(new Error('Import failed: ' + e.message))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
