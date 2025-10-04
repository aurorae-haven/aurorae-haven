# Contributing to Aurorae Haven

Thank you for your interest in contributing to Aurorae Haven! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize accessibility, security, and privacy
- Maintain the calm, neurodivergent-friendly aesthetic

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker
- Provide clear descriptions with steps to reproduce
- Include browser/device information for bugs
- Check existing issues before creating new ones

### Pull Requests

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/my-stellar-trail.git
   cd my-stellar-trail
   ```

2. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the coding standards in `.github/copilot-instructions.md`
   - Keep changes focused and minimal
   - Test thoroughly in multiple browsers

4. **Commit**

   ```bash
   git commit -m "✨ Add feature description"
   ```

   Use conventional commit prefixes:
   - ✨ `feat:` - New feature
   - 🐛 `fix:` - Bug fix
   - 📝 `docs:` - Documentation
   - ♻️ `refactor:` - Code refactoring
   - ✅ `test:` - Adding tests
   - 🔒 `security:` - Security improvements

5. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a pull request on GitHub

## Development Standards

### Security (CRITICAL)

- **NEVER** use inline scripts or styles (CSP violation)
- All JavaScript in external `.js` files
- All CSS in external `.css` files
- Validate and sanitize all user input
- No `eval()` or `Function()` usage

### Accessibility (WCAG 2.0 AA)

- Use semantic HTML5 elements
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers

### Code Style

**JavaScript:**

- Use ES6 modules (`import`/`export`)
- Use `const` by default, `let` when needed, avoid `var`
- Arrow functions for callbacks
- Template literals for strings
- Meaningful variable names

**HTML:**

- Semantic elements (`<main>`, `<nav>`, `<article>`, etc.)
- Include `lang` attribute on `<html>`
- Add viewport meta tag
- Mark internal links with `data-nav="internal"`

**CSS:**

- Mobile-first responsive design
- Use CSS custom properties for tokens
- Relative units (rem, em, %) over pixels
- Maintain calm, low-contrast visuals
- Respect `prefers-reduced-motion` and `prefers-color-scheme`

### Testing

Before submitting:

1. Test in Chrome, Firefox, Edge, Safari
2. Verify keyboard navigation
3. Check browser console for errors
4. Validate CSP compliance (no violations)
5. Test data export/import functionality
6. Verify responsive design on mobile

## Project Structure

```text
/
├── index.html              # Main entry point
├── public/
│   ├── index.html         # Landing page
│   └── pages/             # Feature pages
├── src/
│   ├── main.js            # Core logic
│   └── assets/styles/     # CSS files
└── .github/
    ├── copilot-instructions.md  # Full coding standards
    └── workflows/               # CI/CD
```

## Feature Development

When adding new features:

1. Create HTML page in `public/pages/` if needed
2. Create corresponding JS module in `src/`
3. Include CSP meta tag in HTML
4. Implement export/import for data structures
5. Add to navigation with `data-nav="internal"`
6. Update data version if schema changes
7. Test data persistence

## Documentation

- Update README.md for user-facing changes
- Update ROADMAP.md for feature planning
- Add inline comments for complex logic only
- Follow existing documentation style

## Getting Help

- Check [README.md](./README.md) for project overview
- Review [ROADMAP.md](./ROADMAP.md) for planned features
- Read [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) for detailed standards
- Open a discussion on GitHub for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
