#!/usr/bin/env node

/**
 * Test SPA Routing Script
 * 
 * This script starts an HTTP server that mimics GitHub Pages behavior:
 * - Serves static files from dist/
 * - Returns 404.html for non-existent routes
 * - Tests the SPA routing and service worker behavior
 */

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import rateLimit from 'express-rate-limit'
import { DEFAULT_GITHUB_PAGES_BASE_PATH } from '../src/utils/configConstants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 8080
// Remove trailing slash for use as base path in Express
const BASE_PATH = DEFAULT_GITHUB_PAGES_BASE_PATH.slice(0, -1)
const DIST_DIR = join(__dirname, '..', 'dist')

const app = express()

// Rate limiter: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
})

app.use(limiter)

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Serve static files with base path
app.use(BASE_PATH, express.static(DIST_DIR))

// Handle SPA routes - return 404.html for non-existent paths
// This mimics GitHub Pages behavior
app.use(BASE_PATH, (req, res, next) => {
  const filePath = join(DIST_DIR, req.path)
  
  // If it's a file request (has extension), let it 404 naturally
  if (/\.[^/]+$/.test(req.path)) {
    console.log(`  → File request: ${req.path}`)
    return next()
  }
  
  // For navigation requests, serve 404.html
  console.log(`  → Navigation request: ${req.path}`)
  console.log(`  → Serving 404.html`)
  res.status(404).sendFile(join(DIST_DIR, '404.html'))
})

// Redirect root to base path
app.get('/', (req, res) => {
  console.log('  → Redirecting root to base path')
  res.redirect(BASE_PATH + '/')
})

app.listen(PORT, () => {
  console.log('🚀 Test server started!')
  console.log('━'.repeat(60))
  console.log(`📍 Server URL: http://localhost:${PORT}${BASE_PATH}/`)
  console.log(`📁 Serving from: ${DIST_DIR}`)
  console.log('━'.repeat(60))
  console.log('')
  console.log('📝 Test Instructions:')
  console.log(`1. Open http://localhost:${PORT}${BASE_PATH}/ in your browser`)
  console.log('2. Navigate to different pages (Schedule, Tasks, etc.)')
  console.log('3. Press F5 to refresh the page')
  console.log('4. Check the browser console for [404.html] and [RedirectHandler] logs')
  console.log('5. Check the Network tab to see if service worker is intercepting requests')
  console.log('')
  console.log('🔍 What to look for:')
  console.log('• First refresh: Should serve 404.html → redirect → load page')
  console.log('• After service worker activates: Should serve from cache (no 404.html)')
  console.log('• Check "from ServiceWorker" in Network tab for cached responses')
  console.log('')
  console.log('Press Ctrl+C to stop the server')
  console.log('━'.repeat(60))
})
