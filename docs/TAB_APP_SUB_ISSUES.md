# Tab Appearances Sub-Issues

This document lists all sub-issues to be created for the Tab Appearances (TAB-APP) specifications.

## Parent Issue

**Title**: Specifications: Tab Appearances (TAB-APP)  
**Description**: Bulk specification for tab appearance and UI/UX standards across all pages in Aurorae Haven.

---

## Sub-Issues List

Each sub-issue follows the naming convention: `<paragraph number> <paragraph name> (<reference>)`

### 1 Navigation Bar (TAB-APP-NAV-01)

**Title**: 1 Navigation Bar (TAB-APP-NAV-01)

**Labels**: `specification`, `tab-appearances`, `ui-ux`, `navigation`

**Description**:
Implement and verify the navigation bar specifications for Aurorae Haven.

**Requirements**:

- Persistent sticky header that remains visible during scrolling
- Glass-UI aesthetic with backdrop blur and transparency
- Logo displayed on the left
- Brand text "Aurorae Haven" with tagline "Find your light. Navigate your path."
- Icon and text labels for each tab
- Visual indicator showing currently active tab
- Export/Import quick access buttons
- Mobile-friendly responsive navigation

**Acceptance Criteria**:

- [ ] Navigation bar is sticky and visible during scroll
- [ ] Glass effect with backdrop blur applied
- [ ] All navigation items have icons and labels
- [ ] Active state clearly indicates current page
- [ ] Export/Import buttons accessible in header
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Keyboard navigation works correctly
- [ ] ARIA labels present for accessibility

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 1

---

### 2 Color System (TAB-APP-COL-01)

**Title**: 2 Color System (TAB-APP-COL-01)

**Labels**: `specification`, `tab-appearances`, `ui-ux`, `design-system`

**Description**:
Define and verify the color system specifications for Aurorae Haven tabs.

**Requirements**:

- Primary colors defined in CSS variables:
  - Ink (text): `#eef0ff`
  - Dim (secondary text): `#a9b1e0`
  - Mint (accent): `#86f5e0`
  - Line (borders): `rgba(200, 210, 255, 0.16)`
- Glass effects:
  - Glass-hi: `rgba(18, 22, 52, 0.38)`
  - Glass-lo: `rgba(18, 22, 52, 0.26)`
  - Blur: `saturate(135%) blur(10px)`
- Deep space gradient background with star pattern
- Planet decoration in bottom-right corner
- WCAG 2.2 AA contrast compliance

**Acceptance Criteria**:

- [ ] All color variables defined in `:root`
- [ ] Glass effects applied consistently across components
- [ ] Background gradient and star pattern visible
- [ ] Planet decoration renders correctly
- [ ] All text meets WCAG 2.2 AA contrast ratios (4.5:1 minimum)
- [ ] Color system documented in style guide

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 2

---

### 3 Typography (TAB-APP-TYP-01)

**Title**: 3 Typography (TAB-APP-TYP-01)

**Labels**: `specification`, `tab-appearances`, `ui-ux`, `design-system`

**Description**:
Establish and verify typography specifications for Aurorae Haven tabs.

**Requirements**:

- Font family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif
- Line height: 1.55 for body text
- Heading hierarchy (H1, H2, H3) with appropriate sizing
- Font weights: Regular (400), Bold (700)
- Letter spacing: 0.2px for headings
- Sufficient spacing for comfortable reading

**Acceptance Criteria**:

- [ ] Font stack implemented with fallbacks
- [ ] Line height set to 1.55 for body text
- [ ] Heading hierarchy clearly defined and consistent
- [ ] Font weights limited to 400 and 700
- [ ] Letter spacing applied to headings
- [ ] Typography scale documented
- [ ] Readability tested across devices

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 3

---

### 4 Layout Structure (TAB-APP-LAY-01)

**Title**: 4 Layout Structure (TAB-APP-LAY-01)

**Labels**: `specification`, `tab-appearances`, `ui-ux`, `layout`

**Description**:
Define and verify layout structure specifications for Aurorae Haven tabs.

**Requirements**:

- Shell container for main content area
- Max width: 1240px for desktop, centered
- Padding:
  - Desktop: 18-24px horizontal, 16-20px vertical
  - Mobile: 12-16px horizontal, 12px vertical
- CSS Grid and Flexbox for responsive layouts
- Consistent gap values (8px, 10px, 12px, 14px, 16px)
- Panel components with glass effect, rounded corners (12-16px), and borders

**Acceptance Criteria**:

- [ ] Shell container implemented with max-width
- [ ] Responsive padding adjusts per device size
- [ ] Grid and Flexbox used for layouts
- [ ] Gap values consistent across components
- [ ] Panel components styled with glass effect
- [ ] Border radius consistent (12-16px)
- [ ] Layout tested on mobile, tablet, desktop

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 4

