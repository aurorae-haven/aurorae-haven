# Import/Export Guide

This guide explains how to back up, transfer, and restore your Aurorae Haven data, with a focus on Brain Dump content.

## Overview

Aurorae Haven supports comprehensive data import and export functionality to help you:

- **Back up your data** regularly to prevent data loss
- **Transfer data** between devices or browsers
- **Restore data** after clearing browser storage
- **Migrate data** when switching computers

All data is exported to a single JSON file that can be safely stored and imported later.

## How to Export Data

### Step-by-Step Instructions

1. **Open Aurorae Haven** in your browser
2. **Click the "Export" button** in the top-right corner of the application header
3. **Save the file** when prompted
   - Default filename: `aurorae_haven_data.json`
   - Includes export timestamp in the data

### What Gets Exported

The export includes:

- ✅ **Brain Dump Content**: Your current markdown notes
- ✅ **Tags**: All tags from your tag palette
- ✅ **Version History**: Up to 50 previous versions of your brain dump
- ✅ **Brain Dump Entries**: All saved entries
- ✅ **Tasks (Eisenhower Matrix)**: All tasks organized in four quadrants (urgent/important matrix)
- ✅ **Tasks (IndexedDB)**: Legacy task list with completion status (if using IndexedDB)
- ✅ **Routines**: Routines with steps and timings
- ✅ **Habits**: Habit tracking data and streaks
- ✅ **Schedule**: Your daily schedule and time blocks

### Export File Structure

The export file contains all your data in a structured JSON format:

```json
{
  "version": 1,
  "exportedAt": "2025-01-15T12:34:56.789Z",
  "tasks": [
    {
      "id": "uuid-1",
      "text": "Do this now",
      "completed": false,
      "createdAt": 1704453600000
    },
    {
      "id": "uuid-2",
      "text": "Plan ahead",
      "completed": false,
      "createdAt": 1704453700000
    }
  ],
  "routines": [],
  "habits": [],
  "dumps": [
    {
      "id": "note_1",
      "title": "My Note",
      "content": "# Note Content\n\nSome text here",
      "category": "ideas",
      "createdAt": "2025-01-15T12:00:00Z",
      "updatedAt": "2025-01-15T12:30:00Z"
    }
  ],
  "schedule": [],
  "auroraeTasksData": {
    "urgent_important": [
      {
        "id": "uuid-1",
        "text": "Do this now",
        "completed": false,
        "createdAt": 1704453600000
      }
    ],
    "not_urgent_important": [
      {
        "id": "uuid-2",
        "text": "Plan ahead",
        "completed": false,
        "createdAt": 1704453700000
      }
    ],
    "urgent_not_important": [],
    "not_urgent_not_important": []
  },
  "brainDump": {
    "content": "# Your markdown content here\n\n- [ ] Task 1\n- [x] Task 2",
    "tags": "<span class=\"tag\">#idea</span><span class=\"tag\">#urgent</span>",
    "versions": [
      {
        "id": 1704453600000,
        "content": "Previous version content",
        "timestamp": "2025-01-15T12:00:00Z",
        "preview": "Previous version content..."
      }
    ],
    "entries": [
      {
        "id": "note_1",
        "title": "My Note",
        "content": "# Note Content",
        "category": "ideas",
        "createdAt": "2025-01-15T12:00:00Z",
        "updatedAt": "2025-01-15T12:30:00Z"
      }
    ]
  }
}
```

**Key Fields Explained:**

- **`version`** (number): Data format version for compatibility checking
- **`exportedAt`** (ISO timestamp): When the export was created
- **`tasks`** (array): Flattened array of all tasks from all quadrants
-**`routines`** (array): Saved routines
- **`habits`** (array): Habit tracking data
- **`dumps`** (array): Brain dump notes/entries
- **`schedule`** (array): Calendar/schedule events
- **`auroraeTasksData`** (object): Original Eisenhower matrix format with four quadrants:
  - `urgent_important`: Do first (high priority, urgent)
  - `not_urgent_important`: Schedule (high priority, not urgent)
  - `urgent_not_important`: Delegate (low priority, urgent)
  - `not_urgent_not_important`: Eliminate (low priority, not urgent)
- **`brainDump`** (object): Brain dump metadata and version history:
  - `content`: Current markdown content
  - `tags`: HTML tag palette
  - `versions`: Version history (up to 50 versions)
  - `entries`: Same as `dumps` array (for backward compatibility)

### Export Validation

The export process validates data before creating the JSON file:

- ✅ Checks for required `version` field
- ✅ Validates data is serializable (no circular references)
- ✅ Ensures all data can be converted to valid JSON format

## How to Import Data

### Step-by-Step Instructions

1. **Open Aurorae Haven** in your browser (or on a new device)
2. **Click the "Import" button** in the top-right corner of the application header
3. **Select your export file** from the file picker
   - Must be a `.json` file previously exported from Aurorae Haven
4. **Wait for confirmation** message: "Data imported successfully. Page will reload..."
5. **Page reloads automatically** to display your imported data

### What Happens During Import

- All data from the JSON file is restored to browser localStorage
- Existing data is **replaced** (not merged) with imported data
- Page reloads to ensure UI reflects the imported data
- Import validation ensures data integrity

### Import Validation

The import process validates:

- ✅ Valid JSON format
- ✅ Required `version` field present (must be a number)
- ✅ Data structure matches expected schema
- ✅ Array fields (`tasks`, `routines`, `habits`, `dumps`, `schedule`) must be arrays if present
- ✅ `brainDump` object structure validation:
  - `content` must be a string if present
  - `tags` must be a string if present
  - `versions` must be an array if present
  - `entries` must be an array if present
