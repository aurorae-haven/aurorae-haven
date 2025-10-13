# Contributing Templates Guide

This guide explains how to add new task and routine templates to the Aurorae Haven library.

## Overview

Templates are predefined task and routine patterns that help users get started quickly. They are stored as JSON files and automatically loaded into the Library tab when users first access the application.

## Quick Start

To add a new template:

1. **Choose template type**: Task or Routine
2. **Create a new JSON file**: Add `task-{name}.json` or `routine-{name}.json` to `src/data/templates/`
3. **Register the template**: Add import and array entry in `src/utils/predefinedTemplates.js`
4. **Follow the schema**: Use the structure defined below
5. **Test locally**: Run the app and verify your template appears
6. **Submit PR**: Follow the standard contribution process

## File Structure

Each template is stored as a **separate JSON file** in the templates directory:

```text
src/
└── data/
    └── templates/
        ├── README.md                    # Quick reference guide
        ├── task-morning-review.json     # Individual task template
        ├── task-exercise.json           # Individual task template
        ├── routine-morning-launch.json  # Individual routine template
        ├── routine-focus-session.json   # Individual routine template
        └── ...                          # One file per template
```

**Key Points:**

- Each template is a separate file
- Naming convention: `{type}-{name}.json`
- The filename should match the template's `id` field
- Adding a new template = creating a new file

## Template Schemas

### Task Template Schema

```json
{
  "id": "unique-template-id",
  "type": "task",
  "title": "Template Title",
  "tags": ["tag1", "tag2"],
  "category": "Category Name",
  "quadrant": "urgent_important",
  "version": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastUsed": null,
  "pinned": false
}
```

#### Required Fields

- **id** (string): Unique identifier. Use format: `task-descriptive-name`
- **type** (string): Must be `"task"`
- **title** (string): Clear, descriptive title (max 100 characters)
- **tags** (array): Array of lowercase tag strings
- **quadrant** (string): One of:
  - `"urgent_important"` - Do First (crisis, deadlines)
  - `"not_urgent_important"` - Schedule (planning, prevention)
  - `"urgent_not_important"` - Delegate (interruptions, meetings)
  - `"not_urgent_not_important"` - Eliminate (time wasters)

#### Optional Fields

- **category** (string): Task category (e.g., "Work", "Health", "Personal")
- **version** (number): Template version, default: 1
- **createdAt** (string): ISO 8601 timestamp
- **lastUsed** (string|null): ISO 8601 timestamp or null
- **pinned** (boolean): Whether to highlight in library, default: false

### Routine Template Schema

```json
{
  "id": "unique-routine-id",
  "type": "routine",
  "title": "Routine Title",
  "tags": ["tag1", "tag2"],
  "steps": [
    {
      "label": "Step name",
      "duration": 300,
      "description": "What to do in this step"
    }
  ],
  "energyTag": "medium",
  "estimatedDuration": 300,
  "version": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastUsed": null,
  "pinned": false
}
```

#### Required Fields

- **id** (string): Unique identifier. Use format: `routine-descriptive-name`
- **type** (string): Must be `"routine"`
- **title** (string): Clear, descriptive title (max 100 characters)
- **tags** (array): Array of lowercase tag strings
- **steps** (array): Array of step objects (see below)
- **estimatedDuration** (number): Total duration in seconds (sum of all steps)

#### Optional Fields

- **energyTag** (string): Energy level: `"low"`, `"medium"`, or `"high"`
- **version** (number): Template version, default: 1
- **createdAt** (string): ISO 8601 timestamp
- **lastUsed** (string|null): ISO 8601 timestamp or null
- **pinned** (boolean): Whether to highlight in library, default: false

#### Step Object Schema

```json
{
  "label": "Step name",
  "duration": 300,
  "description": "Detailed description of what to do"
}
```

**Required:**

- **label** (string): Short step name (max 50 characters)
- **duration** (number): Duration in seconds

