/**
 * Integration tests for BrainDump component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BrainDump from '../pages/BrainDump.jsx'

// Mock marked and DOMPurify
jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((content) => `<p>${content}</p>`)
  }
}))

jest.mock('dompurify', () => {
  const sanitize = jest.fn((html) => html)
  return {
    __esModule: true,
    default: {
      sanitize
    }
  }
})

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('BrainDump Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Basic functionality', () => {
    test('renders BrainDump component', () => {
      render(<BrainDump />)
      expect(
        screen.getByPlaceholderText('Start typing your thoughts...')
      ).toBeInTheDocument()
    })

    test('loads saved content from localStorage on mount', () => {
      const mockEntries = [
        {
          id: 'test-id',
          title: 'Test Note',
          content: 'Test content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )
      expect(textarea).toHaveValue('Test content')
    })

    test('migrates old single-note content to new structure', () => {
      localStorage.setItem('brainDumpContent', 'Old content')
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )
      expect(textarea).toHaveValue('Old content')

      // Check that migration created brainDumpEntries
      const entries = JSON.parse(
        localStorage.getItem('brainDumpEntries') || '[]'
      )
      expect(entries.length).toBe(1)
      expect(entries[0].content).toBe('Old content')
      expect(entries[0].title).toBe('Migrated Note')
    })

    test('saves content to localStorage on change', async () => {
      const mockEntries = [
        {
          id: 'test-id',
          title: 'Test Note',
          content: 'Initial content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))

      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )
      fireEvent.change(textarea, { target: { value: 'New content' } })

      // Wait for debounced autosave (500ms + buffer)
      await waitFor(
        () => {
          const entries = JSON.parse(
            localStorage.getItem('brainDumpEntries') || '[]'
          )
          expect(entries[0].content).toBe('New content')
        },
        { timeout: 1000 }
      )
    })

    test('renders markdown preview', async () => {
      const mockEntries = [
        {
          id: 'test-id',
          title: 'Test Note',
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))

      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )
      fireEvent.change(textarea, { target: { value: '# Heading' } })

      await waitFor(() => {
        const preview = document.getElementById('preview')
        // With our mock, marked.parse wraps content in <p> tags
        expect(preview.innerHTML).toContain('<p>')
        expect(preview.innerHTML).toContain('# Heading')
      })
    })
  })

  describe('Auto-list continuation', () => {
    test('continues task list on Enter', async () => {
      const mockEntries = [
        {
          id: 'test-id',
          title: 'Test Note',
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))

      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      // Type task list item
      fireEvent.change(textarea, { target: { value: '- [ ] First task' } })

      // Position cursor at end
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      // Press Enter
      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('- [ ] First task\n- [ ] ')
      })
    })

    // Helper to set up a note for list continuation tests
    const setupNoteForTest = () => {
      const mockEntries = [
        {
          id: 'test-id',
          title: 'Test Note',
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))
    }

    test('removes empty task list item on second Enter', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      // Set content with empty task list item
      fireEvent.change(textarea, {
        target: { value: '- [ ] First task\n- [ ] ' }
      })

      // Position cursor at end
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      // Press Enter
      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('- [ ] First task\n')
      })
    })

    test('continues bullet list on Enter', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: '- First item' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('- First item\n- ')
      })
    })

    test('removes empty bullet list item on second Enter', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: '- First item\n- ' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('- First item\n')
      })
    })

    test('continues numbered list on Enter', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: '1. First item' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('1. First item\n2. ')
      })
    })

    test('removes empty numbered list item on second Enter', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: '1. First item\n2. ' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('1. First item\n')
      })
    })

    test('handles task list with asterisk marker', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, {
        target: { value: '* [ ] Task with asterisk' }
      })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('* [ ] Task with asterisk\n* [ ] ')
      })
    })

    test('handles indented lists', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: '  - Indented item' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(textarea.value).toBe('  - Indented item\n  - ')
      })
    })

    test('does not intercept Enter with Shift key', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: '- Item' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      // Press Shift+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

      // Value should not be changed by our handler
      expect(textarea.value).toBe('- Item')
    })

    test('does not intercept Enter with Ctrl key', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: '- Item' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      // Press Ctrl+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

      // Value should not be changed by our handler
      expect(textarea.value).toBe('- Item')
    })

    test('does not intercept Enter on non-list content', async () => {
      setupNoteForTest()
      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      fireEvent.change(textarea, { target: { value: 'Regular text' } })
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length

      fireEvent.keyDown(textarea, { key: 'Enter' })

      // Value should not be changed by our handler
      expect(textarea.value).toBe('Regular text')
    })
  })

  describe('Delete functionality', () => {
    test('deletes note on delete button click with confirmation', () => {
      window.confirm = jest.fn(() => true)

      const mockEntries = [
        {
          id: 'test-id',
          title: 'Test Note',
          content: 'Some content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))

      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )
      expect(textarea).toHaveValue('Some content')

      // Find and click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      expect(textarea).toBeDisabled()
      const entries = JSON.parse(
        localStorage.getItem('brainDumpEntries') || '[]'
      )
      expect(entries.length).toBe(0)
    })

    test('does not delete note if user cancels confirmation', () => {
      window.confirm = jest.fn(() => false)

      const mockEntries = [
        {
          id: 'test-id',
          title: 'Test Note',
          content: 'Some content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))

      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      expect(textarea).toHaveValue('Some content')
      const entries = JSON.parse(
        localStorage.getItem('brainDumpEntries') || '[]'
      )
      expect(entries.length).toBe(1)
    })
  })

  describe('Multi-note functionality', () => {
    test('creates new note on new button click', () => {
      render(<BrainDump />)

      const newButton = screen.getByRole('button', { name: /new note/i })
      fireEvent.click(newButton)

      const entries = JSON.parse(
        localStorage.getItem('brainDumpEntries') || '[]'
      )
      expect(entries.length).toBe(1)
      expect(entries[0].title).toBe('Untitled Note')
    })

    test('switches between notes', () => {
      const mockEntries = [
        {
          id: 'test-id-1',
          title: 'First Note',
          content: 'First content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'test-id-2',
          title: 'Second Note',
          content: 'Second content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))

      render(<BrainDump />)
      const textarea = screen.getByPlaceholderText(
        'Start typing your thoughts...'
      )

      // Should load first note by default
      expect(textarea).toHaveValue('First content')

      // Click second note in list
      const secondNoteItem = screen.getByText('Second Note')
      fireEvent.click(secondNoteItem)

      // Should load second note
      expect(textarea).toHaveValue('Second content')
    })
  })

  describe('Export functionality', () => {
    test('exports content as markdown file with new filename format', () => {
      // Mock URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock')
      global.URL.revokeObjectURL = jest.fn()

      // Mock createElement to spy on the download link
      const originalCreateElement = document.createElement
      const mockClick = jest.fn()
      let downloadFilename = ''
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') {
          const element = originalCreateElement.call(document, tag)
          element.click = mockClick
          Object.defineProperty(element, 'download', {
            set: (value) => {
              downloadFilename = value
            },
            get: () => downloadFilename
          })
          return element
        }
        return originalCreateElement.call(document, tag)
      })

      const mockEntries = [
        {
          id: 'test-id',
          title: 'My Test Note',
          content: 'Export this content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('brainDumpEntries', JSON.stringify(mockEntries))

      render(<BrainDump />)

      // Find and click export button
      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      expect(mockClick).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()

      // Check filename format: braindump_title_YYYYMMDD_HHmm.md
      expect(downloadFilename).toMatch(
        /^braindump_my_test_note_\d{8}_\d{4}\.md$/
      )

      // Restore mocks
      document.createElement = originalCreateElement
    })

    test('does not export when no note is selected', () => {
      render(<BrainDump />)

      const exportButton = screen.getByRole('button', { name: /export/i })
      expect(exportButton).toBeDisabled()
    })
  })

  describe('Import functionality', () => {
    test('imports markdown file as new note', async () => {
      render(<BrainDump />)

      const importInput = screen.getByLabelText('Import markdown file')

      const fileContent = '# Imported Note\n\nThis is imported content.'
      const file = new File(
        [fileContent],
        'braindump_my_note_20250115_1430.md',
        {
          type: 'text/markdown'
        }
      )

      // Mock FileReader
      const mockFileReader = {
        readAsText: jest.fn(),
        onload: null,
        result: fileContent
      }

      global.FileReader = jest.fn(() => mockFileReader)

      fireEvent.change(importInput, { target: { files: [file] } })

      // Simulate file read completion
      mockFileReader.onload({ target: { result: fileContent } })

      await waitFor(() => {
        const entries = JSON.parse(
          localStorage.getItem('brainDumpEntries') || '[]'
        )
        expect(entries.length).toBe(1)
        expect(entries[0].title).toBe('my note')
        expect(entries[0].content).toBe(fileContent)
      })
    })

    test('extracts title from filename correctly', async () => {
      render(<BrainDump />)

      const importInput = screen.getByLabelText('Import markdown file')

      const fileContent = 'Content'
      const file = new File([fileContent], 'test_note_name.md', {
        type: 'text/markdown'
      })

      const mockFileReader = {
        readAsText: jest.fn(),
        onload: null,
        result: fileContent
      }

      global.FileReader = jest.fn(() => mockFileReader)

      fireEvent.change(importInput, { target: { files: [file] } })
      mockFileReader.onload({ target: { result: fileContent } })

      await waitFor(() => {
        const entries = JSON.parse(
          localStorage.getItem('brainDumpEntries') || '[]'
        )
        expect(entries[0].title).toBe('test note name')
      })
    })
  })
})
