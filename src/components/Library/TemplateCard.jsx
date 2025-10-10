/**
 * TemplateCard Component
 * Displays a single template card with actions
 * TAB-LIB-08, TAB-LIB-09, TAB-LIB-10
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'

function TemplateCard({ template, viewMode, onUse, onEdit, onDelete, onDuplicate }) {
  const [showActions, setShowActions] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatDuration = (seconds) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const handleExport = async () => {
    try {
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        templates: [template]
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template-${template.title.replace(/\s+/g, '-')}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting template:', error)
    }
  }

  return (
    <div
      className={`template-card ${template.pinned ? 'pinned' : ''}`}
      role={viewMode === 'grid' ? 'gridcell' : 'listitem'}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Template header */}
      <div className='template-header'>
        <div className='template-icon'>
          {template.type === 'task' ? (
            <svg className='icon icon-task' viewBox='0 0 24 24' aria-hidden='true'>
              <rect x='4' y='4' width='16' height='16' rx='2' fill='none' stroke='currentColor' strokeWidth='2' />
              <path d='M8 12l2 2 4-4' stroke='currentColor' strokeWidth='2' fill='none' />
            </svg>
          ) : (
            <svg className='icon icon-routine' viewBox='0 0 24 24' aria-hidden='true'>
              <circle cx='12' cy='12' r='8' fill='none' stroke='currentColor' strokeWidth='2' />
              <path d='M12 8v4l3 2' stroke='currentColor' strokeWidth='2' fill='none' />
            </svg>
          )}
        </div>
        <div className='template-title-area'>
          <h3 className='template-title'>{template.title}</h3>
          <span className='template-type small'>{template.type}</span>
        </div>
      </div>

      {/* Template metadata */}
      <div className='template-meta'>
        {template.tags && template.tags.length > 0 && (
          <div className='template-tags'>
            {template.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className='tag-chip'>
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className='tag-chip'>+{template.tags.length - 3}</span>
            )}
          </div>
        )}

        {template.type === 'routine' && template.estimatedDuration && (
          <div className='template-duration small'>
            ⏱️ {formatDuration(template.estimatedDuration)}
          </div>
        )}

        <div className='template-dates small dim'>
          <span>Last used: {formatDate(template.lastUsed)}</span>
        </div>
      </div>

      {/* Template actions */}
      <div className={`template-actions ${showActions ? 'visible' : ''}`}>
        <button
          className='btn btn-sm'
          onClick={onUse}
          aria-label='Use template'
          title='Use template'
        >
          Use
        </button>
        <button
          className='btn btn-sm'
          onClick={onEdit}
          aria-label='Edit template'
          title='Edit template'
        >
          Edit
        </button>
        <button
          className='btn btn-sm'
          onClick={onDuplicate}
          aria-label='Duplicate template'
          title='Duplicate template'
        >
          Duplicate
        </button>
        <button
          className='btn btn-sm btn-danger'
          onClick={onDelete}
          aria-label='Delete template'
          title='Delete template'
        >
          Delete
        </button>
        <button
          className='btn btn-sm'
          onClick={handleExport}
          aria-label='Export template'
          title='Export template'
        >
          ⋯
        </button>
      </div>

      {/* Version badge */}
      <div className='template-version small dim'>
        v{template.version || 1}
      </div>
    </div>
  )
}

TemplateCard.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['task', 'routine']).isRequired,
    title: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    version: PropTypes.number,
    lastUsed: PropTypes.string,
    estimatedDuration: PropTypes.number,
    pinned: PropTypes.bool
  }).isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
  onUse: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired
}

export default TemplateCard
