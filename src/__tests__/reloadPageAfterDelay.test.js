/**
 * Tests for reloadPageAfterDelay utility function
 */

import { reloadPageAfterDelay } from '../utils/dataManager'

describe('reloadPageAfterDelay', () => {
  let originalLocation
  let reloadMock

  beforeEach(() => {
    // Save and mock location - workaround for jsdom readonly location
    originalLocation = global.window.location
    reloadMock = jest.fn()
    delete global.window.location
    global.window.location = { reload: reloadMock }
    jest.useFakeTimers()
  })

  afterEach(() => {
    // Restore location
    global.window.location = originalLocation
    jest.useRealTimers()
  })

  // TODO: Fix mocking window.location.reload for Jest 30
  test.skip('reloads page after default delay of 1500ms', () => {
    reloadPageAfterDelay()

    // Should not reload immediately
    expect(reloadMock).not.toHaveBeenCalled()

    // Fast-forward time by 1500ms
    jest.advanceTimersByTime(1500)
    jest.runAllTicks()

    // Should reload after delay
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })

  // TODO: Fix mocking window.location.reload for Jest 30
  test.skip('reloads page after custom delay', () => {
    reloadPageAfterDelay(3000)

    // Should not reload before delay
    jest.advanceTimersByTime(2999)
    expect(reloadMock).not.toHaveBeenCalled()

    // Should reload after delay
    jest.advanceTimersByTime(1)
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })

  // TODO: Fix mocking window.location.reload for Jest 30
  test.skip('can be called multiple times independently', () => {
    reloadPageAfterDelay(1000)
    reloadPageAfterDelay(2000)

    // First reload at 1000ms
    jest.advanceTimersByTime(1000)
    expect(reloadMock).toHaveBeenCalledTimes(1)

    // Second reload at 2000ms (total)
    jest.advanceTimersByTime(1000)
    expect(reloadMock).toHaveBeenCalledTimes(2)
  })
})
