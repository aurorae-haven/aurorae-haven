// Export/Import + beforeunload only on real exit (suppress for internal nav)
import { getDataTemplate } from './dataManager'
import { generateSecureUUID } from './uuidGenerator'
;(function () {
  let exported = false
  let suppressPrompt = false

  function exportJSON() {
    const data = JSON.stringify(getDataTemplate(), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Generate filename: YYYY-MM-DD_UUID.json
    const date = new Date().toISOString().split('T')[0]
    const uuid = generateSecureUUID()
    const filename = `${date}_${uuid}.json`
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    exported = true
    toast(`Data exported (${filename})`)
  }

  async function importJSON(file) {
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

      window.__SJ_DATA__ = obj
      exported = true // importing counts as having current data saved
      toast('Data imported successfully. Page will reload...')

      // Reload page after a short delay to show the updated data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (e) {
      console.error(e)
      toast('Import failed: ' + e.message)
    }
  }

  function toast(msg) {
    const t = document.getElementById('toast')
    if (!t) return
    t.textContent = msg
    t.style.display = 'block'
    setTimeout(() => {
      t.style.display = 'none'
    }, 3800)
  }

  // Detect internal navigation and suppress the prompt for that event
  function markInternalNav() {
    suppressPrompt = true
    setTimeout(() => {
      suppressPrompt = false
    }, 2000) // safety window
  }

  window.AuroraeIO = { exportJSON, importJSON }
  window.addEventListener('beforeunload', function (e) {
    // If navigating via internal links/buttons (we mark it), don't prompt
    if (suppressPrompt) return
    if (!exported) {
      e.preventDefault()
      e.returnValue = ''
      toast('Heads-up: export your data before leaving.')
      return ''
    }
  })

  // Attach to all internal nav anchors
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[data-nav="internal"]').forEach((a) => {
      a.addEventListener('click', markInternalNav, { capture: true })
    })
  })
})()
