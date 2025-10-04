import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

// Import styles
import './assets/styles/styles.css'

// Import components
import Layout from './components/Layout'
import Toast from './components/Toast'

// Import pages
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import Sequences from './pages/Sequences'
import BrainDump from './pages/BrainDump'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Stats from './pages/Stats'
import Settings from './pages/Settings'

// Import utilities
import { exportJSON, importJSON } from './utils/dataManager'

function App() {
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Handle GitHub Pages SPA redirect from 404.html
  React.useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath')
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath')
      const basename = process.env.PUBLIC_URL || ''
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
        // Reset the input so the same file can be selected again
        e.target.value = ''
      }
    },
    [showToast]
  )

  // Use basename for GitHub Pages deployment
  const basename = process.env.PUBLIC_URL || ''

  return (
    <BrowserRouter basename={basename}>
      <Layout onExport={handleExport} onImport={handleImport}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/schedule' element={<Schedule />} />
          <Route path='/sequences' element={<Sequences />} />
          <Route path='/braindump' element={<BrainDump />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/habits' element={<Habits />} />
          <Route path='/stats' element={<Stats />} />
          <Route path='/settings' element={<Settings />} />
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

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('[PWA] App is ready for offline use!')
  },
  onUpdate: (registration) => {
    console.log('[PWA] New version available! Please refresh to update.')
  }
})
