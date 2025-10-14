import { generateSecureUUID } from '../uuidGenerator'
import {
  generateBrainDumpFilename,
  extractTitleFromFilename
} from '../fileHelpers'
import { createLogger } from '../logger'

const logger = createLogger('NoteOperations')

/**
 * Create a new note object
 * @returns {Object} - New note object with default properties
 */
export function createNewNote() {
  return {
    id: generateSecureUUID(),
    title: 'Untitled Note',
    content: '',
    category: '',
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Create a note from imported markdown content
 * @param {string} filename - Original filename
 * @param {string} content - File content
 * @returns {Object} - New note object
 */
export function createNoteFromImport(filename, content) {
  const noteTitle = extractTitleFromFilename(filename)
  return {
    id: generateSecureUUID(),
    title: noteTitle,
    content,
    category: '',
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Toggle lock status of a note
 * @param {Array} notes - Array of notes
 * @param {string} noteId - ID of note to toggle
 * @returns {Array} - Updated notes array
 */
export function toggleNoteLock(notes, noteId) {
  return notes.map((note) =>
    note.id === noteId ? { ...note, locked: !note.locked } : note
  )
}

/**
 * Update note content
 * @param {Array} notes - Array of notes
 * @param {string} noteId - ID of note to update
 * @param {Object} updates - Object with title, content, category
 * @returns {Array} - Updated notes array
 */
export function updateNote(notes, noteId, updates) {
  return notes.map((note) =>
    note.id === noteId
      ? { ...note, ...updates, updatedAt: new Date().toISOString() }
      : note
  )
}

/**
 * Delete a note from array
 * @param {Array} notes - Array of notes
 * @param {string} noteId - ID of note to delete
 * @returns {Array} - Updated notes array
 */
export function deleteNote(notes, noteId) {
  return notes.filter((n) => n.id !== noteId)
}

/**
 * Migrate notes to add missing fields
 * @param {Array} notes - Array of notes
 * @returns {Object} - { migratedNotes, needsMigration }
 */
export function migrateNotes(notes) {
  const needsMigration = notes.some(
    (note) => note.category === undefined || note.locked === undefined
  )
  const migratedNotes = notes.map((note) => ({
    ...note,
    category: note.category ?? '',
    locked: note.locked ?? false
  }))
  return { migratedNotes, needsMigration }
}

/**
 * Export note to markdown file
 * Security: Uses Blob API and programmatic download to export user content safely
 * @param {string} title - Note title
 * @param {string} content - Note content
 */
export function exportNoteToFile(title, content) {
  if (!content) return

  // Create blob from user content (plain text markdown)
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const filename = generateBrainDumpFilename(title)

  // Use temporary anchor element for download (standard browser pattern)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  // Clean up object URL to prevent memory leaks
  URL.revokeObjectURL(url)
}

/**
 * Save notes to localStorage
 * @param {Array} notes - Array of notes to save
 */
export function saveNotesToStorage(notes) {
  localStorage.setItem('brainDumpEntries', JSON.stringify(notes))
}

/**
 * Load notes from localStorage
 * Security: Uses try-catch to handle JSON.parse safely, returns empty array on error
 * @returns {Array} - Array of notes
 */
export function loadNotesFromStorage() {
  try {
    const entriesData = localStorage.getItem('brainDumpEntries')
    // JSON.parse with error handling to prevent injection attacks
    return entriesData ? JSON.parse(entriesData) : []
  } catch (e) {
    logger.warn('Failed to parse brainDumpEntries:', e)
    return []
  }
}
