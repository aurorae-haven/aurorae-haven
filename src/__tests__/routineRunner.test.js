// Test suite for Routine Runner
// Tests XP calculation, timer logic, and step progression

import {
  calculateStepXP,
  calculateRoutineBonus,
  calculatePerfectBonus,
  calculateTotalXP,
  formatTime,
  createRunnerState,
  advanceStep,
  completeStep,
  skipStep,
  togglePause,
  tickTimer,
  calculateProgress,
  isRoutineComplete,
  getRoutineSummary
} from '../utils/routineRunner'

describe('Routine Runner - XP Calculations', () => {
  describe('calculateStepXP', () => {
    test('TAB-RTN-22: should award 1 XP for completed step', () => {
      expect(calculateStepXP(false)).toBe(1)
    })

    test('TAB-RTN-23: should award 2 XP for on-time completion', () => {
      expect(calculateStepXP(true)).toBe(2)
    })
  })

  describe('calculateRoutineBonus', () => {
    test('TAB-RTN-25: should award 2 XP for 1-5 steps', () => {
      expect(calculateRoutineBonus(1)).toBe(2)
      expect(calculateRoutineBonus(5)).toBe(2)
    })

    test('TAB-RTN-25: should award 3 XP for 6-10 steps', () => {
      expect(calculateRoutineBonus(6)).toBe(3)
      expect(calculateRoutineBonus(10)).toBe(3)
    })

    test('TAB-RTN-25: should award 4 XP for 11+ steps (capped)', () => {
      expect(calculateRoutineBonus(11)).toBe(4)
      expect(calculateRoutineBonus(15)).toBe(4)
      expect(calculateRoutineBonus(20)).toBe(4)
      expect(calculateRoutineBonus(100)).toBe(4)
    })
  })

  describe('calculatePerfectBonus', () => {
    test('TAB-RTN-26: should award 2 XP if all steps on-time', () => {
      const allOnTime = [
        { completedOnTime: true, xp: 2 },
        { completedOnTime: true, xp: 2 },
        { completedOnTime: true, xp: 2 }
      ]
      expect(calculatePerfectBonus(allOnTime)).toBe(2)
    })

    test('TAB-RTN-26: should award 0 XP if any step not on-time', () => {
      const someOffTime = [
        { completedOnTime: true, xp: 2 },
        { completedOnTime: false, xp: 1 },
        { completedOnTime: true, xp: 2 }
      ]
      expect(calculatePerfectBonus(someOffTime)).toBe(0)
    })

    test('should award 0 XP for empty steps', () => {
      expect(calculatePerfectBonus([])).toBe(0)
    })
  })

  describe('calculateTotalXP', () => {
    test('should sum step XP, routine bonus, and perfect bonus', () => {
      const steps = [
        { completedOnTime: true, xp: 2 },
        { completedOnTime: true, xp: 2 },
        { completedOnTime: true, xp: 2 }
      ]
      const result = calculateTotalXP(steps, 3)

      expect(result.stepXP).toBe(6)
      expect(result.routineBonus).toBe(2)
      expect(result.perfectBonus).toBe(2)
      expect(result.total).toBe(10)
    })

    test('should handle mixed on-time performance', () => {
      const steps = [
        { completedOnTime: true, xp: 2 },
        { completedOnTime: false, xp: 1 },
        { completedOnTime: true, xp: 2 }
      ]
      const result = calculateTotalXP(steps, 3)

      expect(result.stepXP).toBe(5)
      expect(result.routineBonus).toBe(2)
      expect(result.perfectBonus).toBe(0) // Not all on-time
      expect(result.total).toBe(7)
    })
  })
})

describe('Routine Runner - Time Formatting', () => {
  test('should format positive seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(30)).toBe('00:30')
    expect(formatTime(60)).toBe('01:00')
    expect(formatTime(90)).toBe('01:30')
    expect(formatTime(300)).toBe('05:00')
    expect(formatTime(3661)).toBe('61:01')
  })

  test('should format negative seconds with minus sign', () => {
    expect(formatTime(-30)).toBe('-00:30')
    expect(formatTime(-90)).toBe('-01:30')
  })

  test('should handle invalid inputs by defaulting to 0', () => {
    expect(formatTime(undefined)).toBe('00:00')
    expect(formatTime(null)).toBe('00:00')
    expect(formatTime(NaN)).toBe('00:00')
    expect(formatTime('invalid')).toBe('00:00')
  })

  test('should support verbose option with "remaining" suffix', () => {
    expect(formatTime(90, { verbose: true })).toBe('01:30 remaining')
    expect(formatTime(300, { verbose: true })).toBe('05:00 remaining')
    expect(formatTime(0, { verbose: false })).toBe('00:00')
  })
})

