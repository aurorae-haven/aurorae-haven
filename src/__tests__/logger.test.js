import { log, warn, error, info, createLogger } from '../utils/logger.js'
import * as settingsManager from '../utils/settingsManager.js'

describe('logger utility', () => {
  let consoleLogSpy
  let consoleWarnSpy
  let consoleErrorSpy
  let consoleInfoSpy

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
  })

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleInfoSpy.mockRestore()
  })

  describe('in production mode with debugMode disabled', () => {
    beforeEach(() => {
      // Mock getSetting to return debugMode: false
      jest.spyOn(settingsManager, 'getSetting').mockReturnValue(false)
    })

    afterEach(() => {
      settingsManager.getSetting.mockRestore()
    })

    test('log() should NOT output to console', () => {
      log('test message')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    test('warn() should NOT output to console', () => {
      warn('test warning')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    test('error() should ALWAYS output to console', () => {
      error('test error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('test error')
    })

    test('info() should NOT output to console', () => {
      info('test info')
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })
  })

  describe('in production mode with debugMode enabled', () => {
    beforeEach(() => {
      // Mock getSetting to return debugMode: true
      jest.spyOn(settingsManager, 'getSetting').mockReturnValue(true)
    })

    afterEach(() => {
      settingsManager.getSetting.mockRestore()
    })

    test('log() should output to console when debugMode is enabled', () => {
      log('test message')
      expect(consoleLogSpy).toHaveBeenCalledWith('test message')
    })

    test('warn() should output to console when debugMode is enabled', () => {
      warn('test warning')
      expect(consoleWarnSpy).toHaveBeenCalledWith('test warning')
    })

    test('error() should always output to console', () => {
      error('test error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('test error')
    })

    test('info() should output to console when debugMode is enabled', () => {
      info('test info')
      expect(consoleInfoSpy).toHaveBeenCalledWith('test info')
    })
  })

  describe('createLogger with namespace', () => {
    beforeEach(() => {
      // Mock debugMode to true for these tests
      jest.spyOn(settingsManager, 'getSetting').mockReturnValue(true)
    })

    afterEach(() => {
      settingsManager.getSetting.mockRestore()
    })

    test('should create a namespaced logger', () => {
      const logger = createLogger('TestModule')

      logger.log('message')
      expect(consoleLogSpy).toHaveBeenCalledWith('[TestModule]', 'message')

      logger.warn('warning')
      expect(consoleWarnSpy).toHaveBeenCalledWith('[TestModule]', 'warning')

      logger.error('error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestModule]', 'error')

      logger.info('info')
      expect(consoleInfoSpy).toHaveBeenCalledWith('[TestModule]', 'info')
    })

    test('should handle multiple arguments', () => {
      const logger = createLogger('TestModule')

      logger.log('test', 'multiple', 'args')
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TestModule]',
        'test',
        'multiple',
        'args'
      )
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      // Mock getSetting to throw an error
      jest.spyOn(settingsManager, 'getSetting').mockImplementation(() => {
        throw new Error('Settings not available')
      })
    })

    afterEach(() => {
      settingsManager.getSetting.mockRestore()
    })

    test('should not crash if settings are unavailable', () => {
      expect(() => {
        log('test message')
      }).not.toThrow()

      // Should not log when settings are unavailable in production
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    test('error() should still work if settings are unavailable', () => {
      expect(() => {
        error('test error')
      }).not.toThrow()

      // Errors should always log
      expect(consoleErrorSpy).toHaveBeenCalledWith('test error')
    })
  })
})
