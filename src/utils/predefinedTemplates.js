/**
 * Predefined Templates Utility
 * Loads and seeds predefined task and routine templates
 * Each template is stored as a separate JSON file in src/data/templates/
 *
 * NOTE FOR CONTRIBUTORS:
 * When adding a new template file to src/data/templates/, you must also:
 * 1. Add an import statement below for your new template file
 * 2. Add the imported template to the allTemplates array
 *
 * Example:
 *   import taskMyNewTask from '../data/templates/task-my-new-task.json'
 *   // Then add 'taskMyNewTask' to the allTemplates array below
 */

import { saveTemplate, getAllTemplates } from './templatesManager'

// Import all predefined template files
// When adding a new template, add its import here
// Task templates
import taskMorningReview from '../data/templates/task-morning-review.json'
import taskExercise from '../data/templates/task-exercise.json'
import taskMealPrep from '../data/templates/task-meal-prep.json'
import taskCodeReview from '../data/templates/task-code-review.json'
import taskJournal from '../data/templates/task-journal.json'
import taskReading from '../data/templates/task-reading.json'
import taskWaterPlants from '../data/templates/task-water-plants.json'

// Routine templates
import routineMorningLaunch from '../data/templates/routine-morning-launch.json'
import routineFocusSession from '../data/templates/routine-focus-session.json'
import routineEveningWindDown from '../data/templates/routine-evening-wind-down.json'
import routineQuickReset from '../data/templates/routine-quick-reset.json'
import routineCreativeWarmUp from '../data/templates/routine-creative-warm-up.json'
import routineWeeklyReview from '../data/templates/routine-weekly-review.json'

// Collect all templates in a single array
const allTemplates = [
  // Tasks
  taskMorningReview,
  taskExercise,
  taskMealPrep,
  taskCodeReview,
  taskJournal,
  taskReading,
  taskWaterPlants,
  // Routines
  routineMorningLaunch,
  routineFocusSession,
  routineEveningWindDown,
  routineQuickReset,
  routineCreativeWarmUp,
  routineWeeklyReview
]

/**
 * Get all predefined templates (tasks + routines)
 * @returns {Array} Array of predefined template objects
 */
export function getPredefinedTemplates() {
  return allTemplates
}

/**
 * Get only predefined task templates
 * @returns {Array} Array of predefined task objects
 */
export function getPredefinedTasks() {
  return allTemplates.filter((t) => t.type === 'task')
}

/**
 * Get only predefined routine templates
 * @returns {Array} Array of predefined routine objects
 */
export function getPredefinedRoutines() {
  return allTemplates.filter((t) => t.type === 'routine')
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
