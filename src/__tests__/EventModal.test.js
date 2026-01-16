import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EventModal from '../components/Schedule/EventModal'

// Mock Icon component
jest.mock('../components/common/Icon', () => {
  return function Icon({ name }) {
    return <span data-testid={`icon-${name}`}>{name}</span>
  }
})

// Mock Modal component
jest.mock('../components/common/Modal', () => {
  return function Modal({ isOpen, children, title, onClose }) {
    if (!isOpen) return null
    return (
      <div data-testid='modal'>
        <h2>{title}</h2>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    )
  }
})

// Mock getCurrentDateISO to return consistent date for testing
jest.mock('../utils/timeUtils', () => ({
  getCurrentDateISO: jest.fn(() => '2025-09-16')
}))

describe('EventModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders modal when open', () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Add Task')).toBeInTheDocument()
  })

  test('does not render when closed', () => {
    render(
      <EventModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  test('shows correct title for routine type', () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='routine'
      />
    )
    expect(screen.getByText('Add Routine')).toBeInTheDocument()
  })

  test('shows correct title for meeting type', () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='meeting'
      />
    )
    expect(screen.getByText('Add Meeting')).toBeInTheDocument()
  })

  test('shows correct title for habit type', () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='habit'
      />
    )
    expect(screen.getByText('Add Habit')).toBeInTheDocument()
  })

  test('shows edit title when initialData provided', () => {
    const initialData = {
      id: 1,
      title: 'Test Event',
      day: '2025-09-16',
      startTime: '09:00',
      endTime: '10:00',
      type: 'task'
    }
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
        initialData={initialData}
      />
    )
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
  })

  test('renders form fields', () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument()
  })

  test('validates title field', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )

    // Title input should have required attribute
    const titleInput = screen.getByLabelText(/Title/i)
    expect(titleInput).toHaveAttribute('required')
    expect(titleInput).toHaveAttribute('maxLength', '200')
  })

  test('shows error when end time is before start time', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )

    const titleInput = screen.getByLabelText(/Title/i)
    const startTimeInput = screen.getByLabelText(/Start Time/i)
    const endTimeInput = screen.getByLabelText(/End Time/i)

    fireEvent.change(titleInput, { target: { value: 'Test Event' } })
    fireEvent.change(startTimeInput, { target: { value: '10:00' } })
    fireEvent.change(endTimeInput, { target: { value: '09:00' } })

    const submitButton = screen.getByRole('button', { name: /Create/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(
          'End time must be after start time (events cannot have zero duration)'
        )
      ).toBeInTheDocument()
    })
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  test('calls onSave with correct data when form is valid', async () => {
    mockOnSave.mockResolvedValue(undefined)

    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )

    const titleInput = screen.getByLabelText(/Title/i)
    const dateInput = screen.getByLabelText(/Date/i)
    const startTimeInput = screen.getByLabelText(/Start Time/i)
    const endTimeInput = screen.getByLabelText(/End Time/i)

    fireEvent.change(titleInput, { target: { value: 'Test Task' } })
    fireEvent.change(dateInput, { target: { value: '2025-09-20' } })
    fireEvent.change(startTimeInput, { target: { value: '09:00' } })
    fireEvent.change(endTimeInput, { target: { value: '10:00' } })

    const submitButton = screen.getByRole('button', { name: /Create/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Task',
        day: '2025-09-20',
        startTime: '09:00',
        endTime: '10:00',
        type: 'task'
      })
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('calls onClose when cancel button is clicked', () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  test('populates form with initialData when editing', () => {
    const initialData = {
      id: 1,
      title: 'Existing Event',
      day: '2025-09-16',
      startTime: '14:00',
      endTime: '15:00',
      type: 'routine'
    }

    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='routine'
        initialData={initialData}
      />
    )

    expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Event')
    expect(screen.getByLabelText(/Date/i)).toHaveValue('2025-09-16')
    expect(screen.getByLabelText(/Start Time/i)).toHaveValue('14:00')
    expect(screen.getByLabelText(/End Time/i)).toHaveValue('15:00')
  })

  test('displays error when onSave rejects', async () => {
    const errorMessage = 'Failed to save event'
    mockOnSave.mockRejectedValue(new Error(errorMessage))

    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )

    const titleInput = screen.getByLabelText(/Title/i)
    const submitButton = screen.getByRole('button', { name: /Create/i })

    fireEvent.change(titleInput, { target: { value: 'Test Event' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  test('validates title max length', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        eventType='task'
      />
    )

    const titleInput = screen.getByLabelText(/Title/i)
    const longTitle = 'a'.repeat(201)

    fireEvent.change(titleInput, { target: { value: longTitle } })

    const submitButton = screen.getByRole('button', { name: /Create/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Title must be 200 characters or less')
      ).toBeInTheDocument()
    })
    expect(mockOnSave).not.toHaveBeenCalled()
  })
})
