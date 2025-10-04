// Data management utilities for export/import functionality

// Storage keys
const OLD_STORAGE_KEY = 'stellar_journey_data'
const NEW_STORAGE_KEY = 'aurorae_haven_data'

/**
 * Migrate data from old storage key to new storage key
 * This ensures existing users don't lose their data when we change the key
 */
export function migrateStorageKey() {
  try {
    // Check if new key already has data
    const newData = localStorage.getItem(NEW_STORAGE_KEY)
    if (newData) {
      // New key already exists, no migration needed
      return { migrated: false, reason: 'new_key_exists' }
    }

    // Check if old key has data
    const oldData = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldData) {
      // Migrate: copy old data to new key
      localStorage.setItem(NEW_STORAGE_KEY, oldData)
      // Remove old key after successful migration
      localStorage.removeItem(OLD_STORAGE_KEY)
      return { migrated: true, reason: 'migration_complete' }
    }

    // Neither key exists, no migration needed
    return { migrated: false, reason: 'no_data_found' }
  } catch (e) {
    console.error('Migration error:', e)
    return { migrated: false, reason: 'error', error: e.message }
  }
}

export function getDataTemplate() {
  return {
    version: 1,
    tasks: [{ id: 1, title: 'Email report', done: false }],
    sequences: [
      {
        id: 'seq_1',
        name: 'Morning Launch',
        steps: [
          { label: 'Water', sec: 30 },
          { label: 'Meds', sec: 90 },
          { label: 'Stretch', sec: 300 }
        ]
      }
    ],
    habits: [{ id: 'hab_1', name: 'Read 10m', streak: 4, paused: false }],
    dumps: [{ id: 'dump_1', ts: Date.now(), text: 'Idea: export reminder.' }],
    schedule: [
      {
        day: new Date().toISOString().slice(0, 10),
        blocks: [
          { type: 'sequence', ref: 'seq_1', start: '07:00', dur_min: 30 }
        ]
      }
    ]
  }
}

export function exportJSON() {
  const data = JSON.stringify(getDataTemplate(), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'aurorae_haven_data.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
  return true
}

export async function importJSON(file) {
  try {
    const text = await file.text()
    const obj = JSON.parse(text)

    // Minimal validation
    if (
      !obj.version ||
      !Array.isArray(obj.tasks) ||
      !Array.isArray(obj.sequences)
    ) {
      throw new Error('Invalid schema')
    }

    // Store in localStorage for persistence using new key
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(obj))
    return { success: true, message: 'Data imported successfully' }
  } catch (e) {
    console.error(e)
    return { success: false, message: 'Import failed: ' + e.message }
  }
}
