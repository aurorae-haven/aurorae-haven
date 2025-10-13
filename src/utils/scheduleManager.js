// Schedule Manager - Feature stub for calendar and time blocking
// TODO: Implement full schedule functionality with time blocking

import { put, getAll, getByIndex, deleteById, STORES } from './indexedDBManager'

/**
 * Create a schedule event
 * @param {object} event - Event data
 * @returns {Promise<number>} Event ID
 */
export async function createEvent(event) {
  // TODO: Implement event validation and conflict detection
  const newEvent = {
    ...event,
    id: event.id || Date.now(),
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    type: event.type || 'task', // 'task', 'routine', 'break', 'meeting'
    day: event.day || new Date().toISOString().split('T')[0],
    startTime: event.startTime,
    endTime: event.endTime,
    duration:
      event.duration || calculateDuration(event.startTime, event.endTime)
  }
  return await put(STORES.SCHEDULE, newEvent)
}

/**
 * Get events for a specific day
 * @param {string} day - ISO date string (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsForDay(day) {
  // TODO: Implement sorting by start time
  return await getByIndex(STORES.SCHEDULE, 'day', day)
}

/**
 * Get events for date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsForRange(startDate, endDate) {
  // TODO: Implement efficient date range query
  const allEvents = await getAll(STORES.SCHEDULE)
  return allEvents.filter(
    (event) => event.day >= startDate && event.day <= endDate
  )
}

/**
 * Get events for current week
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsForWeek() {
  // TODO: Implement week calculation
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const startDate = startOfWeek.toISOString().split('T')[0]
  const endDate = endOfWeek.toISOString().split('T')[0]

  return await getEventsForRange(startDate, endDate)
}

/**
 * Update event
 * @param {object} event - Updated event data
 * @returns {Promise<number>} Event ID
 */
export async function updateEvent(event) {
  // TODO: Add conflict detection and validation
  const updated = {
    ...event,
    timestamp: Date.now(),
    duration:
      event.duration || calculateDuration(event.startTime, event.endTime)
  }
  return await put(STORES.SCHEDULE, updated)
}

/**
 * Delete event
 * @param {number} id - Event ID
 * @returns {Promise<void>}
 */
export async function deleteEvent(id) {
  // TODO: Add confirmation for recurring events
  return await deleteById(STORES.SCHEDULE, id)
}

/**
 * Move event to different day/time
 * @param {number} id - Event ID
 * @param {string} newDay - New day (YYYY-MM-DD)
 * @param {string} newStartTime - New start time (HH:MM)
 * @returns {Promise<object>} Updated event
 */
export async function moveEvent(id, newDay, newStartTime) {
  // TODO: Implement drag-and-drop logic with conflict detection
  const events = await getAll(STORES.SCHEDULE)
  const event = events.find((e) => e.id === id)

  if (!event) {
    throw new Error('Event not found')
  }

  const duration = event.duration || 60
  const newEndTime = addMinutes(newStartTime, duration)

  const updated = {
    ...event,
    day: newDay,
    startTime: newStartTime,
    endTime: newEndTime,
    timestamp: Date.now()
  }

  await put(STORES.SCHEDULE, updated)
  return updated
}

/**
 * Check for scheduling conflicts
 * @param {string} day - Day to check (YYYY-MM-DD)
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {number} excludeEventId - Event ID to exclude from check
 * @returns {Promise<Array>} Array of conflicting events
 */
export async function checkConflicts(
  day,
  startTime,
  endTime,
  excludeEventId = null
) {
  // TODO: Implement comprehensive conflict detection
  const events = await getEventsForDay(day)

  return events.filter((event) => {
    if (excludeEventId && event.id === excludeEventId) {
      return false
    }

    // Check if times overlap
    return (
      (startTime >= event.startTime && startTime < event.endTime) ||
      (endTime > event.startTime && endTime <= event.endTime) ||
      (startTime <= event.startTime && endTime >= event.endTime)
    )
  })
}

/**
 * Get available time slots for a day
 * @param {string} day - Day (YYYY-MM-DD)
 * @param {number} duration - Minimum duration needed (minutes)
 * @returns {Promise<Array>} Array of available slots
 */
export async function getAvailableSlots(day, duration = 60) {
  // TODO: Implement slot calculation with business hours
  const events = await getEventsForDay(day)
  const slots = []

  // Simple implementation: find gaps between events
  const sortedEvents = events.sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )

  let currentTime = '08:00' // Start of day
  const endOfDay = '22:00'

  for (const event of sortedEvents) {
    const gapDuration = calculateDuration(currentTime, event.startTime)
    if (gapDuration >= duration) {
      slots.push({
        startTime: currentTime,
        endTime: event.startTime,
        duration: gapDuration
      })
    }
    currentTime = event.endTime
  }

  // Check remaining time at end of day
  const finalGap = calculateDuration(currentTime, endOfDay)
  if (finalGap >= duration) {
    slots.push({
      startTime: currentTime,
      endTime: endOfDay,
      duration: finalGap
    })
  }

  return slots
}

/**
 * Calculates the duration in minutes between two times given in "HH:MM" 24-hour format.
 * Both `startTime` and `endTime` must be strings in "HH:MM" format (e.g., "09:30").
 * The function converts both times to minutes since midnight and returns the difference (`endTime` - `startTime`).
 * If either input is missing or invalid, returns 0.
 * If `endTime` is before `startTime`, the result will be negative.
 *
 * @param {string} startTime - Start time in "HH:MM" 24-hour format.
 * @param {string} endTime - End time in "HH:MM" 24-hour format.
 * @returns {number} Duration in minutes between start and end times.
 */
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0

  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  return endMinutes - startMinutes
}

/**
 * Add minutes to a time
 * @param {string} time - Time (HH:MM)
 * @param {number} minutes - Minutes to add
 * @returns {string} New time (HH:MM)
 */
function addMinutes(time, minutes) {
  const [hour, min] = time.split(':').map(Number)
  const totalMinutes = hour * 60 + min + minutes
  const newHour = Math.floor(totalMinutes / 60) % 24
  const newMin = totalMinutes % 60

  return `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`
}

/**
 * Get today's schedule summary
 * @returns {Promise<object>} Summary with stats
 */
export async function getTodaySummary() {
  // TODO: Implement comprehensive summary
  const today = new Date().toISOString().split('T')[0]
  const events = await getEventsForDay(today)

  const totalDuration = events.reduce(
    (sum, event) => sum + (event.duration || 0),
    0
  )
  const byType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {})

  return {
    day: today,
    totalEvents: events.length,
    totalDuration,
    byType,
    events
  }
}
