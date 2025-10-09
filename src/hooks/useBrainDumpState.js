import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  createNewNote,
  migrateNotes,
  updateNote,
  saveNotesToStorage,
  loadNotesFromStorage
} from '../utils/brainDump/noteOperations'
import { filterNotes as filterNotesUtil } from '../utils/brainDump/noteFilters'

/**
 * Custom hook for managing BrainDump notes state
 * Handles loading, saving, filtering, and CRUD operations
 */
export function useBrainDumpState() {
  const [notes, setNotes] = useState([])
  const [currentNoteId, setCurrentNoteId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOptions, setFilterOptions] = useState({
    category: '',
    dateFilter: 'all',
    customStart: '',
    customEnd: ''
  })

  // Load a note
  const loadNote = useCallback((note) => {
    setCurrentNoteId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category || '')
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
  }, [loadNote])

  // Memoize current note to avoid redundant array searches
  const currentNote = useMemo(
    () => notes.find((n) => n.id === currentNoteId),
    [notes, currentNoteId]
  )

  // Filter notes based on search query and filter options
  const filteredNotes = useMemo(
    () => filterNotesUtil(notes, searchQuery, filterOptions),
    [notes, searchQuery, filterOptions]
  )

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
  const createNote = () => {
    const newNote = createNewNote()
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    saveNotesToStorage(updatedNotes)
    loadNote(newNote)
    return newNote
  }

  // Update notes state and save to storage
  const updateNotes = (updatedNotes) => {
    setNotes(updatedNotes)
    saveNotesToStorage(updatedNotes)
  }

  return {
    // State
    notes,
    currentNoteId,
    currentNote,
    title,
    content,
    category,
    searchQuery,
    filterOptions,
    filteredNotes,
    // Setters
    setNotes,
    setTitle,
    setContent,
    setCategory,
    setSearchQuery,
    setFilterOptions,
    // Actions
    loadNote,
    createNote,
    updateNotes
  }
}
