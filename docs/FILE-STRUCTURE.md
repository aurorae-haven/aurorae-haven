# File Structure Documentation

This document explains the file organization in the Aurorae Haven application.

## Overview

The repository contains **two parallel implementations** to support both modern React-based usage and legacy standalone HTML pages. This is intentional and NOT duplication.

## Architecture Types

### 1. React Application (Primary/Modern)

**Location**: `src/pages/*.js`, `src/components/*.js`

**Entry Point**: `src/index.js`

**Purpose**: Main Progressive Web App (PWA) with React

**Features**:
- Single Page Application (SPA) routing
- Component-based architecture
- Modern React hooks and state management
- Full PWA capabilities (offline, installable)
- Optimized build process

**Files**:
- `src/pages/BrainDump.js` - React component for brain dump feature
- `src/pages/Schedule.js` - React component for schedule feature
- `src/pages/Tasks.js` - React component for tasks
- `src/pages/Habits.js` - React component for habits
- `src/pages/Sequences.js` - React component for sequences
- `src/components/Layout.js` - Main layout wrapper
- `src/components/Toast.js` - Toast notification component

### 2. Legacy Standalone Pages

**Location**: `public/pages/*.html`, `src/braindump*.js`, `src/schedule.js`

**Purpose**: Fallback standalone HTML pages for direct access

**Features**:
- No build step required
- Direct access via URLs like `/pages/braindump.html`
- Compatible with older browsers
- Can function independently of React app

**Files**:
- `public/pages/braindump.html` + `src/braindump-ui.js` - Standalone brain dump page
- `public/pages/schedule.html` + `src/schedule.js` - Standalone schedule page
- `src/braindump.js` - Core brain dump logic (legacy)
- `src/braindump-enhanced.js` - Shared security/sanitization utilities

## File Relationships

```
┌─────────────────────────────────────┐
│       React App (Primary)           │
│                                     │
│  src/index.js                       │
│    └─→ src/pages/BrainDump.js      │
│    └─→ src/pages/Schedule.js       │
│    └─→ src/components/Layout.js    │
│                                     │
│  Uses: Modern React patterns        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    Legacy Standalone Pages          │
│                                     │
│  public/pages/braindump.html        │
│    └─→ src/braindump-ui.js         │
│    └─→ src/braindump.js            │
│                                     │
│  public/pages/schedule.html         │
│    └─→ src/schedule.js             │
│                                     │
│  Uses: Vanilla JavaScript + DOM     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       Shared Utilities              │
│                                     │
│  src/braindump-enhanced.js          │
│    • Sanitization (XSS prevention)  │
│    • GDPR-compliant data management │
│    • Version history                │
│    • Backlinks                      │
│    • File attachments (OPFS)        │
│                                     │
│  src/utils/                         │
│    • dataManager.js                 │
│    • pageHelpers.js                 │
│    • listContinuation.js            │
└─────────────────────────────────────┘
```

## Why Both Approaches?

1. **Gradual Migration**: The app is transitioning from vanilla JS to React
2. **Backwards Compatibility**: Legacy pages ensure existing links/bookmarks work
3. **Progressive Enhancement**: Users can access features without waiting for React bundle
4. **Deployment Flexibility**: Static HTML pages can be served without build process

## Security & Testing

Both implementations share common security utilities:

- **`src/braindump-enhanced.js`**: 
  - XSS prevention via DOMPurify configuration
  - GDPR-compliant data management
  - Comprehensive test coverage in `src/__tests__/braindump-enhanced.test.js`

- **Test Coverage**: Security tests verify:
  - Sanitization of dangerous HTML/JS
  - Blocking of `javascript:`, `vbscript:`, and `data:` URIs
  - Safe handling of external links
  - GDPR rights (data export, right to erasure)
  - Version history limits and recovery

## Deployment

**Build Process** (`npm run build`):
1. React app is built to `build/` directory
2. Build artifacts are copied to `dist/build/` for deployment
3. Legacy pages are **not** automatically included in `dist/pages/`; no legacy pages (`public/pages/*.html`) or `dist/pages/` directory are copied by the current build script
4. Service worker handles caching for both types (if both are present in the deployment)

**Result**: By default, deployment contains only the React SPA under `dist/build/`. Legacy pages must be manually copied if needed.

## Future Plans

As the React app matures, legacy standalone pages may be:
- Redirected to React equivalents
- Deprecated with migration notices
- Maintained for specific use cases

For now, both coexist to ensure maximum compatibility and user choice.
