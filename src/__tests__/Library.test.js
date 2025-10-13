import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Library from '../pages/Library'
import * as indexedDBManager from '../utils/indexedDBManager'
import * as templatesManager from '../utils/templatesManager'
import * as predefinedTemplates from '../utils/predefinedTemplates'

// Mock IndexedDB and templates
jest.mock('../utils/indexedDBManager')
jest.mock('../utils/templatesManager')
jest.mock('../utils/predefinedTemplates')

describe('Library Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    indexedDBManager.isIndexedDBAvailable.mockReturnValue(true)
    // Mock predefined templates to avoid seeding during tests
    predefinedTemplates.arePredefinedTemplatesSeeded.mockResolvedValue(true)
    predefinedTemplates.seedPredefinedTemplates.mockResolvedValue({
      added: 0,
      skipped: 0,
      errors: []
    })
  })

  test('renders Library component with title', async () => {
    templatesManager.getAllTemplates.mockResolvedValue([])

    render(<Library />)

    await waitFor(() => {
      expect(screen.getByText('Library')).toBeInTheDocument()
    })
  })

  test('displays loading state initially', () => {
    templatesManager.getAllTemplates.mockImplementation(
      () => new Promise(() => {})
    )

    render(<Library />)
    expect(
      screen.getByText('Loading your template library...')
    ).toBeInTheDocument()
  })

  test('shows message when IndexedDB is not available', async () => {
    indexedDBManager.isIndexedDBAvailable.mockReturnValue(false)

    render(<Library />)

    await waitFor(() => {
      expect(
        screen.getByText(/Template library requires IndexedDB support/)
      ).toBeInTheDocument()
    })
  })

  test('displays empty state when no templates exist', async () => {
    templatesManager.getAllTemplates.mockResolvedValue([])
    templatesManager.filterTemplates.mockReturnValue([])
    templatesManager.sortTemplates.mockReturnValue([])

    render(<Library />)

    await waitFor(() => {
      expect(screen.getByText('No templates found.')).toBeInTheDocument()
      expect(
        screen.getByText('Create your first template to get started!')
      ).toBeInTheDocument()
    })
  })

  test('displays templates in grid view', async () => {
    const mockTemplates = [
      {
        id: '1',
        type: 'task',
        title: 'Test Task Template',
        tags: ['work'],
        version: 1,
        lastUsed: null,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        type: 'routine',
        title: 'Morning Routine',
        tags: ['health'],
        version: 1,
        lastUsed: null,
        estimatedDuration: 600,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]

    templatesManager.getAllTemplates.mockResolvedValue(mockTemplates)
    templatesManager.filterTemplates.mockImplementation(
      (templates) => templates
    )
    templatesManager.sortTemplates.mockImplementation((templates) => templates)

    render(<Library />)

    await waitFor(() => {
      expect(screen.getByText('Test Task Template')).toBeInTheDocument()
      expect(screen.getByText('Morning Routine')).toBeInTheDocument()
    })
  })

  test('opens template editor when New Template button is clicked', async () => {
    templatesManager.getAllTemplates.mockResolvedValue([])
    templatesManager.filterTemplates.mockReturnValue([])
    templatesManager.sortTemplates.mockReturnValue([])

    render(<Library />)

    await waitFor(() => {
      const newButton = screen.getByRole('button', {
        name: /Create new template/i
      })
      fireEvent.click(newButton)
    })

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /New Template/i })
      ).toBeInTheDocument()
    })
  })

  test('filters templates by search query', async () => {
    const mockTemplates = [
      {
        id: '1',
        type: 'task',
        title: 'Work Task',
        tags: [],
        version: 1,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        type: 'task',
        title: 'Personal Task',
        tags: [],
        version: 1,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]

    templatesManager.getAllTemplates.mockResolvedValue(mockTemplates)
    templatesManager.filterTemplates.mockImplementation(
      (templates, filters) => {
        if (filters.query) {
          return templates.filter((t) =>
            t.title.toLowerCase().includes(filters.query.toLowerCase())
          )
        }
        return templates
      }
    )
    templatesManager.sortTemplates.mockImplementation((templates) => templates)

    render(<Library />)

    await waitFor(() => {
      expect(screen.getByText('Work Task')).toBeInTheDocument()
      expect(screen.getByText('Personal Task')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search templates...')
    fireEvent.change(searchInput, { target: { value: 'Work' } })

    await waitFor(() => {
      expect(templatesManager.filterTemplates).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ query: 'Work' })
      )
    })
  })

  test('switches between grid and list view', async () => {
    templatesManager.getAllTemplates.mockResolvedValue([])

    render(<Library />)

    await waitFor(() => {
      const listButton = screen.getByRole('button', { name: /List view/i })
      fireEvent.click(listButton)
    })

    // Check that the view mode changes (aria-pressed attribute)
    await waitFor(() => {
      const listButton = screen.getByRole('button', { name: /List view/i })
      expect(listButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  test('deletes a template with confirmation', async () => {
    const mockTemplate = {
      id: '1',
      type: 'task',
      title: 'Test Template',
      tags: [],
      version: 1,
      createdAt: '2024-01-01T00:00:00Z'
    }

    templatesManager.getAllTemplates
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([])
    templatesManager.filterTemplates.mockImplementation(
      (templates) => templates
    )
    templatesManager.sortTemplates.mockImplementation((templates) => templates)
    templatesManager.deleteTemplate.mockResolvedValue()

    render(<Library />)

    await waitFor(() => {
      expect(screen.getByText('Test Template')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', {
      name: /Delete template/i
    })
    fireEvent.click(deleteButton)

    // Wait for confirmation modal to appear
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Template')).toBeInTheDocument()
    })

    // Click the confirm button in the modal
    const confirmButton = screen.getByRole('button', { name: /^Delete$/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(templatesManager.deleteTemplate).toHaveBeenCalledWith('1')
    })
  })

  test('exports all templates', async () => {
    templatesManager.getAllTemplates.mockResolvedValue([])
    templatesManager.exportTemplates.mockResolvedValue({
      version: '1.0',
      exportDate: '2024-01-01T00:00:00Z',
      templates: []
    })

    // Mock URL.createObjectURL and related APIs
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
    global.URL.revokeObjectURL = jest.fn()
    const mockClick = jest.fn()
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick
        }
      }
      return originalCreateElement(tag)
    })

    render(<Library />)

    await waitFor(() => {
      const exportButton = screen.getByRole('button', {
        name: /Export all templates/i
      })
      fireEvent.click(exportButton)
    })

    await waitFor(() => {
      expect(templatesManager.exportTemplates).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })

    // Restore original
    document.createElement = originalCreateElement
  })

  test('handles import file selection', async () => {
    templatesManager.getAllTemplates
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: '1',
          type: 'task',
          title: 'Imported Template',
          tags: [],
          version: 1,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ])
    templatesManager.filterTemplates.mockImplementation(
      (templates) => templates
    )
    templatesManager.sortTemplates.mockImplementation((templates) => templates)
    templatesManager.importTemplates.mockResolvedValue({
      imported: 1,
      skipped: 0,
      errors: []
    })

    render(<Library />)

    await waitFor(() => {
      const importButton = screen.getByRole('button', {
        name: /Import templates/i
      })
      expect(importButton).toBeInTheDocument()
    })

    // Note: Testing file input is complex in Jest, so we verify the button exists
    // Actual file handling would be tested in integration tests
  })

  test('applies sort order to templates', async () => {
    const mockTemplates = [
      {
        id: '1',
        type: 'task',
        title: 'B Task',
        tags: [],
        version: 1,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        type: 'task',
        title: 'A Task',
        tags: [],
        version: 1,
        createdAt: '2024-01-02T00:00:00Z'
      }
    ]

    templatesManager.getAllTemplates.mockResolvedValue(mockTemplates)
    templatesManager.filterTemplates.mockImplementation(
      (templates) => templates
    )
    templatesManager.sortTemplates.mockImplementation((templates) => templates)

    render(<Library />)

    await waitFor(() => {
      const sortSelect = screen.queryByRole('combobox', {
        name: /Sort templates/i
      })
      expect(sortSelect).toBeInTheDocument()
    })

    const sortSelect = screen.getByRole('combobox', { name: /Sort templates/i })
    fireEvent.change(sortSelect, { target: { value: 'title' } })

    await waitFor(() => {
      expect(templatesManager.sortTemplates).toHaveBeenCalled()
    })
  })
})
