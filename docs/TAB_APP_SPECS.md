# Tab Appearances Specifications (TAB-APP)

This document describes the tab appearance and UI/UX specifications for Aurorae Haven.

## Overview

The Tab Appearances specifications define the visual design, layout, and user experience standards
for all tabs (pages) in the Aurorae Haven application. These specifications ensure consistency,
accessibility, and a calm, neurodivergent-friendly interface across all features.

**Version**: 1.0  
**Last Updated**: 2025-10-07  
**Status**: 📋 Specification Phase

## Purpose

These specifications ensure that all tabs in Aurorae Haven maintain:

- Consistent visual design language (Glass-UI aesthetic)
- Accessible navigation and interaction patterns
- Responsive layouts across devices
- Calm, low-contrast visuals suitable for neurodivergent users
- Clear visual hierarchy and information architecture

## Scope

These specifications apply to all tabs in the application:

- Home
- Schedule
- Sequences
- Brain Dump
- Tasks
- Habits
- Stats
- Settings

---

## Specification Paragraphs

### 1. Navigation Bar (TAB-APP-NAV)

The application shall provide a persistent navigation bar at the top of all pages with the following requirements:

1. **Position**: Sticky header that remains visible during scrolling
2. **Visual Style**: Glass-UI aesthetic with backdrop blur and transparency
3. **Logo**: Aurorae Haven logo displayed on the left
4. **Brand Text**: Application name "Aurorae Haven" with tagline "Find your light. Navigate your path."
5. **Navigation Items**: Icon and text labels for each tab
6. **Active State**: Visual indicator showing the currently active tab
7. **Export/Import**: Quick access buttons for data export and import functions
8. **Responsive**: Mobile-friendly navigation that adapts to smaller screens

**Reference**: TAB-APP-NAV-01

---

### 2. Color System (TAB-APP-COL)

Each tab shall use a consistent color system based on the Glass-UI theme with the following requirements:

1. **Primary Colors**:
   - Ink (text): `#eef0ff`
   - Dim (secondary text): `#a9b1e0`
   - Mint (accent): `#86f5e0`
   - Line (borders): `rgba(200, 210, 255, 0.16)`

2. **Glass Effects**:
   - Glass-hi (high opacity): `rgba(18, 22, 52, 0.38)`
   - Glass-lo (low opacity): `rgba(18, 22, 52, 0.26)`
   - Blur: `saturate(135%) blur(10px)`

3. **Background**:
   - Deep space gradient with subtle star pattern
   - Radial gradients for depth
   - Planet decoration in bottom-right corner

4. **Contrast**: All text shall meet WCAG 2.2 AA contrast requirements

**Reference**: TAB-APP-COL-01

---

### 3. Typography (TAB-APP-TYP)

All tabs shall use consistent typography with the following requirements:

1. **Font Family**: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif
2. **Line Height**: 1.55 for body text
3. **Headings**:
   - H1: Bold, prominent for page titles
   - H2: Section headings
   - H3: Subsection headings
4. **Font Weights**:
   - Regular: 400
   - Bold: 700
5. **Letter Spacing**: 0.2px for headings
6. **Readability**: Sufficient line height and spacing for comfortable reading

**Reference**: TAB-APP-TYP-01

---

### 4. Layout Structure (TAB-APP-LAY)

Each tab shall follow a consistent layout structure with the following requirements:

1. **Shell Container**: Main content area with consistent padding
2. **Max Width**: 1240px for desktop, centered with auto margins
3. **Padding**:
   - Desktop: 18-24px horizontal, 16-20px vertical
   - Mobile: 12-16px horizontal, 12px vertical
4. **Grid System**: CSS Grid and Flexbox for responsive layouts
5. **Spacing**: Consistent gap values (8px, 10px, 12px, 14px, 16px)
6. **Panels**: Card-style containers with glass effect, rounded corners (12-16px), and borders

**Reference**: TAB-APP-LAY-01

---

### 5. Interactive Elements (TAB-APP-INT)

All interactive elements shall follow consistent patterns with the following requirements:

1. **Buttons**:
   - Glass effect background
   - Rounded corners (12px)
   - Padding: 10-12px horizontal, 8-10px vertical
   - Hover state with brightness filter
   - Focus state with visible outline

2. **Links**:
   - Underline or distinct visual treatment
   - Hover state with color change
   - Focus state with outline

3. **Input Fields**:
   - Glass effect background
   - 1px border with line color
   - Rounded corners (12px)
   - Focus state with mint accent outline
   - Placeholder text in dim color

