// Automatic backup utilities
import {
  isIndexedDBAvailable,
  saveBackup,
  cleanOldBackups
} from './indexedDBManager'
import { getDataTemplate } from './exportData'
import { MS_PER_DAY } from './timeConstants'
import { createLogger } from './logger'

const logger = createLogger('AutoBackup')

// ARC-DAT-03: Automatic backup configuration
const BACKUP_INTERVAL = MS_PER_DAY // 24 hours
const MAX_BACKUPS = 10
const LAST_BACKUP_KEY = 'aurorae_last_backup'

/**
 * Initialize automatic backup system
 * Checks if backup is needed and performs it if necessary
 * @returns {Promise<void>}
 */
export async function initAutoBackup() {
  if (!isIndexedDBAvailable()) {
    logger.log('IndexedDB not available, skipping auto-backup')
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
        logger.log(
          `Next backup in ${Math.round((BACKUP_INTERVAL - timeSinceBackup) / (60 * 60 * 1000))} hours`
        )
        return
      }
    }

    // Perform automatic backup
    await performAutoBackup()
  } catch (e) {
    logger.error('Initialization failed:', e)
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
    logger.log('Backup completed successfully')
  } catch (e) {
    logger.error('Backup failed:', e)
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
    logger.error('Manual backup failed:', e)
    throw new Error('Manual backup failed: ' + e.message)
  }
}
