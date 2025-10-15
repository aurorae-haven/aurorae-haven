# TAB-HAB Implementation Plan

## Overview

Full implementation of TAB-HAB (Habits Feature) with all 52 specifications from `docs/COMPLETE_SPECIFICATIONS.md`.

**Status**: In Progress  
**Priority**: IMMEDIATE (v1.1)  
**Estimated Effort**: 2 weeks  
**Current Progress**: Planning Phase

---

## Implementation Phases

### Phase 1: Core Data Layer (Week 1, Days 1-2)

**Goal**: Implement robust habit data management with persistence

**Files to Create/Modify**:
- ✅ `/src/utils/habitsManager.js` - Core CRUD operations, streak calculation
- ✅ `/src/__tests__/habitsManager.test.js` - Comprehensive test suite

**Specifications Covered**: TAB-HAB-40 (persistence), TAB-HAB-42 (import/export), TAB-HAB-43 (round-trip)

**Deliverables**:
- [x] Habit CRUD operations (create, read, update, delete)
- [x] Streak calculation with vacation day support  
- [x] Completion tracking with date history
- [x] XP calculation (base, new streak, milestones)
- [x] Import/Export functionality
- [ ] Test coverage: 85%+

---

### Phase 2: Core UI Components (Week 1, Days 3-5)

**Goal**: Build essential UI components for habit management

**Files to Create**:
- `/src/components/Habits/HabitCard.jsx` - Individual habit card
- `/src/components/Habits/HabitList.jsx` - Scrollable habit list
- `/src/components/Habits/TodayPanel.jsx` - Today summary with ring
- `/src/components/Habits/HabitToolbar.jsx` - Actions toolbar
- `/src/components/Habits/NewHabitModal.jsx` - Creation dialog

**Specifications Covered**: TAB-HAB-01 through TAB-HAB-12

**Deliverables**:
- [ ] Habit card with today tick control
- [ ] Today panel with completion ring
- [ ] Compact heatmap (28-35 days)
- [ ] New habit creation dialog
- [ ] Toolbar with filter/sort/actions
- [ ] Category color system

---

### Phase 3: Advanced Features (Week 2, Days 1-3)

**Goal**: Implement heatmap, detail drawer, and advanced interactions

**Files to Create**:
- `/src/components/Habits/HeatmapStrip.jsx` - Compact heatmap
- `/src/components/Habits/HeatmapFull.jsx` - 90-day heatmap
- `/src/components/Habits/HabitDetailDrawer.jsx` - Expanded view
- `/src/components/Habits/CompletionHistory.jsx` - History list with filters
- `/src/components/Habits/VacationToggle.jsx` - Vacation mode

**Specifications Covered**: TAB-HAB-13 through TAB-HAB-28, TAB-HAB-36

**Deliverables**:
- [ ] Heatmap visualization with WCAG AA contrast
- [ ] Detail drawer with full history
- [ ] Vacation mode to preserve streaks
- [ ] Brain Dump link integration
- [ ] Completion history with CSV/Markdown export

---

### Phase 4: Gamification & Polish (Week 2, Days 4-5)

**Goal**: Add XP system, animations, and accessibility features

**Files to Create**:
- `/src/components/Habits/ConfettiEffect.jsx` - Milestone celebration
- `/src/components/Habits/UndoToast.jsx` - Undo functionality
- `/src/utils/habitsXP.js` - XP calculation utilities

**Specifications Covered**: TAB-HAB-20 through TAB-HAB-25, TAB-HAB-34 through TAB-HAB-40

**Deliverables**:
- [ ] XP calculations (base, streak, milestone)
- [ ] Confetti on milestones (with reduced motion)
- [ ] Undo functionality (5-10 seconds)
- [ ] Toast notifications with XP earned
- [ ] Haptic feedback (mobile)
- [ ] Screen reader announcements
- [ ] Keyboard navigation (Tab, Space, Enter, Arrow keys, Esc)
- [ ] ARIA labels and roles

