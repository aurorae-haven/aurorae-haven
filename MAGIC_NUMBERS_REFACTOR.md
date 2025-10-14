# Magic Numbers Refactoring Summary

## Overview

This document summarizes the refactoring work done to eliminate magic numbers and hardcoded values from the codebase, in accordance with coding guidelines that emphasize maintainability and configuration management.

## Issue Reference

**Original Issue**: [PR #279 Discussion](https://github.com/aurorae-haven/aurorae-haven/pull/279#discussion_r2427264955)

**Issue Title**: According to the coding guidelines, magic numbers and hardcoded values should be avoided. Consider extracting these constants to a configuration object or environment variables for better maintainability.

## New Configuration Files Created

### 1. `src/utils/uiConstants.js`

Centralized UI-related constants for timing, delays, and display settings:

- `TOAST_DISPLAY_DURATION_MS = 3800` - Toast notification display duration
- `PAGE_RELOAD_DELAY_MS = 1500` - Page reload delay after import/export
- `NAV_PROMPT_SUPPRESS_WINDOW_MS = 2000` - Safety window for navigation prompts
- `FILENAME_MAX_LENGTH = 30` - Maximum filename length
- `DEFAULT_BACKUP_LIMIT = 10` - Default number of backups to keep

### 2. `src/utils/scheduleConstants.js`

Centralized schedule and calendar-related constants:

- `DEFAULT_EVENT_DURATION_MINUTES = 60` - Default event duration
- `BUSINESS_HOURS_START = '08:00'` - Start of business day
- `BUSINESS_HOURS_END = '22:00'` - End of business day
- `MINUTES_PER_HOUR = 60` - Time conversion constant
- `HOURS_PER_DAY = 24` - Time conversion constant
- `FILTER_RECENT_DAYS = 30` - Filter time range for "recent" items

### 3. `src/utils/themeConstants.js`

Centralized theme colors and styling constants:

- `THEME_COLOR_PRIMARY = '#1a1a2e'` - Primary theme color
- `THEME_COLOR_BACKGROUND = '#0f0f1e'` - Background color
- `THEME_COLOR_TEXT = '#e0e0ff'` - Text color
- `PWA_ICON_SIZE_SMALL = '192x192'` - Small PWA icon size
- `PWA_ICON_SIZE_LARGE = '512x512'` - Large PWA icon size
- `CACHE_MAX_ENTRIES = 10` - Maximum cache entries
- `CACHE_MAX_AGE_DAYS = 30` - Maximum cache age in days
- `BYTES_PER_KILOBYTE = 1024` - File size calculation constant

### 4. Updates to `src/utils/timeConstants.js`

Added date format constants:

- `ISO_DATE_START_INDEX = 0` - Start index for ISO date slice
- `ISO_DATE_END_INDEX = 10` - End index for ISO date slice (YYYY-MM-DD)

## Files Refactored

### Configuration Files

1. **`vite.config.js`**
   - Extracted theme colors (`THEME_COLOR_PRIMARY`, `THEME_COLOR_BACKGROUND`)
   - Extracted PWA icon sizes (`PWA_ICON_SIZE_SMALL`, `PWA_ICON_SIZE_LARGE`)
   - Extracted cache settings (`CACHE_MAX_ENTRIES`, `CACHE_MAX_AGE_DAYS`)
   - Extracted server port numbers (`DEV_SERVER_PORT`, `PREVIEW_SERVER_PORT`)

2. **`index.html`**
   - Added documentation comments linking inline styles to theme constants
   - Inline styles remain in place as they are required for noscript context
   - Comments reference `src/utils/themeConstants.js` for consistency

### Utility Files

3. **`src/utils/fileHelpers.js`**
   - Replaced magic number `30` with `FILENAME_MAX_LENGTH`
   - Replaced date slice indices with `ISO_DATE_START_INDEX` and `ISO_DATE_END_INDEX`
   - Added constants for time padding (`TIME_PADDING_LENGTH`, `PADDING_CHAR`)

4. **`src/utils/scheduleManager.js`**
   - Replaced `60` with `DEFAULT_EVENT_DURATION_MINUTES`
   - Replaced `'08:00'` with `BUSINESS_HOURS_START`
   - Replaced `'22:00'` with `BUSINESS_HOURS_END`
   - Replaced `60` and `24` in time calculations with `MINUTES_PER_HOUR` and `HOURS_PER_DAY`
   - Added constants for time padding

5. **`src/utils/pageHelpers.js`**
   - Replaced `1500` with `PAGE_RELOAD_DELAY_MS`
   - Replaced `3800` with `TOAST_DISPLAY_DURATION_MS`
   - Replaced `2000` with `NAV_PROMPT_SUPPRESS_WINDOW_MS`
   - Updated ISO date extraction to use constants

6. **`src/utils/importData.js`**
   - Replaced default delay `1500` with `PAGE_RELOAD_DELAY_MS`

7. **`src/utils/indexedDBManager.js`**
   - Replaced default limit `10` with `DEFAULT_BACKUP_LIMIT`

8. **`src/utils/autoBackup.js`**
   - Replaced `MAX_BACKUPS = 10` with `DEFAULT_BACKUP_LIMIT`
   - Improved time calculation using `MINUTES_PER_HOUR` constant

9. **`src/utils/notes/fileAttachments.js`**
   - Replaced `1024` with `BYTES_PER_KILOBYTE`
   - Added `FILE_SIZE_PRECISION = 100` constant for display formatting

10. **`src/utils/notes/noteFilters.js`**
    - Replaced `7` with `LATEST_FILTER_DAYS`
    - Replaced `30` with `FILTER_RECENT_DAYS`
    - Added constants for date calculations (`MONTH_START_DAY`, `YEAR_START_MONTH`)

## Benefits

### Maintainability

- All configuration values are now centralized in dedicated constant files
- Changes to values only need to be made in one location
- Clear naming makes the purpose of each value explicit

### Readability

- Code is more self-documenting with named constants
- Developers can quickly understand what values represent
- Reduces cognitive load when reading code

### Consistency

- Same values used across multiple files are guaranteed to be identical
- Theme colors and timing values are consistent throughout the application
- Reduces risk of inconsistencies from manual value entry

### Flexibility

- Easy to adjust timing, colors, and limits for different environments
- Constants can be easily exported for use in tests
- Foundation for future environment-based configuration

## Testing

All changes have been validated:

1. **Linting**: ✅ No ESLint errors or warnings

   ```bash
   npm run lint
   ```

2. **Build**: ✅ Successful production build

   ```bash
   npm run build
   ```

3. **Bundle Size**: Maintained similar bundle size (~1.25 MB precached assets)

## Future Enhancements

While this refactoring addresses the immediate issue, future improvements could include:

1. **Environment Variables**: Move some constants to `.env` files for environment-specific configuration
2. **Theme System**: Expand theme constants to support multiple themes or user customization
3. **Configuration API**: Create a centralized configuration API for runtime value access
4. **Type Safety**: Add TypeScript types for configuration constants
5. **Validation**: Add runtime validation for configuration values

## Migration Guide

For developers working on this codebase:

1. **Before adding new magic numbers**, check if a relevant constant exists
2. **When adding new constants**, place them in the appropriate constants file:
   - UI timing/display → `uiConstants.js`
   - Schedule/calendar → `scheduleConstants.js`
   - Theme/colors → `themeConstants.js`
   - Time conversion → `timeConstants.js`
   - Validation → `validationConstants.js`
3. **Document the purpose** of new constants with clear comments
4. **Import only what you need** to keep bundle sizes small

## Conclusion

This refactoring successfully eliminates magic numbers throughout the codebase, replacing them with well-organized, centralized constants. The changes improve code maintainability, readability, and consistency while maintaining full backward compatibility and functionality.

All changes follow established coding guidelines and best practices, including:

- Google Engineering Practices Guide
- Clean Code principles (Robert C. Martin)
- ISO/IEC 25010 Software Quality Model
