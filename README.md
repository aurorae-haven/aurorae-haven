# 🌌 Aurorae Haven

> **A calm, astro-themed productivity app designed for neurodivergent users.**
> Manage routines, tasks, habits, notes, and stats with Markdown import/export, reminders, gamification, and secure
> local/mobile use.

---

## ✨ Features

- **Progressive Web App (PWA)**: Install on any device, works offline
- **Routines**: Create, edit, and run daily routines with timers
- **Tasks**: Prioritise using the Eisenhower matrix
- **Habits**: Track streaks and small wins
- **Notes & Brain Dump**: Markdown-ready with comprehensive import/export (`.json` for full backup, `.md` for content only)
- **Stats Foundation**: Track routine time and structured progress with IndexedDB
- **Auto-Backup**: Automatic backups every 24 hours to prevent data loss
- **IndexedDB Storage**: Fast, reliable structured data storage (up to 50MB+)
- **File Attachments**: OPFS support for attaching files to notes
- **Gamification** _(v2.0+)_: XP, levels, achievements, confetti/haptics
- **Reminders** _(v2.0+)_: Tasks, routines, and habits notifications
- **Secure by design**: Strict CSP, modular code, no inline scripts
- **Mobile-ready**: Android .APK packaging in v2.0

---

## 🛠️ Roadmap

See the [ROADMAP.md](./ROADMAP.md) for detailed milestones (Alpha, Beta, v1.0, v2.0, and beyond).

---

## 🚀 Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/aurorae-haven/aurorae-haven.git
   cd aurorae-haven
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

4. Build for production:

   ```bash
   npm run build
   ```

   The production build will be in the `dist/` directory

5. Test the production build locally:

   ```bash
   npm run preview
   ```

   This will start a local server to preview the production build

---

## 📦 Installation

### PWA Installation (Recommended)

Aurorae Haven is now a Progressive Web App! You can install it on your device:

1. Visit the app in a modern browser (Chrome, Firefox, Edge, Safari)
2. Look for the "Install" or "Add to Home Screen" prompt
3. Click install to add the app to your device
4. Launch from your home screen or app drawer

**Benefits**: Works offline, faster loading, native app experience

### Development Setup

- **Dependencies**:
  - Node.js 14+ (for building)
  - Modern browser (Chrome, Firefox, Edge, Safari)

- **Build Instructions**:

  ```bash
  npm install
  npm run build
  npm run preview  # Preview production build locally
  ```

- **Install Methods**:
  - ✅ Progressive Web App (PWA) installation
  - Download and run locally (`index.html`)
  - Android `.APK` _(planned for v2.0)_

---

## 💾 Data Management

### Storage Architecture
- **IndexedDB**: Primary storage for structured data (tasks, habits, schedules, stats)
- **OPFS**: File attachments with metadata references in IndexedDB
- **localStorage**: Fallback and UI state (brain dump content, tags, version history)
- **Automatic Backups**: Daily backups stored in IndexedDB (keeps last 10)

### Features
- ✅ **Export**: Download all data as JSON file with timestamp and UUID
- ✅ **Import**: Restore from any previous export with validation
- ✅ **Auto-Migration**: Automatic migration from localStorage to IndexedDB
- ✅ **Backward Compatible**: Works with both old and new storage systems

### Storage Limits
- **localStorage**: ~5-10 MB (fallback)
- **IndexedDB**: ~50 MB+ (primary, varies by browser)
- **OPFS**: Limited by available disk space

### Documentation
- [Data Management Architecture](./docs/DATA_MANAGEMENT.md) - Full technical documentation
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Upgrade from localStorage
- [Import/Export Guide](./docs/IMPORT_EXPORT_GUIDE.md) - Backup and restore instructions

---

## 🏗️ Architecture

- **Progressive Web App (PWA)**: Installable, offline-capable, app-like experience
- **ReactJS**: Modular component-based architecture for maintainability
- **HTML5 & CSS**: Modern web standards with responsive design
- **IndexedDB**: Structured data storage with indexes and transactions
- **OPFS**: File system access for attachments
- **Service Worker**: Enables offline functionality and caching strategies
- **Web Manifest**: Provides app metadata for installation
- **Modular Components**: Organized codebase with clear separation of concerns

### Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to `main` or `feature-*` branches.
The deployment workflow:

1. Runs tests and security audits
2. Installs Node.js dependencies
3. Builds the React application with Vite (`npm run build`)
4. Automatically generates PWA assets (service worker, manifest, icons) via vite-plugin-pwa
5. Deploys to GitHub Pages

**Build Tool**: Vite (fast, modern bundler with HMR)
**Live URL**: `https://aurorae-haven.github.io/aurorae-haven/`

---

## 🔒 Security & Privacy

- **Strict Content Security Policy (CSP)**: No inline scripts or styles
- **No external dependencies**: All resources served locally or with SRI
- **No tracking**: Your data never leaves your device
- **Local-only storage**: IndexedDB + OPFS, all data stays on your device
- **Export anytime**: JSON export for backup and migration
- **Open source**: Auditable codebase
- **Automatic backups**: Daily backups to prevent data loss
- **Regular audits**: Security scanning and vulnerability checks

---

## 📄 License

[MIT License](./LICENSE)

---

## 📚 Documentation

### Data Management
- **[Data Management Architecture](./docs/DATA_MANAGEMENT.md)**: Technical documentation on IndexedDB, OPFS, and backups
- **[Migration Guide](./docs/MIGRATION_GUIDE.md)**: Upgrade from localStorage to IndexedDB
- **[Import/Export Guide](./docs/IMPORT_EXPORT_GUIDE.md)**: Back up, transfer, and restore your data

### Feature Specifications
- **[Brain Dump Specifications](./docs/BRAIN_DUMP_SPECS.md)**: Technical details about Brain Dump features
- **[Tasks Specifications](./docs/TASKS_SPECS.md)**: Technical details about Tasks and Eisenhower Matrix
- **[ARC-APP Compliance](./docs/ARC-APP-COMPLIANCE.md)**: PWA architecture compliance report

### Project Information
- **[Roadmap](./ROADMAP.md)**: Development milestones and future plans
- **[Contributing Guide](./CONTRIBUTING.md)**: How to contribute to the project

---

## 🙌 Contributing

Contributions, feedback, and ideas are welcome!
