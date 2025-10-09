import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

/**
 * Context menu for note operations (right-click menu)
 */
function ContextMenu({ contextMenu, onExport, onLockToggle, onDelete, onClose }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (!contextMenu) return null

  return (
    <div
      ref={menuRef}
      className='context-menu'
      style={{
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`
      }}
      role='menu'
    >
      <button
        className='context-menu-item'
        onClick={() => {
          onExport(contextMenu.note.id)
          onClose()
        }}
        role='menuitem'
      >
        <svg className='icon' viewBox='0 0 24 24'>
          <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
          <polyline points='7 10 12 15 17 10' />
          <line x1='12' y1='15' x2='12' y2='3' />
        </svg>
        Export Note
      </button>
      <button
        className='context-menu-item'
        onClick={() => {
          onLockToggle(contextMenu.note.id)
          onClose()
        }}
        role='menuitem'
      >
        <svg className='icon' viewBox='0 0 24 24'>
          {contextMenu.note.locked ? (
            <>
              <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
              <path d='M7 11V7a5 5 0 0 1 9.9-1' />
            </>
          ) : (
            <>
              <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
              <path d='M7 11V7a5 5 0 0 1 10 0v4' />
            </>
          )}
        </svg>
        {contextMenu.note.locked ? 'Unlock Note' : 'Lock Note'}
      </button>
      <button
        className='context-menu-item'
        onClick={() => {
          onDelete(contextMenu.note.id)
          onClose()
        }}
        role='menuitem'
        disabled={contextMenu.note.locked}
      >
        <svg className='icon' viewBox='0 0 24 24'>
          <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
          <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
        </svg>
        Delete Note
      </button>
    </div>
  )
}

ContextMenu.propTypes = {
  contextMenu: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    note: PropTypes.shape({
      id: PropTypes.string,
      locked: PropTypes.bool
    })
  }),
  onExport: PropTypes.func.isRequired,
  onLockToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ContextMenu
