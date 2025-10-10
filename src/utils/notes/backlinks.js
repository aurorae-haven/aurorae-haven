// TAB-BDP-BLK-01: Backlinks functionality
// Implements wiki-style [[link]] syntax and backlinks panel

/**
 * Backlinks Manager
 * Handles wiki-style backlinks with [[link]] syntax
 */
export class Backlinks {
  constructor() {
    this.backlinkPattern = /\[\[([^\]]+)\]\]/g
  }

  /**
   * Extract all backlinks from content
   * @param {string} content - The content to parse
   * @returns {Array} Array of link objects with text and position
   */
  extractLinks(content) {
    const links = []
    let match
    const regex = new RegExp(this.backlinkPattern)

    while ((match = regex.exec(content)) !== null) {
      links.push({
        text: match[1],
        position: match.index
      })
    }

    return links
  }

  /**
   * Convert [[link]] syntax to HTML anchor tags
   * @param {string} content - The content with [[link]] syntax
   * @returns {string} HTML with converted links
   */
  renderLinks(content) {
    return content.replace(this.backlinkPattern, (match, linkText) => {
      return `<a href="#" class="backlink" data-backlink="${linkText}">${linkText}</a>`
    })
  }

  /**
   * Get all backlinks from stored notes
   * @param {Array} notes - Array of note objects
   * @param {string} currentEntryId - ID of current entry to skip
   * @returns {Map} Map of link text to array of referring notes
   */
  getAllBacklinks(notes, currentEntryId = null) {
    const backlinksMap = new Map()

    notes.forEach((note) => {
      if (note.id === currentEntryId) return // Skip current entry

      const links = this.extractLinks(note.content)
      links.forEach((link) => {
        if (!backlinksMap.has(link.text)) {
          backlinksMap.set(link.text, [])
        }
        backlinksMap.get(link.text).push({
          noteId: note.id,
          noteTitle: note.title || 'Untitled',
          timestamp: note.updatedAt || note.createdAt,
          preview: note.content.substring(0, 100)
        })
      })
    })

    return backlinksMap
  }

  /**
   * Get backlinks that reference a specific note's title
   * @param {Array} notes - Array of note objects
   * @param {string} noteTitle - Title of the note to find references to
   * @param {string} currentEntryId - ID of current entry to skip
   * @returns {Array} Array of notes that reference this title
   */
  getBacklinksToNote(notes, noteTitle, currentEntryId = null) {
    const referencingNotes = []

    notes.forEach((note) => {
      if (note.id === currentEntryId) return

      const links = this.extractLinks(note.content)
      const hasReference = links.some(
        (link) => link.text.toLowerCase() === noteTitle.toLowerCase()
      )

      if (hasReference) {
        referencingNotes.push({
          id: note.id,
          title: note.title || 'Untitled',
          preview: note.content.substring(0, 100),
          timestamp: note.updatedAt || note.createdAt
        })
      }
    })

    return referencingNotes
  }
}

export default Backlinks
