# Aurorae Haven Architecture Documentation

## Overview

This document describes the modularized architecture of the Aurorae Haven application, following SOLID principles and Clean Code practices.

## Architecture Goals

1. **Modularity**: Small, focused components and utilities (max 400 lines, hard limit 700 lines)
2. **Separation of Concerns**: UI logic separated from business logic
3. **Reusability**: Shared components and hooks across features
4. **Testability**: Easy to test individual components and logic
5. **Maintainability**: Clear structure, meaningful names, self-documenting code

## Directory Structure

```text
src/
├── components/           # React UI components
│   ├── common/          # Shared components (Icon, Modal, etc.)
│   ├── BrainDump/       # BrainDump feature components
│   ├── Tasks/           # Tasks feature components
│   ├── Layout.jsx       # Application shell
│   └── Toast.jsx        # Toast notifications
│
├── pages/               # Top-level page components
│   ├── BrainDump.jsx    # Brain Dump page (272 lines)
│   ├── Tasks.jsx        # Tasks page (275 lines)
│   ├── Schedule.jsx     # Schedule page
│   ├── Routines.jsx    # Routines page
│   ├── Habits.jsx       # Habits page
│   ├── Stats.jsx        # Stats page
│   ├── Settings.jsx     # Settings page
│   └── Home.jsx         # Home page
│
├── hooks/               # Custom React hooks
│   ├── useBrainDumpState.js  # BrainDump state management
│   ├── useTasksState.js      # Tasks state management
│   ├── useDragAndDrop.js     # Drag and drop functionality
│   └── useToast.js           # Toast notifications
│
├── utils/               # Utility functions and managers
│   ├── brainDump/       # BrainDump utilities
│   │   ├── noteOperations.js  # CRUD operations
│   │   └── noteFilters.js     # Filtering and search
│   ├── dataManager.js         # Global data management
│   ├── uuidGenerator.js       # Secure UUID generation
│   └── ...
│
└── assets/              # Static assets
    └── styles/          # CSS files
```

## Component Hierarchy

### BrainDump Module

```text
BrainDump.jsx (272 lines)
├── NotesList (86 lines)
├── NoteEditor (196 lines)
├── FilterModal (135 lines)
├── ContextMenu (92 lines)
├── NoteDetailsModal
└── HelpModal
```

**Custom Hooks:**

- `useBrainDumpState` (140 lines): Manages notes state, localStorage, filtering
- `useToast` (18 lines): Manages toast notifications

**Total Reduction:** 857 → 272 lines (68% reduction)

### Tasks Module

```text
Tasks.jsx (275 lines)
├── TaskForm (47 lines)
└── TaskQuadrant (81 lines)
    └── TaskItem (130 lines)
```

**Custom Hooks:**

- `useTasksState` (117 lines): Manages tasks state, CRUD operations
- `useDragAndDrop` (30 lines): Manages drag and drop functionality

**Total Reduction:** 483 → 275 lines (43% reduction)

## Design Patterns

### 1. Custom Hooks Pattern

Custom hooks encapsulate business logic and state management:

```javascript
// Example: useBrainDumpState.js
export function useBrainDumpState() {
  const [notes, setNotes] = useState([])
  // ... state management logic
  return {
    notes,
    currentNote,
    loadNote,
    createNote
    // ... other actions
  }
}
```

**Benefits:**

- Separates business logic from UI
- Makes components focused on presentation
- Easy to test in isolation
- Reusable across components

### 2. Component Composition

Components are composed into larger features:

```javascript
// Example: BrainDump.jsx
function BrainDump() {
  const { notes /* ... */ } = useBrainDumpState()

  return (
    <>
      <NotesList notes={notes} />
      <NoteEditor currentNote={currentNote} />
    </>
  )
}
```

**Benefits:**

- Single Responsibility Principle
- Easy to understand and modify
- Better testing granularity

### 3. Props Drilling Prevention

Use custom hooks to avoid excessive props drilling:

