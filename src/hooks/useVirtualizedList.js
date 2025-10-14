/**
 * Custom hook for virtualizing long lists (TAB-RTN-40)
 * Improves performance for routines with 20+ steps
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for virtualizing a list to improve performance
 * @param {Array} items - Full array of items
 * @param {Object} options - Virtualization options
 * @returns {Object} Virtualized list state and helpers
 */
export function useVirtualizedList(items, options = {}) {
  const {
    itemHeight = 100, // Estimated height of each item in pixels
    overscan = 3, // Number of items to render outside viewport
    containerRef, // Reference to the scrollable container
    enabled = items.length >= 20 // Only enable for long lists
  } = options

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })

  const calculateVisibleRange = useCallback(() => {
    if (!containerRef?.current || !enabled) {
      return { start: 0, end: items.length }
    }

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight

    // Calculate which items should be visible
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { start, end }
  }, [containerRef, enabled, items.length, itemHeight, overscan])

  const handleScroll = useCallback(() => {
    if (!enabled) return

    const newRange = calculateVisibleRange()
    if (
      newRange.start !== visibleRange.start ||
      newRange.end !== visibleRange.end
    ) {
      setVisibleRange(newRange)
    }
  }, [enabled, calculateVisibleRange, visibleRange])

  useEffect(() => {
    if (!enabled || !containerRef?.current) return

    const container = containerRef.current
    container.addEventListener('scroll', handleScroll, { passive: true })

    // Initial calculation
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [enabled, containerRef, handleScroll])

  // If virtualization is disabled, return all items
  if (!enabled) {
    return {
      visibleItems: items,
      visibleRange: { start: 0, end: items.length },
      totalHeight: items.length * itemHeight,
      offsetY: 0,
      isVirtualized: false
    }
  }

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    isVirtualized: true
  }
}