describe('Routine Runner - State Management', () => {
  const mockRoutine = {
    id: 'test-routine',
    title: 'Test Routine',
    steps: [
      { label: 'Step 1', duration: 60 },
      { label: 'Step 2', duration: 120 },
      { label: 'Step 3', duration: 30 }
    ]
  }

  describe('createRunnerState', () => {
    test('should create initial state', () => {
      const state = createRunnerState(mockRoutine)

      expect(state.routineId).toBe('test-routine')
      expect(state.routine).toBe(mockRoutine)
      expect(state.currentStepIndex).toBe(0)
      expect(state.isRunning).toBe(false)
      expect(state.isPaused).toBe(false)
      expect(state.remainingSeconds).toBe(60)
      expect(state.completedSteps).toEqual([])
      expect(state.skippedSteps).toEqual([])
      expect(state.logs).toEqual([])
    })
  })

  describe('advanceStep', () => {
    test('should advance to next step', () => {
      const state = createRunnerState(mockRoutine)
      const nextState = advanceStep(state)

      expect(nextState.currentStepIndex).toBe(1)
      expect(nextState.remainingSeconds).toBe(120)
      expect(nextState.isPaused).toBe(false)
    })

    test('should stop running when reaching last step', () => {
      const state = createRunnerState(mockRoutine)
      const finalState = advanceStep(advanceStep(advanceStep(state)))

      expect(finalState.currentStepIndex).toBe(3)
      expect(finalState.isRunning).toBe(false)
    })
  })

  describe('completeStep', () => {
    test('TAB-RTN-13: should mark step complete and award XP', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        isRunning: true,
        remainingSeconds: 30 // Still time left = on-time
      }

      const newState = completeStep(state)

      expect(newState.currentStepIndex).toBe(1)
      expect(newState.completedSteps).toHaveLength(1)
      expect(newState.completedSteps[0].stepLabel).toBe('Step 1')
      expect(newState.completedSteps[0].status).toBe('completed')
      expect(newState.completedSteps[0].completedOnTime).toBe(true)
      expect(newState.completedSteps[0].xp).toBe(2)
      expect(newState.logs).toHaveLength(1)
    })

    test('should award only 1 XP if time expired', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        isRunning: true,
        remainingSeconds: 0 // No time left
      }

      const newState = completeStep(state)

      expect(newState.completedSteps[0].completedOnTime).toBe(false)
      expect(newState.completedSteps[0].xp).toBe(1)
    })
  })

  describe('skipStep', () => {
    test('TAB-RTN-14: should skip step without XP', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        isRunning: true
      }

      const newState = skipStep(state, 'Not needed')

      expect(newState.currentStepIndex).toBe(1)
      expect(newState.skippedSteps).toHaveLength(1)
      expect(newState.skippedSteps[0].stepLabel).toBe('Step 1')
      expect(newState.skippedSteps[0].status).toBe('skipped')
      expect(newState.skippedSteps[0].reason).toBe('Not needed')
      expect(newState.logs).toHaveLength(1)
      expect(newState.completedSteps).toHaveLength(0)
    })
  })

  describe('togglePause', () => {
    test('TAB-RTN-15: should pause and resume', async () => {
      let state = {
        ...createRunnerState(mockRoutine),
        isRunning: true,
        isPaused: false
      }

      // Pause
      state = togglePause(state)
      expect(state.isPaused).toBe(true)
      expect(state.pausedAt).toBeGreaterThan(0)

      // Wait a bit to accumulate pause time
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Resume
      state = togglePause(state)
      expect(state.isPaused).toBe(false)
      expect(state.pausedAt).toBe(null)
      expect(state.totalPausedTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('tickTimer', () => {
    test('should decrement remaining seconds', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        isRunning: true,
        remainingSeconds: 60
      }

      const newState = tickTimer(state)
      expect(newState.remainingSeconds).toBe(59)
    })

    test('should not go below 0', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        isRunning: true,
        remainingSeconds: 0
      }

      const newState = tickTimer(state)
      expect(newState.remainingSeconds).toBe(0)
    })

    test('should not tick when paused', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        isRunning: true,
        isPaused: true,
        remainingSeconds: 60
      }

      const newState = tickTimer(state)
      expect(newState.remainingSeconds).toBe(60)
    })
  })

  describe('calculateProgress', () => {
    test('should calculate progress percentage', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        completedSteps: [{ stepIndex: 0 }],
        skippedSteps: []
      }

      expect(calculateProgress(state)).toBe(33) // 1 of 3 steps
    })

    test('should handle 0 progress', () => {
      const state = createRunnerState(mockRoutine)
      expect(calculateProgress(state)).toBe(0)
    })

    test('should handle 100% progress', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        completedSteps: [{ stepIndex: 0 }, { stepIndex: 1 }],
        skippedSteps: [{ stepIndex: 2 }]
      }

      expect(calculateProgress(state)).toBe(100)
    })
  })

  describe('isRoutineComplete', () => {
    test('should return false for in-progress routine', () => {
      const state = createRunnerState(mockRoutine)
      expect(isRoutineComplete(state)).toBe(false)
    })

    test('should return true when all steps processed', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        completedSteps: [{ stepIndex: 0 }, { stepIndex: 1 }],
        skippedSteps: [{ stepIndex: 2 }]
      }

      expect(isRoutineComplete(state)).toBe(true)
    })
  })

  describe('getRoutineSummary', () => {
    test('TAB-RTN-31: should generate complete summary', () => {
      const state = {
        ...createRunnerState(mockRoutine),
        startedAt: Date.now() - 210000, // 3.5 minutes ago
        completedSteps: [
          { stepIndex: 0, completedOnTime: true, xp: 2 },
          { stepIndex: 1, completedOnTime: true, xp: 2 }
        ],
        skippedSteps: [{ stepIndex: 2 }],
        logs: [
          { stepLabel: 'Step 1', status: 'completed' },
          { stepLabel: 'Step 2', status: 'completed' },
          { stepLabel: 'Step 3', status: 'skipped' }
        ]
      }

      const summary = getRoutineSummary(state)

      expect(summary.routineTitle).toBe('Test Routine')
      expect(summary.totalSteps).toBe(3)
      expect(summary.completedCount).toBe(2)
      expect(summary.skippedCount).toBe(1)
      expect(summary.onTimePercentage).toBe(100)
      expect(summary.xpBreakdown.stepXP).toBe(4)
      expect(summary.xpBreakdown.routineBonus).toBe(2)
      expect(summary.xpBreakdown.perfectBonus).toBe(2)
      expect(summary.xpBreakdown.total).toBe(8)
      expect(summary.plannedDuration).toBe(210)
      expect(summary.steps).toHaveLength(3)
    })
  })
})
