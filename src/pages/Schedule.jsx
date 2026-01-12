import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icon from '../components/common/Icon'
import EventModal from '../components/Schedule/EventModal'
import { createEvent, getEventsForDay, getEventsForWeek } from '../utils/scheduleManager'
import { createLogger } from '../utils/logger'
import { getCurrentDateISO } from '../utils/timeUtils'
import dayjs from 'dayjs'

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
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      } : undefined}
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

// Static configuration data - defined outside component to prevent recreation on every render
const SCHEDULE_BLOCKS = [
  {
    type: 'routine',
    title: 'Morning Launch',
    time: '07:00–07:30',
    top: 126,
    height: 60
  },
  {
    type: 'meeting',
    title: 'Team Standup',
    time: '10:00–10:30',
    top: 486,
    height: 60,
    className: 'next-up',
    isNext: true
  },
  {
    type: 'task',
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

// Schedule configuration constants
const SCHEDULE_START_HOUR = 6
const SCHEDULE_END_HOUR = 22
const PIXELS_PER_HOUR = 120
const SCHEDULE_VERTICAL_OFFSET = 6

// Convert time string (HH:MM) to pixel position
// Schedule starts at 06:00, each hour is 120px
const timeToPosition = (timeString) => {
  if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
    return -1
  }
  const parts = timeString.split(':')
  if (parts.length !== 2) return -1
  
  const hours = Number(parts[0])
  const minutes = Number(parts[1])
  
  if (isNaN(hours) || isNaN(minutes)) return -1
  if (hours < SCHEDULE_START_HOUR || hours >= SCHEDULE_END_HOUR) return -1
  
  return (hours - SCHEDULE_START_HOUR) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR + SCHEDULE_VERTICAL_OFFSET
}

// Convert duration in minutes to pixel height
const durationToHeight = (startTime, endTime) => {
  if (!startTime || !endTime || typeof startTime !== 'string' || typeof endTime !== 'string') {
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
  
  if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
    return 0
  }
  
  const scheduleStartMinutes = SCHEDULE_START_HOUR * 60
  const scheduleEndMinutes = SCHEDULE_END_HOUR * 60
  
  let startTotalMinutes = startHours * 60 + startMinutes
  let endTotalMinutes = endHours * 60 + endMinutes
  
  // If the event is completely outside the visible schedule, height is zero
  if (endTotalMinutes <= scheduleStartMinutes || startTotalMinutes >= scheduleEndMinutes) {
    return 0
  }
  
  // Clamp event times to the visible schedule window
  if (startTotalMinutes < scheduleStartMinutes) {
    startTotalMinutes = scheduleStartMinutes
  }
  if (endTotalMinutes > scheduleEndMinutes) {
    endTotalMinutes = scheduleEndMinutes
  }
  
  const visibleDurationMinutes = Math.max(0, endTotalMinutes - startTotalMinutes)
  return (visibleDurationMinutes / 60) * PIXELS_PER_HOUR
}

function Schedule() {
  // View mode state - 'day' or 'week'
  const [viewMode, setViewMode] = useState('day')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState(null)
  
  // Events state
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Dropdown state for event type selector
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Calculate current time position for time indicator
  const [currentTimePosition, setCurrentTimePosition] = useState(0)

  // Load events based on view mode
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      setError('')
      try {
        const loadedEvents = viewMode === 'day' 
          ? await getEventsForDay(getCurrentDateISO())
          : await getEventsForWeek()
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
  }, [viewMode])

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()

      // Position = (hours - SCHEDULE_START_HOUR) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR + SCHEDULE_VERTICAL_OFFSET
      if (hours >= SCHEDULE_START_HOUR && hours < SCHEDULE_END_HOUR) {
        const position = (hours - SCHEDULE_START_HOUR) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR + SCHEDULE_VERTICAL_OFFSET
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
  
  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.schedule-dropdown')) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isDropdownOpen])

  // Handle saving event
  const handleSaveEvent = async (eventData) => {
    try {
      await createEvent(eventData)
      // Reload events after creating new one, keeping the current view/date
      const loadedEvents = viewMode === 'day' 
        ? await getEventsForDay(getCurrentDateISO())
        : await getEventsForWeek()
      // Ensure loadedEvents is always an array
      setEvents(Array.isArray(loadedEvents) ? loadedEvents : [])
      logger.log(`${eventData.type} event created successfully`)
    } catch (err) {
      logger.error('Failed to save event:', err)
      throw new Error('Failed to save event. Please try again.')
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

  return (
    <>
      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        eventType={selectedEventType}
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
            <span className='small'>Today · {dayjs().format('ddd DD/MM/YYYY')}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
            {/* Unified dropdown for scheduling all event types */}
            <div className='schedule-dropdown'>
              <button 
                className='btn'
                onClick={toggleDropdown}
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
                    onClick={() => handleAddEvent('routine')}
                    aria-label='Schedule a routine'
                  >
                    <Icon name='repeat' /> Routine
                  </button>
                  <button
                    className='schedule-dropdown-item'
                    role='menuitem'
                    onClick={() => handleAddEvent('task')}
                    aria-label='Schedule a task'
                  >
                    <Icon name='checkCircle' /> Task
                  </button>
                  <button
                    className='schedule-dropdown-item'
                    role='menuitem'
                    onClick={() => handleAddEvent('meeting')}
                    aria-label='Schedule a meeting'
                  >
                    <Icon name='users' /> Meeting
                  </button>
                  <button
                    className='schedule-dropdown-item'
                    role='menuitem'
                    onClick={() => handleAddEvent('habit')}
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
                  {events.map((event) => {
                    // Skip invalid events
                    if (!event || !event.startTime || !event.endTime || !event.title) return null
                    
                    const top = timeToPosition(event.startTime)
                    const height = durationToHeight(event.startTime, event.endTime)
                    // Skip events completely outside schedule range
                    if (top < 0 || height === 0) return null

                    return (
                      <ScheduleBlock
                        key={`event-${event.id}`}
                        type={event.type || 'task'}
                        title={event.title}
                        time={`${event.startTime}–${event.endTime}`}
                        top={top}
                        height={height}
                        onClick={() =>
                          logger.info('User interacted with schedule event', {
                            id: event.id,
                            title: event.title,
                            startTime: event.startTime,
                            endTime: event.endTime
                          })
                        }
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default Schedule
