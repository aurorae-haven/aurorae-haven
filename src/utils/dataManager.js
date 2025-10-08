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

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: mainData.tasks || [],
    sequences: mainData.sequences || [],
    habits: mainData.habits || [],
    dumps: mainData.dumps || [],
    schedule: schedule.length > 0 ? schedule : mainData.schedule || [],
    brainDump: {
      content: brainDumpContent,
      tags: brainDumpTags,
      versions: brainDumpVersions,
      entries: brainDumpEntries
    }
  }
}

export async function exportJSON() {
  const data = JSON.stringify(await getDataTemplate(), null, 2)
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
}

export async function importJSON(file) {
  try {
    const text = await file.text()
    const obj = JSON.parse(text)

    // Validate schema
    if (!obj.version) {
      throw new Error('Invalid schema: missing version')
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

    return { success: true, message: 'Data imported successfully' }
  } catch (e) {
    console.error(e)
    return { success: false, message: 'Import failed: ' + e.message }
  }
}
