import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Schedule from '../pages/Schedule'

// Mock Icon component
jest.mock('../components/common/Icon', () => {
  return function Icon({ name }) {
    return <span data-testid={`icon-${name}`}>{name}</span>
  }
})

// Mock EventModal component
jest.mock('../components/Schedule/EventModal', () => {
  return function EventModal() {
    return null
  }
})

// Mock scheduleManager functions
jest.mock('../utils/scheduleManager', () => ({
  createEvent: jest.fn(),
  getEventsForDay: jest.fn().mockResolvedValue([]),
  getEventsForWeek: jest.fn().mockResolvedValue([])
}))

// Mock logger
jest.mock('../utils/logger', () => ({
  createLogger: jest.fn(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }))
}))

// Mock getCurrentDateISO to return consistent date for testing
jest.mock('../utils/timeUtils', () => ({
  getCurrentDateISO: jest.fn(() => '2025-09-16')
}))

describe('Schedule Component', () => {
  const mockGetEventsForDay = require('../utils/scheduleManager').getEventsForDay
  const mockGetEventsForWeek = require('../utils/scheduleManager').getEventsForWeek

  beforeEach(() => {
    // Mock Date to return a consistent time for testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-09-16T09:15:00'))
    // Reset mocks
    mockGetEventsForDay.mockClear()
    mockGetEventsForWeek.mockClear()
    mockGetEventsForDay.mockResolvedValue([])
    mockGetEventsForWeek.mockResolvedValue([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('renders Schedule component with header', () => {
    render(<Schedule />)
    const scheduleElements = screen.getAllByText(/Schedule/)
    expect(scheduleElements.length).toBeGreaterThan(0)
    expect(screen.getByText('Today · Tue 16/09/2025')).toBeInTheDocument()
  })

  test('renders action buttons', () => {
    render(<Schedule />)
    expect(screen.getByRole('button', { name: /Day/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Week/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Schedule an event/i })).toBeInTheDocument()
  })

  test('renders sidebar sections', () => {
    render(<Schedule />)
    expect(screen.getByText("Today's queue")).toBeInTheDocument()
    expect(screen.getByText('Deep Work Warmup')).toBeInTheDocument()
    // Use getAllByText since "Buy groceries" appears in both sidebar and calendar
    const buyGroceriesElements = screen.getAllByText('Buy groceries')
    expect(buyGroceriesElements.length).toBeGreaterThan(0)
  })

  test('renders time labels for schedule', () => {
    render(<Schedule />)
    expect(screen.getByText('06:00')).toBeInTheDocument()
    expect(screen.getByText('Morning')).toBeInTheDocument()
    expect(screen.getByText('Afternoon')).toBeInTheDocument()
    expect(screen.getByText('Evening')).toBeInTheDocument()
  })

  test('renders routine block with correct structure', () => {
    render(<Schedule />)
    const routineBlock = screen.getByLabelText(/Routine: Morning Launch/)
    expect(routineBlock).toBeInTheDocument()
    expect(routineBlock).toHaveClass('block', 'routine')
    expect(screen.getByText('Morning Launch')).toBeInTheDocument()
    expect(screen.getByText('07:00–07:30')).toBeInTheDocument()
  })

  test('renders meeting block with next badge', () => {
    render(<Schedule />)
    const meetingBlock = screen.getByLabelText(/Meeting: Team Standup/)
    expect(meetingBlock).toBeInTheDocument()
    expect(meetingBlock).toHaveClass('block', 'meeting', 'next-up')
    expect(screen.getByText('Team Standup')).toBeInTheDocument()
    expect(screen.getByText('10:00–10:30')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  test('renders task block with priority class', () => {
    render(<Schedule />)
    const taskBlock = screen.getByLabelText(/Task: Buy groceries/)
    expect(taskBlock).toBeInTheDocument()
    expect(taskBlock).toHaveClass('block', 'task', 'not-urgent-important')
    expect(screen.getByText('16:00–16:30')).toBeInTheDocument()
  })

  test('renders current time indicator during business hours', () => {
    render(<Schedule />)
    const timeIndicator = screen.getByLabelText('Current time')
    expect(timeIndicator).toBeInTheDocument()
    expect(screen.getByText('Now')).toBeInTheDocument()
  })

  test('hides current time indicator outside business hours', () => {
    // Set time to 23:00 (11 PM - outside schedule range)
    jest.setSystemTime(new Date('2025-09-16T23:00:00'))
    render(<Schedule />)
    expect(screen.queryByLabelText('Current time')).not.toBeInTheDocument()
  })

  test('renders time period backgrounds', () => {
    const { container } = render(<Schedule />)
    const morningPeriod = container.querySelector('.time-period-morning')
    const afternoonPeriod = container.querySelector('.time-period-afternoon')
    const eveningPeriod = container.querySelector('.time-period-evening')

    expect(morningPeriod).toBeInTheDocument()
    expect(afternoonPeriod).toBeInTheDocument()
    expect(eveningPeriod).toBeInTheDocument()
  })

  test('renders time period separators', () => {
    const { container } = render(<Schedule />)
    const separators = container.querySelectorAll('.time-period-separator')
    expect(separators).toHaveLength(3)
  })

  test('all schedule blocks have proper ARIA labels', () => {
    render(<Schedule />)
    expect(
      screen.getByLabelText('Routine: Morning Launch at 07:00–07:30')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Meeting: Team Standup at 10:00–10:30 - Next up')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Task: Buy groceries at 16:00–16:30')
    ).toBeInTheDocument()
  })

  test('schedule blocks have correct positioning styles', () => {
    render(<Schedule />)
    const routineBlock = screen.getByLabelText(/Routine: Morning Launch/)
    const meetingBlock = screen.getByLabelText(/Meeting: Team Standup/)
    const taskBlock = screen.getByLabelText(/Task: Buy groceries/)

    expect(routineBlock).toHaveStyle({ top: '126px', height: '60px' })
    expect(meetingBlock).toHaveStyle({ top: '486px', height: '60px' })
    expect(taskBlock).toHaveStyle({ top: '1206px', height: '60px' })
  })

  describe('Button Functionality', () => {
    test('Day button is active by default', () => {
      render(<Schedule />)
      const dayButton = screen.getByRole('button', { name: /View day schedule/i })
      expect(dayButton).toHaveClass('btn-active')
    })

    test('Week button is not active by default', () => {
      render(<Schedule />)
      const weekButton = screen.getByRole('button', { name: /View week schedule/i })
      expect(weekButton).not.toHaveClass('btn-active')
    })

    test('Day button has correct ARIA attributes', () => {
      render(<Schedule />)
      const dayButton = screen.getByRole('button', { name: /View day schedule/i })
      expect(dayButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('Week button has correct ARIA attributes when not active', () => {
      render(<Schedule />)
      const weekButton = screen.getByRole('button', { name: /View week schedule/i })
      expect(weekButton).toHaveAttribute('aria-pressed', 'false')
    })

    test('Schedule dropdown button has correct ARIA attributes', () => {
      render(<Schedule />)
      const scheduleButton = screen.getByRole('button', { name: /Schedule an event/i })
      expect(scheduleButton).toBeInTheDocument()
      expect(scheduleButton).toHaveAttribute('aria-expanded', 'false')
      expect(scheduleButton).toHaveAttribute('aria-haspopup', 'menu')
    })

    test('loads day events on initial render', () => {
      render(<Schedule />)
      expect(mockGetEventsForDay).toHaveBeenCalledWith('2025-09-16')
      expect(mockGetEventsForWeek).not.toHaveBeenCalled()
    })

    test('clicking Week button switches view mode and loads week events', async () => {
      render(<Schedule />)
      const weekButton = screen.getByRole('button', { name: /View week schedule/i })
      
      // Click the week button using RTL's fireEvent
      fireEvent.click(weekButton)
      
      // Wait for state update
      await screen.findByRole('button', { name: /View week schedule/i })
      
      // Check that week events were loaded
      expect(mockGetEventsForWeek).toHaveBeenCalled()
    })

    test('clicking Day button after Week keeps day view active', () => {
      render(<Schedule />)
      const dayButton = screen.getByRole('button', { name: /View day schedule/i })
      
      // Click day button (already active) using RTL's fireEvent
      fireEvent.click(dayButton)
      
      // Day button should still be active
      expect(dayButton).toHaveClass('btn-active')
    })
  })
})
