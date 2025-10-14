/**
 * Tests for TemplateEditor component
 * Tests that numeric fields are properly converted
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TemplateEditor from '../components/Library/TemplateEditor'

describe('TemplateEditor', () => {
  test('should convert numeric string fields to numbers when saving task template', async () => {
    const onSave = jest.fn()
    const onClose = jest.fn()

    render(<TemplateEditor template={null} onSave={onSave} onClose={onClose} />)

    // Fill in the form
    const titleInput = screen.getByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })

    const categoryInput = screen.getByLabelText(/category/i)
    fireEvent.change(categoryInput, { target: { value: 'Work' } })

    const dueOffsetInput = screen.getByLabelText(/due date offset/i)
    fireEvent.change(dueOffsetInput, { target: { value: '7' } })

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: /create template/i
    })
    fireEvent.click(submitButton)

    // Verify onSave was called with numeric dueOffset
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'task',
          title: 'Test Task',
          category: 'Work',
          dueOffset: 7 // Should be a number, not string "7"
        })
      )
    })
  })

  test('should convert estimatedDuration to number when saving routine template', async () => {
    const onSave = jest.fn()
    const onClose = jest.fn()

    render(<TemplateEditor template={null} onSave={onSave} onClose={onClose} />)

    // Select routine type
    const typeSelect = screen.getByLabelText(/type/i)
    fireEvent.change(typeSelect, { target: { value: 'routine' } })

    // Fill in title
    const titleInput = screen.getByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: 'Morning Routine' } })

    // Add a step
    const stepLabelInput = screen.getByPlaceholderText('Step label')
    fireEvent.change(stepLabelInput, { target: { value: 'Wake up' } })

    const stepDurationInput = screen.getByPlaceholderText('Duration (sec)')
    fireEvent.change(stepDurationInput, { target: { value: '60' } })

    const addStepButton = screen.getByRole('button', { name: /add step/i })
    fireEvent.click(addStepButton)

    // Fill in estimated duration
    const estimatedDurationInput = screen.getByLabelText(/estimated duration/i)
    fireEvent.change(estimatedDurationInput, { target: { value: '300' } })

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: /create template/i
    })
    fireEvent.click(submitButton)

    // Verify onSave was called with numeric estimatedDuration
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'routine',
          title: 'Morning Routine',
          estimatedDuration: 300, // Should be a number, not string "300"
          steps: [
            {
              label: 'Wake up',
              duration: 60,
              description: ''
            }
          ]
        })
      )
    })
  })

  test('should set dueOffset to null when empty', async () => {
    const onSave = jest.fn()
    const onClose = jest.fn()

    render(<TemplateEditor template={null} onSave={onSave} onClose={onClose} />)

    // Fill in only title
    const titleInput = screen.getByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })

    // Leave dueOffset empty

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: /create template/i
    })
    fireEvent.click(submitButton)

    // Verify onSave was called with null dueOffset
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          dueOffset: null // Should be null, not empty string ""
        })
      )
    })
  })
})
