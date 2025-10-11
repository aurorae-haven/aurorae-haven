# Template Import/Export Guide

This guide explains how to import and export task and routine templates in Aurorae Haven, including validation requirements and best practices.

## Overview

Templates allow you to create reusable task and routine patterns that can be:

- **Exported** to share with others or backup
- **Imported** from files or others' exports
- **Validated** to ensure data integrity and compatibility

## Version Compatibility

### Current Version

The current template export version is **1.0**.

### Supported Versions

Aurorae Haven supports importing templates from the following versions:

- **1.0** - Current version (fully supported)

### Version Validation

When importing templates, the import process:

1. Checks if the `version` field exists
2. Validates that the version is compatible
3. Rejects incompatible versions with a descriptive error message

**Example error for incompatible version:**

```text
Incompatible version: 2.0. Supported versions: 1.0
```

## Export Templates

### Export All Templates

```javascript
import { exportTemplates } from './utils/templatesManager'

// Export all templates
const data = await exportTemplates()
```

### Export Specific Templates

```javascript
// Export specific templates by ID
const data = await exportTemplates(['template-id-1', 'template-id-2'])
```

### Export Data Structure

```json
{
  "version": "1.0",
  "exportDate": "2025-01-15T10:00:00.000Z",
  "templates": [
    {
      "id": "template-uuid-123",
      "type": "task",
      "title": "Review Pull Request",
      "tags": ["work", "development"],
      "category": "Development",
      "quadrant": "urgent_important",
      "version": 1,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastUsed": null,
      "pinned": false
    },
    {
      "id": "template-uuid-456",
      "type": "routine",
      "title": "Morning Routine",
      "tags": ["health", "daily"],
      "steps": [
        { "label": "Wake up", "duration": 60 },
        { "label": "Shower", "duration": 300 },
        { "label": "Breakfast", "duration": 900 }
      ],
      "energyTag": "high",
      "estimatedDuration": 1260,
      "version": 1,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastUsed": "2025-01-15T06:00:00.000Z",
      "pinned": true
    }
  ]
}
```

## Import Templates

### Import Process

```javascript
import { importTemplates } from './utils/templatesManager'

// Import templates from data
const result = await importTemplates(data)

console.log(result)
// {
//   imported: 5,
//   skipped: 1,
//   errors: [
//     { template: 'Invalid Template', error: 'Template type is required' }
//   ]
// }
```

### Validation Steps

The import process validates data in the following order:

#### 1. Data Structure Validation

- **Data must be an object** - Rejects `null`, `undefined`, strings, arrays
- **Version field is required** - Must have a `version` field
- **Templates field is required** - Must have a `templates` array

**Errors:**

```text
Invalid import data: data must be an object
Invalid import data: missing version field
Invalid import data: missing templates array
```

#### 2. Version Compatibility Check

- **Version must be supported** - Currently only `1.0` is supported
- **Descriptive error messages** - Shows which versions are supported

**Error:**

```text
Incompatible version: 2.0. Supported versions: 1.0
```

#### 3. Individual Template Validation

Each template is validated before import:

**Required Fields:**

- `type` - Must be either `"task"` or `"routine"`
- `title` - Must be a non-empty string

**Optional Fields (validated if present):**

- `tags` - Must be an array of strings
- `steps` (routine only) - Must be an array of step objects
- `estimatedDuration` (routine only) - Must be a non-negative number
- `quadrant` - Task quadrant assignment
- `category` - Task category
- `energyTag` - Routine energy level

**Validation Errors:**

```text
Template type is required
Template type must be one of: task, routine
Template title is required
Template title cannot be empty
Template title must be a string (found: number)
Template tags must be an array (found: string)
Template steps must be an array (found: string)
Template step 0 must have a label (string) property
Template step 0 duration must be a number (found: string)
Template estimatedDuration must be a number (found: string)
Template estimatedDuration must be non-negative
```

#### 4. ID Collision Handling

- **Automatic ID generation** - If a template ID already exists, a new UUID is generated
- **Data preservation** - All other template data is preserved
- **No user intervention required** - Happens automatically

### Import Results

The import function returns detailed results:

```javascript
{
  imported: 5,    // Number of successfully imported templates
  skipped: 1,     // Number of templates that failed validation
  errors: [       // Array of error details
    {
      template: "Invalid Template",  // Template title or "Unknown"
      error: "Template type is required"
    }
  ]
}
```

### Error Handling

#### Fatal Errors (Import Fails)

These errors cause the entire import to fail:

- Missing or invalid data structure
- Missing version field
- Incompatible version
- Missing or invalid templates array

**Example:**

```javascript
try {
  const result = await importTemplates(data)
} catch (error) {
  console.error('Import failed:', error.message)
  // "Invalid import data: missing version field"
}
```

#### Non-Fatal Errors (Partial Import)

These errors skip individual templates but continue importing:

- Invalid template structure
- Missing required fields
- Invalid field types
- Database save errors

**Example:**

```javascript
const result = await importTemplates(data)

if (result.skipped > 0) {
  console.log(`Skipped ${result.skipped} templates:`)
  result.errors.forEach((err) => {
    console.log(`- ${err.template}: ${err.error}`)
  })
}

console.log(`Successfully imported ${result.imported} templates`)
```

## Best Practices

