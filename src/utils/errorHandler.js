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
    metadata = {}
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
    const displayMessage = toastMessage || getUserFriendlyMessage(errorObj, context)
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
  try {
    return await operation()
  } catch (error) {
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
  try {
    return operation()
  } catch (error) {
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
  // Check for specific error types
  if (error.name === 'QuotaExceededError' || error.code === 22) {
    return 'Storage quota exceeded. Please free up space.'
  }

  if (error.message.includes('IndexedDB')) {
    return 'Database error. Please try again.'
  }

  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Network error. Please check your connection.'
  }

  if (error.message.includes('validation') || error.message.includes('Invalid')) {
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

  // Try to dispatch a custom event that the Toast component can listen to
  if (window.CustomEvent && window.dispatchEvent) {
    const event = new window.CustomEvent('aurorae-toast', {
      detail: { message }
    })
    window.dispatchEvent(event)
  }

  // Fallback: try to show toast using existing DOM element (legacy support)
  const toastElement = document.getElementById('toast')
  if (toastElement) {
    toastElement.textContent = message
    toastElement.style.display = 'block'
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
 * Wrap a function with error handling
 * Returns a new function that automatically handles errors
 *
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context description
 * @param {ErrorHandlingOptions} [options={}] - Error handling options
 * @returns {Function} Wrapped function
 */
export function withErrorHandler(fn, context, options = {}) {
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
 * Check if an error is a quota exceeded error
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if quota exceeded error
 */
export function isQuotaExceededError(error) {
  return (
    error &&
    (error.name === 'QuotaExceededError' ||
      error.code === 22 ||
      error.message.includes('quota') ||
      error.message.includes('storage'))
  )
}

/**
 * Check if an error is a network error
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  return (
    error &&
    (error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.name === 'NetworkError')
  )
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
