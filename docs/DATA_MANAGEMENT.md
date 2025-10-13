# Data Management Architecture

## Overview

Aurorae Haven implements a robust data management system that meets all ARC-DAT requirements. The system uses IndexedDB for structured data storage, OPFS for file attachments, automatic backups, and aggregated statistics.

## Architecture Compliance

### ARC-DAT-01: Structured Data in IndexedDB

**Requirement**: The application shall store structured data in IndexedDB.

**Implementation**: Full IndexedDB wrapper with transaction-based operations

**Features**:

- 8 object stores for different data types
- Indexed fields for optimized queries
- Automatic schema upgrades
- Transaction-based CRUD operations
- Backward compatibility with localStorage

**Object Stores**:

| Store Name | Purpose            | Key Path  | Indexes                                   |
| ---------- | ------------------ | --------- | ----------------------------------------- |
| tasks      | Task management    | id (auto) | timestamp, status                         |
| routines   | Routines           | id        | timestamp                                 |
| habits     | Habit tracking     | id (auto) | timestamp, paused                         |
| dumps      | Brain dump entries | id (auto) | timestamp                                 |
| schedule   | Schedule events    | id (auto) | day, timestamp                            |
| stats      | Statistics data    | id (auto) | type, date, timestamp                     |
| file_refs  | File references    | id (auto) | fileName, parentType, parentId, timestamp |
| backups    | Auto-backups       | id (auto) | timestamp                                 |

### ARC-DAT-02: File Attachments in OPFS

**Requirement**: Attachments shall be stored in OPFS with references in IndexedDB.

**Implementation**: File metadata in IndexedDB, actual files in OPFS

**Features**:

- Metadata stored in `file_refs` object store
- Links files to parent records via parentType and parentId
- Supports file cleanup when references are deleted
- File size and type tracking

**File Reference Schema**:

```javascript
{
  id: number,              // Auto-generated
  fileName: string,        // Unique filename
  parentType: string,      // e.g., 'dump', 'task'
  parentId: number,        // ID of parent record
  timestamp: number,       // Creation timestamp
  size: number,           // File size in bytes
  type: string            // MIME type
}
```

**API**:

```javascript
// Add file reference
await addFileReference('photo.jpg', 'dump', 123, {
  size: 1024,
  type: 'image/jpeg'
})

// Get file references for a parent
const refs = await getFileReferences('dump', 123)

// Delete file reference
await deleteFileReference('photo.jpg')
```

### ARC-DAT-03: Automatic Backups

**Requirement**: Data shall be automatically backed up locally and exportable by the user.

**Implementation**: Automatic backups to IndexedDB with rotation

**Features**:

- Automatic backup every 24 hours
- Keeps last 10 backups (configurable)
- Manual backup trigger available
- Backup size tracking
- Export to JSON file

**Configuration**:

```javascript
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
const MAX_BACKUPS = 10 // Keep last 10
```

**API**:

```javascript
// Initialize auto-backup system (call on app load)
await initAutoBackup()

// Manually trigger backup
await triggerManualBackup()

// Get recent backups
const backups = await getRecentBackups(5)

// Clean old backups
await cleanOldBackups(10)
```

**Backup Schema**:

```javascript
{
  id: number,              // Auto-generated
  timestamp: number,       // Backup timestamp
  data: string,           // JSON-stringified data
  size: number            // Size in bytes
}
```

### ARC-DAT-04: Statistics Storage

**Requirement**: Statistics shall be stored in a separate aggregated structure for performance.

**Implementation**: Dedicated stats object store with type and date indexes

**Features**:

- Separate `stats` object store
- Indexed by type and date for fast queries
- Aggregated data for performance
- Date range queries supported

**Statistics Types**:

- `task_completion` - Task completion metrics
- `habit_streak` - Habit streak tracking
- `routine_time` - Routine completion times

**API**:

```javascript
// Save statistics
await saveStats('task_completion', { count: 5, percentage: 80 })

// Get statistics by type
const taskStats = await getStatsByType('task_completion')

// Get statistics by date range
const stats = await getStatsByDateRange('2025-01-01', '2025-01-31')
```

**Statistics Schema**:

```javascript
{
  id: number,              // Auto-generated
  type: string,           // Stat type
  date: string,           // ISO date (YYYY-MM-DD)
  timestamp: number,      // Creation timestamp
  ...customData           // Type-specific data
}
```

### ARC-ONL-05: Offline Functionality

**Requirement**: The application shall continue to function offline even when synchronisation is unavailable.

**Implementation**: IndexedDB + Service Worker

**Features**:

- IndexedDB works offline by design (local storage)
- Service worker caches app resources
- No network required for data operations
- Sync can be added in future versions

## API Reference

### Core Operations

#### Opening Database

```javascript
import { openDB } from './utils/indexedDBManager'

const db = await openDB()
// Database is ready to use
db.close()
```

#### Generic CRUD Operations

