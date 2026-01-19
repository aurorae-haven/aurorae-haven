/**
 * Calendar Subscription Manager
 * Handles external calendar subscriptions (ICS, Google Calendar, etc.)
 */

import { put, getAll, deleteById, openDB, STORES } from './indexedDBManager'
import { normalizeEntity, updateMetadata } from './idGenerator'
import { createLogger } from './logger'
import { createEvent } from './scheduleManager'

const logger = createLogger('CalendarSubscription')

/**
 * Add or update a calendar subscription
 * @param {object} subscription - Subscription data
 * @param {string} subscription.name - Display name for the calendar
 * @param {string} subscription.url - URL to the ICS feed
 * @param {string} subscription.color - Color for events (hex color code)
 * @param {boolean} [subscription.enabled] - Whether the subscription is active
 * @returns {Promise<string>} Subscription ID
 */
export async function addCalendarSubscription(subscription) {
  const newSubscription = normalizeEntity({
    ...subscription,
    enabled: subscription.enabled !== false,
    lastSyncedAt: null,
    syncStatus: 'pending'
  })
  
  await put(STORES.CALENDAR_SUBSCRIPTIONS, newSubscription)
  
  // Trigger initial sync
  await syncCalendar(newSubscription.id)
  
  return newSubscription.id
}

/**
 * Get all calendar subscriptions
 * @returns {Promise<Array>} Array of subscriptions
 */
export async function getCalendarSubscriptions() {
  return await getAll(STORES.CALENDAR_SUBSCRIPTIONS)
}

/**
 * Get a single calendar subscription by ID
 * @param {string} id - Subscription ID
 * @returns {Promise<object|null>} Subscription or null if not found
 */
export async function getCalendarSubscription(id) {
  const subscriptions = await getAll(STORES.CALENDAR_SUBSCRIPTIONS)
  return subscriptions.find((sub) => sub.id === id) || null
}

/**
 * Update a calendar subscription
 * @param {object} subscription - Updated subscription data
 * @returns {Promise<string>} Subscription ID
 */
export async function updateCalendarSubscription(subscription) {
  const updated = updateMetadata(subscription)
  await put(STORES.CALENDAR_SUBSCRIPTIONS, updated)
  return updated.id
}

/**
 * Delete a calendar subscription and its events
 * @param {string} id - Subscription ID
 * @returns {Promise<void>}
 */
export async function deleteCalendarSubscription(id) {
  // Delete the subscription
  await deleteById(STORES.CALENDAR_SUBSCRIPTIONS, id)
  
  // Delete all events from this calendar
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SCHEDULE, 'readwrite')
    const store = transaction.objectStore(STORES.SCHEDULE)
    const request = store.openCursor()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        const scheduleEvent = cursor.value
        if (scheduleEvent.externalCalendarId === id) {
          cursor.delete()
        }
        cursor.continue()
      }
    }
    
    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
  })
}

/**
 * Parse ICS data and extract events
 * @param {string} icsData - ICS file content
 * @returns {Array<object>} Array of parsed events
 */
export function parseICS(icsData) {
  const events = []
  
  // Simple ICS parser - handles basic VEVENT entries
  // This is a minimal implementation; consider using a library like ical.js for production
  const lines = icsData.split(/\r?\n/)
  let currentEvent = null
  let isInEvent = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line === 'BEGIN:VEVENT') {
      isInEvent = true
      currentEvent = {}
    } else if (line === 'END:VEVENT' && isInEvent) {
      if (currentEvent && currentEvent.summary && currentEvent.dtstart) {
        events.push(currentEvent)
      }
      currentEvent = null
      isInEvent = false
    } else if (isInEvent && currentEvent) {
      // Parse event properties
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) continue
      
      const propertyKey = line.substring(0, colonIndex)
      const value = line.substring(colonIndex + 1)
      
      if (propertyKey === 'SUMMARY') {
        currentEvent.summary = value
      } else if (propertyKey.startsWith('DTSTART')) {
        currentEvent.dtstart = parseDateTimeValue(value)
      } else if (propertyKey.startsWith('DTEND')) {
        currentEvent.dtend = parseDateTimeValue(value)
      } else if (propertyKey === 'DESCRIPTION') {
        currentEvent.description = value
      } else if (propertyKey === 'LOCATION') {
        currentEvent.location = value
      } else if (propertyKey === 'UID') {
        currentEvent.uid = value
      }
    }
  }
  
  return events
}

