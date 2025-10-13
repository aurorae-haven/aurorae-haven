import { TASK_TEXT_MAX_LENGTH } from '../utils/validationConstants'

describe('Validation Constants', () => {
  test('TASK_TEXT_MAX_LENGTH is defined and is a positive number', () => {
    expect(TASK_TEXT_MAX_LENGTH).toBeDefined()
    expect(typeof TASK_TEXT_MAX_LENGTH).toBe('number')
    expect(TASK_TEXT_MAX_LENGTH).toBeGreaterThan(0)
  })

  test('TASK_TEXT_MAX_LENGTH has expected value', () => {
    expect(TASK_TEXT_MAX_LENGTH).toBe(1000)
  })
})
