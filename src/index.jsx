// src/index.js
import React, { useState, useCallback, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

// Styles
import './assets/styles/styles.css'

// Shell components
import Layout from './components/Layout.jsx'
import Toast from './components/Toast.jsx'

// Pages
import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import Sequences from './pages/Sequences.jsx'
import BrainDump from './pages/BrainDump.jsx'
import Tasks from './pages/Tasks.jsx'
import Habits from './pages/Habits.jsx'
import Stats from './pages/Stats.jsx'
import Settings from './pages/Settings.jsx'

// Utils
import { exportJSON, importJSON } from './utils/dataManager'

function RouterApp() {
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Handle GitHub Pages SPA redirect from 404.html (if you store a redirectPath there)
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath')
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath')
      const basename = import.meta.env.BASE_URL || '/'
      const path = redirectPath.replace(basename, '')
      window.history.replaceState(null, '', basename + path)
    }
  }, [])

  const showToast = useCallback((message) => {
    setToast({ visible: true, message })
  }, [])

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: '' })
  }, [])

  const handleExport = useCallback(() => {
    exportJSON()
    showToast('Data exported (aurorae_haven_data.json)')
  }, [showToast])

  const handleImport = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      if (file) {
        const result = await importJSON(file)
        showToast(result.message)
        // allow re-selecting the same file next time
        e.target.value = ''
      }
    },
    [showToast]
  )

  // Use import.meta.env.BASE_URL for Vite (GitHub Pages project site /aurorae-haven/)
  const basename = import.meta.env.BASE_URL || '/'

  return (
    <BrowserRouter basename={basename}>
      <Layout onExport={handleExport} onImport={handleImport}>
        <Routes>
          {/* Show Home page at root */}
          <Route path='/' element={<Home />} />

          {/* Explicit routes */}
          <Route path='/home' element={<Home />} />
          <Route path='/schedule' element={<Schedule />} />
          <Route path='/sequences' element={<Sequences />} />
          <Route path='/braindump' element={<BrainDump />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/habits' element={<Habits />} />
          <Route path='/stats' element={<Stats />} />
          <Route path='/settings' element={<Settings />} />

          {/* Fallback: unknown routes → home */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Layout>

      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />
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
