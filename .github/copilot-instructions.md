# Copilot Instructions for My Stellar Trail

## Project Overview

My Stellar Trail is a calm, astro-themed productivity app designed for neurodivergent users. It helps manage routines, tasks, habits, notes, and stats with a focus on accessibility, security, and a peaceful user experience.

**Tech Stack:**
- Static HTML/CSS/JavaScript (no build step required for development)
- Modular ES6 JavaScript
- LocalStorage for data persistence
- GitHub Pages for deployment
- Progressive Web App capabilities (planned)

## Architecture

### File Structure
```
/
├── index.html              # Main entry point
├── public/
│   ├── index.html         # Public landing page
│   └── pages/             # Feature pages (schedule, sequences, braindump, home)
├── src/
│   ├── main.js            # Core application logic
│   ├── braindump.js       # Brain dump module
│   ├── schedule.js        # Schedule module
│   └── assets/
│       └── styles/        # CSS files
└── .github/
    └── workflows/         # CI/CD workflows
```

### Key Modules
- **Schedule**: Daily schedule and time blocking
- **Sequences**: Routine management with step-by-step timers
- **Brain Dump**: Quick note capture with tags
- **Tasks**: Eisenhower matrix prioritization (planned)
- **Habits**: Streak tracking (planned)

## Coding Standards

### Security Requirements (CRITICAL)

**Content Security Policy (CSP):**
- **NEVER** use inline scripts or inline styles
- All JavaScript must be in external `.js` files
- All CSS must be in external `.css` files or use `style-src 'unsafe-inline'` (already configured)
- External resources must use SRI or be self-hosted
- Current CSP: `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self' https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests`

**Always:**
- Use external script files with `<script src="..."></script>` or `<script type="module" src="..."></script>`
- Use external CSS files with `<link rel="stylesheet" href="...">`
- Avoid `eval()`, `Function()`, or similar dynamic code execution
- Validate and sanitize user input before storing in LocalStorage

### JavaScript Guidelines

**Module System:**
- Use ES6 modules (`import`/`export`)
- Keep modules focused and single-purpose
- Use `type="module"` for script tags

**Code Style:**
- Use `const` by default, `let` when reassignment is needed, avoid `var`
- Use arrow functions for callbacks and short functions
- Use template literals for string interpolation
- Prefer functional patterns over imperative when appropriate
- Use meaningful variable and function names

**Data Management:**
- Store data in LocalStorage as JSON
- Implement export/import for all user data
- Version data structures for migration compatibility
- Always provide beforeunload warnings when there's unsaved data

**Example Data Template Structure:**
```javascript
{
  version: 1,
  tasks: [{id: 1, title: "...", done: false}],
  sequences: [{id: "seq_1", name: "...", steps: [...]}],
  habits: [{id: "hab_1", name: "...", streak: 0, paused: false}],
  dumps: [{id: "dump_1", ts: Date.now(), text: "..."}],
  schedule: [{day: "2025-01-15", blocks: [...]}]
}
```

### HTML Guidelines

**Structure:**
- Use semantic HTML5 elements
- Include proper `lang` attribute on `<html>`
- Always include viewport meta tag: `<meta name="viewport" content="width=device-width,initial-scale=1">`
- Include CSP meta tag on all pages

**Accessibility:**
- Use proper ARIA roles and labels
- Ensure keyboard navigation works for all interactive elements
- Maintain color contrast ratios (WCAG AA minimum)
- Add descriptive alt text for images
- Use `aria-label` for icon-only buttons

**Internal Navigation:**
- Mark internal navigation links with `data-nav="internal"` attribute
- This prevents beforeunload prompts when navigating within the app

### CSS Guidelines

**Design Tokens:**
- Use CSS custom properties for colors, spacing, and typography
- Follow the existing "Glass-UI" aesthetic with astro theme
- Maintain calm, low-contrast visuals suitable for neurodivergent users
- Ensure responsive design works on desktop, tablet, and mobile

