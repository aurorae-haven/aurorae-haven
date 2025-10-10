import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tasks from '../pages/Tasks'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Tasks Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('renders Tasks component', () => {
    render(<Tasks />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  test('renders all four quadrants', () => {
    render(<Tasks />)
    const quadrantHeaders = screen.getAllByText('Urgent & Important')
    expect(quadrantHeaders.length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Not Urgent & Important').length
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Urgent & Not Important').length
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Not Urgent & Not Important').length
    ).toBeGreaterThan(0)
  })

  test('displays quadrant subtitles', () => {
    render(<Tasks />)
    expect(screen.getByText('Do First')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Delegate')).toBeInTheDocument()
    expect(screen.getByText('Eliminate')).toBeInTheDocument()
  })

  test('adds a new task to selected quadrant', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Test task' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Test task')).toBeInTheDocument()
    })
  })

  test('does not add empty task', () => {
    render(<Tasks />)

    const addButton = screen.getByText('Add Task')
    const initialEmptyStates = screen.getAllByText('No tasks in this quadrant')

    fireEvent.click(addButton)

    const finalEmptyStates = screen.getAllByText('No tasks in this quadrant')
    expect(finalEmptyStates.length).toBe(initialEmptyStates.length)
  })

  test('can change quadrant selection', () => {
    render(<Tasks />)

    const select = screen.getByLabelText('Select quadrant')
    fireEvent.change(select, { target: { value: 'not_urgent_important' } })

    expect(select.value).toBe('not_urgent_important')
  })

  test('toggles task completion', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Complete me' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const checkbox = screen.getByLabelText('Mark "Complete me" as complete')
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  test('deletes a task', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Delete me' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Delete me')).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText('Delete task "Delete me"')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
    })
  })

  test('persists tasks to localStorage', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Persistent task' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const savedData = localStorage.getItem('aurorae_tasks')
      expect(savedData).toBeTruthy()

      const parsed = JSON.parse(savedData)
      expect(parsed.urgent_important).toHaveLength(1)
      expect(parsed.urgent_important[0].text).toBe('Persistent task')
    })
  })

  test('loads tasks from localStorage on mount', () => {
    const mockTasks = {
      urgent_important: [
        {
          id: 'test-uuid-1',
          text: 'Loaded task',
          completed: false,
          createdAt: Date.now()
        }
      ],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    }

    localStorage.setItem('aurorae_tasks', JSON.stringify(mockTasks))

    render(<Tasks />)

    expect(screen.getByText('Loaded task')).toBeInTheDocument()
  })

  test('displays empty state for quadrants with no tasks', () => {
    render(<Tasks />)

    const emptyStates = screen.getAllByText('No tasks in this quadrant')
    expect(emptyStates.length).toBe(4) // All quadrants empty initially
  })

  test('has export button', () => {
    render(<Tasks />)

    const exportButton = screen.getByLabelText('Export tasks')
    expect(exportButton).toBeInTheDocument()
  })

  test('has import button', () => {
    render(<Tasks />)

    const importButton = screen.getByLabelText('Import tasks')
    expect(importButton).toBeInTheDocument()
  })

  test('exports tasks as JSON', async () => {
    // Mock URL.createObjectURL
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = jest.fn()
    const originalCreateObjectURL = global.URL.createObjectURL
    const originalRevokeObjectURL = global.URL.revokeObjectURL

    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    render(<Tasks />)

    const exportButton = screen.getByLabelText('Export tasks')
    fireEvent.click(exportButton)

    expect(mockCreateObjectURL).toHaveBeenCalled()

    // Wait for the async revoke call (setTimeout with 1000ms)
    await waitFor(
      () => {
        expect(mockRevokeObjectURL).toHaveBeenCalled()
      },
      { timeout: 1500 }
    )

    // Restore originals
    global.URL.createObjectURL = originalCreateObjectURL
    global.URL.revokeObjectURL = originalRevokeObjectURL
  })

  test('displays tip information', () => {
    const { container } = render(<Tasks />)

    const infoText = container.textContent
    expect(infoText).toMatch(/Drag tasks between quadrants/i)
    expect(infoText).toMatch(/Eisenhower Matrix/i)
  })

  test('adds task with Enter key', async () => {
    const { container } = render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const form = container.querySelector('form')

    fireEvent.change(input, { target: { value: 'Enter key task' } })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Enter key task')).toBeInTheDocument()
    })
  })

  test('clears input after adding task', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Clear input test' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  test('handles invalid localStorage data gracefully', () => {
    localStorage.setItem('aurorae_tasks', 'invalid json')

    // Should render without crashing
    const { container } = render(<Tasks />)
    expect(container).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  test('imports tasks from JSON file', async () => {
    const { container } = render(<Tasks />)

    const mockTasks = {
      urgent_important: [
        {
          id: 'imported-uuid-1',
          text: 'Imported task',
          completed: false,
          createdAt: Date.now()
        }
      ],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    }

    const file = new File([JSON.stringify(mockTasks)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')

    // Simulate file selection
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(screen.getByText('Imported task')).toBeInTheDocument()
    })
  })

  test('task items have draggable attribute', async () => {
    const { container } = render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Draggable task' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const taskItem = container.querySelector('.task-item')
      expect(taskItem).toHaveAttribute('draggable')
    })
  })

  // Tests for inline editing functionality
  test('can enter edit mode by clicking edit button', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Editable task' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Editable task"')
      fireEvent.click(editButton)

      // Should show edit input
      const editInput = screen.getByDisplayValue('Editable task')
      expect(editInput).toBeInTheDocument()
    })
  })

  test('can save edited task', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Original text' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Original text"')
      fireEvent.click(editButton)
    })

    const editInput = screen.getByDisplayValue('Original text')
    fireEvent.change(editInput, { target: { value: 'Updated text' } })

    const saveButton = screen.getByLabelText('Save task')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Updated text')).toBeInTheDocument()
      expect(screen.queryByText('Original text')).not.toBeInTheDocument()
    })
  })

  test('can cancel editing', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Unchanged task' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Unchanged task"')
      fireEvent.click(editButton)
    })

    const editInput = screen.getByDisplayValue('Unchanged task')
    fireEvent.change(editInput, { target: { value: 'Modified text' } })

    const cancelButton = screen.getByLabelText('Cancel editing')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.getByText('Unchanged task')).toBeInTheDocument()
      expect(screen.queryByText('Modified text')).not.toBeInTheDocument()
    })
  })

  test('can save edit with Enter key', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Keyboard edit' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Keyboard edit"')
      fireEvent.click(editButton)
    })

    const editInput = screen.getByDisplayValue('Keyboard edit')
    fireEvent.change(editInput, { target: { value: 'Updated via Enter' } })
    fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('Updated via Enter')).toBeInTheDocument()
    })
  })

  test('can cancel edit with Escape key', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Escape test' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Escape test"')
      fireEvent.click(editButton)
    })

    const editInput = screen.getByDisplayValue('Escape test')
    fireEvent.change(editInput, { target: { value: 'Should not save' } })
    fireEvent.keyDown(editInput, { key: 'Escape', code: 'Escape' })

    await waitFor(() => {
      expect(screen.getByText('Escape test')).toBeInTheDocument()
      expect(screen.queryByText('Should not save')).not.toBeInTheDocument()
    })
  })

  test('checkbox disabled during edit mode', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Checkbox test' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Checkbox test"')
      fireEvent.click(editButton)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })
  })

  test('drag functionality disabled during edit mode', async () => {
    const { container } = render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Drag test' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Drag test"')
      fireEvent.click(editButton)

      const taskItem = container.querySelector('.task-item')
      expect(taskItem).toHaveAttribute('draggable', 'false')
    })
  })

  // Tests for import validation
  test('rejects import with duplicate task IDs', async () => {
    const { container } = render(<Tasks />)

    const duplicateTasks = {
      urgent_important: [
        {
          id: 'dup-id',
          text: 'Task 1',
          completed: false,
          createdAt: Date.now()
        }
      ],
      not_urgent_important: [
        {
          id: 'dup-id',
          text: 'Task 2',
          completed: false,
          createdAt: Date.now()
        } // Duplicate ID
      ],
      urgent_not_important: [],
      not_urgent_not_important: []
    }

    const file = new File([JSON.stringify(duplicateTasks)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(screen.getByText(/Duplicate task IDs found/i)).toBeInTheDocument()
    })
  })

  test('rejects import with task text exceeding max length', async () => {
    const { container } = render(<Tasks />)

    const longTextTask = {
      urgent_important: [
        {
          id: 'long-text-id',
          text: 'x'.repeat(1001), // Exceeds 1000 char limit
          completed: false,
          createdAt: Date.now()
        }
      ],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    }

    const file = new File([JSON.stringify(longTextTask)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(screen.getByText(/exceeds maximum length/i)).toBeInTheDocument()
    })
  })

  test('rejects import with invalid task structure', async () => {
    const { container } = render(<Tasks />)

    const invalidTasks = {
      urgent_important: [
        { id: { invalid: 'object' }, text: 123, completed: 'yes' } // Invalid types
      ],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    }

    const file = new File([JSON.stringify(invalidTasks)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(screen.getByText(/incorrect structure/i)).toBeInTheDocument()
    })
  })

  test('accepts import with numeric IDs (backward compatibility)', async () => {
    const { container } = render(<Tasks />)

    const legacyTasks = {
      urgent_important: [
        {
          id: 1,
          text: 'Legacy task',
          completed: false,
          createdAt: Date.now()
        }
      ],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    }

    const file = new File([JSON.stringify(legacyTasks)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(screen.getByText('Legacy task')).toBeInTheDocument()
    })
  })

  test('rejects import with missing quadrants', async () => {
    const { container } = render(<Tasks />)

    const incompleteTasks = {
      urgent_important: [],
      not_urgent_important: []
      // Missing other quadrants
    }

    const file = new File([JSON.stringify(incompleteTasks)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(
        screen.getByText(/Missing required quadrants/i)
      ).toBeInTheDocument()
    })
  })

  // Tests for error notification system
  test('displays error notification with ARIA live region', async () => {
    const { container } = render(<Tasks />)

    const invalidTasks = { invalid: 'data' }
    const file = new File([JSON.stringify(invalidTasks)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      const errorNotification = container.querySelector('.error-notification')
      expect(errorNotification).toBeInTheDocument()
      expect(errorNotification).toHaveAttribute('role', 'alert')
      expect(errorNotification).toHaveAttribute('aria-live', 'assertive')
      expect(errorNotification).toHaveAttribute('aria-atomic', 'true')
    })
  })

  test('error notification auto-dismisses after 5 seconds', async () => {
    jest.useFakeTimers()
    const { container } = render(<Tasks />)

    const invalidTasks = { invalid: 'data' }
    const file = new File([JSON.stringify(invalidTasks)], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    // Fast-forward time by 5 seconds
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  // Tests for export filename format
  test('exports with feature-prefixed filename format', async () => {
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = jest.fn()
    const originalCreateObjectURL = global.URL.createObjectURL
    const originalRevokeObjectURL = global.URL.revokeObjectURL

    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    // Mock document.createElement to capture download filename
    let capturedFilename = ''
    const originalCreateElement = document.createElement
    document.createElement = jest.fn((tagName) => {
      const element = originalCreateElement.call(document, tagName)
      if (tagName === 'a') {
        Object.defineProperty(element, 'download', {
          set: (value) => {
            capturedFilename = value
          },
          get: () => capturedFilename
        })
      }
      return element
    })

    render(<Tasks />)
    const exportButton = screen.getByLabelText('Export tasks')
    fireEvent.click(exportButton)

    // Accept both hex UUID format (from crypto.randomUUID/getRandomValues) and base-36 fallback
    expect(capturedFilename).toMatch(
      /^tasks_\d{4}-\d{2}-\d{2}_[a-f0-9-]+\.json$|^tasks_\d{4}-\d{2}-\d{2}_[a-z0-9]+\.json$/
    )

    // Restore
    global.URL.createObjectURL = originalCreateObjectURL
    global.URL.revokeObjectURL = originalRevokeObjectURL
    document.createElement = originalCreateElement
  })

  // Tests for double-click to edit
  test('can enter edit mode by double-clicking task text', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Double click me' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const taskText = screen.getByText('Double click me')
      fireEvent.doubleClick(taskText)

      // Should show edit input
      const editInput = screen.getByDisplayValue('Double click me')
      expect(editInput).toBeInTheDocument()
    })
  })

  // Test for focus management
  test('edit input receives focus when edit mode starts', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Focus test' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Focus test"')
      fireEvent.click(editButton)
    })

    await waitFor(() => {
      const editInput = screen.getByDisplayValue('Focus test')
      expect(editInput).toHaveFocus()
    })
  })

  // Test for empty edit cancellation
  test('cancels edit if text is empty when saving', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Delete all text' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit task "Delete all text"')
      fireEvent.click(editButton)
    })

    const editInput = screen.getByDisplayValue('Delete all text')
    fireEvent.change(editInput, { target: { value: '   ' } }) // Whitespace only

    const saveButton = screen.getByLabelText('Save task')
    fireEvent.click(saveButton)

    await waitFor(() => {
      // Original text should remain since whitespace-only text was rejected
      expect(screen.getByText('Delete all text')).toBeInTheDocument()
      // Edit mode should be cancelled
      expect(screen.queryByLabelText('Save task')).not.toBeInTheDocument()
    })
  })

  test('exports and re-imports tasks with string UUIDs', async () => {
    const { container } = render(<Tasks />)

    // Add a task (which will have a UUID string ID)
    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(input, { target: { value: 'Round-trip test' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Round-trip test')).toBeInTheDocument()
    })

    // Get the exported data from localStorage
    const exportedData = localStorage.getItem('aurorae_tasks')
    const parsedData = JSON.parse(exportedData)

    // Verify the ID is a string (UUID)
    expect(parsedData.urgent_important.length).toBe(1)
    expect(typeof parsedData.urgent_important[0].id).toBe('string')
    expect(parsedData.urgent_important[0].text).toBe('Round-trip test')

    // Clear and re-import
    localStorage.clear()
    const file = new File([exportedData], 'tasks.json', {
      type: 'application/json'
    })

    const importInput = container.querySelector('input[type="file"]')
    Object.defineProperty(importInput, 'files', {
      value: [file],
      writable: false
    })

    fireEvent.change(importInput)

    await waitFor(() => {
      expect(screen.getByText('Round-trip test')).toBeInTheDocument()
    })
  })
})
