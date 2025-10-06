// Data management utilities for export/import functionality

export function getDataTemplate() {
  // Collect real data from localStorage
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

export function exportJSON() {
  const data = JSON.stringify(getDataTemplate(), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  // Generate filename: YYYY-MM-DD_UUID.json
  const date = new Date().toISOString().split('T')[0]
  const uuid =
    typeof window.crypto !== 'undefined' && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).substring(2)
  const filename = `${date}_${uuid}.json`
  
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
