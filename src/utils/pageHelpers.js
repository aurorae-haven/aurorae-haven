// Export/Import + beforeunload only on real exit (suppress for internal nav)
import {
  getDataTemplate,
  importJSON as importData,
  reloadPageAfterDelay,
  IMPORT_SUCCESS_MESSAGE
} from './dataManager'
import { v4 as generateSecureUUID } from 'uuid'
import { createLogger } from './logger'
import {
  PAGE_RELOAD_DELAY_MS,
  TOAST_DISPLAY_DURATION_MS,
  NAV_PROMPT_SUPPRESS_WINDOW_MS
} from './uiConstants'
import { ISO_DATE_START_INDEX, ISO_DATE_END_INDEX } from './timeConstants'

const logger = createLogger('PageHelpers')
;(function () {
  let exported = false
  let suppressPrompt = false

  async function exportJSON() {
    const data = JSON.stringify(await getDataTemplate(), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Generate filename: aurorae_YYYY-MM-DD_UUID.json
    const date = new Date()
      .toISOString()
      .slice(ISO_DATE_START_INDEX, ISO_DATE_END_INDEX)
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
      await importData(file)
      exported = true // importing counts as having current data saved
      toast(IMPORT_SUCCESS_MESSAGE)

      // Use shared utility function for page reload
      reloadPageAfterDelay(PAGE_RELOAD_DELAY_MS)
    } catch (e) {
      logger.error(e)
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
    }, TOAST_DISPLAY_DURATION_MS)
  }

  // Detect internal navigation and suppress the prompt for that event
  function markInternalNav() {
    suppressPrompt = true
    setTimeout(() => {
      suppressPrompt = false
    }, NAV_PROMPT_SUPPRESS_WINDOW_MS)
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
