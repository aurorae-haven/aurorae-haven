# Offline Download Package

This document explains how to download and use the offline package of Aurorae Haven.

## Overview

The offline download package allows you to run Aurorae Haven on your computer without internet access and without needing to install Node.js or any build tools. This is ideal for:

- **Limited connectivity environments**: Use the app where internet is unavailable or unreliable
- **Archiving**: Keep a snapshot of a specific version
- **Distribution**: Share the app with others who don't have development tools
- **Privacy**: Run completely offline with no external connections

## Download Instructions

### Option 1: Download from Repository Branch (Recommended)

The latest offline package is always available on the `offline-releases` branch:

1. Visit the [offline-releases branch](https://github.com/aurorae-haven/aurorae-haven/tree/offline-releases)
2. Click on the `.tar.gz` file to view it
3. Click the "Download" button to download the package
4. The file will be named something like `aurorae-haven-offline-v1.0.0.tar.gz`

**Direct Download Link**: [Latest Offline Package](https://github.com/aurorae-haven/aurorae-haven/raw/offline-releases/aurorae-haven-offline-v1.0.0.tar.gz)

### Option 2: Download from GitHub Releases (Stable Versions)

For stable, tagged releases:

1. Visit the [Releases page](https://github.com/aurorae-haven/aurorae-haven/releases)
2. Find the latest release (or the version you want)
3. Download the `.tar.gz` file under "Assets"
4. Tagged releases are versioned and include changelogs

### Option 3: Download from GitHub Actions (Development Builds)

For the absolute latest build from CI/CD:

1. Visit the [GitHub Actions workflows page](https://github.com/aurorae-haven/aurorae-haven/actions/workflows/upload-pages-artifact.yml)
2. Click on the most recent successful workflow run (look for a green checkmark ✓)
3. Scroll down to the **Artifacts** section at the bottom of the page
4. Click on `offline-package` to download the `.zip` file
5. Note: Artifacts expire after 90 days

### Option 4: Build Locally (Requires Node.js)

If you have the repository cloned and Node.js installed:

```bash
# Install dependencies (first time only)
npm install

# Build and create offline package
npm run build:offline
```

The package will be created in `dist-offline/` directory.

## Installation Instructions

### Step 1: Extract the Archive

The offline package comes as a `.tar.gz` archive. Extract it:

**On Linux/macOS:**

```bash
tar -xzf aurorae-haven-offline-*.tar.gz
```

**On Windows:**

- Use 7-Zip, WinRAR, or Windows built-in extraction
- Right-click the file → Extract All...
- Or use WSL/Git Bash: `tar -xzf aurorae-haven-offline-*.tar.gz`

### Step 2: Open the Application

**Simply double-click `index.html` to open in your browser!**

1. Navigate to the extracted folder
2. Double-click `index.html` to open in your default browser
3. The app will load and work immediately

**No server needed!** The offline package is built with relative paths so it works directly from your file system.

#### Optional: Using a Local Web Server

While not required, serving through a local web server can provide additional benefits like proper PWA installation:

**Using Python:**

```bash
cd path/to/extracted/folder
python3 -m http.server 8000
```

Then open your browser to: `http://localhost:8000`

**Using Node.js:**

```bash
cd path/to/extracted/folder
npx serve -p 8000
```

Then open your browser to: `http://localhost:8000`

**Using PHP:**

```bash
cd path/to/extracted/folder
php -S localhost:8000
```

Then open your browser to: `http://localhost:8000`

### Step 3: Install as PWA (Optional but Recommended)

Once the app is loaded in your browser:

1. Look for the "Install" button in the address bar or app interface
2. Click "Install" to add Aurorae Haven to your device
3. Launch from your home screen, start menu, or app drawer

**PWA Benefits:**

- Fully offline functionality
- Native app experience
- Faster loading times
- Works even when the server is stopped

## What's Included

The offline package contains:

- **index.html**: Main application entry point
- **assets/**: JavaScript bundles and CSS stylesheets
  - React application code
  - Markdown parser and sanitizer
  - Calendar components
  - Optimized and minified
- **sw.js**: Service worker for offline functionality
- **manifest.webmanifest**: PWA manifest
- **icons**: App icons for PWA installation
- **404.html**: Fallback page for routing

**Total Size**: ~105 KB compressed, ~300 KB extracted

## Technical Details

### Build Process

The offline package is automatically generated during the CI/CD pipeline:

1. Vite builds the React application (`npm run build`)
2. PWA assets are generated automatically (service worker, manifest)
3. All files are bundled and optimized
4. A `.tar.gz` archive is created containing everything
5. The archive is uploaded to multiple locations:
   - **Repository Branch**: Pushed to `offline-releases` branch (always available)
   - **GitHub Releases**: Attached to tagged releases (stable versions)
   - **GitHub Actions Artifacts**: Available for 90 days (development builds)

### Browser Compatibility

The offline package works in all modern browsers:

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Offline Functionality

The app includes a service worker that:

- Caches all static assets automatically
- Enables full offline functionality after first visit
- Provides fast loading on subsequent visits
- Handles offline scenarios gracefully

### Data Storage

All user data is stored locally in your browser:

- **IndexedDB**: Tasks, sequences, habits, statistics
- **LocalStorage**: Brain dump notes, settings
- **OPFS**: File attachments (if supported)

**Privacy**: No data is sent to external servers. Everything stays on your device.

## Troubleshooting

### App doesn't load when opening index.html directly

**Solution**: The offline package is built with relative paths and should work directly. If you experience issues:

1. Make sure you extracted all files properly
2. Try a different browser (Chrome, Firefox, Edge, Safari)
3. Check browser console for specific errors (F12 → Console)
4. As a last resort, use a local web server (see Step 2)

### Service worker not registering

**Solution**: Ensure you're accessing via `http://` or `https://`, not `file://`

**Why**: Service workers require a secure context or localhost.

### PWA install button doesn't appear

**Check**:

1. Are you using HTTPS or localhost?
2. Is the app loaded through a web server?
3. Have you visited the site at least once?
4. Does your browser support PWA installation?

### Blank page or errors

**Solutions**:

1. Check browser console for errors (F12 → Console tab)
2. Clear browser cache and reload
3. Try a different browser
4. Ensure all files were extracted properly

## Updating the Offline Package

To get the latest version:

1. Download a new offline package from GitHub Actions
2. Extract to a new folder (or replace old files)
3. Your data is stored in the browser, not in the app files, so it will persist

**Note**: If you want to backup your data first:

1. Open the current app
2. Go to Settings
3. Click "Export" to save your data as JSON
4. After updating, use "Import" to restore your data

## Security Considerations

- The offline package is a static snapshot of the application code
- All code is open source and can be inspected
- No external network requests are made (except for CDN resources if configured)
- All user data stays on your device
- Content Security Policy (CSP) is enforced to prevent XSS attacks

## FAQ

**Q: Do I need internet to use the offline package?**
A: No! Once extracted and opened, the app works completely offline. The service worker caches everything after the first load.

**Q: Can I share this with others?**
A: Yes! The offline package is freely distributable under the project's license.

**Q: How often should I update?**
A: Check for updates when new features are released or bugs are fixed. Your data will persist across updates.

**Q: Can I use this on mobile devices?**
A: Yes! Extract on your computer, set up a local server, and access from your mobile device on the same network. Or use the PWA installation method.

**Q: What if I need to move to a different computer?**
A: Export your data (Settings → Export), transfer the JSON file, and import on the new device.

## Support

For issues or questions:

- Open an issue on [GitHub](https://github.com/aurorae-haven/aurorae-haven/issues)
- Check existing [documentation](../docs/)
- Review the [README](../README.md)

## License

The offline package is distributed under the same license as the main project (see [LICENSE](../LICENSE)).
