// Test suite for Sequences Manager
// TODO: Expand tests as timer and execution features are implemented

import 'fake-indexeddb/auto'
import {
  createSequence,
  getSequences,
  getSequence,
  updateSequence,
  deleteSequence,
  addStep,
  removeStep,
  reorderStep,
  cloneSequence,
  startSequence
} from '../utils/sequencesManager'
import { clear, STORES } from '../utils/indexedDBManager'

describe('Sequences Manager', () => {
  beforeEach(async () => {
    await clear(STORES.SEQUENCES)
  })

  describe('createSequence', () => {
    test('should create a new sequence', async () => {
      const sequence = {
        name: 'Morning Routine',
        steps: [
          { name: 'Wake up', duration: 60 },
          { name: 'Stretch', duration: 300 }
        ]
      }

      const id = await createSequence(sequence)
      expect(id).toBeDefined()
      expect(id).toContain('seq_')

      const sequences = await getSequences()
      expect(sequences).toHaveLength(1)
      expect(sequences[0].name).toBe('Morning Routine')
      expect(sequences[0].totalDuration).toBe(360)
    })

    // TODO: Add test for empty sequence
    test.todo('should create sequence with no steps')

    // TODO: Add test for sequence validation
    test.todo('should validate sequence data')
  })

  describe('getSequences', () => {
    test('should return empty array when no sequences exist', async () => {
      const sequences = await getSequences()
      expect(sequences).toEqual([])
    })

    test('should return all sequences', async () => {
      await createSequence({ name: 'Sequence 1', steps: [] })
      await new Promise(resolve => setTimeout(resolve, 10))
      await createSequence({ name: 'Sequence 2', steps: [] })

      const sequences = await getSequences()
      expect(sequences).toHaveLength(2)
    })

    // TODO: Add test for sorting sequences
    test.todo('should sort sequences by name')

    // TODO: Add test for filtering sequences
    test.todo('should filter sequences by recently used')
  })

  describe('getSequence', () => {
    test('should get sequence by ID', async () => {
      const id = await createSequence({ name: 'Test Sequence', steps: [] })
      const sequence = await getSequence(id)

      expect(sequence).toBeDefined()
      expect(sequence.id).toBe(id)
      expect(sequence.name).toBe('Test Sequence')
    })

    // TODO: Add test for missing sequence
    test.todo('should handle missing sequence gracefully')
  })

  describe('updateSequence', () => {
    test('should update existing sequence', async () => {
      const id = await createSequence({ name: 'Old Name', steps: [] })
      const sequence = await getSequence(id)

      sequence.name = 'New Name'
      await updateSequence(sequence)

      const updated = await getSequence(id)
      expect(updated.name).toBe('New Name')
    })

    // TODO: Add test for updating steps
    test.todo('should recalculate duration when steps change')
  })

  describe('deleteSequence', () => {
    test('should delete sequence by ID', async () => {
      const id = await createSequence({ name: 'To Delete', steps: [] })
      await deleteSequence(id)

      const sequences = await getSequences()
      expect(sequences).toHaveLength(0)
    })

    // TODO: Add test for cascade delete from schedule
    test.todo('should remove sequence from schedule on delete')
  })

  describe('addStep', () => {
    test('should add step to sequence', async () => {
      const id = await createSequence({ name: 'Test', steps: [] })
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
    test('should remove step from sequence', async () => {
      const id = await createSequence({
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
    test('should reorder steps in sequence', async () => {
      const id = await createSequence({
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

  describe('cloneSequence', () => {
    test('should clone sequence with new ID', async () => {
      const id = await createSequence({
        name: 'Original',
        steps: [{ name: 'Step 1', duration: 60 }]
      })

      await new Promise(resolve => setTimeout(resolve, 10))
      const newId = await cloneSequence(id, 'Cloned')
      expect(newId).not.toBe(id)

      const cloned = await getSequence(newId)
      expect(cloned.name).toBe('Cloned')
      expect(cloned.steps).toHaveLength(1)
    })

    // TODO: Add test for default clone name
    test.todo('should use default name if not provided')
  })

  describe('startSequence', () => {
    test('should initialize sequence execution state', async () => {
      const id = await createSequence({
        name: 'Test',
        steps: [{ name: 'Step 1', duration: 60 }]
      })

      const state = await startSequence(id)
      expect(state.sequenceId).toBe(id)
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

    // TODO: Add tests for sequence completion
    test.todo('should handle sequence completion')
  })
})
