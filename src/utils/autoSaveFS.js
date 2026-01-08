// Auto-save utility for saving data to File System Access API
// Implements automatic periodic saves to a user-configured directory
import { getDataTemplate } from './exportData'
import { generateSecureUUID } from './uuidGenerator'
import { createLogger } from './logger'
import { validateImportData } from './validation'
import {
  isIndexedDBAvailable,
  importAllData as importToIndexedDB
} from './indexedDBManager'
import { importToLocalStorage } from './importData'

const logger = createLogger('AutoSave')

// Storage keys
const LAST_SAVE_KEY = 'aurorae_last_save'

// Time constants
const MS_PER_MINUTE = 60 * 1000 // 60 seconds * 1000 milliseconds

// Default configuration
const DEFAULT_SAVE_INTERVAL = 5 * MS_PER_MINUTE // 5 minutes default
const SAVE_FILE_PREFIX = 'aurorae_save_'
const SAVE_FILE_EXTENSION = '.json'

let autoSaveTimer = null
let currentDirectoryHandle = null

/**
 * Check if File System Access API is supported
 * @returns {boolean}
 */
export function isFileSystemAccessSupported() {
  return (
    typeof window !== 'undefined' &&
    'showDirectoryPicker' in window &&
    'showSaveFilePicker' in window
  )
}

/**
 * Request directory access from user
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export async function requestDirectoryAccess() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser')
  }

  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    })
    currentDirectoryHandle = handle
    // Note: We cannot persist the handle in localStorage as it's not serializable
    // User will need to re-grant access after page reload
    logger.log('Directory access granted:', handle.name)
    return handle
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.log('User cancelled directory picker')
      return null
    }
    logger.error('Failed to get directory access:', error)
    throw error
  }
}

/**
 * Get current directory handle
 * @returns {FileSystemDirectoryHandle|null}
 */
export function getCurrentDirectoryHandle() {
  return currentDirectoryHandle
}

/**
 * Set directory handle (used for restoring after page load)
 * @param {FileSystemDirectoryHandle} handle
 */
export function setDirectoryHandle(handle) {
  currentDirectoryHandle = handle
}

/**
 * Verify directory handle is still valid
 * @param {FileSystemDirectoryHandle} handle
 * @returns {Promise<boolean>}
 */
export async function verifyDirectoryHandle(handle) {
  if (!handle) return false

  try {
    // Request permission to check if handle is still valid
    const permission = await handle.queryPermission({ mode: 'readwrite' })
    if (permission === 'granted') {
      return true
    }

    // Try to request permission again
    const newPermission = await handle.requestPermission({ mode: 'readwrite' })
    return newPermission === 'granted'
  } catch (error) {
    logger.warn('Directory handle no longer valid:', error)
    return false
  }
}

/**
 * Save data to file in the configured directory
 * @param {object} data - Data to save
 * @param {string} filename - Optional filename (will be generated if not provided)
 * @returns {Promise<string>} - Saved filename
 */
export async function saveToFile(data, filename = null) {
  if (!currentDirectoryHandle) {
    throw new Error('No directory configured. Please select a save directory.')
  }

  // Verify directory handle is still valid
  const isValid = await verifyDirectoryHandle(currentDirectoryHandle)
  if (!isValid) {
    currentDirectoryHandle = null
    throw new Error('Directory access expired. Please select the directory again.')
  }

  // Generate filename if not provided
  if (!filename) {
    const date = new Date().toISOString().split('T')[0]
    const time = new Date()
      .toISOString()
      .split('T')[1]
      .split('.')[0]
      .replace(/:/g, '')
    const uuid = generateSecureUUID().slice(0, 8) // Short UUID
    filename = `${SAVE_FILE_PREFIX}${date}_${time}_${uuid}${SAVE_FILE_EXTENSION}`
  }

  try {
    // Create/get file handle
    const fileHandle = await currentDirectoryHandle.getFileHandle(filename, {
      create: true
    })

    // Create writable stream
    const writable = await fileHandle.createWritable()

    // Write data
    const jsonData = JSON.stringify(data, null, 2)
    await writable.write(jsonData)
    await writable.close()

    logger.log('Data saved to:', filename)
    return filename
  } catch (error) {
    logger.error('Failed to save file:', error)
    throw new Error('Failed to save file: ' + error.message)
  }
}

