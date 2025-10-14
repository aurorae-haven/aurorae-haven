// React hook for routine library management
// Handles loading, filtering, sorting routines

import { useState, useEffect, useCallback } from 'react'
import {
  getRoutines,
  filterRoutines,
  deleteRoutine,
  cloneRoutine
} from '../utils/routinesManager'
import { getAllTemplates } from '../utils/templatesManager'
import {
  seedPredefinedTemplates,
  arePredefinedTemplatesSeeded
} from '../utils/predefinedTemplates'
import { createLogger } from '../utils/logger'

const logger = createLogger('useRoutines')

/**
 * Custom hook for managing routine library
 * TAB-RTN-04: Routine Library with filtering and sorting
 * @returns {Object} Routines state and management functions
 */
export function useRoutines() {
  const [routines, setRoutines] = useState([])
  const [filteredRoutines, setFilteredRoutines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('lastUsed')
  const [sortOrder, setSortOrder] = useState('desc')

  // Load routines from database and templates
  const loadRoutines = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if predefined templates need to be seeded
      const isSeeded = await arePredefinedTemplatesSeeded()
      if (!isSeeded) {
        logger.info('Seeding predefined templates...')
        const seedResults = await seedPredefinedTemplates()
        if (seedResults.added > 0) {
          logger.info(`Seeded ${seedResults.added} predefined templates`)
        }
      }

      // Get stored routines from database
      const storedRoutines = await getRoutines({ sortBy, order: sortOrder })

      // Get routine templates
      const templates = await getAllTemplates()
      const routineTemplates = templates.filter((t) => t.type === 'routine')

      // Combine stored routines and templates
      // Templates that haven't been instantiated yet
      const combined = [
        ...storedRoutines,
        ...routineTemplates.filter(
          (template) => !storedRoutines.some((r) => r.id === template.id)
        )
      ]

      setRoutines(combined)
      logger.info(`Loaded ${combined.length} routines`)
    } catch (err) {
      logger.error('Failed to load routines:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, sortOrder])

  // Initial load
  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

  // Apply filters when filters or routines change
  useEffect(() => {
    const filtered = filterRoutines(routines, filters)
    setFilteredRoutines(filtered)
  }, [routines, filters])

  // Update filters - TAB-RTN-06
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Update sort - TAB-RTN-07
  const updateSort = useCallback((field, order = 'asc') => {
    setSortBy(field)
    setSortOrder(order)
  }, [])

  // Delete routine
  const removeRoutine = useCallback(
    async (routineId) => {
      try {
        await deleteRoutine(routineId)
        await loadRoutines() // Reload list
        logger.info(`Deleted routine: ${routineId}`)
      } catch (err) {
        logger.error('Failed to delete routine:', err)
        throw err
      }
    },
    [loadRoutines]
  )

  // Duplicate routine
  const duplicateRoutine = useCallback(
    async (routineId, newName) => {
      try {
        const newId = await cloneRoutine(routineId, newName)
        await loadRoutines() // Reload list
        logger.info(`Duplicated routine: ${routineId} -> ${newId}`)
        return newId
      } catch (err) {
        logger.error('Failed to duplicate routine:', err)
        throw err
      }
    },
    [loadRoutines]
  )

  return {
    routines: filteredRoutines,
    allRoutines: routines,
    isLoading,
    error,
    filters,
    sortBy,
    sortOrder,
    updateFilters,
    clearFilters,
    updateSort,
    loadRoutines,
    removeRoutine,
    duplicateRoutine
  }
}
