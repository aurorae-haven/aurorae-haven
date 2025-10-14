import React, { useState } from 'react'
import { generateSecureUUID } from '../utils/uuidGenerator'
import { useTasksState } from '../hooks/useTasksState'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import TaskForm from '../components/Tasks/TaskForm'
import TaskQuadrant from '../components/Tasks/TaskQuadrant'
import Icon from '../components/common/Icon'
import { URL_REVOKE_TIMEOUT_MS } from '../utils/timeConstants'
import { TASK_TEXT_MAX_LENGTH } from '../utils/validationConstants'

function Tasks() {
  const {
    tasks,
    setTasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    moveTask
  } = useTasksState()

  // Form state
  const [newTask, setNewTask] = useState('')
  const [selectedQuadrant, setSelectedQuadrant] = useState('urgent_important')

  // Editing state
  const [editingTask, setEditingTask] = useState(null)
  const [editText, setEditText] = useState('')

  // Error state
  const [errorMessage, setErrorMessage] = useState('')

  // Drag and drop
  const { handleDragStart, handleDragOver, handleDrop } =
    useDragAndDrop(moveTask)

  const showError = (message) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(''), 5000)
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    addTask(selectedQuadrant, newTask)
    setNewTask('')
  }

  const startEditTask = (quadrant, task) => {
    setEditingTask({ quadrant, taskId: task.id })
    setEditText(task.text)
  }

  const saveEditTask = () => {
    if (!editText.trim()) {
      cancelEditTask()
      return
    }

    editTask(editingTask.quadrant, editingTask.taskId, editText)
    setEditingTask(null)
    setEditText('')
  }

  const cancelEditTask = () => {
    setEditingTask(null)
    setEditText('')
  }

  const exportTasks = () => {
    try {
      const data = JSON.stringify(tasks, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      // Generate filename: tasks_YYYY-MM-DD_UUID.json
      const date = new Date().toISOString().split('T')[0]
      const uuid = generateSecureUUID()
      const filename = `tasks_${date}_${uuid}.json`

      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, URL_REVOKE_TIMEOUT_MS)
    } catch (err) {
      showError('Failed to export tasks: ' + err.message)
    }
  }

  const importTasks = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)

        // Validate imported data structure
        const requiredKeys = [
          'urgent_important',
          'not_urgent_important',
          'urgent_not_important',
          'not_urgent_not_important'
        ]

        // Check if all required quadrant keys exist
        const hasAllKeys = requiredKeys.every((key) => key in imported)
        if (!hasAllKeys) {
          showError('Invalid tasks file: Missing required quadrants.')
          return
        }

        // Validate that each quadrant is an array
        const allArrays = requiredKeys.every((key) =>
          Array.isArray(imported[key])
        )
        if (!allArrays) {
          showError('Invalid tasks file: Quadrants must be arrays.')
          return
        }

        // Helper function to validate task ID (supports both string UUIDs and legacy numeric IDs)
        const isValidTaskId = (id) => {
          return typeof id === 'number' || typeof id === 'string'
        }

        // Validate task structure in each quadrant and check for duplicates
        const seenIds = new Set()
        for (const key of requiredKeys) {
          for (const task of imported[key]) {
            if (
              !isValidTaskId(task.id) ||
              typeof task.text !== 'string' ||
              typeof task.completed !== 'boolean' ||
              typeof task.createdAt !== 'number'
            ) {
              showError('Invalid tasks file: Tasks have incorrect structure.')
              return
            }

            // Check for duplicate IDs
            if (seenIds.has(task.id)) {
              showError('Invalid tasks file: Duplicate task IDs found.')
              return
            }
            seenIds.add(task.id)

            // Sanitize text to prevent potential XSS (extra safety layer)
            if (task.text.length > TASK_TEXT_MAX_LENGTH) {
              showError('Invalid tasks file: Task text exceeds maximum length.')
              return
            }
          }
        }

        setTasks(imported)
      } catch {
        showError('Invalid file format. Please select a valid tasks JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const quadrants = [
    {
      key: 'urgent_important',
      title: 'Urgent & Important',
      subtitle: 'Do First',
      colorClass: 'quadrant-red'
    },
    {
      key: 'not_urgent_important',
      title: 'Not Urgent & Important',
      subtitle: 'Schedule',
      colorClass: 'quadrant-blue'
    },
    {
      key: 'urgent_not_important',
      title: 'Urgent & Not Important',
      subtitle: 'Delegate',
      colorClass: 'quadrant-yellow'
    },
    {
      key: 'not_urgent_not_important',
      title: 'Not Urgent & Not Important',
      subtitle: 'Eliminate',
      colorClass: 'quadrant-green'
    }
  ]

  return (
    <div className='tasks-container'>
      {errorMessage && (
        <div
          className='error-notification'
          role='alert'
          aria-live='assertive'
          aria-atomic='true'
        >
          {errorMessage}
        </div>
      )}
      <div className='card'>
        <div className='card-h'>
          <strong>Tasks</strong>
          <div className='toolbar'>
            <button
              className='btn'
              onClick={exportTasks}
              aria-label='Export tasks'
            >
              <Icon name='download' />
              Export
            </button>
            <label className='btn' aria-label='Import tasks'>
              <Icon name='upload' />
              Import
              <input
                type='file'
                accept='.json'
                onChange={importTasks}
                className='hidden-file-input'
              />
            </label>
          </div>
        </div>
        <div className='card-b'>
          <TaskForm
            newTask={newTask}
            selectedQuadrant={selectedQuadrant}
            onTaskChange={setNewTask}
            onQuadrantChange={setSelectedQuadrant}
            onSubmit={handleAddTask}
          />
        </div>
      </div>

      <div className='eisenhower-matrix'>
        {quadrants.map((quadrant) => (
          <TaskQuadrant
            key={quadrant.key}
            quadrant={quadrant}
            tasks={tasks[quadrant.key]}
            editingTask={editingTask}
            editText={editText}
            onToggle={toggleTask}
            onEdit={startEditTask}
            onEditTextChange={setEditText}
            onSaveEdit={saveEditTask}
            onCancelEdit={cancelEditTask}
            onDelete={deleteTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div className='tasks-info'>
        <p className='small'>
          <strong>Tip:</strong> Drag tasks between quadrants to reorganize them.
          The Eisenhower Matrix helps prioritize tasks by urgency and
          importance.
        </p>
      </div>
    </div>
  )
}

export default Tasks
