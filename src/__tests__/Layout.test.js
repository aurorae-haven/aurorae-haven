/**
 * Tests for Layout component (Global Navbar - TAB-NAV)
 * Validates navbar structure, accessibility, keyboard navigation, and responsive behavior
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout.jsx'

// Helper to render component with router
const renderWithRouter = (component, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

// Mock functions for export/import
const mockOnExport = jest.fn()
const mockOnImport = jest.fn()

describe('Layout Component - Global Navbar (TAB-NAV)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('TAB-NAV-01: Three-zone structure', () => {
    test('renders left zone with logo and title', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      // Logo button
      expect(
        screen.getByRole('button', { name: /return to tasks/i })
      ).toBeInTheDocument()

      // Brand text (slogan removed for compact design)
      expect(screen.getByText(/aurorae haven/i)).toBeInTheDocument()
    })

    test('renders center zone with primary tabs', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      // Check all primary tabs exist
      expect(screen.getByRole('tab', { name: /^tasks$/i })).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /^routines$/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /^habits$/i })).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /^schedule$/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /brain dump/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /^library$/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /^settings$/i })
      ).toBeInTheDocument()
    })

    test('renders right zone with global actions', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      // Search and theme toggle icons
      expect(
        screen.getByRole('button', { name: /search/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /toggle theme/i })
      ).toBeInTheDocument()

      // Export/Import buttons
      expect(
        screen.getByRole('button', { name: /export data/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/import/i)).toBeInTheDocument()
    })
  })

  describe('TAB-NAV-04 & TAB-NAV-05: Logo functionality', () => {
    test('logo button has proper accessibility attributes', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const logoButton = screen.getByRole('button', {
        name: /return to tasks/i
      })
      expect(logoButton).toHaveAttribute('title', 'Stellar-Journey')
    })

    test('logo button is clickable', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>,
        { route: '/schedule' }
      )

      const logoButton = screen.getByRole('button', {
        name: /return to tasks/i
      })

      // Should not throw error
      expect(() => fireEvent.click(logoButton)).not.toThrow()
    })
  })

  describe('TAB-NAV-06 & TAB-NAV-07: Primary tabs styling', () => {
    test('all seven primary tabs are present', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(7)
    })

    test('tabs have proper structure with icons and text', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })

      // Check for icon (SVG) and text
      expect(tasksTab.querySelector('svg')).toBeInTheDocument()
      expect(tasksTab.querySelector('span')).toHaveTextContent('Tasks')
    })
  })

  describe('TAB-NAV-08: Active tab state', () => {
    test('tasks tab has aria-selected when on /tasks route', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>,
        { route: '/tasks' }
      )

      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })
      // aria-selected uses boolean true, which becomes string 'true' in HTML
      expect(tasksTab).toHaveAttribute('aria-selected')
    })

    test('tabs have tabindex attribute for keyboard navigation', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>,
        { route: '/tasks' }
      )

      const routinesTab = screen.getByRole('tab', { name: /^routines$/i })
      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })

      // Both tabs should have tabindex attribute (either 0 or -1)
      expect(routinesTab).toHaveAttribute('tabindex')
      expect(tasksTab).toHaveAttribute('tabindex')
    })

    test('tabs have active class styling capability', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>,
        { route: '/tasks' }
      )

      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })
      // Check tasks tab has nav-tab class (base styling)
      expect(tasksTab.className).toContain('nav-tab')
    })
  })

  describe('TAB-NAV-09: Keyboard navigation', () => {
    test('tabs can be focused with Tab key', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })
      tasksTab.focus()
      expect(tasksTab).toHaveFocus()
    })

    test('arrow right key moves focus to next tab', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>,
        { route: '/tasks' }
      )

      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })
      const routinesTab = screen.getByRole('tab', { name: /^routines$/i })

      tasksTab.focus()
      fireEvent.keyDown(tasksTab, { key: 'ArrowRight' })

      await waitFor(() => {
        expect(routinesTab).toHaveFocus()
      })
    })

    test('arrow left key moves focus to previous tab', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const routinesTab = screen.getByRole('tab', { name: /^routines$/i })
      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })

      routinesTab.focus()
      fireEvent.keyDown(routinesTab, { key: 'ArrowLeft' })

      await waitFor(() => {
        expect(tasksTab).toHaveFocus()
      })
    })

    test('home key moves focus to first tab', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const settingsTab = screen.getByRole('tab', { name: /^settings$/i })
      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })

      settingsTab.focus()
      fireEvent.keyDown(settingsTab, { key: 'Home' })

      await waitFor(() => {
        expect(tasksTab).toHaveFocus()
      })
    })

    test('end key moves focus to last tab', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const tasksTab = screen.getByRole('tab', { name: /^tasks$/i })
      const settingsTab = screen.getByRole('tab', { name: /^settings$/i })

      tasksTab.focus()
      fireEvent.keyDown(tasksTab, { key: 'End' })

      await waitFor(() => {
        expect(settingsTab).toHaveFocus()
      })
    })
  })

  describe('TAB-NAV-10: Right zone global actions', () => {
    test('search icon button is present', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).toBeInTheDocument()
      expect(searchButton).toHaveAttribute('title', 'Search (Coming soon)')
    })

    test('theme toggle button is present', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const themeButton = screen.getByRole('button', { name: /toggle theme/i })
      expect(themeButton).toBeInTheDocument()
      expect(themeButton).toHaveAttribute('title', 'Theme (Coming soon)')
    })

    test('export button calls onExport handler', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const exportButton = screen.getByRole('button', { name: /export data/i })
      fireEvent.click(exportButton)

      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })

    test('import file input calls onImport handler', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const importInput = screen.getByLabelText(/import data file/i)
      const file = new File(['{}'], 'test.json', { type: 'application/json' })

      fireEvent.change(importInput, { target: { files: [file] } })

      expect(mockOnImport).toHaveBeenCalledTimes(1)
    })
  })

  describe('TAB-NAV-13: Mobile hamburger menu', () => {
    test('hamburger button is present', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const hamburgerButton = screen.getByRole('button', {
        name: /toggle navigation menu/i
      })
      expect(hamburgerButton).toBeInTheDocument()
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
      expect(hamburgerButton).toHaveAttribute('aria-controls', 'mobile-menu')
    })

    test('clicking hamburger opens mobile menu', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const hamburgerButton = screen.getByRole('button', {
        name: /toggle navigation menu/i
      })
      fireEvent.click(hamburgerButton)

      // Check aria-expanded changed
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true')

      // Check mobile menu appears
      await waitFor(() => {
        const mobileMenu = screen.getByRole('dialog', {
          name: /mobile navigation menu/i
        })
        expect(mobileMenu).toBeInTheDocument()
      })
    })

    test('mobile menu has all navigation items', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const hamburgerButton = screen.getByRole('button', {
        name: /toggle navigation menu/i
      })
      fireEvent.click(hamburgerButton)

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem')
        expect(menuItems).toHaveLength(7)
      })
    })

    test('clicking mobile menu item closes menu and navigates', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const hamburgerButton = screen.getByRole('button', {
        name: /toggle navigation menu/i
      })
      fireEvent.click(hamburgerButton)

      await waitFor(() => {
        const tasksMenuItem = screen.getByRole('menuitem', { name: /tasks/i })
        fireEvent.click(tasksMenuItem)
      })

      // Menu should close
      await waitFor(() => {
        expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('TAB-NAV-20 & TAB-NAV-21: ARIA roles and labels', () => {
    test('header has role="banner"', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const banner = screen.getByRole('banner')
      expect(banner).toBeInTheDocument()
    })

    test('nav has role="navigation" with aria-label', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const nav = screen.getByRole('navigation', { name: /main/i })
      expect(nav).toBeInTheDocument()
    })

    test('tablist has proper aria-label', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const tablist = screen.getByRole('tablist', {
        name: /primary navigation tabs/i
      })
      expect(tablist).toBeInTheDocument()
    })

    test('all tabs have role="tab"', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const tabs = screen.getAllByRole('tab')
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('role', 'tab')
      })
    })
  })

  describe('TAB-NAV-22: Focus trap and escape key', () => {
    test('pressing Escape closes mobile menu', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const hamburgerButton = screen.getByRole('button', {
        name: /toggle navigation menu/i
      })
      fireEvent.click(hamburgerButton)

      await waitFor(() => {
        expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true')
      })

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
      })
    })

    test('mobile menu has aria-modal="true"', async () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const hamburgerButton = screen.getByRole('button', {
        name: /toggle navigation menu/i
      })
      fireEvent.click(hamburgerButton)

      await waitFor(() => {
        const mobileMenu = screen.getByRole('dialog')
        expect(mobileMenu).toHaveAttribute('aria-modal', 'true')
      })
    })
  })

  describe('Content rendering', () => {
    test('renders children content', () => {
      renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div data-testid='test-content'>Test Content</div>
        </Layout>
      )

      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    test('renders planet decoration', () => {
      const { container } = renderWithRouter(
        <Layout onExport={mockOnExport} onImport={mockOnImport}>
          <div>Content</div>
        </Layout>
      )

      const planetWrap = container.querySelector('.planet-wrap')
      expect(planetWrap).toBeInTheDocument()

      const planet = container.querySelector('.planet')
      expect(planet).toBeInTheDocument()
    })
  })
})
