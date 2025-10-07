import React from 'react'

function Sequences() {
  return (
    <>
      {/* TAB-RTN-01: Toolbar with Routine Management Buttons */}
      <div className='card' style={{ marginBottom: '14px' }}>
        <div className='card-b'>
          <div className='routine-toolbar'>
            <button className='btn'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M12 5v14M5 12h14' />
              </svg>
              New Routine
            </button>
            <button className='btn'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' />
              </svg>
              Import
            </button>
            <button className='btn'>
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
          <div className='seq-time'>
            <div className='small'>Sequence timer</div>
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
                <button className='btn'>
                  <svg className='icon' viewBox='0 0 24 24'>
                    <rect x='6' y='4' width='4' height='16' />
                    <rect x='14' y='4' width='4' height='16' />
                  </svg>{' '}
                  Pause
                </button>
                <button className='btn'>
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
            <strong>Sequence details</strong>
            <span className='small'>Reorder or move steps</span>
          </div>
          <div className='card-b'>
            <div className='details-list'>
              <div className='detail-row'>
                <span>Water · 30s</span>
                <div>
                  <button className='btn'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7' />
                    </svg>
                  </button>
                  <button className='btn'>
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
                  <button className='btn'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7' />
                    </svg>
                  </button>
                  <button className='btn'>
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
                  <button className='btn'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7' />
                    </svg>
                  </button>
                  <button className='btn'>
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

        {/* TAB-RTN-04: Routine Library with detailed entries */}
        <div className='card'>
          <div className='card-h'>
            <strong>Routine Library</strong>
            <span className='small'>Your saved routines</span>
          </div>
          <div className='card-b'>
            <div className='routine-library'>
              {/* TAB-RTN-04: Library entry with Title, Tags, Version, Duration, Last Used */}
              <div className='routine-card'>
                <div className='routine-card-header'>
                  <div>
                    <h3 className='routine-title'>Morning Launch</h3>
                    <div className='routine-tags'>
                      <span className='routine-tag'>morning</span>
                      <span className='routine-tag'>energize</span>
                    </div>
                  </div>
                  <button className='btn-menu' aria-label='Routine menu'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <circle cx='12' cy='12' r='1' />
                      <circle cx='19' cy='12' r='1' />
                      <circle cx='5' cy='12' r='1' />
                    </svg>
                  </button>
                </div>
                <div className='routine-card-meta'>
                  <span className='small'>v1.2</span>
                  <span className='small'>~8 min</span>
                  <span className='small'>Last used: Today</span>
                </div>
                <div className='routine-card-actions'>
                  <button className='btn btn-primary'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <polygon points='5 3 19 12 5 21 5 3' />
                    </svg>
                    Start
                  </button>
                </div>
              </div>

              <div className='routine-card'>
                <div className='routine-card-header'>
                  <div>
                    <h3 className='routine-title'>Deep Work Warmup</h3>
                    <div className='routine-tags'>
                      <span className='routine-tag'>focus</span>
                      <span className='routine-tag'>work</span>
                    </div>
                  </div>
                  <button className='btn-menu' aria-label='Routine menu'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <circle cx='12' cy='12' r='1' />
                      <circle cx='19' cy='12' r='1' />
                      <circle cx='5' cy='12' r='1' />
                    </svg>
                  </button>
                </div>
                <div className='routine-card-meta'>
                  <span className='small'>v1.0</span>
                  <span className='small'>~5 min</span>
                  <span className='small'>Last used: Yesterday</span>
                </div>
                <div className='routine-card-actions'>
                  <button className='btn btn-primary'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <polygon points='5 3 19 12 5 21 5 3' />
                    </svg>
                    Start
                  </button>
                </div>
              </div>

              <div className='routine-card'>
                <div className='routine-card-header'>
                  <div>
                    <h3 className='routine-title'>Evening Reset</h3>
                    <div className='routine-tags'>
                      <span className='routine-tag'>evening</span>
                      <span className='routine-tag'>wind-down</span>
                    </div>
                  </div>
                  <button className='btn-menu' aria-label='Routine menu'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <circle cx='12' cy='12' r='1' />
                      <circle cx='19' cy='12' r='1' />
                      <circle cx='5' cy='12' r='1' />
                    </svg>
                  </button>
                </div>
                <div className='routine-card-meta'>
                  <span className='small'>v2.1</span>
                  <span className='small'>~12 min</span>
                  <span className='small'>Last used: 3 days ago</span>
                </div>
                <div className='routine-card-actions'>
                  <button className='btn btn-primary'>
                    <svg className='icon' viewBox='0 0 24 24'>
                      <polygon points='5 3 19 12 5 21 5 3' />
                    </svg>
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sequences
