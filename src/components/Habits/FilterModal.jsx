import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CATEGORY_OPTIONS } from '../../utils/habitCategories'

/**
 * FilterModal - Filter habits by category, status, and other criteria
 * TAB-HAB-04: Filter by Type, Category, Tags, Status
 */
function FilterModal({ filters, onApply, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters || {})

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters = {
      category: null,
      status: null
    }
    setLocalFilters(resetFilters)
    onApply(resetFilters)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      role='presentation'
    >
      <div
        className='card-b'
        style={{
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        role='dialog'
        aria-modal='true'
        aria-labelledby='filter-modal-title'
      >
        <strong id='filter-modal-title' style={{ fontSize: '1.25rem', display: 'block', marginBottom: '1rem' }}>
          Filter Habits
        </strong>

        {/* Category Filter */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='filter-category' style={{ display: 'block', marginBottom: '0.5rem' }}>
            Category
          </label>
          <select
            id='filter-category'
            value={localFilters.category || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value || null })}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              background: '#2a2e47',
              border: '1px solid #3d4263',
              color: '#eef0ff'
            }}
          >
            <option value=''>All Categories</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='filter-status' style={{ display: 'block', marginBottom: '0.5rem' }}>
            Status
          </label>
          <select
            id='filter-status'
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value || null })}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              background: '#2a2e47',
              border: '1px solid #3d4263',
              color: '#eef0ff'
            }}
          >
            <option value=''>All Habits</option>
            <option value='active'>Active</option>
            <option value='paused'>Paused</option>
            <option value='completed-today'>Completed Today</option>
            <option value='incomplete-today'>Not Done Today</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            className='btn-outline'
            onClick={handleReset}
            style={{ padding: '0.5rem 1rem' }}
          >
            Reset
          </button>
          <button
            className='btn-outline'
            onClick={onClose}
            style={{ padding: '0.5rem 1rem' }}
          >
            Cancel
          </button>
          <button
            className='btn-primary'
            onClick={handleApply}
            style={{ padding: '0.5rem 1rem' }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

FilterModal.propTypes = {
  filters: PropTypes.object,
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

FilterModal.defaultProps = {
  filters: {}
}

export default FilterModal
