import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import MobileMenu from './Layout/MobileMenu'

function Layout({ children, onExport, onImport }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const hamburgerButtonRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const isActive = (path) => location.pathname === path

  // TAB-NAV-05: Logo click returns to Tasks without export prompts
  const handleLogoClick = () => {
    navigate('/tasks')
  }

  // TAB-NAV-22: Focus trap and Esc to close
  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        hamburgerButtonRef.current?.focus()
      }
    }

    const handleFocusTrap = (e) => {
      if (!mobileMenuRef.current) return

      const focusableElements = mobileMenuRef.current.querySelectorAll(
        'a[href], button:not([disabled])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleFocusTrap)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleFocusTrap)
    }
  }, [mobileMenuOpen])

  // TAB-NAV-09: Keyboard navigation with arrow keys
  const handleTabKeyDown = (e, tabs, currentIndex) => {
    let newIndex = currentIndex

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
    } else if (e.key === 'Home') {
      e.preventDefault()
      newIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      newIndex = tabs.length - 1
    }

    if (newIndex !== currentIndex) {
      const tabElements = document.querySelectorAll('[role="tab"]')
      tabElements[newIndex]?.focus()
    }
  }

  const tabs = [
    {
      path: '/tasks',
      label: 'Tasks',
      icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
    },
    {
      path: '/routines',
      label: 'Routines',
      icon: 'M12 13m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M12 9v5l3 2M9 2h6'
    },
    {
      path: '/habits',
      label: 'Habits',
      icon: 'M7 20s6-3 6-10V4M14 4s5 0 6 5c-5 1-6-5-6-5zM2 9c2-5 8-5 8-5s0 6-8 5z'
    },
    {
      path: '/schedule',
      label: 'Schedule',
      icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18'
    },
    {
      path: '/braindump',
      label: 'Brain Dump',
      icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M20 22H6.5A2.5 2.5 0 0 1 4 19.5V5a2 2 0 0 1 2-2H20z'
    },
    {
      path: '/library',
      label: 'Library',
      icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M20 17v-5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5M20 17v5H6.5A2.5 2.5 0 0 1 4 19.5M8 7h8M8 11h4'
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6l-.09.1a2 2 0 0 1-3.82 0l-.09.1a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1l-.1-.09a2 2 0 0 1 0-3.82l.1-.09a1.65 1.65 0 0 0 .6-1A1.65 1.65 0 0 0 4.6 8.6l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6l.09-.1a2 2 0 0 1 3.82 0l.09.1a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1 1.65 1.65 0 0 0 .6 1z'
    }
  ]

  return (
    <>
      <div className='planet-wrap'>
        <div className='planet' />
      </div>
      {/* TAB-NAV-20: role="navigation" with aria-label="Main" */}
      <header className='appbar' role='banner'>
        <div className='inner'>
          {/* TAB-NAV-04 & TAB-NAV-05: Left Zone - Logo/Title */}
          <div className='navbar-left'>
            <button
              className='logo-button'
              onClick={handleLogoClick}
              aria-label='Return to Tasks'
              title='Stellar-Journey'
            >
              <div className='logo' aria-hidden='true' />
            </button>
            <div className='brand'>
              <b>Aurorae Haven</b>
            </div>
          </div>

          {/* TAB-NAV-06: Center Zone - Primary Tabs (Desktop) */}
          {/* TAB-NAV-20 & TAB-NAV-21: role="navigation" and role="tablist" */}
          <nav className='navbar-center' aria-label='Main' role='navigation'>
            <div
              className='appnav'
              role='tablist'
              aria-label='Primary navigation tabs'
            >
              {tabs.map((tab, index) => (
                <Link
                  key={tab.path}
                  className={`nav-tab ${isActive(tab.path) ? 'active' : ''}`}
                  to={tab.path}
                  role='tab'
                  aria-selected={isActive(tab.path)}
                  aria-label={tab.label}
                  tabIndex={isActive(tab.path) ? 0 : -1}
                  onKeyDown={(e) => handleTabKeyDown(e, tabs, index)}
                >
                  <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
                    <path d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Settings Button (tablet/phone) */}
          <Link
            className='mobile-settings-button icon-button'
            to='/settings'
            aria-label='Settings'
            title='Settings'
          >
            <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
              <path d='M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6l-.09.1a2 2 0 0 1-3.82 0l-.09.1a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1l-.1-.09a2 2 0 0 1 0-3.82l.1-.09a1.65 1.65 0 0 0 .6-1A1.65 1.65 0 0 0 4.6 8.6l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6l.09-.1a2 2 0 0 1 3.82 0l.09.1a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1 1.65 1.65 0 0 0 .6 1z' />
            </svg>
          </Link>

          {/* TAB-NAV-13: Mobile hamburger button */}
          <button
            ref={hamburgerButtonRef}
            className='hamburger-button'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label='Toggle navigation menu'
            aria-controls='mobile-menu'
          >
            <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
              {mobileMenuOpen ? (
                <path d='M18 6L6 18M6 6l12 12' />
              ) : (
                <path d='M3 12h18M3 6h18M3 18h18' />
              )}
            </svg>
          </button>

          {/* TAB-NAV-10: Right Zone - Global Actions */}
          <div className='navbar-right'>
            {/* TAB-NAV-10: Search icon (placeholder for future) */}
            <button
              className='icon-button'
              aria-label='Search'
              title='Search (Coming soon)'
            >
              <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
                <circle cx='11' cy='11' r='8' />
                <path d='M21 21l-4.35-4.35' />
              </svg>
            </button>

            {/* TAB-NAV-10: Theme toggle (placeholder for future) */}
            <button
              className='icon-button'
              aria-label='Toggle theme'
              title='Theme (Coming soon)'
            >
              <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
              </svg>
            </button>

            {/* Export/Import buttons */}
            <button className='btn' onClick={onExport} aria-label='Export data'>
              Export
            </button>
            <label className='btn' style={{ cursor: 'pointer' }}>
              Import
              <input
                type='file'
                accept='application/json'
                style={{ display: 'none' }}
                onChange={onImport}
                aria-label='Import data file'
              />
            </label>
          </div>
        </div>
      </header>

      {/* TAB-NAV-14 & TAB-NAV-22: Mobile hamburger menu with aria-modal */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        tabs={tabs}
        isActive={isActive}
        mobileMenuRef={mobileMenuRef}
      />

      <div className='shell'>{children}</div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  onExport: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
}

export default Layout
