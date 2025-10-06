import React, { useState, useEffect } from 'react'

function Tasks() {
  const [tasks, setTasks] = useState({
    urgent_important: [],
    not_urgent_important: [],
    urgent_not_important: [],
    not_urgent_not_important: []
  })
  const [newTask, setNewTask] = useState('')
  const [selectedQuadrant, setSelectedQuadrant] = useState('urgent_important')
  const [draggedTask, setDraggedTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editText, setEditText] = useState('')

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('aurorae_tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error('Failed to parse saved tasks:', e)
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aurorae_tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task = {
      id: Date.now(),
      text: newTask.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: null,
      completedAt: null
    }

    setTasks((prev) => ({
      ...prev,
      [selectedQuadrant]: [...prev[selectedQuadrant], task]
    }))
    setNewTask('')
  }

  const toggleTask = (quadrant, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? Date.now() : null
            }
          : task
      )
    }))
  }

  const deleteTask = (quadrant, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((task) => task.id !== taskId)
    }))
  }

  const startEditTask = (quadrant, task) => {
    setEditingTask({ quadrant, taskId: task.id })
    setEditText(task.text)
  }

  const saveEditTask = (quadrant, taskId) => {
    if (!editText.trim()) {
      cancelEditTask()
      return
    }

    setTasks((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].map((task) =>
        task.id === taskId ? { ...task, text: editText.trim() } : task
      )
    }))
    setEditingTask(null)
    setEditText('')
  }

  const cancelEditTask = () => {
    setEditingTask(null)
    setEditText('')
  }

  const handleDragStart = (quadrant, task) => {
    setDraggedTask({ quadrant, task })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (targetQuadrant) => {
    if (!draggedTask) return

    if (draggedTask.quadrant !== targetQuadrant) {
      // Move task to new quadrant
      setTasks((prev) => ({
        ...prev,
        [draggedTask.quadrant]: prev[draggedTask.quadrant].filter(
          (t) => t.id !== draggedTask.task.id
        ),
        [targetQuadrant]: [...prev[targetQuadrant], draggedTask.task]
      }))
    }
    setDraggedTask(null)
  }

  const exportTasks = () => {
    try {
      const data = JSON.stringify(tasks, null, 2)
      let blob
      try {
        blob = new Blob([data], { type: 'application/json' })
      } catch (err) {
        alert('Failed to create file for export: ' + err.message)
        return
      }
      let url
      try {
        url = URL.createObjectURL(blob)
      } catch (err) {
        alert('Failed to create download URL: ' + err.message)
        return
      }
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'aurorae_tasks.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    } catch (err) {
      alert('Unexpected error during export: ' + err.message)
    }
  }

  const importTasks = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        setTasks(imported)
      } catch (err) {
        alert('Invalid file format. Please select a valid tasks JSON file.')
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
      <div className='card'>
        <div className='card-h'>
          <strong>Tasks</strong>
          <div className='toolbar'>
            <button
              className='btn'
              onClick={exportTasks}
              aria-label='Export tasks'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='7 10 12 15 17 10' />
                <line x1='12' y1='15' x2='12' y2='3' />
              </svg>
            </button>
            <label className='btn' aria-label='Import tasks'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='17 8 12 3 7 8' />
                <line x1='12' y1='3' x2='12' y2='15' />
              </svg>
              <input
                type='file'
                accept='.json'
                onChange={importTasks}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
        <div className='card-b'>
          <form onSubmit={addTask} className='task-input-form'>
            <select
              value={selectedQuadrant}
              onChange={(e) => setSelectedQuadrant(e.target.value)}
              className='quadrant-select'
              aria-label='Select quadrant'
            >
              {quadrants.map((q) => (
                <option key={q.key} value={q.key}>
                  {q.title}
                </option>
              ))}
            </select>
            <input
              type='text'
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder='Add a new task...'
              className='task-input'
              aria-label='New task text'
            />
            <button type='submit' className='btn btn-primary'>
              Add
            </button>
          </form>
        </div>
      </div>

      <div className='eisenhower-matrix'>
        {quadrants.map((quadrant) => (
          <div
            key={quadrant.key}
            className={`matrix-quadrant ${quadrant.colorClass}`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(quadrant.key)}
          >
            <div className='quadrant-header'>
              <h3>{quadrant.title}</h3>
              <span className='subtitle'>{quadrant.subtitle}</span>
            </div>
            <div className='task-list'>
              {tasks[quadrant.key].length === 0 ? (
                <p className='empty-state'>No tasks yet</p>
              ) : (
                tasks[quadrant.key].map((task) => {
                  const isEditing =
                    editingTask &&
                    editingTask.quadrant === quadrant.key &&
                    editingTask.taskId === task.id

                  return (
                    <div
                      key={task.id}
                      className={`task-item ${task.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`}
                      draggable={!isEditing}
                      onDragStart={() =>
                        !isEditing && handleDragStart(quadrant.key, task)
                      }
                    >
                      <input
                        type='checkbox'
                        checked={task.completed}
                        onChange={() => toggleTask(quadrant.key, task.id)}
                        disabled={isEditing}
                        aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                      />
                      {isEditing ? (
                        <input
                          type='text'
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditTask(quadrant.key, task.id)
                            } else if (e.key === 'Escape') {
                              cancelEditTask()
                            }
                          }}
                          className='task-edit-input'
                          aria-label='Edit task text'
                          // eslint-disable-next-line jsx-a11y/no-autofocus
                          autoFocus
                        />
                      ) : (
                        <span
                          className='task-text'
                          onDoubleClick={() =>
                            startEditTask(quadrant.key, task)
                          }
                        >
                          {task.text}
                        </span>
                      )}
                      <div className='task-actions'>
                        {isEditing ? (
                          <>
                            <button
                              className='btn-save'
                              onClick={() =>
                                saveEditTask(quadrant.key, task.id)
                              }
                              aria-label='Save task'
                            >
                              <svg className='icon' viewBox='0 0 24 24'>
                                <polyline points='20 6 9 17 4 12' />
                              </svg>
                            </button>
                            <button
                              className='btn-cancel'
                              onClick={cancelEditTask}
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
                              onClick={() =>
                                startEditTask(quadrant.key, task)
                              }
                              aria-label={`Edit task "${task.text}"`}
                            >
                              <svg className='icon' viewBox='0 0 24 24'>
                                <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                                <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                              </svg>
                            </button>
                            <button
                              className='btn-delete'
                              onClick={() =>
                                deleteTask(quadrant.key, task.id)
                              }
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
                })
              )}
            </div>
          </div>
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
