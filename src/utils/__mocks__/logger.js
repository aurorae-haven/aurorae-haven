// Mock logger for tests
export function log(...args) {
  // No-op in tests
}

export function warn(...args) {
  // No-op in tests
}

export function error(...args) {
  // No-op in tests
}

export function info(...args) {
  // No-op in tests
}

export function createLogger(namespace) {
  return {
    log: (...args) => {},
    warn: (...args) => {},
    error: (...args) => {},
    info: (...args) => {}
  }
}

export default {
  log,
  warn,
  error,
  info,
  createLogger
}