```javascript
import {
  getAll,
  getById,
  put,
  deleteById,
  clear
} from './utils/indexedDBManager'
import { STORES } from './utils/indexedDBManager'

// Get all items
const tasks = await getAll(STORES.TASKS)

// Get single item
const task = await getById(STORES.TASKS, 1)

// Add or update item
const id = await put(STORES.TASKS, { id: 1, title: 'My Task', done: false })

// Delete item
await deleteById(STORES.TASKS, 1)

// Clear all items
await clear(STORES.TASKS)
```

#### Index Queries

```javascript
import { getByIndex } from './utils/indexedDBManager'

// Get pending tasks
const pending = await getByIndex(STORES.TASKS, 'status', 'pending')

// Get today's schedule
const today = new Date().toISOString().split('T')[0]
const events = await getByIndex(STORES.SCHEDULE, 'day', today)
```

### Export/Import

#### Export Data

```javascript
import { exportJSON } from './utils/dataManager'

// Export all data to JSON file
await exportJSON()
// Downloads: aurorae_YYYY-MM-DD_UUID.json
```

#### Import Data

```javascript
import { importJSON } from './utils/dataManager'

// Import from file
const file = ... // File object from input
const result = await importJSON(file)

if (result.success) {
  console.log('Import successful')
} else {
  console.error('Import failed:', result.message)
}
```

#### Get Export Data

```javascript
import { exportAllData } from './utils/indexedDBManager'

// Get data as object (doesn't download)
const data = await exportAllData()
console.log(data)
// {
//   version: 1,
//   exportedAt: "2025-01-15T10:00:00Z",
//   tasks: [...],              // Flattened tasks from all quadrants
//   routines: [...],
//   habits: [...],
//   dumps: [...],              // Brain dump entries
//   schedule: [...],
//   auroraeTasksData: {        // Original Eisenhower matrix format
//     urgent_important: [...],
//     not_urgent_important: [...],
//     urgent_not_important: [...],
//     not_urgent_not_important: [...]
//   },
//   brainDump: {              // Brain dump metadata
//     content: "...",
//     tags: "...",
//     versions: [...],
//     entries: [...]
//   },
//   stats: [...],
//   fileRefs: [...]
// }
```

### Migration

#### Migrate from localStorage

```javascript
import { migrateFromLocalStorage } from './utils/indexedDBManager'

const report = await migrateFromLocalStorage()
console.log(report)
// {
//   success: true,
//   migrated: {
//     tasks: 5,
//     routines: 3,
//     habits: 2
//   },
//   errors: []
// }
```

### Browser Compatibility

#### Check IndexedDB Support

```javascript
import { isIndexedDBAvailable } from './utils/indexedDBManager'

if (isIndexedDBAvailable()) {
  // Use IndexedDB
} else {
  // Fallback to localStorage
}
```

## Data Flow

### Write Operations

1. User performs action (create task, complete habit, etc.)
2. Data written to IndexedDB
3. Statistics updated if applicable
4. Auto-backup scheduled if due

### Read Operations

1. App requests data
2. Check IndexedDB first
3. Fallback to localStorage if IndexedDB unavailable
4. Return data to app

### Export Flow

1. User clicks export button
2. Collect data from all IndexedDB stores
3. Include localStorage data (brain dump)
4. Generate JSON file with timestamp and UUID
5. Trigger browser download

### Import Flow

1. User selects JSON file
2. Validate schema (check version)
3. Clear existing IndexedDB data
4. Import data to IndexedDB stores
5. Import brain dump data to localStorage
6. Reload page to show new data

### Template Import/Export Flow

Templates have additional validation requirements to ensure data integrity:

#### Export Templates

```javascript
import { exportTemplates } from './utils/templatesManager'

// Export all templates
const data = await exportTemplates()
// {
//   version: '1.0',
//   exportDate: '2025-01-15T10:00:00Z',
//   templates: [...]
// }

// Export specific templates
const data = await exportTemplates(['template-id-1', 'template-id-2'])
```

#### Import Templates

```javascript
import { importTemplates } from './utils/templatesManager'

// Import templates with validation
const result = await importTemplates(data)
// {
//   imported: 5,
//   skipped: 1,
//   errors: [
//     { template: 'Invalid Template', error: 'Template type is required' }
//   ]
// }
```

**Import Validation:**

1. **Data structure validation**
   - Data must be an object
   - Must contain `version` field
   - Must contain `templates` array

2. **Version compatibility check**
   - Supported versions: `1.0`
   - Rejects incompatible versions with descriptive error
   - Example: `"Incompatible version: 2.0. Supported versions: 1.0"`

3. **Individual template validation**
   - Required fields: `type` (task/routine), `title` (non-empty string)
   - Type-specific validation:
     - Routine templates: `steps` must be array if present
     - Routine templates: `estimatedDuration` must be non-negative number if present
   - Optional fields: `tags` (array of strings), `quadrant`, `category`, etc.

4. **ID collision handling**
   - Automatically generates new ID if template ID already exists
   - Preserves all other template data

**Error Handling:**

- Import throws error for invalid data structure or incompatible version
- Individual template validation errors are collected in results
- Skipped templates don't block import of valid templates
- Error messages include template name and specific validation failure

