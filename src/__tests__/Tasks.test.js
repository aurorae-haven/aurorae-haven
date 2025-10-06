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
    expect(screen.getAllByText('Not Urgent & Important').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Urgent & Not Important').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Not Urgent & Not Important').length).toBeGreaterThan(0)
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
    const addButton = screen.getByText('Add')

    fireEvent.change(input, { target: { value: 'Test task' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Test task')).toBeInTheDocument()
    })
  })

  test('does not add empty task', () => {
    render(<Tasks />)

    const addButton = screen.getByText('Add')
    const initialEmptyStates = screen.getAllByText('No tasks yet')

    fireEvent.click(addButton)

    const finalEmptyStates = screen.getAllByText('No tasks yet')
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
    const addButton = screen.getByText('Add')

    fireEvent.change(input, { target: { value: 'Complete me' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const checkbox = screen.getByLabelText(
        'Mark "Complete me" as complete'
      )
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  test('deletes a task', async () => {
    render(<Tasks />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByText('Add')

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
    const addButton = screen.getByText('Add')

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
          id: 1,
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

    const emptyStates = screen.getAllByText('No tasks yet')
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
    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    }, { timeout: 1500 })
    
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
    const addButton = screen.getByText('Add')

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
        { id: 1, text: 'Imported task', completed: false, createdAt: Date.now() }
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
    const addButton = screen.getByText('Add')

    fireEvent.change(input, { target: { value: 'Draggable task' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      const taskItem = container.querySelector('.task-item')
      expect(taskItem).toHaveAttribute('draggable')
    })
  })
})