**Best Practices:**
- Mobile-first responsive design
- Use flexbox and grid for layouts
- Avoid fixed pixel values; prefer relative units (rem, em, %)
- Keep specificity low; avoid `!important`

## Development Workflow

### Testing
- Manually test in modern browsers (Chrome, Firefox, Edge, Safari)
- Test keyboard navigation and screen reader compatibility
- Verify CSP compliance (check browser console for violations)
- Test data export/import round-trip

### Before Committing
1. Test all interactive features manually
2. Verify no console errors or CSP violations
3. Check that beforeunload warning works correctly
4. Ensure internal navigation doesn't trigger warnings
5. Validate HTML/CSS/JS if linters are available

### Deployment
- Changes to `main` or `feature-*` branches trigger GitHub Pages deployment
- The workflow copies `index.html`, `public/`, and `src/` to `dist/`
- Test in production after deployment

## Feature Development

### Adding New Features
1. Create HTML page in `public/pages/` if needed
2. Create corresponding JS module in `src/`
3. Include CSP meta tag in HTML
4. Implement export/import for new data structures
5. Add internal navigation links with `data-nav="internal"`
6. Update data version number if schema changes
7. Test data persistence and recovery

### Data Export/Import Pattern
```javascript
// Always provide export functionality
function exportJSON() {
  const data = JSON.stringify(dataTemplate(), null, 2);
  const blob = new Blob([data], {type: "application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "stellar_journey_data.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  exported = true;
}

// Always provide import functionality
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      // Validate and merge data
      localStorage.setItem('stellar_data', JSON.stringify(imported));
      location.reload();
    } catch (err) {
      toast("Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
}
```

## Roadmap Context

**Current Phase:** Beta → v1.0 (Core MVP)

**Completed:**
- Minimal routine runner (sequences with timers)
- Notes/brain dump with tags
- JSON export/import
- LocalStorage persistence
- Responsive layout
- Strict CSP implementation

**In Progress (v1.0):**
- Tasks module (Eisenhower matrix)
- Habits tracking
- Stats foundation
- Documentation improvements
- Design polish

**Future (v2.0+):**
- Advanced analytics dashboards
- Gamification (XP, levels, achievements)
- Notifications and reminders
- Android APK packaging

## Special Considerations

### For Neurodivergent Users
- Minimize cognitive load: clear, simple interfaces
- Provide calm, non-distracting visuals
- Use consistent patterns and predictable behavior
- Avoid sudden animations or flashing content
- Allow flexible workflows (routines can be paused, reordered)

### Performance
- Keep JavaScript bundle small (currently no bundler)
- Minimize DOM manipulation
- Use event delegation for dynamic content
- Lazy load features when possible

### Privacy & Security
- All data stays local (LocalStorage)
- No external API calls for core functionality
- User data export in standard JSON format
- No tracking or analytics scripts

## Common Patterns

### Toast Notifications
```javascript
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
```

### Suppress Navigation Warnings
```javascript
let suppressPrompt = false;
function markInternalNav() {
  suppressPrompt = true;
  setTimeout(() => { suppressPrompt = false; }, 2000);
}
```

### Module Registration
```javascript
window.StellarIO = {exportJSON, importJSON};
```

## Questions & Support

- Check [ROADMAP.md](../ROADMAP.md) for feature priorities
- Review [README.md](../README.md) for project overview
- All feature pages should follow the established patterns
- When in doubt, prioritize security (CSP) and accessibility

## Summary

When working on this project:
1. **Always** respect CSP - no inline scripts or styles
2. **Always** provide export/import for user data
3. **Always** implement beforeunload warnings appropriately
4. **Always** use semantic HTML and ARIA labels
5. **Always** test keyboard navigation
6. **Always** maintain the calm, accessible aesthetic
7. **Never** add external dependencies without careful consideration
8. **Never** compromise on security or privacy
