// Logger utility for Aurorae Haven
// Provides conditional logging based on environment and user settings

/* eslint-disable no-console */
// This file is the logger utility itself, so it needs to use console

import { getSetting } from './settingsManager.js'

/**
 * Check if logging should be enabled
 * Logs are shown when debugMode is enabled in settings or in development
 * @returns {boolean} True if logging is enabled
 */
function isLoggingEnabled() {
  // In production, check user's debug mode setting
  try {
    const debugMode = getSetting('advanced.debugMode')
    return debugMode === true
  } catch {
    // If settings aren't available, disable logging in production
    // (development builds will have DEV mode enabled anyway)
    return false
  }
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
