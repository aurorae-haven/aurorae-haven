# Batch Operations Guide

This guide explains how to use the batch operations API for efficient creation of multiple entities at once.

## Overview

Batch operations allow you to create multiple tasks or routines in a single operation, which is significantly more efficient than creating them one at a time. This is particularly useful when:

- Importing multiple templates from a file
- Creating multiple routines from a template library
- Bulk-creating tasks for a project or sprint
- Initializing the app with predefined templates

## Performance Benefits

**Single Item Operations:**

- Each operation opens and closes the database connection
- Each task requires a separate localStorage write
- N operations = N database transactions

**Batch Operations:**

- One database connection for all operations
- Single transaction for all items
- Single localStorage write for all tasks
- N operations = 1 database transaction

## API Reference

### IndexedDB Batch Operations

#### `putBatch(storeName, items)`

Insert or update multiple items in IndexedDB efficiently.

```javascript
import { putBatch, STORES } from './utils/indexedDBManager'

const items = [
  { id: 1, title: 'Task 1', done: false },
  { id: 2, title: 'Task 2', done: false },
  { id: 3, title: 'Task 3', done: false }
]

const results = await putBatch(STORES.TASKS, items)
// Returns: [1, 2, 3] - array of generated IDs
```

**Parameters:**

- `storeName` (string): Name of the IndexedDB object store
- `items` (Array): Array of items to insert/update

**Returns:** `Promise<Array>` - Array of generated IDs/keys

**Throws:**

- Error with message `'Items must be an array'` if `items` is not an array
- Error with message `'Transaction failed: <reason>'` if the transaction fails

---

### Routine Batch Operations

#### `createRoutineBatch(routines)`

Create multiple routines in a single batch operation.

```javascript
import { createRoutineBatch } from './utils/routinesManager'

const routines = [
  {
    name: 'Morning Routine',
    steps: [
      { name: 'Wake up', duration: 60 },
      { name: 'Exercise', duration: 1800 }
    ]
  },
  {
    name: 'Evening Routine',
    steps: [
      { name: 'Review day', duration: 300 },
      { name: 'Plan tomorrow', duration: 600 }
    ]
  }
]

const routineIds = await createRoutineBatch(routines)
// Returns: ['routine_1234567890_0', 'routine_1234567890_1']
```

**Parameters:**

- `routines` (Array): Array of routine objects with `name` and optional `steps`

**Returns:** `Promise<Array<string>>` - Array of created routine IDs

**Features:**

- Automatically generates unique IDs
- Calculates total duration for each routine
- Adds timestamps and creation dates
- Uses single transaction for all routines

---

### Template Batch Instantiation

#### `instantiateTemplatesBatch(templates)`

Instantiate multiple task or routine templates efficiently.

```javascript
import { instantiateTemplatesBatch } from './utils/templateInstantiation'

const templates = [
  {
    type: 'task',
    title: 'Review PR #123',
    quadrant: 'urgent_important'
  },
  {
    type: 'task',
    title: 'Update documentation',
    quadrant: 'not_urgent_important'
  },
  {
    type: 'routine',
    title: 'Weekly Review',
    steps: [
      { label: 'Review goals', duration: 300 },
      { label: 'Plan week', duration: 600 }
    ]
  }
]

const results = await instantiateTemplatesBatch(templates)
// Returns:
// [
//   { type: 'task', id: 'uuid-1', quadrant: 'urgent_important', task: {...} },
//   { type: 'task', id: 'uuid-2', quadrant: 'not_urgent_important', task: {...} },
//   { type: 'routine', id: 'routine_1234567890_0' }
// ]
```

**Parameters:**

- `templates` (Array): Array of template objects (task or routine)

**Returns:** `Promise<Array<Object>>` - Array of created entity details

**Template Structure:**

Task Template:

```javascript
{
  type: 'task',
  title: string,              // Required
  quadrant: string,           // Optional, defaults to 'urgent_important'
  dueOffset: number          // Optional, milliseconds from now
}
```

Routine Template:

```javascript
{
  type: 'routine',
  title: string,              // Required
  steps: Array,               // Optional
  tags: Array<string>,        // Optional
  energyTag: string,          // Optional
  estimatedDuration: number   // Optional
}
```

**Features:**

- Validates all templates before processing
- Separates tasks and routines for optimal batching
- Single localStorage write for all tasks
- Single IndexedDB transaction for all routines
- Comprehensive error handling
- Returns detailed results for each created entity

---

## Usage Examples