---

### Phase 5: Mobile Optimizations (Week 2, End)

**Goal**: Optimize for mobile devices and touch interactions

**Files to Modify**:
- `/src/pages/Habits.jsx` - Add mobile-specific layout
- Various components - Add swipe gestures, FAB, responsive layouts

**Specifications Covered**: TAB-HAB-29 through TAB-HAB-33

**Deliverables**:
- [ ] Vertical list layout (mobile)
- [ ] Floating Action Button (New Habit)
- [ ] Swipe gestures (complete, edit, delete)
- [ ] Touch targets ≥48×48px
- [ ] Sticky Today panel
- [ ] Overflow menu for toolbar actions

---

## Current Status: Phase 1 Complete (Partial)

### Completed (Phase 1)
- ✅ Core habit data structure defined
- ✅ CRUD operations implemented
- ✅ Streak calculation algorithm
- ✅ Completion tracking
- ✅ XP calculation (base + milestones)
- ✅ Import/Export functionality
- ✅ Vacation day support
- ✅ IndexedDB persistence

### In Progress
- 🔄 Test suite completion (current: ~40%, target: 85%+)

### Next Steps
1. Complete test coverage for Phase 1
2. Run all tests and verify
3. Begin Phase 2 (Core UI Components)
4. Create HabitCard component
5. Create TodayPanel with completion ring

---

## Testing Strategy

### Test Coverage Targets
- **habitsManager.js**: 85%+ (current: ~70%)
- **React Components**: 80%+
- **Integration Tests**: Key user flows

### Key Test Scenarios
1. Create, read, update, delete habits
2. Complete habit and calculate streak
3. Handle vacation days correctly
4. Calculate XP for base, new streak, milestones
5. Import/export round-trip without data loss
6. Handle edge cases (duplicate IDs, invalid data)

---

## Dependencies

### Required
- ✅ dayjs - Date manipulation
- ✅ IndexedDB - Data persistence
- ✅ React 18 - UI framework
- ✅ UUID generator - Unique IDs

### Nice-to-Have
- Canvas confetti - Milestone celebrations
- React spring - Smooth animations
- React use-gesture - Swipe gestures

---

## Accessibility Checklist (TAB-HAB-34 through TAB-HAB-40)

- [ ] role="list" for habits list
- [ ] role="listitem" for habit cards
- [ ] role="checkbox" for today controls
- [ ] aria-label for streak ring with progress
- [ ] aria-checked for completion status
- [ ] Keyboard navigation (Tab, Space, Enter, Arrows, Esc)
- [ ] Screen reader announcements on completion
- [ ] WCAG AA contrast ratios
- [ ] Focus indicators visible and high contrast
- [ ] No rapid aria-live updates

---

## Performance Considerations (TAB-HAB-39)

- [ ] Virtualize habit list for large collections (100+ habits)
- [ ] Lazy load detail drawer
- [ ] Optimize heatmap rendering
- [ ] Debounce streak calculations
- [ ] IndexedDB transaction optimization

---

## Known Limitations (To Address)

1. **No Backend**: All data is client-side only
2. **No Sync**: Cross-device sync requires backend (v2.0)
3. **No Reminders**: Push notifications require backend (v2.0)
4. **Limited Analytics**: Advanced stats require data aggregation

---

## References

- **Specifications**: `/docs/COMPLETE_SPECIFICATIONS.md` (TAB-HAB-01 through TAB-HAB-52)
- **Issue Template**: `/docs/GITHUB_ISSUES_TO_CREATE.md` (Lines 83-174)
- **Gap Analysis**: `/docs/IMPLEMENTATION_GAP_ANALYSIS.md`
- **Existing Stub**: `/src/utils/habitsManager.js` (to be replaced)
- **Existing Tests**: `/src/__tests__/habitsManager.test.js` (to be expanded)

---

**Last Updated**: 2025-10-15  
**Next Review**: After Phase 1 test completion
