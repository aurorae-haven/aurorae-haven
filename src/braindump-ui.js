// Brain Dump UI - Main interface logic
// Extracted from inline script to comply with CSP

import {
  configureSanitization,
  VersionHistory,
  Backlinks,
  FileAttachments,
  AccessibilityHelper
} from '../braindump-enhanced.js'

document.addEventListener('DOMContentLoaded', () => {
  const editor = document.querySelector('textarea')
  const preview = document.getElementById('preview')
  const tagPalette = document.querySelector('.tag-palette')
  const toolbar = document.querySelector('.toolbar')

  // Initialize enhanced features
  const sanitizationConfig = configureSanitization()
  const versionHistory = new VersionHistory()
  const backlinks = new Backlinks()
  const fileAttachments = new FileAttachments()

  // TAB-BDP-ACC-01: Add accessibility labels
  AccessibilityHelper.addAriaLabels(editor, preview)

  // Initialize OPFS
  fileAttachments.initialize().catch((err) => {
    console.warn('OPFS initialization failed:', err)
  })

  // Load saved content
  editor.value = localStorage.getItem('brainDumpContent') || ''
  tagPalette.innerHTML = localStorage.getItem('brainDumpTags') || ''

  // TAB-BDP-SAN-01: Render Markdown with enhanced sanitization
  const renderMarkdown = () => {
    const raw = editor.value

    // TAB-BDP-BLK-01: Process backlinks before markdown
    const processedContent = backlinks.renderLinks(raw)

    const html = marked.parse(processedContent, { gfm: true, breaks: true })
    preview.innerHTML = DOMPurify.sanitize(html, sanitizationConfig)

    syncCheckboxes()
    attachBacklinkHandlers()

    // TAB-BDP-ACC-01: Announce to screen readers
    AccessibilityHelper.announceToScreenReader('Preview updated')
  }

  // TAB-BDP-BLK-01: Handle backlink clicks
  const attachBacklinkHandlers = () => {
    preview.querySelectorAll('.backlink').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const linkText = link.getAttribute('data-backlink')
        AccessibilityHelper.announceToScreenReader(`Navigating to ${linkText}`)
        // Here you could implement navigation to the linked note
        console.log('Navigate to:', linkText)
      })
    })
  }

  // Sync checkboxes with editor
  const syncCheckboxes = () => {
    preview.querySelectorAll("input[type='checkbox']").forEach((box, i) => {
      box.setAttribute('aria-label', `Task checkbox ${i + 1}`)
      box.addEventListener('change', () => {
        const lines = editor.value.split('\n')
        let count = 0
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].match(/^\s*[-*]\s*\[.\]/)) {
            if (count === i) {
              lines[j] = lines[j].replace(/\[.\]/, box.checked ? '[x]' : '[ ]')
              break
            }
            count++
          }
        }
        editor.value = lines.join('\n')
        localStorage.setItem('brainDumpContent', editor.value)

        // TAB-BDP-VSH-01: Save version on checkbox change
        versionHistory.save(editor.value)

        renderMarkdown()
        AccessibilityHelper.announceToScreenReader(
          box.checked ? 'Task marked complete' : 'Task marked incomplete'
        )
      })
    })
  }

  // Autosave with version history
  let saveTimeout
  editor.addEventListener('input', () => {
    localStorage.setItem('brainDumpContent', editor.value)
    renderMarkdown()

    // TAB-BDP-VSH-01: Debounced version save
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      versionHistory.save(editor.value)
    }, 5000) // Save version every 5 seconds of inactivity
  })

  // Auto-list continuation on Enter key
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const cursorPos = editor.selectionStart
      const textBeforeCursor = editor.value.substring(0, cursorPos)
      const lines = textBeforeCursor.split('\n')
      const currentLine = lines[lines.length - 1]

      // Match different list patterns
      const taskListMatch = currentLine.match(
        /^(\s*)([-*])\s+\[([ x])\]\s*(.*)$/
      )
      const bulletListMatch = currentLine.match(/^(\s*)([-*])\s+(.*)$/)
      const numberedListMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/)

      if (taskListMatch) {
        const [, indent, marker, checked, content] = taskListMatch
        if (content.trim() === '') {
          // Empty task list item - remove it
          e.preventDefault()
          const lineStart =
            textBeforeCursor.lastIndexOf('\n', cursorPos - 1) + 1
          const newValue =
            editor.value.substring(0, lineStart) +
            editor.value.substring(cursorPos)
          editor.value = newValue
          editor.selectionStart = editor.selectionEnd = lineStart
          localStorage.setItem('brainDumpContent', editor.value)
          renderMarkdown()
        } else {
          // Continue task list
          e.preventDefault()
          const newItem = `\n${indent}${marker} [ ] `
          const newValue =
            editor.value.substring(0, cursorPos) +
            newItem +
            editor.value.substring(cursorPos)
          editor.value = newValue
          editor.selectionStart = editor.selectionEnd =
            cursorPos + newItem.length
          localStorage.setItem('brainDumpContent', editor.value)
          renderMarkdown()
        }
      } else if (bulletListMatch) {
        const [, indent, marker, content] = bulletListMatch
        if (content.trim() === '') {
          e.preventDefault()
          const lineStart =
            textBeforeCursor.lastIndexOf('\n', cursorPos - 1) + 1
          const newValue =
            editor.value.substring(0, lineStart) +
            editor.value.substring(cursorPos)
          editor.value = newValue
          editor.selectionStart = editor.selectionEnd = lineStart
          localStorage.setItem('brainDumpContent', editor.value)
          renderMarkdown()
        } else {
          e.preventDefault()
          const newItem = `\n${indent}${marker} `
          const newValue =
            editor.value.substring(0, cursorPos) +
            newItem +
            editor.value.substring(cursorPos)
          editor.value = newValue
          editor.selectionStart = editor.selectionEnd =
            cursorPos + newItem.length
          localStorage.setItem('brainDumpContent', editor.value)
          renderMarkdown()
        }
      } else if (numberedListMatch) {
        const [, indent, number, content] = numberedListMatch
        if (content.trim() === '') {
          e.preventDefault()
          const lineStart =
            textBeforeCursor.lastIndexOf('\n', cursorPos - 1) + 1
          const newValue =
            editor.value.substring(0, lineStart) +
            editor.value.substring(cursorPos)
          editor.value = newValue
          editor.selectionStart = editor.selectionEnd = lineStart
          localStorage.setItem('brainDumpContent', editor.value)
          renderMarkdown()
        } else {
          e.preventDefault()
          const nextNumber = parseInt(number) + 1
          const newItem = `\n${indent}${nextNumber}. `
          const newValue =
            editor.value.substring(0, cursorPos) +
            newItem +
            editor.value.substring(cursorPos)
          editor.value = newValue
          editor.selectionStart = editor.selectionEnd =
            cursorPos + newItem.length
          localStorage.setItem('brainDumpContent', editor.value)
          renderMarkdown()
        }
      }
    }
  })

  // Observe tag changes
  const observer = new MutationObserver(() => {
    localStorage.setItem('brainDumpTags', tagPalette.innerHTML)
  })
  observer.observe(tagPalette, { childList: true, subtree: true })

  // Initial render
  renderMarkdown()

  // Add Clear All button
  const clearBtn = document.createElement('button')
  clearBtn.textContent = '🧹 Clear All'
  clearBtn.className = 'btn'
  clearBtn.setAttribute('aria-label', 'Clear all content and tags')
  clearBtn.onclick = () => {
    if (confirm('Clear all content and tags?')) {
      editor.value = ''
      tagPalette.innerHTML = ''
      localStorage.removeItem('brainDumpContent')
      localStorage.removeItem('brainDumpTags')
      renderMarkdown()
      AccessibilityHelper.announceToScreenReader('All content cleared')
    }
  }

  // Add Export button
  const exportBtn = document.createElement('button')
  exportBtn.textContent = '📤 Export'
  exportBtn.className = 'btn'
  exportBtn.setAttribute('aria-label', 'Export brain dump as markdown')
  exportBtn.onclick = () => {
    const blob = new Blob([editor.value], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'brain_dump.md'
    a.click()
    AccessibilityHelper.announceToScreenReader('Markdown exported')
  }

  // TAB-BDP-VSH-01: Add Version History button
  const versionBtn = document.createElement('button')
  versionBtn.textContent = '📜 History'
  versionBtn.className = 'btn'
  versionBtn.setAttribute('aria-label', 'View version history')
  versionBtn.onclick = () => {
    showVersionHistory()
  }

  // TAB-BDP-BLK-01: Add Backlinks button
  const backlinksBtn = document.createElement('button')
  backlinksBtn.textContent = '🔗 Backlinks'
  backlinksBtn.className = 'btn'
  backlinksBtn.setAttribute('aria-label', 'View backlinks')
  backlinksBtn.onclick = () => {
    showBacklinks()
  }

  // TAB-BDP-FIL-01: Add Attach File button
  const attachBtn = document.createElement('button')
  attachBtn.textContent = '📎 Attach'
  attachBtn.className = 'btn'
  attachBtn.setAttribute('aria-label', 'Attach file')
  attachBtn.onclick = () => {
    attachFile()
  }

  toolbar.appendChild(clearBtn)
  toolbar.appendChild(exportBtn)
  toolbar.appendChild(versionBtn)
  toolbar.appendChild(backlinksBtn)
  toolbar.appendChild(attachBtn)

  // TAB-BDP-VSH-01: Show version history modal
  function showVersionHistory () {
    const versions = versionHistory.getAll()

    if (versions.length === 0) {
      alert('No version history available')
      return
    }

    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-label', 'Version History')
    modal.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;'

    const content = document.createElement('div')
    content.className = 'modal-content card'
    content.style.cssText =
      'max-width:600px;max-height:80vh;overflow-y:auto;padding:20px;'

    const header = document.createElement('h2')
    header.textContent = 'Version History'
    content.appendChild(header)

    const list = document.createElement('div')
    versions.forEach((version, index) => {
      const item = document.createElement('div')
      item.style.cssText =
        'padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:4px;'

      const date = new Date(version.timestamp)
      const dateStr = date.toLocaleString()

      item.innerHTML = `
        <div style="font-weight:600">${dateStr}</div>
        <div style="margin:5px 0;color:#666;">${version.preview}...</div>
        <button class="btn" style="margin-right:5px;" data-action="restore" data-id="${version.id}">Restore</button>
        <button class="btn" data-action="diff" data-id="${version.id}">View Diff</button>
      `

      list.appendChild(item)
    })

    content.appendChild(list)

    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Close'
    closeBtn.className = 'btn'
    closeBtn.onclick = () => document.body.removeChild(modal)
    content.appendChild(closeBtn)

    modal.appendChild(content)
    document.body.appendChild(modal)

    // Handle restore and diff buttons
    list.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'restore') {
        const id = parseInt(e.target.dataset.id)
        const content = versionHistory.restore(id)
        if (content !== null) {
          editor.value = content
          localStorage.setItem('brainDumpContent', editor.value)
          renderMarkdown()
          document.body.removeChild(modal)
          AccessibilityHelper.announceToScreenReader('Version restored')
        }
      } else if (e.target.dataset.action === 'diff') {
        const id = parseInt(e.target.dataset.id)
        const version = versionHistory.getById(id)
        if (version) {
          showDiff(version.content, editor.value)
        }
      }
    })

    // Close on escape
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal)
      }
    })
  }

  // Show diff viewer
  function showDiff (oldContent, newContent) {
    const diff = versionHistory.generateDiff(oldContent, newContent)

    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-label', 'Version Diff')
    modal.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1001;'

    const content = document.createElement('div')
    content.className = 'modal-content card'
    content.style.cssText =
      'max-width:800px;max-height:80vh;overflow-y:auto;padding:20px;'

    const header = document.createElement('h2')
    header.textContent = 'Version Diff'
    content.appendChild(header)

    const diffView = document.createElement('pre')
    diffView.style.cssText =
      'font-family:monospace;font-size:12px;white-space:pre-wrap;'

    diff.forEach((item) => {
      const line = document.createElement('div')
      if (item.type === 'added') {
        line.style.cssText =
          'background:#d4edda;color:#155724;padding:2px 5px;'
        line.textContent = '+ ' + item.line
      } else if (item.type === 'removed') {
        line.style.cssText =
          'background:#f8d7da;color:#721c24;padding:2px 5px;'
        line.textContent = '- ' + item.line
      } else {
        line.style.cssText = 'padding:2px 5px;'
        line.textContent = '  ' + item.line
      }
      diffView.appendChild(line)
    })

    content.appendChild(diffView)

    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Close'
    closeBtn.className = 'btn'
    closeBtn.onclick = () => document.body.removeChild(modal)
    content.appendChild(closeBtn)

    modal.appendChild(content)
    document.body.appendChild(modal)

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal)
      }
    })
  }

  // TAB-BDP-BLK-01: Show backlinks panel
  function showBacklinks () {
    const links = backlinks.extractLinks(editor.value)

    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-label', 'Backlinks')
    modal.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;'

    const content = document.createElement('div')
    content.className = 'modal-content card'
    content.style.cssText =
      'max-width:600px;max-height:80vh;overflow-y:auto;padding:20px;'

    const header = document.createElement('h2')
    header.textContent = 'Backlinks'
    content.appendChild(header)

    if (links.length === 0) {
      const empty = document.createElement('p')
      empty.textContent =
        'No backlinks found. Use [[link text]] syntax to create links.'
      content.appendChild(empty)
    } else {
      const list = document.createElement('ul')
      list.style.cssText = 'list-style:none;padding:0;'

      links.forEach((link) => {
        const item = document.createElement('li')
        item.style.cssText =
          'padding:10px;margin:5px 0;border:1px solid #ccc;border-radius:4px;'
        item.textContent = `🔗 ${link.text}`
        list.appendChild(item)
      })

      content.appendChild(list)
    }

    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Close'
    closeBtn.className = 'btn'
    closeBtn.onclick = () => document.body.removeChild(modal)
    content.appendChild(closeBtn)

    modal.appendChild(content)
    document.body.appendChild(modal)

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal)
      }
    })
  }

  // TAB-BDP-FIL-01: Attach file functionality
  function attachFile () {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = false
    input.setAttribute('aria-label', 'Select file to attach')

    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        await fileAttachments.initialize()
        const result = await fileAttachments.saveFile(file.name, file)

        // Insert reference to file in editor
        const fileRef = `\n\n📎 Attachment: ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n`
        const cursorPos = editor.selectionStart
        editor.value =
          editor.value.substring(0, cursorPos) +
          fileRef +
          editor.value.substring(cursorPos)
        localStorage.setItem('brainDumpContent', editor.value)
        renderMarkdown()

        AccessibilityHelper.announceToScreenReader(
          `File ${file.name} attached`
        )
      } catch (err) {
        alert('Failed to attach file: ' + err.message)
        console.error('File attachment error:', err)
      }
    }

    input.click()
  }

  // TAB-BDP-ACC-01: Setup keyboard shortcuts
  AccessibilityHelper.setupKeyboardNavigation(document, {
    s: (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        exportBtn.click()
      }
    },
    h: (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        versionBtn.click()
      }
    }
  })
})
