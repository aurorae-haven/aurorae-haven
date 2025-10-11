import React, { useState } from 'react'

function Schedule() {
  const [showRunner, setShowRunner] = useState(false)

  const toggleRunner = (show) => {
    setShowRunner(show)
  }

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
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M12 5v14M5 12h14' />
              </svg>{' '}
              Routine
            </button>
            <button className='btn'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M12 5v14M5 12h14' />
              </svg>{' '}
              Task
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
                    <button className='btn' onClick={() => toggleRunner(true)}>
                      <svg className='icon' viewBox='0 0 24 24'>
                        <polygon points='5 3 19 12 5 21 5 3' />
                      </svg>
                    </button>
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
                  <div className='h'>07:00</div>
                  <div className='h'>08:00</div>
                  <div className='h'>09:00</div>
                  <div className='h'>10:00</div>
                  <div className='h'>11:00</div>
                  <div className='h'>12:00</div>
                  <div className='h'>13:00</div>
                  <div className='h'>14:00</div>
                  <div className='h'>15:00</div>
                  <div className='h'>16:00</div>
                  <div className='h'>17:00</div>
                  <div className='h'>18:00</div>
                  <div className='h'>19:00</div>
                  <div className='h'>20:00</div>
                  <div className='h'>21:00</div>
                </div>
                <div className='slots' style={{ height: '736px' }}>
                  <div
                    className='block'
                    style={{ top: '46px', height: '23.0px' }}
                    onClick={() => toggleRunner(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleRunner(true)
                      }
                    }}
                    role='button'
                    tabIndex={0}
                  >
                    <div className='title'>Morning Launch</div>
                    <div className='meta'>07:00–07:30</div>
                    <div className='progress'>
                      <i style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div
                    className='block task'
                    style={{ top: '460px', height: '23.0px' }}
                  >
                    <div className='title'>Buy groceries</div>
                    <div className='meta'>16:00</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Runner overlay */}
      <div id='runner' style={{ display: showRunner ? 'flex' : 'none' }}>
        <div className='panel'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div className='small'>Routine timer</div>
            <div style={{ fontWeight: '700' }}>00:12:34</div>
          </div>
          <div style={{ marginTop: '8px' }} className='progress'>
            <i style={{ width: '45%' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className='btn'>
              <svg className='icon' viewBox='0 0 24 24'>
                <polygon points='5 3 19 12 5 21 5 3' />
              </svg>{' '}
              Start
            </button>
            <button className='btn'>
              <svg className='icon' viewBox='0 0 24 24'>
                <rect x='6' y='4' width='4' height='16' />
                <rect x='14' y='4' width='4' height='16' />
              </svg>{' '}
              Pause
            </button>
            <button className='btn'>
              <svg className='icon' viewBox='0 0 24 24'>
                <rect x='6' y='6' width='12' height='12' rx='2' />
              </svg>{' '}
              Stop
            </button>
            <button className='btn'>
              <svg className='icon' viewBox='0 0 24 24'>
                <polygon points='5 4 15 12 5 20 5 4' />
                <rect x='17' y='4' width='2' height='16' />
              </svg>{' '}
              Skip
            </button>
            <button className='btn' onClick={() => toggleRunner(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Schedule
