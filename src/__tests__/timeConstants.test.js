import { MS_PER_DAY } from '../utils/timeConstants'

describe('timeConstants', () => {
  describe('MS_PER_DAY', () => {
    test('should equal 86400000 milliseconds', () => {
      expect(MS_PER_DAY).toBe(86400000)
    })

    test('should equal 24 * 60 * 60 * 1000', () => {
      expect(MS_PER_DAY).toBe(24 * 60 * 60 * 1000)
    })

    test('should be a number', () => {
      expect(typeof MS_PER_DAY).toBe('number')
    })

    test('should be used for day-based date calculations', () => {
      const now = Date.now()
      const tomorrow = now + MS_PER_DAY
      const dayDifference = Math.floor((tomorrow - now) / MS_PER_DAY)
      
      expect(dayDifference).toBe(1)
    })

    test('should correctly calculate days between dates', () => {
      const date1 = new Date('2025-01-01').getTime()
      const date2 = new Date('2025-01-10').getTime()
      const daysBetween = Math.floor((date2 - date1) / MS_PER_DAY)
      
      expect(daysBetween).toBe(9)
    })
  })
})
