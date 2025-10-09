import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

/**
 * Component for displaying and editing a single task
 */
function TaskItem({
  task,
  quadrant,
  isEditing,
  editText,
  onToggle,
  onEdit,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDragStart
}) {
  const editInputRef = useRef(null)

  // Focus edit input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [isEditing])

  const handleKeyDown = (e) => {
    // Keyboard shortcuts for moving tasks between quadrants
    if (e.altKey && !isEditing) {
      e.preventDefault()
      switch (e.key) {
        case 'ArrowUp':
          // Move to previous quadrant
          onDragStart(quadrant, task)
          // Trigger drop in previous quadrant - handled by parent
          break
        case 'ArrowDown':
          // Move to next quadrant
          onDragStart(quadrant, task)
          break
        case 'ArrowLeft':
        case 'ArrowRight':
          // Move to adjacent quadrant
          onDragStart(quadrant, task)
          break
        default:
          break
      }
    }
  }

  return (
    <div
      className={`task-item ${task.completed ? 'completed' : ''}`}
      draggable={!isEditing}
      onDragStart={() => onDragStart(quadrant, task)}
      onKeyDown={handleKeyDown}
      tabIndex={isEditing ? -1 : 0}
      role="button"
      aria-label={`Task: ${task.text}. Press Alt + Arrow keys to move between quadrants.`}
    >
      <input
        type='checkbox'
        checked={task.completed}
        onChange={() => onToggle(quadrant, task.id)}
        disabled={isEditing}
        aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      {isEditing ? (
        <input
          ref={editInputRef}
          type='text'
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSaveEdit()
            } else if (e.key === 'Escape') {
              onCancelEdit()
            }
          }}
          className='task-edit-input'
          aria-label='Edit task text'
        />
      ) : (
        <span className='task-text' onDoubleClick={() => onEdit(quadrant, task)}>
          {task.text}
        </span>
      )}
      <div className='task-actions'>
        {isEditing ? (
          <>
            <button
              className='btn-save'
              onClick={onSaveEdit}
              aria-label='Save task'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <polyline points='20 6 9 17 4 12' />
              </svg>
            </button>
            <button
              className='btn-cancel'
              onClick={onCancelEdit}
              aria-label='Cancel editing'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              className='btn-edit'
              onClick={() => onEdit(quadrant, task)}
              aria-label={`Edit task "${task.text}"`}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
              </svg>
            </button>
            <button
              className='btn-delete'
              onClick={() => onDelete(quadrant, task.id)}
              aria-label={`Delete task "${task.text}"`}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <polyline points='3 6 5 6 21 6' />
                <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired
  }).isRequired,
  quadrant: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  editText: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onEditTextChange: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired
}

export default TaskItem
