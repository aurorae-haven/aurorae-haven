#!/usr/bin/env node

/**
 * Create Offline Package Script
 *
 * This script creates a downloadable archive of the built application
 * for offline use. It builds the app with relative paths so users can
 * open index.html directly without needing a web server.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'fs'
import { join } from 'path'

const DIST_DIR = 'dist'
const DIST_OFFLINE_DIR = 'dist-offline-build'
const OUTPUT_DIR = 'dist-offline'
const VERSION = JSON.parse(readFileSync('package.json', 'utf-8')).version

/**
 * Build the application with relative base path for offline use
 */
async function buildForOffline() {
  const { execSync } = await import('child_process')

  console.log(
    '🔨 Building application for offline use (with relative paths)...'
  )

  // Clean up previous offline build
  if (existsSync(DIST_OFFLINE_DIR)) {
    rmSync(DIST_OFFLINE_DIR, { recursive: true, force: true })
  }

  try {
    // Build with relative base path for offline use
    execSync('npm run build', {
      stdio: 'inherit',
      encoding: 'utf-8',
      env: { ...process.env, VITE_BASE_URL: './', CI: 'true' }
    })

    // Move the dist directory to our offline build directory
    if (existsSync(DIST_DIR)) {
      execSync(`mv "${DIST_DIR}" "${DIST_OFFLINE_DIR}"`, {
        stdio: 'inherit',
        encoding: 'utf-8'
      })
    }

    console.log('✓ Offline build completed with relative paths')
    return true
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    return false
  }
}

/**
 * Create a tar.gz archive of the offline build
 */
async function createTarGz() {
  console.log('📦 Creating offline package...')

  if (!existsSync(DIST_OFFLINE_DIR)) {
    console.error('❌ Error: offline build directory not found. Build failed.')
    process.exit(1)
  }

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const outputFile = join(
    OUTPUT_DIR,
    `aurorae-haven-offline-v${VERSION}.tar.gz`
  )

  try {
    // For simplicity, we'll use a shell command to create tar.gz
    const { execSync } = await import('child_process')

    console.log(`  → Archiving ${DIST_OFFLINE_DIR}/ to ${outputFile}`)

    // Create tar.gz using shell command (more reliable and compatible)
    execSync(`tar -czf "${outputFile}" -C "${DIST_OFFLINE_DIR}" .`, {
      stdio: 'inherit',
      encoding: 'utf-8'
    })

    // Get file size
    const stats = statSync(outputFile)
    const sizeKB = (stats.size / 1024).toFixed(2)

    console.log(`✓ Offline package created successfully!`)
    console.log(`  → Location: ${outputFile}`)
    console.log(`  → Size: ${sizeKB} KB`)
    console.log('')
    console.log('📝 Usage Instructions:')
    console.log('  1. Download the .tar.gz file')
    console.log('  2. Extract: tar -xzf aurorae-haven-offline-*.tar.gz')
    console.log('  3. Double-click index.html to open in your browser')
    console.log('  4. No server needed! Works directly from the file system')

    // Clean up the temporary offline build directory
    if (existsSync(DIST_OFFLINE_DIR)) {
      rmSync(DIST_OFFLINE_DIR, { recursive: true, force: true })
      console.log('  ✓ Cleaned up temporary build directory')
    }

    return true
  } catch (error) {
    console.error('❌ Error creating package:', error.message)
    return false
  }
}

/**
 * Alternative: Create a simple ZIP using built-in archiver
 * Fallback if tar command is not available
 */