**Optional:**

- **description** (string): Detailed instructions or notes

## Examples

### Example Task Template

```json
{
  "id": "task-morning-standup",
  "type": "task",
  "title": "Team Morning Standup",
  "tags": ["work", "meeting", "daily"],
  "category": "Work",
  "quadrant": "urgent_important",
  "version": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastUsed": null,
  "pinned": true
}
```

### Example Routine Template

```json
{
  "id": "routine-pomodoro-work",
  "type": "routine",
  "title": "Pomodoro Work Session",
  "tags": ["productivity", "focus", "work"],
  "steps": [
    {
      "label": "Clear workspace",
      "duration": 120,
      "description": "Remove distractions and prepare materials"
    },
    {
      "label": "Focus work",
      "duration": 1500,
      "description": "Work on single task without interruptions"
    },
    {
      "label": "Short break",
      "duration": 300,
      "description": "Step away, stretch, or walk"
    }
  ],
  "energyTag": "high",
  "estimatedDuration": 1920,
  "version": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastUsed": null,
  "pinned": true
}
```

## Naming Conventions

### Template IDs

- **Format**: `{type}-{descriptive-name}`
- **Examples**:
  - `task-code-review`
  - `routine-morning-routine`
  - `task-weekly-planning`
- **Rules**:
  - Lowercase only
  - Use hyphens for spaces
  - Keep concise but descriptive
  - Must be unique across all templates

### Titles

- Clear and action-oriented
- Start with a verb for tasks (e.g., "Review", "Complete", "Plan")
- Descriptive for routines (e.g., "Morning Launch Routine")
- Maximum 100 characters
- Use title case

### Tags

- Lowercase only
- Single words or hyphenated phrases
- Descriptive and searchable
- Common tags:
  - **Time**: `morning`, `evening`, `daily`, `weekly`
  - **Category**: `work`, `health`, `personal`, `home`
  - **Activity**: `exercise`, `reading`, `planning`, `review`
  - **Energy**: `focus`, `relaxation`, `energy`

## Best Practices

### General Guidelines

1. **User-Centric**: Design templates for real user needs
2. **Accessibility**: Use clear, simple language
3. **Neurodivergent-Friendly**: Keep instructions calm and structured
4. **Inclusive**: Avoid assumptions about users' situations
5. **Tested**: Try the template yourself before submitting

### Task Templates

- Choose appropriate quadrants based on Eisenhower Matrix principles
- Use specific, actionable titles
- Include relevant tags for discoverability
- Set `pinned: true` only for most commonly used templates

### Routine Templates

- Break down into clear, manageable steps
- Use realistic durations (in seconds)
- Ensure `estimatedDuration` matches sum of step durations
- Include helpful descriptions for each step
- Consider energy levels: low-energy routines for evening, high for morning

### Tags Selection

- Include 2-5 tags per template
- Mix time-based and category tags
- Think about search terms users might use
- Check existing templates for consistency

## Validation

All templates are validated when loaded. Common validation errors:

### Type Errors

```text
❌ Template type must be one of: task, routine
❌ Template type is required
```

**Fix**: Ensure `type` field is present and set to `"task"` or `"routine"`

### Title Errors

```text
❌ Template title is required
❌ Template title cannot be empty
❌ Template title must be a string
```

**Fix**: Provide a non-empty string for `title`

### Tags Errors

```text
❌ Template tags must be an array
```

**Fix**: Ensure `tags` is an array: `["tag1", "tag2"]`

### Step Errors (Routines)

```text
❌ Template steps must be an array
❌ Template step 0 must have a label (string) property
❌ Template step 0 duration must be a number
```

**Fix**: Ensure `steps` is an array with valid step objects

### Duration Errors (Routines)

```text
❌ Template estimatedDuration must be a number
❌ Template estimatedDuration must be non-negative
```

**Fix**: Ensure `estimatedDuration` is a positive number in seconds

