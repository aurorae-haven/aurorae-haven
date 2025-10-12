# Help Button UX Implementation Proposal

> **Minimal, accessible ways to integrate user manual access in Aurorae Haven**

---

## Overview

This document proposes several user experience options for displaying the USER_MANUAL.md content within the Aurorae Haven app, specifically focused on helping users learn about LaTeX equations and image embedding in the Brain Dump feature.

**Design Goals:**

- ✅ Minimal UX impact (respects calm, minimalist aesthetic)
- ✅ Always accessible but never intrusive
- ✅ Educates new users without overwhelming them
- ✅ Accessible via keyboard and screen readers
- ✅ Mobile-responsive
- ✅ Follows WCAG 2.2 AA standards

---

## Recommended Solution: Combination Approach

### Implement Options 1 + 3 Together for Optimal UX

### Option 1: Help Icon Button in Toolbar

Add a small, icon-only help button to the Brain Dump toolbar.

**Visual Position:**

```text
┌─────────────────────────────────────────────────────┐
│ Brain Dump                        [Import][Export][?]│
│─────────────────────────────────────────────────────│
│ [Editor...]                                          │
└─────────────────────────────────────────────────────┘
```

**Implementation:**

```jsx
// Add to Brain Dump toolbar (after Export button)
<button
  className='btn btn-help'
  onClick={handleHelpClick}
  aria-label='Open user manual and formatting help'
  title='Help: LaTeX, Images & Markdown'
>
  <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
    <circle cx='12' cy='12' r='10' />
    <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
    <line x1='12' y1='17' x2='12.01' y2='17' />
  </svg>
</button>
```

**CSS Styling:**

```css
.btn-help {
  margin-left: auto; /* Push to far right if needed */
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.btn-help:hover,
.btn-help:focus {
  opacity: 1;
}

/* Mobile: smaller icon */
@media (max-width: 768px) {
  .btn-help {
    padding: 0.5rem;
  }
}
```

**Modal Content:**

When clicked, opens a modal with tabbed sections:

1. **Quick Reference** (default active tab)
2. **LaTeX Examples**
3. **Images**
4. **Full Manual**

### Option 3: First-Time User Tooltip

Show a small, dismissible tooltip on first visit to Brain Dump.

**Implementation:**

```jsx
// Check localStorage for first visit
useEffect(() => {
  const hasSeenHelp = localStorage.getItem('brainDumpHelpSeen')
  if (!hasSeenHelp) {
    setShowFirstTimeTooltip(true)
  }
}, [])

// JSX for tooltip
{
  showFirstTimeTooltip && (
    <div
      className='first-time-tooltip'
      role='tooltip'
      aria-label='Tip: Click the question mark icon for help with LaTeX and images'
    >
      <button
        className='tooltip-close'
        onClick={() => {
          setShowFirstTimeTooltip(false)
          localStorage.setItem('brainDumpHelpSeen', 'true')
        }}
        aria-label='Dismiss tip'
      >
        ×
      </button>
      <p>
        💡 <strong>New here?</strong> Click the <strong>?</strong> icon for help
        with LaTeX equations and images!
      </p>
    </div>
  )
}
```

**CSS Styling:**

```css
.first-time-tooltip {
  position: absolute;
  top: 4rem;
  right: 1rem;
  max-width: 280px;
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.tooltip-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.6;
}

.tooltip-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Auto-dismiss after 10 seconds if not interacted with */
```

**Behavior:**

- Shows only once per user (stored in localStorage)
- Auto-dismisses after 10 seconds if not clicked
- Animates in smoothly
- Points to the "?" button in toolbar
- Can be manually dismissed with "×" button

---

## Alternative Options

### Option 2: Footer Link

Add a persistent link in the app footer or navigation sidebar.

**Pros:**

- Always visible
- Doesn't clutter the editor
- Standard pattern

**Cons:**

- Less discoverable for new users
- Requires scrolling on mobile
- Not contextual to Brain Dump

**Implementation:**

```jsx
// In Layout.jsx footer
<footer className='app-footer'>
  <Link to='/help' className='footer-link'>
    📖 User Manual
  </Link>
  <Link to='/about' className='footer-link'>
    About
  </Link>
</footer>
```

### Option 4: Context Menu

Add "Show formatting help" to the right-click context menu in the editor.

**Pros:**

- Contextual
- Doesn't add visual clutter
- Power user friendly

**Cons:**

- Not discoverable for most users
- Mobile support limited
- Screen reader accessibility challenging

**Implementation:**

