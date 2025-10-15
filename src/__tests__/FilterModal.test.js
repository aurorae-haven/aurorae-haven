import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FilterModal from '../components/Habits/FilterModal'

describe('FilterModal Component', () => {
  const mockOnApply = jest.fn()
  const mockOnClose = jest.fn()
  
  const defaultFilters = {
    categories: [],
    status: 'all'
  }

  beforeEach(() => {
    mockOnApply.mockClear()
    mockOnClose.mockClear()
  })

  test('renders filter modal', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    expect(screen.getByText(/Filter Habits/i)).toBeInTheDocument()
  })

  test('does not render when closed', () => {
    render(
      <FilterModal 
        isOpen={false}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    expect(screen.queryByText(/Filter Habits/i)).not.toBeInTheDocument()
  })

  test('displays all category options', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    const categories = ['Blue', 'Violet', 'Green', 'Yellow', 'Red', 'Orange', 'Pink', 'Teal', 'Purple']
    categories.forEach(category => {
      expect(screen.getByLabelText(new RegExp(category, 'i'))).toBeInTheDocument()
    })
  })

  test('displays status filter options', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    expect(screen.getByLabelText(/All/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Active/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Paused/i)).toBeInTheDocument()
  })

  test('selects category when checkbox is clicked', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    const blueCheckbox = screen.getByLabelText(/Blue/i)
    fireEvent.click(blueCheckbox)
    
    expect(blueCheckbox).toBeChecked()
  })

  test('calls onApply with selected filters', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    // Select blue category
    fireEvent.click(screen.getByLabelText(/Blue/i))
    
    // Select active status
    fireEvent.click(screen.getByLabelText(/Active/i))
    
    // Apply
    fireEvent.click(screen.getByText(/Apply/i))
    
    expect(mockOnApply).toHaveBeenCalledWith({
      categories: ['blue'],
      status: 'active'
    })
  })

  test('resets filters when Reset button is clicked', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    // Select some filters
    fireEvent.click(screen.getByLabelText(/Blue/i))
    fireEvent.click(screen.getByLabelText(/Violet/i))
    
    // Reset
    fireEvent.click(screen.getByText(/Reset/i))
    
    // Checkboxes should be unchecked
    expect(screen.getByLabelText(/Blue/i)).not.toBeChecked()
    expect(screen.getByLabelText(/Violet/i)).not.toBeChecked()
  })

  test('closes modal when Cancel button is clicked', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    fireEvent.click(screen.getByText(/Cancel/i))
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('closes modal on Escape key', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('loads current filters on mount', () => {
    const currentFilters = {
      categories: ['blue', 'violet'],
      status: 'active'
    }
    
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={currentFilters}
      />
    )
    
    expect(screen.getByLabelText(/Blue/i)).toBeChecked()
    expect(screen.getByLabelText(/Violet/i)).toBeChecked()
    expect(screen.getByLabelText(/Active/i)).toBeChecked()
  })

  test('allows multiple category selections', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    fireEvent.click(screen.getByLabelText(/Blue/i))
    fireEvent.click(screen.getByLabelText(/Violet/i))
    fireEvent.click(screen.getByLabelText(/Green/i))
    
    expect(screen.getByLabelText(/Blue/i)).toBeChecked()
    expect(screen.getByLabelText(/Violet/i)).toBeChecked()
    expect(screen.getByLabelText(/Green/i)).toBeChecked()
  })

  test('has proper ARIA labels', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-label')
  })

  test('traps focus within modal', () => {
    render(
      <FilterModal 
        isOpen={true}
        onApply={mockOnApply}
        onClose={mockOnClose}
        currentFilters={defaultFilters}
      />
    )
    
    const modal = screen.getByRole('dialog')
    const focusableElements = modal.querySelectorAll('button, input[type="checkbox"], input[type="radio"]')
    
    expect(focusableElements.length).toBeGreaterThan(0)
  })
})
