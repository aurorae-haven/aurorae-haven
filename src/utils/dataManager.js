// Data management utilities - Main entry point
// Re-exports from modular utilities for backward compatibility

// Export utilities
export { exportJSON, getDataTemplate, SCHEDULE_EVENT_TYPES } from './exportData'

// Import utilities
export {
  importJSON,
  IMPORT_SUCCESS_MESSAGE,
  reloadPageAfterDelay
} from './importData'

// Backup utilities
export { initAutoBackup, triggerManualBackup } from './autoBackup'

// Validation utilities (if needed externally)
export { validateExportData, validateImportData } from './validation'
