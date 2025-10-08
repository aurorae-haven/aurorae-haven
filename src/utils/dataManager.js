// Data management utilities for export/import functionality
import { generateSecureUUID } from './uuidGenerator'
import {
  exportAllData as exportFromIndexedDB,
  importAllData as importToIndexedDB,
  isIndexedDBAvailable,
  saveBackup,
  cleanOldBackups
} from './indexedDBManager'

// ARC-DAT-03: Automatic backup configuration
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
const MAX_BACKUPS = 10
const LAST_BACKUP_KEY = 'aurorae_last_backup'

// Data schema field names - centralized to prevent drift
const DATA_FIELDS = {
  TASKS: 'tasks',
  SEQUENCES: 'sequences',
  HABITS: 'habits',
  DUMPS: 'dumps',
  SCHEDULE: 'schedule'
}

// Array of all array fields for validation
const ARRAY_FIELDS = Object.values(DATA_FIELDS)

// Schedule event types - used for type field in schedule blocks
export const SCHEDULE_EVENT_TYPES = {
  TASK: 'task',
  SEQUENCE: 'sequence',
  BREAK: 'break',
  MEETING: 'meeting'
}

// Validation types for field definitions
const VALIDATION_TYPES = {
  STRING: 'string',
  ARRAY: 'array'
}

// BrainDump field type definitions for validation
const BRAIN_DUMP_FIELDS = {
  content: VALIDATION_TYPES.STRING,
  tags: VALIDATION_TYPES.STRING,
  versions: VALIDATION_TYPES.ARRAY,
  entries: VALIDATION_TYPES.ARRAY
}

/**
 * ARC-DAT-03: Initialize automatic backup system
 * Should be called when the app loads
 */
export async function initAutoBackup() {
  if (!isIndexedDBAvailable()) {
    console.warn('IndexedDB not available, auto-backup disabled')
    return
  }

  // Check if backup is needed
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY)
  const lastBackupTime = lastBackup ? parseInt(lastBackup, 10) : 0
  const now = Date.now()

  if (now - lastBackupTime >= BACKUP_INTERVAL) {
    try {
      await performAutoBackup()
    } catch (e) {
      console.error('Auto-backup failed:', e)
    }
  }

  // Schedule next backup check (every hour)
  setInterval(
    async () => {
      const lastBackup = localStorage.getItem(LAST_BACKUP_KEY)
      const lastBackupTime = lastBackup ? parseInt(lastBackup, 10) : 0
      const now = Date.now()

      if (now - lastBackupTime >= BACKUP_INTERVAL) {
        try {
          await performAutoBackup()
        } catch (e) {
          console.error('Auto-backup failed:', e)
        }
      }
    },
    60 * 60 * 1000
  ) // Check every hour
}

/**
 * ARC-DAT-03: Perform automatic backup
 */
async function performAutoBackup() {
  const data = await getDataTemplate()
  await saveBackup(data)
  await cleanOldBackups(MAX_BACKUPS)
  localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString())
  console.log('Auto-backup completed at', new Date().toISOString())
}

/**
 * ARC-DAT-03: Manually trigger backup
 * @returns {Promise<boolean>}
 */
export async function triggerManualBackup() {
  if (!isIndexedDBAvailable()) {
    return false
  }

  try {
    await performAutoBackup()
    return true
  } catch (e) {
    console.error('Manual backup failed:', e)
    return false
  }
}

/**
 * Get data template from storage
 * Uses IndexedDB if available, falls back to localStorage
 * @returns {Promise<object>}
 */
