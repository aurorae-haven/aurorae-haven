/**
 * Calendar Subscription Manager
 * Handles external calendar subscriptions (ICS, Google Calendar, etc.)
 */

import { put, getAll, deleteById, openDB, STORES } from './indexedDBManager'
import { normalizeEntity, updateMetadata } from './idGenerator'
import { createLogger } from './logger'
import { createEvent } from './scheduleManager'
import { sanitizeText } from './sanitization'

const logger = createLogger('CalendarSubscription')

// Constants for default event durations
const DEFAULT_EVENT_DURATION_MILLISECONDS = 60 * 60 * 1000 // 1 hour in milliseconds

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
    
    transaction.onerror = () => {
      db.close()
      const error = transaction.error || new Error('Failed to delete calendar subscription events.')
      reject(error)
    }
  })
}

/**
 * Parse ICS (iCalendar) format and extract events
 * @param {string} icsData - Raw ICS data
 * @returns {Array<Object>} Array of parsed events
 * 
 * Note: This is a basic ICS parser that handles common calendar formats.
 * It does NOT support:
 * - Recurrence rules (RRULE, EXDATE, etc.)
 * - Complex timezone handling (VTIMEZONE) — TZID parameters are parsed but their local times are
 *   incorrectly treated as UTC by this parser.
 * - Exceptions to recurring events
 * - Line folding (long lines split across multiple lines)
 * 
 * IMPORTANT: Events with TZID parameters (e.g., DTSTART;TZID=America/New_York:20250115T090000)
 * are interpreted as if the wall-clock time were already in UTC and then converted to the local
 * timezone for display. This is incorrect for non-UTC TZIDs and can result in shifted event times.
 * Do not rely on this parser for accurate timezone handling when TZID is present.
 * 
 * For more complex calendars with proper timezone support, consider using a library like ical.js
 */
export function parseICS(icsData) {
  const events = []
  const lines = icsData.split(/\r?\n/)
  let currentEvent = null
  let isInEvent = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line === 'BEGIN:VEVENT') {
      isInEvent = true
      currentEvent = {}
    } else if (line === 'END:VEVENT' && isInEvent) {
      // Only add event if it has required fields AND valid dates
      if (currentEvent && currentEvent.summary && currentEvent.dtstart && currentEvent.dtstart !== null) {
        events.push(currentEvent)
      }
      currentEvent = null
      isInEvent = false
    } else if (isInEvent && currentEvent) {
      // Parse event properties
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) continue
      
      // Extract property name and value, handling parameters like DTSTART;VALUE=DATE
      const fullPropertyKey = line.substring(0, colonIndex)
      const value = line.substring(colonIndex + 1)
      
      // Get base property name (before semicolon if parameters exist)
      const semicolonIndex = fullPropertyKey.indexOf(';')
      const propertyKey = semicolonIndex > -1 ? fullPropertyKey.substring(0, semicolonIndex) : fullPropertyKey
      
      if (propertyKey === 'SUMMARY') {
        // Sanitize to prevent XSS
        currentEvent.summary = sanitizeText(value)
      } else if (propertyKey === 'DTSTART') {
        currentEvent.dtstart = parseDateTimeValue(value)
      } else if (propertyKey === 'DTEND') {
        currentEvent.dtend = parseDateTimeValue(value)
      } else if (propertyKey === 'DESCRIPTION') {
        // Sanitize to prevent XSS
        currentEvent.description = sanitizeText(value)
      } else if (propertyKey === 'LOCATION') {
        // Sanitize to prevent XSS
        currentEvent.location = sanitizeText(value)
      } else if (propertyKey === 'UID') {
        currentEvent.uid = value
      }
    }
  }
  
  return events
}

/**
 * Parse ICS datetime value with validation
 * @param {string} value - Datetime value from ICS
 * @returns {Date|null} Parsed date or null if invalid
 */
function parseDateTimeValue(value) {
  // Handle DATE-TIME format: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
  // Handle DATE format: YYYYMMDD
  
  if (!value || typeof value !== 'string') {
    logger.warn('Invalid datetime value: empty or non-string')
    return null
  }
  
  if (value.length === 8) {
    // DATE format: YYYYMMDD
    const year = parseInt(value.substring(0, 4), 10)
    const month = parseInt(value.substring(4, 6), 10) - 1
    const day = parseInt(value.substring(6, 8), 10)
    
    // Validate parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      logger.warn('Invalid DATE format: failed to parse numbers', { value })
      return null
    }
    if (year < 1900 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
      logger.warn('Invalid DATE format: out of range', { year, month, day })
      return null
    }
    
    return new Date(year, month, day)
  } else if (value.includes('T')) {
    // DATE-TIME format
    const dateTimeParts = value.split('T')
    if (dateTimeParts.length !== 2) {
      logger.warn('Invalid DATE-TIME format: missing T separator', { value })
      return null
    }
    
    const datePart = dateTimeParts[0]
    const timePart = dateTimeParts[1].replace('Z', '')
    
    if (datePart.length !== 8 || timePart.length < 6) {
      logger.warn('Invalid DATE-TIME format: incorrect length', { value })
      return null
    }
    
    const year = parseInt(datePart.substring(0, 4), 10)
    const month = parseInt(datePart.substring(4, 6), 10) - 1
    const day = parseInt(datePart.substring(6, 8), 10)
    const hours = parseInt(timePart.substring(0, 2), 10)
    const minutes = parseInt(timePart.substring(2, 4), 10)
    const seconds = parseInt(timePart.substring(4, 6), 10)
    
    // Validate all parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      logger.warn('Invalid DATE-TIME format: failed to parse numbers', { value })
      return null
    }
    if (year < 1900 || year > 2100 || month < 0 || month > 11 || 
        day < 1 || day > 31 || hours < 0 || hours > 23 || 
        minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      logger.warn('Invalid DATE-TIME format: out of range', { value })
      return null
    }
    
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds))
  }
  
  logger.warn('Invalid datetime format: unknown format', { value })
  return null
}

