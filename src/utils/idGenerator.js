/**
 * Centralized ID Generation Utilities
 * Consolidates various ID generation patterns used throughout the codebase
 */

import { v4 as generateSecureUUID } from 'uuid'

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
 * Uses UUID for better uniqueness and import/export compatibility
 * @returns {string} Routine ID in format 'routine_uuid'
 */
export function generateRoutineId() {
  return generateUniqueId('routine')
}

/**
 * Generate a step ID
 * Uses UUID for better uniqueness and collision prevention
 * @returns {string} Step ID in format 'step_uuid'
 */
export function generateStepId() {
  return generateUniqueId('step')
}

/**
 * Generate a habit ID
 * Uses UUID for better uniqueness and import/export compatibility
 * @returns {string} Habit ID
 */
export function generateHabitId() {
  return generateSecureUUID()
}

/**
 * Generate a schedule event ID
 * Uses UUID for better uniqueness and import/export compatibility
 * @returns {string} Schedule event ID
 */
export function generateScheduleId() {
  return generateSecureUUID()
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

/**
 * Generate standard metadata for new entities
 * Creates consistent timestamp and ISO date fields
 * @returns {Object} Metadata object with timestamp, createdAt, and updatedAt
 * @example
 * generateMetadata()
 * // Returns: { timestamp: 1697234567890, createdAt: '2023-10-13T12:34:56.789Z', updatedAt: '2023-10-13T12:34:56.789Z' }
 */
export function generateMetadata() {
  const now = Date.now()
  const isoNow = new Date(now).toISOString()
  return {
    timestamp: now,
    createdAt: isoNow,
    updatedAt: isoNow
  }
}

/**
 * Normalize entity with ID and metadata
 * Combines entity data with generated ID and metadata fields
 * @param {Object} entity - Entity to normalize
 * @param {Object} options - Normalization options
 * @param {string} options.idPrefix - Optional prefix for UUID-based IDs
 * @returns {Object} Normalized entity with ID and metadata
 * @example
 * normalizeEntity({ name: 'Test' }, { idPrefix: 'routine' })
 * // Returns: { name: 'Test', id: 'routine_550e8400-...', timestamp: 1697234567890, createdAt: '...', updatedAt: '...' }
 */
export function normalizeEntity(entity, options = {}) {
  const metadata = generateMetadata()

  // Generate unique ID using UUID for better uniqueness
  let id
  if (entity.id) {
    id = entity.id
  } else if (options.idPrefix) {
    id = generateUniqueId(options.idPrefix)
  } else {
    // Use UUID for entities without prefix
    id = generateSecureUUID()
  }

  return {
    ...entity,
    id,
    ...metadata
  }
}

/**
 * Update entity metadata on modification
 * Updates only the updatedAt and timestamp fields while preserving createdAt
 * @param {Object} entity - Entity to update
 * @returns {Object} Entity with updated metadata
 * @example
 * updateMetadata({ id: 1, name: 'Test', createdAt: '2023-10-13T12:00:00.000Z' })
 * // Returns: { id: 1, name: 'Test', createdAt: '2023-10-13T12:00:00.000Z', updatedAt: '2023-10-13T12:34:56.789Z', timestamp: 1697234567890 }
 */
export function updateMetadata(entity) {
  const now = Date.now()
  return {
    ...entity,
    updatedAt: new Date(now).toISOString(),
    timestamp: now
  }
}

/**
 * Get current timestamp as ISO string
 * Utility for cases where only the current timestamp is needed
 * @returns {string} Current timestamp in ISO 8601 format
 * @example
 * getCurrentTimestamp()
 * // Returns: '2023-10-13T12:34:56.789Z'
 */
export function getCurrentTimestamp() {
  return new Date().toISOString()
}