export async function getDataTemplate() {
  // ARC-DAT-01: Use IndexedDB if available
  if (isIndexedDBAvailable()) {
    try {
      return await exportFromIndexedDB()
    } catch (e) {
      console.warn(
        'Failed to export from IndexedDB, falling back to localStorage:',
        e
      )
    }
  }

  // Fallback to localStorage (backward compatibility)
  const brainDumpContent = localStorage.getItem('brainDumpContent') || ''
  const brainDumpTags = localStorage.getItem('brainDumpTags') || ''

  // Parse version history if available
  let brainDumpVersions = []
  try {
    const versionsData = localStorage.getItem('brainDumpVersions')
    brainDumpVersions = versionsData ? JSON.parse(versionsData) : []
  } catch (e) {
    console.warn('Failed to parse brainDumpVersions:', e)
  }

  // Parse brain dump entries if available
  let brainDumpEntries = []
  try {
    const entriesData = localStorage.getItem('brainDumpEntries')
    brainDumpEntries = entriesData ? JSON.parse(entriesData) : []
  } catch (e) {
    console.warn('Failed to parse brainDumpEntries:', e)
  }

  // Parse schedule data if available
  let schedule = []
  try {
    const scheduleData = localStorage.getItem('sj.schedule.events')
    schedule = scheduleData ? JSON.parse(scheduleData) : []
  } catch (e) {
    console.warn('Failed to parse schedule data:', e)
  }

  // Parse main data store if available
  let mainData = {}
  try {
    const mainDataStr = localStorage.getItem('aurorae_haven_data')
    mainData = mainDataStr ? JSON.parse(mainDataStr) : {}
  } catch (e) {
    console.warn('Failed to parse main data:', e)
  }

  // Parse tasks from aurorae_tasks (Eisenhower matrix format)
  let auroraeTasksData = null
  try {
    const tasksStr = localStorage.getItem('aurorae_tasks')
    auroraeTasksData = tasksStr ? JSON.parse(tasksStr) : null
  } catch (e) {
    console.warn('Failed to parse aurorae_tasks:', e)
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: mainData.tasks || [],
    sequences: mainData.sequences || [],
    habits: mainData.habits || [],
    dumps: mainData.dumps || [],
    schedule: schedule.length > 0 ? schedule : mainData.schedule || [],
    auroraeTasksData: auroraeTasksData,
    brainDump: {
      content: brainDumpContent,
      tags: brainDumpTags,
      versions: brainDumpVersions,
      entries: brainDumpEntries
    }
  }
}

/**
 * Helper function to validate field type
 * @param {*} value - Value to validate
 * @param {string} expectedType - Expected type ('string' or 'array')
 * @returns {boolean} True if valid
 */
function isValidFieldType(value, expectedType) {
  if (expectedType === 'string') {
    return typeof value === 'string'
  }
  if (expectedType === 'array') {
    return Array.isArray(value)
  }
  return false
}

/**
 * Validate object fields against a configuration object mapping field names to expected types
 * @param {object} obj - Object to validate
 * @param {object} fieldsConfig - Field configuration (object mapping field names to expected types)
 * @param {string} prefix - Prefix for error messages (e.g., 'brainDump.')
 * @returns {string[]} Array of error messages
 */
function validateObjectFields(obj, fieldsConfig, prefix = '') {
  const errors = []
  for (const [field, expectedType] of Object.entries(fieldsConfig)) {
    if (
      obj[field] !== undefined &&
      !isValidFieldType(obj[field], expectedType)
    ) {
      errors.push(
        `Invalid type for ${prefix}${field}: expected ${expectedType}`
      )
    }
  }
  return errors
}

/**
 * Validate object fields against an array of field names with a single expected type
 * @param {object} obj - Object to validate
 * @param {string[]} fieldNames - Array of field names
 * @param {string} expectedType - Expected type for all fields
 * @param {string} prefix - Prefix for error messages (optional)
 * @returns {string[]} Array of error messages
 */
function validateArrayFields(obj, fieldNames, expectedType, prefix = '') {
  const errors = []
  for (const field of fieldNames) {
    if (obj[field] !== undefined && !isValidFieldType(obj[field], expectedType)) {
      errors.push(`Invalid type for ${prefix}${field}: expected ${expectedType}`)
    }
  }
  return errors
}

/**
 * Validate export data before serialization
 * @param {object} data - Data object to validate
 * @returns {{valid: boolean, errors: string[], stringified: string|null}}
 */
function validateExportData(data) {
  const errors = []

  // Check for required fields
  if (!data.version) {
    errors.push('Export data missing version field')
  }

  // Check for circular references by attempting serialization test
  // Cache the stringified result to avoid double serialization
  let stringified = null
  try {
    stringified = JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('Serialization error in export data:', error)
    errors.push('Export data contains circular references or non-serializable values')
  }
  return {
    valid: errors.length === 0,
    errors,
    stringified
  }
}

