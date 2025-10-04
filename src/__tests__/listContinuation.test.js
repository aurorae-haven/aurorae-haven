/**
 * Unit tests for list continuation functionality
 */

import {
  parseListItem,
  generateNextListItem,
  handleEnterKey
} from '../utils/listContinuation'

describe('parseListItem', () => {
  describe('task lists', () => {
    test('parses unchecked task list with dash', () => {
      const result = parseListItem('- [ ] Buy groceries')
      expect(result).toEqual({
        type: 'task',
        indent: '',
        marker: '-',
        checked: ' ',
        content: 'Buy groceries',
        isEmpty: false
      })
    })

    test('parses checked task list with dash', () => {
      const result = parseListItem('- [x] Complete task')
      expect(result).toEqual({
        type: 'task',
        indent: '',
        marker: '-',
        checked: 'x',
        content: 'Complete task',
        isEmpty: false
      })
    })

    test('parses task list with asterisk', () => {
      const result = parseListItem('* [ ] Do something')
      expect(result).toEqual({
        type: 'task',
        indent: '',
        marker: '*',
        checked: ' ',
        content: 'Do something',
        isEmpty: false
      })
    })

    test('parses indented task list', () => {
      const result = parseListItem('  - [ ] Nested task')
      expect(result).toEqual({
        type: 'task',
        indent: '  ',
        marker: '-',
        checked: ' ',
        content: 'Nested task',
        isEmpty: false
      })
    })

    test('parses empty task list', () => {
      const result = parseListItem('- [ ] ')
      expect(result).toEqual({
        type: 'task',
        indent: '',
        marker: '-',
        checked: ' ',
        content: '',
        isEmpty: true
      })
    })

    test('parses empty task list with whitespace', () => {
      const result = parseListItem('- [ ]   ')
      expect(result).toEqual({
        type: 'task',
        indent: '',
        marker: '-',
        checked: ' ',
        content: '',
        isEmpty: true
      })
    })
  })

  describe('bullet lists', () => {
    test('parses bullet list with dash', () => {
      const result = parseListItem('- Item one')
      expect(result).toEqual({
        type: 'bullet',
        indent: '',
        marker: '-',
        content: 'Item one',
        isEmpty: false
      })
    })

    test('parses bullet list with asterisk', () => {
      const result = parseListItem('* Item two')
      expect(result).toEqual({
        type: 'bullet',
        indent: '',
        marker: '*',
        content: 'Item two',
        isEmpty: false
      })
    })

    test('parses indented bullet list', () => {
      const result = parseListItem('    * Nested item')
      expect(result).toEqual({
        type: 'bullet',
        indent: '    ',
        marker: '*',
        content: 'Nested item',
        isEmpty: false
      })
    })

    test('parses empty bullet list', () => {
      const result = parseListItem('- ')
      expect(result).toEqual({
        type: 'bullet',
        indent: '',
        marker: '-',
        content: '',
        isEmpty: true
      })
    })
  })

  describe('numbered lists', () => {
    test('parses numbered list', () => {
      const result = parseListItem('1. First item')
      expect(result).toEqual({
        type: 'numbered',
        indent: '',
        number: 1,
        content: 'First item',
        isEmpty: false
      })
    })

    test('parses numbered list with multi-digit number', () => {
      const result = parseListItem('42. Some item')
      expect(result).toEqual({
        type: 'numbered',
        indent: '',
        number: 42,
        content: 'Some item',
        isEmpty: false
      })
    })

    test('parses indented numbered list', () => {
      const result = parseListItem('  3. Nested numbered')
      expect(result).toEqual({
        type: 'numbered',
        indent: '  ',
        number: 3,
        content: 'Nested numbered',
        isEmpty: false
      })
    })

    test('parses empty numbered list', () => {
      const result = parseListItem('5. ')
      expect(result).toEqual({
        type: 'numbered',
        indent: '',
        number: 5,
        content: '',
        isEmpty: true
      })
    })
  })

  describe('non-list items', () => {
    test('returns null for plain text', () => {
      expect(parseListItem('Just some text')).toBeNull()
    })

    test('returns null for empty string', () => {
      expect(parseListItem('')).toBeNull()
    })

    test('returns null for heading', () => {
      expect(parseListItem('# Heading')).toBeNull()
    })

    test('returns null for code block', () => {
      expect(parseListItem('```javascript')).toBeNull()
    })
  })
})

