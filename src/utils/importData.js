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

/**
 * Import data to localStorage
 * @param {Object} data - Data object to import
 * @returns {void}
 */
export function importToLocalStorage(data) {
  for (const field of Object.values(DATA_FIELDS)) {
    if (data[field]) {
      localStorage.setItem(field, JSON.stringify(data[field]))
    }
  }
}

// Import success message constant
export const IMPORT_SUCCESS_MESSAGE =
  'Data imported successfully. Page will reload...'

/**
 * Reload page after a delay
 * @param {number} [delay=1500] - Delay in milliseconds (default: 1500ms)
 * @param {Window|undefined} [windowObj=globalThis.window] - Injectable window object (defaults to globalThis.window). No action is taken when no window is available.
 * @param {string} [baseUrl='/'] - Base URL to navigate to (default: '/'). Should be the app's base path, e.g. '/' or '/aurorae-haven/'. The value should start and end with a slash.
 * @returns {void}
 */
export function reloadPageAfterDelay(
  delay = 1500,
  windowObj = typeof globalThis !== 'undefined' ? globalThis.window : undefined,
  baseUrl = '/'
) {
  // Early return if no window object available
  if (!windowObj) return

  // Early return if location is not available
  if (!windowObj.location) return

  // Early return if assign function is not available
  if (typeof windowObj.location.assign !== 'function') return

  const setTimeoutFn = windowObj.setTimeout || globalThis.setTimeout
  // Navigate to the app's base path instead of reloading current URL
  // This avoids 404 errors when reloading from a client-side route (e.g., after JSON import)
  // The base path is guaranteed to exist and will load the SPA correctly
  setTimeoutFn(() => windowObj.location.assign(baseUrl), delay)
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

        // Try IndexedDB first if available, fallback to localStorage
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
            // Use localStorage as fallback when IndexedDB fails
            importToLocalStorage(obj)
            resolve(true)
          }
        } else {
          // Use localStorage when IndexedDB is not available
          importToLocalStorage(obj)
          resolve(true)
        }
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
