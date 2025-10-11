/**
 * Tests for reloadPageAfterDelay utility function
 */

import { reloadPageAfterDelay } from '../utils/dataManager'

describe('reloadPageAfterDelay', () => {
  let mockWindow
  let reloadMock

  beforeEach(() => {
    // Create a mock window object with location.reload
    reloadMock = jest.fn()
    mockWindow = {
      location: {
        reload: reloadMock
      }
    }
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('reloads page after default delay of 1500ms', () => {
    reloadPageAfterDelay(1500, mockWindow)

    // Should not reload immediately
    expect(reloadMock).not.toHaveBeenCalled()

    // Fast-forward time by 1500ms
    jest.advanceTimersByTime(1500)

    // Should reload after delay
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })

  test('reloads page after custom delay', () => {
    reloadPageAfterDelay(3000, mockWindow)

    // Should not reload before delay
    jest.advanceTimersByTime(2999)
    expect(reloadMock).not.toHaveBeenCalled()

    // Should reload after delay
    jest.advanceTimersByTime(1)
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })

  test('can be called multiple times independently', () => {
    reloadPageAfterDelay(1000, mockWindow)
    reloadPageAfterDelay(2000, mockWindow)

    // First reload at 1000ms
    jest.advanceTimersByTime(1000)
    expect(reloadMock).toHaveBeenCalledTimes(1)

    // Second reload at 2000ms (total)
    jest.advanceTimersByTime(1000)
    expect(reloadMock).toHaveBeenCalledTimes(2)
  })

  test('uses global window by default when no window object provided', () => {
    // This test verifies backward compatibility
    // We can't fully test window.location.reload in Jest, but we can verify
    // the function is callable without errors
    expect(() => {
      // Just verify the function can be called with only delay parameter
      // In production, this would use the global window object
      reloadPageAfterDelay(1500)
    }).not.toThrow()
  })
})