4. **Transitions**:
   - Duration: 240ms
   - Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)`

**Reference**: TAB-APP-INT-01

---

### 6. Accessibility (TAB-APP-ACC)

All tabs shall meet WCAG 2.2 AA accessibility requirements with the following specifications:

1. **Keyboard Navigation**:
   - All interactive elements focusable via Tab key
   - Logical focus order following visual layout
   - Skip links for main content
   - Escape key to close modals/dialogs

2. **Screen Readers**:
   - Semantic HTML structure (header, nav, main, section, article)
   - ARIA labels on icon-only buttons
   - ARIA live regions for dynamic content updates
   - Hidden text for screen reader context

3. **Focus Indicators**:
   - Visible outline (3px solid) on all focusable elements
   - High contrast color (mint accent)
   - 2px offset for clarity
   - Never remove focus outlines

4. **Color Contrast**:
   - Text: Minimum 4.5:1 contrast ratio
   - Large text: Minimum 3:1 contrast ratio
   - Interactive elements: Minimum 3:1 contrast ratio

5. **Labels**:
   - All form inputs have associated labels
   - Icon buttons have aria-label or aria-labelledby
   - Complex widgets have appropriate ARIA roles

**Reference**: TAB-APP-ACC-01

---

### 7. Responsive Design (TAB-APP-RES)

All tabs shall be responsive and adapt to different screen sizes with the following requirements:

1. **Breakpoints**:
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: > 1024px

2. **Mobile Adaptations**:
   - Single-column layouts
   - Stacked navigation items
   - Touch-friendly tap targets (minimum 44x44px)
   - Simplified data visualizations
   - Hidden or collapsed secondary content

3. **Tablet Adaptations**:
   - 2-column layouts where appropriate
   - Optimized spacing for medium screens
   - Touch-friendly interactions

4. **Desktop Optimizations**:
   - Multi-column layouts for data density
   - Hover states and tooltips
   - Keyboard shortcuts
   - Larger viewport utilization

5. **Viewport Meta Tag**:
   - `<meta name="viewport" content="width=device-width, initial-scale=1">`

**Reference**: TAB-APP-RES-01

---

### 8. Motion and Animation (TAB-APP-MOT)

All tabs shall use motion judiciously with respect for user preferences:

1. **Respect User Preferences**:
   - Check `prefers-reduced-motion` media query
   - Provide static alternatives when user prefers reduced motion
   - Never auto-play animations

2. **Transition Guidelines**:
   - Subtle transitions for state changes
   - Duration: 240ms (fast), 300ms (medium), 500ms (slow)
   - Easing: Smooth cubic-bezier curves
   - Focus on functional motion, not decorative

3. **Animation Purposes**:
   - Feedback: Confirm user actions
   - Attention: Draw focus to important changes
   - Continuity: Show relationships between elements

4. **Performance**:
   - Use CSS transforms and opacity for GPU acceleration
   - Avoid animating layout properties (width, height, top, left)
   - 60fps target for all animations

**Reference**: TAB-APP-MOT-01

---

### 9. Icons and Visual Elements (TAB-APP-ICO)

All tabs shall use consistent iconography and visual elements:

1. **Icon Library**:
   - SVG icons for scalability
   - Feather Icons style (simple, clean lines)
   - 24x24px default size
   - Consistent stroke width

2. **Icon Usage**:
   - Always pair with text labels except in icon-only buttons with aria-label
   - Use for navigation items
   - Use for action buttons (save, delete, edit)
   - Maintain consistent semantics (same icon = same action)

3. **Visual Decorations**:
   - Planet in bottom-right corner on all pages
   - Subtle star pattern in background
   - Glass panels for content grouping
   - Minimal use of illustrations

4. **Loading States**:
   - Subtle loading indicators
   - Skeleton screens for content loading
   - Progress bars for operations with known duration

**Reference**: TAB-APP-ICO-01

---

### 10. Content Security Policy (TAB-APP-CSP)

All tabs shall comply with strict Content Security Policy requirements:

1. **No Inline Scripts**: All JavaScript in external files
2. **No Inline Styles**: All CSS in external files (inline styles via `style` attribute allowed where necessary)
3. **CSP Header**:

   ```text
   default-src 'self';
   script-src 'self' https://cdn.jsdelivr.net;
   style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
   img-src 'self' data:;
   font-src 'self' https://cdn.jsdelivr.net;
   object-src 'none';
   base-uri 'self';
   frame-ancestors 'self';
   upgrade-insecure-requests
   ```

4. **External Resources**: Use SRI (Subresource Integrity) for CDN resources
5. **User Content**: Sanitize all user-generated content before rendering

**Reference**: TAB-APP-CSP-01

---

### 11. Error Handling and Feedback (TAB-APP-ERR)

All tabs shall provide clear error handling and user feedback:

1. **Toast Notifications**:
   - Non-intrusive notifications for status updates
   - 3-second auto-dismiss
   - Positioned consistently (bottom-right or top-center)
   - Accessible via ARIA live regions

2. **Error Messages**:
   - Clear, actionable error descriptions
   - Avoid technical jargon
   - Suggest solutions when possible
   - Red accent color for errors
   - Icon to indicate error state

3. **Validation**:
   - Inline validation for form fields
   - Show errors on blur or submit
   - Clear error messages near the field
   - Don't block input while showing errors

4. **Loading States**:
   - Show loading indicator for operations > 200ms
   - Disable buttons during async operations
   - Provide progress feedback for long operations

**Reference**: TAB-APP-ERR-01

---

### 12. Data Persistence Indicators (TAB-APP-DAT)

All tabs shall provide clear indicators for data persistence status:

1. **Unsaved Changes Warning**:
   - beforeunload prompt when user has unsaved data
   - Exception: Internal navigation (marked with `data-nav="internal"`)
   - Clear indication of when data is auto-saved

2. **Save Confirmation**:
   - Toast notification on successful save
   - Visual feedback (checkmark, success color)
   - Timestamp of last save

3. **Export/Import**:
   - Consistent export button in navigation bar
   - Import via file picker in navigation bar
   - JSON format for all exports
   - Data validation on import

4. **LocalStorage Monitoring**:
   - Handle quota exceeded errors gracefully
   - Provide clear message when storage is full
   - Offer to export data before clearing

**Reference**: TAB-APP-DAT-01

---

## Sub-Issues to Create

Based on the specification paragraphs above, the following sub-issues should be created in the GitHub issue tracker:

1. **1 Navigation Bar (TAB-APP-NAV-01)**
   - Implement persistent navigation bar with glass-UI styling
   - Add active state indicators
   - Ensure responsive mobile navigation

2. **2 Color System (TAB-APP-COL-01)**
   - Define and document color variables
   - Implement glass effect styling
   - Verify WCAG 2.2 AA contrast compliance

3. **3 Typography (TAB-APP-TYP-01)**
   - Establish typography scale and hierarchy
   - Implement consistent font usage
   - Ensure readability across devices

4. **4 Layout Structure (TAB-APP-LAY-01)**
   - Define standard layout patterns
   - Implement grid and flexbox systems
   - Create reusable panel components

5. **5 Interactive Elements (TAB-APP-INT-01)**
   - Standardize button, link, and input styles
   - Implement consistent hover and focus states
   - Define transition timing and easing

6. **6 Accessibility (TAB-APP-ACC-01)**
   - Audit and ensure WCAG 2.2 AA compliance
   - Implement comprehensive keyboard navigation
   - Add ARIA labels and semantic HTML

7. **7 Responsive Design (TAB-APP-RES-01)**
   - Define breakpoints and responsive behaviors
   - Implement mobile-first layouts
   - Test across device sizes

8. **8 Motion and Animation (TAB-APP-MOT-01)**
   - Implement prefers-reduced-motion support
   - Define animation guidelines
   - Optimize for 60fps performance

9. **9 Icons and Visual Elements (TAB-APP-ICO-01)**
   - Standardize icon usage and sizing
   - Implement consistent visual decorations
   - Add loading states and skeletons

10. **10 Content Security Policy (TAB-APP-CSP-01)**
    - Enforce CSP compliance across all tabs
    - Remove all inline scripts and styles
    - Implement SRI for external resources

11. **11 Error Handling and Feedback (TAB-APP-ERR-01)**
    - Implement toast notification system
    - Standardize error message patterns
    - Add validation and loading states

12. **12 Data Persistence Indicators (TAB-APP-DAT-01)**
    - Implement unsaved changes warnings
    - Add save confirmation feedback
    - Handle storage quota errors

---

## Implementation Priority

### Phase 1: Foundation (v1.0)

- [x] Navigation Bar (TAB-APP-NAV-01) - Already implemented
- [x] Color System (TAB-APP-COL-01) - Already implemented
- [x] Typography (TAB-APP-TYP-01) - Already implemented
- [x] Layout Structure (TAB-APP-LAY-01) - Already implemented

### Phase 2: Enhancement (v1.1)

- [ ] Interactive Elements (TAB-APP-INT-01) - Partial implementation
- [ ] Accessibility (TAB-APP-ACC-01) - Ongoing improvements needed
- [ ] Responsive Design (TAB-APP-RES-01) - Partial implementation
- [ ] Content Security Policy (TAB-APP-CSP-01) - Already compliant

### Phase 3: Polish (v1.2)

- [ ] Motion and Animation (TAB-APP-MOT-01) - Needs implementation
- [ ] Icons and Visual Elements (TAB-APP-ICO-01) - Partial implementation
- [ ] Error Handling and Feedback (TAB-APP-ERR-01) - Partial implementation
- [ ] Data Persistence Indicators (TAB-APP-DAT-01) - Already implemented

---

## Compliance Verification

Each specification should be verified against the following checklist:

- [ ] Specification clearly documented
- [ ] Implementation matches specification
- [ ] Tested across browsers (Chrome, Firefox, Safari, Edge)
- [ ] Tested across devices (mobile, tablet, desktop)
- [ ] Accessibility audit passed (WCAG 2.2 AA)
- [ ] Performance benchmarks met (60fps, fast load times)
- [ ] Security review passed (CSP compliance, no vulnerabilities)
- [ ] User feedback collected and incorporated

---

## Related Documentation

- [Notes Specifications (TAB-BDP)](./NOTES_SPECS.md)
- [Tasks Specifications (TAB-TSK)](./TASKS_SPECS.md)

---

## Support and Feedback

For issues or feature requests related to Tab Appearances specifications, please open an issue on the GitHub repository with the `tab-appearances` or `ui-ux` label.

## License

This specification is part of the Aurorae Haven project and follows the same license.
