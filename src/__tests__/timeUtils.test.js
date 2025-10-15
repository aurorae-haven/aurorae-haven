/**
 * Tests for Time Utilities
 * Comprehensive test coverage for all time/duration functions
 */

import {
  parseTime,
  formatTime,
  timeToMinutes,
  minutesToTime,
  calculateDuration,
  addDuration,
  subtractDuration,
  formatDurationDisplay,
  formatDurationVerbose
} from '../utils/timeUtils'

describe('timeUtils', () => {
  describe('parseTime', () => {
    test('should parse valid time string', () => {
      expect(parseTime('09:30')).toEqual({ hours: 9, minutes: 30 })
      expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 })
    })

    test('should handle invalid input', () => {
      expect(parseTime('')).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime(null)).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime(undefined)).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime('invalid')).toEqual({ hours: 0, minutes: 0 })
    })

    test('should handle numeric strings', () => {
      expect(parseTime('12:45')).toEqual({ hours: 12, minutes: 45 })
    })

    test('should validate hour range (0-23)', () => {
      expect(parseTime('24:00')).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime('25:30')).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime('-1:30')).toEqual({ hours: 0, minutes: 0 })
    })

    test('should validate minute range (0-59)', () => {
      expect(parseTime('12:60')).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime('12:75')).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime('12:-5')).toEqual({ hours: 0, minutes: 0 })
    })

    test('should reject out-of-range values', () => {
      expect(parseTime('24:60')).toEqual({ hours: 0, minutes: 0 })
      expect(parseTime('99:99')).toEqual({ hours: 0, minutes: 0 })
    })
  })

  describe('formatTime', () => {
    test('should format time with proper padding', () => {
      expect(formatTime(9, 30)).toBe('09:30')
      expect(formatTime(0, 0)).toBe('00:00')
      expect(formatTime(23, 59)).toBe('23:59')
      expect(formatTime(1, 5)).toBe('01:05')
    })

    test('should handle edge cases', () => {
      expect(formatTime(0, 0)).toBe('00:00')
      expect(formatTime(12, 0)).toBe('12:00')
      expect(formatTime(0, 30)).toBe('00:30')
    })

    test('should floor decimal values', () => {
      expect(formatTime(9.7, 30.9)).toBe('09:30')
    })

    test('should handle negative values', () => {
      // -5 hours -10 minutes = -310 minutes wraps to 18:50 (24*60 - 310 = 1440 - 310 = 1130 minutes = 18:50)
      expect(formatTime(-5, -10)).toBe('18:50')
      expect(formatTime(-1, 0)).toBe('23:00') // -1 hour wraps to 23:00
    })

    test('should normalize out-of-range hours', () => {
      expect(formatTime(24, 0)).toBe('00:00') // 24 hours wraps to 00:00
      expect(formatTime(25, 30)).toBe('01:30') // 25:30 wraps to 01:30
      expect(formatTime(48, 0)).toBe('00:00') // 48 hours wraps to 00:00
    })

    test('should normalize out-of-range minutes', () => {
      expect(formatTime(0, 60)).toBe('01:00') // 60 minutes = 1 hour
      expect(formatTime(0, 90)).toBe('01:30') // 90 minutes = 1 hour 30 minutes
      expect(formatTime(23, 120)).toBe('01:00') // 23:120 = 25:00 wraps to 01:00
    })

    test('should normalize combined out-of-range values', () => {
      expect(formatTime(24, 60)).toBe('01:00') // 24:60 = 25:00 wraps to 01:00
      expect(formatTime(23, 90)).toBe('00:30') // 23:90 = 24:30 wraps to 00:30
    })

    test('should handle negative minutes with positive hours', () => {
      expect(formatTime(5, -30)).toBe('04:30') // 5:(-30) = 4:30
      expect(formatTime(1, -60)).toBe('00:00') // 1:(-60) = 0:00
    })
  })

  describe('timeToMinutes', () => {
    test('should convert time to minutes', () => {
      expect(timeToMinutes('00:00')).toBe(0)
      expect(timeToMinutes('01:00')).toBe(60)
      expect(timeToMinutes('09:30')).toBe(570)
      expect(timeToMinutes('23:59')).toBe(1439)
    })

    test('should handle invalid input', () => {
      expect(timeToMinutes('')).toBe(0)
      expect(timeToMinutes(null)).toBe(0)
    })
  })

  describe('minutesToTime', () => {
    test('should convert minutes to time', () => {
      expect(minutesToTime(0)).toBe('00:00')
      expect(minutesToTime(60)).toBe('01:00')
      expect(minutesToTime(570)).toBe('09:30')
      expect(minutesToTime(1439)).toBe('23:59')
    })

    test('should handle values over 24 hours', () => {
      expect(minutesToTime(1440)).toBe('00:00') // 24 hours wraps to 00:00
      expect(minutesToTime(1500)).toBe('01:00') // 25 hours wraps to 01:00
    })

    test('should handle negative values', () => {
      // Negative values wrap to previous day
      expect(minutesToTime(-60)).toBe('23:00') // -1 hour from midnight
      expect(minutesToTime(-120)).toBe('22:00') // -2 hours from midnight
    })

    test('should handle decimal values', () => {
      expect(minutesToTime(90.5)).toBe('01:30')
    })
  })

  describe('calculateDuration', () => {
    test('should calculate duration between times', () => {
      expect(calculateDuration('09:00', '10:00')).toBe(60)
      expect(calculateDuration('09:30', '10:00')).toBe(30)
      expect(calculateDuration('08:00', '22:00')).toBe(840)
    })

    test('should handle same start and end time', () => {
      expect(calculateDuration('09:00', '09:00')).toBe(0)
    })

    test('should return negative for end before start', () => {
      expect(calculateDuration('10:00', '09:00')).toBe(-60)
    })

    test('should handle invalid input', () => {
      expect(calculateDuration('', '10:00')).toBe(0)
      expect(calculateDuration('09:00', '')).toBe(0)
      expect(calculateDuration(null, null)).toBe(0)
    })

    test('should match scheduleManager behavior', () => {
      // Test cases from scheduleManager.test.js
      expect(calculateDuration('09:00', '10:00')).toBe(60)
      expect(calculateDuration('14:00', '15:00')).toBe(60)
    })
  })

  describe('addDuration', () => {
    test('should add minutes to time', () => {
      expect(addDuration('09:00', 60)).toBe('10:00')
      expect(addDuration('09:00', 30)).toBe('09:30')
      expect(addDuration('23:00', 120)).toBe('01:00') // Wraps to next day
    })

    test('should handle negative minutes', () => {
      expect(addDuration('10:00', -60)).toBe('09:00')
    })

    test('should handle invalid input', () => {
      expect(addDuration('', 60)).toBe('01:00')
      expect(addDuration(null, 60)).toBe('01:00')
    })

    test('should match scheduleManager addMinutes behavior', () => {
      // Test case from scheduleManager moveEvent test
      expect(addDuration('14:00', 60)).toBe('15:00')
    })
  })

  describe('subtractDuration', () => {
    test('should subtract minutes from time', () => {
      expect(subtractDuration('10:00', 60)).toBe('09:00')
      expect(subtractDuration('09:30', 30)).toBe('09:00')
    })

    test('should handle wrapping to previous day', () => {
      expect(subtractDuration('01:00', 120)).toBe('23:00')
    })
  })

  describe('formatDurationDisplay', () => {
    test('should format seconds to mm:ss', () => {
      expect(formatDurationDisplay(0)).toBe('00:00')
      expect(formatDurationDisplay(30)).toBe('00:30')
      expect(formatDurationDisplay(60)).toBe('01:00')
      expect(formatDurationDisplay(90)).toBe('01:30')
      expect(formatDurationDisplay(462)).toBe('07:42')
    })

    test('should handle negative values', () => {
      expect(formatDurationDisplay(-30)).toBe('-00:30')
      expect(formatDurationDisplay(-90)).toBe('-01:30')
    })

    test('should handle verbose option', () => {
      expect(formatDurationDisplay(66, { verbose: true })).toBe(
        '01:06 remaining'
      )
      expect(formatDurationDisplay(30, { verbose: true })).toBe(
        '00:30 remaining'
      )
    })

    test('should handle invalid input', () => {
      expect(formatDurationDisplay(NaN)).toBe('00:00')
      expect(formatDurationDisplay(null)).toBe('00:00')
      expect(formatDurationDisplay(undefined)).toBe('00:00')
      expect(formatDurationDisplay('invalid')).toBe('00:00')
    })

    test('should floor fractional seconds', () => {
      expect(formatDurationDisplay(90.5)).toBe('01:30')
      expect(formatDurationDisplay(90.9)).toBe('01:30')
      expect(formatDurationDisplay(59.9)).toBe('00:59')
      expect(formatDurationDisplay(0.9)).toBe('00:00')
    })

    test('should match routineRunner formatTime behavior', () => {
      // Test cases from routineRunner.js usage
      expect(formatDurationDisplay(462)).toBe('07:42')
      expect(formatDurationDisplay(66)).toBe('01:06')
      expect(formatDurationDisplay(24)).toBe('00:24')
    })
  })

  describe('formatDurationVerbose', () => {
    test('should format durations under 60 minutes', () => {
      expect(formatDurationVerbose(60)).toBe('1m')
      expect(formatDurationVerbose(1800)).toBe('30m')
      expect(formatDurationVerbose(3540)).toBe('59m')
    })

    test('should format durations with hours', () => {
      expect(formatDurationVerbose(3600)).toBe('1h')
      expect(formatDurationVerbose(5400)).toBe('1h 30m')
      expect(formatDurationVerbose(7200)).toBe('2h')
      expect(formatDurationVerbose(7260)).toBe('2h 1m')
    })

    test('should handle zero and null', () => {
      expect(formatDurationVerbose(0)).toBeNull()
      expect(formatDurationVerbose(null)).toBeNull()
    })

    test('should match TemplateCard formatDuration behavior', () => {
      // Test cases from TemplateCard.jsx
      expect(formatDurationVerbose(1800)).toBe('30m') // 30 minutes
      expect(formatDurationVerbose(3600)).toBe('1h') // 1 hour
      expect(formatDurationVerbose(5400)).toBe('1h 30m') // 1.5 hours
    })
  })

  describe('integration tests', () => {
    test('should round-trip time conversions', () => {
      const testTimes = ['00:00', '09:30', '12:00', '23:59']

      testTimes.forEach((time) => {
        const minutes = timeToMinutes(time)
        const converted = minutesToTime(minutes)
        expect(converted).toBe(time)
      })
    })

    test('should handle duration calculations consistently', () => {
      const start = '09:00'
      const duration = 90 // 1.5 hours

      const end = addDuration(start, duration)
      expect(end).toBe('10:30')

      const calculatedDuration = calculateDuration(start, end)
      expect(calculatedDuration).toBe(duration)

      const backToStart = subtractDuration(end, duration)
      expect(backToStart).toBe(start)
    })

    test('should handle complex time arithmetic', () => {
      // Add multiple durations
      let time = '08:00'
      time = addDuration(time, 30) // 08:30
      time = addDuration(time, 45) // 09:15
      time = addDuration(time, 90) // 10:45

      expect(time).toBe('10:45')
    })
  })
})
