import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icon from '../components/common/Icon'

// Reusable ScheduleBlock component
function ScheduleBlock({
  type,
  className = '',
  title,
  time,
  top,
  height,
  isNext = false
}) {
  const blockClasses = `block ${type} ${className}`.trim()
  const ariaLabel = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${title} at ${time}${isNext ? ' - Next up' : ''}`

  return (
    <div
      className={blockClasses}
      style={{ top: `${top}px`, height: `${height}px` }}
      aria-label={ariaLabel}
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
  isNext: PropTypes.bool
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

function Schedule() {
  // Calculate current time position for time indicator
  const [currentTimePosition, setCurrentTimePosition] = useState(0)

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()

      // Schedule starts at 06:00, each hour is 120px
      // Position = (hours - 6) * 120px + (minutes / 60) * 120px + 6px padding offset
      if (hours >= 6 && hours < 22) {
        const position = (hours - 6) * 120 + (minutes / 60) * 120 + 6
        setCurrentTimePosition(position)
      } else {
        setCurrentTimePosition(-1) // Hide if outside schedule range
      }
    }

    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className='card'>
        <div className='card-h'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong>Schedule</strong>
            <span className='small'>Today · Tue Sep 16, 2025</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className='btn'>Day</button>
            <button className='btn'>Week</button>
            <button className='btn'>
              <Icon name='plus' /> Routine
            </button>
            <button className='btn'>
              <Icon name='plus' /> Task
            </button>
            <button className='btn'>
              <Icon name='plus' /> Meeting
            </button>
          </div>
        </div>
        <div className='card-b layout-schedule'>
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

                  {/* Schedule blocks */}
                  {SCHEDULE_BLOCKS.map((block) => (
                    <ScheduleBlock
                      key={`${block.type}-${block.title}-${block.time}-${block.top}`}
                      {...block}
                    />
                  ))}
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
