# Aurorae Haven - Offline Package v{{VERSION}}

Welcome to the offline version of Aurorae Haven! This package contains everything you need to run the app locally.

## Quick Start

### 🚀 Easy Start (Recommended)

**If you have Node.js installed**, simply double-click the launcher for your platform:

- **Windows**: Double-click `start-aurorae-haven.bat`
- **macOS**: Double-click `start-aurorae-haven.command` (or run `start-aurorae-haven.sh` in Terminal)
- **Linux**: Run `./start-aurorae-haven.sh` in Terminal

The launcher will automatically:
1. Start a local web server
2. Open Aurorae Haven in your default browser
3. Keep running until you close the window (press Ctrl+C to stop)

**Don't have Node.js?** Download it from [nodejs.org](https://nodejs.org/) (free and open source)

### 📌 Alternative: Manual Server Setup

If you prefer manual control or have issues with the launcher:

#### Option 1: Using the Embedded Server

If you have Node.js installed:

```bash
node embedded-server.js
```

This will start a server and open your browser automatically.

#### Option 2: Using Python

If you have Python 3 installed:

```bash
python3 -m http.server 8000
# Then open: http://localhost:8000
```

#### Option 3: Using Node.js Serve

```bash
npx serve -p 8000
# Then open: http://localhost:8000
```

#### Option 4: Using PHP

```bash
php -S localhost:8000
# Then open: http://localhost:8000
```

## What's Included

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

The package is optimized and compressed for efficient downloading.

## Progressive Web App (PWA)

Once you've opened the app in your browser:

1. Look for the "Install" button in your browser's address bar
2. Click "Install" to add Aurorae Haven to your device
3. The app will work offline after the first visit

**Benefits:**

- ✅ Fully offline functionality after first load
- ✅ Native app experience
- ✅ Faster loading times
- ✅ Accessible from your home screen/start menu

## Features

- 📅 **Schedule**: Plan your day with time blocks
- ⏱️ **Sequences**: Run daily routines with step-by-step timers
- 📝 **Brain Dump**: Quickly capture thoughts and ideas
- ✓ **Tasks**: Prioritize using the Eisenhower matrix
- 🌱 **Habits**: Track streaks and celebrate small wins
- 📊 **Stats**: View your progress and insights

## Privacy & Data

All your data is stored locally in your browser:

- **IndexedDB**: Tasks, sequences, habits, statistics
- **LocalStorage**: Brain dump notes, settings

**Privacy**: No data is sent to external servers. Everything stays on your device.

## Troubleshooting

### Launcher doesn't work

**Problem**: Double-clicking the launcher does nothing or shows an error.

**Solutions**:
1. Make sure Node.js is installed: https://nodejs.org/
2. On Linux/macOS, make the script executable: `chmod +x start-aurorae-haven.sh`
3. Try running manually: `node embedded-server.js`

### Port already in use

**Problem**: Error message says port 8765 is already in use.

**Solutions**:
1. Close any other applications using that port
2. The embedded server uses port 8765 by default - if you have another Aurorae Haven instance running, close it first
3. Use an alternative server (see Manual Server Setup above)

### Blank page when opening index.html directly

**Problem**: Double-clicking `index.html` shows a blank page.

**Solution**: You cannot open `index.html` directly due to browser security restrictions with ES modules. You must use one of the server methods described in Quick Start.

### Service worker errors

**Solution**: Ensure you're accessing via `http://localhost` or `http://127.0.0.1`. Service workers require a secure context.

### Browser compatibility issues

**Tested browsers:**

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Exporting Your Data

To backup or transfer your data:

1. Open the app
2. Click "Export" in the header
3. Save the JSON file
4. To restore, click "Import" and select the file

## Support

For issues or questions:

- GitHub: https://github.com/aurorae-haven/aurorae-haven/issues
- Documentation: https://github.com/aurorae-haven/aurorae-haven/tree/main/docs

---

**Version:** {{VERSION}}  
**Built:** {{BUILD_DATE}}  
**License:** ISC