export async function exportJSON() {
  try {
    const dataTemplate = await getDataTemplate()

    // Validate data before export (includes serialization test)
    const validation = validateExportData(dataTemplate)
    if (!validation.valid) {
      throw new Error(`Export validation failed: ${validation.errors.join(', ')}`)
    }

    // Serialize data for export (independent of validation formatting)
    const data = JSON.stringify(dataTemplate, null, 2) // Use pretty-printing for export; change as needed
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

/**
 * @typedef {Object} ValidateImportResult
 * @property {boolean} valid - Whether the import data is valid
 * @property {string[]} errors - List of validation error messages
 */
/**
 * Validate import data structure
 * @param {object} obj - Parsed JSON object
 * @returns {ValidateImportResult}
 */
function validateImportData(obj) {
  const errors = []

  // Check version
  if (!obj.version) {
    errors.push('Missing required field: version')
  } else if (typeof obj.version !== 'number') {
    errors.push('Invalid type for version: expected number')
  }

  // Validate top-level array fields using reusable helper
  errors.push(...validateArrayFields(obj, ARRAY_FIELDS, 'array'))

  // Validate brainDump structure if present
  if (obj.brainDump !== undefined) {
    if (typeof obj.brainDump !== 'object' || obj.brainDump === null) {
      errors.push('Invalid type for brainDump: expected object')
    } else {
      // Validate brainDump fields using reusable helper
      errors.push(...validateObjectFields(obj.brainDump, BRAIN_DUMP_FIELDS, 'brainDump.'))
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export async function importJSON(file) {
  try {
    const text = await file.text()
    const obj = JSON.parse(text)

    // Validate schema
    const validation = validateImportData(obj)
    if (!validation.valid) {
      throw new Error('Invalid schema: ' + validation.errors.join(', '))
    }

    // ARC-DAT-01: Use IndexedDB if available
    if (isIndexedDBAvailable()) {
      const result = await importToIndexedDB(obj)
      if (result.success) {
        return { success: true, message: 'Data imported successfully' }
      } else {
        throw new Error(result.errors.join(', '))
      }
    }

    // Fallback to localStorage (backward compatibility)
    // Validate arrays (use default empty arrays if missing)
    const tasks = Array.isArray(obj.tasks) ? obj.tasks : []
    const sequences = Array.isArray(obj.sequences) ? obj.sequences : []
    const habits = Array.isArray(obj.habits) ? obj.habits : []
    const dumps = Array.isArray(obj.dumps) ? obj.dumps : []
    const schedule = Array.isArray(obj.schedule) ? obj.schedule : []

    // Store main data
    const mainData = {
      version: obj.version,
      tasks,
      sequences,
      habits,
      dumps,
      schedule
    }
    localStorage.setItem('aurorae_haven_data', JSON.stringify(mainData))

    // Import Brain Dump data if available
    if (obj.brainDump && typeof obj.brainDump === 'object') {
      // Import content
      if (typeof obj.brainDump.content === 'string') {
        localStorage.setItem('brainDumpContent', obj.brainDump.content)
      }

      // Import tags
      if (typeof obj.brainDump.tags === 'string') {
        localStorage.setItem('brainDumpTags', obj.brainDump.tags)
      }

      // Import version history
      if (Array.isArray(obj.brainDump.versions)) {
        localStorage.setItem(
          'brainDumpVersions',
          JSON.stringify(obj.brainDump.versions)
        )
      }

      // Import entries
      if (Array.isArray(obj.brainDump.entries)) {
        localStorage.setItem(
          'brainDumpEntries',
          JSON.stringify(obj.brainDump.entries)
        )
      }
    }

    // Import schedule data to separate key if available
    if (schedule.length > 0) {
      localStorage.setItem('sj.schedule.events', JSON.stringify(schedule))
    }

    // Import tasks to aurorae_tasks (Eisenhower matrix format)
    if (obj.auroraeTasksData && typeof obj.auroraeTasksData === 'object') {
      localStorage.setItem('aurorae_tasks', JSON.stringify(obj.auroraeTasksData))
    }

    return { success: true, message: 'Data imported successfully' }
  } catch (e) {
    console.error(e)
    return { success: false, message: 'Import failed: ' + e.message }
  }
}
