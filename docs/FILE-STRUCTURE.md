# File Structure Documentation

This document explains the file organization in the Aurorea Haven application.

## Overview

The repository contains a **fully React-based Progressive Web App** built with Vite. All legacy standalone HTML pages have been removed as part of the migration to a modern, component-based architecture.

## Architecture

### React Application with Vite

**Location**: `src/pages/*.jsx`, `src/components/*.jsx`, `src/utils/*.js`

**Entry Point**: `src/index.jsx`

**Build Tool**: Vite (fast, modern bundler)

**Purpose**: Progressive Web App (PWA) with React

**Features**:

- Single Page Application (SPA) routing with React Router
- Component-based architecture with React 18
- Modern React hooks and state management
- Full PWA capabilities (offline, installable) via vite-plugin-pwa
- Fast builds and instant HMR (Hot Module Replacement)
- Optimized bundle splitting and tree-shaking

**Files**:

**Pages** (`src/pages/*.jsx`):

- `BrainDump.jsx` - Markdown editor with live preview
- `Schedule.jsx` - Daily schedule and time blocking
- `Tasks.jsx` - Task management with Eisenhower matrix
- `Habits.jsx` - Habit tracking with streaks
- `Routines.jsx` - Routine management with timers
- `Stats.jsx` - Progress tracking and analytics
- `Settings.jsx` - App configuration
- `Home.jsx` - Landing page

**Components** (`src/components/*.jsx`):

- `Layout.jsx` - Main layout wrapper with navigation
- `Toast.jsx` - Toast notification component

**Utilities** (`src/utils/*.js`):

- `dataManager.js` - LocalStorage data management and import/export
- `listContinuation.js` - Auto-list continuation for markdown editing
- `pageHelpers.js` - Common page utilities
- `braindump-enhanced.js` - Advanced sanitization and security utilities

## File Relationships

```text
┌─────────────────────────────────────┐
│      Vite + React Application       │
│                                     │
│  index.html (root)                  │
│    └─→ src/index.jsx                │
│        ├─→ src/components/          │
│        │   ├─→ Layout.jsx            │
│        │   └─→ Toast.jsx             │
│        │                             │
│        ├─→ src/pages/                │
│        │   ├─→ Home.jsx               │
│        │   ├─→ BrainDump.jsx         │
│        │   ├─→ Schedule.jsx          │
│        │   ├─→ Routines.jsx         │
│        │   ├─→ Tasks.jsx             │
│        │   ├─→ Habits.jsx            │
│        │   ├─→ Stats.jsx             │
│        │   └─→ Settings.jsx          │
│        │                             │
│        └─→ src/utils/                │
│            ├─→ dataManager.js        │
│            ├─→ listContinuation.js  │
│            ├─→ pageHelpers.js       │
│            └─→ braindump-enhanced.js│
│                                     │
│  Build Tool: Vite                   │
│  Output: dist/                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       Configuration Files           │
│                                     │
│  vite.config.js                     │
│    • Base URL configuration         │
│    • PWA plugin (manifest, SW)      │
│    • Bundle optimization            │
│    • Build settings                 │
│                                     │
│  .env / .env.production             │
│    • Environment variables          │
│    • VITE_BASE_URL                  │
│                                     │
│  package.json                       │
│    • Scripts: dev, build, preview   │
│    • Dependencies                   │
└─────────────────────────────────────┘
```

## Why Vite?

1. **Modern Build Tool**: Fast builds with native ES modules and instant HMR
2. **Better Performance**: Optimized bundle splitting and tree-shaking
3. **Active Maintenance**: Vite is actively developed, unlike Create React App (deprecated)
4. **PWA Support**: Built-in PWA generation via vite-plugin-pwa
5. **Developer Experience**: Sub-second cold start, instant hot reload

## Security & Testing

- **Security Utilities** (`src/utils/sanitization.js`):
  - XSS prevention via DOMPurify configuration
  - GDPR-compliant data management
  - Version history and backlinks support
  - Comprehensive test coverage in `src/__tests__/sanitization.test.js`

- **Test Coverage**: Security tests verify:
  - Sanitization of dangerous HTML/JS
  - Blocking of `javascript:`, `vbscript:`, and `data:` URIs
  - Safe handling of external links
  - GDPR rights (data export, right to erasure)
  - Version history limits and recovery

- **Testing Framework**: Jest with React Testing Library
  - 144+ tests covering core functionality
  - Component rendering and interaction tests
  - Data management and security tests

## Deployment

**Build Process** (`npm run build`):

1. Vite builds the React application to `dist/` directory
2. Automatically generates PWA assets:
   - Service worker (`sw.js`)
   - Web manifest (`manifest.webmanifest`)
   - Optimized bundles in `assets/`
3. Bundle splitting creates separate chunks for vendors:
   - `react-vendor` (React, React DOM, React Router)
   - `markdown-vendor` (Marked, DOMPurify)
   - `calendar-vendor` (FullCalendar)
4. All assets are optimized and minified

**Result**: Production-ready SPA with PWA capabilities in `dist/` (~273KB total)

**CI/CD**: GitHub Actions workflow automatically deploys to GitHub Pages on push to `main` or `feature-*` branches

## Future Improvements

Planned enhancements for the architecture:

- **E2E Testing**: Add Playwright or Cypress for end-to-end tests
- **Component Library**: Extract reusable components into a shared library
- **State Management**: Consider Zustand or Jotai for complex state
- **Code Splitting**: Lazy load routes for better initial load performance
- **TypeScript**: Gradual migration to TypeScript for type safety
