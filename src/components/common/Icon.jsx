import React from 'react'
import PropTypes from 'prop-types'
import { warn } from '../../utils/logger'

/**
 * Common icon component for SVG icons
 * Reduces duplication of SVG markup across components
 */
function Icon({ name, className = 'icon', ...props }) {
  const icons = {
    // Common actions
    plus: (
      <>
        <path d='M12 5v14M5 12h14' />
      </>
    ),
    x: (
      <>
        <line x1='18' y1='6' x2='6' y2='18' />
        <line x1='6' y1='6' x2='18' y2='18' />
      </>
    ),
    check: (
      <>
        <polyline points='20 6 9 17 4 12' />
      </>
    ),
    edit: (
      <>
        <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
        <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
      </>
    ),
    trash: (
      <>
        <polyline points='3 6 5 6 21 6' />
        <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
      </>
    ),
    trashAlt: (
      <>
        <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
        <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
      </>
    ),

    // Import/Export
    upload: (
      <>
        <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
        <polyline points='17 8 12 3 7 8' />
        <line x1='12' y1='3' x2='12' y2='15' />
      </>
    ),
    download: (
      <>
        <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
        <polyline points='7 10 12 15 17 10' />
        <line x1='12' y1='15' x2='12' y2='3' />
      </>
    ),

    // Lock states
    lock: (
      <>
        <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
        <path d='M7 11V7a5 5 0 0 1 10 0v4' />
      </>
    ),
    unlock: (
      <>
        <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
        <path d='M7 11V7a5 5 0 0 1 9.9-1' />
      </>
    ),

    // Navigation
    menu: (
      <>
        <line x1='3' y1='12' x2='21' y2='12' />
        <line x1='3' y1='6' x2='21' y2='6' />
        <line x1='3' y1='18' x2='21' y2='18' />
      </>
    ),
    filter: (
      <>
        <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
      </>
    ),

    // Info/Help
    info: (
      <>
        <circle cx='12' cy='12' r='10' />
        <line x1='12' y1='16' x2='12' y2='12' />
        <line x1='12' y1='8' x2='12.01' y2='8' />
      </>
    ),
    helpCircle: (
      <>
        <circle cx='12' cy='12' r='10' />
        <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
        <line x1='12' y1='17' x2='12.01' y2='17' />
      </>
    )
  }

  const iconPath = icons[name]

  if (!iconPath) {
    warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <svg className={className} viewBox='0 0 24 24' {...props}>
      {iconPath}
    </svg>
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string
}

export default Icon
