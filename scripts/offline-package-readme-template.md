# Aurorae Haven - Offline Package v{{VERSION}}

Welcome to the offline version of Aurorae Haven! This package contains everything you need to run the app locally.

## Quick Start

### ⚠️ Important: A Local Web Server is Required

Due to browser security restrictions with ES modules, you **cannot** simply double-click `index.html`. Instead, you must serve the files through a local web server.

### Option 1: Using Python (Recommended)

If you have Python 3 installed:

```bash
# Navigate to this directory, then run:
python3 -m http.server 8000

# Open your browser to: http://localhost:8000
```

### Option 2: Using Node.js

If you have Node.js installed:

```bash
# Navigate to this directory, then run:
npx serve -p 8000

# Open your browser to: http://localhost:8000
```

### Option 3: Using PHP

If you have PHP installed:

```bash
# Navigate to this directory, then run:
php -S localhost:8000

# Open your browser to: http://localhost:8000
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

### Blank page when opening

**Solution**: Make sure you're using a local web server (see Quick Start above). Opening `index.html` directly will not work due to browser security restrictions.

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