- ✅ Defaults to empty arrays for missing optional fields

### Error Handling

If import fails, you'll see an error message:

- **"Import failed: Unexpected token..."** → File is not valid JSON
- **"Import failed: Invalid schema: Missing required field: version"** → File is missing required version field
- **"Import failed: Invalid schema: Invalid type for [field]: expected [type]"** → A field has the wrong data type
  - Example: `tasks` should be an array, not a string or object
  - Example: `version` should be a number, not a string
- **"Import failed: [specific error]"** → Check the browser console for detailed error information

## Best Practices

### Regular Backups

- **Export weekly** if you use Aurorae Haven actively
- **Export before major changes** (clearing browser data, switching browsers, etc.)
- **Store exports safely** in cloud storage or external drives
- **Label exports with dates** for easy identification

### Data Safety

- **Test imports** after exporting to ensure data integrity
- **Keep multiple backups** from different dates
- **Don't share export files** unless necessary (they contain all your private data)
- **Store securely** in password-protected folders if sharing devices

### Transferring Between Devices

1. **Export from Device A**
   - Open Aurorae Haven
   - Click Export
   - Save JSON file

2. **Transfer the file**
   - Email to yourself
   - Use cloud storage (Google Drive, Dropbox, etc.)
   - USB drive or other physical media

3. **Import to Device B**
   - Open Aurorae Haven on new device
   - Click Import
   - Select transferred JSON file
   - Wait for reload

## Troubleshooting

### Export Issues

**Problem**: Export button doesn't work

- **Solution**: Check browser console for errors, try refreshing the page

**Problem**: Export file is empty or very small

- **Solution**: You may have no data to export yet, or localStorage is empty

### Import Issues

**Problem**: "Import failed: Unexpected token" error

- **Solution**: File may be corrupted or not a valid JSON file. Try exporting fresh data from source device.

**Problem**: Import succeeds but data doesn't appear

- **Solution**: Force refresh the page (Ctrl+Shift+R / Cmd+Shift+R) or clear browser cache

**Problem**: Some data missing after import

- **Solution**: Check that the export file includes all expected fields. Re-export from source device if needed.

### Browser Storage Limits

- **localStorage limit**: Typically 5-10MB per domain
- **Large exports**: May fail if localStorage is nearly full
- **Solution**: Clear old version history or entries before exporting

## Technical Details

### Storage Keys

Aurorae Haven uses these storage locations:

**localStorage keys:**

- `aurorae_tasks` - Tasks in Eisenhower matrix format (4 quadrants: urgent_important, not_urgent_important, urgent_not_important, not_urgent_not_important)
- `brainDumpContent` - Current brain dump markdown content
- `brainDumpTags` - HTML string of tag palette
- `brainDumpVersions` - Array of version history objects
- `brainDumpEntries` - Array of brain dump entry objects (exported as `dumps`)

**IndexedDB stores:**

- `tasks` - Task management (when using IndexedDB)
- `routines` (formerly `sequences`) - Routines
- `habits` - Habit tracking
- `dumps` - Brain dump entries (when using IndexedDB)
- `schedule` - Schedule events
- `stats` - Statistics data
- `file_refs` - File attachment references
- `backups` - Automatic backups

**Export Behavior:**

- The export function first checks IndexedDB for data
- If IndexedDB is empty or unavailable, it falls back to localStorage
- From localStorage, it reads `aurorae_tasks` and `brainDumpEntries`
- The export includes both the original Eisenhower format (`auroraeTasksData`) and a flattened tasks array (`tasks`)

### Data Format Version

Current version: **1**

Future versions may introduce breaking changes. Always export before updating Aurorae Haven.

### Privacy & Security

- **No cloud storage**: All data stays in your browser (localStorage)
- **No external requests**: Export/import happens entirely client-side
- **Local only**: Data is never sent to servers
- **User control**: You decide when to export and where to store files

## Frequently Asked Questions

### Can I edit the exported JSON file?

Yes, but be careful:

- Use a proper JSON editor (VSCode, online JSON editor)
- Maintain the structure and field types
- Test import on a separate browser/device first

### Can I merge data from multiple exports?

Not currently supported. Import replaces all existing data. Future versions may support selective import/merge.

### How do I automate backups?

Currently manual export only. Future versions may support:

- Automatic daily/weekly exports
- Browser extension for scheduled backups
- Cloud sync (optional, with user control)

### What if I lose my export file?

Unfortunately, data cannot be recovered without an export file. Best practices:

- Export regularly
- Store in multiple locations
- Use cloud storage for automatic backup

### Can I export only Brain Dump data?

Currently, export includes all data types. Use the dedicated "📤 Export" button in Brain Dump toolbar to export just markdown content (saves as `.md` file, not JSON).

## Additional Resources

- [Brain Dump Specifications](./BRAIN_DUMP_SPECS.md) - Technical details about Brain Dump features
- [Contributing Guide](../CONTRIBUTING.md) - Report bugs or request features
- [Roadmap](../ROADMAP.md) - See planned improvements to import/export

## Support

Having issues with import/export? Please:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Open an issue on [GitHub](https://github.com/aurorae-haven/aurorae-haven/issues) with:
   - Browser and version
   - Steps to reproduce
   - Error messages (if any)
   - Sample export file structure (remove sensitive data)

---

**Last Updated**: January 2025  
**Version**: 1.0.0
