import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Icon from '../components/common/Icon'
import EventModal from '../components/Schedule/EventModal'
import CalendarSubscriptionModal from '../components/Schedule/CalendarSubscriptionModal'
import {
  createEvent,
  getEventsForDay,
  getEventsForWeek,
  getEventsForRange
} from '../utils/scheduleManager'
import { createLogger } from '../utils/logger'
import { subtractDuration } from '../utils/timeUtils'
import dayjs from 'dayjs'
import {
  EVENT_TYPES,
  SCHEDULE_START_HOUR,
  SCHEDULE_END_HOUR,
  PIXELS_PER_HOUR,
  SCHEDULE_VERTICAL_OFFSET,
  MINUTES_PER_HOUR
} from '../utils/scheduleConstants'

const logger = createLogger('Schedule')

// Reusable ScheduleBlock component
function ScheduleBlock({
  type,
  className = '',
  title,
  time,
  top,
  height,
  isNext = false,
  onClick
}) {
  const blockClasses = `block ${type} ${className}`.trim()
  const ariaLabel = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${title} at ${time}${isNext ? ' - Next up' : ''}`

  return (
    <div
      className={blockClasses}
      style={{ top: `${top}px`, height: `${height}px` }}
      aria-label={ariaLabel}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
    >
      {isNext && <div className='next-badge'>Next</div>}
      <div className='title'>{title}</div>
      <div className='meta'>{time}</div>
    </div>
  )
}

ScheduleBlock.propTypes = {
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  top: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  isNext: PropTypes.bool,
  onClick: PropTypes.func
}

// Reusable component for travel/preparation time blocks
function TimePreparationBlock({ type, top, height, time }) {
  const blockClasses = `block block-preparation ${type}`
  const label = type === 'travel' ? 'Travel' : 'Prep'
  const ariaLabel = `${label} time: ${time}`

  return (
    <div
      className={blockClasses}
      style={{ top: `${top}px`, height: `${height}px` }}
      aria-label={ariaLabel}
      role='note'
    >
      <div className='title preparation-label'>{label}</div>
      <div className='meta'>{time}</div>
    </div>
  )
}

TimePreparationBlock.propTypes = {
  type: PropTypes.oneOf(['travel', 'preparation']).isRequired,
  top: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  time: PropTypes.string.isRequired
}

// Static configuration data - defined outside component to prevent recreation on every render
const SCHEDULE_BLOCKS = [
  {
    type: EVENT_TYPES.ROUTINE,
    title: 'Morning Launch',
    time: '07:00–07:30',
    top: 126,
    height: 60
  },
  {
    type: EVENT_TYPES.MEETING,
    title: 'Team Standup',
    time: '10:00–10:30',
    top: 486,
    height: 60,
    className: 'next-up',
    isNext: true
  },
  {
    type: EVENT_TYPES.TASK,
    className: 'not-urgent-important',
    title: 'Buy groceries',
    time: '16:00–16:30',
    top: 1206,
    height: 60
  }
]

const TIME_PERIODS = [
  { className: 'time-period-morning', top: 0, height: 720 },
  { className: 'time-period-afternoon', top: 720, height: 720 },
  { className: 'time-period-evening', top: 1440, height: 480 }
]

const SEPARATOR_POSITIONS = [126, 726, 1446]

// TODO: Extract timeToPosition and durationToHeight to a testable utility module
// These functions contain complex logic for time-to-pixel conversion and boundary clamping
// that should be thoroughly unit tested with various edge cases

// Convert time string (HH:MM) to pixel position
// Schedule starts at 06:00 (SCHEDULE_START_HOUR), each hour is 120px (PIXELS_PER_HOUR)
// Returns -1 if time is invalid or outside schedule range
const timeToPosition = (timeString) => {
  // Input validation: check for null, type, and format
  if (
    !timeString ||
    typeof timeString !== 'string' ||
    !timeString.includes(':')
  ) {
    return -1
  }
  const parts = timeString.split(':')
  if (parts.length !== 2) return -1

  const hours = Number(parts[0])
  const minutes = Number(parts[1])

  // Validate numeric conversion
  if (isNaN(hours) || isNaN(minutes)) return -1
  // Check if time falls within schedule window (06:00-22:00)
  if (hours < SCHEDULE_START_HOUR || hours >= SCHEDULE_END_HOUR) return -1

  // Calculate pixel position from schedule start time
  return (
    (hours - SCHEDULE_START_HOUR) * PIXELS_PER_HOUR +
    (minutes / MINUTES_PER_HOUR) * PIXELS_PER_HOUR +
    SCHEDULE_VERTICAL_OFFSET
  )
}

// Convert duration in minutes to pixel height
// Clamps event times to visible schedule window (06:00-22:00) to prevent overflow
const durationToHeight = (startTime, endTime) => {
  // Input validation: check for null, type, and format
  if (
    !startTime ||
    !endTime ||
    typeof startTime !== 'string' ||
    typeof endTime !== 'string'
  ) {
    return 0
  }
  if (!startTime.includes(':') || !endTime.includes(':')) {
    return 0
  }

  const startParts = startTime.split(':')
  const endParts = endTime.split(':')

  if (startParts.length !== 2 || endParts.length !== 2) return 0

  const startHours = Number(startParts[0])
  const startMinutes = Number(startParts[1])
  const endHours = Number(endParts[0])
  const endMinutes = Number(endParts[1])

  // Validate numeric conversion
  if (
    isNaN(startHours) ||
    isNaN(startMinutes) ||
    isNaN(endHours) ||
    isNaN(endMinutes)
  ) {
    return 0
  }

  // Convert schedule hours to minutes for easier calculation
  const scheduleStartMinutes = SCHEDULE_START_HOUR * MINUTES_PER_HOUR // 360 minutes (06:00)
  const scheduleEndMinutes = SCHEDULE_END_HOUR * MINUTES_PER_HOUR // 1320 minutes (22:00)

  let startTotalMinutes = startHours * MINUTES_PER_HOUR + startMinutes
  let endTotalMinutes = endHours * MINUTES_PER_HOUR + endMinutes

  // If the event is completely outside the visible schedule, height is zero
  if (
    endTotalMinutes <= scheduleStartMinutes ||
    startTotalMinutes >= scheduleEndMinutes
  ) {
    return 0
  }

  // Clamp event times to the visible schedule window to prevent overflow rendering
  // This handles events that start before 06:00 or end after 22:00
  if (startTotalMinutes < scheduleStartMinutes) {
    startTotalMinutes = scheduleStartMinutes
  }
  if (endTotalMinutes > scheduleEndMinutes) {
    endTotalMinutes = scheduleEndMinutes
  }

  // Calculate the visible duration and convert to pixels
  const visibleDurationMinutes = Math.max(
    0,
    endTotalMinutes - startTotalMinutes
  )
  return (visibleDurationMinutes / MINUTES_PER_HOUR) * PIXELS_PER_HOUR
}

function Schedule() {
  // View mode state - 'day', 'week', or 'month'
  const [viewMode, setViewMode] = useState('day')

  // Date navigation state - track selected date (industry standard)
  const [selectedDate, setSelectedDate] = useState(dayjs())

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState(null)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  // Events state
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Dropdown state for event type selector
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Refs for timeout cleanup and menu items caching
  const tabTimeoutRef = useRef(null)
  const autoFocusTimeoutRef = useRef(null)
  const menuItemsRef = useRef(null)

  // Calculate current time position for time indicator
  const [currentTimePosition, setCurrentTimePosition] = useState(0)

  // Load events based on view mode and selected date
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      setError('')
      try {
        let loadedEvents
        if (viewMode === 'day') {
          loadedEvents = await getEventsForDay(selectedDate.format('YYYY-MM-DD'))
        } else if (viewMode === 'week') {
          loadedEvents = await getEventsForWeek()
        } else if (viewMode === 'month') {
          // Get first and last day of the month view (includes prev/next month days)
          const startOfMonth = selectedDate.startOf('month').startOf('week')
          const endOfMonth = selectedDate.endOf('month').endOf('week')
          loadedEvents = await getEventsForRange(
            startOfMonth.format('YYYY-MM-DD'),
            endOfMonth.format('YYYY-MM-DD')
          )
        }
        // Ensure loadedEvents is always an array
        setEvents(Array.isArray(loadedEvents) ? loadedEvents : [])
      } catch (err) {
        logger.error('Failed to load events:', err)
        setEvents([])
        setError('Failed to load schedule events')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [viewMode, selectedDate])

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()

      // Position = (hours - SCHEDULE_START_HOUR) * PIXELS_PER_HOUR + (minutes / MINUTES_PER_HOUR) * PIXELS_PER_HOUR + SCHEDULE_VERTICAL_OFFSET
      if (hours >= SCHEDULE_START_HOUR && hours < SCHEDULE_END_HOUR) {
        const position =
          (hours - SCHEDULE_START_HOUR) * PIXELS_PER_HOUR +
          (minutes / MINUTES_PER_HOUR) * PIXELS_PER_HOUR +
          SCHEDULE_VERTICAL_OFFSET
        setCurrentTimePosition(position)
      } else {
        setCurrentTimePosition(-1) // Hide if outside schedule range
      }
    }

    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Handle opening modal for adding events
  const handleAddEvent = (eventType) => {
    setSelectedEventType(eventType)
    setIsModalOpen(true)
    setIsDropdownOpen(false) // Close dropdown when opening modal
  }

  // Toggle dropdown menu with keyboard support
  const toggleDropdown = (event) => {
    // Prevent default for Space key to avoid page scrolling
    if (event?.key === ' ') {
      event.preventDefault()
    }

    const wasClosedBefore = !isDropdownOpen
    setIsDropdownOpen(!isDropdownOpen)

    // When dropdown opens (via keyboard or mouse), cache menu items for performance
    if (wasClosedBefore) {
      // Use setTimeout to ensure the menu is rendered before querying/focusing, store ref for cleanup
      autoFocusTimeoutRef.current = setTimeout(() => {
        const menuButtons = document.querySelectorAll(
          '.schedule-dropdown-menu button'
        )
        // Cache menu items in ref for performance (avoid repeated DOM queries in arrow key nav)
        menuItemsRef.current = Array.from(menuButtons)

        // Only auto-focus first menu item when opened via keyboard (Space or Enter) to preserve UX
        if (event?.key === 'Enter' || event?.key === ' ') {
          menuItemsRef.current[0]?.focus()
        }
      }, 0)
    } else {
      // Clear cached menu items when dropdown closes
      menuItemsRef.current = null
    }
  }

  // Close dropdown when clicking outside or using keyboard navigation
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.schedule-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (!isDropdownOpen) {
        return
      }

      // Allow users to close the dropdown with Escape
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        // Return focus to the dropdown button
        const dropdownButton = document.querySelector(
          '.schedule-dropdown button[aria-haspopup="menu"]'
        )
        if (dropdownButton) {
          dropdownButton.focus()
        }
        return
      }

      // When tabbing, close the dropdown once focus leaves it
      if (event.key === 'Tab') {
        // Clear any existing timeout
        if (tabTimeoutRef.current) {
          clearTimeout(tabTimeoutRef.current)
        }

        // Wait for focus to move before checking the active element
        tabTimeoutRef.current = window.setTimeout(() => {
          const activeElement = document.activeElement
          const isInsideDropdown =
            activeElement &&
            activeElement.closest &&
            activeElement.closest('.schedule-dropdown')

          if (!isInsideDropdown) {
            setIsDropdownOpen(false)
          }
          tabTimeoutRef.current = null
        }, 0)
      }

      // Arrow key navigation within menu - use cached menu items if available
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        // Use cached menu items or query DOM if not cached
        const menuItems =
          menuItemsRef.current ||
          Array.from(
            document.querySelectorAll('.schedule-dropdown-menu button')
          )

        if (!menuItems.length) {
          return
        }

        const currentIndex = menuItems.indexOf(document.activeElement)

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          const nextIndex =
            currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
          menuItems[nextIndex]?.focus()
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
          menuItems[prevIndex]?.focus()
        } else if (event.key === 'Home') {
          event.preventDefault()
          menuItems[0]?.focus()
        } else if (event.key === 'End') {
          event.preventDefault()
          menuItems[menuItems.length - 1]?.focus()
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      // Cleanup any pending dropdown-related timeouts
      if (tabTimeoutRef.current) {
        clearTimeout(tabTimeoutRef.current)
      }
      if (autoFocusTimeoutRef.current) {
        clearTimeout(autoFocusTimeoutRef.current)
      }
    }
  }, [isDropdownOpen])

  // Handle saving event
  const handleSaveEvent = async (eventData) => {
    try {
      await createEvent(eventData)
      // Reload events after creating new one, keeping the current view/date
      const loadedEvents =
        viewMode === 'day'
          ? await getEventsForDay(selectedDate.format('YYYY-MM-DD'))
          : await getEventsForWeek()
      // Ensure loadedEvents is always an array
      setEvents(Array.isArray(loadedEvents) ? loadedEvents : [])
      logger.log(`${eventData.type} event created successfully`)
    } catch (err) {
      logger.error('Failed to save event:', err)
      // Provide specific error message if available
      const reason = err && err.message ? err.message : 'Unknown error'
      throw new Error(`Failed to save event: ${reason}. Please try again.`)
    }
  }

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEventType(null)
  }

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  // Navigation handlers (industry standard)
  const goToToday = () => {
    setSelectedDate(dayjs())
  }

  const goToPrevious = () => {
    if (viewMode === 'day') {
      setSelectedDate((prev) => prev.subtract(1, 'day'))
    } else if (viewMode === 'week') {
      setSelectedDate((prev) => prev.subtract(1, 'week'))
    } else if (viewMode === 'month') {
      setSelectedDate((prev) => prev.subtract(1, 'month'))
    }
  }

  const goToNext = () => {
    if (viewMode === 'day') {
      setSelectedDate((prev) => prev.add(1, 'day'))
    } else if (viewMode === 'week') {
      setSelectedDate((prev) => prev.add(1, 'week'))
    } else if (viewMode === 'month') {
      setSelectedDate((prev) => prev.add(1, 'month'))
    }
  }

  // Generate month calendar grid (6 weeks x 7 days = 42 days)
  const generateMonthGrid = () => {
    const startOfMonth = selectedDate.startOf('month')
    const startOfGrid = startOfMonth.startOf('week') // Sunday of first week
    const grid = []

    for (let i = 0; i < 42; i++) {
      const day = startOfGrid.add(i, 'day')
      const dayEvents = events.filter((event) => event.day === day.format('YYYY-MM-DD'))
      grid.push({
        date: day,
        isCurrentMonth: day.month() === selectedDate.month(),
        isToday: day.isSame(dayjs(), 'day'),
        events: dayEvents
      })
    }

    return grid
  }

  return (
    <>
      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        eventType={selectedEventType}
      />

      {/* Calendar Subscription Modal */}
      <CalendarSubscriptionModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />

      {/* Error notification */}
      {error && (
        <div className='error-notification' role='alert' aria-live='assertive'>
          <Icon name='alertCircle' />
          <span>{error}</span>
          <button
            type='button'
            className='error-notification__close'
            onClick={() => setError('')}
            aria-label='Dismiss error notification'
          >
            <Icon name='x' />
          </button>
        </div>
      )}

      <div className='card'>
        <div className='card-h'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong>Schedule</strong>
            <span className='small'>
              {viewMode === 'month'
                ? selectedDate.format('MMMM YYYY')
                : selectedDate.isSame(dayjs(), 'day')
                  ? 'Today'
                  : selectedDate.format('ddd')}{' '}
              {viewMode !== 'month' && `· ${selectedDate.format('DD/MM/YYYY')}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Navigation controls - Industry standard from Google Calendar/Outlook */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                className='btn btn-icon'
                onClick={goToPrevious}
                aria-label={`Previous ${viewMode}`}
                title={`Previous ${viewMode}`}
              >
                <Icon name='chevronLeft' />
              </button>
              <button
                className='btn'
                onClick={goToToday}
                aria-label='Go to today'
                title='Go to today'
              >
                Today
              </button>
              <button
                className='btn btn-icon'
                onClick={goToNext}
                aria-label={`Next ${viewMode}`}
                title={`Next ${viewMode}`}
              >
                <Icon name='chevronRight' />
              </button>
            </div>
            <button
              className='btn'
              onClick={() => setIsCalendarModalOpen(true)}
              aria-label='Manage calendar subscriptions'
            >
              <Icon name='calendar' /> Calendars
            </button>
            <button
              className={`btn ${viewMode === 'day' ? 'btn-active' : ''}`}
              onClick={() => handleViewModeChange('day')}
              aria-label='View day schedule'
              aria-pressed={viewMode === 'day'}
            >
              Day
            </button>
            <button
              className={`btn ${viewMode === 'week' ? 'btn-active' : ''}`}
              onClick={() => handleViewModeChange('week')}
              aria-label='View week schedule'
              aria-pressed={viewMode === 'week'}
            >
              Week
            </button>
            <button
              className={`btn ${viewMode === 'month' ? 'btn-active' : ''}`}
              onClick={() => handleViewModeChange('month')}
              aria-label='View month schedule'
              aria-pressed={viewMode === 'month'}
            >
              Month
            </button>
            {/* Unified dropdown for scheduling all event types */}
            <div className='schedule-dropdown'>
              <button
                className='btn'
                onClick={(e) => {
                  // Handle both mouse and keyboard activation
                  // Keyboard (Space/Enter) activation is handled in onKeyDown to enable preventDefault
                  // This onClick filters out keyboard-initiated clicks (detail === 0) to prevent double-triggering
                  if (e.detail !== 0) {
                    // detail is 0 for keyboard-initiated clicks
                    toggleDropdown(e)
                  }
                }}
                onKeyDown={(e) => {
                  // Only respond to Enter and Space keys for dropdown toggle
                  const key = e.key
                  if (key === 'Enter' || key === ' ') {
                    e.preventDefault() // Prevent default to avoid double-triggering onClick
                    toggleDropdown(e)
                  }
                }}
                aria-label='Schedule an event'
                aria-expanded={isDropdownOpen}
                aria-haspopup='menu'
              >
                <Icon name='plus' /> Schedule <Icon name='chevronDown' />
              </button>
              {isDropdownOpen && (
                <div className='schedule-dropdown-menu' role='menu'>
                  <button
                    className='schedule-dropdown-item'
                    role='menuitem'
                    onClick={() => handleAddEvent(EVENT_TYPES.ROUTINE)}
                    aria-label='Schedule a routine'
                  >
                    <Icon name='repeat' /> Routine
                  </button>
                  <button
                    className='schedule-dropdown-item'
                    role='menuitem'
                    onClick={() => handleAddEvent(EVENT_TYPES.TASK)}
                    aria-label='Schedule a task'
                  >
                    <Icon name='checkCircle' /> Task
                  </button>
                  <button
                    className='schedule-dropdown-item'
                    role='menuitem'
                    onClick={() => handleAddEvent(EVENT_TYPES.MEETING)}
                    aria-label='Schedule a meeting'
                  >
                    <Icon name='users' /> Meeting
                  </button>
                  <button
                    className='schedule-dropdown-item'
                    role='menuitem'
                    onClick={() => handleAddEvent(EVENT_TYPES.HABIT)}
                    aria-label='Schedule a habit'
                  >
                    <Icon name='target' /> Habit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='card-b layout-schedule'>
          {isLoading && (
            <div className='loading-indicator' role='status' aria-live='polite'>
              <span>Loading schedule...</span>
            </div>
          )}
          <aside className='sidebar'>
            <div className='card'>
              <div className='card-h'>
                <strong>Today&apos;s queue</strong>
              </div>
              <div className='card-b'>
                <div className='list'>
                  <div className='list-row'>
                    <span>Deep Work Warmup</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='card' style={{ marginTop: '12px' }}>
              <div className='card-h'>
                <strong>Tasks</strong>
              </div>
              <div className='card-b'>
                <div className='list'>
                  <div className='list-row'>
                    <span>Buy groceries</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <section>
            {viewMode === 'month' ? (
              /* Month View */
              <div className='calendar month-view'>
                <div className='month-grid'>
                  {/* Day headers */}
                  <div className='month-header'>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className='month-day-header'>
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Date cells */}
                  <div className='month-body'>
                    {generateMonthGrid().map((cell, index) => (
                      <div
                        key={index}
                        className={`month-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}
                        onClick={() => {
                          setSelectedDate(cell.date)
                          setViewMode('day')
                        }}
                        role='button'
                        tabIndex={0}
                        aria-label={`${cell.date.format('MMMM D, YYYY')}${cell.events.length > 0 ? `, ${cell.events.length} event${cell.events.length > 1 ? 's' : ''}` : ''}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedDate(cell.date)
                            setViewMode('day')
                          }
                        }}
                      >
                        <div className='month-cell-date'>{cell.date.format('D')}</div>
                        {cell.events.length > 0 && (
                          <div className='month-cell-events'>
                            {cell.events.slice(0, 3).map((event, idx) => (
                              <div key={idx} className={`month-event ${event.type}`}>
                                {event.title}
                              </div>
                            ))}
                            {cell.events.length > 3 && (
                              <div className='month-event-more'>
                                +{cell.events.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Day/Week View */
              <div className='calendar'>
              <div className='hours'>
                <div className='hour-col'>
                  <div className='h'>06:00</div>
                  <div className='h time-period-label'>Morning</div>
                  <div className='h'>08:00</div>
                  <div className='h'>09:00</div>
                  <div className='h'>10:00</div>
                  <div className='h'>11:00</div>
                  <div className='h time-period-label'>Afternoon</div>
                  <div className='h'>13:00</div>
                  <div className='h'>14:00</div>
                  <div className='h'>15:00</div>
                  <div className='h'>16:00</div>
                  <div className='h'>17:00</div>
                  <div className='h time-period-label'>Evening</div>
                  <div className='h'>19:00</div>
                  <div className='h'>20:00</div>
                  <div className='h'>21:00</div>
                </div>
                <div className='slots' style={{ height: '1920px' }}>
                  {/* Time period backgrounds */}
                  {TIME_PERIODS.map((period) => (
                    <div
                      key={period.className}
                      className={period.className}
                      style={{
                        position: 'absolute',
                        top: `${period.top}px`,
                        left: '0',
                        right: '0',
                        height: `${period.height}px`
                      }}
                      aria-hidden='true'
                    />
                  ))}

                  {/* Time period separators */}
                  {SEPARATOR_POSITIONS.map((position) => (
                    <div
                      key={`separator-${position}`}
                      className='time-period-separator'
                      style={{ top: `${position}px` }}
                      aria-hidden='true'
                    />
                  ))}

                  {/* Current time indicator */}
                  {currentTimePosition > 0 && (
                    <div
                      className='current-time-indicator'
                      style={{ top: `${currentTimePosition}px` }}
                      aria-label='Current time'
                    >
                      <span className='current-time-label'>Now</span>
                    </div>
                  )}

                  {/* Schedule blocks - combine static demo blocks with dynamic events */}
                  {SCHEDULE_BLOCKS.map((block) => (
                    <ScheduleBlock
                      key={`${block.type}-${block.title}-${block.time}-${block.top}`}
                      {...block}
                    />
                  ))}

                  {/* Dynamic events from database */}
                  {/* Note: User event interactions are logged (event ID only) for debugging purposes.
                       See PRIVACY.md for detailed information about our logging practices and data handling. */}
                  {events.reduce((acc, event) => {
                    // Filter out invalid events with proper ID validation
                    // Allow ID >= 0 (0 can be valid in some database systems)
                    const hasValidId =
                      typeof event?.id === 'number' &&
                      Number.isFinite(event.id) &&
                      event.id >= 0

                    if (
                      !event ||
                      !event.startTime ||
                      !event.endTime ||
                      !event.title ||
                      !hasValidId
                    ) {
                      return acc
                    }

                    // Compute layout metrics once per event (performance optimization)
                    const top = timeToPosition(event.startTime)
                    const height = durationToHeight(
                      event.startTime,
                      event.endTime
                    )

                    // Filter out events completely outside schedule range
                    if (top < 0 || height <= 0) {
                      return acc
                    }

                    // Calculate start time for all pre-event activities (travel + preparation)
                    // This represents when the user needs to start preparing/traveling for the event
                    const prepStartTime = subtractDuration(
                      event.startTime,
                      event.preparationTime || 0
                    )

                    // Render preparation time block if present
                    if (event.preparationTime && event.preparationTime > 0) {
                      const prepTop = timeToPosition(prepStartTime)
                      const prepHeight = durationToHeight(
                        prepStartTime,
                        event.startTime
                      )

                      if (prepTop >= 0 && prepHeight > 0) {
                        acc.push(
                          <TimePreparationBlock
                            key={`prep-${event.id}`}
                            type='preparation'
                            top={prepTop}
                            height={prepHeight}
                            time={`${event.preparationTime}m`}
                          />
                        )
                      }
                    }

                    // Render travel time block if present
                    if (event.travelTime && event.travelTime > 0) {
                      const travelStartTime = subtractDuration(
                        prepStartTime,
                        event.travelTime
                      )
                      const travelTop = timeToPosition(travelStartTime)
                      const travelHeight = durationToHeight(
                        travelStartTime,
                        prepStartTime
                      )

                      if (travelTop >= 0 && travelHeight > 0) {
                        acc.push(
                          <TimePreparationBlock
                            key={`travel-${event.id}`}
                            type='travel'
                            top={travelTop}
                            height={travelHeight}
                            time={`${event.travelTime}m`}
                          />
                        )
                      }
                    }

                    // Render main event block
                    acc.push(
                      <ScheduleBlock
                        key={`dynamic-event-${event.id}`}
                        type={event.type || EVENT_TYPES.TASK}
                        title={event.title}
                        time={`${event.startTime}–${event.endTime}`}
                        top={top}
                        height={height}
                        onClick={() =>
                          // Log interaction for debugging (event ID only, no PII)
                          logger.info('User interacted with schedule event', {
                            id: event.id
                          })
                        }
                      />
                    )
                    return acc
                  }, [])}
                </div>
              </div>
            </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

export default Schedule
