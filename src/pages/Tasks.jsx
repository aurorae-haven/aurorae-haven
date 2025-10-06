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
    const data = JSON.stringify(tasks, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'aurorae_tasks.json'
    a.click()
    URL.revokeObjectURL(a.href)
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
        alert('Failed to import tasks: ' + err.message)
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
                tasks[quadrant.key].map((task) => (
                  <div
                    key={task.id}
                    className={`task-item ${task.completed ? 'completed' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(quadrant.key, task)}
                  >
                    <input
                      type='checkbox'
                      checked={task.completed}
                      onChange={() => toggleTask(quadrant.key, task.id)}
                      aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <span className='task-text'>{task.text}</span>
                    <button
                      className='btn-delete'
                      onClick={() => deleteTask(quadrant.key, task.id)}
                      aria-label={`Delete task "${task.text}"`}
                    >
                      <svg className='icon' viewBox='0 0 24 24'>
                        <polyline points='3 6 5 6 21 6' />
                        <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                      </svg>
                    </button>
                  </div>
                ))
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
