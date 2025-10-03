document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor')
  const preview = document.getElementById('preview')
  const tagPalette = document.querySelector('.tag-palette')
  const clearBtn = document.getElementById('clearBtn')
  const exportBtn = document.getElementById('exportBtn')

  // Load marked.js and DOMPurify
  const renderer = new marked.Renderer()
  marked.setOptions({ gfm: true, breaks: true, renderer })

  // Load saved content
  if (localStorage.getItem('brainDumpContent')) {
    editor.value = localStorage.getItem('brainDumpContent')
  }
  if (localStorage.getItem('brainDumpTags')) {
    tagPalette.innerHTML = localStorage.getItem('brainDumpTags')
  }

  // Render Markdown
  function renderPreview () {
    const raw = editor.value
    const html = DOMPurify.sanitize(marked.parse(raw))
    preview.innerHTML = html

    // Make checkboxes interactive
    preview.querySelectorAll("input[type='checkbox']").forEach((box, i) => {
      box.addEventListener('change', () => {
        const lines = editor.value.split('\n')
        let count = 0
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].match(/^\s*[-*]\s+\[( |x)\]/)) {
            if (count === i) {
              lines[j] = lines[j].replace(
                /\[( |x)\]/,
                box.checked ? '[x]' : '[ ]'
              )
              break
            }
            count++
          }
        }
        editor.value = lines.join('\n')
        localStorage.setItem('brainDumpContent', editor.value)
        renderPreview()
      })
    })
  }

  // Initial render
  renderPreview()

  // Autosave and re-render on input
  editor.addEventListener('input', () => {
    localStorage.setItem('brainDumpContent', editor.value)
    renderPreview()
  })

  // Autosave tags
  const tagObserver = new MutationObserver(() => {
    localStorage.setItem('brainDumpTags', tagPalette.innerHTML)
  })
  tagObserver.observe(tagPalette, { childList: true, subtree: true })

  // Clear All
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear all notes and tags?')) {
      editor.value = ''
      tagPalette.innerHTML = ''
      localStorage.removeItem('brainDumpContent')
      localStorage.removeItem('brainDumpTags')
      renderPreview()
    }
  })

  // Export
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([editor.value], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'brain_dump.md'
    a.click()
  })
})