```jsx
const handleContextMenu = (e) => {
  e.preventDefault()
  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    options: [
      { label: 'Show formatting help', action: handleHelpClick },
      { label: 'Clear editor', action: handleClear }
    ]
  })
}
```

### Option 5: Keyboard Shortcut Only

Provide keyboard shortcut (e.g., `F1` or `Ctrl+?`) without visible button.

**Pros:**

- Zero visual clutter
- Efficient for keyboard users

**Cons:**

- Not discoverable
- Excludes users who don't know about shortcuts
- Not accessible via touch/mobile

**Not Recommended** as standalone solution.

---

## Help Modal Structure

When the help button is clicked, open a modal with tabbed content:

### Tab 1: Quick Reference (Default)

**Content:**

- 5-10 most common markdown features
- 3-5 most common LaTeX examples
- Basic image syntax
- Link to full manual

**Example Layout:**

```text
┌─────────────────────────────────────────────┐
│ Brain Dump Help                        [×]  │
├─────────────────────────────────────────────┤
│ [Quick Reference] [LaTeX] [Images] [Full]  │
├─────────────────────────────────────────────┤
│ Common Markdown:                            │
│   **bold**  _italic_  `code`  [link](url)  │
│                                             │
│ LaTeX Equations:                            │
│   Inline: $E = mc^2$                        │
│   Block:  $$ x = \frac{-b \pm ...}{2a} $$  │
│                                             │
│ Images:                                     │
│   ![alt text](image-url)                    │
│                                             │
│ [📖 View Full Manual]                       │
└─────────────────────────────────────────────┘
```

### Tab 2: LaTeX Examples

**Content:**

- Inline vs display mode
- Common symbols (Greek letters, operators)
- Fractions, roots, summations
- Matrix syntax
- Copy-paste ready examples

### Tab 3: Images

**Content:**

- Basic syntax
- File attachments (OPFS)
- Alt text best practices
- Image sizing (HTML fallback)
- Accessibility tips

### Tab 4: Full Manual

**Options:**

1. **Embedded scrollable view** of USER_MANUAL.md (rendered markdown)
2. **Link to open** USER_MANUAL.md in new tab/window
3. **Download button** to save USER_MANUAL.md locally

**Recommended:** Embedded view with link to full document.

---

## Implementation Checklist

### Phase 1: Help Button (Essential)

- [ ] Add help icon button to Brain Dump toolbar
- [ ] Implement help modal with tabbed structure
- [ ] Add Quick Reference tab content
- [ ] Add LaTeX Examples tab content
- [ ] Add Images tab content
- [ ] Add Full Manual tab (link or embedded view)
- [ ] Style modal for glass UI aesthetic
- [ ] Ensure keyboard navigation (Tab, Escape)
- [ ] Add ARIA labels for screen readers
- [ ] Test on mobile (responsive modal)

### Phase 2: First-Time Tooltip (Optional but Recommended)

- [ ] Implement localStorage check for first visit
- [ ] Create tooltip component
- [ ] Style tooltip with animation
- [ ] Add auto-dismiss after 10 seconds
- [ ] Add manual dismiss button
- [ ] Test on mobile (position adjustment)

### Phase 3: Additional Access Points (Optional)

- [ ] Add footer link "User Manual"
- [ ] Add keyboard shortcut (F1) for help modal
- [ ] Document shortcuts in Settings page

---

## Accessibility Considerations

### Keyboard Navigation

- **Tab**: Move through tabs and buttons
- **Escape**: Close modal
- **Enter/Space**: Activate buttons
- **Arrow keys**: Navigate between tabs (optional enhancement)

### Screen Reader Support

```jsx
// Modal structure
<div
  role='dialog'
  aria-labelledby='help-modal-title'
  aria-describedby='help-modal-desc'
  aria-modal='true'
>
  <h2 id='help-modal-title'>Brain Dump Help</h2>
  <p id='help-modal-desc' className='sr-only'>
    Formatting guide for markdown, LaTeX equations, and images
  </p>

  <div role='tablist' aria-label='Help topics'>
    <button
      role='tab'
      aria-selected={activeTab === 'quick'}
      aria-controls='panel-quick'
      id='tab-quick'
    >
      Quick Reference
    </button>
    {/* ... more tabs */}
  </div>

  <div
    role='tabpanel'
    id='panel-quick'
    aria-labelledby='tab-quick'
    tabIndex={0}
  >
    {/* Content */}
  </div>
</div>
```

### Focus Management

