import React, { useState, useEffect, useCallback } from 'react'
import { getSettings, updateSetting } from '../utils/settingsManager'
import {
  isFileSystemAccessSupported,
  requestDirectoryAccess,
  getCurrentDirectoryHandle,
  setDirectoryHandle,
  verifyDirectoryHandle,
  startAutoSave,
  stopAutoSave,
  performAutoSave,
  getLastSaveTimestamp,
  cleanOldSaveFiles,
  loadAndImportLastSave
} from '../utils/autoSaveFS'
import { reloadPageAfterDelay, IMPORT_SUCCESS_MESSAGE } from '../utils/importData'

// Time constant
const MS_PER_MINUTE = 60 * 1000 // 60 seconds * 1000 milliseconds

function Settings() {
  const [settings, setSettingsState] = useState(getSettings())
  const [directoryName, setDirectoryName] = useState(null)
  const [lastSaveTime, setLastSaveTime] = useState(null)
  const [message, setMessage] = useState('')
  const [isConfiguring, setIsConfiguring] = useState(false)

  // Check if File System Access API is supported
  const fsSupported = isFileSystemAccessSupported()

  // Load directory handle and last save time on mount
  useEffect(() => {
    const handle = getCurrentDirectoryHandle()
    if (handle) {
      setDirectoryName(handle.name)
    }

    const lastSave = getLastSaveTimestamp()
    if (lastSave) {
      setLastSaveTime(new Date(lastSave))
    }
  }, [])

  // Update last save time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const lastSave = getLastSaveTimestamp()
      if (lastSave) {
        setLastSaveTime(new Date(lastSave))
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const showMessage = useCallback((msg, duration = 3000) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }, [])

  const handleSelectDirectory = useCallback(async () => {
    setIsConfiguring(true)
    try {
      const handle = await requestDirectoryAccess()
      if (handle) {
        setDirectoryName(handle.name)
        setDirectoryHandle(handle)

        // Update settings
        const newSettings = updateSetting('autoSave.directoryConfigured', true)
        setSettingsState(newSettings)

        showMessage(`Directory selected: ${handle.name}`)

        // If auto-save is enabled, restart it
        if (settings.autoSave.enabled) {
          stopAutoSave()
          startAutoSave(settings.autoSave.intervalMinutes * MS_PER_MINUTE)
        }
      }
    } catch (error) {
      showMessage('Failed to select directory: ' + error.message)
    } finally {
      setIsConfiguring(false)
    }
  }, [settings.autoSave.enabled, settings.autoSave.intervalMinutes, showMessage])

  const handleToggleAutoSave = useCallback(
    async (enabled) => {
      // Check if directory is configured
      if (enabled && !getCurrentDirectoryHandle()) {
        showMessage('Please select a directory first')
        return
      }

      // Verify directory handle is still valid
      const handle = getCurrentDirectoryHandle()
      if (enabled && handle) {
        const isValid = await verifyDirectoryHandle(handle)
        if (!isValid) {
          showMessage('Directory access expired. Please select the directory again.')
          setDirectoryName(null)
          return
        }
      }

      const newSettings = updateSetting('autoSave.enabled', enabled)
      setSettingsState(newSettings)

      if (enabled) {
        startAutoSave(settings.autoSave.intervalMinutes * MS_PER_MINUTE)
        showMessage('Auto-save enabled')
      } else {
        stopAutoSave()
        showMessage('Auto-save disabled')
      }
    },
    [settings.autoSave.intervalMinutes, showMessage]
  )

  const handleIntervalChange = useCallback(
    (intervalMinutes) => {
      const newSettings = updateSetting('autoSave.intervalMinutes', intervalMinutes)
      setSettingsState(newSettings)

      // Restart auto-save if enabled
      if (settings.autoSave.enabled) {
        stopAutoSave()
        startAutoSave(intervalMinutes * MS_PER_MINUTE)
      }

      showMessage(`Save interval updated to ${intervalMinutes} minutes`)
    },
    [settings.autoSave.enabled, showMessage]
  )

  const handleKeepCountChange = useCallback((keepCount) => {
    const newSettings = updateSetting('autoSave.keepCount', keepCount)
    setSettingsState(newSettings)
    showMessage(`Will keep ${keepCount} most recent save files`)
  }, [showMessage])

  const handleManualSave = useCallback(async () => {
    setIsConfiguring(true)
    try {
      const result = await performAutoSave()
      if (result.success) {
        setLastSaveTime(new Date(result.timestamp))
        showMessage('Data saved successfully')
      } else {
        showMessage('Save failed: ' + result.error)
      }
    } catch (error) {
      showMessage('Save failed: ' + error.message)
    } finally {
      setIsConfiguring(false)
    }
  }, [showMessage])

  const handleCleanOldFiles = useCallback(async () => {
    setIsConfiguring(true)
    try {
      const deletedCount = await cleanOldSaveFiles(settings.autoSave.keepCount)
      showMessage(`Cleaned up ${deletedCount} old save file(s)`)
    } catch (error) {
      showMessage('Cleanup failed: ' + error.message)
    } finally {
      setIsConfiguring(false)
    }
  }, [settings.autoSave.keepCount, showMessage])

  const handleLoadLastSave = useCallback(async () => {
    setIsConfiguring(true)
    try {
      const result = await loadAndImportLastSave()
      if (result.success) {
        showMessage(IMPORT_SUCCESS_MESSAGE)
        // Reload page after delay to apply imported data
        reloadPageAfterDelay(1500)
      } else {
        showMessage('Load failed: ' + result.error)
        setIsConfiguring(false)
      }
    } catch (error) {
      showMessage('Load failed: ' + error.message)
      setIsConfiguring(false)
    }
  }, [showMessage])

  const formatTimeSince = (date) => {
    if (!date) return 'Never'

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`

    const days = Math.floor(hours / 24)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  return (
    <div className='card'>
      <div className='card-h'>
        <strong>Settings</strong>
        <span className='small'>Customize your experience</span>
      </div>
      <div className='card-b'>
        {/* Auto-Save Settings Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
            Automatic Save
          </h3>

          {!fsSupported && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px'
              }}
            >
              <strong>⚠️ Not Supported</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                Your browser does not support the File System Access API. Auto-save
                to a local directory is not available. Please use the Export button
                to manually save your data.
              </p>
            </div>
          )}

          {fsSupported && (
            <>
              {/* Directory Configuration */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor='save-directory'
                  style={{ display: 'block', marginBottom: '0.5rem' }}
                >
                  <strong>Save Directory</strong>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    id='save-directory'
                    type='text'
                    value={directoryName || 'Not configured'}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                  <button
                    onClick={handleSelectDirectory}
                    disabled={isConfiguring}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isConfiguring ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {directoryName ? 'Change' : 'Select'} Directory
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                  Choose a folder where automatic saves will be stored
                </small>
              </div>

              {/* Enable/Disable Auto-Save */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type='checkbox'
                    checked={settings.autoSave.enabled}
                    onChange={(e) => handleToggleAutoSave(e.target.checked)}
                    disabled={!directoryName}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <strong>Enable Automatic Save</strong>
                </label>
                <small style={{ display: 'block', marginTop: '0.25rem', marginLeft: '1.5rem', color: '#666' }}>
                  Automatically save all data at regular intervals
                </small>
              </div>

              {/* Save Interval */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor='save-interval'
                  style={{ display: 'block', marginBottom: '0.5rem' }}
                >
                  <strong>Save Interval (minutes)</strong>
                </label>
                <input
                  id='save-interval'
                  type='number'
                  min='1'
                  max='60'
                  value={settings.autoSave.intervalMinutes}
                  onChange={(e) =>
                    handleIntervalChange(parseInt(e.target.value, 10) || 5)
                  }
                  disabled={!settings.autoSave.enabled}
                  style={{
                    width: '100px',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                  How often to automatically save (1-60 minutes)
                </small>
              </div>

              {/* Keep Count */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor='keep-count'
                  style={{ display: 'block', marginBottom: '0.5rem' }}
                >
                  <strong>Keep Recent Files</strong>
                </label>
                <input
                  id='keep-count'
                  type='number'
                  min='1'
                  max='100'
                  value={settings.autoSave.keepCount}
                  onChange={(e) =>
                    handleKeepCountChange(parseInt(e.target.value, 10) || 10)
                  }
                  style={{
                    width: '100px',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                  Number of most recent save files to keep (older files will be deleted)
                </small>
              </div>

              {/* Last Save Time */}
              <div style={{ marginBottom: '1rem' }}>
                <strong>Last Save: </strong>
                <span>{formatTimeSince(lastSaveTime)}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleManualSave}
                  disabled={!directoryName || isConfiguring}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !directoryName || isConfiguring ? 'not-allowed' : 'pointer'
                  }}
                >
                  Save Now
                </button>
                <button
                  onClick={handleLoadLastSave}
                  disabled={!directoryName || isConfiguring}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !directoryName || isConfiguring ? 'not-allowed' : 'pointer'
                  }}
                >
                  Load Last Save
                </button>
                <button
                  onClick={handleCleanOldFiles}
                  disabled={!directoryName || isConfiguring}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ffc107',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !directoryName || isConfiguring ? 'not-allowed' : 'pointer'
                  }}
                >
                  Clean Old Files
                </button>
              </div>
            </>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div
            style={{
              padding: '0.75rem',
              marginTop: '1rem',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              color: '#155724'
            }}
          >
            {message}
          </div>
        )}

        {/* Other Settings Placeholder */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Other Settings</h3>
          <p className='small' style={{ color: '#666' }}>
            Additional settings will be available here in future updates...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
