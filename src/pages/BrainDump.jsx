import React, { useState, useEffect, useCallback, useRef } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { handleEnterKey } from '../utils/listContinuation'
import { configureSanitization } from '../utils/braindump-enhanced'

// Secure UUID generator: Tries crypto.randomUUID, else creates v4-compatible with getRandomValues
function generateSecureUUID() {
  if (typeof window.crypto !== 'undefined') {
    if (window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    } else if (window.crypto.getRandomValues) {
      // Generate 16 random bytes and format as UUID v4
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      // Set version (4) and variant bits according to RFC 4122
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const toHex = (n) => n.toString(16).padStart(2, '0');
      const hex = Array.from(bytes, toHex).join('');
      // UUID format: 8-4-4-4-12
      return (
        hex.slice(0, 8) + '-' +
        hex.slice(8, 12) + '-' +
        hex.slice(12, 16) + '-' +
        hex.slice(16, 20) + '-' +
        hex.slice(20)
      );
    }
  }
  // Weak fallback (should almost never hit)
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function BrainDump() {
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState('')
  const editorRef = useRef(null)

  // Configure enhanced sanitization on mount
  useEffect(() => {
    configureSanitization(DOMPurify)
  }, [])

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem('brainDumpContent')
    if (saved) {
      setContent(saved)
    }
  }, [])

  // Render preview whenever content changes
  useEffect(() => {
    const renderPreview = () => {
      // Use enhanced sanitization configuration
      const sanitizeConfig = configureSanitization(DOMPurify)
      const html = DOMPurify.sanitize(marked.parse(content), sanitizeConfig)
      setPreview(html)
    }
    renderPreview()
  }, [content])

  // Autosave to localStorage
  useEffect(() => {
    localStorage.setItem('brainDumpContent', content)
  }, [content])

  const handleClear = () => {
    if (window.confirm('Clear all notes and tags?')) {
      setContent('')
      localStorage.removeItem('brainDumpContent')
      localStorage.removeItem('brainDumpTags')
    }
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    
    // Generate filename: YYYY-MM-DD_UUID.md
    const date = new Date().toISOString().split('T')[0]
    const uuid = generateSecureUUID();
    const filename = `${date}_${uuid}.md`
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Handle auto-list continuation on Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const editor = editorRef.current
      if (!editor) return

      const cursorPos = editor.selectionStart
      const result = handleEnterKey(editor.value, cursorPos)

      if (result) {
        e.preventDefault()
        setContent(result.newValue)
        // Set cursor position after state update
        setTimeout(() => {
          editor.selectionStart = editor.selectionEnd = result.newCursorPos
        }, 0)
      }
    }
  }, [])

  return (
    <div className='card'>
      <div className='card-h'>
        <strong>Brain Dump</strong>
        <div className='toolbar'>
          <button className='btn' aria-label='Bold'>
            <svg className='icon' viewBox='0 0 24 24'>
              <path d='M6 4h8a4 4 0 0 1 0 8H6z' />
              <path d='M6 12h9a4 4 0 0 1 0 8H6z' />
            </svg>
          </button>
          <button className='btn' aria-label='Code'>
            <svg className='icon' viewBox='0 0 24 24'>
              <path d='M7 17V7h10v10z' />
              <path d='M5 5v16h16V5z' />
            </svg>
          </button>
          <button className='btn' aria-label='List'>
            <svg className='icon' viewBox='0 0 24 24'>
              <path d='M8 6h13M8 12h13M8 18h13' />
              <path d='M3 6h.01M3 12h.01M3 18h.01' />
            </svg>
          </button>
          <button className='btn' onClick={handleClear} aria-label='Clear'>
            <svg className='icon' viewBox='0 0 24 24'>
              <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
              <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
            </svg>
          </button>
          <button className='btn' onClick={handleExport} aria-label='Export'>
            <svg className='icon' viewBox='0 0 24 24'>
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
              <polyline points='7 10 12 15 17 10' />
              <line x1='12' y1='15' x2='12' y2='3' />
            </svg>
          </button>
        </div>
      </div>
      <div className='card-b'>
        <div className='brain-dump-split'>
          <div className='editor-pane'>
            <textarea
              id='editor'
              ref={editorRef}
              placeholder='Start typing your thoughts...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className='preview-pane'>
            <div id='preview' dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrainDump
