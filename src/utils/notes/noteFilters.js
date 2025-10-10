/**
 * Utilities for filtering and organizing notes in Brain Dump
 */

/**
 * Get unique categories from all notes
 * @param {Array} notes - Array of note objects
 * @returns {Array} - Sorted array of unique categories
 */
export function getUniqueCategories(notes) {
  const categories = notes
    .map((note) => note.category)
    .filter((cat) => cat && cat.trim())
  return [...new Set(categories)].sort()
}

/**
 * Apply date filter to a note
 * @param {Object} note - Note object with updatedAt property
 * @param {Object} filterOptions - Filter options object
 * @returns {boolean} - Whether the note matches the filter
 */
export function applyDateFilter(note, filterOptions) {
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

/**
 * Filter notes based on search query, category, and date
 * @param {Array} notes - Array of note objects
 * @param {string} searchQuery - Text to search for
 * @param {Object} filterOptions - Filter options object
 * @returns {Array} - Filtered notes
 */
export function filterNotes(notes, searchQuery, filterOptions) {
  return notes.filter((note) => {
    // Search filter
    const query = searchQuery.toLowerCase()
    if (query) {
      const titleMatch = (note.title || '').toLowerCase().includes(query)
      const contentMatch = (note.content || '').toLowerCase().includes(query)
      if (!titleMatch && !contentMatch) return false
    }

    // Category filter
    if (filterOptions.category && note.category !== filterOptions.category) {
      return false
    }

    // Date filter
    return applyDateFilter(note, filterOptions)
  })
}
