/**
 * Tests for Settings component
 * Tests basic rendering and accessibility features
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Settings from '../pages/Settings'

// Mock CSS imports
jest.mock('../assets/styles/settings.css', () => ({}))

// Mock the autoSaveFS module
jest.mock('../utils/autoSaveFS', () => ({
  isFileSystemAccessSupported: jest.fn(() => true),
  requestDirectoryAccess: jest.fn(),
  getCurrentDirectoryHandle: jest.fn(() => null),
  setDirectoryHandle: jest.fn(),
  verifyDirectoryHandle: jest.fn(),
  startAutoSave: jest.fn(),
  stopAutoSave: jest.fn(),
  performAutoSave: jest.fn(),
  getLastSaveTimestamp: jest.fn(() => null),
  cleanOldSaveFiles: jest.fn(),
  loadAndImportLastSave: jest.fn(),
  getStoredDirectoryName: jest.fn(() => null),
  clearStoredDirectoryName: jest.fn()
}))

// Mock the settingsManager module
jest.mock('../utils/settingsManager', () => ({
  getSettings: jest.fn(() => ({
    autoSave: {
      enabled: false,
      intervalMinutes: 5,
      keepCount: 10,
      directoryConfigured: false
    }
  })),
  updateSetting: jest.fn((key, value) => ({
    autoSave: {
      enabled: key === 'autoSave.enabled' ? value : false,
      intervalMinutes: key === 'autoSave.intervalMinutes' ? value : 5,
      keepCount: key === 'autoSave.keepCount' ? value : 10,
      directoryConfigured:
        key === 'autoSave.directoryConfigured' ? value : false
    }
  })),
  getSetting: jest.fn((key) => {
    if (key === 'autoSave.keepCount') return 10
    return undefined
  })
}))

// Mock the importData module
jest.mock('../utils/importData', () => ({
  reloadPageAfterDelay: jest.fn(),
  IMPORT_SUCCESS_MESSAGE: 'Data imported successfully'
}))

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders settings page with title', () => {
    render(<Settings />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Customize your experience')).toBeInTheDocument()
  })

  test('renders auto-save section when File System API is supported', () => {
    render(<Settings />)
    expect(screen.getByText('Automatic Save')).toBeInTheDocument()
  })

  test('shows warning when File System API is not supported', () => {
    const { isFileSystemAccessSupported } = require('../utils/autoSaveFS')
    isFileSystemAccessSupported.mockReturnValue(false)

    render(<Settings />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText(/Not Supported/)).toBeInTheDocument()
  })

  test('renders placeholder for other settings', () => {
    render(<Settings />)
    expect(screen.getByText('Other Settings')).toBeInTheDocument()
    expect(
      screen.getByText(/Additional settings will be available/i)
    ).toBeInTheDocument()
  })

  test('component renders without crashing', () => {
    const { container } = render(<Settings />)
    expect(container).toBeTruthy()
  })
})
