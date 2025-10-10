import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

/**
 * Mobile hamburger menu component
 * TAB-NAV-14 & TAB-NAV-22: Modal overlay with focus trap and keyboard navigation
 */
function MobileMenu({ isOpen, onClose, tabs, isActive, mobileMenuRef }) {
  if (!isOpen) return null

  return (
    <>
      <div
        className='mobile-menu-overlay'
        onClick={onClose}
        aria-hidden='true'
      />
      <nav
        ref={mobileMenuRef}
        id='mobile-menu'
        className='mobile-menu'
        role='dialog'
        aria-modal='true'
        aria-label='Mobile navigation menu'
      >
        <div className='mobile-menu-content'>
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              className={`mobile-menu-item ${isActive(tab.path) ? 'active' : ''}`}
              to={tab.path}
              onClick={onClose}
              role='menuitem'
              aria-current={isActive(tab.path) ? 'page' : undefined}
              aria-label={tab.label}
              title={tab.label}
            >
              <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
                <path d={tab.icon} />
              </svg>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired
    })
  ).isRequired,
  isActive: PropTypes.func.isRequired,
  mobileMenuRef: PropTypes.object
}

export default MobileMenu