### Example 1: Import Multiple Templates

```javascript
import { instantiateTemplatesBatch } from './utils/templateInstantiation'

async function importTemplates(templateData) {
  try {
    const results = await instantiateTemplatesBatch(templateData)

    const taskCount = results.filter((r) => r.type === 'task').length
    const routineCount = results.filter((r) => r.type === 'routine').length

    console.log(`Created ${taskCount} tasks and ${routineCount} routines`)

    return results
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  }
}
```

### Example 2: Bulk Create Routines

```javascript
import { createRoutineBatch } from './utils/routinesManager'

async function createProjectRoutines(projectName) {
  const routines = [
    {
      name: `${projectName} - Daily Standup`,
      steps: [
        { name: 'Yesterday update', duration: 300 },
        { name: 'Today plan', duration: 300 },
        { name: 'Blockers', duration: 300 }
      ]
    },
    {
      name: `${projectName} - Sprint Planning`,
      steps: [
        { name: 'Review backlog', duration: 1800 },
        { name: 'Estimate stories', duration: 1800 },
        { name: 'Commit to sprint', duration: 600 }
      ]
    },
    {
      name: `${projectName} - Retrospective`,
      steps: [
        { name: 'What went well', duration: 900 },
        { name: 'What to improve', duration: 900 },
        { name: 'Action items', duration: 600 }
      ]
    }
  ]

  const ids = await createRoutineBatch(routines)
  console.log(`Created ${ids.length} routines for ${projectName}`)

  return ids
}
```

### Example 3: Create Weekly Task Set

```javascript
import { instantiateTemplatesBatch } from './utils/templateInstantiation'

async function createWeeklyTasks() {
  const templates = [
    {
      type: 'task',
      title: 'Review team pull requests',
      quadrant: 'urgent_important'
    },
    {
      type: 'task',
      title: 'Update project documentation',
      quadrant: 'not_urgent_important'
    },
    {
      type: 'task',
      title: 'Plan next sprint',
      quadrant: 'not_urgent_important'
    },
    {
      type: 'task',
      title: 'Check dependency updates',
      quadrant: 'not_urgent_not_important'
    }
  ]

  const results = await instantiateTemplatesBatch(templates)
  console.log(`Created ${results.length} weekly tasks`)

  return results
}
```

## Error Handling

All batch operations include comprehensive error handling:

```javascript
try {
  const results = await instantiateTemplatesBatch(templates)
  // Handle success
} catch (error) {
  if (error.message.includes('Invalid template data')) {
    // Handle validation error
    console.error('Template validation failed:', error)
  } else if (error.message.includes('Storage quota exceeded')) {
    // Handle storage quota error
    console.error('Not enough storage space')
  } else {
    // Handle other errors
    console.error('Batch operation failed:', error)
  }
}
```

## Best Practices

1. **Validate Before Batching**: Always validate your data before calling batch operations
2. **Use Batch for >3 Items**: Batch operations are most beneficial with 3+ items
3. **Handle Partial Failures**: Plan for error scenarios where some items succeed
4. **Monitor Performance**: Track batch operation times in production
5. **Limit Batch Size**: Keep batches under 100 items for optimal performance
6. **Use Transactions**: Batch operations use transactions - don't mix with single operations in same context

## Migration Guide

If you're currently using single-item operations, here's how to migrate:

**Before:**

```javascript
for (const template of templates) {
  await instantiateTemplate(template)
}
```

**After:**

```javascript
const results = await instantiateTemplatesBatch(templates)
```

## Testing

Comprehensive tests are available in:

- `src/__tests__/indexedDBManager.test.js` - Tests for `putBatch()`
- `src/__tests__/routinesManager.test.js` - Tests for `createRoutineBatch()`
- `src/__tests__/templateInstantiation.test.js` - Tests for `instantiateTemplatesBatch()`

## Performance Metrics

Based on testing with fake-indexeddb:

| Operation           | Single (10 items) | Batch (10 items) | Improvement   |
| ------------------- | ----------------- | ---------------- | ------------- |
| Database opens      | 10                | 1                | 90% reduction |
| Transactions        | 10                | 1                | 90% reduction |
| localStorage writes | 10                | 1                | 90% reduction |

Real-world performance improvements will vary based on device and browser.

## Related Documentation

- [Data Management Architecture](./DATA_MANAGEMENT.md)
- [Template Import/Export Guide](./TEMPLATE_IMPORT_EXPORT.md)
- [Contributing Templates](./CONTRIBUTING_TEMPLATES.md)