/**
 * Parse ICS datetime value
 * @param {string} value - Datetime value from ICS
 * @returns {Date} Parsed date
 */
function parseDateTimeValue(value) {
  // Handle DATE-TIME format: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
  // Handle DATE format: YYYYMMDD
  
  if (value.length === 8) {
    // DATE format: YYYYMMDD
    const year = parseInt(value.substring(0, 4), 10)
    const month = parseInt(value.substring(4, 6), 10) - 1
    const day = parseInt(value.substring(6, 8), 10)
    return new Date(year, month, day)
  } else if (value.includes('T')) {
    // DATE-TIME format
    const dateTimeParts = value.split('T')
    const datePart = dateTimeParts[0]
    const timePart = dateTimeParts[1].replace('Z', '')
    
    const year = parseInt(datePart.substring(0, 4), 10)
    const month = parseInt(datePart.substring(4, 6), 10) - 1
    const day = parseInt(datePart.substring(6, 8), 10)
    const hours = parseInt(timePart.substring(0, 2), 10)
    const minutes = parseInt(timePart.substring(2, 4), 10)
    const seconds = parseInt(timePart.substring(4, 6), 10)
    
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds))
  }
  
  return new Date()
}

/**
 * Convert ICS event to schedule event format
 * @param {object} icsEvent - Parsed ICS event
 * @param {string} calendarId - Calendar subscription ID
 * @returns {object} Schedule event data
 */
function convertICSEventToScheduleEvent(icsEvent, calendarId) {
  const startDate = new Date(icsEvent.dtstart)
  const endDate = icsEvent.dtend ? new Date(icsEvent.dtend) : new Date(startDate.getTime() + 60 * 60 * 1000)
  
  // Format date as YYYY-MM-DD
  const day = startDate.toISOString().split('T')[0]
  
  // Format times as HH:MM
  const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
  
  return {
    title: icsEvent.summary,
    day,
    startTime,
    endTime,
    type: 'meeting', // Default external events to 'meeting' type
    isExternal: true,
    externalCalendarId: calendarId,
    externalEventId: icsEvent.uid,
    description: icsEvent.description || '',
    location: icsEvent.location || ''
  }
}

/**
 * Sync a calendar subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<void>}
 */
export async function syncCalendar(subscriptionId) {
  const subscription = await getCalendarSubscription(subscriptionId)
  
  if (!subscription || !subscription.enabled) {
    return
  }
  
  try {
    // Update sync status
    await updateCalendarSubscription({
      ...subscription,
      syncStatus: 'syncing'
    })
    
    // Fetch ICS data
    const response = await fetch(subscription.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.statusText}`)
    }
    
    const icsData = await response.text()
    const icsEvents = parseICS(icsData)
    
    // Delete old events from this calendar
    const db = await openDB()
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SCHEDULE, 'readwrite')
      const store = transaction.objectStore(STORES.SCHEDULE)
      const request = store.openCursor()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          const scheduleEvent = cursor.value
          if (scheduleEvent.externalCalendarId === subscriptionId) {
            cursor.delete()
          }
          cursor.continue()
        }
      }
      
      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
    })
    
    // Add new events
    for (const icsEvent of icsEvents) {
      const scheduleEvent = convertICSEventToScheduleEvent(icsEvent, subscriptionId)
      await createEvent(scheduleEvent)
    }
    
    // Update sync status
    await updateCalendarSubscription({
      ...subscription,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'success'
    })
    
    logger.log(`Successfully synced calendar: ${subscription.name}`)
  } catch (error) {
    logger.error(`Failed to sync calendar ${subscription.name}:`, error)
    
    // Update sync status to error
    await updateCalendarSubscription({
      ...subscription,
      syncStatus: 'error',
      lastSyncError: error.message
    })
    
    throw error
  }
}

/**
 * Sync all enabled calendar subscriptions
 * @returns {Promise<void>}
 */
export async function syncAllCalendars() {
  const subscriptions = await getCalendarSubscriptions()
  const enabledSubscriptions = subscriptions.filter((sub) => sub.enabled)
  
  const syncPromises = enabledSubscriptions.map((sub) => 
    syncCalendar(sub.id).catch((error) => {
      logger.error(`Failed to sync calendar ${sub.name}:`, error)
      // Continue with other calendars even if one fails
    })
  )
  
  await Promise.all(syncPromises)
}
