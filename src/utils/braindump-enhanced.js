// Brain Dump Enhanced Features
// TAB-BDP: Implements file attachments, backlinks, version history, sanitization, and accessibility

// Track if hooks have been registered to prevent duplicate registration
const HOOK_REGISTERED = Symbol.for('aurorae_haven_sanitization_hook')
const STORED_CONFIG = Symbol.for('aurorae_haven_sanitization_config')

// TAB-BDP-SAN-01: Enhanced sanitization configuration
export function configureSanitization(DOMPurifyInstance) {
  const DOMPurify = DOMPurifyInstance || window.DOMPurify

  if (!DOMPurify) {
    console.error('DOMPurify not loaded')
    return null
  }

  // Check if hooks have already been registered (idempotency guard)
  if (DOMPurify[HOOK_REGISTERED]) {
    return DOMPurify[STORED_CONFIG]
  }

  const config = {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'code',
      'pre',
      'a',
      'img',
      'blockquote',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'input', // for checkboxes
      // KaTeX tags
      'span',
      'div',
      'annotation',
      'semantics',
      'mrow',
      'mi',
      'mo',
      'mn',
      'ms',
      'mtext',
      'math',
      'svg',
      'path',
      'g',
      'use',
      'defs'
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'type',
      'checked',
      'disabled',
      'class',
      'id',
      'data-backlink', // for backlinks
      // KaTeX attributes
      'style',
      'aria-hidden',
      'focusable',
      'role',
      'xmlns',
      'width',
      'height',
      'viewBox',
      'd',
      'transform',
      'fill',
      'stroke'
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel):|#|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i,
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    FORCE_BODY: false,
    SANITIZE_DOM: true,
    ADD_ATTR: ['target'],
    ADD_URI_SAFE_ATTR: []
  }

  // Store config and mark hooks as registered to prevent duplicate registration
  DOMPurify[STORED_CONFIG] = config

  // Add hook to sanitize links and images (only if addHook method exists)
  if (typeof DOMPurify.addHook === 'function') {
    DOMPurify[HOOK_REGISTERED] = true

    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      // Sanitize anchor tags
      if (node.tagName === 'A') {
        const href = node.getAttribute('href')
        if (href) {
          const normalizedHref = href.trim().toLowerCase()

          // Open external links in new tab (use normalized for consistent check)
          if (
            normalizedHref.startsWith('http://') ||
            normalizedHref.startsWith('https://')
          ) {
            node.setAttribute('target', '_blank')
            node.setAttribute('rel', 'noopener noreferrer')
          }

          // Validate internal links (use normalized for consistent check)
          if (normalizedHref.startsWith('#')) {
            // Internal anchor link - safe
          }

          // Block javascript:, data:, and vbscript: URIs for links (XSS prevention)
          if (
            normalizedHref.startsWith('javascript:') ||
            normalizedHref.startsWith('data:') ||
            normalizedHref.startsWith('vbscript:')
          ) {
            node.removeAttribute('href')
          }
        }
      }

      // Sanitize image tags to prevent data: URI XSS attacks
      if (node.tagName === 'IMG') {
        const src = node.getAttribute('src')
        // Block javascript:, data:, and vbscript: URIs in image sources (XSS prevention)
        if (src) {
          const normalizedSrc = src.trim().toLowerCase()
          if (
            normalizedSrc.startsWith('javascript:') ||
            normalizedSrc.startsWith('data:') ||
            normalizedSrc.startsWith('vbscript:')
          ) {
            node.removeAttribute('src')
            // Optionally set a placeholder or remove the element entirely
            node.setAttribute('alt', 'Blocked: Unsafe image source')
          }
        }
      }
    })
  }

  return config
}

// TAB-BDP-VSH-01: Version history management
export class VersionHistory {
  constructor(storageKey = 'brainDumpVersions') {
    this.storageKey = storageKey
    this.maxVersions = 50 // Keep last 50 versions
  }

  save(content) {
    const versions = this.getAll()
    const newVersion = {
      id: Date.now(),
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

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Error loading version history:', e)
      return []
    }
  }

  getById(id) {
    const versions = this.getAll()
    return versions.find((v) => v.id === id)
  }

  restore(id) {
    const version = this.getById(id)
    return version ? version.content : null
  }

  clear() {
    localStorage.removeItem(this.storageKey)
  }

  // Generate diff between two versions
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

// TAB-BDP-BLK-01: Backlinks functionality
export class Backlinks {
  constructor() {
    this.backlinkPattern = /\[\[([^\]]+)\]\]/g
  }