/**
 * Convert ICS event to schedule event format
 * @param {object} icsEvent - Parsed ICS event
 * @param {string} calendarId - Calendar subscription ID
 * @returns {object|null} Schedule event data or null if invalid
 */
function convertICSEventToScheduleEvent(icsEvent, calendarId) {
  // Validate dates
  if (!icsEvent.dtstart) {
    logger.warn('ICS event missing start time', { event: icsEvent })
    return null
  }
  
  const startDate = new Date(icsEvent.dtstart)
  if (isNaN(startDate.getTime())) {
    logger.warn('Invalid start date in ICS event', { event: icsEvent })
    return null
  }
  
  // Use end date if available, otherwise default to 1 hour duration
  const endDate = icsEvent.dtend ? new Date(icsEvent.dtend) : new Date(startDate.getTime() + DEFAULT_EVENT_DURATION_MILLISECONDS)
  if (isNaN(endDate.getTime())) {
    logger.warn('Invalid end date in ICS event, using default duration', { event: icsEvent })
    endDate.setTime(startDate.getTime() + DEFAULT_EVENT_DURATION_MILLISECONDS)
  }
  
  // Format date as YYYY-MM-DD using local time so events reflect the user's timezone
  const year = startDate.getFullYear()
  const month = String(startDate.getMonth() + 1).padStart(2, '0')
  const date = String(startDate.getDate()).padStart(2, '0')
  const day = `${year}-${month}-${date}`
  
  // Format times as HH:MM in the user's local timezone
  // UTC times from ICS are automatically converted to local time by Date object
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
 * Validate calendar URL to prevent SSRF attacks
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is safe to fetch
 * 
 * Note: This validation blocks localhost and private IPv4 addresses.
 * It does NOT currently block:
 * - Private IPv6 ranges (fc00::/7, fe80::/10)
 * - IPv4-mapped IPv6 addresses (::ffff:192.168.1.1)
 * - DNS rebinding attacks (domain initially resolves to public IP, later to private)
 * 
 * For production use in security-sensitive contexts, consider additional safeguards.
 */
function validateCalendarURL(url) {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  try {
    const parsedURL = new URL(url)
    
    // Only allow https:// and http:// protocols (no file://, javascript:, etc.)
    if (parsedURL.protocol !== 'https:' && parsedURL.protocol !== 'http:') {
      logger.warn('Invalid protocol for calendar URL', { protocol: parsedURL.protocol })
      return false
    }
    
    // Reject localhost and private IP ranges to prevent SSRF
    const hostname = parsedURL.hostname.toLowerCase()
    
    // Block localhost variations
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      logger.warn('Localhost URLs not allowed for calendar subscriptions')
      return false
    }
    
    // Block private IPv6 ranges
    if (hostname.includes(':')) {
      // IPv6 addresses in URLs are wrapped in brackets [ipv6], so remove them for checking
      const ipv6Address = hostname.replace(/^\[|\]$/g, '')
      
      // Check for IPv6 private ranges and IPv4-mapped IPv6
      if (ipv6Address.startsWith('fc') || ipv6Address.startsWith('fd') || 
          ipv6Address.startsWith('fe80') || ipv6Address.includes('::ffff:')) {
        logger.warn('Private IPv6 ranges not allowed for calendar subscriptions')
        return false
      }
    }
    
    // Block private IPv4 ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const ipMatch = hostname.match(ipv4Regex)
    if (ipMatch) {
      const a = Number(ipMatch[1])
      const b = Number(ipMatch[2])
      const c = Number(ipMatch[3])
      const d = Number(ipMatch[4])
      
      // Validate octets are in valid range (0-255)
      if (a > 255 || b > 255 || c > 255 || d > 255) {
        logger.warn('Invalid IPv4 address (octets out of range)')
        return false
      }
      
      // Check for private IP ranges
      if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
        logger.warn('Private IP ranges not allowed for calendar subscriptions')
        return false
      }
    }
    
    return true
  } catch (e) {
    logger.warn('Invalid URL format for calendar subscription', { url, error: e.message })
    return false
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
  
  // Validate URL before fetching
  if (!validateCalendarURL(subscription.url)) {
    const error = new Error('Invalid or unsafe calendar URL. Only HTTPS/HTTP URLs to public servers are allowed.')
    logger.error('Calendar URL validation failed', { url: subscription.url })
    
    await updateCalendarSubscription({
      ...subscription,
      syncStatus: 'error',
      lastSyncError: error.message
    })
    
    throw error
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
      
      transaction.onerror = () => {
        db.close()
        const error = transaction.error || new Error('Failed to delete old calendar events during sync.')
        reject(error)
      }
    })
    
    // Add new events
    for (const icsEvent of icsEvents) {
      const scheduleEvent = convertICSEventToScheduleEvent(icsEvent, subscriptionId)
      // Skip invalid events
      if (scheduleEvent) {
        await createEvent(scheduleEvent)
      }
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
