/**
 * Template Management Utility
 * Handles CRUD operations for Task and Routine templates using IndexedDB
 */

import { openDB, isIndexedDBAvailable } from './indexedDBManager'
import { generateSecureUUID } from './uuidGenerator'
import { validateTemplateData } from './validation'

const TEMPLATES_STORE = 'templates'

// Supported template export versions
const SUPPORTED_VERSIONS = ['1.0']
const CURRENT_VERSION = '1.0'

/**
 * Initialize templates in IndexedDB
 * @returns {Promise<void>}
 */
export async function initializeTemplates() {
  if (!isIndexedDBAvailable()) return

  const db = await openDB()
  if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
    console.warn('Templates store not found in IndexedDB')
  }
}

/**
 * Get all templates
 * @returns {Promise<Array>} Array of template objects
 */
export async function getAllTemplates() {
  if (!isIndexedDBAvailable()) return []

  try {
    const db = await openDB()
    const tx = db.transaction(TEMPLATES_STORE, 'readonly')
    const store = tx.objectStore(TEMPLATES_STORE)
    const templates = await store.getAll()
    await tx.done
    return templates || []
  } catch (error) {
    console.error('Error loading templates:', error)
    return []
  }
}

/**
 * Get a single template by ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object|null>} Template object or null
 */
export async function getTemplate(templateId) {
  if (!isIndexedDBAvailable()) return null

  try {
    const db = await openDB()
    const tx = db.transaction(TEMPLATES_STORE, 'readonly')
    const store = tx.objectStore(TEMPLATES_STORE)
    const template = await store.get(templateId)
    await tx.done
    return template || null
  } catch (error) {
    console.error('Error loading template:', error)
    return null
  }
}

/**
 * Save a new template
 * @param {Object} template - Template data
 * @returns {Promise<string>} Template ID
 */
export async function saveTemplate(template) {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB not available')
  }

  // Validate template data
  const validation = validateTemplateData(template)
  if (!validation.valid) {
    throw new Error(`Invalid template data: ${validation.errors.join('; ')}`)
  }

  try {
    const db = await openDB()
    const tx = db.transaction(TEMPLATES_STORE, 'readwrite')
    const store = tx.objectStore(TEMPLATES_STORE)

    const templateData = {
      id: template.id || generateSecureUUID(),
      type: template.type, // 'task' or 'routine'
      title: template.title,
      tags: template.tags || [],
      version: template.version || 1,
      createdAt: template.createdAt || new Date().toISOString(),
      lastUsed: template.lastUsed || null,
      // Task-specific fields
      category: template.category || null,
      quadrant: template.quadrant || null,
      dueOffset: template.dueOffset || null,
      // Routine-specific fields
      steps: template.steps || [],
      energyTag: template.energyTag || null,
      estimatedDuration: template.estimatedDuration || null,
      // Metadata
      pinned: template.pinned || false
    }

    await store.put(templateData)
    await tx.done
    return templateData.id
  } catch (error) {
    console.error('Error saving template:', error)
    throw error
  }
}

/**
 * Update an existing template
 * @param {string} templateId - Template ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateTemplate(templateId, updates) {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB not available')
  }

  try {
    const db = await openDB()
    const tx = db.transaction(TEMPLATES_STORE, 'readwrite')
    const store = tx.objectStore(TEMPLATES_STORE)

    const existing = await store.get(templateId)
    if (!existing) {
      throw new Error('Template not found')
    }

    const updated = {
      ...existing,
      ...updates,
      id: templateId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    // Validate the updated template data
    const validation = validateTemplateData(updated)
    if (!validation.valid) {
      throw new Error(`Invalid template data: ${validation.errors.join('; ')}`)
    }

    await store.put(updated)
    await tx.done
  } catch (error) {
    console.error('Error updating template:', error)
    throw error
  }
}

/**
 * Delete a template
 * @param {string} templateId - Template ID
 * @returns {Promise<void>}
 */
export async function deleteTemplate(templateId) {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB not available')
  }

  try {
    const db = await openDB()
    const tx = db.transaction(TEMPLATES_STORE, 'readwrite')
    const store = tx.objectStore(TEMPLATES_STORE)
    await store.delete(templateId)
    await tx.done
  } catch (error) {
    console.error('Error deleting template:', error)
    throw error
  }
}

/**
 * Duplicate a template
 * @param {string} templateId - Template ID to duplicate
 * @returns {Promise<string>} New template ID
 */
