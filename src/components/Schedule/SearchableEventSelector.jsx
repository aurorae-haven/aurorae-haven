import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Icon from '../common/Icon'
import {
  searchRoutinesAndTasks,
  getAllRoutinesAndTasks
} from '../../utils/scheduleHelpers'
import { createLogger } from '../../utils/logger'

const logger = createLogger('SearchableEventSelector')

/**
 * SearchableEventSelector - Component for searching and selecting existing routines/tasks
 * @param {Object} props
 * @param {string} props.eventType - Type of event ('routine', 'task', 'meeting', 'habit')
 * @param {Function} props.onSelect - Callback when an item is selected
 * @param {Function} props.onCreateNew - Callback when "create new" is clicked
 */
function SearchableEventSelector({ eventType, onSelect, onCreateNew }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Load all items when component mounts or eventType changes
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true)
      try {
        // Only show routines and tasks in search (meetings and habits are created from scratch)
        const shouldSearch = eventType === 'routine' || eventType === 'task'
        if (shouldSearch) {
          const items = await getAllRoutinesAndTasks(eventType)
          setSearchResults(items)
        } else {
          setSearchResults([])
        }
      } catch (err) {
        logger.error('Failed to load items:', err)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [eventType])

  // Search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        // If no search query, show all items
        const items = await getAllRoutinesAndTasks(eventType)
        setSearchResults(items)
        return
      }

      setIsLoading(true)
      try {
        const results = await searchRoutinesAndTasks(searchQuery, eventType)
        setSearchResults(results)
      } catch (err) {
        logger.error('Search failed:', err)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, eventType])

  // Handle input focus
  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  // Handle item selection
  const handleItemSelect = (item) => {
    onSelect(item)
    setSearchQuery('')
    setShowDropdown(false)
  }

  // Handle create new
  const handleCreateNew = () => {
    onCreateNew()
    setShowDropdown(false)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      searchInputRef.current?.blur()
    }
  }

  // Only show search for routines and tasks (not meetings or habits)
  const shouldShowSearch = eventType === 'routine' || eventType === 'task'

  if (!shouldShowSearch) {
    return null
  }

  return (
    <div className='searchable-event-selector'>
      <div className='form-group'>
        <label htmlFor='event-search'>
          Search existing {eventType}s or create new
        </label>
        <div className='search-input-wrapper'>
          <Icon name='search' />
          <input
            id='event-search'
            ref={searchInputRef}
            type='text'
            className='search-input'
            placeholder={`Search for an existing ${eventType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            aria-label={`Search for existing ${eventType}`}
            aria-controls='search-results-dropdown'
            autoComplete='off'
          />
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          id='search-results-dropdown'
          className='search-dropdown'
          role='listbox'
          aria-label='Search results'
        >
          {isLoading ? (
            <div className='search-dropdown-loading' role='status'>
              <Icon name='loader' />
              <span>Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className='search-dropdown-header'>
                Select an existing {eventType}
                {eventType === 'task' && (
                  <span className='search-dropdown-hint'>
                    Important tasks shown first
                  </span>
                )}
              </div>
              <div className='search-dropdown-list'>
                {searchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type='button'
                    className='search-dropdown-item'
                    onClick={() => handleItemSelect(item)}
                    role='option'
                    aria-selected='false'
                  >
                    <div className='search-dropdown-item-content'>
                      <div className='search-dropdown-item-header'>
                        <Icon
                          name={
                            item.type === 'routine' ? 'repeat' : 'checkCircle'
                          }
                        />
                        <span className='search-dropdown-item-title'>
                          {item.title}
                        </span>
                        {item.isImportant && (
                          <span className='search-dropdown-item-badge important'>
                            Important
                          </span>
                        )}
                      </div>
                      {item.quadrantLabel && (
                        <div className='search-dropdown-item-meta'>
                          {item.quadrantLabel}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className='search-dropdown-empty'>
              <Icon name='inbox' />
              <p>
                No {eventType}s found
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          )}

          <div className='search-dropdown-footer'>
            <button
              type='button'
              className='btn btn-primary'
              onClick={handleCreateNew}
            >
              <Icon name='plus' />
              Create new {eventType}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

SearchableEventSelector.propTypes = {
  eventType: PropTypes.oneOf(['routine', 'task', 'meeting', 'habit'])
    .isRequired,
  onSelect: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired
}

export default SearchableEventSelector
