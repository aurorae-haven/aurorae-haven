import React, { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import DOMPurify from 'dompurify'
import 'katex/dist/katex.min.css'
import { configureSanitization } from '../utils/sanitization'
import {
  createNewNote,
  createNoteFromImport,
  toggleNoteLock,
  deleteNote as deleteNoteUtil,
  exportNoteToFile
} from '../utils/brainDump/noteOperations'
import NoteDetailsModal from '../components/BrainDump/NoteDetailsModal'
import HelpModal from '../components/BrainDump/HelpModal'
import NotesList from '../components/BrainDump/NotesList'
import NoteEditor from '../components/BrainDump/NoteEditor'
import FilterModal from '../components/BrainDump/FilterModal'
import ContextMenu from '../components/BrainDump/ContextMenu'
import { useBrainDumpState } from '../hooks/useBrainDumpState'
import { useToast } from '../hooks/useToast'

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
  if (typeof marked.setOptions === 'function') {
    marked.setOptions(markedOptions)
  } else if (typeof marked.use === 'function') {
    marked.use(markedOptions)
  }
} catch (error) {
  console.warn('Failed to configure marked options:', error)
}

function BrainDump() {
  // Use custom hooks for state management
  const {
    notes,
    currentNoteId,
    currentNote,
    title,
    content,
    category,
    searchQuery,
    filterOptions,
    filteredNotes,
    setTitle,
    setContent,
    setCategory,
    setSearchQuery,
    setFilterOptions,
    loadNote,
    createNote,
    updateNotes,
    clearAutosaveTimeout
  } = useBrainDumpState()

  const { toastMessage, showToast, showToastNotification } = useToast()

  // UI state
  const [preview, setPreview] = useState('')
  const [showNoteList, setShowNoteList] = useState(true)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)

  // Configure sanitization on mount
  useEffect(() => {
    configureSanitization(DOMPurify)
  }, [])

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

    // Clear any pending autosave to prevent it from restoring the deleted note
    clearAutosaveTimeout()

    // Execute delete
    const updatedNotes = deleteNoteUtil(notes, noteId)

    // Update storage immediately to prevent autosave from restoring deleted note
    updateNotes(updatedNotes)

    // Load next note or create new empty note if the deleted note was current
    if (noteId === currentNoteId) {
      if (updatedNotes.length > 0) {
        loadNote(updatedNotes[0])
      } else {
        // Auto-create new empty note when deleting the last note
        const newNote = createNewNote()
        const notesWithNew = [newNote]
        
        // Use flushSync to ensure state updates complete synchronously
        // This prevents UI not updating issue when deleting the last note
        flushSync(() => {
          updateNotes(notesWithNew)
        })
        loadNote(newNote)
      }
    }

    // Close context menu if open
    setContextMenu(null)
    showToastNotification('✓ Note deleted successfully')
  }

  // Toggle lock status of a note
  const handleToggleLock = (noteId = currentNoteId) => {
    const updatedNotes = toggleNoteLock(notes, noteId || currentNoteId)
    updateNotes(updatedNotes)
    setContextMenu(null)
  }

  // Export current note with new filename format
  const handleExport = (noteId) => {
    // If noteId is provided as a string (from context menu), use that note
    // Otherwise (button click passes event or nothing), use current note
    if (noteId && typeof noteId === 'string') {
      const note = notes.find((n) => n.id === noteId)
      if (note) {
        exportNoteToFile(note.title, note.content)
      } else {
        showToastNotification('⚠️ Note not found. Cannot export.')
      }
    } else {
      exportNoteToFile(title, content)
    }
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
      updateNotes(updatedNotes)
      loadNote(importedNote)
    }

    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  // Handle right-click on note
  const handleNoteContextMenu = (e, note) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      note
    })
  }

  return (
    <div className='brain-dump-container'>
      {/* Note List Sidebar */}
      <NotesList
        notes={notes}
        filteredNotes={filteredNotes}
        currentNoteId={currentNoteId}
        searchQuery={searchQuery}
        showNoteList={showNoteList}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        onToggleNoteList={() => setShowNoteList(!showNoteList)}
        onFilterClick={() => setShowFilterModal(true)}
        onNoteClick={loadNote}
        onNoteContextMenu={handleNoteContextMenu}
        onNewNote={createNote}
      />

      {/* Main Editor Area */}
      <div className='brain-dump-main'>
        <div className='card'>
          <NoteEditor
            currentNote={currentNote}
            currentNoteId={currentNoteId}
            title={title}
            category={category}
            content={content}
            preview={preview}
            notes={notes}
            showNoteList={showNoteList}
            onTitleChange={setTitle}
            onCategoryChange={setCategory}
            onContentChange={setContent}
            onToggleNoteList={() => setShowNoteList(!showNoteList)}
            onNewNote={createNote}
            onImport={handleImport}
            onExport={handleExport}
            onDelete={handleDelete}
            onLockToggle={handleToggleLock}
            onShowDetails={() => setShowDetailsModal(true)}
          />
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        contextMenu={contextMenu}
        onExport={handleExport}
        onLockToggle={() => handleToggleLock(contextMenu?.note?.id)}
        onDelete={() => handleDelete(contextMenu?.note?.id)}
        onClose={() => setContextMenu(null)}
      />

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
        <FilterModal
          notes={notes}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          onClose={() => setShowFilterModal(false)}
        />
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
