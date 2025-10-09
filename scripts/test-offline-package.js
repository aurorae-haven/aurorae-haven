#!/usr/bin/env node

/**
 * Test Offline Package Script
 *
 * This script validates that the offline package works correctly.
 * It extracts the package and provides instructions for testing.
 */

import { existsSync, mkdirSync, rmSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const TEST_DIR = 'test-offline-package'
const PACKAGE_DIR = join(__dirname, '..', 'dist-offline')
const TEST_PORT = parseInt(process.env.TEST_PORT || '8766', 10)

// Find the offline package
function findOfflinePackage() {
  if (!existsSync(PACKAGE_DIR)) {
    return null
  }

  const files = readdirSync(PACKAGE_DIR)
  const tarGzFile = files.find((f) => f.endsWith('.tar.gz'))

  if (tarGzFile) {
    return join(PACKAGE_DIR, tarGzFile)
  }
  return null
}

/**
 * Extract the offline package
 */
async function extractPackage(packagePath) {
  console.log('📦 Extracting offline package...')

  // Clean up test directory
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true })
  }
  mkdirSync(TEST_DIR, { recursive: true })

  // Extract the package using spawnSync to prevent command injection
  const { spawnSync } = await import('child_process')
  try {
    const result = spawnSync('tar', ['-xzf', packagePath, '-C', TEST_DIR], {
      stdio: 'inherit'
    })

    if (result.error) {
      throw result.error
    }

    if (result.status !== 0) {
      throw new Error(`tar command failed with exit code ${result.status}`)
    }

    console.log('✓ Package extracted successfully')
  } catch (error) {
    throw new Error(`Failed to extract package: ${error.message}`)
  }

  // Verify files exist
  const requiredFiles = [
    'index.html',
    'assets',
    'sw.js',
    'manifest.webmanifest'
  ]
  const missingFiles = requiredFiles.filter(
    (file) => !existsSync(join(TEST_DIR, file))
  )

  if (missingFiles.length > 0) {
    throw new Error(
      `Missing required files in package: ${missingFiles.join(', ')}`
    )
  }

  console.log('✓ All required files present')
  return true
}

/**
 * Validate the extracted package structure
 */
function validatePackage() {
  console.log('\n🔍 Validating package structure...')

  const checks = [
    {
      name: 'index.html exists',
      file: 'index.html',
      required: true
    },
    {
      name: 'Assets directory exists',
      file: 'assets',
      required: true
    },
    {
      name: 'Service worker exists',
      file: 'sw.js',
      required: true
    },
    {
      name: 'PWA manifest exists',
      file: 'manifest.webmanifest',
      required: true
    },
    {
      name: 'Icons exist',
      file: 'icon-192x192.svg',
      required: false
    }
  ]

  let passed = 0
  let failed = 0

  checks.forEach((check) => {
    const path = join(TEST_DIR, check.file)
    const exists = existsSync(path)

    if (exists) {
      console.log(`  ✓ ${check.name}`)
      passed++
    } else {
      if (check.required) {
        console.log(`  ✗ ${check.name} (REQUIRED)`)
        failed++
      } else {
        console.log(`  ⚠ ${check.name} (optional, not found)`)
      }
    }
  })

  if (failed > 0) {
    throw new Error(
      `Package validation failed: ${failed} required file(s) missing`
    )
  }

  console.log(
    `\n✓ Package structure valid (${passed}/${checks.length} checks passed)`
  )
  return true
}

/**
 * Check if index.html uses relative paths
 */
function validateRelativePaths() {
  console.log('\n🔍 Validating relative paths...')

  const indexPath = join(TEST_DIR, 'index.html')
  const content = readFileSync(indexPath, 'utf-8')

  // Check for relative paths
  const hasRelativePaths =
    content.includes('src="./') || content.includes('href="./')

  if (!hasRelativePaths) {
    console.log('  ⚠ Warning: index.html may not use relative paths')
    console.log('    This could cause issues when opening without a server')
  } else {
    console.log('  ✓ index.html uses relative paths')
  }

  // Check for absolute GitHub Pages paths
  const hasAbsolutePaths = content.includes('/aurorae-haven/')

  if (hasAbsolutePaths) {
    console.log('  ✗ ERROR: Found GitHub Pages absolute paths in index.html')
    throw new Error(
      'Package contains absolute paths - offline mode will not work'
    )
  } else {
    console.log('  ✓ No absolute GitHub Pages paths found')
  }

  return true
}

/**
 * Print test instructions
 */
function printInstructions() {
  console.log('\n' + '='.repeat(70))
  console.log('✅ Package validation complete!')
  console.log('='.repeat(70))
  console.log('\n📝 To test the offline package:')
  console.log('\n  Option 1: Using Python (recommended)')
  console.log('  ----------------------------------------')
  console.log(`  cd ${TEST_DIR}`)
  console.log(`  python3 -m http.server ${TEST_PORT}`)
  console.log(`  # Then open: http://localhost:${TEST_PORT}`)

  console.log('\n  Option 2: Using Node.js')
  console.log('  ----------------------------------------')
  console.log(`  cd ${TEST_DIR}`)
  console.log(`  npx serve -p ${TEST_PORT}`)
  console.log(`  # Then open: http://localhost:${TEST_PORT}`)

  console.log('\n  Option 3: Using PHP')
  console.log('  ----------------------------------------')
  console.log(`  cd ${TEST_DIR}`)
  console.log(`  php -S localhost:${TEST_PORT}`)
  console.log(`  # Then open: http://localhost:${TEST_PORT}`)

  console.log('\n📋 Manual Test Checklist:')
  console.log('  [ ] App loads and displays home page')
  console.log('  [ ] Navigation works between all pages')
  console.log('  [ ] No errors in browser console (F12)')
  console.log('  [ ] Service worker registers successfully')
  console.log('  [ ] PWA manifest is detected')
  console.log('  [ ] Data can be saved and loaded')
  console.log('  [ ] Export/Import functionality works')

  console.log('\n⚠️  Important Notes:')
  console.log('  • The offline package REQUIRES a local web server')
  console.log('  • Opening index.html directly (file://) will NOT work')
  console.log(
    '  • This is due to browser security restrictions with ES modules'
  )
  console.log('  • Users must use one of the server options above')

  console.log('\n🧹 Cleanup:')
  console.log(`  rm -rf ${TEST_DIR}  # Remove test directory when done`)
  console.log('')
}

/**
 * Main test execution
 */
async function main() {
  console.log('🌌 Aurorae Haven - Offline Package Tester\n')

  try {
    // Step 0: Find package
    const packagePath = findOfflinePackage()

    if (!packagePath) {
      throw new Error(
        'Offline package not found.\n' +
          '  Please run: npm run build:offline\n' +
          `  Expected location: ${PACKAGE_DIR}/*.tar.gz`
      )
    }

    console.log(`Found package: ${packagePath}`)

    // Step 1: Extract package
    await extractPackage(packagePath)

    // Step 2: Validate structure
    validatePackage()

    // Step 3: Validate relative paths
    validateRelativePaths()

    // Step 4: Print instructions
    printInstructions()

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Validation failed:')
    console.error(`  ${error.message}`)
    process.exit(1)
  }
}

// Run tests
main()
