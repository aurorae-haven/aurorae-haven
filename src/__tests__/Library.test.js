/**
 * Tests for Library page component
 * Tests template creation and list updates
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Library from '../pages/Library'
import * as templatesManager from '../utils/templatesManager'
import * as indexedDBManager from '../utils/indexedDBManager'
import * as predefinedTemplates from '../utils/predefinedTemplates'

// Mock the modules
jest.mock('../utils/templatesManager')
jest.mock('../utils/indexedDBManager')
jest.mock('../utils/predefinedTemplates')
jest.mock('../utils/templateInstantiation')
jest.mock('../components/Library/TemplateCard', () => {
  return function MockTemplateCard({ template }) {
    return <div data-testid={`template-${template.id}`}>{template.title}</div>
  }
})
jest.mock('../components/Library/TemplateEditor', () => {
  return function MockTemplateEditor({ onSave, onClose, template }) {
    return (
      <div data-testid='template-editor'>
        <button
          data-testid='save-template'
          onClick={() =>
            onSave({
              type: 'task',
              title: template ? 'Updated Template' : 'New Template',
              tags: [],
              category: 'Test',
              quadrant: 'urgent_important'
            })
          }
        >
          Save
        </button>
        <button data-testid='close-editor' onClick={onClose}>
          Close
        </button>
      </div>
    )
  }
})
jest.mock('../components/Library/TemplateToolbar', () => {
  return function MockTemplateToolbar({ onNewTemplate }) {
    return (
      <div data-testid='template-toolbar'>
        <button data-testid='new-template' onClick={onNewTemplate}>
          New Template
        </button>
      </div>
    )
  }
})
jest.mock('../components/Library/FilterModal', () => {
  return function MockFilterModal() {
    return <div data-testid='filter-modal'>Filter Modal</div>
  }
})
jest.mock('../components/common/ConfirmModal', () => {
  return function MockConfirmModal() {
    return <div data-testid='confirm-modal'>Confirm Modal</div>
  }
})

describe('Library Page', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Default mock implementations
    indexedDBManager.isIndexedDBAvailable.mockReturnValue(true)
    predefinedTemplates.arePredefinedTemplatesSeeded.mockResolvedValue(true)
    predefinedTemplates.seedPredefinedTemplates.mockResolvedValue({
      added: 0,
      skipped: 0
    })
    templatesManager.getAllTemplates.mockResolvedValue([])
    templatesManager.saveTemplate.mockResolvedValue('new-template-id')
    templatesManager.filterTemplates.mockImplementation((templates) => templates)
    templatesManager.sortTemplates.mockImplementation((templates) => templates)
  })

  test('should display newly created template in the list', async () => {
    // Initial state: no templates
    templatesManager.getAllTemplates.mockResolvedValueOnce([])

    // After saving: one template exists
    const newTemplate = {
      id: 'new-template-id',
      type: 'task',
      title: 'New Template',
      tags: [],
      category: 'Test',
      quadrant: 'urgent_important',
      createdAt: new Date().toISOString()
    }

    // First call returns empty array, second call (after save) returns the new template
    templatesManager.getAllTemplates
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([newTemplate])

    const { rerender } = render(<Library />)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your template library...')).not.toBeInTheDocument()
    })

    // Verify empty state is shown
    expect(screen.getByText('No templates found.')).toBeInTheDocument()

    // Click New Template button
    const newTemplateButton = screen.getByTestId('new-template')
    fireEvent.click(newTemplateButton)

    // Verify editor is shown
    await waitFor(() => {
      expect(screen.getByTestId('template-editor')).toBeInTheDocument()
    })

    // Click Save button
    const saveButton = screen.getByTestId('save-template')
    fireEvent.click(saveButton)

    // Wait for save to complete and templates to reload
    await waitFor(() => {
      expect(templatesManager.saveTemplate).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(templatesManager.getAllTemplates).toHaveBeenCalledTimes(2)
    })

    // Verify the new template appears in the list
    await waitFor(() => {
      expect(screen.getByText('New Template')).toBeInTheDocument()
    })

    // Verify empty state is no longer shown
    expect(screen.queryByText('No templates found.')).not.toBeInTheDocument()
  })

  test('should update template list after creating a template', async () => {
    const existingTemplate = {
      id: 'existing-id',
      type: 'task',
      title: 'Existing Template',
      tags: [],
      category: 'Test',
      quadrant: 'urgent_important',
      createdAt: new Date().toISOString()
    }

    const newTemplate = {
      id: 'new-template-id',
      type: 'task',
      title: 'New Template',
      tags: [],
      category: 'Test',
      quadrant: 'urgent_important',
      createdAt: new Date().toISOString()
    }

    // First call returns one template, second call returns two templates
    templatesManager.getAllTemplates
      .mockResolvedValueOnce([existingTemplate])
      .mockResolvedValueOnce([existingTemplate, newTemplate])

    render(<Library />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Existing Template')).toBeInTheDocument()
    })

    // Click New Template button
    const newTemplateButton = screen.getByTestId('new-template')
    fireEvent.click(newTemplateButton)

    // Click Save button
    const saveButton = await screen.findByTestId('save-template')
    fireEvent.click(saveButton)

    // Wait for save to complete
    await waitFor(() => {
      expect(templatesManager.saveTemplate).toHaveBeenCalled()
    })

    // Verify both templates are shown
    await waitFor(() => {
      expect(screen.getByText('Existing Template')).toBeInTheDocument()
      expect(screen.getByText('New Template')).toBeInTheDocument()
    })
  })
})
