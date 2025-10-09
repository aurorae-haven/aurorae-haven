/**
 * Tests for reloadPageAfterDelay utility function
 */

import { reloadPageAfterDelay } from '../utils/dataManager'

describe('reloadPageAfterDelay', () => {
  let originalLocation

  beforeEach(() => {
    // Mock window.location.reload
    originalLocation = window.location
    delete window.location
    window.location = { reload: jest.fn() }
    jest.useFakeTimers()
  })

  afterEach(() => {
    // Restore window.location
    window.location = originalLocation
    jest.useRealTimers()
  })

  test('reloads page after default delay of 1500ms', () => {
    reloadPageAfterDelay()

    // Should not reload immediately
    expect(window.location.reload).not.toHaveBeenCalled()

    // Fast-forward time by 1500ms
    jest.advanceTimersByTime(1500)

    // Should reload after delay
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  test('reloads page after custom delay', () => {
    reloadPageAfterDelay(3000)

    // Should not reload before delay
    jest.advanceTimersByTime(2999)
    expect(window.location.reload).not.toHaveBeenCalled()

    // Should reload after delay
    jest.advanceTimersByTime(1)
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  test('can be called multiple times independently', () => {
    reloadPageAfterDelay(1000)
    reloadPageAfterDelay(2000)

    // First reload at 1000ms
    jest.advanceTimersByTime(1000)
    expect(window.location.reload).toHaveBeenCalledTimes(1)

    // Second reload at 2000ms (total)
    jest.advanceTimersByTime(1000)
    expect(window.location.reload).toHaveBeenCalledTimes(2)
  })
})