---

### 5 Interactive Elements (TAB-APP-INT-01)

**Title**: 5 Interactive Elements (TAB-APP-INT-01)

**Labels**: `specification`, `tab-appearances`, `ui-ux`, `interaction`

**Description**:
Standardize and verify interactive element specifications for Aurorae Haven tabs.

**Requirements**:

- **Buttons**:
  - Glass effect background
  - Rounded corners (12px)
  - Padding: 10-12px horizontal, 8-10px vertical
  - Hover state with brightness filter
  - Focus state with visible outline
- **Links**:
  - Underline or distinct visual treatment
  - Hover state with color change
  - Focus state with outline
- **Input Fields**:
  - Glass effect background
  - 1px border with line color
  - Rounded corners (12px)
  - Focus state with mint accent outline
  - Placeholder text in dim color
- **Transitions**:
  - Duration: 240ms
  - Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)`

**Acceptance Criteria**:

- [ ] Button styles standardized across all tabs
- [ ] Link styles consistent with hover and focus states
- [ ] Input field styles uniform with proper focus treatment
- [ ] Transitions smooth with 240ms duration
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators clearly visible
- [ ] Touch targets meet 44x44px minimum on mobile

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 5

---

### 6 Accessibility (TAB-APP-ACC-01)

**Title**: 6 Accessibility (TAB-APP-ACC-01)

**Labels**: `specification`, `tab-appearances`, `accessibility`, `wcag`

**Description**:
Ensure and verify WCAG 2.2 AA accessibility compliance for all Aurorae Haven tabs.

**Requirements**:

- **Keyboard Navigation**:
  - All interactive elements focusable via Tab
  - Logical focus order
  - Skip links for main content
  - Escape key to close modals
- **Screen Readers**:
  - Semantic HTML structure
  - ARIA labels on icon-only buttons
  - ARIA live regions for dynamic updates
  - Hidden text for context
- **Focus Indicators**:
  - Visible 3px outline on all focusable elements
  - High contrast mint accent color
  - 2px offset for clarity
- **Color Contrast**:
  - Text: 4.5:1 minimum
  - Large text: 3:1 minimum
  - Interactive elements: 3:1 minimum
- **Labels**:
  - All form inputs have labels
  - Icon buttons have aria-label
  - Complex widgets have ARIA roles

**Acceptance Criteria**:

- [ ] All interactive elements keyboard accessible
- [ ] Focus order follows visual layout
- [ ] Skip links implemented
- [ ] Semantic HTML used throughout
- [ ] ARIA labels present on all icon buttons
- [ ] ARIA live regions for dynamic content
- [ ] Focus indicators visible and high contrast
- [ ] All contrast ratios meet WCAG 2.2 AA
- [ ] All form inputs properly labeled
- [ ] Screen reader testing passed
- [ ] Keyboard navigation testing passed

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 6

---

### 7 Responsive Design (TAB-APP-RES-01)

**Title**: 7 Responsive Design (TAB-APP-RES-01)

**Labels**: `specification`, `tab-appearances`, `responsive`, `mobile`

**Description**:
Ensure and verify responsive design specifications for Aurorae Haven tabs across all device sizes.

**Requirements**:

- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Mobile Adaptations**:
  - Single-column layouts
  - Stacked navigation items
  - Touch-friendly tap targets (44x44px minimum)
  - Simplified data visualizations
  - Hidden/collapsed secondary content
- **Tablet Adaptations**:
  - 2-column layouts where appropriate
  - Optimized spacing
  - Touch-friendly interactions
- **Desktop Optimizations**:
  - Multi-column layouts for data density
  - Hover states and tooltips
  - Keyboard shortcuts
  - Larger viewport utilization
- **Viewport Meta Tag**: `<meta name="viewport" content="width=device-width, initial-scale=1">`

**Acceptance Criteria**:

- [ ] Breakpoints defined and used consistently
- [ ] Mobile layouts single-column
- [ ] Touch targets 44x44px minimum on mobile
- [ ] Tablet layouts optimized for medium screens
- [ ] Desktop layouts utilize available space
- [ ] Viewport meta tag present
- [ ] Tested on real devices (iOS, Android)
- [ ] Tested across device orientations
- [ ] No horizontal scrolling on mobile

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 7

---

### 8 Motion and Animation (TAB-APP-MOT-01)

**Title**: 8 Motion and Animation (TAB-APP-MOT-01)

**Labels**: `specification`, `tab-appearances`, `animation`, `accessibility`

**Description**:
Define and verify motion and animation specifications for Aurorae Haven tabs with respect for user preferences.

**Requirements**:

- **Respect User Preferences**:
  - Check `prefers-reduced-motion` media query
  - Provide static alternatives
  - Never auto-play animations
- **Transition Guidelines**:
  - Subtle transitions for state changes
  - Duration: 240ms (fast), 300ms (medium), 500ms (slow)
  - Easing: Smooth cubic-bezier curves
  - Functional motion, not decorative
- **Animation Purposes**:
  - Feedback: Confirm actions
  - Attention: Highlight changes
  - Continuity: Show relationships
- **Performance**:
  - Use CSS transforms and opacity for GPU acceleration
  - Avoid animating layout properties
  - 60fps target

**Acceptance Criteria**:

- [ ] `prefers-reduced-motion` media query implemented
- [ ] Static alternatives provided for animations
- [ ] No auto-playing animations
- [ ] Transition durations consistent (240ms, 300ms, 500ms)
- [ ] Smooth easing functions used
- [ ] Animations serve functional purposes
- [ ] CSS transforms/opacity used for performance
- [ ] 60fps maintained during animations
- [ ] Tested with reduced motion preference enabled

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 8

---

### 9 Icons and Visual Elements (TAB-APP-ICO-01)

**Title**: 9 Icons and Visual Elements (TAB-APP-ICO-01)

**Labels**: `specification`, `tab-appearances`, `icons`, `visual-design`

**Description**:
Standardize and verify icon and visual element specifications for Aurorae Haven tabs.

**Requirements**:

- **Icon Library**:
  - SVG icons for scalability
  - Feather Icons style (clean lines)
  - 24x24px default size
  - Consistent stroke width
- **Icon Usage**:
  - Paired with text labels except icon-only buttons with aria-label
  - Used for navigation items
  - Used for action buttons
  - Consistent semantics (same icon = same action)
- **Visual Decorations**:
  - Planet in bottom-right corner
  - Subtle star pattern in background
  - Glass panels for content grouping
  - Minimal illustrations
- **Loading States**:
  - Subtle loading indicators
  - Skeleton screens for content loading
  - Progress bars for known duration operations

**Acceptance Criteria**:

- [ ] SVG icons used throughout
- [ ] Icons 24x24px by default
- [ ] Icons paired with text labels (except icon-only with aria-label)
- [ ] Icon usage consistent across tabs
- [ ] Planet decoration visible on all pages
- [ ] Star pattern in background
- [ ] Glass panels used for grouping
- [ ] Loading states implemented
- [ ] Skeleton screens for content loading

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 9

---

### 10 Content Security Policy (TAB-APP-CSP-01)

**Title**: 10 Content Security Policy (TAB-APP-CSP-01)

**Labels**: `specification`, `tab-appearances`, `security`, `csp`

**Description**:
Ensure and verify Content Security Policy compliance for all Aurorae Haven tabs.

**Requirements**:

- No inline scripts (all JavaScript in external files)
- No inline styles (all CSS in external files, except style attribute where necessary)
- CSP header configuration:

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

- Use SRI (Subresource Integrity) for CDN resources
- Sanitize all user-generated content before rendering

**Acceptance Criteria**:

- [ ] No inline scripts in any HTML files
- [ ] All JavaScript in external .js files
- [ ] No inline styles (except via style attribute)
- [ ] CSP header configured correctly
- [ ] No CSP violations in browser console
- [ ] SRI hashes present for CDN resources
- [ ] User content sanitized (e.g., Brain Dump markdown)
- [ ] Security audit passed

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 10

---

### 11 Error Handling and Feedback (TAB-APP-ERR-01)

**Title**: 11 Error Handling and Feedback (TAB-APP-ERR-01)

**Labels**: `specification`, `tab-appearances`, `error-handling`, `feedback`

**Description**:
Standardize and verify error handling and user feedback specifications for Aurorae Haven tabs.

**Requirements**:

- **Toast Notifications**:
  - Non-intrusive notifications for status updates
  - 3-second auto-dismiss
  - Consistent positioning (bottom-right or top-center)
  - Accessible via ARIA live regions
- **Error Messages**:
  - Clear, actionable descriptions
  - Avoid technical jargon
  - Suggest solutions
  - Red accent color
  - Icon to indicate error state
- **Validation**:
  - Inline validation for form fields
  - Show errors on blur or submit
  - Clear error messages near field
  - Don't block input while showing errors
- **Loading States**:
  - Show indicator for operations > 200ms
  - Disable buttons during async operations
  - Progress feedback for long operations

**Acceptance Criteria**:

- [ ] Toast notification system implemented
- [ ] Toasts auto-dismiss after 3 seconds
- [ ] Toast positioning consistent
- [ ] ARIA live regions for accessibility
- [ ] Error messages clear and actionable
- [ ] Error messages avoid jargon
- [ ] Inline validation on form fields
- [ ] Loading indicators for slow operations
- [ ] Buttons disabled during async operations
- [ ] User tested for clarity

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 11

---

### 12 Data Persistence Indicators (TAB-APP-DAT-01)

**Title**: 12 Data Persistence Indicators (TAB-APP-DAT-01)

**Labels**: `specification`, `tab-appearances`, `data`, `persistence`

**Description**:
Ensure and verify data persistence indicator specifications for Aurorae Haven tabs.

**Requirements**:

- **Unsaved Changes Warning**:
  - beforeunload prompt when user has unsaved data
  - Exception: Internal navigation (marked with `data-nav="internal"`)
  - Clear indication of auto-save status
- **Save Confirmation**:
  - Toast notification on successful save
  - Visual feedback (checkmark, success color)
  - Timestamp of last save
- **Export/Import**:
  - Consistent export button in navigation
  - Import via file picker in navigation
  - JSON format for all exports
  - Data validation on import
- **LocalStorage Monitoring**:
  - Handle quota exceeded errors gracefully
  - Clear message when storage is full
  - Offer to export data before clearing

**Acceptance Criteria**:

- [ ] beforeunload prompt implemented for unsaved changes
- [ ] Internal navigation doesn't trigger prompt
- [ ] Auto-save status clearly indicated
- [ ] Toast notification on successful save
- [ ] Last save timestamp displayed
- [ ] Export button in navigation bar
- [ ] Import button in navigation bar
- [ ] Export format is JSON
- [ ] Import validation prevents corrupt data
- [ ] LocalStorage quota errors handled
- [ ] User prompted to export when storage full

**Reference**: See [TAB_APP_SPECS.md](./TAB_APP_SPECS.md) - Section 12

---

## Issue Creation Instructions

### Using GitHub Web Interface

1. Navigate to the repository's Issues page
2. Click "New Issue"
3. For each sub-issue above:
   - Copy the **Title** as the issue title
   - Copy the **Description** and **Requirements** sections into the issue body
   - Copy the **Acceptance Criteria** as checkboxes
   - Add the specified **Labels**
   - Add **Reference** link to the TAB_APP_SPECS.md document
   - Assign to appropriate milestone (e.g., v1.2)
   - Link to parent issue (Specifications: Tab Appearances)

### Using GitHub CLI

````bash
# Example for first sub-issue
gh issue create \
  --title "1 Navigation Bar (TAB-APP-NAV-01)" \
  --label "specification,tab-appearances,ui-ux,navigation" \
  --body "$(cat <<EOF
Implement and verify the navigation bar specifications for Aurorae Haven.

**Requirements**:

- Persistent sticky header that remains visible during scrolling
- Glass-UI aesthetic with backdrop blur and transparency
- Logo displayed on the left
- Brand text "Aurorae Haven" with tagline
- Icon and text labels for each tab
- Visual indicator showing currently active tab
- Export/Import quick access buttons
- Mobile-friendly responsive navigation

**Acceptance Criteria**:

- [ ] Navigation bar is sticky and visible during scroll
- [ ] Glass effect with backdrop blur applied
- [ ] All navigation items have icons and labels
- [ ] Active state clearly indicates current page
- [ ] Export/Import buttons accessible in header
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Keyboard navigation works correctly
- [ ] ARIA labels present for accessibility

**Reference**: See docs/TAB_APP_SPECS.md - Section 1
EOF
)"

```text

