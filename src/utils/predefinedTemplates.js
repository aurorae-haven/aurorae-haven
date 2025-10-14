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
import { createLogger } from './logger'

const logger = createLogger('PredefinedTemplates')

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
import taskPapers from '../data/templates/task-papers.json'
import taskLaundry from '../data/templates/task-laundry.json'
import taskDishes from '../data/templates/task-dishes.json'
import taskPetCare from '../data/templates/task-pet-care.json'
import taskCalls from '../data/templates/task-calls.json'

// Routine templates
import routineMorningLaunch from '../data/templates/routine-morning-launch.json'
import routineFocusSession from '../data/templates/routine-focus-session.json'
import routineEveningWindDown from '../data/templates/routine-evening-wind-down.json'
import routineQuickReset from '../data/templates/routine-quick-reset.json'
import routineCreativeWarmUp from '../data/templates/routine-creative-warm-up.json'
import routineWeeklyReview from '../data/templates/routine-weekly-review.json'
import routineCleaning from '../data/templates/routine-cleaning.json'
import routineLitterBoxes from '../data/templates/routine-litter-boxes.json'
import routinePomodoro from '../data/templates/routine-pomodoro.json'

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
  taskPapers,
  taskLaundry,
  taskDishes,
  taskPetCare,
  taskCalls,
  // Routines
  routineMorningLaunch,
  routineFocusSession,
  routineEveningWindDown,
  routineQuickReset,
  routineCreativeWarmUp,
  routineWeeklyReview,
  routineCleaning,
  routineLitterBoxes,
  routinePomodoro
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
    logger.log(`Existing templates count: ${existingTemplates.length}`)
    const existingIds = new Set(existingTemplates.map((t) => t.id))

    // Get all predefined templates
    const predefined = getPredefinedTemplates()
    logger.log(`Predefined templates to seed: ${predefined.length}`)
    logger.log(`Predefined routines: ${predefined.filter(t => t.type === 'routine').length}`)
    logger.log(`Predefined tasks: ${predefined.filter(t => t.type === 'task').length}`)

    // Add templates that don't already exist
    for (const template of predefined) {
      if (existingIds.has(template.id)) {
        logger.log(`Skipping existing template: ${template.id}`)
        results.skipped++
        continue
      }

      try {
        logger.log(`Seeding template: ${template.id} (type: ${template.type})`)
        await saveTemplate(template)
        results.added++
        logger.log(`Successfully added: ${template.id}`)
      } catch (error) {
        logger.error(`Error seeding ${template.id}:`, error)
        results.errors.push({
          template: template.title || 'Unknown',
          error: error.message
        })
      }
    }

    logger.log(`Seeding complete: ${results.added} added, ${results.skipped} skipped, ${results.errors.length} errors`)
    return results
  } catch (err) {
    logger.error('Failed to seed predefined templates:', err)
    throw err
  }
}

/**
 * Check if predefined templates have been seeded
 * @returns {Promise<boolean>} True if ALL predefined templates exist
 */
export async function arePredefinedTemplatesSeeded() {
  try {
    const existingTemplates = await getAllTemplates()

    // Defensive check: ensure we have an array
    if (!Array.isArray(existingTemplates)) {
      logger.warn(
        'arePredefinedTemplatesSeeded: getAllTemplates did not return an array'
      )
      return false
    }

    const predefined = getPredefinedTemplates()
    const existingIds = new Set(existingTemplates.map((t) => t.id))

    // Check if ALL predefined templates exist (changed from "any" to "all")
    // This ensures we reseed if new templates are added to the codebase
    const allExist = predefined.every((t) => existingIds.has(t.id))
    
    if (!allExist) {
      const missing = predefined.filter((t) => !existingIds.has(t.id))
      logger.log(`Missing ${missing.length} predefined templates, will reseed`)
    }
    
    return allExist
  } catch (err) {
    logger.error('Failed to check predefined templates:', err)
    return false
  }
}
