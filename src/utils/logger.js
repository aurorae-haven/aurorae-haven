// Logger utility for Aurorae Haven
// Provides conditional logging based on environment and user settings
//
// DESIGN NOTE: This module has no imports to avoid circular dependencies.
// It uses a global flag (window.__AURORAE_DEBUG_MODE__) set by settingsManager
// to determine if debug logging should be enabled.

/* eslint-disable no-console */
// This file is the logger utility itself, so it needs to use console

/**
 * Check if logging should be enabled
 * Logs are shown when debugMode is enabled via global flag or in development
 * @returns {boolean} True if logging is enabled
 */
function isLoggingEnabled() {
  // Check global debug flag (set by settings manager)
  if (typeof window !== 'undefined' && window.__AURORAE_DEBUG_MODE__) {
    return true
  }

  // Enable in development mode
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    return true
  }

  return false
}

/**
 * Log an informational message
 * Only outputs in development or when debugMode is enabled
 * @param {...any} args - Arguments to log
 */
export function log(...args) {
  if (isLoggingEnabled()) {
    console.log(...args)
  }
}

/**
 * Log a warning message
 * Only outputs in development or when debugMode is enabled
 * @param {...any} args - Arguments to log
 */
export function warn(...args) {
  if (isLoggingEnabled()) {
    console.warn(...args)
  }
}

/**
 * Log an error message
 * Always outputs regardless of debug mode (errors are critical)
 * @param {...any} args - Arguments to log
 */
export function error(...args) {
  console.error(...args)
}

/**
 * Log an info message
 * Only outputs in development or when debugMode is enabled
 * @param {...any} args - Arguments to log
 */
export function info(...args) {
  if (isLoggingEnabled()) {
    console.info(...args)
  }
}

/**
 * Create a namespaced logger for a specific module
 * @param {string} namespace - Module namespace (e.g., 'ServiceWorker', 'PWA')
 * @returns {object} Logger object with namespaced methods
 */
export function createLogger(namespace) {
  const prefix = `[${namespace}]`

  return {
    log: (...args) => log(prefix, ...args),
    warn: (...args) => warn(prefix, ...args),
    error: (...args) => error(prefix, ...args),
    info: (...args) => info(prefix, ...args)
  }
}

// Default export for convenience
export default {
  log,
  warn,
  error,
  info,
  createLogger
}
