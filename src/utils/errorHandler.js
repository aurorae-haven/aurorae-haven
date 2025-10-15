/**
 * Centralized Error Handler Utility
 * Provides consistent error handling, logging, and user notification across the application
 *
 * @module errorHandler
 */

import { createLogger } from './logger'

const logger = createLogger('ErrorHandler')

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * Error handling options
 * @typedef {Object} ErrorHandlingOptions
 * @property {boolean} [showToast=true] - Show toast notification to user
 * @property {string} [toastMessage] - Custom toast message (defaults to user-friendly error message)
 * @property {boolean} [rethrow=false] - Whether to rethrow the error after handling
 * @property {Function} [onError] - Custom error callback
 * @property {string} [severity=ErrorSeverity.MEDIUM] - Error severity level
 * @property {Object} [metadata] - Additional metadata to log with error
 * @property {Array<Function>} [expectedErrors] - Array of error types to catch (e.g., [TypeError, RangeError])
 * @property {Object} [validateParams] - Object mapping parameter names to expected types for validation
 * @property {Function} [customMessageFormatter] - Function to format custom error messages: (error, context) => string
 */

/**
 * Handle an error with consistent logging and optional user notification
 *
 * @param {Error|string} error - The error object or message
 * @param {string} context - Context description (e.g., 'Loading templates', 'Saving task')
 * @param {ErrorHandlingOptions} [options={}] - Error handling options
 * @returns {Error} The error object (for chaining or inspection)
 */
export function handleError(error, context, options = {}) {
  const {
    showToast = true,
    toastMessage,
    rethrow = false,
    onError,
    severity = ErrorSeverity.MEDIUM,
    metadata = {},
    customMessageFormatter
  } = options

  // Normalize error to Error object
  const errorObj = error instanceof Error ? error : new Error(String(error))

  // Construct error message with context
  const contextMessage = `${context}: ${errorObj.message}`

  // Log error with appropriate severity
  if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
    logger.error(contextMessage, { error: errorObj, metadata, severity })
  } else {
    logger.warn(contextMessage, { error: errorObj, metadata, severity })
  }

  // Show user notification if requested
  if (showToast && typeof window !== 'undefined') {
    let displayMessage
    if (customMessageFormatter && typeof customMessageFormatter === 'function') {
      try {
        displayMessage = customMessageFormatter(errorObj, context)
      } catch (formatterError) {
        logger.error('Error in customMessageFormatter:', formatterError)
        // Fall back to toastMessage or default message
        displayMessage = toastMessage || getUserFriendlyMessage(errorObj, context)
      }
    } else if (toastMessage) {
      displayMessage = toastMessage
    } else {
      displayMessage = getUserFriendlyMessage(errorObj, context)
    }
    showToastNotification(displayMessage)
  }

  // Call custom error callback if provided
  if (onError && typeof onError === 'function') {
    try {
      onError(errorObj, context)
    } catch (callbackError) {
      logger.error('Error in custom error callback:', callbackError)
    }
  }

  // Rethrow if requested
  if (rethrow) {
    throw errorObj
  }

  return errorObj
}

/**
 * Wrapper for async operations with centralized error handling
 *
 * @param {Function} operation - Async operation to execute
 * @param {string} context - Context description
 * @param {ErrorHandlingOptions} [options={}] - Error handling options
 * @returns {Promise<*>} Result of the operation or undefined on error
 */
export async function withErrorHandling(operation, context, options = {}) {
  const { expectedErrors, validateParams } = options

  // Validate parameters if validation is requested
  if (validateParams) {
    const validationError = validateParameters(validateParams)
    if (validationError) {
      // Force rethrow: false for validation errors to keep them consistently 'handled'
      handleError(validationError, context, { ...options, rethrow: false })
      return undefined
    }
  }

  try {
    return await operation()
  } catch (error) {
    // Check if this error should be caught
    if (expectedErrors && !shouldCatchError(error, expectedErrors)) {
      throw error // Rethrow if not in expected errors list
    }
    handleError(error, context, options)
    return undefined
  }
}

/**
 * Wrapper for synchronous operations with centralized error handling
 *
 * @param {Function} operation - Sync operation to execute
 * @param {string} context - Context description
 * @param {ErrorHandlingOptions} [options={}] - Error handling options
 * @returns {*} Result of the operation or undefined on error
 */
export function tryCatch(operation, context, options = {}) {
  const { expectedErrors, validateParams } = options

  // Validate parameters if validation is requested
  if (validateParams) {
    const validationError = validateParameters(validateParams)
    if (validationError) {
      // Force rethrow: false for validation errors to keep them consistently 'handled'
      handleError(validationError, context, { ...options, rethrow: false })
      return undefined
    }
  }

  try {
    return operation()
  } catch (error) {
    // Check if this error should be caught
    if (expectedErrors && !shouldCatchError(error, expectedErrors)) {
      throw error // Rethrow if not in expected errors list
    }
    handleError(error, context, options)
    return undefined
  }
}

/**
 * Get a user-friendly error message based on error type
 *
 * @param {Error} error - The error object
 * @param {string} context - Context description
 * @returns {string} User-friendly error message
 */
function getUserFriendlyMessage(error, context) {
  // Check for specific error types using helper functions
  if (isQuotaExceededError(error)) {
    return 'Storage quota exceeded. Please free up space.'
  }

  if (error.message.includes('IndexedDB')) {
    return 'Database error. Please try again.'
  }

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.'
  }

  if (isValidationError(error)) {
    return 'Invalid data. Please check your input.'
  }

  // Default: use context-based message
  return `${context} failed. Please try again.`
}

