import React, { useState, useEffect, useCallback, useRef } from 'react'
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import DOMPurify from 'dompurify'
import 'katex/dist/katex.min.css'
import { handleEnterKey } from '../utils/listContinuation'
import { configureSanitization } from '../utils/braindump-enhanced'
import { generateSecureUUID } from '../utils/uuidGenerator'
import {
  generateBrainDumpFilename,
  extractTitleFromFilename
} from '../utils/fileHelpers'

// Configure marked once at module level to avoid reconfiguration on re-renders
// Error handling for KaTeX extension to gracefully handle load failures
try {
  marked.use(
    markedKatex({
      throwOnError: false,
      displayMode: false
    })
  )
} catch (error) {
  console.warn(
    'KaTeX extension failed to load. LaTeX rendering will be disabled.',
    error
  )
  // Marked will continue to work without KaTeX, falling back to plain markdown
}

// Common marked configuration options
const markedOptions = {
  breaks: true,
  gfm: true
}

// Configure marked options at module level, handling both old and new API
try {
  if (typeof marked.use === 'function') {
    marked.use(markedOptions)
  } else if (typeof marked.setOptions === 'function') {
    marked.setOptions(markedOptions)
  }
} catch (error) {
  console.warn('Failed to configure marked options:', error)
}
function BrainDump() {
  const [notes, setNotes] = useState([])
  const [currentNoteId, setCurrentNoteId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [preview, setPreview] = useState('')
  const [showNoteList, setShowNoteList] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [filterOptions, setFilterOptions] = useState({
    category: '',
    dateFilter: 'all',
    customStart: '',
    customEnd: ''
  })
  const editorRef = useRef(null)
  const previewRef = useRef(null)

  // Configure sanitization on mount
  useEffect(() => {
    configureSanitization(DOMPurify)
  }, [])

  // Load saved notes on mount (migrate old single note if needed)
  useEffect(() => {
    const entriesData = localStorage.getItem('brainDumpEntries')
    let loadedNotes = []

    try {
      loadedNotes = entriesData ? JSON.parse(entriesData) : []
    } catch (e) {
      console.warn('Failed to parse brainDumpEntries:', e)
    }

    // Migration: if no entries exist, migrate old single-note content
    if (loadedNotes.length === 0) {
      const oldContent = localStorage.getItem('brainDumpContent')
      if (oldContent && oldContent.trim()) {
        const migratedNote = {
          id: generateSecureUUID(),
          title: 'Migrated Note',
          content: oldContent,
          category: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        loadedNotes = [migratedNote]
        localStorage.setItem('brainDumpEntries', JSON.stringify(loadedNotes))
      }
    }

    // Migrate existing notes to add category field if missing
    const needsMigration = loadedNotes.some(
      (note) => note.category === undefined
    )
    const migratedNotes = loadedNotes.map((note) => ({
      ...note,
      category: note.category || ''
    }))

    if (needsMigration && migratedNotes.length > 0) {
      localStorage.setItem('brainDumpEntries', JSON.stringify(migratedNotes))
    }

    setNotes(migratedNotes)

    // Load first note if available
    if (loadedNotes.length > 0) {
      loadNote(loadedNotes[0])
    }
  }, [])

  // Load a note
  const loadNote = (note) => {
    setCurrentNoteId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category || '')
  }

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

  // Autosave current note
  useEffect(() => {
    if (!currentNoteId) return

    const saveTimeout = setTimeout(() => {
      const updatedNotes = notes.map((note) =>
        note.id === currentNoteId
          ? {
              ...note,
              title,
              content,
              category,
              updatedAt: new Date().toISOString()
            }
          : note
      )
      setNotes(updatedNotes)
      localStorage.setItem('brainDumpEntries', JSON.stringify(updatedNotes))
    }, 500) // Debounce autosave

    return () => clearTimeout(saveTimeout)
  }, [currentNoteId, title, content, category, notes])

  // Create new note
  const handleNewNote = () => {
    const newNote = {
      id: generateSecureUUID(),
      title: 'Untitled Note',
      content: '',
      category: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    localStorage.setItem('brainDumpEntries', JSON.stringify(updatedNotes))
    loadNote(newNote)
  }

  // Delete current note
  const handleDelete = () => {
    if (!currentNoteId) return

    const currentNote = notes.find((n) => n.id === currentNoteId)
    if (!window.confirm(`Delete "${currentNote?.title || 'this note'}"?`))
      return

    const updatedNotes = notes.filter((n) => n.id !== currentNoteId)
    setNotes(updatedNotes)
    localStorage.setItem('brainDumpEntries', JSON.stringify(updatedNotes))

    // Load next note or create new one
    if (updatedNotes.length > 0) {
      loadNote(updatedNotes[0])
    } else {
      setCurrentNoteId(null)
      setTitle('')
      setContent('')
      setCategory('')
    }
  }

  // Export current note with new filename format
  const handleExport = () => {
    if (!content) return

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)

    // Generate filename using utility function
    const filename = generateBrainDumpFilename(title)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import note from markdown file
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const fileContent = event.target?.result
      if (typeof fileContent !== 'string') return

      // Extract title from filename using utility function
      const noteTitle = extractTitleFromFilename(file.name)

      const importedNote = {
        id: generateSecureUUID(),
        title: noteTitle,
        content: fileContent,
        category: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedNotes = [...notes, importedNote]
      setNotes(updatedNotes)
      localStorage.setItem('brainDumpEntries', JSON.stringify(updatedNotes))
      loadNote(importedNote)
    }

    reader.readAsText(file)
    e.target.value = '' // Reset input
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

  // Handle keyboard navigation for preview pane
  const handlePreviewKeyDown = useCallback((e) => {
    const previewElement = e.currentTarget
    const scrollAmount = previewElement.clientHeight * 0.8 // 80% of viewport for page up/down

    switch (e.key) {
      case 'PageDown':
        e.preventDefault()
        previewElement.scrollTop += scrollAmount
        break
      case 'PageUp':
        e.preventDefault()
        previewElement.scrollTop -= scrollAmount
        break
      case 'Home':
        if (e.ctrlKey) {
          e.preventDefault()
          previewElement.scrollTop = 0
        }
        break
      case 'End':
        if (e.ctrlKey) {
          e.preventDefault()
          previewElement.scrollTop = previewElement.scrollHeight
        }
        break
      default:
        break
    }
  }, [])

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  // Handle right-click on note
  const handleNoteContextMenu = (e, note) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      note
    })
  }

  // Show details modal
  const handleShowDetails = (note) => {
    setCurrentNoteId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category || '')
    setShowDetailsModal(true)
    setContextMenu(null)
  }

  // Get unique categories from all notes
  const getUniqueCategories = () => {
    const categories = notes
      .map((note) => note.category)
      .filter((cat) => cat && cat.trim())
    return [...new Set(categories)].sort()
  }

  // Apply date filter
  const applyDateFilter = (note) => {
    const { dateFilter, customStart, customEnd } = filterOptions
    if (dateFilter === 'all') return true

    const noteDate = new Date(note.updatedAt)
    const now = new Date()

    switch (dateFilter) {
      case 'latest': {
        // Last 7 days
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)
        return noteDate >= sevenDaysAgo
      }
      case 'oldest': {
        // Older than 30 days
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(now.getDate() - 30)
        return noteDate < thirtyDaysAgo
      }
      case 'year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        return noteDate >= startOfYear
      }
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return noteDate >= startOfMonth
      }
      case 'day': {
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        )
        return noteDate >= startOfDay
      }
      case 'custom': {
        if (!customStart && !customEnd) return true
        const start = customStart ? new Date(customStart) : new Date(0)
        const end = customEnd
          ? new Date(new Date(customEnd).setHours(23, 59, 59, 999))
          : new Date()
        return noteDate >= start && noteDate <= end
      }
      default:
        return true
    }
  }

  // Filter notes based on search query, category, and date
  const filteredNotes = notes.filter((note) => {
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const titleMatch = (note.title || '').toLowerCase().includes(query)
      const contentMatch = (note.content || '').toLowerCase().includes(query)
      if (!titleMatch && !contentMatch) return false
    }

    // Category filter
    if (filterOptions.category && note.category !== filterOptions.category) {
      return false
    }

    // Date filter
    if (!applyDateFilter(note)) {
      return false
    }

    return true
  })

  return (
    <div className='brain-dump-container'>
      {/* Note List Sidebar */}
      <div
        className={`note-list-sidebar ${showNoteList ? 'visible' : 'hidden'}`}
      >
        <div className='note-list-header'>
          <div className='note-list-header-left'>
            <strong>Notes</strong>
            <button
              className='btn btn-icon toggle-notes-btn'
              onClick={() => setShowNoteList(!showNoteList)}
              aria-label={showNoteList ? 'Hide notes list' : 'Show notes list'}
              title={showNoteList ? 'Hide notes list' : 'Show notes list'}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <line x1='3' y1='12' x2='21' y2='12' />
                <line x1='3' y1='6' x2='21' y2='6' />
                <line x1='3' y1='18' x2='21' y2='18' />
              </svg>
            </button>
            <button
              className='btn btn-icon'
              onClick={() => setShowFilterModal(true)}
              aria-label='Filter Notes'
              title='Filter Notes'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
              </svg>
            </button>
          </div>
          <button
            className='btn btn-icon'
            onClick={handleNewNote}
            aria-label='New Note'
            title='New Note'
          >
            <svg className='icon' viewBox='0 0 24 24'>
              <line x1='12' y1='5' x2='12' y2='19' />
              <line x1='5' y1='12' x2='19' y2='12' />
            </svg>
          </button>
        </div>
        <div className='note-search'>
          <input
            type='text'
            className='note-search-input'
            placeholder='Search notes...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label='Search notes'
          />
          {searchQuery && (
            <button
              className='btn btn-icon note-search-clear'
              onClick={() => setSearchQuery('')}
              aria-label='Clear search'
              title='Clear search'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </button>
          )}
        </div>
        <div className='note-list'>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${note.id === currentNoteId ? 'active' : ''}`}
              onClick={() => loadNote(note)}
              onContextMenu={(e) => handleNoteContextMenu(e, note)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  loadNote(note)
                }
              }}
            >
              <div className='note-item-title' title={note.title || 'Untitled'}>
                {note.title || 'Untitled'}
              </div>
              <div className='note-item-metadata'>
                <div className='note-item-date'>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                {note.category && (
                  <div className='note-item-category'>{note.category}</div>
                )}
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && notes.length > 0 && (
            <div className='note-list-empty'>
              No notes found matching &quot;{searchQuery}&quot;
            </div>
          )}
          {notes.length === 0 && (
            <div className='note-list-empty'>
              No notes yet. Click + to create one.
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className='brain-dump-main'>
        <div className='card'>
          <div className='card-h'>
            <div className='title-input-wrapper'>
              {!showNoteList && (
                <button
                  className='btn btn-icon toggle-notes-btn'
                  onClick={() => setShowNoteList(!showNoteList)}
                  aria-label='Show notes list'
                  title='Show notes list'
                >
                  <svg
                    className='icon'
                    viewBox='0 0 24 24'
                    role='img'
                    aria-hidden='true'
                  >
                    <line x1='3' y1='12' x2='21' y2='12' />
                    <line x1='3' y1='6' x2='21' y2='6' />
                    <line x1='3' y1='18' x2='21' y2='18' />
                  </svg>
                </button>
              )}
              <input
                type='text'
                className='note-title-input'
                placeholder='Note title...'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label='Note title'
              />
              <input
                type='text'
                className='note-category-input'
                placeholder='Category...'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!currentNoteId}
                aria-label='Note category'
                list='category-suggestions'
              />
              <datalist id='category-suggestions'>
                {getUniqueCategories().map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div className='toolbar'>
              <label className='btn' aria-label='Import' title='Import'>
                <svg className='icon' viewBox='0 0 24 24'>
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                  <polyline points='17 8 12 3 7 8' />
                  <line x1='12' y1='3' x2='12' y2='15' />
                </svg>
                <input
                  type='file'
                  accept='.md,.markdown,.txt'
                  onChange={handleImport}
                  style={{ display: 'none' }}
                  aria-label='Import markdown file'
                />
              </label>
              <button
                className='btn'
                onClick={handleExport}
                aria-label='Export'
                title='Export'
                disabled={!currentNoteId}
              >
                <svg className='icon' viewBox='0 0 24 24'>
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                  <polyline points='7 10 12 15 17 10' />
                  <line x1='12' y1='15' x2='12' y2='3' />
                </svg>
              </button>
              <button
                className='btn btn-delete'
                onClick={handleDelete}
                aria-label='Delete'
                title='Delete'
                disabled={!currentNoteId}
              >
                <svg className='icon' viewBox='0 0 24 24'>
                  <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
                  <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
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
                  className='resizable-textarea'
                  placeholder='Start typing your thoughts...'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!currentNoteId}
                  aria-label='Note content'
                  aria-describedby={
                    !currentNoteId ? 'editor-disabled-message' : undefined
                  }
                />
                {!currentNoteId && (
                  <span id='editor-disabled-message' className='sr-only'>
                    Editor is disabled. Create or select a note to start
                    editing.
                  </span>
                )}
              </div>
              {/* Preview pane with keyboard navigation support */}
              {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
              <div
                className='preview-pane'
                ref={previewRef}
                tabIndex={0}
                onKeyDown={handlePreviewKeyDown}
                role='region'
                aria-label='Note preview'
              >
                <div
                  id='preview'
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </div>
              {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className='context-menu'
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role='menu'
          aria-label='Note context menu'
        >
          <button
            className='context-menu-item'
            onClick={() => handleShowDetails(contextMenu.note)}
            role='menuitem'
          >
            See More Details
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          className='modal-overlay'
          onClick={() => setShowDetailsModal(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowDetailsModal(false)
          }}
          role='dialog'
          aria-modal='true'
          aria-labelledby='details-modal-title'
        >
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            className='modal-content'
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role='document'
          >
            {
              // Store the found note in a variable to avoid redundant array searches
              const currentNote = notes.find((n) => n.id === currentNoteId);
            }
            <>
              <div className='modal-header'>
                <h2 id='details-modal-title'>Note Details</h2>
                <button
                  className='btn btn-icon'
                  onClick={() => setShowDetailsModal(false)}
                  aria-label='Close'
                >
                  <svg className='icon' viewBox='0 0 24 24'>
                    <line x1='18' y1='6' x2='6' y2='18' />
                    <line x1='6' y1='6' x2='18' y2='18' />
                  </svg>
                </button>
              </div>
              <div className='modal-body'>
                <div className='detail-row'>
                  <strong>Title:</strong>
                  <span>{title || 'Untitled'}</span>
                </div>
                <div className='detail-row'>
                  <strong>Category:</strong>
                  <span>{category || 'None'}</span>
                </div>
                <div className='detail-row'>
                  <strong>Created:</strong>
                  <span>
                    {currentNote?.createdAt
                      ? new Date(currentNote.createdAt).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className='detail-row'>
                  <strong>Last Updated:</strong>
                  <span>
                    {currentNote?.updatedAt
                      ? new Date(currentNote.updatedAt).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className='detail-row'>
                  <strong>Content Length:</strong>
                  <span>{content.length} characters</span>
                </div>
              </div>
            </>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          className='modal-overlay'
          onClick={() => setShowFilterModal(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowFilterModal(false)
          }}
          role='dialog'
          aria-modal='true'
          aria-labelledby='filter-modal-title'
        >
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            className='modal-content'
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role='document'
          >
            <div className='modal-header'>
              <h2 id='filter-modal-title'>Filter Notes</h2>
              <button
                className='btn btn-icon'
                onClick={() => setShowFilterModal(false)}
                aria-label='Close'
              >
                <svg className='icon' viewBox='0 0 24 24'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>
            <div className='modal-body'>
              <div className='filter-section'>
                <label htmlFor='category-filter'>
                  <strong>Category:</strong>
                </label>
                <select
                  id='category-filter'
                  value={filterOptions.category}
                  onChange={(e) =>
                    setFilterOptions({
                      ...filterOptions,
                      category: e.target.value
                    })
                  }
                  className='filter-select'
                >
                  <option value=''>All Categories</option>
                  {getUniqueCategories().map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className='filter-section'>
                <label htmlFor='date-filter'>
                  <strong>Date Filter:</strong>
                </label>
                <select
                  id='date-filter'
                  value={filterOptions.dateFilter}
                  onChange={(e) =>
                    setFilterOptions({
                      ...filterOptions,
                      dateFilter: e.target.value
                    })
                  }
                  className='filter-select'
                >
                  <option value='all'>All Time</option>
                  <option value='latest'>Latest (Last 7 days)</option>
                  <option value='day'>Today</option>
                  <option value='month'>This Month</option>
                  <option value='year'>This Year</option>
                  <option value='oldest'>Oldest (Over 30 days)</option>
                  <option value='custom'>Custom Range</option>
                </select>
              </div>

              {filterOptions.dateFilter === 'custom' && (
                <div className='filter-section'>
                  <label htmlFor='custom-start'>
                    <strong>Start Date:</strong>
                  </label>
                  <input
                    id='custom-start'
                    type='date'
                    value={filterOptions.customStart}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        customStart: e.target.value
                      })
                    }
                    className='filter-input'
                  />
                  <label htmlFor='custom-end'>
                    <strong>End Date:</strong>
                  </label>
                  <input
                    id='custom-end'
                    type='date'
                    value={filterOptions.customEnd}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        customEnd: e.target.value
                      })
                    }
                    className='filter-input'
                  />
                </div>
              )}

              <div className='filter-actions'>
                <button
                  className='btn'
                  onClick={() => {
                    setFilterOptions({
                      category: '',
                      dateFilter: 'all',
                      customStart: '',
                      customEnd: ''
                    })
                  }}
                >
                  Clear Filters
                </button>
                <button
                  className='btn'
                  onClick={() => setShowFilterModal(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrainDump
