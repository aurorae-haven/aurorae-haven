/**
 * Time Utilities
 * Centralized time and duration calculation functions
 * Consolidates duplicate time logic from multiple files
 */

import { MINUTES_PER_HOUR, HOURS_PER_DAY } from './scheduleConstants'

// Time formatting constants
const TIME_PADDING_LENGTH = 2
const PADDING_CHAR = '0'
const SECONDS_PER_MINUTE = 60

/**
 * Parse time string in HH:MM format to hours and minutes
 * Validates that hours are in range 0-23 and minutes are in range 0-59
 * Returns null for invalid inputs to distinguish from valid '00:00'
 * @param {string} timeString - Time in "HH:MM" format
 * @returns {{hours: number, minutes: number}|null} Object with hours and minutes, or null if invalid
 */
export function parseTime(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return null
  }

  const [hours, minutes] = timeString.split(':').map(Number)

  // Validate parsed values are numbers
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  // Validate ranges: 0 <= hours < 24, 0 <= minutes < 60
  if (hours < 0 || hours >= HOURS_PER_DAY || minutes < 0 || minutes >= MINUTES_PER_HOUR) {
    return null
  }

  return { hours, minutes }
}

/**
 * Format hours and minutes to HH:MM string
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} Time in "HH:MM" format
 */
export function formatTime(hours, minutes) {
  // Normalize hours and minutes to valid time within a day
  const totalMinutes = Math.floor(hours) * MINUTES_PER_HOUR + Math.floor(minutes)
  const minutesInDay = HOURS_PER_DAY * MINUTES_PER_HOUR
  const normalizedMinutes = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay
  const validHours = Math.floor(normalizedMinutes / MINUTES_PER_HOUR)
  const validMinutes = normalizedMinutes % MINUTES_PER_HOUR
  return `${String(validHours).padStart(TIME_PADDING_LENGTH, PADDING_CHAR)}:${String(validMinutes).padStart(TIME_PADDING_LENGTH, PADDING_CHAR)}`
}

/**
 * Convert HH:MM time string to total minutes since midnight
 * Returns 0 for invalid time strings
 * @param {string} timeString - Time in "HH:MM" format
 * @returns {number} Total minutes since midnight, or 0 if invalid
 */
export function timeToMinutes(timeString) {
  const parsed = parseTime(timeString)
  if (parsed === null) {
    return 0
  }
  return parsed.hours * MINUTES_PER_HOUR + parsed.minutes
}

/**
 * Convert total minutes to HH:MM time string
 * Handles wrapping for negative values (e.g., -60 minutes = 23:00)
 * @param {number} totalMinutes - Total minutes since midnight
 * @returns {string} Time in "HH:MM" format
 */
export function minutesToTime(totalMinutes) {
  const validMinutes = Math.floor(totalMinutes)
  
  // Handle negative values by wrapping to previous day
  const minutesInDay = HOURS_PER_DAY * MINUTES_PER_HOUR
  const normalizedMinutes = ((validMinutes % minutesInDay) + minutesInDay) % minutesInDay
  
  const hours = Math.floor(normalizedMinutes / MINUTES_PER_HOUR)
  const minutes = normalizedMinutes % MINUTES_PER_HOUR

  return `${String(hours).padStart(TIME_PADDING_LENGTH, PADDING_CHAR)}:${String(minutes).padStart(TIME_PADDING_LENGTH, PADDING_CHAR)}`
}

/**
 * Calculate duration in minutes between two times
 * Both times must be in "HH:MM" 24-hour format
 * Returns 0 if either time is invalid
 * If endTime is before startTime, the result will be negative
 * @param {string} startTime - Start time in "HH:MM" format
 * @param {string} endTime - End time in "HH:MM" format
 * @returns {number} Duration in minutes between start and end times, or 0 if either is invalid
 */
export function calculateDuration(startTime, endTime) {
  // Check if inputs are invalid early to avoid misleading results
  const startParsed = parseTime(startTime)
  const endParsed = parseTime(endTime)
  
  if (startParsed === null || endParsed === null) {
    return 0
  }

  const startMinutes = startParsed.hours * MINUTES_PER_HOUR + startParsed.minutes
  const endMinutes = endParsed.hours * MINUTES_PER_HOUR + endParsed.minutes

  return endMinutes - startMinutes
}

/**
 * Add minutes to a time
 * If time is invalid, it's treated as 00:00 and minutes are applied
 * @param {string} time - Time in "HH:MM" format
 * @param {number} minutes - Minutes to add (can be negative)
 * @returns {string} New time in "HH:MM" format (e.g., addDuration('', 60) returns '01:00')
 */
export function addDuration(time, minutes) {
  const parsed = parseTime(time)
  // If invalid time provided, treat as 00:00 and apply minutes offset
  const startMinutes = parsed !== null ? parsed.hours * MINUTES_PER_HOUR + parsed.minutes : 0
  const totalMinutes = startMinutes + minutes
  return minutesToTime(totalMinutes)
}

/**
 * Subtract minutes from a time
 * @param {string} time - Time in "HH:MM" format
 * @param {number} minutes - Minutes to subtract
 * @returns {string} New time in "HH:MM" format
 */
export function subtractDuration(time, minutes) {
  return addDuration(time, -minutes)
}

/**
 * Format seconds to mm:ss display format
 * Used for timer displays in UI
 * @param {number} seconds - Time in seconds
 * @param {object} options - Formatting options
 * @param {boolean} options.verbose - If true, add "remaining" suffix
 * @returns {string} Formatted time string (e.g., "05:30" or "05:30 remaining")
 */
export function formatDurationDisplay(seconds, options = {}) {
  // Validate input - default to 0 if not a number
  const validSeconds =
    typeof seconds === 'number' && !isNaN(seconds) ? seconds : 0

  const abs = Math.floor(Math.abs(validSeconds))
  const mins = Math.floor(abs / SECONDS_PER_MINUTE)
  const secs = abs % SECONDS_PER_MINUTE
  const sign = validSeconds < 0 ? '-' : ''
  const formatted = `${sign}${String(mins).padStart(TIME_PADDING_LENGTH, PADDING_CHAR)}:${String(secs).padStart(TIME_PADDING_LENGTH, PADDING_CHAR)}`

  // Return with suffix if verbose option is enabled
  return options.verbose ? `${formatted} remaining` : formatted
}

/**
 * Format duration in seconds to verbose human-readable string
 * Used for displaying durations in UI (e.g., "2h 30m" or "45m")
 * @param {number} seconds - Duration in seconds
 * @returns {string|null} Formatted duration string or null if no duration
 */
export function formatDurationVerbose(seconds) {
  if (!seconds) return null

  const absSeconds = Math.abs(seconds)
  const minutes = Math.floor(absSeconds / SECONDS_PER_MINUTE)
  const sign = (seconds < 0 && minutes > 0) ? '-' : ''
  if (minutes < MINUTES_PER_HOUR) {
    return `${sign}${minutes}m`
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const remainingMinutes = minutes % MINUTES_PER_HOUR

  return remainingMinutes > 0
    ? `${sign}${hours}h ${remainingMinutes}m`
    : `${sign}${hours}h`
}
