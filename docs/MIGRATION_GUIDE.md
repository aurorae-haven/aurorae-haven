# Migration Guide: localStorage to IndexedDB

## Overview

Aurorae Haven now uses IndexedDB for data storage, providing better performance, reliability, and offline capabilities. This guide explains the migration process for existing users.

## What's Changing?

### Before (v0.x)

- Data stored in **localStorage** (multiple keys)
- Limited to ~5-10 MB storage
- Synchronous operations (can block UI)
- No automatic backups
- Basic export/import

### After (v1.0+)

- Data stored in **IndexedDB** (structured database)
- Up to **50 MB+** storage (browser-dependent)
- Asynchronous operations (no UI blocking)
- **Automatic backups** every 24 hours
- Enhanced statistics tracking
- File attachment support

## Do You Need to Migrate?

### Automatic Migration

✅ **No action required for most users**

The app automatically detects and uses IndexedDB when available. Your existing localStorage data remains accessible as a fallback.

### When to Manually Migrate

Consider manual migration if:

- You have a lot of data in localStorage
- You want to use new IndexedDB features
- You're experiencing performance issues
- You want automatic backups

## Migration Options

### Option 1: Automatic (Recommended)

**How it works**: The app uses IndexedDB for new data, localStorage for old data

**Advantages**:

- No user action required
- Zero downtime
- Safe and gradual

**Disadvantages**:

- Old data stays in localStorage
- No automatic backups for old data

**Steps**:

1. Update to v1.0+
2. Continue using the app normally
3. New data automatically uses IndexedDB

### Option 2: Manual Migration

**How it works**: Manually trigger migration to move all data to IndexedDB

**Advantages**:

- All data in one place (IndexedDB)
- Automatic backups enabled for all data
- Better performance

**Disadvantages**:

- Requires browser console access
- One-time manual process

**Steps**:

#### Step 1: Export Current Data (Safety Backup)

1. Open Aurorae Haven
2. Click the **Export** button (📤) in any module
3. Save the JSON file to a safe location
4. **Keep this file** - it's your safety backup

#### Step 2: Open Browser Console

**Chrome/Edge/Brave**:

- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Firefox**:

- Press `F12` or `Ctrl+Shift+K` (Windows/Linux)
- Press `Cmd+Option+K` (Mac)

**Safari**:

- Enable Developer menu: Preferences → Advanced → Show Develop menu
- Press `Cmd+Option+C`

#### Step 3: Run Migration

Copy and paste this code into the console:

```javascript
// Import migration function
import { migrateFromLocalStorage } from './utils/indexedDBManager.js'

// Run migration
migrateFromLocalStorage().then((report) => {
  console.log('Migration Report:', report)
  if (report.success) {
    console.log('✅ Migration successful!')
    console.log('Migrated items:', report.migrated)
  } else {
    console.error('❌ Migration failed:', report.errors)
  }
})
```

