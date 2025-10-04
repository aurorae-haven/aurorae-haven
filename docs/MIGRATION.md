# LocalStorage Key Migration

## Overview

This document describes the localStorage key migration from `stellar_journey_data` to `aurorae_haven_data`.

## Background

The application was originally developed under the name "Stellar Journey" but has been rebranded to "Aurorae Haven". As part of this rebranding, the localStorage key used to store user data needed to be updated to reflect the new name.

## Migration Strategy

To ensure existing users don't lose their data, an automatic migration mechanism has been implemented:

1. **On app load**, the `migrateStorageKey()` function is called
2. **Check new key**: If `aurorae_haven_data` already exists, no migration is needed
3. **Check old key**: If only `stellar_journey_data` exists, the data is copied to the new key
4. **Cleanup**: After successful migration, the old key is removed
5. **Continue**: The app continues using the new key for all operations

## Implementation Details

### Migration Function

The migration is handled by `migrateStorageKey()` in `src/utils/dataManager.js`:

```javascript
export function migrateStorageKey() {
  try {
    // Check if new key already has data
    const newData = localStorage.getItem(NEW_STORAGE_KEY)
    if (newData) {
      return { migrated: false, reason: 'new_key_exists' }
    }

    // Check if old key has data
    const oldData = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldData) {
      // Migrate: copy old data to new key
      localStorage.setItem(NEW_STORAGE_KEY, oldData)
      // Remove old key after successful migration
      localStorage.removeItem(OLD_STORAGE_KEY)
      return { migrated: true, reason: 'migration_complete' }
    }

    return { migrated: false, reason: 'no_data_found' }
  } catch (e) {
    console.error('Migration error:', e)
    return { migrated: false, reason: 'error', error: e.message }
  }
}
```

### Where Migration is Called

The migration is automatically triggered in two places:

1. **React App** (`src/index.js`): Called in a `useEffect` hook on app mount
2. **Legacy Pages** (`src/utils/pageHelpers.js`): Called immediately in the IIFE

### Return Values

The `migrateStorageKey()` function returns an object with:

- `migrated` (boolean): `true` if migration occurred, `false` otherwise
- `reason` (string): One of:
  - `'migration_complete'`: Data was successfully migrated
  - `'new_key_exists'`: New key already has data, no migration needed
  - `'no_data_found'`: Neither key exists, nothing to migrate
  - `'error'`: An error occurred during migration
- `error` (string, optional): Error message if `reason` is `'error'`

## Updated File Names

All exported data files now use the new naming convention:

- **Old**: `stellar_journey_data.json`
- **New**: `aurorae_haven_data.json`

## Testing

Comprehensive tests have been added in `src/__tests__/dataManager.test.js` to cover:

1. ✅ Successful migration from old to new key
2. ✅ No migration when new key already exists
3. ✅ Handling when neither key exists
4. ✅ Handling when only new key exists
5. ✅ Error handling for localStorage failures
6. ✅ Data integrity preservation during migration
7. ✅ Export uses new filename
8. ✅ Import stores data with new key
9. ✅ Invalid JSON rejection
10. ✅ Schema validation

All tests pass successfully.

## User Impact

### Existing Users

- **No action required**: Migration happens automatically on next app load
- **Data preserved**: All existing data is transferred to the new key
- **Seamless transition**: No visible changes to the user experience

### New Users

- Start with the new key from the beginning
- No migration needed

## Backwards Compatibility

The migration is **one-way** and **permanent**:

- Once migrated, data only exists under the new key
- Old key is removed after successful migration
- There is no rollback mechanism (by design)

This is intentional to avoid confusion and ensure a clean transition to the new branding.

## Troubleshooting

### Migration didn't work

If you suspect migration didn't occur:

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check if `aurorae_haven_data` exists
4. If not, check console for migration errors

### Lost data after migration

If data appears lost:

1. Check browser DevTools → Local Storage
2. Verify `aurorae_haven_data` contains your data
3. Try refreshing the page
4. Check console for any errors

### Manual migration

If automatic migration fails, you can manually migrate:

```javascript
// In browser console
const oldData = localStorage.getItem('stellar_journey_data')
if (oldData) {
  localStorage.setItem('aurorae_haven_data', oldData)
  localStorage.removeItem('stellar_journey_data')
  console.log('Manual migration complete')
}
```

## Future Considerations

- The old key constant (`OLD_STORAGE_KEY`) is kept for migration purposes
- It can be removed in a future major version (e.g., v2.0) once all users have migrated
- Consider adding a migration tracking mechanism to know when safe to remove

## Related Files

- `src/utils/dataManager.js`: Main migration logic
- `src/utils/pageHelpers.js`: Legacy page migration trigger
- `src/index.js`: React app migration trigger
- `src/__tests__/dataManager.test.js`: Migration tests