1. When modal opens, focus moves to first interactive element (close button or first tab)
2. Focus is trapped within modal (cannot Tab out)
3. When modal closes, focus returns to help button
4. Tab order is logical: Close button → Tabs → Content → Links

### Mobile Considerations

- Modal takes full screen on small devices
- Tabs become vertical stack or dropdown on mobile
- Close button is large enough for touch (44×44px minimum)
- No hover-only interactions

---

## Visual Design

### Color Scheme (Glass UI)

```css
.help-modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.help-modal-tab {
  background: transparent;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.help-modal-tab[aria-selected='true'] {
  border-bottom-color: var(--primary-color);
}

.help-modal-tab:hover {
  background: rgba(0, 0, 0, 0.05);
}
```

### Typography

- Use app's existing font stack
- Code examples in monospace font
- LaTeX examples rendered with KaTeX
- Sufficient line height (1.6) for readability

### Spacing

- Modal: 90% viewport width (max 800px)
- Padding: 1.5rem on desktop, 1rem on mobile
- Content sections: 1.5rem vertical spacing
- Tabs: 1rem horizontal padding

---

## Performance Considerations

1. **Lazy load modal content**: Don't render until opened
2. **Cache rendered markdown**: Store in state after first render
3. **Optimize LaTeX rendering**: Pre-render common examples
4. **Code splitting**: Load help modal as separate chunk

```jsx
// Lazy load modal component
const HelpModal = lazy(() => import('./components/HelpModal'))

// In component
{
  showHelpModal && (
    <Suspense fallback={<div>Loading...</div>}>
      <HelpModal onClose={() => setShowHelpModal(false)} />
    </Suspense>
  )
}
```

---

## Testing Plan

### Manual Testing

1. **Desktop browsers** (Chrome, Firefox, Edge, Safari)
   - Open help modal
   - Navigate tabs
   - Copy examples
   - Close with Escape
2. **Mobile browsers** (iOS Safari, Android Chrome)
   - Tap help button
   - Swipe/tap tabs
   - Scroll content
   - Tap close button
3. **Keyboard navigation**
   - Tab through all elements
   - Activate with Enter/Space
   - Close with Escape
4. **Screen reader** (NVDA, JAWS, VoiceOver)
   - Announce button label
   - Navigate tabs
   - Read content
   - Announce modal close

### Automated Testing

```javascript
describe('Help Modal', () => {
  it('opens when help button is clicked', () => {
    render(<BrainDump />)
    const helpButton = screen.getByLabelText(/help/i)
    fireEvent.click(helpButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes when Escape key is pressed', () => {
    render(<BrainDump />)
    // Open modal
    fireEvent.click(screen.getByLabelText(/help/i))
    // Press Escape
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('switches tabs correctly', () => {
    render(<BrainDump />)
    fireEvent.click(screen.getByLabelText(/help/i))
    const latexTab = screen.getByRole('tab', { name: /latex/i })
    fireEvent.click(latexTab)
    expect(latexTab).toHaveAttribute('aria-selected', 'true')
  })
})
```

---

## Future Enhancements

### Phase 4: Advanced Features (v2.0+)

1. **Interactive examples**: Edit and preview LaTeX/markdown in modal
2. **Search within help**: Filter examples by keyword
3. **Contextual help**: Show relevant help based on cursor position
4. **Video tutorials**: Embed short video clips for complex features
5. **Cheat sheet download**: Export quick reference as PDF/image
6. **Gamification**: "Help badge" achievement for reading full manual

---

## Summary

**Recommended Implementation:**

✅ **Option 1 (Help Button)** + **Option 3 (First-Time Tooltip)**

This combination provides:

- Always-accessible help without clutter
- Gentle onboarding for new users
- Respects experienced users (dismissible)
- Minimal visual impact
- Fully accessible
- Mobile-friendly

**Effort Estimate:**

- Help Button + Modal: 4-6 hours
- First-Time Tooltip: 1-2 hours
- Testing & Polish: 2-3 hours
- **Total: ~8-11 hours**

**Priority:**

- 🔴 High: Help button with Quick Reference tab
- 🟡 Medium: Full modal with all tabs
- 🟢 Low: First-time tooltip (nice-to-have)

---

## References

- [USER_MANUAL.md](../USER_MANUAL.md) - Full documentation
- [NOTES_USAGE.md](./NOTES_USAGE.md) - Feature guide
- [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Design system specs
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/) - Accessibility standards

---

**Last Updated**: 2025-01-15  
**Author**: Aurorae Haven Development Team