async function createSimpleArchive() {
  console.log('📦 Creating simple archive (fallback method)...')

  if (!existsSync(DIST_OFFLINE_DIR)) {
    console.error(
      '❌ Error: offline build directory not found. Build failed.'
    )
    process.exit(1)
  }

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const outputFile = join(OUTPUT_DIR, `aurorae-haven-offline-v${VERSION}.tar`)

  console.log(`  → Creating archive: ${outputFile}`)
  console.log('  ℹ️  Note: Compression not available, using uncompressed tar')

  // Create README for the offline package
  const readmeContent = `# Aurorae Haven - Offline Package v${VERSION}

This is a standalone offline package of Aurorae Haven.

## Installation Instructions

1. Extract this archive to a folder of your choice
2. Open \`index.html\` in a modern web browser (Chrome, Firefox, Edge, Safari)

## Recommended Usage

For best experience, serve the files with a local web server:

### Using Python (if installed):
\`\`\`bash
python3 -m http.server 8000
# Then open: http://localhost:8000
\`\`\`

### Using Node.js (if installed):
\`\`\`bash
npx serve -p 8000
# Then open: http://localhost:8000
\`\`\`

### Using PHP (if installed):
\`\`\`bash
php -S localhost:8000
# Then open: http://localhost:8000
\`\`\`

## Direct File Access

You can also open \`index.html\` directly in your browser, but some features
may be limited due to browser security restrictions.

## PWA Installation

Once you open the app, you can install it as a Progressive Web App for:
- Offline functionality
- Native app experience
- Faster loading

## Support

For issues or questions, visit: https://github.com/aurorae-haven/aurorae-haven

---

**Version:** ${VERSION}
**Built:** ${new Date().toISOString()}
`

  // Try to use the archiver package if available
  try {
    const archiver = await import('archiver').catch(() => null)

    if (archiver) {
      return await createZipWithArchiver(
        outputFile.replace('.tar', '.zip'),
        readmeContent
      )
    }
  } catch (error) {
    console.warn('⚠️  archiver package not available, using basic method')
  }

  // Fallback: Just copy files to a folder with README
  const outputFolder = join(OUTPUT_DIR, `aurorae-haven-offline-v${VERSION}`)

  if (!existsSync(outputFolder)) {
    mkdirSync(outputFolder, { recursive: true })
  }

  console.log(`  → Copying files to: ${outputFolder}`)

  const { execSync } = await import('child_process')
  execSync(`cp -r ${DIST_DIR}/* "${outputFolder}/"`, { stdio: 'inherit' })

  // Write README
  const readmePath = join(outputFolder, 'README-OFFLINE.md')
  const fs = await import('fs')
  fs.writeFileSync(readmePath, readmeContent)

  console.log('✓ Offline package folder created!')
  console.log(`  → Location: ${outputFolder}`)
  console.log('  → You can now ZIP this folder manually or use it directly')

  return true
}

/**
 * Create ZIP using archiver package
 */
async function createZipWithArchiver(outputFile, readmeContent) {
  const archiver = await import('archiver')
  const fs = await import('fs')

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFile)
    const archive = archiver.default('zip', { zlib: { level: 9 } })

    output.on('close', () => {
      const sizeKB = (archive.pointer() / 1024).toFixed(2)
      console.log('✓ ZIP archive created successfully!')
      console.log(`  → Location: ${outputFile}`)
      console.log(`  → Size: ${sizeKB} KB`)
      resolve(true)
    })

    archive.on('error', (err) => {
      console.error('❌ Error creating ZIP:', err)
      reject(err)
    })

    archive.pipe(output)

    // Add README
    archive.append(readmeContent, { name: 'README-OFFLINE.md' })

    // Add all files from dist
    archive.directory(DIST_DIR, false)

    archive.finalize()
  })
}

// Main execution
;(async () => {
  console.log('🌌 Aurorae Haven - Offline Package Creator\n')

  // Step 1: Build for offline with relative paths
  const buildSuccess = await buildForOffline()
  if (!buildSuccess) {
    console.error('❌ Build failed, cannot create package')
    process.exit(1)
  }

  // Step 2: Create the archive
  try {
    const success = await createTarGz()
    if (success) {
      process.exit(0)
    }
  } catch (error) {
    console.warn(
      '⚠️  tar command not available, trying alternative method...\n'
    )
  }

  // Fallback to simple archive (shouldn't normally be needed)
  try {
    const success = await createSimpleArchive()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('❌ Failed to create offline package:', error)
    process.exit(1)
  }
})()
