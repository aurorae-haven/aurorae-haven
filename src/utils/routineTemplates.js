// Routine Templates - Predefined and custom routine templates
// TAB-RTN-08, TAB-RTN-32, TAB-RTN-50: Template management system

import { put, getAll, getById, deleteById, STORES } from './indexedDBManager'
import { normalizeEntity, updateMetadata } from './idGenerator'
import { createRoutine } from './routinesManager'

/**
 * Predefined routine templates
 * TAB-RTN-50: Library of common routines
 */
const PREDEFINED_TEMPLATES = [
  {
    name: 'Morning Routine',
    description: 'Start your day with energy and focus',
    category: 'morning',
    energyTag: 'high',
    tags: ['morning', 'productivity'],
    steps: [
      {
        label: 'Hydrate',
        duration: 60,
        description: 'Drink a glass of water',
        energyTag: 'low'
      },
      {
        label: 'Stretch',
        duration: 300,
        description: '5-minute full body stretch',
        energyTag: 'medium'
      },
      {
        label: 'Meditate',
        duration: 600,
        description: 'Mindfulness meditation',
        energyTag: 'low'
      },
      {
        label: 'Plan Day',
        duration: 300,
        description: 'Review calendar and priorities',
        energyTag: 'medium'
      }
    ]
  },
  {
    name: 'Evening Wind-Down',
    description: 'Prepare for restful sleep',
    category: 'evening',
    energyTag: 'low',
    tags: ['evening', 'relaxation'],
    steps: [
      {
        label: 'Tidy Up',
        duration: 600,
        description: 'Quick 10-minute cleanup',
        energyTag: 'medium'
      },
      {
        label: 'Journal',
        duration: 600,
        description: 'Reflect on the day',
        energyTag: 'low'
      },
      {
        label: 'Prepare Tomorrow',
        duration: 300,
        description: 'Lay out clothes, pack bag',
        energyTag: 'low'
      },
      {
        label: 'Relaxation',
        duration: 900,
        description: 'Read, listen to music, or meditate',
        energyTag: 'low'
      }
    ]
  },
  {
    name: 'Quick Workout',
    description: '15-minute high-intensity workout',
    category: 'exercise',
    energyTag: 'high',
    tags: ['exercise', 'fitness', 'quick'],
    steps: [
      {
        label: 'Warm-up',
        duration: 180,
        description: 'Light cardio and dynamic stretches',
        energyTag: 'medium'
      },
      {
        label: 'Push-ups',
        duration: 120,
        description: '3 sets to failure',
        energyTag: 'high'
      },
      {
        label: 'Squats',
        duration: 120,
        description: '3 sets of 20 reps',
        energyTag: 'high'
      },
      {
        label: 'Planks',
        duration: 120,
        description: '3 sets of 30 seconds',
        energyTag: 'high'
      },
      {
        label: 'Burpees',
        duration: 120,
        description: '3 sets of 10 reps',
        energyTag: 'high'
      },
      {
        label: 'Cool-down',
        duration: 240,
        description: 'Static stretches',
        energyTag: 'low'
      }
    ]
  }
]

/**
 * Get predefined templates
 * @returns {Array} Array of predefined templates
 */
export function getPredefinedTemplates() {
  return PREDEFINED_TEMPLATES.map((template, index) => ({
    ...template,
    id: `template_predefined_${index}`,
    isPredefined: true,
    totalDuration: template.steps.reduce((sum, step) => sum + step.duration, 0)
  }))
}

/**
 * Create template from routine
 * TAB-RTN-08, TAB-RTN-32: Save routine as reusable template
 * @param {Object} routine - Routine to convert to template
 * @param {string} templateName - Name for the template
 * @param {string} category - Template category (morning, evening, exercise, etc.)
 * @returns {Promise<string>} Template ID
 */
export async function createTemplate(
  routine,
  templateName,
  category = 'custom'
) {
  const template = normalizeEntity(
    {
      name: templateName || routine.name || routine.title,
      description: routine.description || '',
      category,
      energyTag: routine.energyTag || 'medium',
      tags: routine.tags || [],
      steps: routine.steps.map((step) => ({
        label: step.label,
        duration: step.duration,
        description: step.description || '',
        energyTag: step.energyTag || 'medium'
      })),
      totalDuration:
        routine.totalDuration ||
        routine.steps.reduce((sum, step) => sum + step.duration, 0),
      isCustom: true,
      sourceRoutineId: routine.id
    },
    { idPrefix: 'template' }
  )

  await put(STORES.TEMPLATES, template)
  return template.id
}