Repeat for all 12 sub-issues listed above.

---

## Tracking Progress

### Specification Status

- [ ] 1 Navigation Bar (TAB-APP-NAV-01)
- [ ] 2 Color System (TAB-APP-COL-01)
- [ ] 3 Typography (TAB-APP-TYP-01)
- [ ] 4 Layout Structure (TAB-APP-LAY-01)
- [ ] 5 Interactive Elements (TAB-APP-INT-01)
- [ ] 6 Accessibility (TAB-APP-ACC-01)
- [ ] 7 Responsive Design (TAB-APP-RES-01)
- [ ] 8 Motion and Animation (TAB-APP-MOT-01)
- [ ] 9 Icons and Visual Elements (TAB-APP-ICO-01)
- [ ] 10 Content Security Policy (TAB-APP-CSP-01)
- [ ] 11 Error Handling and Feedback (TAB-APP-ERR-01)
- [ ] 12 Data Persistence Indicators (TAB-APP-DAT-01)

### Implementation Status

Track implementation status in the main TAB_APP_SPECS.md document.

---

## Related Documentation

- [Tab Appearances Specifications (TAB-APP)](./TAB_APP_SPECS.md) - Main specification document
- [Notes Specifications (TAB-BDP)](./NOTES_SPECS.md)
- [Tasks Specifications (TAB-TSK)](./TASKS_SPECS.md)
- [ARC-APP Compliance Report](./ARC-APP-COMPLIANCE.md)
````
