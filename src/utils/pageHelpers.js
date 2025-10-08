// Export/Import + beforeunload only on real exit (suppress for internal nav)
import { getDataTemplate, importJSON as importData } from './dataManager'
import { generateSecureUUID } from './uuidGenerator'
;(function () {
  let exported = false
  let suppressPrompt = false

  async function exportJSON() {
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
    exported = true
    toast(`Data exported (${filename})`)
  }

  async function importJSON(file) {
    try {
      const result = await importData(file)

      if (result.success) {
        exported = true // importing counts as having current data saved
        toast('Data imported successfully. Page will reload...')

        // Reload page after a short delay to show the updated data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast('Import failed: ' + result.message)
      }
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
