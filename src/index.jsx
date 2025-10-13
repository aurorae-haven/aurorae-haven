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
import { normalizeRedirectPath } from './utils/redirectHelpers'

// Component to handle GitHub Pages 404 redirect
function RedirectHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[RedirectHandler] Checking for redirectPath in sessionStorage...')
    const redirectPath = sessionStorage.getItem('redirectPath')
    console.log('[RedirectHandler] redirectPath:', redirectPath)
    
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath')
      const basename = import.meta.env.BASE_URL || '/'
      console.log('[RedirectHandler] basename:', basename)
      
      // Use shared utility to normalize the redirect path
      const path = normalizeRedirectPath(redirectPath, basename)
      console.log('[RedirectHandler] Normalized path:', path)
      
      // Navigate to the correct route
      console.log('[RedirectHandler] Navigating to:', path)
      navigate(path, { replace: true })
    } else {
      console.log('[RedirectHandler] No redirectPath found, normal page load')
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

  // Use import.meta.env.BASE_URL for Vite (GitHub Pages project site e.g., /repo-name/)
  // For offline builds with BASE_URL='./', normalize to '/' for React Router
  const baseUrl = import.meta.env.BASE_URL || '/'
  const basename = baseUrl === './' ? '/' : baseUrl

  console.log('[RouterApp] BASE_URL:', import.meta.env.BASE_URL)
  console.log('[RouterApp] baseUrl:', baseUrl)
  console.log('[RouterApp] basename for BrowserRouter:', basename)

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

// Clean up old service workers registered at wrong scope
// This fixes the issue where an old SW at root scope (/) interferes with the new SW at /aurorae-haven/
if ('serviceWorker' in navigator) {
  const expectedScope = new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
  console.log('[ServiceWorker] Expected scope:', expectedScope)
  
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    console.log('[ServiceWorker] Found', registrations.length, 'registered service worker(s)')
    
    registrations.forEach((registration) => {
      const scopeUrl = registration.scope
      console.log('[ServiceWorker] Checking SW with scope:', scopeUrl)
      
      // Unregister service workers with wrong scope
      if (scopeUrl !== expectedScope) {
        console.log('[ServiceWorker] Unregistering SW with wrong scope:', scopeUrl)
        registration.unregister().then((success) => {
          if (success) {
            console.log('[ServiceWorker] Successfully unregistered old SW')
          }
        }).catch((error) => {
          console.error('[ServiceWorker] Failed to unregister SW:', error)
        })
      } else {
        console.log('[ServiceWorker] SW scope is correct, keeping it')
      }
    })
  }).catch((error) => {
    console.error('[ServiceWorker] Error checking registrations:', error)
  })
}

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <RouterApp />
  </React.StrictMode>
)

// Service worker is automatically registered by vite-plugin-pwa via registerSW.js
// The plugin generates sw.js with proper navigation fallback configuration

// Log service worker status for debugging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    console.log('[ServiceWorker] Service worker is active and ready')
    console.log('[ServiceWorker] Scope:', registration.scope)
    console.log('[ServiceWorker] Active SW:', registration.active?.scriptURL)
  }).catch((error) => {
    console.error('[ServiceWorker] No service worker is ready yet:', error.message)
  })
}