  // Extract all backlinks from content
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

  // Convert [[link]] syntax to HTML
  renderLinks(content) {
    return content.replace(this.backlinkPattern, (match, linkText) => {
      return `<a href="#" class="backlink" data-backlink="${linkText}">${linkText}</a>`
    })
  }

  // Get all backlinks from localStorage entries
  getAllBacklinks(currentEntryId = null) {
    const entries = this.getStoredEntries()
    const backlinksMap = new Map()

    entries.forEach((entry) => {
      if (entry.id === currentEntryId) return // Skip current entry

      const links = this.extractLinks(entry.content)
      links.forEach((link) => {
        if (!backlinksMap.has(link.text)) {
          backlinksMap.set(link.text, [])
        }
        backlinksMap.get(link.text).push({
          entryId: entry.id,
          entryTitle: entry.title || 'Untitled',
          timestamp: entry.timestamp,
          preview: entry.content.substring(0, 100)
        })
      })
    })

    return backlinksMap
  }

  // Get stored entries (stub - adapt to actual storage structure)
  getStoredEntries() {
    try {
      const data = localStorage.getItem('brainDumpEntries')
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Error loading entries:', e)
      return []
    }
  }
}

// TAB-BDP-FIL-01: OPFS file attachment management
export class FileAttachments {
  constructor() {
    this.opfsSupported =
      'storage' in navigator && 'getDirectory' in navigator.storage
    this.dirHandle = null
  }

  async initialize() {
    if (!this.opfsSupported) {
      console.warn('OPFS not supported in this browser')
      return false
    }

    try {
      this.dirHandle = await navigator.storage.getDirectory()
      return true
    } catch (e) {
      console.error('Failed to initialize OPFS:', e)
      return false
    }
  }

  async saveFile(fileName, content) {
    if (!this.opfsSupported || !this.dirHandle) {
      throw new Error('OPFS not initialized')
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
      console.error('Failed to save file:', e)
      throw e
    }
  }

  async getFile(fileName) {
    if (!this.opfsSupported || !this.dirHandle) {
      throw new Error('OPFS not initialized')
    }

    try {
      const fileHandle = await this.dirHandle.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      return file
    } catch (e) {
      console.error('Failed to get file:', e)
      throw e
    }
  }

  async deleteFile(fileName) {
    if (!this.opfsSupported || !this.dirHandle) {
      throw new Error('OPFS not initialized')
    }

    try {
      await this.dirHandle.removeEntry(fileName)
      return true
    } catch (e) {
      console.error('Failed to delete file:', e)
      throw e
    }
  }

  async listFiles() {
    if (!this.opfsSupported || !this.dirHandle) {
      return []
    }

    try {
      const files = []
      for await (const entry of this.dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile()
          files.push({
            name: entry.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          })
        }
      }
      return files
    } catch (e) {
      console.error('Failed to list files:', e)
      return []
    }
  }
}

// TAB-BDP-ACC-01: Accessibility enhancements
export class AccessibilityHelper {
  static announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  static setupKeyboardNavigation(element, handlers) {
    element.addEventListener('keydown', (e) => {
      if (handlers[e.key]) {
        e.preventDefault()
        handlers[e.key](e)
      }
    })
  }

  static addAriaLabels(editor, preview) {
    // Editor
    if (editor) {
      editor.setAttribute('aria-label', 'Markdown editor for brain dump notes')
      editor.setAttribute('role', 'textbox')
      editor.setAttribute('aria-multiline', 'true')
    }

    // Preview
    if (preview) {
      preview.setAttribute('aria-label', 'Markdown preview')
      preview.setAttribute('role', 'article')
      preview.setAttribute('aria-live', 'polite')
    }
  }

  static setFocusManagement(container) {
    // Ensure focusable elements have proper focus indicators
    const focusableElements = container.querySelectorAll(
      'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )

    focusableElements.forEach((el) => {
      if (!el.hasAttribute('aria-label') && !el.textContent.trim()) {
        console.warn('Focusable element missing accessible label:', el)
      }
    })
  }
}

// Initialize all features
export function initializeBrainDumpEnhancements() {
  const versionHistory = new VersionHistory()
  const backlinks = new Backlinks()
  const fileAttachments = new FileAttachments()

  // Initialize OPFS
  fileAttachments.initialize().then((success) => {
    if (success) {
      console.log('OPFS initialized successfully')
    }
  })

  return {
    versionHistory,
    backlinks,
    fileAttachments,
    sanitizationConfig: configureSanitization()
  }
}