describe('generateNextListItem', () => {
  test('generates next task list item', () => {
    const listInfo = {
      type: 'task',
      indent: '',
      marker: '-',
      checked: ' ',
      content: 'Some task'
    }
    expect(generateNextListItem(listInfo)).toBe('\n- [ ] ')
  })

  test('generates next task list item with indentation', () => {
    const listInfo = {
      type: 'task',
      indent: '  ',
      marker: '*',
      checked: 'x',
      content: 'Done task'
    }
    expect(generateNextListItem(listInfo)).toBe('\n  * [ ] ')
  })

  test('generates next bullet list item', () => {
    const listInfo = {
      type: 'bullet',
      indent: '',
      marker: '-',
      content: 'Item'
    }
    expect(generateNextListItem(listInfo)).toBe('\n- ')
  })

  test('generates next bullet list item with indentation', () => {
    const listInfo = {
      type: 'bullet',
      indent: '    ',
      marker: '*',
      content: 'Nested'
    }
    expect(generateNextListItem(listInfo)).toBe('\n    * ')
  })

  test('generates next numbered list item', () => {
    const listInfo = {
      type: 'numbered',
      indent: '',
      number: 1,
      content: 'First'
    }
    expect(generateNextListItem(listInfo)).toBe('\n2. ')
  })

  test('generates next numbered list item with higher number', () => {
    const listInfo = {
      type: 'numbered',
      indent: '  ',
      number: 42,
      content: 'Item'
    }
    expect(generateNextListItem(listInfo)).toBe('\n  43. ')
  })

  test('returns empty string for null', () => {
    expect(generateNextListItem(null)).toBe('')
  })
})

describe('handleEnterKey', () => {
  describe('task lists', () => {
    test('continues task list with content', () => {
      const value = '- [ ] First task'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '- [ ] First task\n- [ ] ',
        newCursorPos: 23
      })
    })

    test('removes empty task list item', () => {
      const value = '- [ ] First task\n- [ ] '
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'remove',
        newValue: '- [ ] First task\n',
        newCursorPos: 17
      })
    })

    test('handles task list with indentation', () => {
      const value = '  - [ ] Indented task'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '  - [ ] Indented task\n  - [ ] ',
        newCursorPos: 30
      })
    })

    test('handles asterisk task list', () => {
      const value = '* [ ] Task with asterisk'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '* [ ] Task with asterisk\n* [ ] ',
        newCursorPos: 31
      })
    })
  })

  describe('bullet lists', () => {
    test('continues bullet list with content', () => {
      const value = '- First item'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '- First item\n- ',
        newCursorPos: 15
      })
    })

    test('removes empty bullet list item', () => {
      const value = '- First item\n- '
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'remove',
        newValue: '- First item\n',
        newCursorPos: 13
      })
    })

    test('handles bullet list with indentation', () => {
      const value = '    * Nested item'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '    * Nested item\n    * ',
        newCursorPos: 24
      })
    })
  })

  describe('numbered lists', () => {
    test('continues numbered list with content', () => {
      const value = '1. First item'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '1. First item\n2. ',
        newCursorPos: 17
      })
    })

    test('removes empty numbered list item', () => {
      const value = '1. First item\n2. '
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'remove',
        newValue: '1. First item\n',
        newCursorPos: 14
      })
    })

    test('continues numbered list with higher numbers', () => {
      const value = '42. Some item'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '42. Some item\n43. ',
        newCursorPos: 18
      })
    })

    test('handles numbered list with indentation', () => {
      const value = '  3. Indented numbered'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '  3. Indented numbered\n  4. ',
        newCursorPos: 28
      })
    })
  })

  describe('non-list content', () => {
    test('returns null for plain text', () => {
      const value = 'Just some text'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toBeNull()
    })

    test('returns null for empty string', () => {
      const value = ''
      const cursorPos = 0
      const result = handleEnterKey(value, cursorPos)

      expect(result).toBeNull()
    })

    test('returns null for heading', () => {
      const value = '# My Heading'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toBeNull()
    })
  })

  describe('edge cases', () => {
    test('handles cursor in middle of document', () => {
      const value = '- First item\nSome text after'
      const cursorPos = 12 // End of "- First item"
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: '- First item\n- \nSome text after',
        newCursorPos: 15
      })
    })

    test('handles multiple existing lines', () => {
      const value = 'Header\n\n- Item 1\n- Item 2'
      const cursorPos = value.length
      const result = handleEnterKey(value, cursorPos)

      expect(result).toEqual({
        type: 'continue',
        newValue: 'Header\n\n- Item 1\n- Item 2\n- ',
        newCursorPos: 28
      })
    })
  })
})