## Testing Your Templates

### Local Testing

1. **Add your template** to the appropriate JSON file
2. **Clear IndexedDB** (DevTools → Application → IndexedDB → Delete)
3. **Reload the app**
4. **Navigate to Library tab**
5. **Verify your template appears**
6. **Test "Use" functionality**

### Validation Testing

```bash
# Run linter
npm run lint

# Run tests
npm test

# Check format
npm run format:check
```

### Manual Checks

- [ ] Template appears in Library tab
- [ ] Title is clear and descriptive
- [ ] Tags are relevant and searchable
- [ ] All fields are properly formatted
- [ ] "Use" button creates appropriate entity
- [ ] No console errors

## Submission Process

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/add-template-name`
3. **Create your template file** in `src/data/templates/` (e.g., `task-my-template.json`)
4. **Register in `src/utils/predefinedTemplates.js`**:
   - Add import statement for your template
   - Add template to the `allTemplates` array
5. **Test thoroughly** following checklist above
6. **Run linters**: `npm run lint && npm run format`
7. **Commit changes**: `git commit -m "✨ Add [template name] template"`
8. **Push to fork**: `git push origin feature/add-template-name`
9. **Create Pull Request** with:
   - Clear description of template purpose
   - User story or use case
   - Testing confirmation
   - Screenshots if applicable

## Review Criteria

Pull requests adding templates will be reviewed for:

- [ ] Schema compliance
- [ ] Validation passes
- [ ] Clear, user-friendly language
- [ ] Appropriate categorization
- [ ] No duplicate IDs
- [ ] Realistic durations (for routines)
- [ ] Helpful descriptions
- [ ] Consistent with existing templates
- [ ] Tests pass
- [ ] Linting passes

## Common Mistakes

### Duplicate IDs

```json
// ❌ Bad: ID already exists
{
  "id": "task-exercise",
  "type": "task"
}

// ✅ Good: Unique ID
{
  "id": "task-evening-walk",
  "type": "task"
}
```

### Wrong Duration Format

```json
// ❌ Bad: Duration as string or minutes
{
  "duration": "5 minutes"
}

// ✅ Good: Duration in seconds (5 minutes = 300 seconds)
{
  "duration": 300
}
```

### Mismatched Duration Sum

```json
// ❌ Bad: Sum doesn't match estimatedDuration
{
  "steps": [
    {"label": "Step 1", "duration": 100},
    {"label": "Step 2", "duration": 200}
  ],
  "estimatedDuration": 500
}

// ✅ Good: Sum matches
{
  "steps": [
    {"label": "Step 1", "duration": 100},
    {"label": "Step 2", "duration": 200}
  ],
  "estimatedDuration": 300
}
```

### Tags as Strings

```json
// ❌ Bad: Tags as comma-separated string
{
  "tags": "work, productivity, focus"
}

// ✅ Good: Tags as array
{
  "tags": ["work", "productivity", "focus"]
}
```

## Resources

- [Template Import/Export Guide](./TEMPLATE_IMPORT_EXPORT.md)
- [Complete Specifications](./COMPLETE_SPECIFICATIONS.md)
- [Main Contributing Guide](../CONTRIBUTING.md)
- [Template Manager Source](../src/utils/templatesManager.js)
- [Validation Source](../src/utils/validation.js)

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Issues**: Create a GitHub Issue with `templates` label
- **Examples**: Check existing templates in `src/data/templates/`
- **Schema Questions**: Review `src/utils/validation.js`

## Future Enhancements

Planned improvements for template system:

- [ ] Template categories and collections
- [ ] Community template marketplace
- [ ] Template versioning and updates
- [ ] Multi-language support
- [ ] Template analytics
- [ ] Advanced filtering options

## License

By contributing templates, you agree they will be licensed under the project's MIT License.

---

**Last Updated**: January 2025  
**Template Version**: 1.0
