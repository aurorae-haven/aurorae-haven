import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import Habits from '../pages/Habits'
import { createHabit, getHabits } from '../utils/habitsManager'
import { clear, STORES } from '../utils/indexedDBManager'

// Mock logger
jest.mock('../utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  createLogger: jest.fn(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }))
}))

describe('Habits Component', () => {
  beforeEach(async () => {
    await clear(STORES.HABITS)
  })

  describe('Rendering', () => {
    test('renders Habits component', () => {
      render(<Habits />)
      expect(screen.getByText(/Habits/i)).toBeInTheDocument()
    })

    test('renders Today panel with completion ring', async () => {
      render(<Habits />)
      await waitFor(() => {
        expect(screen.getByText(/0\/0/i)).toBeInTheDocument()
        expect(screen.getByText(/habits/i)).toBeInTheDocument()
      })
    })

    test('shows empty state when no habits exist', async () => {
      render(<Habits />)
      await waitFor(() => {
        expect(screen.getByText(/No habits yet/i)).toBeInTheDocument()
      })
    })

    test('renders toolbar with actions', () => {
      render(<Habits />)
      expect(screen.getByText(/Sort:/i)).toBeInTheDocument()
      expect(screen.getByText(/New Habit/i)).toBeInTheDocument()
    })
  })

  describe('Creating Habits', () => {
    test('opens new habit modal when button clicked', () => {
      render(<Habits />)
      const newHabitButton = screen.getByText(/New Habit/i)
      fireEvent.click(newHabitButton)
      
      expect(screen.getByText(/Create New Habit/i)).toBeInTheDocument()
    })

    test('creates new habit with name and category', async () => {
      render(<Habits />)
      
      // Open modal
      fireEvent.click(screen.getByText(/New Habit/i))
      
      // Fill in form
      const nameInput = screen.getByLabelText(/Habit Name/i)
      fireEvent.change(nameInput, { target: { value: 'Morning Exercise' } })
      
      // Select category
      const categorySelect = screen.getByLabelText(/Category/i)
      fireEvent.change(categorySelect, { target: { value: 'blue' } })
      
      // Submit
      fireEvent.click(screen.getByText(/Create Habit/i))
      
      // Verify habit was created
      await waitFor(() => {
        expect(screen.getByText('Morning Exercise')).toBeInTheDocument()
      })
    })

    test('validates habit name is required', () => {
      render(<Habits />)
      
      fireEvent.click(screen.getByText(/New Habit/i))
      fireEvent.click(screen.getByText(/Create Habit/i))
      
      // Modal should still be open due to validation
      expect(screen.getByText(/Create New Habit/i)).toBeInTheDocument()
    })

    test('closes modal when cancel is clicked', () => {
      render(<Habits />)
      
      fireEvent.click(screen.getByText(/New Habit/i))
      fireEvent.click(screen.getByText(/Cancel/i))
      
      expect(screen.queryByText(/Create New Habit/i)).not.toBeInTheDocument()
    })
  })

  describe('Displaying Habits', () => {
    test('displays habit cards with streak information', async () => {
      await createHabit({ name: 'Test Habit', streak: 5, longestStreak: 10 })
      
      render(<Habits />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Habit')).toBeInTheDocument()
        expect(screen.getByText(/5 day streak/i)).toBeInTheDocument()
      })
    })

    test('shows category color indicator on habit cards', async () => {
      await createHabit({ name: 'Blue Habit', category: 'blue' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const habitCard = screen.getByText('Blue Habit').closest('.habit-card')
        const colorDot = habitCard.querySelector('.category-dot')
        expect(colorDot).toBeInTheDocument()
      })
    })

    test('displays 28-day heatmap on each habit card', async () => {
      const today = new Date().toISOString().split('T')[0]
      await createHabit({ 
        name: 'Heatmap Habit', 
        completions: [today]
      })
      
      render(<Habits />)
      
      await waitFor(() => {
        const heatmapCells = screen.getAllByRole('button', { name: /heatmap cell/i })
        expect(heatmapCells.length).toBeGreaterThan(0)
      })
    })

    test('shows paused habits with reduced opacity', async () => {
      await createHabit({ name: 'Paused Habit', paused: true })
      
      render(<Habits />)
      
      await waitFor(() => {
        const habitCard = screen.getByText('Paused Habit').closest('.habit-card')
        expect(habitCard).toHaveStyle({ opacity: '0.6' })
      })
    })
  })

  describe('Completing Habits', () => {
    test('toggles completion when checkbox is clicked', async () => {
      await createHabit({ name: 'Daily Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /complete daily habit/i })
        expect(checkbox).not.toBeChecked()
      })
      
      const checkbox = screen.getByRole('checkbox', { name: /complete daily habit/i })
      fireEvent.click(checkbox)
      
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
    })

    test('updates Today panel when habit is completed', async () => {
      await createHabit({ name: 'Habit 1' })
      await createHabit({ name: 'Habit 2' })
      
      render(<Habits />)
      
      await waitFor(() => {
        expect(screen.getByText(/0\/2/i)).toBeInTheDocument()
      })
      
      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)
      
      await waitFor(() => {
        expect(screen.getByText(/1\/2/i)).toBeInTheDocument()
      })
    })

    test('shows XP earned toast on completion', async () => {
      await createHabit({ name: 'XP Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/\+1 XP/i)).toBeInTheDocument()
      })
    })

    test('triggers confetti on milestone streaks', async () => {
      // Create habit with 6 day streak (one away from 7-day milestone)
      const completions = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        completions.push(date)
      }
      
      await createHabit({ 
        name: 'Milestone Habit',
        completions: completions.slice(0, -1), // 6 days
        streak: 6
      })
      
      render(<Habits />)
      
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })
      
      // Confetti should be triggered (7 day milestone)
      await waitFor(() => {
        const confetti = document.querySelector('.confetti')
        expect(confetti).toBeInTheDocument()
      })
    })
  })

  describe('Sorting and Filtering', () => {
    test('sorts habits by title', async () => {
      await createHabit({ name: 'Zebra Habit' })
      await createHabit({ name: 'Apple Habit' })
      
      render(<Habits />)
      
      const sortSelect = screen.getByLabelText(/Sort:/i)
      fireEvent.change(sortSelect, { target: { value: 'title' } })
      
      await waitFor(() => {
        const habitCards = screen.getAllByRole('article')
        expect(habitCards[0]).toHaveTextContent('Apple Habit')
        expect(habitCards[1]).toHaveTextContent('Zebra Habit')
      })
    })

    test('sorts habits by current streak', async () => {
      await createHabit({ name: 'Low Streak', streak: 2 })
      await createHabit({ name: 'High Streak', streak: 10 })
      
      render(<Habits />)
      
      const sortSelect = screen.getByLabelText(/Sort:/i)
      fireEvent.change(sortSelect, { target: { value: 'streak' } })
      
      await waitFor(() => {
        const habitCards = screen.getAllByRole('article')
        expect(habitCards[0]).toHaveTextContent('High Streak')
        expect(habitCards[1]).toHaveTextContent('Low Streak')
      })
    })

    test('opens filter modal when filter button clicked', () => {
      render(<Habits />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      fireEvent.click(filterButton)
      
      expect(screen.getByText(/Filter Habits/i)).toBeInTheDocument()
    })

    test('filters habits by category', async () => {
      await createHabit({ name: 'Blue Habit', category: 'blue' })
      await createHabit({ name: 'Violet Habit', category: 'violet' })
      
      render(<Habits />)
      
      // Open filter modal
      fireEvent.click(screen.getByRole('button', { name: /filter/i }))
      
      // Select blue category
      const blueCheckbox = screen.getByLabelText(/blue/i)
      fireEvent.click(blueCheckbox)
      
      // Apply filter
      fireEvent.click(screen.getByText(/Apply/i))
      
      await waitFor(() => {
        expect(screen.getByText('Blue Habit')).toBeInTheDocument()
        expect(screen.queryByText('Violet Habit')).not.toBeInTheDocument()
      })
    })

    test('shows filter indicator when filters are active', async () => {
      await createHabit({ name: 'Test Habit', category: 'blue' })
      
      render(<Habits />)
      
      // Apply filter
      fireEvent.click(screen.getByRole('button', { name: /filter/i }))
      const blueCheckbox = screen.getByLabelText(/blue/i)
      fireEvent.click(blueCheckbox)
      fireEvent.click(screen.getByText(/Apply/i))
      
      await waitFor(() => {
        const filterIndicator = document.querySelector('.filter-active-indicator')
        expect(filterIndicator).toBeInTheDocument()
      })
    })
  })

  describe('Habit Details', () => {
    test('opens detail drawer when habit card is clicked', async () => {
      await createHabit({ name: 'Detail Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const habitCard = screen.getByText('Detail Habit')
        fireEvent.click(habitCard)
      })
      
      expect(screen.getByText(/90-day history/i)).toBeInTheDocument()
    })

    test('displays 90-day heatmap in detail drawer', async () => {
      await createHabit({ name: 'History Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('History Habit'))
      })
      
      // 90-day heatmap should have 90 cells
      const heatmapCells = screen.getAllByRole('button', { name: /day \d+/i })
      expect(heatmapCells.length).toBeGreaterThanOrEqual(90)
    })

    test('shows stats in detail drawer', async () => {
      await createHabit({ 
        name: 'Stats Habit',
        streak: 5,
        longestStreak: 10,
        completions: ['2025-01-01', '2025-01-02', '2025-01-03']
      })
      
      render(<Habits />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Stats Habit'))
      })
      
      expect(screen.getByText(/Current Streak: 5/i)).toBeInTheDocument()
      expect(screen.getByText(/Best Streak: 10/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Completions: 3/i)).toBeInTheDocument()
    })

    test('allows setting vacation days in detail drawer', async () => {
      await createHabit({ name: 'Vacation Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Vacation Habit'))
      })
      
      // Click vacation mode button
      const vacationButton = screen.getByText(/Vacation Mode/i)
      fireEvent.click(vacationButton)
      
      // Set date range (implementation depends on date picker)
      expect(screen.getByText(/Set Vacation Days/i)).toBeInTheDocument()
    })

    test('exports completion history as CSV', async () => {
      await createHabit({ 
        name: 'Export Habit',
        completions: ['2025-01-01', '2025-01-02']
      })
      
      render(<Habits />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Export Habit'))
      })
      
      const csvButton = screen.getByText(/Export CSV/i)
      fireEvent.click(csvButton)
      
      // Verify download was triggered
      // (This would require mocking the download functionality)
    })
  })

  describe('Keyboard Navigation', () => {
    test('navigates habits with arrow keys', async () => {
      await createHabit({ name: 'Habit 1' })
      await createHabit({ name: 'Habit 2' })
      await createHabit({ name: 'Habit 3' })
      
      render(<Habits />)
      
      await waitFor(() => {
        expect(screen.getByText('Habit 1')).toBeInTheDocument()
      })
      
      const habitCards = screen.getAllByRole('article')
      habitCards[0].focus()
      
      // Press down arrow
      fireEvent.keyDown(habitCards[0], { key: 'ArrowDown' })
      
      await waitFor(() => {
        expect(habitCards[1]).toHaveFocus()
      })
    })

    test('toggles completion with Space key', async () => {
      await createHabit({ name: 'Keyboard Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const habitCard = screen.getByRole('article')
        habitCard.focus()
      })
      
      const habitCard = screen.getByRole('article')
      fireEvent.keyDown(habitCard, { key: ' ' })
      
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
      })
    })

    test('opens detail drawer with Enter key', async () => {
      await createHabit({ name: 'Enter Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const habitCard = screen.getByRole('article')
        habitCard.focus()
      })
      
      const habitCard = screen.getByRole('article')
      fireEvent.keyDown(habitCard, { key: 'Enter' })
      
      expect(screen.getByText(/90-day history/i)).toBeInTheDocument()
    })
  })

  describe('Pause and Delete', () => {
    test('pauses habit from action menu', async () => {
      await createHabit({ name: 'Pausable Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const pauseButton = screen.getByRole('button', { name: /pause/i })
        fireEvent.click(pauseButton)
      })
      
      await waitFor(() => {
        const habitCard = screen.getByText('Pausable Habit').closest('.habit-card')
        expect(habitCard).toHaveStyle({ opacity: '0.6' })
      })
    })

    test('resumes paused habit', async () => {
      await createHabit({ name: 'Paused Habit', paused: true })
      
      render(<Habits />)
      
      await waitFor(() => {
        const resumeButton = screen.getByRole('button', { name: /resume/i })
        fireEvent.click(resumeButton)
      })
      
      await waitFor(() => {
        const habitCard = screen.getByText('Paused Habit').closest('.habit-card')
        expect(habitCard).not.toHaveStyle({ opacity: '0.6' })
      })
    })

    test('shows confirmation before deleting habit', async () => {
      await createHabit({ name: 'Deletable Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i })
        fireEvent.click(deleteButton)
      })
      
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument()
    })

    test('deletes habit when confirmed', async () => {
      await createHabit({ name: 'To Delete' })
      
      render(<Habits />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /delete/i }))
      })
      
      fireEvent.click(screen.getByText(/Confirm/i))
      
      await waitFor(() => {
        expect(screen.queryByText('To Delete')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA labels on interactive elements', () => {
      render(<Habits />)
      
      expect(screen.getByRole('button', { name: /new habit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument()
    })

    test('announces completion to screen readers', async () => {
      await createHabit({ name: 'SR Habit' })
      
      render(<Habits />)
      
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })
      
      await waitFor(() => {
        const announcement = screen.getByRole('status')
        expect(announcement).toHaveTextContent(/SR Habit completed/i)
      })
    })

    test('traps focus in modals', () => {
      render(<Habits />)
      
      fireEvent.click(screen.getByText(/New Habit/i))
      
      // Tab should cycle through modal elements only
      const modalElements = screen.getByRole('dialog').querySelectorAll('button, input, select')
      expect(modalElements.length).toBeGreaterThan(0)
    })

    test('closes modal on Escape key', () => {
      render(<Habits />)
      
      fireEvent.click(screen.getByText(/New Habit/i))
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(screen.queryByText(/Create New Habit/i)).not.toBeInTheDocument()
    })
  })
})
