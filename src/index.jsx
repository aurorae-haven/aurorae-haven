// src/index.js
import React, { useState, useCallback, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

// Styles
import './assets/styles/styles.css'

// Shell components
import Layout from './components/Layout.jsx'
import Toast from './components/Toast.jsx'

// Pages
import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import Routines from './pages/Routines.jsx'
import Notes from './pages/Notes.jsx'
import Tasks from './pages/Tasks.jsx'
import Habits from './pages/Habits.jsx'
import Stats from './pages/Stats.jsx'
import Library from './pages/Library.jsx'
import Settings from './pages/Settings.jsx'

// Utils
import {
  exportJSON,
  importJSON,
  reloadPageAfterDelay,
  IMPORT_SUCCESS_MESSAGE
} from './utils/dataManager'

// Component to handle GitHub Pages 404 redirect
function RedirectHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath')
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath')
      const basename = import.meta.env.BASE_URL || '/'
      // Remove the basename from the redirectPath to get the route.
      // The first replacement removes the basename (e.g., '/aurorae-haven/' or './') from the redirectPath,
      // ensuring we get the route relative to the app root. The second replacement normalizes the result
      // so it starts with a single leading slash, handling cases where the removal may leave multiple slashes
      // or no leading slash at all. This ensures React Router receives a properly formatted route.
      const path = redirectPath.replace(basename, '/').replace(/^\/+/, '/')
      // Navigate to the correct route
      navigate(path, { replace: true })
    }
  }, [navigate])

  return null
}

function RouterApp() {
  const [toast, setToast] = useState({ visible: false, message: '' })

  const showToast = useCallback((message) => {
    setToast({ visible: true, message })
  }, [])

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: '' })
  }, [])

  const handleExport = useCallback(async () => {
    try {
      await exportJSON()
      showToast('Data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      showToast('Export failed: ' + error.message)
    }
  }, [showToast])

  const handleImport = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      if (file) {
        try {
          await importJSON(file)
          showToast(IMPORT_SUCCESS_MESSAGE)
          // Use shared utility function for page reload
          reloadPageAfterDelay(1500)
        } catch (error) {
          console.error('Import failed:', error)
          showToast('Import failed: ' + error.message)
        }
        // allow re-selecting the same file next time
        e.target.value = ''
      }
    },
    [showToast]
  )

  // Use import.meta.env.BASE_URL for Vite (GitHub Pages project site /aurorae-haven/)
  // For offline builds with BASE_URL='./', normalize to '/' for React Router
  const baseUrl = import.meta.env.BASE_URL || '/'
  const basename = baseUrl === './' ? '/' : baseUrl

  return (
    <BrowserRouter basename={basename}>
      <RedirectHandler />
      <Layout onExport={handleExport} onImport={handleImport}>
        <Routes>
          {/* Show Home page at root */}
          <Route path='/' element={<Home />} />

          {/* Explicit routes */}
          <Route path='/home' element={<Home />} />
          <Route path='/schedule' element={<Schedule />} />
          <Route path='/routines' element={<Routines />} />
          {/* Legacy route redirect */}
          <Route path='/sequences' element={<Navigate to='/routines' replace />} />
          <Route path='/braindump' element={<Notes />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/habits' element={<Habits />} />
          <Route path='/stats' element={<Stats />} />
          <Route path='/library' element={<Library />} />
          <Route path='/settings' element={<Settings />} />

          {/* Fallback: unknown routes → home */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Layout>

      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={hideToast}
      />
    </BrowserRouter>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <RouterApp />
  </React.StrictMode>
)

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[PWA] App is ready for offline use!')
  },
  onUpdate: () => {
    console.log('[PWA] New version available! Please refresh to update.')
  }
})
