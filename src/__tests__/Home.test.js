/**
 * Tests for Home component
 * Validates landing page content and navigation links
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../pages/Home.jsx'

// Helper to render component with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Home Component', () => {
  describe('Content Rendering', () => {
    test('renders welcome message', () => {
      renderWithRouter(<Home />)
      expect(screen.getByText(/Welcome to Aurorae Haven/i)).toBeInTheDocument()
    })

    test('renders app description', () => {
      renderWithRouter(<Home />)
      expect(
        screen.getByText(
          /A calm, astro-themed productivity app designed for neurodivergent users/i
        )
      ).toBeInTheDocument()
    })

    test('renders getting started information', () => {
      renderWithRouter(<Home />)
      expect(screen.getByText(/Getting Started:/i)).toBeInTheDocument()
      expect(
        screen.getByText(
          /Navigate using the menu above to explore different features/i
        )
      ).toBeInTheDocument()
    })
  })

  describe('Feature Links', () => {
    test('renders Features section', () => {
      renderWithRouter(<Home />)
      expect(screen.getByText(/✨ Features/i)).toBeInTheDocument()
    })

    test('renders Schedule link', () => {
      renderWithRouter(<Home />)
      const scheduleLink = screen.getByRole('link', { name: /Schedule/i })
      expect(scheduleLink).toBeInTheDocument()
      expect(scheduleLink).toHaveAttribute('href', '/schedule')
    })

    test('renders Routines link', () => {
      renderWithRouter(<Home />)
      const routinesLink = screen.getByRole('link', { name: /Routines/i })
      expect(routinesLink).toBeInTheDocument()
      expect(routinesLink).toHaveAttribute('href', '/routines')
    })

    test('renders Brain Dump link', () => {
      renderWithRouter(<Home />)
      const brainDumpLink = screen.getByRole('link', { name: /Brain Dump/i })
      expect(brainDumpLink).toBeInTheDocument()
      expect(brainDumpLink).toHaveAttribute('href', '/braindump')
    })

    test('renders Tasks link', () => {
      renderWithRouter(<Home />)
      const tasksLink = screen.getByRole('link', { name: /Tasks/i })
      expect(tasksLink).toBeInTheDocument()
      expect(tasksLink).toHaveAttribute('href', '/tasks')
    })

    test('renders Habits link', () => {
      renderWithRouter(<Home />)
      const habitsLink = screen.getByRole('link', { name: /Habits/i })
      expect(habitsLink).toBeInTheDocument()
      expect(habitsLink).toHaveAttribute('href', '/habits')
    })

    test('renders Stats link', () => {
      renderWithRouter(<Home />)
      const statsLink = screen.getByRole('link', { name: /Stats/i })
      expect(statsLink).toBeInTheDocument()
      expect(statsLink).toHaveAttribute('href', '/stats')
    })
  })

  describe('PWA Information', () => {
    test('renders PWA section', () => {
      renderWithRouter(<Home />)
      expect(screen.getByText(/📱 Progressive Web App/i)).toBeInTheDocument()
    })

    test('renders PWA description', () => {
      renderWithRouter(<Home />)
      expect(
        screen.getByText(
          /Aurorae Haven is a Progressive Web App \(PWA\) that can be installed/i
        )
      ).toBeInTheDocument()
    })

    test('renders PWA installation instructions', () => {
      renderWithRouter(<Home />)
      expect(screen.getByText(/To install:/i)).toBeInTheDocument()
      expect(screen.getByText(/Desktop:/i)).toBeInTheDocument()
      expect(screen.getByText(/Mobile:/i)).toBeInTheDocument()
    })
  })

  describe('Privacy Information', () => {
    test('renders Privacy section', () => {
      renderWithRouter(<Home />)
      expect(screen.getByText(/🔒 Privacy & Data/i)).toBeInTheDocument()
    })

    test('renders privacy description', () => {
      renderWithRouter(<Home />)
      expect(
        screen.getByText(/All your data stays on your device/i)
      ).toBeInTheDocument()
    })

    test('mentions export/import functionality', () => {
      renderWithRouter(<Home />)
      expect(
        screen.getByText(/Use the Export\/Import buttons/i)
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('all navigation links are accessible', () => {
      renderWithRouter(<Home />)
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      links.forEach((link) => {
        expect(link).toHaveAttribute('href')
      })
    })

    test('content is structured with proper sections', () => {
      const { container } = renderWithRouter(<Home />)
      const cards = container.querySelectorAll('.card')
      expect(cards.length).toBeGreaterThan(0)
    })
  })
})
