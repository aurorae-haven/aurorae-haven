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
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  test('reloads page after default delay of 1500ms', () => {
    reloadPageAfterDelay(undefined, mockWindow)

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

  test('schedules reload with default delay when no window object provided', () => {
    // This test verifies backward compatibility by checking setTimeout is called with default delay
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
    
    reloadPageAfterDelay()
    
    // Verify setTimeout was called with correct default delay (1500ms)
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1500)
    
    setTimeoutSpy.mockRestore()
  })

  test('gracefully handles absence of window without throwing', () => {
    // Save original window reference
    const originalWindow = globalThis.window
    
    // Temporarily remove window to simulate non-browser environment
    delete globalThis.window
    
    // Function should not throw when window is undefined
    expect(() => {
      reloadPageAfterDelay(1000, undefined)
    }).not.toThrow()
    
    // Restore original window
    globalThis.window = originalWindow
  })
})
