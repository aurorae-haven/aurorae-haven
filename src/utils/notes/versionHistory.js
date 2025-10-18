// TAB-BDP-VSH-01: Version history management
// Implements auto-save snapshots, diff viewer, and restore functionality
import { createLogger } from '../logger'
import { v4 as generateSecureUUID } from 'uuid'

const logger = createLogger('VersionHistory')

/**
 * Version History Manager
 * Manages version snapshots of Brain Dump content with auto-save and restore capabilities
 */
export class VersionHistory {
  constructor(storageKey = 'brainDumpVersions') {
    this.storageKey = storageKey
    this.maxVersions = 50 // Keep last 50 versions
  }

  /**
   * Save a new version snapshot
   * @param {string} content - The content to save
   * @returns {Object} The saved version object
   */
  save(content) {
    const versions = this.getAll()
    const newVersion = {
      id: generateSecureUUID(),
      content,
      timestamp: new Date().toISOString(),
      preview: content.substring(0, 100)
    }

    versions.unshift(newVersion)

    // Keep only last N versions
    if (versions.length > this.maxVersions) {
      versions.length = this.maxVersions
    }

    localStorage.setItem(this.storageKey, JSON.stringify(versions))
    return newVersion
  }

  /**
   * Get all saved versions
   * @returns {Array} Array of version objects
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (e) {
      logger.error('Error loading version history:', e)
      return []
    }
  }

  /**
   * Get a specific version by ID
   * @param {number} id - The version ID
   * @returns {Object|undefined} The version object or undefined
   */
  getById(id) {
    const versions = this.getAll()
    return versions.find((v) => v.id === id)
  }

  /**
   * Restore content from a specific version
   * @param {number} id - The version ID to restore
   * @returns {string|null} The restored content or null if not found
   */
  restore(id) {
    const version = this.getById(id)
    return version ? version.content : null
  }

  /**
   * Clear all version history
   */
  clear() {
    localStorage.removeItem(this.storageKey)
  }

  /**
   * Generate a line-by-line diff between two versions
   * @param {string} oldContent - The old content
   * @param {string} newContent - The new content
   * @returns {Array} Array of diff objects with type, line, and lineNum
   */
  generateDiff(oldContent, newContent) {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    const diff = []

    let i = 0
    let j = 0
    while (i < oldLines.length || j < newLines.length) {
      if (i >= oldLines.length) {
        diff.push({ type: 'added', line: newLines[j], lineNum: j + 1 })
        j++
      } else if (j >= newLines.length) {
        diff.push({ type: 'removed', line: oldLines[i], lineNum: i + 1 })
        i++
      } else if (oldLines[i] === newLines[j]) {
        diff.push({ type: 'unchanged', line: oldLines[i], lineNum: i + 1 })
        i++
        j++
      } else {
        // Simple diff - mark as changed
        diff.push({ type: 'removed', line: oldLines[i], lineNum: i + 1 })
        diff.push({ type: 'added', line: newLines[j], lineNum: j + 1 })
        i++
        j++
      }
    }

    return diff
  }
}

export default VersionHistory
