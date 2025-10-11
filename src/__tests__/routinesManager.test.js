// Test suite for Routines Manager
// TODO: Expand tests as timer and execution features are implemented

import 'fake-indexeddb/auto'
import {
  createRoutine,
  getRoutines,
  getRoutine,
  updateRoutine,
  deleteRoutine,
  addStep,
  removeStep,
  reorderStep,
  cloneRoutine,
  startRoutine
} from '../utils/routinesManager'
import { clear, STORES } from '../utils/indexedDBManager'

describe('Routines Manager', () => {
  beforeEach(async () => {
    await clear(STORES.ROUTINES)
  })

  describe('createRoutine', () => {
    test('should create a new routine', async () => {
      const routine = {
        name: 'Morning Routine',
        steps: [
          { name: 'Wake up', duration: 60 },
          { name: 'Stretch', duration: 300 }
        ]
      }

      const id = await createRoutine(routine)
      expect(id).toBeDefined()
      expect(id).toContain('routine_')

      const routines = await getRoutines()
      expect(routines).toHaveLength(1)
      expect(routines[0].name).toBe('Morning Routine')
      expect(routines[0].totalDuration).toBe(360)
    })

    // TODO: Add test for empty routine
    test.todo('should create routine with no steps')

    // TODO: Add test for routine validation
    test.todo('should validate routine data')
  })

  describe('getRoutines', () => {
    test('should return empty array when no routines exist', async () => {
      const routines = await getRoutines()
      expect(routines).toEqual([])
    })

    test('should return all routines', async () => {
      await createRoutine({ name: 'Routine 1', steps: [] })
      await new Promise((resolve) => setTimeout(resolve, 10))
      await createRoutine({ name: 'Routine 2', steps: [] })

      const routines = await getRoutines()
      expect(routines).toHaveLength(2)
    })

    // TODO: Add test for sorting routines
    test.todo('should sort routines by name')

    // TODO: Add test for filtering routines
    test.todo('should filter routines by recently used')
  })

  describe('getRoutine', () => {
    test('should get routine by ID', async () => {
      const id = await createRoutine({ name: 'Test Routine', steps: [] })
      const routine = await getRoutine(id)

      expect(routine).toBeDefined()
      expect(routine.id).toBe(id)
      expect(routine.name).toBe('Test Routine')
    })

    // TODO: Add test for missing routine
    test.todo('should handle missing routine gracefully')
  })

  describe('updateRoutine', () => {
    test('should update existing routine', async () => {
      const id = await createRoutine({ name: 'Old Name', steps: [] })
      const routine = await getRoutine(id)

      routine.name = 'New Name'
      await updateRoutine(routine)

      const updated = await getRoutine(id)
      expect(updated.name).toBe('New Name')
    })

    // TODO: Add test for updating steps
    test.todo('should recalculate duration when steps change')
  })

  describe('deleteRoutine', () => {
    test('should delete routine by ID', async () => {
      const id = await createRoutine({ name: 'To Delete', steps: [] })
      await deleteRoutine(id)

      const routines = await getRoutines()
      expect(routines).toHaveLength(0)
    })

    // TODO: Add test for cascade delete from schedule
    test.todo('should remove routine from schedule on delete')
  })

  describe('addStep', () => {
    test('should add step to routine', async () => {
      const id = await createRoutine({ name: 'Test', steps: [] })
      const updated = await addStep(id, { name: 'New Step', duration: 120 })

      expect(updated.steps).toHaveLength(1)
      expect(updated.steps[0].name).toBe('New Step')
      expect(updated.totalDuration).toBe(120)
    })

    // TODO: Add test for step ordering
    test.todo('should maintain step order when adding')

    // TODO: Add test for step validation
    test.todo('should validate step data')
  })

  describe('removeStep', () => {
    test('should remove step from routine', async () => {
      const id = await createRoutine({
        name: 'Test',
        steps: [
          { id: 'step1', name: 'Step 1', duration: 60 },
          { id: 'step2', name: 'Step 2', duration: 120 }
        ]
      })

      const updated = await removeStep(id, 'step1')
      expect(updated.steps).toHaveLength(1)
      expect(updated.steps[0].id).toBe('step2')
      expect(updated.totalDuration).toBe(120)
    })

    // TODO: Add test for reordering after removal
    test.todo('should reorder remaining steps after removal')
  })

  describe('reorderStep', () => {
    test('should reorder steps in routine', async () => {
      const id = await createRoutine({
        name: 'Test',
        steps: [
          { id: 'step1', name: 'Step 1', duration: 60, order: 0 },
          { id: 'step2', name: 'Step 2', duration: 120, order: 1 },
          { id: 'step3', name: 'Step 3', duration: 180, order: 2 }
        ]
      })

      const updated = await reorderStep(id, 'step3', 0)
      expect(updated.steps[0].id).toBe('step3')
      expect(updated.steps[0].order).toBe(0)
      expect(updated.steps[1].order).toBe(1)
    })

    // TODO: Add test for invalid reorder
    test.todo('should handle invalid reorder positions')
  })

  describe('cloneRoutine', () => {
    test('should clone routine with new ID', async () => {
      const id = await createRoutine({
        name: 'Original',
        steps: [{ name: 'Step 1', duration: 60 }]
      })

      await new Promise((resolve) => setTimeout(resolve, 10))
      const newId = await cloneRoutine(id, 'Cloned')
      expect(newId).not.toBe(id)

      const cloned = await getRoutine(newId)
      expect(cloned.name).toBe('Cloned')
      expect(cloned.steps).toHaveLength(1)
    })

    // TODO: Add test for default clone name
    test.todo('should use default name if not provided')
  })

  describe('startRoutine', () => {
    test('should initialize routine execution state', async () => {
      const id = await createRoutine({
        name: 'Test',
        steps: [{ name: 'Step 1', duration: 60 }]
      })

      const state = await startRoutine(id)
      expect(state.routineId).toBe(id)
      expect(state.isRunning).toBe(true)
      expect(state.isPaused).toBe(false)
      expect(state.currentStepIndex).toBe(0)
    })

    // TODO: Add tests for timer integration
    test.todo('should integrate with timer system')

    // TODO: Add tests for pause/resume
    test.todo('should support pause and resume')

    // TODO: Add tests for step completion
    test.todo('should advance to next step on completion')

    // TODO: Add tests for routine completion
    test.todo('should handle routine completion')
  })
})
