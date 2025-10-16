# TAB-RTN Implementation Plan

**Feature**: Routines (Routine Runner & Library)  
**Total Specifications**: 58  
**Current Status**: ~35% implemented (runner core exists)  
**Remaining Work**: ~38 specifications

---

## Current State Analysis

### ✅ Already Implemented (~20 specs)
- TAB-RTN-03: Current routine runner panel with progress bar
- TAB-RTN-05: Toolbar with Import/Export (partial)
- TAB-RTN-09: Step triptych (Previous, Current, Next)
- TAB-RTN-10: Current step panel with title and countdown
- TAB-RTN-11: Controls row (Complete, Skip, Pause, Cancel)
- TAB-RTN-13: Complete step functionality with XP
- TAB-RTN-14: Skip step functionality
- TAB-RTN-15: Pause/Resume with visual state
- TAB-RTN-18: Cancel with confirmation dialog
- TAB-RTN-22-26: XP calculation system (base, on-time, routine bonus, perfect bonus)
- TAB-RTN-27: XP tally display
- TAB-RTN-28: Summary modal
- TAB-RTN-29: Confetti on completion (via useRoutineRunner)
- TAB-RTN-30: Haptic feedback
- TAB-RTN-31: Summary modal with details
- TAB-RTN-32: Save as template functionality
- TAB-RTN-37-39: Mobile swipe gestures
- TAB-RTN-41: Haptic feedback on interactions
- TAB-RTN-42-44: Accessibility (ARIA, keyboard shortcuts, live regions)
- TAB-RTN-47-49: Import/Export with validation

### ❌ Missing (~38 specs)
- TAB-RTN-01: Complete screen layout (toolbar, runner, library)
- TAB-RTN-02: Visual design consistency
- TAB-RTN-04: Routine Library cards with Start button and menu
- TAB-RTN-05: Complete toolbar (New Routine, Filter, Sort, View toggle)
- TAB-RTN-06: Filter by Tag, Duration, Last Used, Energy
- TAB-RTN-07: Sort options (Title, Last Used, Duration, Recently Edited)
- TAB-RTN-08: New Routine creation dialog
- TAB-RTN-12: Compact log strip under controls
- TAB-RTN-16: Reorder steps functionality
- TAB-RTN-17: Brain Dump link from runner
- TAB-RTN-19: Step attributes (Label, Timer, Description, Energy hint)
- TAB-RTN-20: Steps list editor (Add, Duplicate, Delete, Reorder)
- TAB-RTN-21: Step timer validation (10s to 2h)
- TAB-RTN-33-36: Visual styling details (progress bar, glow, buttons, colors)
- TAB-RTN-40: Virtualization for long routines
- TAB-RTN-45: Reduced motion support (partial)
- TAB-RTN-46: Screen reader optimization
- TAB-RTN-50-58: Library management, templates, scheduling (8 specs)

---

## Implementation Phases

### Phase 1: Complete Data Layer & Template System (Days 1-3)

**Goal**: Robust routine and template management

#### Files to Create/Modify:
- Enhance `src/utils/routinesManager.js` (exists but basic)
- Create `src/utils/routineTemplates.js`
- Enhance `src/hooks/useRoutineRunner.js`

#### Specifications:
- TAB-RTN-08: Routine creation with all attributes
- TAB-RTN-19: Step attributes (Label, Timer, Description, Energy)
- TAB-RTN-20: Step operations (Add, Duplicate, Delete)
- TAB-RTN-21: Timer validation (10s to 2h)
- TAB-RTN-06: Filter logic by Tag, Duration, Last Used, Energy
- TAB-RTN-07: Sort logic (Title, Last Used, Duration, Recently Edited)

**Deliverables**:
- Full routine CRUD with templates
- Step management functions
- Filter and sort functions
- Validation logic
- Data migration support

---

### Phase 2: Build Library UI (Days 4-6)

**Goal**: Visual library with cards, filters, and creation modal

#### Files to Create:
- `src/components/Routines/RoutineCard.jsx`
- `src/components/Routines/RoutineLibrary.jsx`
- `src/components/Routines/CreateRoutineModal.jsx`
- `src/components/Routines/StepEditor.jsx`
- `src/components/Routines/FilterModal.jsx`