**Example Import Errors:**

```javascript
// Missing version
{
  error: 'Invalid import data: missing version field'
}

// Incompatible version
{
  error: 'Incompatible version: 2.0. Supported versions: 1.0'
}

// Invalid template structure
{
  imported: 3,
  skipped: 1,
  errors: [
    {
      template: 'My Template',
      error: 'Template type must be one of: task, routine'
    }
  ]
}
```

### Auto-Backup Flow

1. App initializes `initAutoBackup()` on load
2. Check last backup timestamp
3. If 24+ hours passed, trigger backup
4. Save current data to `backups` store
5. Clean old backups (keep last 10)
6. Update last backup timestamp
7. Schedule next check in 1 hour

## Performance Considerations

### Indexes

All object stores have appropriate indexes for common queries:

- **timestamp**: For chronological sorting
- **status/type**: For filtering
- **date**: For date-range queries

### Transactions

All operations use transactions for data integrity:

- Read operations: `readonly` mode
- Write operations: `readwrite` mode
- Automatic cleanup on completion

### Memory Usage

- Statistics are aggregated, not raw event logs
- Backups are rotated (max 10 kept)
- File references are lightweight metadata only

### Query Optimization

```javascript
// Good: Use indexes
await getByIndex(STORES.STATS, 'type', 'task_completion')

// Bad: Filter in JavaScript
const all = await getAll(STORES.STATS)
const filtered = all.filter((s) => s.type === 'task_completion')
```

## Error Handling

### Database Errors

```javascript
try {
  await put(STORES.TASKS, task)
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Storage quota exceeded
  } else if (error.name === 'InvalidStateError') {
    // Database closed or deleted
  } else {
    // Other error
  }
}
```

### Graceful Degradation

The app automatically falls back to localStorage if IndexedDB fails:

```javascript
export async function getDataTemplate() {
  if (isIndexedDBAvailable()) {
    try {
      return await exportFromIndexedDB()
    } catch (e) {
      console.warn(
        'Failed to export from IndexedDB, falling back to localStorage:',
        e
      )
    }
  }
  // Fallback to localStorage...
}
```

## Testing

### Unit Tests

Comprehensive test suite with 21 tests covering:

- Basic CRUD operations
- File reference management
- Statistics storage
- Backup functionality
- Migration from localStorage
- Export/Import
- Index queries

### Running Tests

```bash
# Run all tests
npm test

# Run IndexedDB tests only
npm test -- indexedDBManager.test.js
```

### Test Coverage

```text
File                    | % Stmts | % Branch | % Funcs | % Lines
indexedDBManager.js     |   90.58 |    62.65 |   86.53 |   93.03
```

## Security Considerations

### Data Privacy

- All data stored locally (IndexedDB + OPFS)
- No external servers or cloud storage
- No tracking or analytics
- User controls all data via export/import

### Data Integrity

- Transaction-based operations prevent data corruption
- Schema validation on import
- Version tracking for migration compatibility

### XSS Prevention

- Brain dump content sanitized with DOMPurify
- No inline scripts or styles (strict CSP)
- Safe JSON parsing with error handling

## Future Enhancements (v2.0+)

### Planned Features

- [ ] Cloud sync (optional, user-controlled)
- [ ] Encryption at rest
- [ ] Selective export/import (specific modules)
- [ ] Data compression for backups
- [ ] Background sync API for offline changes
- [ ] Progressive data loading for large datasets
- [ ] Advanced statistics dashboard
- [ ] Real-time statistics updates

### Under Consideration

- WebSQL fallback (deprecated but still supported)
- SQLite WASM for advanced queries
- Data sharding for large datasets
- IndexedDB compression

## Troubleshooting

### "IndexedDB not available" Error

**Cause**: Browser doesn't support IndexedDB or it's disabled

**Solution**: App automatically falls back to localStorage

### "QuotaExceededError"

**Cause**: Storage quota exceeded

**Solution**:

1. Export data to JSON file
2. Clear old data
3. Import essential data back

### Slow Queries

**Cause**: Not using indexes

**Solution**: Use `getByIndex()` instead of filtering in JavaScript

### Lost Data After Import

**Cause**: Import clears existing data

**Solution**: Always export before importing

## Best Practices

### For Users

1. **Export regularly** - Use the export button weekly
2. **Store backups safely** - Save export files in cloud storage
3. **Test imports** - Verify imported data on test browser first
4. **Monitor storage** - Check browser storage settings if app slows down

### For Developers

1. **Always close database** - Prevent memory leaks
2. **Use transactions** - Ensure data integrity
3. **Index wisely** - Balance query speed vs storage
4. **Handle errors** - Graceful degradation to localStorage
5. **Test migrations** - Ensure backward compatibility
6. **Document schema changes** - Update version number

## Support

For issues or questions about data management:

- Check the FAQ in `IMPORT_EXPORT_GUIDE.md`
- Open an issue on GitHub with `data-management` label
- Review test files for usage examples

## References

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [OPFS API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [ARC-APP Compliance Report](./ARC-APP-COMPLIANCE.md)
