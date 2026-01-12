/**
 * Constants for Schedule feature
 * Defines event types and other schedule-related constants to avoid magic strings
 */

// Event type constants
export const EVENT_TYPES = {
  ROUTINE: 'routine',
  TASK: 'task',
  MEETING: 'meeting',
  HABIT: 'habit'
}

// Array of valid event types for validation
export const VALID_EVENT_TYPES = Object.values(EVENT_TYPES)

// Schedule time range constants (in hours, 24-hour format)
export const SCHEDULE_START_HOUR = 6
export const SCHEDULE_END_HOUR = 22

// Display constants - each hour occupies 120 pixels in the UI
export const PIXELS_PER_HOUR = 120
export const SCHEDULE_VERTICAL_OFFSET = 6