export async function duplicateTemplate(templateId) {
  const template = await getTemplate(templateId)
  if (!template) {
    throw new Error('Template not found')
  }

  const duplicate = {
    ...template,
    id: generateSecureUUID(),
    title: `${template.title} (Copy)`,
    createdAt: new Date().toISOString(),
    lastUsed: null
  }

  return await saveTemplate(duplicate)
}

/**
 * Update last used timestamp
 * @param {string} templateId - Template ID
 * @returns {Promise<void>}
 */
export async function markTemplateUsed(templateId) {
  await updateTemplate(templateId, {
    lastUsed: new Date().toISOString()
  })
}

/**
 * Filter templates by criteria
 * @param {Array} templates - All templates
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered templates
 */
export function filterTemplates(templates, filters) {
  return templates.filter((template) => {
    // Type filter
    if (filters.type && template.type !== filters.type) {
      return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) =>
        template.tags.includes(tag)
      )
      if (!hasAllTags) return false
    }

    // Duration range (for routines)
    if (
      filters.durationMin !== undefined &&
      template.estimatedDuration < filters.durationMin
    ) {
      return false
    }
    if (
      filters.durationMax !== undefined &&
      template.estimatedDuration > filters.durationMax
    ) {
      return false
    }

    // Search query
    if (filters.query) {
      const query = filters.query.toLowerCase()
      const matchesTitle = template.title.toLowerCase().includes(query)
      const matchesTags = template.tags.some((tag) =>
        tag.toLowerCase().includes(query)
      )
      const matchesType = template.type.toLowerCase().includes(query)
      if (!matchesTitle && !matchesTags && !matchesType) {
        return false
      }
    }

    return true
  })
}

/**
 * Sort templates by criteria
 * @param {Array} templates - Templates to sort
 * @param {string} sortBy - Sort field
 * @returns {Array} Sorted templates
 */
export function sortTemplates(templates, sortBy) {
  const sorted = [...templates]

  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    case 'lastUsed':
      return sorted.sort((a, b) => {
        if (!a.lastUsed) return 1
        if (!b.lastUsed) return -1
        return new Date(b.lastUsed) - new Date(a.lastUsed)
      })

    case 'duration':
      return sorted.sort((a, b) => {
        const aDur = a.estimatedDuration || 0
        const bDur = b.estimatedDuration || 0
        return aDur - bDur
      })

    case 'dateCreated':
      return sorted.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

    default:
      return sorted
  }
}

/**
 * Export templates to JSON
 * @param {Array<string>} templateIds - Template IDs to export (empty = all)
 * @returns {Promise<Object>} Export data
 */
export async function exportTemplates(templateIds = []) {
  const allTemplates = await getAllTemplates()
  const templatesToExport =
    templateIds.length > 0
      ? allTemplates.filter((t) => templateIds.includes(t.id))
      : allTemplates

  return {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    templates: templatesToExport
  }
}

/**
 * Check if import version is compatible
 * @param {string} version - Version string from import data
 * @returns {boolean} True if version is supported
 */
function isVersionCompatible(version) {
  return SUPPORTED_VERSIONS.includes(version)
}

/**
 * Import templates from JSON
 * @param {Object} data - Import data
 * @returns {Promise<Object>} Import results
 */
export async function importTemplates(data) {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid import data: data must be an object')
  }

  // Validate version field
  if (!data.version) {
    throw new Error('Invalid import data: missing version field')
  }

  // Check version compatibility
  if (!isVersionCompatible(data.version)) {
    throw new Error(
      `Incompatible version: ${data.version}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`
    )
  }

  // Validate templates array
  if (!data.templates || !Array.isArray(data.templates)) {
    throw new Error('Invalid import data: missing templates array')
  }

  const results = {
    imported: 0,
    skipped: 0,
    errors: []
  }

  for (const template of data.templates) {
    try {
      // Validate template structure before import
      const validation = validateTemplateData(template)
      if (!validation.valid) {
        throw new Error(validation.errors.join('; '))
      }

      // Re-ID on collision
      const existing = await getTemplate(template.id)
      if (existing) {
        template.id = generateSecureUUID()
      }

      await saveTemplate(template)
      results.imported++
    } catch (error) {
      results.errors.push({
        template: template.title || 'Unknown',
        error: error.message
      })
      results.skipped++
    }
  }

  return results
}
