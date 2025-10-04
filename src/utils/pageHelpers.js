// Export/Import + beforeunload only on real exit (suppress for internal nav)
import { getDataTemplate } from './dataManager'
;(function () {
  let exported = false
  let suppressPrompt = false

  function exportJSON() {
    const data = JSON.stringify(getDataTemplate(), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'aurorae_haven_data.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
    exported = true
    toast('Data exported (aurorae_haven_data.json)')
  }

  async function importJSON(file) {
    try {
      const text = await file.text()
      const obj = JSON.parse(text)
      // minimal validation
      if (
        !obj.version ||
        !Array.isArray(obj.tasks) ||
        !Array.isArray(obj.sequences)
      ) {
        throw new Error('Invalid schema')
      }
      // store in memory (mock); in real app, write to localStorage/db
      window.__SJ_DATA__ = obj
      localStorage.setItem('aurorae_haven_data', JSON.stringify(obj))
      exported = true // importing counts as having current data saved
      toast('Data imported successfully')
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
  function markInternalNav(e) {
    suppressPrompt = true
    setTimeout(() => {
      suppressPrompt = false
    }, 2000) // safety window
  }

  window.StellarIO = { exportJSON, importJSON }
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