```javascript
// Instead of passing 10+ props:
<Component {...manyProps} />

// Use a custom hook:
const { state, actions } = useFeatureState()
<Component state={state} actions={actions} />
```

## State Management

### Local Storage Persistence

All feature data is persisted to localStorage:

```javascript
// Pattern used in custom hooks
useEffect(() => {
  const saved = localStorage.getItem('feature_data')
  if (saved) setData(JSON.parse(saved))
}, [])

useEffect(() => {
  localStorage.setItem('feature_data', JSON.stringify(data))
}, [data])
```

### State Structure

```javascript
// BrainDump state
{
  notes: Note[],
  currentNoteId: string,
  title: string,
  content: string,
  category: string
}

// Tasks state
{
  urgent_important: Task[],
  not_urgent_important: Task[],
  urgent_not_important: Task[],
  not_urgent_not_important: Task[]
}
```

## Code Standards

### File Size Limits

- **Target:** 400 lines per file
- **Hard limit:** 700 lines per file
- **Current status:** All refactored files under 300 lines

### Naming Conventions

- **Components:** PascalCase (e.g., `NotesList.jsx`)
- **Hooks:** camelCase with "use" prefix (e.g., `useBrainDumpState.js`)
- **Utilities:** camelCase (e.g., `noteOperations.js`)
- **Constants:** UPPER_SNAKE_CASE

### Component Structure

```javascript
import React from 'react'
import PropTypes from 'prop-types'

/**
 * Component description
 */
function ComponentName({ prop1, prop2 }) {
  // Hooks
  // State
  // Effects
  // Event handlers
  // Render helpers

  return (
    // JSX
  )
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func.isRequired
}

export default ComponentName
```

## Testing Strategy

### Component Tests

- Test user interactions
- Test rendering with different props
- Test edge cases
- Mock custom hooks for isolation

### Hook Tests

- Test state updates
- Test side effects
- Test localStorage interaction
- Test error handling

## Future Improvements

### Planned Refactoring

1. **Layout Component** (294 lines → ~200 lines)
   - Extract Navigation component
   - Extract ExportModal component
   - Extract SettingsModal component

2. **Shared Component Library**
   - Icon component (for SVG icons)
   - Modal component (reusable modal wrapper)
   - Button variants
   - Form components

3. **Additional Custom Hooks**
   - `useLocalStorage` - Generic localStorage hook
   - `useDebounce` - Debouncing utility
   - `useKeyboardShortcuts` - Keyboard shortcuts

### Code Quality Goals

- [ ] 100% test coverage for custom hooks
- [ ] 80%+ test coverage for components
- [ ] Zero ESLint warnings
- [ ] All components under 400 lines
- [ ] Comprehensive JSDoc documentation

## Migration Guide

### For Contributors

When adding new features:

1. Create feature directory in `src/components/`
2. Extract business logic into custom hooks in `src/hooks/`
3. Keep page components thin (orchestration only)
4. Use shared components from `src/components/common/`
5. Add PropTypes to all components
6. Follow the established patterns

### Refactoring Existing Code

1. Identify large files (> 400 lines)
2. Extract reusable components
3. Create custom hooks for business logic
4. Update imports and tests
5. Verify no regressions
6. Document changes

## Performance Considerations

### Optimizations Applied

- `useMemo` for expensive computations
- `useCallback` for stable function references
- Debounced autosave (500ms)
- Lazy loading for modals

### Bundle Size

Current bundle analysis:

- BrainDump module: ~25KB (down from ~40KB)
- Tasks module: ~18KB (down from ~30KB)
- Shared utilities: ~10KB

## Accessibility

All components follow WCAG 2.2 AA standards:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader compatibility

## Security

Security measures implemented:

- CSP-compliant (no inline scripts)
- DOMPurify for XSS prevention
- Secure UUID generation (crypto API)
- Input validation
- Safe link handling

## Conclusion

This architecture provides a solid foundation for scaling the application while maintaining code quality, testability, and developer experience. The modular approach makes it easy to add new features, fix bugs, and onboard new contributors.

For questions or suggestions, please open an issue on GitHub.