#### Specifications:
- TAB-RTN-01: Complete screen layout
- TAB-RTN-02: Visual design consistency
- TAB-RTN-04: Routine Library cards with Start/menu
- TAB-RTN-05: Complete toolbar with all buttons
- TAB-RTN-06: Filter UI (by Tag, Duration, Energy)
- TAB-RTN-07: Sort UI (Title, Last Used, Duration)
- TAB-RTN-08: New Routine creation modal
- TAB-RTN-33-36: Visual styling (colors, borders, buttons)

**Deliverables**:
- Routine cards with Start button
- Filter and sort UI
- Create/Edit routine modal
- Step editor component
- View toggle (Grid/List)

---

### Phase 3: Enhance Runner Features (Days 7-9)

**Goal**: Advanced runner capabilities

#### Files to Modify/Create:
- Enhance `src/pages/Routines.jsx`
- Create `src/components/Routines/StepLogStrip.jsx`
- Create `src/components/Routines/BrainDumpLink.jsx`
- Create `src/components/Routines/StepReorder.jsx`

#### Specifications:
- TAB-RTN-12: Compact log strip
- TAB-RTN-16: Reorder steps in runner
- TAB-RTN-17: Brain Dump link integration
- TAB-RTN-40: Virtualization for long routines
- TAB-RTN-45: Full reduced motion support
- TAB-RTN-46: Enhanced screen reader support

**Deliverables**:
- Step log strip showing completion history
- Reorderable steps with drag-and-drop
- Brain Dump integration button
- Virtualized step list for performance
- Full accessibility compliance

---

### Phase 4: Statistics & Analytics (Days 10-11)

**Goal**: Track routine usage and performance

#### Files to Create:
- `src/components/Routines/RoutineStats.jsx`
- `src/components/Routines/CompletionHistory.jsx`

#### Specifications:
- TAB-RTN-50: Usage statistics
- TAB-RTN-51: Completion rate tracking
- TAB-RTN-52: Average duration analysis
- TAB-RTN-53: On-time percentage
- TAB-RTN-54: Step success rates

**Deliverables**:
- Statistics dashboard in Library
- Completion history view
- Performance metrics
- Export statistics

---

### Phase 5: Mobile Optimizations & Polish (Days 12-14)

**Goal**: Perfect mobile experience and final touches

#### Files to Modify:
- Enhance all components for mobile
- Add mobile-specific layouts
- Optimize touch interactions

#### Specifications:
- TAB-RTN-37-39: Full mobile runner layout
- TAB-RTN-55: Mobile toolbar optimization
- TAB-RTN-56: FAB for quick actions
- TAB-RTN-57: Sticky progress bar
- TAB-RTN-58: Swipe refinements

**Deliverables**:
- Mobile-optimized layouts
- Enhanced touch gestures
- FAB button for quick access
- Responsive design testing
- Final accessibility testing

---

## Test Coverage Targets

### Unit Tests:
- `routinesManager.test.js` - CRUD, filtering, sorting (target: 85%+)
- `routineTemplates.test.js` - Template operations (target: 85%+)
- `RoutineCard.test.js` - Card rendering and interactions (target: 80%+)
- `CreateRoutineModal.test.js` - Form validation and submission (target: 80%+)
- `StepEditor.test.js` - Step operations (target: 80%+)

### Integration Tests:
- `Routines.test.js` - Complete workflow (target: 75%+)
- Runner state management
- Library operations
- Filter and sort functionality

---

## Success Criteria

- [ ] All 58 TAB-RTN specifications implemented
- [ ] Zero ESLint errors
- [ ] Zero npm vulnerabilities
- [ ] 1,100+ tests passing (adding ~100 new tests)
- [ ] 80%+ test coverage for new code
- [ ] WCAG 2.2 AA compliance
- [ ] Mobile responsive (tested on iOS/Android)
- [ ] Keyboard accessible (Tab, Arrow keys, shortcuts)
- [ ] Screen reader compatible
- [ ] Performance optimized (virtualization for large lists)

---

## Known Challenges

1. **Drag-and-drop reordering**: Need to implement accessible DnD
2. **Timer synchronization**: Ensure accurate countdown with pause/resume
3. **XP calculation edge cases**: Handle interrupted routines
4. **Mobile gestures**: Balance swipe vs scroll interactions
5. **State management**: Coordinate runner, library, and templates

---

## Phase 1 Starting Point

Beginning with data layer enhancements in `routinesManager.js` to support all required operations before building UI components.

**Estimated Total Time**: 12-14 days for complete implementation
**Current Date**: 2025-10-16
**Target Completion**: 2025-10-29
