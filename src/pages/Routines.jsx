import React from 'react'

function Routines() {
  return (
    <>
      {/* TAB-RTN-01: Toolbar with Routine Management Buttons */}
      <div className='card' style={{ marginBottom: '14px' }}>
        <div className='card-b'>
          <div className='routine-toolbar'>
            <button className='btn' aria-label='Create new routine'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M12 5v14M5 12h14' />
              </svg>
              New Routine
            </button>
            <button className='btn' aria-label='Import routines from file'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' />
              </svg>
              Import
            </button>
            <button className='btn' aria-label='Export all routines'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' />
              </svg>
              Export All
            </button>
          </div>
        </div>
      </div>

      {/* TAB-RTN-03: Current Routine runner with progress bar */}
      <div className='card'>
        <div className='card-h'>
          <strong>Current Routine</strong>
          <span className='small'>Morning Launch</span>
        </div>
        {/* TAB-RTN-03: Prominent horizontal progress bar */}
        <div className='routine-progress'>
          <div className='routine-progress-bar' style={{ width: '33%' }}></div>
        </div>
        <div className='card-b runner-top'>
          <div className='routine-time'>
            <div className='small'>Routine timer</div>
            <div style={{ fontWeight: '700' }}>00:07:42</div>
          </div>
          {/* TAB-RTN-03: Step triptych with Previous (dim), Current (enlarged with glow), Next (preview) */}
          <div className='triptych'>
            <div className='panel dim'>
              <div className='step-title'>Water</div>
              <div className='step-meta'>
                <span className='small'>Previous</span>
                <span className='small'>00:00:24</span>
              </div>
            </div>
            <div className='panel panel-current'>
              <div className='step-title'>Meds</div>
              <div className='step-meta'>
                <span className='small'>Current · Timer</span>
                <span className='small'>01:06</span>
              </div>
              <div className='controls'>
                <button className='btn' aria-label='Pause current step'>
                  <svg className='icon' viewBox='0 0 24 24'>
                    <rect x='6' y='4' width='4' height='16' />
                    <rect x='14' y='4' width='4' height='16' />
                  </svg>{' '}
                  Pause
                </button>
                <button className='btn' aria-label='Skip current step'>
                  <svg className='icon' viewBox='0 0 24 24'>
                    <polygon points='5 4 15 12 5 20 5 4' />
                    <rect x='17' y='4' width='2' height='16' />
                  </svg>{' '}
                  Skip
                </button>
              </div>
            </div>
            <div className='panel dim'>
              <div className='step-title'>Stretch</div>
              <div className='step-meta'>
                <span className='small'>Next</span>
                <span className='small'>05:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom split: details and library */}
      <div className='bottom-split'>
        <div className='card'>
          <div className='card-h'>
            <strong>Routine details</strong>
            <span className='small'>Reorder or move steps</span>
          </div>
          <div className='card-b'>
            <div className='details-list'>
              <div className='detail-row'>
                <span>Water · 30s</span>
                <div>
                  <button className='btn' aria-label='Reorder Water step'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7' />
                    </svg>
                  </button>
                  <button className='btn' aria-label='Move Water step to later'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <polygon points='5 4 15 12 5 20 5 4' />
                      <rect x='17' y='4' width='2' height='16' />
                    </svg>{' '}
                    Move to later
                  </button>
                </div>
              </div>
              <div className='detail-row'>
                <span>Meds · 90s</span>
                <div>
                  <button className='btn' aria-label='Reorder Meds step'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7' />
                    </svg>
                  </button>
                  <button className='btn' aria-label='Move Meds step to later'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <polygon points='5 4 15 12 5 20 5 4' />
                      <rect x='17' y='4' width='2' height='16' />
                    </svg>{' '}
                    Move to later
                  </button>
                </div>
              </div>
              <div className='detail-row'>
                <span>Stretch · 300s</span>
                <div>
                  <button className='btn' aria-label='Reorder Stretch step'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7' />
                    </svg>
                  </button>
                  <button
                    className='btn'
                    aria-label='Move Stretch step to later'
                  >
                    <svg className='icon' viewBox='0 0 24 24'>
                      <polygon points='5 4 15 12 5 20 5 4' />
                      <rect x='17' y='4' width='2' height='16' />
                    </svg>{' '}
                    Move to later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB-RTN-04: Routine Library with empty state */}
        <div className='card'>
          <div className='card-h'>
            <strong>Routine Library</strong>
            <span className='small'>Your saved routines</span>
          </div>
          <div className='card-b'>
            <div className='routine-library-empty'>
              <div className='empty-state'>
                <svg
                  className='icon'
                  viewBox='0 0 24 24'
                  style={{ width: '48px', height: '48px', opacity: 0.5 }}
                >
                  <circle cx='12' cy='12' r='10' />
                  <path d='M12 6v12M6 12h12' />
                </svg>
                <p className='empty-state-text'>No routines yet</p>
                <p
                  className='small'
                  style={{ marginTop: '8px', marginBottom: '16px' }}
                >
                  Create your first routine to get started
                </p>
                <button
                  className='btn btn-primary'
                  aria-label='Create your first routine'
                >
                  <svg className='icon' viewBox='0 0 24 24'>
                    <path d='M12 5v14M5 12h14' />
                  </svg>
                  Create Routine
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Routines
