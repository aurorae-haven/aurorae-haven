import { useState, useEffect } from 'react'
import { generateSecureUUID } from '../utils/uuidGenerator'

/**
 * Custom hook for managing tasks state in Eisenhower Matrix
 * Handles CRUD operations and localStorage persistence
 */
export function useTasksState() {
  const [tasks, setTasks] = useState({
    urgent_important: [],
    not_urgent_important: [],
    urgent_not_important: [],
    not_urgent_not_important: []
  })

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
    try {
      localStorage.setItem('aurorae_tasks', JSON.stringify(tasks))
    } catch (e) {
      console.error('Failed to save tasks:', e)
      // Note: Errors are logged but don't throw to avoid breaking the component
      // The parent component should handle showing error messages to users
    }
  }, [tasks])

  // Add new task
  const addTask = (quadrant, text) => {
    const task = {
      id: generateSecureUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: null,
      completedAt: null
    }

    setTasks((prev) => ({
      ...prev,
      [quadrant]: [...prev[quadrant], task]
    }))

    return task
  }

  // Toggle task completion
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

  // Delete task
  const deleteTask = (quadrant, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((task) => task.id !== taskId)
    }))
  }

  // Edit task text
  const editTask = (quadrant, taskId, newText) => {
    setTasks((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].map((task) =>
        task.id === taskId ? { ...task, text: newText.trim() } : task
      )
    }))
  }

  // Move task between quadrants
  const moveTask = (fromQuadrant, toQuadrant, task) => {
    if (fromQuadrant === toQuadrant) return

    setTasks((prev) => ({
      ...prev,
      [fromQuadrant]: prev[fromQuadrant].filter((t) => t.id !== task.id),
      [toQuadrant]: [...prev[toQuadrant], task]
    }))
  }

  return {
    tasks,
    setTasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    moveTask
  }
}
