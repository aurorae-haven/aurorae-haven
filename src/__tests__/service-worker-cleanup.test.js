import { DEFAULT_GITHUB_PAGES_BASE_PATH } from '../utils/configConstants'

/**
 * @fileoverview
 * Tests for service worker cleanup logic.
 * Validates that old service workers registered at wrong scope are properly unregistered.
 */

describe('Service Worker Cleanup', () => {
  let mockRegistration
  let mockNavigator

  beforeEach(() => {
    // Mock service worker registration
    mockRegistration = {
      scope: '',
      unregister: jest.fn().mockResolvedValue(true)
    }

    // Mock navigator.serviceWorker
    mockNavigator = {
      serviceWorker: {
        getRegistrations: jest.fn()
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Scope URL Comparison', () => {
    test('correctly identifies matching scope URLs', () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href
      const registrationScope = `https://aurorae-haven.github.io${DEFAULT_GITHUB_PAGES_BASE_PATH}`

      expect(registrationScope).toBe(expectedScope)
    })

    test('correctly identifies mismatched scope URLs (root vs subpath)', () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href
      const registrationScope = 'https://aurorae-haven.github.io/'

      expect(registrationScope).not.toBe(expectedScope)
    })

    test('correctly identifies mismatched scope URLs (different subpath)', () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href
      const registrationScope = 'https://aurorae-haven.github.io/old-path/'

      expect(registrationScope).not.toBe(expectedScope)
    })
  })

  describe('Service Worker Unregistration Logic', () => {
    test('unregisters service worker when scope does not match', async () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href

      // Mock registration with wrong scope
      mockRegistration.scope = 'https://aurorae-haven.github.io/'
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([
        mockRegistration
      ])

      // Execute the cleanup logic
      const registrations = await mockNavigator.serviceWorker.getRegistrations()

      registrations.forEach((registration) => {
        if (registration.scope !== expectedScope) {
          registration.unregister()
        }
      })

      expect(mockRegistration.unregister).toHaveBeenCalledTimes(1)
    })

    test('does not unregister service worker when scope matches', async () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href

      // Mock registration with correct scope
      mockRegistration.scope = expectedScope
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([
        mockRegistration
      ])

      // Execute the cleanup logic
      const registrations = await mockNavigator.serviceWorker.getRegistrations()

      registrations.forEach((registration) => {
        if (registration.scope !== expectedScope) {
          registration.unregister()
        }
      })

      expect(mockRegistration.unregister).not.toHaveBeenCalled()
    })

    test('handles multiple registrations correctly', async () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href

      // Mock multiple registrations
      const wrongScopeReg1 = {
        scope: 'https://aurorae-haven.github.io/',
        unregister: jest.fn().mockResolvedValue(true)
      }
      const wrongScopeReg2 = {
        scope: 'https://aurorae-haven.github.io/old/',
        unregister: jest.fn().mockResolvedValue(true)
      }
      const correctScopeReg = {
        scope: expectedScope,
        unregister: jest.fn().mockResolvedValue(true)
      }

      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([
        wrongScopeReg1,
        wrongScopeReg2,
        correctScopeReg
      ])

      // Execute the cleanup logic
      const registrations = await mockNavigator.serviceWorker.getRegistrations()

      registrations.forEach((registration) => {
        if (registration.scope !== expectedScope) {
          registration.unregister()
        }
      })

      expect(wrongScopeReg1.unregister).toHaveBeenCalledTimes(1)
      expect(wrongScopeReg2.unregister).toHaveBeenCalledTimes(1)
      expect(correctScopeReg.unregister).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    test('handles empty registrations array', async () => {
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([])

      const registrations = await mockNavigator.serviceWorker.getRegistrations()

      expect(registrations).toHaveLength(0)
    })

    test('handles unregister failure gracefully', async () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href

      mockRegistration.scope = 'https://aurorae-haven.github.io/'
      mockRegistration.unregister.mockResolvedValue(false)

      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([
        mockRegistration
      ])

      const registrations = await mockNavigator.serviceWorker.getRegistrations()

      registrations.forEach((registration) => {
        if (registration.scope !== expectedScope) {
          registration.unregister()
        }
      })

      expect(mockRegistration.unregister).toHaveBeenCalled()
    })

    test('handles getRegistrations rejection', async () => {
      const error = new Error('Failed to get registrations')
      mockNavigator.serviceWorker.getRegistrations.mockRejectedValue(error)

      await expect(
        mockNavigator.serviceWorker.getRegistrations()
      ).rejects.toThrow('Failed to get registrations')
    })
  })

  describe('Production Scenarios', () => {
    test('GitHub Pages production: unregisters root scope SW', async () => {
      const baseUrl = DEFAULT_GITHUB_PAGES_BASE_PATH
      const origin = 'https://aurorae-haven.github.io'
      const expectedScope = new URL(baseUrl, origin).href

      // Old SW at root (wrong)
      const oldRootSW = {
        scope: 'https://aurorae-haven.github.io/',
        unregister: jest.fn().mockResolvedValue(true)
      }

      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([
        oldRootSW
      ])

      const registrations = await mockNavigator.serviceWorker.getRegistrations()

      registrations.forEach((registration) => {
        if (registration.scope !== expectedScope) {
          console.log('Unregistering SW with wrong scope:', registration.scope)
          registration.unregister()
        }
      })

      expect(oldRootSW.unregister).toHaveBeenCalled()
    })

    test('Localhost development: keeps root scope SW', async () => {
      const baseUrl = '/'
      const origin = 'http://localhost:3000'
      const expectedScope = new URL(baseUrl, origin).href

      const localSW = {
        scope: 'http://localhost:3000/',
        unregister: jest.fn().mockResolvedValue(true)
      }

      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([localSW])

      const registrations = await mockNavigator.serviceWorker.getRegistrations()

      registrations.forEach((registration) => {
        if (registration.scope !== expectedScope) {
          registration.unregister()
        }
      })

      expect(localSW.unregister).not.toHaveBeenCalled()
    })
  })
})
