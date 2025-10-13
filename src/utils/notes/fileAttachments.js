// TAB-BDP-FIL-01: OPFS file attachment management
// Implements Origin Private File System storage for secure file attachments
import { createLogger } from '../logger'

const logger = createLogger('FileAttachments')

/**
 * File Attachments Manager
 * Manages file attachments using Origin Private File System (OPFS)
 * Provides secure, private file storage in the browser
 */
export class FileAttachments {
  constructor() {
    this.opfsSupported =
      'storage' in navigator && 'getDirectory' in navigator.storage
    this.dirHandle = null
  }

  /**
   * Initialize OPFS directory handle
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async initialize() {
    if (!this.opfsSupported) {
      logger.warn('OPFS not supported in this browser')
      return false
    }

    try {
      this.dirHandle = await navigator.storage.getDirectory()
      return true
    } catch (e) {
      logger.error('Failed to initialize OPFS:', e)
      return false
    }
  }

  /**
   * Check if OPFS is supported and initialized
   * @returns {boolean} True if OPFS is available
   */
  isAvailable() {
    return this.opfsSupported && this.dirHandle !== null
  }

  /**
   * Save a file to OPFS
   * @param {string} fileName - Name of the file
   * @param {Blob|File|ArrayBuffer|string} content - File content
   * @returns {Promise<Object>} File metadata (name, size, timestamp)
   */
  async saveFile(fileName, content) {
    if (!this.isAvailable()) {
      throw new Error('OPFS not initialized. Call initialize() first.')
    }

    try {
      const fileHandle = await this.dirHandle.getFileHandle(fileName, {
        create: true
      })
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()

      return {
        name: fileName,
        size: content.size || content.length,
        timestamp: Date.now()
      }
    } catch (e) {
      logger.error('Failed to save file:', e)
      throw e
    }
  }

  /**
   * Get a file from OPFS
   * @param {string} fileName - Name of the file to retrieve
   * @returns {Promise<File>} The file object
   */
  async getFile(fileName) {
    if (!this.isAvailable()) {
      throw new Error('OPFS not initialized')
    }

    try {
      const fileHandle = await this.dirHandle.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      return file
    } catch (e) {
      logger.error('Failed to get file:', e)
      throw e
    }
  }

  /**
   * Delete a file from OPFS
   * @param {string} fileName - Name of the file to delete
   * @returns {Promise<boolean>} True if successful
   */
  async deleteFile(fileName) {
    if (!this.isAvailable()) {
      throw new Error('OPFS not initialized')
    }

    try {
      await this.dirHandle.removeEntry(fileName)
      return true
    } catch (e) {
      logger.error('Failed to delete file:', e)
      throw e
    }
  }

  /**
   * List all files in OPFS directory
   * @returns {Promise<Array>} Array of file names
   */
  async listFiles() {
    if (!this.isAvailable()) {
      return []
    }

    try {
      const files = []
      for await (const [name, handle] of this.dirHandle.entries()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile()
          files.push({
            name,
            size: file.size,
            lastModified: file.lastModified,
            type: file.type
          })
        }
      }
      return files
    } catch (e) {
      logger.error('Failed to list files:', e)
      return []
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size string (e.g., "1.5 MB")
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Generate a markdown reference for an attached file
   * @param {string} fileName - Name of the file
   * @param {number} fileSize - Size of the file in bytes
   * @returns {string} Markdown formatted reference
   */
  generateMarkdownReference(fileName, fileSize) {
    const formattedSize = this.formatFileSize(fileSize)
    return `📎 Attachment: ${fileName} (${formattedSize})`
  }
}

export default FileAttachments
