#!/usr/bin/env node

/**
 * Embedded Server for Aurorae Haven Offline Package
 * 
 * This is a lightweight static file server that automatically opens
 * the application in the default browser. It's designed to provide
 * a double-click experience for offline users.
 */

import { createServer } from 'http'
import { readFile, stat } from 'fs/promises'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const PORT = 8765
const HOST = '127.0.0.1'
const ROOT_DIR = __dirname

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.webmanifest': 'application/manifest+json'
}

/**
 * Open URL in default browser
 */
function openBrowser(url) {
  const platform = process.platform
  let command
  let args

  switch (platform) {
    case 'darwin':
      command = 'open'
      args = [url]
      break
    case 'win32':
      command = 'cmd'
      args = ['/c', 'start', '', url]
      break
    default:
      command = 'xdg-open'
      args = [url]
  }

  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore'
  })
  
  child.on('error', (error) => {
    console.error('Failed to open browser automatically.')
    console.log(`Please open your browser and navigate to: ${url}`)
  })
  
  child.unref()
}

/**
 * Serve static files
 */
async function serveFile(filePath, res) {
  try {
    const stats = await stat(filePath)
    
    if (!stats.isFile()) {
      res.writeHead(404)
      res.end('Not Found')
      return
    }

    const ext = extname(filePath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
    
    const content = await readFile(filePath)
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stats.size,
      'Cache-Control': 'public, max-age=0'
    })
    res.end(content)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404)
      res.end('Not Found')
    } else {
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  }
}

/**
 * Request handler
 */
async function handleRequest(req, res) {
  let pathname = new URL(req.url, `http://${req.headers.host}`).pathname
  
  // Normalize path
  if (pathname === '/') {
    pathname = '/index.html'
  }
  
  // Security: prevent directory traversal
  if (pathname.includes('..')) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  
  let filePath = join(ROOT_DIR, pathname)
  
  // Check if file exists
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      await serveFile(filePath, res)
      return
    }
  } catch (error) {
    // File doesn't exist, continue to SPA fallback
  }
  
  // SPA fallback: serve index.html for routes that don't match files
  // This allows React Router to handle client-side routing
  const indexPath = join(ROOT_DIR, 'index.html')
  await serveFile(indexPath, res)
}

/**
 * Start server
 */
function startServer() {
  const server = createServer(handleRequest)
  
  server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`
    
    console.log('━'.repeat(60))
    console.log('🌌 Aurorae Haven - Offline Server')
    console.log('━'.repeat(60))
    console.log(`\n✓ Server running at: ${url}`)
    console.log(`✓ Opening in your default browser...`)
    console.log(`\nPress Ctrl+C to stop the server\n`)
    
    // Open browser after short delay
    setTimeout(() => openBrowser(url), 1000)
  })
  
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`)
      console.error(`Please close the other application or use a different port.\n`)
      process.exit(1)
    } else {
      console.error('Server error:', error)
      process.exit(1)
    }
  })
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...')
    server.close(() => {
      console.log('✓ Server stopped')
      process.exit(0)
    })
  })
}

// Start the server
startServer()
