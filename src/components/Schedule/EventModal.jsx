import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Modal from '../common/Modal'
import Icon from '../common/Icon'
import { getCurrentDateISO } from '../../utils/timeUtils'
import { EVENT_TYPES, VALID_EVENT_TYPES } from '../../utils/scheduleConstants'

/**
 * Modal for creating and editing schedule events
 */
function EventModal({ isOpen, onClose, onSave, eventType, initialData = null }) {
  // Validate eventType and use default if invalid
  const validatedEventType = VALID_EVENT_TYPES.includes(eventType) ? eventType : EVENT_TYPES.TASK
  
  // Log warning in development if invalid event type provided
  if (process.env.NODE_ENV === 'development' && !VALID_EVENT_TYPES.includes(eventType)) {
    console.warn(`EventModal received invalid event type: "${eventType}". Defaulting to "${EVENT_TYPES.TASK}".`)
  }
  
  const [formData, setFormData] = useState({
    title: '',
    day: getCurrentDateISO(),
    startTime: '09:00',
    endTime: '10:00',
    type: validatedEventType
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleInputRef = useRef(null)

  // Reset form when modal opens or event type changes
  useEffect(() => {
    if (isOpen) {
      const validatedType = VALID_EVENT_TYPES.includes(eventType) ? eventType : EVENT_TYPES.TASK
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          day: initialData.day || getCurrentDateISO(),
          startTime: initialData.startTime || '09:00',
          endTime: initialData.endTime || '10:00',
          type: initialData.type || validatedType
        })
      } else {
        setFormData({
          title: '',
          day: getCurrentDateISO(),
          startTime: '09:00',
          endTime: '10:00',
          type: validatedType
        })
      }
      setError('')
    }
  }, [isOpen, eventType, initialData])

  // Focus management - auto-focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus()
      // Only select text if editing existing event with title
      if (initialData && initialData.title) {
        titleInputRef.current.select()
      }
    }
  }, [isOpen, initialData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    const trimmedTitle = formData.title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return false
    }
    if (trimmedTitle.length > 200) {
      setError('Title must be 200 characters or less')
      return false
    }
    if (!formData.day) {
      setError('Date is required')
      return false
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Start and end times are required')
      return false
    }
    // Time validation: End time must be after start time
    // Note: String comparison works correctly for HH:MM format in 24-hour time (e.g., "09:00" < "17:00")
    // This assumes times are always in HH:MM 24-hour format; would need Date objects for 12-hour format
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Trim title before saving to prevent whitespace issues
      const trimmedData = {
        ...formData,
        title: formData.title.trim(),
        ...(initialData?.id ? { id: initialData.id } : {})
      }
      await onSave(trimmedData)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModalTitle = () => {
    const action = initialData ? 'Edit' : 'Add'
    const typeLabel = eventType
      ? eventType.charAt(0).toUpperCase() + eventType.slice(1)
      : 'Event'
    return `${action} ${typeLabel}`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
      <form onSubmit={handleSubmit} className='event-form'>
        {error && (
          <div className='error-message' role='alert' aria-live='assertive'>
            <Icon name='alertCircle' />
            <span>{error}</span>
          </div>
        )}

        <div className='form-group'>
          <label htmlFor='event-title'>
            Title <span className='required'>*</span>
          </label>
          <input
            id='event-title'
            type='text'
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder='Enter title'
            disabled={isSubmitting}
            required
            aria-required='true'
            maxLength={200}
            ref={titleInputRef}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='event-date'>
            Date <span className='required'>*</span>
          </label>
          <input
            id='event-date'
            type='date'
            value={formData.day}
            onChange={(e) => handleChange('day', e.target.value)}
            disabled={isSubmitting}
            required
            aria-required='true'
          />
        </div>

        <div className='form-row'>
          <div className='form-group'>
            <label htmlFor='event-start-time'>
              Start Time <span className='required'>*</span>
            </label>
            <input
              id='event-start-time'
              type='time'
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              disabled={isSubmitting}
              required
              aria-required='true'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='event-end-time'>
              End Time <span className='required'>*</span>
            </label>
            <input
              id='event-end-time'
              type='time'
              value={formData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              disabled={isSubmitting}
              required
              aria-required='true'
            />
          </div>
        </div>

        <div className='form-actions'>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={isSubmitting}
            aria-label={initialData ? 'Save changes' : 'Create event'}
          >
            {isSubmitting ? (
              <>
                <Icon name='check' />
                Saving...
              </>
            ) : (
              <>
                <Icon name='check' />
                {initialData ? 'Save' : 'Create'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

EventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  eventType: PropTypes.oneOf(VALID_EVENT_TYPES),
  initialData: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    day: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    type: PropTypes.string
  })
}

export default EventModal
