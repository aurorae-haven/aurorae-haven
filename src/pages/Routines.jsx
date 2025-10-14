import React, { useState, useRef, useEffect } from 'react'
import { useRoutineRunner } from '../hooks/useRoutineRunner'
import { formatTime } from '../utils/routineRunner'
import { Link } from 'react-router-dom'
import { exportRoutines, importRoutines } from '../utils/routinesManager'
import { saveTemplate } from '../utils/templatesManager'
import { createLogger } from '../utils/logger'
import ConfirmModal from '../components/common/ConfirmModal'

const logger = createLogger('Routines')

function Routines() {
  const [selectedRoutine, setSelectedRoutine] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const fileInputRef = useRef(null)
  
  // TAB-RTN-18: Cancel confirmation modal state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  
  // TAB-RTN-45: Reduced motion detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const runner = useRoutineRunner(selectedRoutine)

  // TAB-RTN-45: Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // TAB-RTN-44: Keyboard shortcuts
  useEffect(() => {
    if (!runner.state || !runner.state.isRunning) return

    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          if (runner.complete) runner.complete()
          break
        case 'p':
          e.preventDefault()
          if (runner.togglePause) runner.togglePause()
          break
        case 's':
          e.preventDefault()
          if (runner.skip) runner.skip()
          break
        case 'escape':
          e.preventDefault()
          handleCancelRoutine()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [runner])

  // Start runner when selectedRoutine and runner are ready
  React.useEffect(() => {
    if (
      selectedRoutine &&
      runner &&
      runner.start &&
      runner.state &&
      !runner.state.isRunning
    ) {
      runner.start()
    }
  }, [selectedRoutine, runner])

  // Show toast notification
  const showToastNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // TAB-RTN-18: Stop/Cancel routine with confirmation
  const handleCancelRoutine = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancel = (keepProgress) => {
    if (keepProgress) {
      // Keep partial progress - logs and XP are preserved in runner state
      logger.log('Routine cancelled - progress preserved')
    } else {
      // Discard progress
      if (runner.reset) runner.reset()
      logger.log('Routine cancelled - progress discarded')
    }
    if (runner.cancel) runner.cancel()
    setSelectedRoutine(null)
    setShowCancelConfirm(false)
  }

  // Handle routine data export - TAB-RTN-47
  const handleExportRoutines = async () => {
    try {
      const data = await exportRoutines()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `routines-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToastNotification('Routines exported successfully')
    } catch (error) {
      logger.error('Failed to export routines:', error)
      showToastNotification('Failed to export routines')
    }
  }

  // Handle routine data import - TAB-RTN-48, TAB-RTN-49
  const handleImportRoutines = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const results = await importRoutines(data)

      if (results.errors.length > 0) {
        logger.warn('Import completed with errors:', results.errors)
      }

      showToastNotification(
        `Imported ${results.imported} routines (${results.skipped} skipped)`
      )

      // Reload page to reflect imported routines
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      logger.error('Failed to import routines:', error)
      showToastNotification('Import failed: ' + error.message)
    }
  }

  // TAB-RTN-32: Save routine as template
  const handleSaveAsTemplate = async () => {
    if (!runner.state || !runner.state.routine) return

    try {
      const routine = runner.state.routine
      const template = {
        type: 'routine',
        title: routine.name || routine.title,
        tags: routine.tags || [],
        steps: routine.steps || [],
        estimatedDuration: routine.totalDuration || 0,
        energyTag: routine.energyTag
      }

      await saveTemplate(template)
      showToastNotification('Routine saved as template')
    } catch (error) {
      logger.error('Failed to save template:', error)
      showToastNotification('Failed to save template')
    }
  }

  // Handle routine selection (would come from Library via state/context in production)
  // For now, user needs to go to Library to select a routine
  // In future, could open a modal to select from available routines

  return (
    <>
      {/* TAB-RTN-05: Toolbar for routine data management */}
      <div className='card' style={{ marginBottom: '14px' }}>
        <div className='card-b'>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            <button
              className='btn'
              onClick={handleExportRoutines}
              aria-label='Export all routine data'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path
                  d='M12 15V3M8 7l4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                />
              </svg>
              Export Routines
            </button>
            <button
              className='btn'
              onClick={() => fileInputRef.current?.click()}
              aria-label='Import routine data'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path
                  d='M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                />
              </svg>
              Import Routines
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.json'
              onChange={handleImportRoutines}
              style={{ display: 'none' }}
              aria-label='Choose routine data file to import'
            />
            <div style={{ marginLeft: 'auto', fontSize: '0.875rem' }}>
              <span className='small'>
                Import/Export your routine data (instances with execution
                history)
              </span>
            </div>
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
            aria-label='Routine progress'
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
                    overflow: 'hidden'
                  }}
                  aria-live='polite'
                >
                  {formatTime(runner.remainingTime, { verbose: true })}
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

      {/* No routine selected - prompt to select from Library */}
      {!runner.state || !runner.state.isRunning ? (
        <div className='card'>
          <div className='card-b'>
            <div className='empty-state'>
              <svg
                className='icon'
                viewBox='0 0 24 24'
                style={{ width: '48px', height: '48px', opacity: 0.5 }}
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M12 8v4M12 16h.01' />
              </svg>
              <p className='empty-state-text'>No routine running</p>
              <p
                className='small'
                style={{ marginTop: '8px', marginBottom: '16px' }}
              >
                Select a routine from the Library to get started
              </p>
              <Link to='/library' className='btn btn-primary'>
                <svg className='icon' viewBox='0 0 24 24'>
                  <path d='M3 3h18v18H3zM7 7h10M7 11h10M7 15h10' />
                </svg>
                Browse Routines
              </Link>
            </div>
          </div>
        </div>
      ) : null}

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
              <h2
                id='summary-title'
                style={{
                  // TAB-RTN-45: Reduced motion - disable text animations
                  animation: prefersReducedMotion ? 'none' : undefined
                }}
              >
                🎉 Routine Complete!
              </h2>
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
            <div
              className='modal-body'
              style={{
                // TAB-RTN-45: Reduced motion - disable slide-in animations
                animation: prefersReducedMotion ? 'none' : undefined
              }}
            >
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
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div>
                    <strong
                      style={{ fontSize: '1.5rem', color: 'var(--mint)' }}
                    >
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

              {/* Actions - TAB-RTN-32: Added Save as Template */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'space-between'
                }}
              >
                <button
                  className='btn'
                  onClick={handleSaveAsTemplate}
                  aria-label='Save routine as template'
                >
                  <svg className='icon' viewBox='0 0 24 24'>
                    <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' />
                    <polyline points='17 21 17 13 7 13 7 21' />
                    <polyline points='7 3 7 8 15 8' />
                  </svg>
                  Save as Template
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
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
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--glass-hi)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 1000
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* TAB-RTN-18: Cancel confirmation modal */}
      {showCancelConfirm && (
        <ConfirmModal
          title='Cancel Routine?'
          message='Would you like to keep your partial progress (logs and XP)?'
          confirmText='Keep Progress'
          cancelText='Discard All'
          onConfirm={() => confirmCancel(true)}
          onCancel={() => confirmCancel(false)}
          onClose={() => setShowCancelConfirm(false)}
        />
      )}
    </>
  )
}

export default Routines
