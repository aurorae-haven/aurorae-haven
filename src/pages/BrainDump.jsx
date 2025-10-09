import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import DOMPurify from 'dompurify'
import 'katex/dist/katex.min.css'
import { handleEnterKey } from '../utils/listContinuation'
import { configureSanitization } from '../utils/braindump-enhanced'
import {
  createNewNote,
  createNoteFromImport,
  toggleNoteLock,
  updateNote,
  deleteNote as deleteNoteUtil,
  migrateNotes,
  exportNoteToFile,
  saveNotesToStorage,
  loadNotesFromStorage
} from '../utils/brainDump/noteOperations'
import {
  getUniqueCategories as getUniqueCategoriesUtil,
  filterNotes as filterNotesUtil
} from '../utils/brainDump/noteFilters'
import NoteDetailsModal from '../components/BrainDump/NoteDetailsModal'
import HelpModal from '../components/BrainDump/HelpModal'

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
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
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
    let loadedNotes = loadNotesFromStorage()

    // Migration: if no entries exist, migrate old single-note content
    if (loadedNotes.length === 0) {
      const oldContent = localStorage.getItem('brainDumpContent')
      if (oldContent && oldContent.trim()) {
        const migratedNote = {
          ...createNewNote(),
          title: 'Migrated Note',
          content: oldContent
        }
        loadedNotes = [migratedNote]
        saveNotesToStorage(loadedNotes)
      }
    }

    // Migrate existing notes to add missing fields
    const { migratedNotes, needsMigration } = migrateNotes(loadedNotes)

    if (needsMigration && migratedNotes.length > 0) {
      saveNotesToStorage(migratedNotes)
    }

    setNotes(migratedNotes)

    // Load first note if available
    if (migratedNotes.length > 0) {
      loadNote(migratedNotes[0])
    }
  }, [])

  // Load a note
  const loadNote = (note) => {
    setCurrentNoteId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category || '')
  }

  // Memoize current note to avoid redundant array searches
  const currentNote = useMemo(
    () => notes.find((n) => n.id === currentNoteId),
    [notes, currentNoteId]
  )

  // Render preview whenever content changes
  // Security: Content is sanitized with DOMPurify before rendering
  useEffect(() => {
    const renderPreview = () => {
      // Use enhanced sanitization configuration to prevent XSS
      const sanitizeConfig = configureSanitization(DOMPurify)
      // Parse markdown and sanitize HTML to remove any malicious content
      const html = DOMPurify.sanitize(marked.parse(content), sanitizeConfig)
      setPreview(html)
    }
    renderPreview()
  }, [content])

  // Autosave current note
  useEffect(() => {
    if (!currentNoteId) return

    // Don't save if note is locked
    if (currentNote?.locked) return

    const saveTimeout = setTimeout(() => {
      const updatedNotes = updateNote(notes, currentNoteId, {
        title,
        content,
        category
      })
      setNotes(updatedNotes)
      saveNotesToStorage(updatedNotes)
    }, 500) // Debounce autosave

    return () => clearTimeout(saveTimeout)
  }, [currentNoteId, title, content, category, notes, currentNote])

  // Create new note
  const handleNewNote = () => {
    const newNote = createNewNote()
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    saveNotesToStorage(updatedNotes)
    loadNote(newNote)
  }

  // Show toast notification
  const showToastNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  // Delete note (can be called from context menu or toolbar)
  const handleDelete = (noteId = currentNoteId) => {
    if (!noteId) return

    const noteToDelete = notes.find((n) => n.id === noteId)

    // Check if note is locked - show toast instead of alert
    if (noteToDelete?.locked) {
      showToastNotification(
        '🔒 This note is locked. Unlock it before deleting.'
      )
      return
    }

    // Use window.confirm for compatibility with tests
    if (!window.confirm(`Delete "${noteToDelete?.title || 'this note'}"?`))
      return

    // Execute delete
    const updatedNotes = deleteNoteUtil(notes, noteId)
    setNotes(updatedNotes)
    saveNotesToStorage(updatedNotes)

    // Load next note or create new one if the deleted note was current
    if (noteId === currentNoteId) {
      if (updatedNotes.length > 0) {
        loadNote(updatedNotes[0])
      } else {
        setCurrentNoteId(null)
        setTitle('')
        setContent('')
        setCategory('')
      }
    }

    // Close context menu if open
    setContextMenu(null)
    showToastNotification('✓ Note deleted successfully')
  }

  // Toggle lock status of a note
  const handleToggleLock = (noteId) => {
    const updatedNotes = toggleNoteLock(notes, noteId)
    setNotes(updatedNotes)
    saveNotesToStorage(updatedNotes)
    setContextMenu(null)
  }

  // Export current note with new filename format
  const handleExport = () => {
    exportNoteToFile(title, content)
  }

  // Import note from markdown file
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const fileContent = event.target?.result
      if (typeof fileContent !== 'string') return

      const importedNote = createNoteFromImport(file.name, fileContent)

      const updatedNotes = [...notes, importedNote]
      setNotes(updatedNotes)
      saveNotesToStorage(updatedNotes)
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

  // Filter notes using utility function
  const filteredNotes = filterNotesUtil(notes, searchQuery, filterOptions)

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
                {note.locked && (
                  <svg
                    className='icon note-item-lock-icon'
                    viewBox='0 0 24 24'
                    aria-label='Locked'
                  >
                    <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
                    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                  </svg>
                )}
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
                disabled={!currentNoteId || currentNote?.locked}
                aria-label='Note title'
              />
              <input
                type='text'
                className='note-category-input'
                placeholder='Category...'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!currentNoteId || currentNote?.locked}
                aria-label='Note category'
                list='category-suggestions'
              />
              <datalist id='category-suggestions'>
                {getUniqueCategoriesUtil(notes).map((cat) => (
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
                onClick={() => handleDelete()}
                aria-label='Delete'
                title='Delete'
                disabled={!currentNoteId || currentNote?.locked}
              >
                <svg className='icon' viewBox='0 0 24 24'>
                  <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
                  <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                </svg>
              </button>
              <button
                className='btn btn-help'
                onClick={() => setShowHelpModal(true)}
                aria-label='Open user manual and formatting help'
                title='Help: LaTeX, Images & Markdown'
              >
                <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                  <path
                    d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                  <line
                    x1='12'
                    y1='17'
                    x2='12.01'
                    y2='17'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
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
                  disabled={!currentNoteId || currentNote?.locked}
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
                {/* Security: HTML is sanitized with DOMPurify before rendering to prevent XSS attacks */}
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
            <svg className='icon' viewBox='0 0 24 24'>
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='16' x2='12' y2='12' />
              <line x1='12' y1='8' x2='12.01' y2='8' />
            </svg>
            See More Details
          </button>
          <button
            className='context-menu-item'
            onClick={() => handleToggleLock(contextMenu.note.id)}
            role='menuitem'
          >
            {contextMenu.note.locked ? (
              <>
                <svg className='icon' viewBox='0 0 24 24'>
                  <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
                  <path d='M7 11V7a5 5 0 0 1 9.9-1' />
                </svg>
                Unlock Note
              </>
            ) : (
              <>
                <svg className='icon' viewBox='0 0 24 24'>
                  <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
                  <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                </svg>
                Lock Note
              </>
            )}
          </button>
          <button
            className='context-menu-item context-menu-item-danger'
            onClick={() => handleDelete(contextMenu.note.id)}
            role='menuitem'
            disabled={contextMenu.note.locked}
          >
            <svg className='icon' viewBox='0 0 24 24'>
              <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
              <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
            </svg>
            Delete Note
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <NoteDetailsModal
          note={currentNote}
          title={title}
          category={category}
          content={content}
          onClose={() => setShowDetailsModal(false)}
        />
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
                  {getUniqueCategoriesUtil(notes).map((cat) => (
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

      {/* Toast Notification */}
      {showToast && (
        <div className='toast' style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  )
}

export default BrainDump
