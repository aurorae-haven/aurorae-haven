import React, { useState } from 'react'
import { useRoutines } from '../hooks/useRoutines'
import { useRoutineRunner } from '../hooks/useRoutineRunner'
import { formatTime } from '../utils/routineRunner'

function Routines() {
  const { routines, isLoading, filters, sortBy, updateSort } = useRoutines()

  const [selectedRoutine, setSelectedRoutine] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // TAB-RTN-05: Grid/List view

  const runner = useRoutineRunner(selectedRoutine)

  // Start runner when selectedRoutine and runner are ready
  React.useEffect(() => {
    if (selectedRoutine && runner && runner.start && runner.state && !runner.state.isRunning) {
      runner.start()
    }
  }, [selectedRoutine, runner])

  // Start a routine - TAB-RTN-04: Start button
  const handleStartRoutine = (routine) => {
    setSelectedRoutine(routine)
    // Runner will auto-initialize when selectedRoutine changes
  }

  // Stop/Cancel routine - TAB-RTN-18
  const handleCancelRoutine = () => {
    if (runner.cancel) runner.cancel()
    setSelectedRoutine(null)
  }

  return (
    <>
      {/* TAB-RTN-01 & TAB-RTN-05: Toolbar with Routine Management Buttons */}
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
              Export
            </button>
            <button
              className='btn'
              aria-label='Filter routines'
              title='Filter by tags, duration, or energy level'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M22 3H2l8 9.46V19l4 2v-8.54L22 3z' />
              </svg>
              Filter
            </button>
            <button
              className='btn'
              aria-label='Sort routines'
              onClick={() => {
                // Cycle through sort options - TAB-RTN-07
                const sortOptions = ['title', 'lastUsed', 'duration', 'timestamp']
                const currentIndex = sortOptions.indexOf(sortBy)
                const nextIndex = (currentIndex + 1) % sortOptions.length
                updateSort(sortOptions[nextIndex], 'desc')
              }}
              title={`Currently sorted by: ${sortBy}`}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M3 18h6M3 6h18M3 12h12' />
              </svg>
              Sort
            </button>
            <button
              className='btn'
              aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                {viewMode === 'grid' ? (
                  <path d='M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' />
                ) : (
                  <path d='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' />
                )}
              </svg>
              View
            </button>
          </div>
        </div>
      </div>

      {/* TAB-RTN-03: Current Routine runner with progress bar */}
      {runner.state && runner.state.isRunning && (
        <div className='card'>
          <div className='card-h'>
            <strong>Current Routine</strong>
            <span className='small'>
              {runner.state.routine.title || runner.state.routine.name}
            </span>
          </div>
          {/* TAB-RTN-03 & TAB-RTN-42: Progress bar with ARIA */}
          <div
            className='routine-progress'
            role='progressbar'
            aria-valuenow={runner.progress}
            aria-valuemin='0'
            aria-valuemax='100'
            aria-label="Routine progress"
            aria-valuetext={`${runner.progress}% complete`}
          >
            <div
              className='routine-progress-bar'
              style={{ width: `${runner.progress}%` }}
            ></div>
          </div>
          <div className='card-b runner-top'>
            <div className='routine-time'>
              <div className='small'>Step timer</div>
              {/* TAB-RTN-43: Timer with aria-live for screen readers */}
              <div style={{ fontWeight: '700' }}>
                {runner.remainingTime}
                <span
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                  }}
                  aria-live='polite'
                >
                  {formatTime(runner.remainingTime, { verbose: true })} remaining
                </span>
              </div>
            </div>
            {/* TAB-RTN-09: Step triptych - Previous (dim), Current (glow), Next (preview) */}
            <div className='triptych'>
              {/* Previous step */}
              {runner.previousStep ? (
                <div className='panel dim'>
                  <div className='step-title'>{runner.previousStep.label}</div>
                  <div className='step-meta'>
                    <span className='small'>Previous</span>
                    <span className='small'>
                      {formatTime(runner.previousStep.duration)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='panel dim' style={{ opacity: 0.3 }}>
                  <div className='step-title'>—</div>
                  <div className='step-meta'>
                    <span className='small'>Start</span>
                  </div>
                </div>
              )}

              {/* Current step - TAB-RTN-10 */}
              <div className='panel panel-current'>
                <div className='step-title'>{runner.currentStep?.label}</div>
                <div className='step-meta'>
                  <span className='small'>
                    Current · {runner.state.isPaused ? 'Paused' : 'Running'}
                  </span>
                  <span className='small'>{runner.remainingTime}</span>
                </div>
                {/* TAB-RTN-11: Controls with accessible labels */}
                <div className='controls'>
                  <button
                    className='btn'
                    onClick={runner.complete}
                    aria-label='Complete current step'
                    disabled={!runner.state.isRunning}
                  >
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M20 6L9 17l-5-5' />
                    </svg>
                    Complete
                  </button>
                  <button
                    className='btn'
                    onClick={runner.togglePause}
                    aria-label={
                      runner.state.isPaused ? 'Resume routine' : 'Pause routine'
                    }
                  >
                    <svg className='icon' viewBox='0 0 24 24'>
                      {runner.state.isPaused ? (
                        <polygon points='5 3 19 12 5 21 5 3' />
                      ) : (
                        <>
                          <rect x='6' y='4' width='4' height='16' />
                          <rect x='14' y='4' width='4' height='16' />
                        </>
                      )}
                    </svg>
                    {runner.state.isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    className='btn'
                    onClick={() => runner.skip()}
                    aria-label='Skip current step'
                    disabled={!runner.state.isRunning}
                  >
                    <svg className='icon' viewBox='0 0 24 24'>
                      <polygon points='5 4 15 12 5 20 5 4' />
                      <rect x='17' y='4' width='2' height='16' />
                    </svg>
                    Skip
                  </button>
                  <button
                    className='btn'
                    onClick={handleCancelRoutine}
                    aria-label='Cancel routine'
                    style={{
                      borderColor: 'var(--alert)',
                      color: 'var(--alert)'
                    }}
                  >
                    <svg className='icon' viewBox='0 0 24 24'>
                      <path d='M18 6L6 18M6 6l12 12' />
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>

              {/* Next step */}
              {runner.nextStep ? (
                <div className='panel dim'>
                  <div className='step-title'>{runner.nextStep.label}</div>
                  <div className='step-meta'>
                    <span className='small'>Next</span>
                    <span className='small'>
                      {formatTime(runner.nextStep.duration)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='panel dim' style={{ opacity: 0.3 }}>
                  <div className='step-title'>—</div>
                  <div className='step-meta'>
                    <span className='small'>Finish</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB-RTN-04: Routine Library */}
      <div className='card'>
        <div className='card-h'>
          <strong>Routine Library</strong>
          <span className='small'>
            {isLoading
              ? 'Loading...'
              : `${routines.length} routine${routines.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className='card-b'>
          {isLoading ? (
            // TAB-RTN-51: Skeleton loading state
            <div className='routine-library'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='routine-card' style={{ opacity: 0.5 }}>
                  <div className='routine-card-header'>
                    <div>
                      <div
                        style={{
                          height: '20px',
                          width: '150px',
                          background: 'var(--line)',
                          borderRadius: '4px'
                        }}
                      />
                      <div
                        style={{
                          height: '12px',
                          width: '100px',
                          background: 'var(--line)',
                          borderRadius: '4px',
                          marginTop: '8px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : routines.length === 0 ? (
            // Empty state
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
                <p className='empty-state-text'>No routines found</p>
                <p
                  className='small'
                  style={{ marginTop: '8px', marginBottom: '16px' }}
                >
                  {Object.keys(filters).length > 0
                    ? 'Try adjusting your filters'
                    : 'Create your first routine to get started'}
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
          ) : (
            // Routine cards - TAB-RTN-04
            <div
              className={
                viewMode === 'grid' ? 'routine-library' : 'routine-list'
              }
            >
              {routines.map((routine) => (
                <div key={routine.id} className='routine-card'>
                  <div className='routine-card-header'>
                    <div style={{ flex: 1 }}>
                      <h3 className='routine-title'>
                        {routine.title || routine.name}
                      </h3>
                      {routine.tags && routine.tags.length > 0 && (
                        <div className='routine-tags'>
                          {routine.tags.map((tag, i) => (
                            <span key={i} className='routine-tag'>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className='btn-menu'
                      aria-label={`Options for ${routine.title || routine.name}`}
                      title='Edit, Duplicate, Delete, Export'
                    >
                      <svg className='icon' viewBox='0 0 24 24'>
                        <circle cx='12' cy='5' r='1' />
                        <circle cx='12' cy='12' r='1' />
                        <circle cx='12' cy='19' r='1' />
                      </svg>
                    </button>
                  </div>

                  <div className='routine-card-meta'>
                    <span className='small'>
                      {routine.version ? `v${routine.version}` : 'v1'}
                    </span>
                    <span className='small'>·</span>
                    <span className='small'>
                      {formatTime(
                        routine.estimatedDuration || routine.totalDuration || 0
                      )}
                    </span>
                    {routine.energyTag && (
                      <>
                        <span className='small'>·</span>
                        <span className='small'>{routine.energyTag} energy</span>
                      </>
                    )}
                    {routine.lastUsed && (
                      <>
                        <span className='small'>·</span>
                        <span className='small'>
                          Used{' '}
                          {new Date(routine.lastUsed).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>

                  <div className='routine-card-actions'>
                    <button
                      className='btn btn-primary'
                      onClick={() => handleStartRoutine(routine)}
                      aria-label={`Start ${routine.title || routine.name} routine`}
                      disabled={runner.state?.isRunning}
                    >
                      <svg className='icon' viewBox='0 0 24 24'>
                        <polygon points='5 3 19 12 5 21 5 3' />
                      </svg>
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TAB-RTN-31: Completion Summary Modal */}
      {runner.isComplete && runner.summary && (
        <div
          className='modal-overlay'
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              runner.reset()
              setSelectedRoutine(null)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              runner.reset()
              setSelectedRoutine(null)
            }
          }}
          role='button'
          tabIndex={0}
        >
          <div
            className='modal-content'
            role='dialog'
            aria-modal='true'
            aria-labelledby='summary-title'
          >
            <div className='modal-header'>
              <h2 id='summary-title'>🎉 Routine Complete!</h2>
              <button
                className='btn'
                onClick={() => {
                  runner.reset()
                  setSelectedRoutine(null)
                }}
                aria-label='Close summary'
              >
                <svg className='icon' viewBox='0 0 24 24'>
                  <path d='M18 6L6 18M6 6l12 12' />
                </svg>
              </button>
            </div>
            <div className='modal-body'>
              <h3>{runner.summary.routineTitle}</h3>

              {/* Duration comparison */}
              <div style={{ marginBottom: '16px' }}>
                <div className='small'>Duration</div>
                <div>
                  <strong>{formatTime(runner.summary.actualDuration)}</strong>{' '}
                  <span className='small'>
                    (planned: {formatTime(runner.summary.plannedDuration)})
                  </span>
                </div>
              </div>

              {/* Steps summary */}
              <div style={{ marginBottom: '16px' }}>
                <div className='small'>Steps</div>
                <div>
                  <strong>{runner.summary.completedCount}</strong> completed ·{' '}
                  <span className='small'>
                    {runner.summary.skippedCount} skipped ·{' '}
                    {runner.summary.onTimePercentage}% on-time
                  </span>
                </div>
              </div>

              {/* XP Breakdown */}
              <div style={{ marginBottom: '16px' }}>
                <div className='small'>XP Earned</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--mint)' }}>
                      {runner.summary.xpBreakdown.total} XP
                    </strong>
                  </div>
                  <div className='small'>
                    • {runner.summary.xpBreakdown.stepXP} from steps
                  </div>
                  <div className='small'>
                    • {runner.summary.xpBreakdown.routineBonus} routine bonus
                  </div>
                  {runner.summary.xpBreakdown.perfectBonus > 0 && (
                    <div className='small' style={{ color: 'var(--mint)' }}>
                      • {runner.summary.xpBreakdown.perfectBonus} perfect bonus
                      🌟
                    </div>
                  )}
                </div>
              </div>

              {/* Step log */}
              <div style={{ marginBottom: '16px' }}>
                <div className='small'>Step Log</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    marginTop: '8px'
                  }}
                >
                  {runner.summary.steps.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(16, 20, 44, 0.28)',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <span>
                        {step.status === 'completed' ? '✓' : '⊘'}{' '}
                        {step.stepLabel}
                      </span>
                      {step.status === 'skipped' && step.reason && (
                        <span className='small'> - {step.reason}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}
              >
                <button
                  className='btn'
                  onClick={() => {
                    runner.reset()
                    setSelectedRoutine(null)
                  }}
                >
                  Close
                </button>
                <button
                  className='btn btn-primary'
                  onClick={() => {
                    runner.reset()
                    // Keep routine selected for another run
                  }}
                >
                  Run Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Routines
