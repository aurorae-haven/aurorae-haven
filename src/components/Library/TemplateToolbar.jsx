/**
 * TemplateToolbar Component
 * Toolbar for library management actions
 * TAB-LIB-03, TAB-LIB-04, TAB-LIB-05, TAB-LIB-06
 */

import React, { useRef } from 'react'
import PropTypes from 'prop-types'

function TemplateToolbar({
  onNewTemplate,
  onExport,
  onImport,
  onSearch,
  onFilter,
  onSort,
  onViewModeChange,
  searchQuery,
  sortBy,
  viewMode
}) {
  const fileInputRef = useRef(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    onImport(event)
    // Reset input so the same file can be imported again
    event.target.value = ''
  }

  return (
    <div className='library-toolbar'>
      {/* Primary actions */}
      <div className='toolbar-primary'>
        <button
          className='btn btn-primary'
          onClick={onNewTemplate}
          aria-label='Create new template'
        >
          <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
            <path
              d='M12 5v14M5 12h14'
              stroke='currentColor'
              strokeWidth='2'
              fill='none'
            />
          </svg>
          <span>New Template</span>
        </button>

        <button
          className='btn'
          onClick={handleImportClick}
          aria-label='Import templates'
        >
          <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
            <path
              d='M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'
              stroke='currentColor'
              strokeWidth='2'
              fill='none'
            />
          </svg>
          <span>Import</span>
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='.json'
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-label='Choose template file to import'
        />

        <button
          className='btn'
          onClick={onExport}
          aria-label='Export all templates'
        >
          <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
            <path
              d='M12 15V3M8 7l4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'
              stroke='currentColor'
              strokeWidth='2'
              fill='none'
            />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* Search and filter */}
      <div className='toolbar-search'>
        <div className='search-box'>
          <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
            <circle
              cx='11'
              cy='11'
              r='8'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            />
            <path d='M21 21l-4.35-4.35' stroke='currentColor' strokeWidth='2' />
          </svg>
          <input
            type='text'
            placeholder='Search templates...'
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            aria-label='Search templates'
          />
        </div>

        <button
          className='btn'
          onClick={onFilter}
          aria-label='Filter templates'
        >
          <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
            <path
              d='M4 6h16M6 12h12M8 18h8'
              stroke='currentColor'
              strokeWidth='2'
            />
          </svg>
          <span>Filter</span>
        </button>

        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          className='sort-select'
          aria-label='Sort templates'
        >
          <option value='title'>Title (A–Z)</option>
          <option value='lastUsed'>Last Used</option>
          <option value='duration'>Duration</option>
          <option value='dateCreated'>Date Created</option>
        </select>

        <div className='view-toggle' role='group' aria-label='View mode'>
          <button
            className={`btn btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label='Grid view'
            aria-pressed={viewMode === 'grid'}
          >
            <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
              <rect
                x='3'
                y='3'
                width='7'
                height='7'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              />
              <rect
                x='14'
                y='3'
                width='7'
                height='7'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              />
              <rect
                x='3'
                y='14'
                width='7'
                height='7'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              />
              <rect
                x='14'
                y='14'
                width='7'
                height='7'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              />
            </svg>
          </button>
          <button
            className={`btn btn-icon ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            aria-label='List view'
            aria-pressed={viewMode === 'list'}
          >
            <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
              <path
                d='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
                stroke='currentColor'
                strokeWidth='2'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

TemplateToolbar.propTypes = {
  onNewTemplate: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  sortBy: PropTypes.string.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired
}

export default TemplateToolbar