/**
 * Get all templates (predefined + custom)
 * @param {Object} options - Query options
 * @param {string} options.sortBy - Sort field
 * @param {string} options.order - Sort order (asc/desc)
 * @returns {Promise<Array>} Array of templates
 */
export async function getTemplates(options = {}) {
  const customTemplates = await getAll(STORES.TEMPLATES)
  const predefinedTemplates = getPredefinedTemplates()

  let allTemplates = [...predefinedTemplates, ...customTemplates]

  // Apply sorting if requested
  if (options.sortBy) {
    allTemplates.sort((a, b) => {
      let aVal = a[options.sortBy]
      let bVal = b[options.sortBy]

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      // String comparison for name
      if (options.sortBy === 'name' || options.sortBy === 'title') {
        const nameA = (a.name || a.title || '').toLowerCase()
        const nameB = (b.name || b.title || '').toLowerCase()
        return options.order === 'desc'
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB)
      }

      // Numeric comparison
      if (options.order === 'desc') {
        return bVal - aVal
      }
      return aVal - bVal
    })
  }

  return allTemplates
}

/**
 * Get template by ID
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Template data
 */
export async function getTemplate(id) {
  // Check if it's a predefined template
  if (id.startsWith('template_predefined_')) {
    const predefinedTemplates = getPredefinedTemplates()
    return predefinedTemplates.find((t) => t.id === id)
  }

  return await getById(STORES.TEMPLATES, id)
}

/**
 * Update template
 * @param {Object} template - Updated template data
 * @returns {Promise<string>} Template ID
 */
export async function updateTemplate(template) {
  // Cannot update predefined templates
  if (template.isPredefined) {
    throw new Error('Cannot modify predefined templates')
  }

  const updated = updateMetadata({
    ...template,
    totalDuration: template.steps.reduce((sum, step) => sum + step.duration, 0)
  })

  await put(STORES.TEMPLATES, updated)
  return updated.id
}

/**
 * Delete template
 * @param {string} id - Template ID
 * @returns {Promise<void>}
 */
export async function deleteTemplate(id) {
  // Cannot delete predefined templates
  if (id.startsWith('template_predefined_')) {
    throw new Error('Cannot delete predefined templates')
  }

  return await deleteById(STORES.TEMPLATES, id)
}

/**
 * Instantiate template as new routine
 * TAB-RTN-50: Create routine from template
 * @param {string} templateId - Template ID
 * @param {string} routineName - Optional name for new routine
 * @returns {Promise<string>} New routine ID
 */
export async function instantiateTemplate(templateId, routineName) {
  const template = await getTemplate(templateId)

  if (!template) {
    throw new Error('Template not found')
  }

  const routine = {
    name: routineName || template.name,
    description: template.description || '',
    energyTag: template.energyTag || 'medium',
    tags: [...(template.tags || [])],
    steps: template.steps.map((step, index) => ({
      ...step,
      id: `step_${Date.now()}_${index}`,
      order: index
    })),
    templateId: templateId
  }

  return await createRoutine(routine)
}

/**
 * Filter templates by criteria
 * @param {Array} templates - Templates to filter
 * @param {Object} filters - Filter criteria
 * @param {string} filters.category - Category filter
 * @param {Array} filters.tags - Tags to filter by
 * @param {string} filters.energyTag - Energy level filter
 * @param {boolean} filters.customOnly - Show only custom templates
 * @returns {Array} Filtered templates
 */
export function filterTemplates(templates, filters = {}) {
  let filtered = [...templates]

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((t) => t.category === filters.category)
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((t) => {
      const templateTags = t.tags || []
      return filters.tags.some((tag) => templateTags.includes(tag))
    })
  }

  // Filter by energy tag
  if (filters.energyTag) {
    filtered = filtered.filter((t) => t.energyTag === filters.energyTag)
  }

  // Filter custom only
  if (filters.customOnly) {
    filtered = filtered.filter((t) => t.isCustom)
  }

  return filtered
}

/**
 * Validate template structure
 * @param {Object} template - Template to validate
 * @returns {Object} Validation result {valid, errors}
 */
export function validateTemplate(template) {
  const errors = []

  if (!template.name) {
    errors.push('Template must have a name')
  }

  if (!template.steps || template.steps.length === 0) {
    errors.push('Template must have at least one step')
  }

  if (template.steps) {
    template.steps.forEach((step, index) => {
      if (!step.label) {
        errors.push(`Step ${index + 1} must have a label`)
      }
      if (!step.duration || step.duration < 10 || step.duration > 7200) {
        errors.push(
          `Step ${index + 1} duration must be between 10 and 7200 seconds`
        )
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