/**
 * Show toast notification to user
 * This is a minimal implementation that works with the existing Toast component
 *
 * @param {string} message - Message to display
 */
function showToastNotification(message) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  // Dispatch a custom event that the Toast component can listen to
  // This is the preferred method as it lets the UI framework handle rendering
  if (window.CustomEvent && window.dispatchEvent) {
    const event = new window.CustomEvent('aurorae-toast', {
      detail: { message }
    })
    window.dispatchEvent(event)
    return // Return early to avoid duplicate notifications
  }

  // Fallback: try to show toast using existing DOM element (legacy support)
  // Enhanced with accessibility attributes
  const toastElement = document.getElementById('toast')
  if (toastElement) {
    toastElement.textContent = message
    toastElement.style.display = 'block'
    
    // Add accessibility attributes if not present
    if (!toastElement.getAttribute('role')) {
      toastElement.setAttribute('role', 'status')
    }
    if (!toastElement.getAttribute('aria-live')) {
      toastElement.setAttribute('aria-live', 'polite')
    }
    
    setTimeout(() => {
      toastElement.style.display = 'none'
    }, 3000)
  }
}

/**
 * Create an error handler function with pre-configured context and options
 * Useful for creating reusable error handlers for specific operations
 *
 * @param {string} context - Context description
 * @param {ErrorHandlingOptions} [defaultOptions={}] - Default options for this handler
 * @returns {Function} Error handler function
 */
export function createErrorHandler(context, defaultOptions = {}) {
  return (error, options = {}) => {
    return handleError(error, context, { ...defaultOptions, ...options })
  }
}

/**
 * Decorator that wraps a function with error handling
 * Returns a new function that automatically handles errors
 * Note: Renamed from withErrorHandler to avoid confusion with withErrorHandling
 *
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context description
 * @param {ErrorHandlingOptions} [options={}] - Error handling options
 * @returns {Function} Wrapped function
 */
export function decorateWithErrorHandling(fn, context, options = {}) {
  return async function wrappedFunction(...args) {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, context, options)
      return undefined
    }
  }
}

/**
 * @deprecated Use decorateWithErrorHandling instead
 * Kept for backward compatibility
 */
export const withErrorHandler = decorateWithErrorHandling

/**
 * Parse and enhance error objects with additional context
 *
 * @param {Error|string} error - Error to parse
 * @param {Object} [additionalContext={}] - Additional context to add
 * @returns {Error} Enhanced error object
 */
export function enhanceError(error, additionalContext = {}) {
  const errorObj = error instanceof Error ? error : new Error(String(error))

  // Add context as a property (non-enumerable to avoid JSON serialization issues)
  Object.defineProperty(errorObj, 'context', {
    value: additionalContext,
    writable: false,
    enumerable: false,
    configurable: false
  })

  return errorObj
}

/**
 * Validate parameters against expected types
 *
 * @param {Object} validateParams - Object mapping parameter names to their values and expected types
 * @returns {Error|null} Validation error or null if valid
 * @example
 * validateParameters({
 *   userId: { value: userId, type: 'string' },
 *   count: { value: count, type: 'number' }
 * })
 */
function validateParameters(validateParams) {
  for (const [paramName, paramConfig] of Object.entries(validateParams)) {
    const { value, type, required = true } = paramConfig

    // Check if required parameter is missing
    if (required && (value === undefined || value === null)) {
      return new Error(
        `Required parameter '${paramName}' is missing or null`
      )
    }

    // Skip type check if value is optional and not provided
    if (!required && (value === undefined || value === null)) {
      continue
    }

    // Validate type
    const actualType = Array.isArray(value) ? 'array' : typeof value
    if (actualType !== type) {
      return new Error(
        `Parameter '${paramName}' expected type '${type}' but got '${actualType}'`
      )
    }
  }

  return null
}

/**
 * Check if an error should be caught based on expected error types
 *
 * @param {Error} error - The error that was thrown
 * @param {Array<Function>} expectedErrors - Array of error constructor functions
 * @returns {boolean} True if error should be caught
 */
function shouldCatchError(error, expectedErrors) {
  if (!Array.isArray(expectedErrors) || expectedErrors.length === 0) {
    return true // Catch all errors if no filter specified
  }

  // Check if error is an instance of any expected error type
  return expectedErrors.some((ErrorType) => error instanceof ErrorType)
}

/**
 * Check if an error is a quota exceeded error
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if quota exceeded error
 */
export function isQuotaExceededError(error) {
  const msg = (error && error.message ? error.message : '').toLowerCase();
  return (
    error &&
    (
      error.name === 'QuotaExceededError' ||
      error.code === 22 ||
      error.code === 1014 ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      msg.includes('quota') ||
      msg.includes('storage quota')
    )
  );
}

/**
 * Check if an error is a network error
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  if (!error) return false;
  const msg = error.message ? error.message.toLowerCase() : '';
  const name = error.name ? error.name.toLowerCase() : '';
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('networkerror') ||
    name === 'networkerror'
  );
}

/**
 * Check if an error is a validation error
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if validation error
 */
export function isValidationError(error) {
  return (
    error &&
    (error.message.includes('validation') ||
      error.message.includes('Invalid') ||
      error.name === 'ValidationError')
  )
}
