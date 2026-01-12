import React, { useState, useEffect } from 'react'
import Icon from '../components/common/Icon'

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

  // For demo purposes, let's set a visible time (e.g., 09:15)
  // Remove this line when using real current time
  const demoPosition = (9 - 6) * 120 + (15 / 60) * 120 + 6 // 09:15

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
                  {/* Time period separators */}
                  <div
                    className='time-period-separator'
                    style={{ top: '126px' }}
                    aria-hidden='true'
                  />
                  <div
                    className='time-period-separator'
                    style={{ top: '726px' }}
                    aria-hidden='true'
                  />
                  <div
                    className='time-period-separator'
                    style={{ top: '1446px' }}
                    aria-hidden='true'
                  />

                  {/* Current time indicator */}
                  {demoPosition > 0 && (
                    <div
                      className='current-time-indicator'
                      style={{ top: `${demoPosition}px` }}
                      aria-label='Current time: 09:15'
                    >
                      <span className='current-time-label'>Now</span>
                    </div>
                  )}

                  <div
                    className='block routine'
                    style={{ top: '126px', height: '60px' }}
                    aria-label='Routine: Morning Launch at 07:00–07:30, 30% complete'
                  >
                    <div className='title'>Morning Launch</div>
                    <div className='meta'>07:00–07:30</div>
                    <div className='progress'>
                      <i style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div
                    className='block meeting next-up'
                    style={{ top: '486px', height: '60px' }}
                    aria-label='Meeting: Team Standup at 10:00–10:30 - Next up'
                  >
                    <div className='next-badge'>Next</div>
                    <div className='title'>Team Standup</div>
                    <div className='meta'>10:00–10:30</div>
                  </div>
                  <div
                    className='block task not-urgent-important'
                    style={{ top: '1206px', height: '60px' }}
                    aria-label='Task: Buy groceries at 16:00–16:30, Not Urgent but Important'
                  >
                    <div className='title'>Buy groceries</div>
                    <div className='meta'>16:00–16:30</div>
                  </div>
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
