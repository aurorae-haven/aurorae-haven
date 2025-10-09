// Automatic backup utilities
import { isIndexedDBAvailable, saveBackup, cleanOldBackups } from './indexedDBManager'
import { getDataTemplate } from './exportData'

// ARC-DAT-03: Automatic backup configuration
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
const MAX_BACKUPS = 10
const LAST_BACKUP_KEY = 'aurorae_last_backup'

/**
 * Initialize automatic backup system
 * Checks if backup is needed and performs it if necessary
 * @returns {Promise<void>}
 */
export async function initAutoBackup() {
  if (!isIndexedDBAvailable()) {
    console.log('Auto-backup: IndexedDB not available, skipping auto-backup')
    return
  }

  try {
    const lastBackup = localStorage.getItem(LAST_BACKUP_KEY)
    const now = Date.now()

    // Check if enough time has passed since last backup
    if (lastBackup) {
      const lastBackupTime = parseInt(lastBackup, 10)
      const timeSinceBackup = now - lastBackupTime

      if (timeSinceBackup < BACKUP_INTERVAL) {
        console.log(
          `Auto-backup: Next backup in ${Math.round((BACKUP_INTERVAL - timeSinceBackup) / (60 * 60 * 1000))} hours`
        )
        return
      }
    }

    // Perform automatic backup
    await performAutoBackup()
  } catch (e) {
    console.error('Auto-backup initialization failed:', e)
  }
}

/**
 * Perform automatic backup (internal function)
 * @returns {Promise<void>}
 */
async function performAutoBackup() {
  try {
    const data = await getDataTemplate()
    await saveBackup(data)
    await cleanOldBackups(MAX_BACKUPS)
    localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString())
    console.log('Auto-backup completed successfully')
  } catch (e) {
    console.error('Auto-backup failed:', e)
  }
}

/**
 * Trigger manual backup immediately
 * @returns {Promise<boolean>} True if backup succeeded
 * @throws {Error} If backup fails
 */
export async function triggerManualBackup() {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB not available for backups')
  }

  try {
    await performAutoBackup()
    return true
  } catch (e) {
    console.error('Manual backup failed:', e)
    throw new Error('Manual backup failed: ' + e.message)
  }
}