/**
 * Perform automatic save
 * @returns {Promise<object>} Save result with filename and timestamp
 */
export async function performAutoSave() {
  try {
    if (!currentDirectoryHandle) {
      logger.log('Auto-save skipped: No directory configured')
      return { success: false, error: 'No directory configured' }
    }

    // Get current data
    const data = await getDataTemplate()

    // Save to file
    const filename = await saveToFile(data)

    // Update last save timestamp
    const timestamp = Date.now()
    localStorage.setItem(LAST_SAVE_KEY, timestamp.toString())

    logger.log('Auto-save completed:', filename)
    return {
      success: true,
      filename,
      timestamp
    }
  } catch (error) {
    logger.error('Auto-save failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get the most recent save file from the directory
 * @returns {Promise<object|null>} File info with handle, name, and modified timestamp
 */
export async function getMostRecentSaveFile() {
  if (!currentDirectoryHandle) {
    throw new Error('No directory configured')
  }

  try {
    const files = []

    // Iterate through directory entries
    for await (const entry of currentDirectoryHandle.values()) {
      if (entry.kind === 'file' && entry.name.startsWith(SAVE_FILE_PREFIX)) {
        const file = await entry.getFile()
        files.push({
          name: entry.name,
          handle: entry,
          modified: file.lastModified
        })
      }
    }

    // Sort by modification time (newest first)
    files.sort((a, b) => b.modified - a.modified)

    // Return the most recent file
    return files.length > 0 ? files[0] : null
  } catch (error) {
    logger.error('Failed to get recent save files:', error)
    throw error
  }
}

/**
 * Load data from a save file
 * @param {FileSystemFileHandle} fileHandle - File handle to load from
 * @returns {Promise<object>} Loaded data
 */
export async function loadFromFile(fileHandle) {
  try {
    const file = await fileHandle.getFile()
    const text = await file.text()
    const data = JSON.parse(text)

    logger.log('Data loaded from:', fileHandle.name)
    return data
  } catch (error) {
    logger.error('Failed to load file:', error)
    throw new Error('Failed to load file: ' + error.message)
  }
}

/**
 * Load the most recent save file
 * @returns {Promise<object>} Result with loaded data
 */
export async function loadLastSave() {
  try {
    if (!currentDirectoryHandle) {
      return {
        success: false,
        error: 'No directory configured. Please select a save directory.'
      }
    }

    // Verify directory handle is still valid
    const isValid = await verifyDirectoryHandle(currentDirectoryHandle)
    if (!isValid) {
      currentDirectoryHandle = null
      return {
        success: false,
        error: 'Directory access expired. Please select the directory again.'
      }
    }

    // Get the most recent save file
    const fileInfo = await getMostRecentSaveFile()
    if (!fileInfo) {
      return {
        success: false,
        error: 'No save files found in the directory'
      }
    }

    // Load the data
    const data = await loadFromFile(fileInfo.handle)

    logger.log('Last save loaded successfully:', fileInfo.name)
    return {
      success: true,
      data,
      filename: fileInfo.name,
      timestamp: fileInfo.modified
    }
  } catch (error) {
    logger.error('Failed to load last save:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Load and import the most recent save file
 * This combines loading the file and importing the data into the app
 * @returns {Promise<object>} Result with success status
 */
export async function loadAndImportLastSave() {
  try {
    // Load the last save file
    const loadResult = await loadLastSave()
    if (!loadResult.success) {
      return loadResult
    }

    // Validate the loaded data
    const validation = validateImportData(loadResult.data)
    if (!validation.valid) {
      return {
        success: false,
        error: `Import validation failed: ${validation.errors.join(', ')}`
      }
    }

    // Import the data (try IndexedDB first, fallback to localStorage)
    if (isIndexedDBAvailable()) {
      try {
        await importToIndexedDB(loadResult.data)
      } catch (e) {
        logger.warn(
          'IndexedDB import failed, falling back to localStorage:',
          e
        )
        importToLocalStorage(loadResult.data)
      }
    } else {
      importToLocalStorage(loadResult.data)
    }

    logger.log('Last save imported successfully:', loadResult.filename)
    return {
      success: true,
      filename: loadResult.filename,
      timestamp: loadResult.timestamp
    }
  } catch (error) {
    logger.error('Failed to load and import last save:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Start automatic save timer
 * @param {number} intervalMs - Interval in milliseconds
 */
export function startAutoSave(intervalMs = DEFAULT_SAVE_INTERVAL) {
  // Stop existing timer if any
  stopAutoSave()

  logger.log(`Starting auto-save with interval: ${intervalMs / 1000}s`)

  // Set up periodic save
  autoSaveTimer = setInterval(async () => {
    await performAutoSave()
  }, intervalMs)

  // Perform initial save
  performAutoSave().catch((error) => {
    logger.error('Initial auto-save failed:', error)
  })
}

/**
 * Stop automatic save timer
 */
export function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
    logger.log('Auto-save stopped')
  }
}

/**
 * Get last save timestamp
 * @returns {number|null}
 */
export function getLastSaveTimestamp() {
  const timestamp = localStorage.getItem(LAST_SAVE_KEY)
  return timestamp ? parseInt(timestamp, 10) : null
}

/**
 * Initialize auto-save system
 * @param {object} settings - Auto-save settings
 * @returns {Promise<void>}
 */
export async function initAutoSave(settings = {}) {
  if (!isFileSystemAccessSupported()) {
    logger.warn('File System Access API not supported - auto-save disabled')
    return
  }

  // Check if auto-save is enabled
  if (settings.enabled === false) {
    logger.log('Auto-save is disabled in settings')
    return
  }

  // Check if we have a valid directory handle
  if (currentDirectoryHandle) {
    const isValid = await verifyDirectoryHandle(currentDirectoryHandle)
    if (isValid) {
      // Start auto-save with configured interval
      const interval = settings.intervalMinutes
        ? settings.intervalMinutes * MS_PER_MINUTE
        : DEFAULT_SAVE_INTERVAL
      startAutoSave(interval)
    } else {
      currentDirectoryHandle = null
      logger.log('Directory handle invalid - user needs to configure')
    }
  } else {
    logger.log('No directory configured - user needs to set up auto-save')
  }
}

/**
 * Clean up old save files (keep only N most recent)
 * @param {number} keepCount - Number of files to keep
 * @returns {Promise<number>} Number of files deleted
 */
export async function cleanOldSaveFiles(keepCount = 10) {
  if (!currentDirectoryHandle) {
    throw new Error('No directory configured')
  }

  try {
    const files = []

    // Iterate through directory entries
    for await (const entry of currentDirectoryHandle.values()) {
      if (entry.kind === 'file' && entry.name.startsWith(SAVE_FILE_PREFIX)) {
        const file = await entry.getFile()
        files.push({
          name: entry.name,
          handle: entry,
          modified: file.lastModified
        })
      }
    }

    // Sort by modification time (newest first)
    files.sort((a, b) => b.modified - a.modified)

    // Delete old files
    let deletedCount = 0
    for (let i = keepCount; i < files.length; i++) {
      try {
        await currentDirectoryHandle.removeEntry(files[i].name)
        deletedCount++
        logger.log('Deleted old save file:', files[i].name)
      } catch (error) {
        logger.error('Failed to delete file:', files[i].name, error)
      }
    }

    return deletedCount
  } catch (error) {
    logger.error('Failed to clean old save files:', error)
    throw error
  }
}
