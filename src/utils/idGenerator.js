/**
 * Centralized ID Generation Utilities
 * Consolidates various ID generation patterns used throughout the codebase
 */

import { generateSecureUUID } from './uuidGenerator'

/**
 * Generate a timestamp-based ID with optional prefix
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string|number} Timestamp ID (string if prefix provided, number otherwise)
 * @example
 * generateTimestampId() // 1697234567890
 * generateTimestampId('routine') // 'routine_1697234567890'
 */
export function generateTimestampId(prefix = '') {
  const timestamp = Date.now()
  return prefix ? `${prefix}_${timestamp}` : timestamp
}

/**
 * Generate a unique UUID-based ID with optional prefix
 * Uses cryptographically secure random generation
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} UUID-based ID
 * @example
 * generateUniqueId() // '550e8400-e29b-41d4-a716-446655440000'
 * generateUniqueId('template') // 'template_550e8400-e29b-41d4-a716-446655440000'
 */
export function generateUniqueId(prefix = '') {
  const uuid = generateSecureUUID()
  return prefix ? `${prefix}_${uuid}` : uuid
}

/**
 * Generate a routine ID
 * Maintained for backward compatibility with existing code
 * @returns {string} Routine ID in format 'routine_timestamp'
 */
export function generateRoutineId() {
  return generateTimestampId('routine')
}

/**
 * Generate a step ID
 * Maintained for backward compatibility with existing code
 * @returns {string} Step ID in format 'step_timestamp'
 */
export function generateStepId() {
  return generateTimestampId('step')
}

/**
 * Generate a habit ID
 * @returns {number} Numeric timestamp ID
 */
export function generateHabitId() {
  return Date.now()
}

/**
 * Generate a schedule event ID
 * @returns {number} Numeric timestamp ID
 */
export function generateScheduleId() {
  return Date.now()
}

/**
 * Generate a template ID
 * Uses UUID for better uniqueness and import/export compatibility
 * @returns {string} Template ID
 */
export function generateTemplateId() {
  return generateSecureUUID()
}

/**
 * Generate a note/dump ID
 * Uses UUID for better uniqueness
 * @returns {string} Note ID
 */
export function generateNoteId() {
  return generateSecureUUID()
}

/**
 * Check if an ID needs regeneration (for collision handling)
 * @param {*} id - The ID to check
 * @returns {boolean} True if ID should be regenerated
 */
export function shouldRegenerateId(id) {
  return !id || id === '' || id === null || id === undefined
}

/**
 * Ensure an entity has a valid ID, generating one if needed
 * @param {Object} entity - Entity that may need an ID
 * @param {Function} idGenerator - Function to generate ID if needed
 * @returns {Object} Entity with guaranteed valid ID
 */
export function ensureId(entity, idGenerator = generateSecureUUID) {
  return {
    ...entity,
    id: shouldRegenerateId(entity.id) ? idGenerator() : entity.id
  }
}