**Alternative (if module import doesn't work)**:

```javascript
// Access migration via window object
window.indexedDB.open('aurorae_haven_db', 1).onsuccess = function (event) {
  console.log('✅ IndexedDB is available and ready')
  console.log('Reload the page to complete migration')
  window.location.reload()
}
```

#### Step 4: Verify Migration

After migration completes:

1. Reload the page
2. Check that your data is still visible
3. Try creating new tasks/habits/notes
4. Export data to verify everything is included

### Option 3: Fresh Start with Import

**How it works**: Export old data, clear storage, import to new system

**Advantages**:

- Clean slate
- Guaranteed to use IndexedDB
- Can skip unwanted old data

**Disadvantages**:

- Requires export/import steps
- Brief downtime during process

**Steps**:

#### Step 1: Export Existing Data

1. Click **Export** button
2. Save JSON file

#### Step 2: Clear Browser Data

1. Open browser settings
2. Navigate to Privacy/Security → Clear browsing data
3. Select only "Cookies and site data" or "Local storage"
4. Clear data for `aurorae-haven.github.io`

#### Step 3: Reload and Import

1. Reload Aurorae Haven
2. Click **Import** button
3. Select your exported JSON file
4. Wait for "Import successful" message

## Verification Checklist

After migration, verify the following:

- [ ] All tasks are visible
- [ ] Routines are intact
- [ ] Habits and streaks are correct
- [ ] Brain dump content is preserved
- [ ] Schedule events are present
- [ ] Tags are still available
- [ ] Export works and creates JSON file
- [ ] Can create new items

## What Gets Migrated?

### Automatically Migrated

✅ Tasks
✅ Routines
✅ Habits
✅ Brain dump entries
✅ Schedule events

### Not Migrated (Remains in localStorage)

📍 Brain dump editor content (active buffer)
📍 Brain dump tags palette (UI state)
📍 Brain dump version history
📍 UI preferences and settings

**Why?** These items are temporary or UI-specific and don't need IndexedDB storage.

## Storage Comparison

| Feature         | localStorage           | IndexedDB                   |
| --------------- | ---------------------- | --------------------------- |
| Size limit      | ~5-10 MB               | ~50 MB+                     |
| Performance     | Synchronous (blocking) | Asynchronous (non-blocking) |
| Queries         | Manual filtering       | Indexed queries             |
| Transactions    | None                   | ACID transactions           |
| Backups         | Manual export only     | Automatic + manual          |
| Offline         | Yes                    | Yes                         |
| Browser support | 100%                   | 97%+                        |

## Browser Compatibility

### Supported Browsers

- ✅ Chrome 24+ (2012)
- ✅ Firefox 16+ (2012)
- ✅ Safari 10+ (2016)
- ✅ Edge 12+ (2015)
- ✅ Opera 15+ (2013)

### Unsupported Browsers

- ❌ Internet Explorer (any version)
- ❌ Very old mobile browsers

**Fallback**: If IndexedDB isn't available, the app automatically uses localStorage.

## Troubleshooting

### "Migration failed" Error

**Possible causes**:

1. Browser storage disabled
2. Private/Incognito mode
3. Storage quota exceeded
4. Browser extension blocking

**Solutions**:

1. Try in normal (non-private) browsing mode
2. Check browser settings allow storage
3. Clear some browser data to free space
4. Disable extensions temporarily

### Data Missing After Migration

**Solution**:

1. Don't panic! Your export file is your backup
2. Clear browser data
3. Use Option 3 (Fresh Start with Import)
4. Import your backup file

### Migration Hangs or Takes Forever

**Causes**:

- Very large dataset
- Slow device
- Browser busy with other tasks

**Solutions**:

1. Close other tabs/apps
2. Wait 5-10 minutes
3. If still hanging, force reload and try Option 3

### "IndexedDB not available" Message

**Cause**: Browser doesn't support IndexedDB

**Solution**: App will continue working with localStorage (no migration needed)

## FAQ

### Will I lose my data during migration?

**No.** Migration copies data to IndexedDB but doesn't delete from localStorage. Your data exists in both places until you manually clear browser data.

### Can I undo the migration?

**Yes.** IndexedDB and localStorage work independently. If you exported before migration, you can always import that backup.

### Do I need to migrate immediately?

**No.** The app works fine with localStorage. Migrate when convenient.

### Will automatic backups work without migration?

**Partially.** Automatic backups only cover IndexedDB data. Old localStorage data isn't auto-backed up until migrated.

### How do I check if I'm using IndexedDB?

Open browser console and run:

```javascript
indexedDB.databases().then((dbs) => {
  const hasDB = dbs.some((db) => db.name === 'aurorae_haven_db')
  console.log(hasDB ? '✅ Using IndexedDB' : '❌ Using localStorage')
})
```

### Can I migrate on mobile?

**Yes**, but it's harder to access the browser console. Instead:

1. Export data on mobile
2. Open desktop browser
3. Import data (will automatically use IndexedDB)
4. Use desktop for main usage or sync manually

### What happens to my backups after migration?

Old exports remain valid. Import works regardless of storage method.

### Will future versions require IndexedDB?

**No.** We'll maintain localStorage fallback indefinitely for maximum compatibility.

## Performance Improvements

After migrating to IndexedDB, you should notice:

- ✅ Faster app loading
- ✅ Smoother interactions (no UI freezing)
- ✅ Better handling of large datasets
- ✅ Improved statistics performance
- ✅ Automatic backups every 24 hours

## Data Loss Prevention

### Best Practices

1. **Export weekly** - Use the export button regularly
2. **Multiple backups** - Keep exports from different dates
3. **Cloud storage** - Store exports in Dropbox/Google Drive/etc.
4. **Test imports** - Occasionally test importing to verify backup integrity

### Safety Features

- Automatic backups (after migration)
- Export button always available
- Import validates data before clearing old data
- Version tracking prevents incompatible imports

## Getting Help

If you encounter issues:

1. **Check this guide** - Most problems are covered here
2. **Try Option 3** - Fresh start with import often solves issues
3. **Export first** - Always have a backup before troubleshooting
4. **Open an issue** - GitHub issues with `migration` label

## Summary

**Recommended path for most users**: Do nothing. The app handles everything automatically.

**For power users or those with issues**: Follow Option 2 (Manual Migration) for full IndexedDB benefits.

**If something goes wrong**: Use Option 3 (Fresh Start with Import) with your safety backup.

---

**Remember**: Export your data before any major changes. It's your safety net! 📤
