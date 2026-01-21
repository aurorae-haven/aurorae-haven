import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SearchableEventSelector from '../components/Schedule/SearchableEventSelector'
import * as scheduleHelpers from '../utils/scheduleHelpers'

// Mock the schedule helpers
jest.mock('../utils/scheduleHelpers', () => ({
  searchRoutinesAndTasks: jest.fn(),
  getAllRoutinesAndTasks: jest.fn()
}))

// Mock Icon component
jest.mock('../components/common/Icon', () => {
  return function Icon({ name }) {
    return <span data-testid={`icon-${name}`}>{name}</span>
  }
})

// Mock logger
jest.mock('../utils/logger', () => ({
  createLogger: () => ({
    error: jest.fn(),
    log: jest.fn(),
    info: jest.fn()
  })
}))

describe('SearchableEventSelector Component', () => {
  const mockOnSelect = jest.fn()
  const mockOnCreateNew = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    scheduleHelpers.getAllRoutinesAndTasks.mockResolvedValue([
      {
        id: '1',
        title: 'Morning Routine',
        type: 'routine',
        isImportant: false,
        priority: 0
      },
      {
        id: '2',
        title: 'Urgent Task',
        type: 'task',
        isImportant: true,
        priority: 1,
        quadrantLabel: 'Urgent & Important'
      }
    ])
    scheduleHelpers.searchRoutinesAndTasks.mockResolvedValue([])
  })

  describe('Rendering', () => {
    it('should render search input for routine event type', () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )
      expect(
        screen.getByPlaceholderText('Search for an existing routine...')
      ).toBeInTheDocument()
    })

    it('should render search input for task event type', () => {
      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )
      expect(
        screen.getByPlaceholderText('Search for an existing task...')
      ).toBeInTheDocument()
    })

    it('should not render for meeting event type', () => {
      const { container } = render(
        <SearchableEventSelector
          eventType='meeting'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should not render for habit event type', () => {
      const { container } = render(
        <SearchableEventSelector
          eventType='habit'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Initial Data Loading', () => {
    it('should load all items on mount', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      await waitFor(() => {
        expect(scheduleHelpers.getAllRoutinesAndTasks).toHaveBeenCalledWith(
          'routine'
        )
      })
    })

    it('should handle loading errors gracefully', async () => {
      scheduleHelpers.getAllRoutinesAndTasks.mockRejectedValue(
        new Error('Load failed')
      )

      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      await waitFor(() => {
        expect(scheduleHelpers.getAllRoutinesAndTasks).toHaveBeenCalled()
      })
      // Should not crash and should show empty results
    })
  })

  describe('Dropdown Interaction', () => {
    it('should show dropdown when input is focused', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('should display loaded items in dropdown', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('Morning Routine')).toBeInTheDocument()
        expect(screen.getByText('Urgent Task')).toBeInTheDocument()
      })
    })

    it('should display Important badge for important tasks', async () => {
      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing task...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('Important')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('should perform search when text is entered', async () => {
      scheduleHelpers.searchRoutinesAndTasks.mockResolvedValue([
        {
          id: '1',
          title: 'Morning Routine',
          type: 'routine',
          isImportant: false
        }
      ])

      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'morning' } })

      await waitFor(
        () => {
          expect(scheduleHelpers.searchRoutinesAndTasks).toHaveBeenCalledWith(
            'morning',
            'routine'
          )
        },
        { timeout: 500 }
      )
    })

    it('should debounce search queries', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'm' } })
      fireEvent.change(input, { target: { value: 'mo' } })
      fireEvent.change(input, { target: { value: 'mor' } })

      // Should only call search once after debounce
      await waitFor(
        () => {
          expect(scheduleHelpers.searchRoutinesAndTasks).toHaveBeenCalledTimes(
            1
          )
        },
        { timeout: 500 }
      )
    })

    it('should handle search errors gracefully', async () => {
      scheduleHelpers.searchRoutinesAndTasks.mockRejectedValue(
        new Error('Search failed')
      )

      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing task...'
      )
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'test' } })

      await waitFor(
        () => {
          expect(scheduleHelpers.searchRoutinesAndTasks).toHaveBeenCalled()
        },
        { timeout: 500 }
      )
      // Should not crash
    })

    it('should show empty state when no results found', async () => {
      scheduleHelpers.searchRoutinesAndTasks.mockResolvedValue([])

      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing task...'
      )
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'nonexistent' } })

      await waitFor(
        () => {
          expect(screen.getByText(/No tasks found/i)).toBeInTheDocument()
        },
        { timeout: 500 }
      )
    })
  })

  describe('Item Selection', () => {
    it('should call onSelect when item is clicked', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('Morning Routine')).toBeInTheDocument()
      })

      const item = screen.getByText('Morning Routine')
      fireEvent.click(item)

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          title: 'Morning Routine',
          type: 'routine'
        })
      )
    })

    it('should close dropdown after selection', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      const item = screen.getByText('Morning Routine')
      fireEvent.click(item)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Create New Button', () => {
    it('should display create new button', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create new routine/i })
        ).toBeInTheDocument()
      })
    })

    it('should call onCreateNew when clicked', async () => {
      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing task...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', {
        name: /Create new task/i
      })
      fireEvent.click(createButton)

      expect(mockOnCreateNew).toHaveBeenCalled()
    })

    it('should close dropdown after create new is clicked', async () => {
      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing task...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', {
        name: /Create new task/i
      })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close dropdown when Escape is pressed', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByLabelText('Search for existing routine')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('aria-controls', 'search-results-dropdown')
    })

    it('should have proper roles for dropdown', async () => {
      render(
        <SearchableEventSelector
          eventType='task'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing task...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        const dropdown = screen.getByRole('listbox')
        expect(dropdown).toBeInTheDocument()
        expect(dropdown).toHaveAttribute('aria-label', 'Search results')
      })
    })

    it('should have option role for items', async () => {
      render(
        <SearchableEventSelector
          eventType='routine'
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreateNew}
        />
      )

      const input = screen.getByPlaceholderText(
        'Search for an existing routine...'
      )
      fireEvent.focus(input)

      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(0)
      })
    })
  })
})
