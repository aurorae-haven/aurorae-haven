/**
 * Template Instantiation Utility
 * Implements TAB-LIB-13: Spawn new Tasks or Routines from templates
 */

import { generateSecureUUID } from './uuidGenerator'
import { createRoutine } from './routinesManager'
import { validateTemplateData } from './validation'

/**
 * Instantiate a task from a task template
 * Creates a new independent task in localStorage (aurorae_tasks) from template data
 * @param {Object} template - Task template object
 * @returns {Object} Created task object with id and quadrant
 */
export function instantiateTaskFromTemplate(template) {
  if (!template || template.type !== 'task') {
    throw new Error('Invalid task template')
  }

  // Validate template data
  const validation = validateTemplateData(template)
  if (!validation.valid) {
    throw new Error(`Invalid template data: ${validation.errors.join('; ')}`)
  }

  // Validate dueOffset if present
  if (template.dueOffset !== undefined && template.dueOffset !== null) {
    if (typeof template.dueOffset !== 'number') {
      throw new Error('Template dueOffset must be a number')
    }
    if (template.dueOffset <= 0) {
      throw new Error('Template dueOffset must be a positive number')
    }
  }

  // Determine target quadrant (default to urgent_important if not specified)
  const quadrant = template.quadrant || 'urgent_important'

  // Create new independent task
  const task = {
    id: generateSecureUUID(),
    text: template.title,
    completed: false,
    createdAt: Date.now(),
    dueDate: template.dueOffset ? Date.now() + template.dueOffset : null,
    completedAt: null
  }

  // Load existing tasks from localStorage
  let tasks
  try {
    const savedTasks = localStorage.getItem('aurorae_tasks')
    tasks = savedTasks
      ? JSON.parse(savedTasks)
      : {
          urgent_important: [],
          not_urgent_important: [],
          urgent_not_important: [],
          not_urgent_not_important: []
        }
  } catch (error) {
    console.error('Failed to parse saved tasks:', error)
    tasks = {
      urgent_important: [],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    }
  }

  // Add task to appropriate quadrant
  if (!tasks[quadrant]) {
    tasks[quadrant] = []
  }
  tasks[quadrant].push(task)

  // Save back to localStorage
  try {
    localStorage.setItem('aurorae_tasks', JSON.stringify(tasks))
  } catch (error) {
    console.error('Failed to save task')
    // Check for quota exceeded error
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      throw new Error(
        'Storage quota exceeded. Please free up space by deleting old tasks.'
      )
    }
    throw new Error('Failed to save task to storage')
  }

  return {
    task,
    quadrant
  }
}

/**
 * Instantiate a routine from a routine template
 * Creates a new independent routine in IndexedDB from template data
 * @param {Object} template - Routine template object
 * @returns {Promise<string>} Created routine ID
 */
export async function instantiateRoutineFromTemplate(template) {
  if (!template || template.type !== 'routine') {
    throw new Error('Invalid routine template')
  }

  // Validate template data
  const validation = validateTemplateData(template)
  if (!validation.valid) {
    throw new Error(`Invalid template data: ${validation.errors.join('; ')}`)
  }

  // Additional validation for routine-specific fields
  if (template.steps && template.steps.length > 0) {
    // Validate each step has required fields
    for (let i = 0; i < template.steps.length; i++) {
      const step = template.steps[i]
      if (!step || typeof step !== 'object') {
        throw new Error(`Step ${i} must be an object`)
      }
      if (typeof step.label !== 'string' || step.label.trim() === '') {
        throw new Error(`Step ${i} must have a non-empty label`)
      }
      if (
        step.duration !== undefined &&
        (typeof step.duration !== 'number' || step.duration < 0)
      ) {
        throw new Error(`Step ${i} duration must be a non-negative number`)
      }
    }
  }

  // Validate tags are strings
  if (template.tags && template.tags.length > 0) {
    for (let i = 0; i < template.tags.length; i++) {
      if (typeof template.tags[i] !== 'string') {
        throw new Error(`Tag ${i} must be a string`)
      }
    }
  }

  // Validate estimatedDuration
  if (
    template.estimatedDuration !== undefined &&
    template.estimatedDuration !== null &&
    (typeof template.estimatedDuration !== 'number' ||
      template.estimatedDuration < 0)
  ) {
    throw new Error('estimatedDuration must be a non-negative number')
  }

  // Create new independent routine
  const routine = {
    name: template.title,
    steps: template.steps || [],
    tags: template.tags || [],
    energyTag: template.energyTag || null,
    estimatedDuration: template.estimatedDuration || null,
    createdAt: new Date().toISOString()
  }

  // Use existing createRoutine function from routinesManager
  const routineId = await createRoutine(routine)

  return routineId
}

/**
 * Instantiate a template (task or routine)
 * Main entry point that routes to appropriate instantiation function
 * @param {Object} template - Template object (task or routine)
 * @returns {Promise<Object>} Created entity details
 */
export async function instantiateTemplate(template) {
  if (!template) {
    throw new Error('Template is required')
  }

  if (template.type === 'task') {
    const result = instantiateTaskFromTemplate(template)
    return {
      type: 'task',
      id: result.task.id,
      quadrant: result.quadrant,
      task: result.task
    }
  } else if (template.type === 'routine') {
    const routineId = await instantiateRoutineFromTemplate(template)
    return {
      type: 'routine',
      id: routineId
    }
  } else {
    throw new Error(`Unknown template type: ${template.type}`)
  }
}