### For Users

1. **Export regularly** - Create backups of your templates
2. **Verify imports** - Check import results for skipped templates
3. **Test first** - Import on a test browser before production
4. **Keep organized** - Use descriptive template names
5. **Use version control** - Track template changes over time

### For Developers

1. **Validate before import** - Call `importTemplates()` which validates automatically
2. **Handle errors gracefully** - Check `result.errors` for validation issues
3. **Show user feedback** - Display import results to users
4. **Test with invalid data** - Ensure robust error handling
5. **Document schema changes** - Update version number for breaking changes

## Examples

### Valid Template Import

```json
{
  "version": "1.0",
  "templates": [
    {
      "type": "task",
      "title": "Code Review",
      "tags": ["work"]
    }
  ]
}
```

Result: ✅ Imports successfully

### Invalid Template - Missing Type

```json
{
  "version": "1.0",
  "templates": [
    {
      "title": "Code Review"
    }
  ]
}
```

Result: ❌ Skipped - "Template type is required"

### Invalid Template - Invalid Type

```json
{
  "version": "1.0",
  "templates": [
    {
      "type": "invalid-type",
      "title": "Code Review"
    }
  ]
}
```

Result: ❌ Skipped - "Template type must be one of: task, routine"

### Invalid Template - Empty Title

```json
{
  "version": "1.0",
  "templates": [
    {
      "type": "task",
      "title": ""
    }
  ]
}
```

Result: ❌ Skipped - "Template title cannot be empty"

### Invalid Template - Bad Steps

```json
{
  "version": "1.0",
  "templates": [
    {
      "type": "routine",
      "title": "Morning Routine",
      "steps": "not an array"
    }
  ]
}
```

Result: ❌ Skipped - "Template steps must be an array (found: string)"

### Incompatible Version

```json
{
  "version": "2.0",
  "templates": []
}
```

Result: ❌ Import fails - "Incompatible version: 2.0. Supported versions: 1.0"

### Missing Version

```json
{
  "templates": []
}
```

Result: ❌ Import fails - "Invalid import data: missing version field"

## Troubleshooting

### Import Fails Immediately

**Symptoms:**

- Error message appears immediately
- No templates are imported

**Possible Causes:**

1. Missing version field
2. Incompatible version
3. Invalid data structure
4. Missing templates array

**Solutions:**

- Check that `version` field exists and is `"1.0"`
- Ensure data is a proper JSON object
- Verify `templates` is an array

### Some Templates Are Skipped

**Symptoms:**

- `result.skipped > 0`
- Some templates import, others don't

**Possible Causes:**

1. Invalid template structure
2. Missing required fields (type, title)
3. Invalid field types (e.g., tags is a string, not array)
4. Invalid step structure for routines

**Solutions:**

- Check `result.errors` for specific validation messages
- Review template structure against examples above
- Ensure all required fields are present and valid

### ID Collisions Not Handled

**Symptoms:**

- Import succeeds but creates duplicate templates

**Note:** This should not happen - the import process automatically generates new IDs for collisions. If you see this, please report it as a bug.

## API Reference

### `exportTemplates(templateIds?: string[])`

Export templates to a JSON-compatible object.

**Parameters:**

- `templateIds` (optional) - Array of template IDs to export. If empty or omitted, exports all templates.

**Returns:**

```typescript
Promise<{
  version: string
  exportDate: string
  templates: Template[]
}>
```

**Example:**

```javascript
// Export all
const allData = await exportTemplates()

// Export specific
const someData = await exportTemplates(['id-1', 'id-2'])
```

### `importTemplates(data: object)`

Import templates from a JSON object with validation.

**Parameters:**

- `data` - Import data object with version and templates array

**Returns:**

```typescript
Promise<{
  imported: number
  skipped: number
  errors: Array<{
    template: string
    error: string
  }>
}>
```

**Throws:**

- `Error` if data structure is invalid
- `Error` if version is missing or incompatible
- `Error` if templates array is missing or invalid

**Example:**

```javascript
try {
  const result = await importTemplates(importData)
  console.log(`Imported: ${result.imported}, Skipped: ${result.skipped}`)

  if (result.errors.length > 0) {
    console.error('Validation errors:', result.errors)
  }
} catch (error) {
  console.error('Import failed:', error.message)
}
```

## Future Enhancements

### Planned for v2.0

- [ ] Support for template categories and collections
- [ ] Partial template updates (merge instead of replace)
- [ ] Template dependencies and linking
- [ ] Template version history
- [ ] Schema migration for older versions
- [ ] Bulk template operations

### Under Consideration

- Template marketplace/sharing
- Template analytics and usage tracking
- Template recommendations
- Advanced template search and filtering
- Template preview before import

## Support

For issues or questions about template import/export:

- Check this guide for common solutions
- Review test files in `src/__tests__/templatesManager.test.js` for examples
- Open an issue on GitHub with the `templates` label
- Include error messages and sample data (redacted if sensitive)

## References

- [Data Management Architecture](./DATA_MANAGEMENT.md)
- [Template Manager API](../src/utils/templatesManager.js)
- [Validation Logic](../src/utils/validation.js)
- [Test Suite](../src/__tests__/templatesManager.test.js)

---

**Last Updated:** January 2025  
**Current Version:** 1.0
