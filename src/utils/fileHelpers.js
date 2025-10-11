/**
 * File utility functions for Brain Dump
 * Handles filename sanitization and formatting
 */

// Windows reserved device names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i

/**
 * Sanitizes a string to be safe for use as a filename
 * Removes dangerous characters, handles OS-specific issues, and limits length
 * @param {string} text - The text to sanitize
 * @param {number} maxLength - Maximum length of the sanitized string (default: 30)
 * @returns {string} - Sanitized filename-safe string
 */
export function sanitizeFilename(text, maxLength = 30) {
  if (!text || typeof text !== 'string') {
    return 'untitled'
  }

  // Remove control characters (ASCII 0-31) and DEL (127)
  // eslint-disable-next-line no-control-regex -- Intentionally removing control characters for filename safety
  let sanitized = text.replace(/[\x00-\x1F\x7F]/g, '')

  // Block path traversal patterns specifically (../ or ..\)
  sanitized = sanitized.replace(/\.\.[/\\]/g, '_')

  // Remove Windows reserved characters: < > : " / \ | ? *
  sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '_')

  // Replace remaining special characters and whitespace (including dots) with underscore
  sanitized = sanitized.replace(/[^a-z0-9]/gi, '_')
  // Collapse multiple consecutive underscores
  sanitized = sanitized.replace(/_+/g, '_')

  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '')

  // Convert to lowercase for consistency
  sanitized = sanitized.toLowerCase()

  // Check for Windows reserved names
  if (WINDOWS_RESERVED_NAMES.test(sanitized)) {
    sanitized = `file_${sanitized}`
  }

  // Handle empty result after sanitization
  if (!sanitized) {
    return 'untitled'
  }

  // Limit length
  return sanitized.slice(0, maxLength)
}

/**
 * Generates a Brain Dump export filename with the format:
 * braindump_title_YYYYMMDD_HHmm.md
 * @param {string} title - The note title
 * @returns {string} - Formatted filename
 */
export function generateBrainDumpFilename(title) {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  const safeTitle = sanitizeFilename(title)

  return `braindump_${safeTitle}_${dateStr}_${timeStr}.md`
}

/**
 * Extracts title from a Brain Dump filename
 * Removes braindump_ prefix, date/time suffix, and .md extension
 * Converts underscores back to spaces
 * @param {string} filename - The filename to parse
 * @returns {string} - Extracted title
 */
export function extractTitleFromFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'Imported Note'
  }

  let noteTitle = filename
    .replace(/\.md$/i, '') // Remove .md extension
    .replace(/^braindump_/i, '') // Remove braindump_ prefix
    .replace(/_\d{8}_\d{4}$/, '') // Remove date/time suffix (e.g., _20250115_1430)
    .replace(/_/g, ' ') // Convert underscores to spaces

  return noteTitle || 'Imported Note'
}
