// Data validation utilities
// Centralized validation logic for import/export data structures

// Validation types for field definitions
const VALIDATION_TYPES = {
  STRING: 'string',
  ARRAY: 'array'
}

// BrainDump field type definitions for validation
const BRAIN_DUMP_FIELDS = {
  content: VALIDATION_TYPES.STRING,
  tags: VALIDATION_TYPES.STRING,
  versions: VALIDATION_TYPES.ARRAY,
  entries: VALIDATION_TYPES.ARRAY
}

/**
 * Check if value matches expected type
 * @param {*} value - Value to check
 * @param {string} expectedType - Expected type (from VALIDATION_TYPES)
 * @returns {boolean}
 */
function isValidFieldType(value, expectedType) {
  if (value === undefined || value === null) {
    return true // Optional fields are valid if missing
  }

  if (expectedType === VALIDATION_TYPES.STRING) {
    return typeof value === 'string'
  }
  if (expectedType === VALIDATION_TYPES.ARRAY) {
    return Array.isArray(value)
  }
  return false
}

/**
 * Validate object fields against configuration
 * @param {object} obj - Object to validate
 * @param {object} fieldsConfig - Field configuration {fieldName: expectedType}
 * @param {string} prefix - Prefix for error messages
 * @returns {string[]} - Array of error messages (empty if valid)
 */
function validateObjectFields(obj, fieldsConfig, prefix = '') {
  const errors = []

  for (const [fieldName, expectedType] of Object.entries(fieldsConfig)) {
    if (obj[fieldName] !== undefined && obj[fieldName] !== null) {
      if (!isValidFieldType(obj[fieldName], expectedType)) {
        errors.push(
          `${prefix}${fieldName} must be a ${expectedType} (found: ${typeof obj[fieldName]})`
        )
      }
    }
  }

  return errors
}

/**
 * Validate array fields in object
 * @param {object} obj - Object to validate
 * @param {string[]} fieldNames - Array of field names to check
 * @param {string} expectedType - Expected type for each field
 * @param {string} prefix - Prefix for error messages
 * @returns {string[]} - Array of error messages (empty if valid)
 */
function validateArrayFields(obj, fieldNames, expectedType, prefix = '') {
  const errors = []

  for (const fieldName of fieldNames) {
    if (
      obj[fieldName] !== undefined &&
      !isValidFieldType(obj[fieldName], expectedType)
    ) {
      errors.push(
        `${prefix}${fieldName} must be an ${expectedType} (found: ${typeof obj[fieldName]})`
      )
    }
  }

  return errors
}

/**
 * @typedef {Object} ValidateExportResult
 * @property {boolean} valid - Whether the data is valid for export
 * @property {string[]} errors - List of validation error messages
 * @property {string|null} stringified - JSON string if serialization successful
 */

/**
 * Validate export data structure and test JSON serialization
 * @param {object} data - Data object to validate
 * @returns {ValidateExportResult}
 */
export function validateExportData(data) {
  const errors = []

  // Check required fields exist and are arrays
  const arrayFields = ['tasks', 'sequences', 'habits', 'dumps', 'schedule']
  errors.push(...validateArrayFields(data, arrayFields, VALIDATION_TYPES.ARRAY))

  // Validate BrainDump structure if dumps exist
  if (data.dumps && Array.isArray(data.dumps)) {
    data.dumps.forEach((dump, index) => {
      errors.push(
        ...validateObjectFields(dump, BRAIN_DUMP_FIELDS, `dumps[${index}].`)
      )
    })
  }

  // Test JSON serialization (circular reference, non-serializable data)
  let stringified = null
  try {
    stringified = JSON.stringify(data)
  } catch (e) {
    errors.push(`Data serialization failed: ${e.message}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    stringified
  }
}

/**
 * @typedef {Object} ValidateImportResult
 * @property {boolean} valid - Whether the import data is valid
 * @property {string[]} errors - List of validation error messages
 */

/**
 * Validate import data structure
 * @param {object} obj - Parsed JSON object
 * @returns {ValidateImportResult}
 */
export function validateImportData(obj) {
  const errors = []

  // Check required fields
  const arrayFields = ['tasks', 'sequences', 'habits', 'dumps', 'schedule']
  errors.push(...validateArrayFields(obj, arrayFields, VALIDATION_TYPES.ARRAY))

  // Validate BrainDump structure if dumps exist
  if (obj.dumps && Array.isArray(obj.dumps)) {
    obj.dumps.forEach((dump, index) => {
      errors.push(
        ...validateObjectFields(dump, BRAIN_DUMP_FIELDS, `dumps[${index}].`)
      )
    })
  }

  // Basic structure validation
  if (!obj || typeof obj !== 'object') {
    errors.push('Import data must be an object')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
