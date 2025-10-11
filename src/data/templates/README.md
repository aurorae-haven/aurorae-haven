# Predefined Templates

This directory contains predefined task and routine templates that are automatically loaded when users first access the Library tab.

## Files

- **tasks.json** - Predefined task templates for the Eisenhower Matrix
- **routines.json** - Predefined routine templates with steps and durations

## Current Templates

### Tasks (7 templates)

1. **Morning Email Review** - Start the day checking important messages
2. **30-Minute Exercise Session** - Daily fitness routine
3. **Weekly Meal Preparation** - Plan and prep healthy meals
4. **Review Team Pull Requests** - Collaborate on code reviews
5. **Daily Reflection Journal** - Evening mindfulness practice
6. **Read for 20 Minutes** - Personal growth and learning
7. **Water Indoor Plants** - Home maintenance task

### Routines (6 templates)

1. **Morning Launch Routine** - 14-minute energizing start (stretch, hydrate, plan)
2. **Deep Focus Work Session** - 36-minute productivity block
3. **Evening Wind-Down Routine** - 25-minute relaxation sequence
4. **5-Minute Reset Break** - Quick energy refresh
5. **Creative Warm-Up Routine** - 20-minute inspiration boost
6. **Weekly Planning & Review** - 35-minute planning session

## Adding New Templates

See the **[Contributing Templates Guide](../../../docs/CONTRIBUTING_TEMPLATES.md)** for detailed instructions.

### Quick Start

1. **Choose file**: Edit `tasks.json` or `routines.json`
2. **Follow schema**: Use existing templates as examples
3. **Use unique IDs**: Format: `task-name` or `routine-name`
4. **Test locally**: Clear IndexedDB and reload
5. **Submit PR**: Include description and testing confirmation

### Schema Requirements

**Task Template:**

```json
{
  "id": "task-unique-name",
  "type": "task",
  "title": "Clear Title",
  "tags": ["tag1", "tag2"],
  "category": "Category",
  "quadrant": "urgent_important",
  "version": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastUsed": null,
  "pinned": false
}
```

**Routine Template:**

```json
{
  "id": "routine-unique-name",
  "type": "routine",
  "title": "Clear Title",
  "tags": ["tag1", "tag2"],
  "steps": [
    {
      "label": "Step name",
      "duration": 300,
      "description": "What to do"
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

## Validation

Templates are validated when loaded. Common checks:

- Required fields present
- Correct data types
- Valid quadrant/energy tags
- Positive durations
- Non-empty arrays
- Unique IDs

See `src/utils/validation.js` for full validation rules.

## Testing

After adding templates:

```bash
# Clear browser IndexedDB
# DevTools → Application → IndexedDB → Delete aurorae_haven

# Reload app and check Library tab

# Run tests
npm test

# Run linters
npm run lint
npm run format
```

## Resources

- [Contributing Templates Guide](../../../docs/CONTRIBUTING_TEMPLATES.md) - Complete documentation
- [Template Import/Export Guide](../../../docs/TEMPLATE_IMPORT_EXPORT.md) - Schema details
- [Main Contributing Guide](../../../CONTRIBUTING.md) - General guidelines

---

**Need Help?**

- Check existing templates for examples
- Read the Contributing Templates Guide
- Open a GitHub Discussion for questions
