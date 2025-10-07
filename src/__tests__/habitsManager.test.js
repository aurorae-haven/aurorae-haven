// Test suite for Habits Manager
// TODO: Expand tests as features are implemented

import 'fake-indexeddb/auto'
import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  completeHabit,
  pauseHabit,
  getHabitStats
} from '../utils/habitsManager'
import { clear, STORES } from '../utils/indexedDBManager'

describe('Habits Manager', () => {
  beforeEach(async () => {
    await clear(STORES.HABITS)
  })

  describe('createHabit', () => {
    test('should create a new habit', async () => {
      const habit = {
        name: 'Morning Exercise',
        description: 'Do 20 push-ups',
        frequency: 'daily'
      }

      const id = await createHabit(habit)
      expect(id).toBeDefined()

      const habits = await getHabits()
      expect(habits).toHaveLength(1)
      expect(habits[0].name).toBe('Morning Exercise')
      expect(habits[0].streak).toBe(0)
      expect(habits[0].paused).toBe(false)
    })

    // TODO: Add test for habit with custom fields
    test.todo('should create habit with custom fields')

    // TODO: Add test for habit validation
    test.todo('should validate habit data before creation')
  })

  describe('getHabits', () => {
    test('should return empty array when no habits exist', async () => {
      const habits = await getHabits()
      expect(habits).toEqual([])
    })

    test('should return all habits', async () => {
      await createHabit({ name: 'Habit 1' })
      // Add small delay to ensure different IDs
      await new Promise(resolve => setTimeout(resolve, 10))
      await createHabit({ name: 'Habit 2' })

      const habits = await getHabits()
      expect(habits).toHaveLength(2)
    })

    // TODO: Add test for sorting habits
    test.todo('should sort habits by streak')

    // TODO: Add test for filtering habits
    test.todo('should filter paused habits')
  })

  describe('updateHabit', () => {
    test('should update existing habit', async () => {
      const id = await createHabit({ name: 'Old Name' })
      const habits = await getHabits()
      const habit = habits.find(h => h.id === id)

      const updatedHabit = { ...habit, name: 'New Name' }
      await updateHabit(updatedHabit)

      const updatedHabits = await getHabits()
      const found = updatedHabits.find(h => h.id === id)
      expect(found.name).toBe('New Name')
    })

    // TODO: Add test for partial updates
    test.todo('should handle partial updates')

    // TODO: Add test for concurrent updates
    test.todo('should handle concurrent updates')
  })

  describe('deleteHabit', () => {
    test('should delete habit by ID', async () => {
      const id = await createHabit({ name: 'To Delete' })
      await deleteHabit(id)

      const habits = await getHabits()
      expect(habits).toHaveLength(0)
    })

    // TODO: Add test for cascade delete
    test.todo('should cascade delete related data')
  })

  describe('completeHabit', () => {
    test('should mark habit as completed and increment streak', async () => {
      const id = await createHabit({ name: 'Daily Habit' })
      const result = await completeHabit(id)

      expect(result.streak).toBe(1)
      expect(result.lastCompleted).toBeDefined()
    })

    test('should not increment streak if already completed today', async () => {
      const id = await createHabit({ name: 'Daily Habit' })
      await completeHabit(id)
      const result = await completeHabit(id)

      expect(result.streak).toBe(1)
    })

    // TODO: Add test for streak break detection
    test.todo('should detect streak breaks')

    // TODO: Add test for longest streak tracking
    test.todo('should track longest streak')

    // TODO: Add test for completion history
    test.todo('should maintain completion history')
  })

  describe('pauseHabit', () => {
    test('should pause habit', async () => {
      const id = await createHabit({ name: 'Pausable Habit' })
      const result = await pauseHabit(id, true)

      expect(result.paused).toBe(true)
    })

    test('should unpause habit', async () => {
      const id = await createHabit({ name: 'Pausable Habit' })
      await pauseHabit(id, true)
      const result = await pauseHabit(id, false)

      expect(result.paused).toBe(false)
    })

    // TODO: Add test for pause preserving streak
    test.todo('should preserve streak when paused')
  })

  describe('getHabitStats', () => {
    test('should return habit statistics', async () => {
      const id = await createHabit({ name: 'Tracked Habit' })
      const stats = await getHabitStats(id)

      expect(stats).toHaveProperty('id')
      expect(stats).toHaveProperty('name')
      expect(stats).toHaveProperty('streak')
      expect(stats).toHaveProperty('lastCompleted')
    })

    // TODO: Add test for comprehensive stats
    test.todo('should include completion rate in stats')

    // TODO: Add test for streak history
    test.todo('should include longest streak in stats')

    // TODO: Add test for weekly/monthly completion
    test.todo('should calculate weekly completion rate')
  })
})
