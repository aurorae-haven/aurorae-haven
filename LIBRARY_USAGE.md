# Library Usage and Maintainability Improvements

## Overview

This document outlines the external MIT-licensed, offline libraries used in Aurorae Haven and explains decisions around dependency management and code maintainability.

## Goals

Per project guidelines (`.github/copilot-instructions.md`):
- **Don't reinvent the wheel**: Use MIT-licensed, offline, well-tested, stable libraries when available
- **Reduce lines of code (LoC)**: Where appropriate, replace custom implementations with battle-tested libraries
- **Improve maintainability**: Make code more readable and easier to maintain

## Current Libraries

### Core Functionality

| Library | Version | Purpose | License | Offline | Size |
|---------|---------|---------|---------|---------|------|
| **react** | 18.2.0 | UI framework | MIT | ✅ | - |
| **react-dom** | 18.2.0 | React DOM renderer | MIT | ✅ | - |
| **react-router-dom** | 7.9.3 | Client-side routing | MIT | ✅ | - |
| **dayjs** | 1.11.18 | Date/time handling | MIT | ✅ | ~7KB |
| **uuid** | 9.0.1 | UUID generation | MIT | ✅ | ~5KB |
| **dompurify** | 3.2.7 | HTML sanitization | MIT | ✅ | ~45KB |
| **marked** | 16.3.0 | Markdown parsing | MIT | ✅ | ~50KB |
| **katex** | 0.16.23 | LaTeX rendering | MIT | ✅ | ~360KB |
| **marked-katex-extension** | 5.1.5 | KaTeX integration for Marked | MIT | ✅ | ~6KB |
| **canvas-confetti** | 1.9.3 | Celebration effects | MIT | ✅ | ~21KB |

### Recently Added

| Library | Version | Purpose | License | Offline | Size |
|---------|---------|---------|---------|---------|------|
| **clsx** | 2.1.1 | Conditional className utility | MIT | ✅ | 48KB |

### Build Tools & Dev Dependencies

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **vite** | 7.1.9 | Build tool | MIT |
| **eslint** | 9.37.0 | Linting | MIT |
| **prettier** | 3.6.2 | Code formatting | MIT |
| **jest** | 30.2.0 | Testing | MIT |
| **@testing-library/react** | 16.3.0 | React testing utilities | MIT |

## Recent Improvements (January 2025)

### 1. clsx for className Management

**Problem**: Template literal className concatenation was verbose and error-prone:
```jsx
className={`btn ${isActive ? 'active' : ''}`}
className={`template-card ${template.pinned ? 'pinned' : ''}`}
```

**Solution**: Added `clsx` library for cleaner conditional className handling:
```jsx
className={clsx('btn', { active: isActive })}
className={clsx('template-card', { pinned: template.pinned })}
```

**Benefits**:
- Improved readability
- Reduced errors in className logic
- Consistent pattern across codebase
- MIT licensed, 48KB, offline-compatible

**Files Updated**: 8 components (TemplateCard, TemplateToolbar, NotesList, HelpModal, Modal, ConfirmModal, Library, Habits)

### 2. Accessibility Improvements

**Fixed Issues**:
- Changed `role="article"` to `role="button"` for interactive habit cards (proper semantic HTML)
- Added keyboard event handlers for interactive elements
- Fixed ESLint accessibility warnings

### 3. Linting Fixes

**Fixed**:
- `setupTests.js`: Added `/* global jest */` comment to fix no-undef error
- `habitsManager.js`: Removed unused error variable, replaced console.error with logger
- All ESLint checks passing with zero warnings

## Libraries Considered But Not Added

### Zod (Schema Validation)

**Status**: Already in dependencies (transitive from eslint-plugin-react-hooks)  
**Decision**: Not used for validation replacement

**Rationale**:
- Current custom validation is well-tested and specific to app needs (281 lines)
- Zod replacement would require extensive compatibility layer to match existing error messages
- Would need to maintain backward compatibility with existing tests (402 test lines)
- Custom validation handles edge cases specific to our data structures
- Net benefit would be minimal after accounting for compatibility layer

**Future Consideration**: Could be used for new validation needs where compatibility isn't required

### Lodash/Lodash-ES (Utility Functions)

**Status**: Not added  
**Decision**: Not needed

**Rationale**:
- Most operations already use native JavaScript methods (Array.map, Array.filter, etc.)
- No deep cloning needs (only one usage: structuredClone polyfill in tests)
- No debouncing/throttling needs currently
- Adding lodash would increase bundle size without significant LoC reduction
- Native methods are well-optimized and sufficient for our needs

**Analysis**:
- 88 uses of `.sort()`, `.filter()`, `.map()`, `.reduce()` in utils
- 12 uses of `Object.keys/values/entries`
- All can be handled efficiently with native methods

### Markdown Editor Libraries

**Considered**: CodeMirror, Monaco Editor, SimpleMDE  
**Decision**: Not added

**Rationale**:
- Current Brain Dump textarea with custom list continuation works well (112 lines)
- List continuation logic is specific to our UX needs
- Full editor libraries would be 500KB+ and add complexity
- Our implementation is lightweight and tailored to user needs

## Decision Framework

When considering external libraries:

1. **Is it MIT licensed?** ✅ Required
2. **Is it offline-compatible?** ✅ Required
3. **Is it well-tested and stable?** ✅ Required
4. **Does it significantly reduce LoC or improve maintainability?** ✅ Preferred
5. **Is the bundle size reasonable?** ✅ Consider impact
6. **Does it avoid reinventing the wheel?** ✅ Preferred

## Maintenance Notes

### Keeping Dependencies Updated

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit --audit-level=low --omit=dev

# Fix vulnerabilities
npm audit fix
```

### Security Policy

- Zero vulnerabilities in production dependencies
- Zero HIGH/CRITICAL vulnerabilities in dev dependencies
- Moderate/low dev vulnerabilities only acceptable if truly dev-only and documented

## Future Opportunities

### Potential Libraries to Consider

1. **Chart.js / Recharts** - If we add data visualization to Stats page
2. **date-fns** - Alternative to dayjs if more advanced date operations needed
3. **classnames** - Alternative to clsx (similar but different API)
4. **validator** - For email/URL validation if user profiles added

### Areas for Custom Implementation

These areas work well with custom code and don't need libraries:
- File helpers (sanitization, filename generation)
- ID generation (wraps uuid, adds app-specific logic)
- Error handling (app-specific logging and toast integration)
- Time utilities (wraps dayjs, adds app-specific formatting)
- LaTeX preprocessing (very specific to our markdown needs)
- List continuation (specific UX behavior)

## Conclusion

The project uses a balanced approach:
- **Adopt** battle-tested libraries for complex tasks (date handling, markdown, sanitization)
- **Custom** implementation for app-specific logic and simple utilities
- **Prioritize** maintainability and readability over pure LoC reduction
- **Ensure** all dependencies are MIT licensed and offline-compatible

This approach keeps the bundle size reasonable while leveraging the open-source ecosystem where it provides real value.
