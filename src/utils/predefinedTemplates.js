/**
 * Predefined Templates Utility
 * Loads and seeds predefined task and routine templates
 */

import predefinedTasks from '../data/templates/tasks.json'
import predefinedRoutines from '../data/templates/routines.json'
import { saveTemplate, getAllTemplates } from './templatesManager'

/**
 * Get all predefined templates (tasks + routines)
 * @returns {Array} Array of predefined template objects
 */
export function getPredefinedTemplates() {
  return [...predefinedTasks, ...predefinedRoutines]
}

/**
 * Get only predefined task templates
 * @returns {Array} Array of predefined task objects
 */
export function getPredefinedTasks() {
  return predefinedTasks
}

/**
 * Get only predefined routine templates
 * @returns {Array} Array of predefined routine objects
 */
export function getPredefinedRoutines() {
  return predefinedRoutines
}

/**
 * Seed predefined templates into IndexedDB
 * Only adds templates that don't already exist (by ID)
 * @returns {Promise<Object>} Result with counts of added and skipped templates
 */
export async function seedPredefinedTemplates() {
  const results = {
    added: 0,
    skipped: 0,
    errors: []
  }

  try {
    // Get existing templates
    const existingTemplates = await getAllTemplates()
    const existingIds = new Set(existingTemplates.map((t) => t.id))

    // Get all predefined templates
    const predefined = getPredefinedTemplates()

    // Add templates that don't already exist
    for (const template of predefined) {
      if (existingIds.has(template.id)) {
        results.skipped++
        continue
      }

      try {
        await saveTemplate(template)
        results.added++
      } catch (error) {
        results.errors.push({
          template: template.title || 'Unknown',
          error: error.message
        })
      }
    }

    return results
  } catch (error) {
    console.error('Failed to seed predefined templates:', error)
    throw error
  }
}

/**
 * Check if predefined templates have been seeded
 * @returns {Promise<boolean>} True if at least one predefined template exists
 */
export async function arePredefinedTemplatesSeeded() {
  try {
    const existingTemplates = await getAllTemplates()
    const predefined = getPredefinedTemplates()
    const predefinedIds = new Set(predefined.map((t) => t.id))

    // Check if any predefined template exists
    return existingTemplates.some((t) => predefinedIds.has(t.id))
  } catch (error) {
    console.error('Failed to check predefined templates:', error)
    return false
  }
}
