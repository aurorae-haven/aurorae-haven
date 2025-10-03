#!/usr/bin/env node
/**
 * PWA Validation Script
 * Validates that all PWA requirements are met
 */

const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '../build')
const publicDir = path.join(__dirname, '../public')

let errors = 0
let warnings = 0

function checkFile (filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`)
    return true
  } else {
    console.error(`❌ ${description} - File not found: ${filePath}`)
    errors++
    return false
  }
}

function validateJSON (filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    JSON.parse(content)
    console.log(`✅ ${description} - Valid JSON`)
    return true
  } catch (e) {
    console.error(`❌ ${description} - Invalid JSON: ${e.message}`)
    errors++
    return false
  }
}

function validateManifest () {
  const manifestPath = path.join(publicDir, 'manifest.json')
  if (!checkFile(manifestPath, 'Manifest file exists')) return
  if (!validateJSON(manifestPath, 'Manifest JSON')) return

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  // Check required fields
  const requiredFields = [
    'name',
    'short_name',
    'start_url',
    'display',
    'icons'
  ]
  requiredFields.forEach((field) => {
    if (manifest[field]) {
      console.log(`✅ Manifest has '${field}' field`)
    } else {
      console.error(`❌ Manifest missing required field: '${field}'`)
      errors++
    }
  })

  // Check icons
  if (Array.isArray(manifest.icons) && manifest.icons.length > 0) {
    console.log(`✅ Manifest has ${manifest.icons.length} icon(s)`)
  } else {
    console.error('❌ Manifest has no icons')
    errors++
  }
}

function validateServiceWorker () {
  const swPath = path.join(publicDir, 'service-worker.js')
  if (!checkFile(swPath, 'Service worker file exists')) return

  const content = fs.readFileSync(swPath, 'utf8')

  // Check for required service worker events
  const requiredEvents = ['install', 'activate', 'fetch']
  requiredEvents.forEach((event) => {
    if (content.includes(`addEventListener('${event}'`)) {
      console.log(`✅ Service worker handles '${event}' event`)
    } else {
      console.error(`❌ Service worker missing '${event}' event handler`)
      errors++
    }
  })
}

function validateIcons () {
  const icons = ['icon-192x192.svg', 'icon-512x512.svg']
  icons.forEach((icon) => {
    checkFile(path.join(publicDir, icon), `Icon file: ${icon}`)
  })
}

function validateIndexHTML () {
  const indexPath = path.join(publicDir, 'index.html')
  if (!checkFile(indexPath, 'index.html exists')) return

  const content = fs.readFileSync(indexPath, 'utf8')

  // Check for manifest link
  if (content.includes('rel="manifest"')) {
    console.log('✅ index.html links to manifest')
  } else {
    console.error('❌ index.html missing manifest link')
    errors++
  }

  // Check for theme-color
  if (content.includes('name="theme-color"')) {
    console.log('✅ index.html has theme-color meta tag')
  } else {
    console.warn('⚠️  index.html missing theme-color meta tag')
    warnings++
  }
}

function validateServiceWorkerRegistration () {
  const registrationPath = path.join(
    __dirname,
    '../src/serviceWorkerRegistration.js'
  )
  if (!checkFile(registrationPath, 'Service worker registration module exists')) { return }

  const content = fs.readFileSync(registrationPath, 'utf8')

  if (content.includes('serviceWorker') && content.includes('.register')) {
    console.log('✅ Service worker registration code present')
  } else {
    console.error('❌ Service worker registration code missing')
    errors++
  }
}

console.log('🔍 Validating PWA Implementation...\n')

console.log('📄 Manifest Validation:')
validateManifest()

console.log('\n⚙️  Service Worker Validation:')
validateServiceWorker()

console.log('\n🎨 Icons Validation:')
validateIcons()

console.log('\n📝 HTML Validation:')
validateIndexHTML()

console.log('\n🔧 Service Worker Registration Validation:')
validateServiceWorkerRegistration()

console.log('\n' + '='.repeat(50))
if (errors === 0 && warnings === 0) {
  console.log('✅ All PWA requirements met!')
  process.exit(0)
} else {
  console.log(`Results: ${errors} error(s), ${warnings} warning(s)`)
  if (errors > 0) {
    console.log('❌ PWA validation failed')
    process.exit(1)
  } else {
    console.log('⚠️  PWA validation passed with warnings')
    process.exit(0)
  }
}
