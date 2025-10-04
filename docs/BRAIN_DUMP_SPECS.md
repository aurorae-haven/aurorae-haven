# Brain Dump Specifications (TAB-BDP)

This document describes the implementation of Brain Dump specifications for My Stellar Trail.

## Overview

The Brain Dump feature provides a Markdown-based note-taking interface with advanced features for managing thoughts, ideas, and notes. All features are designed with neurodivergent users in mind, maintaining a calm interface while providing powerful functionality.

## Implemented Specifications

### TAB-BDP-FIL-01: File Management

**Requirement**: Brain Dump entries shall support local attachments stored in OPFS.

**Implementation**:

- Uses Origin Private File System (OPFS) for secure, private file storage
- Files are stored directly in the browser's private file system
- Supports attachment via file picker
- Files are referenced in the markdown content with size information
- Graceful fallback for browsers without OPFS support

**Usage**:

1. Click the "📎 Attach" button in the toolbar
2. Select a file from your device
3. File is stored in OPFS and reference is inserted into the editor
4. Format: `📎 Attachment: filename.ext (size KB)`

**Browser Support**: Chrome 86+, Edge 86+, Opera 72+ (OPFS-enabled browsers)

### TAB-BDP-BLK-01: Backlinks

**Requirement**: The Brain Dump tab shall provide backlinks and a backlinks panel.

**Implementation**:

- Wiki-style link syntax: `[[link text]]`
- Links are automatically converted to clickable elements in preview
- Backlinks panel shows all links in current document
- Visual styling distinguishes backlinks from regular links
- Keyboard accessible with proper ARIA labels

**Usage**:

1. Use `[[link text]]` syntax in your markdown
2. Links appear as clickable elements in preview
3. Click "🔗 Backlinks" button to view all links in current document
4. Links are styled with dashed underline and hover effects

**Example**:

```markdown
This relates to [[Project Alpha]] and [[Meeting Notes 2024-01]]
```

### TAB-BDP-VSH-01: Version History

**Requirement**: Brain Dump entries shall support version history with diffs and restore.

**Implementation**:

- Automatic version snapshots saved every 5 seconds of inactivity
- Stores last 50 versions in localStorage
- Version history panel shows all saved versions with timestamps
- Diff viewer displays line-by-line changes between versions
- One-click restore to any previous version
- Visual diff with color coding (green for additions, red for removals)

**Usage**:

1. Click "📜 History" button to open version history
2. View list of all saved versions with timestamps and previews
3. Click "View Diff" to see changes between selected version and current
4. Click "Restore" to revert to a previous version
5. Press Escape to close modals

**Keyboard Shortcuts**:

- `Ctrl/Cmd + H`: Open version history

**Storage**: Versions stored in `localStorage` key: `brainDumpVersions`

### TAB-BDP-SAN-01: Sanitisation

**Requirement**: The Markdown renderer shall enforce sanitisation rules and safe links.

**Implementation**:

- Enhanced DOMPurify configuration with strict allow-lists
- Only safe HTML tags and attributes permitted
- External links automatically open in new tab with `rel="noopener noreferrer"`
- JavaScript and data URIs blocked in links
- XSS prevention through sanitization hooks
- Safe handling of user-generated content

**Allowed Tags**:

- Headings: h1, h2, h3, h4, h5, h6
- Text: p, br, hr, strong, em, code, pre, blockquote
- Lists: ul, ol, li
- Links and media: a, img
- Tables: table, thead, tbody, tr, th, td
- Interactive: input (for checkboxes only)

**Forbidden**:

- Scripts: script, style, iframe, object, embed
- Event handlers: onerror, onload, onclick, onmouseover, etc.
- Unsafe URIs: javascript:, data: (in links)

**Link Safety**:

- External HTTP/HTTPS links: Open in new tab with security attributes
- Internal anchors (#): Safe, allowed
- Other protocols: Blocked

### TAB-BDP-ACC-01: Accessibility

**Requirement**: The Brain Dump editor and preview shall include accessibility enhancements.

**Implementation**:

#### Screen Reader Support

- Live region announcements for important state changes
- Descriptive ARIA labels on all interactive elements
- Screen reader-only text for context where needed
- Semantic HTML structure

#### Keyboard Navigation

- Full keyboard support for all features
- Focus management in modals
- Escape key closes modals
- Keyboard shortcuts for common actions

#### Focus Indicators

- Visible focus outlines on all focusable elements
- High contrast focus indicators
- Consistent focus styling across components

#### Semantic Structure

- Proper ARIA roles (dialog, status, article, textbox)
- Multi-line textbox for editor
- Article role for preview with live updates
- Status announcements for operations

#### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Export markdown
- `Ctrl/Cmd + H`: Open version history
- `Escape`: Close modals

#### Screen Reader Announcements

- "Preview updated" when content changes
- "Task marked complete/incomplete" for checkbox changes
- "File [name] attached" when file is attached
- "Version restored" when restoring from history
- "All content cleared" when clearing content
- "Markdown exported" when exporting

#### Accessibility Labels

- Editor: "Markdown editor for brain dump notes"
- Preview: "Markdown preview"
- Each checkbox: "Task checkbox [number]"
- Buttons: Descriptive labels for all toolbar buttons

## Technical Details

### File Structure

```
src/
├── braindump-enhanced.js     # Core functionality modules
│   ├── configureSanitization()
│   ├── VersionHistory class
│   ├── Backlinks class
│   ├── FileAttachments class
│   └── AccessibilityHelper class
├── braindump-ui.js           # UI integration and event handlers
└── assets/styles/
    └── brain_dump.css        # Styling for new features
```

### Storage Keys

- `brainDumpContent`: Current editor content
- `brainDumpTags`: Tag palette HTML
- `brainDumpVersions`: Version history array
- `brainDumpEntries`: Structured entries (future use)

### Browser Compatibility

- **Core Features**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **OPFS File Attachments**: Chrome 86+, Edge 86+, Opera 72+
- **Graceful Degradation**: Features degrade gracefully when not supported

### Security Considerations

- Content Security Policy (CSP) compliant
- No inline scripts or styles
- DOMPurify sanitization for all user content
- OPFS provides isolated storage
- Safe link handling prevents XSS
- External scripts loaded from CDN with HTTPS

## Testing Recommendations

### Manual Testing Checklist

- [ ] Create notes with various markdown syntax
- [ ] Test backlinks with `[[link]]` syntax
- [ ] Save and restore versions
- [ ] View diffs between versions
- [ ] Attach files (if OPFS supported)
- [ ] Test keyboard navigation
- [ ] Verify screen reader announcements
- [ ] Test with keyboard only (no mouse)
- [ ] Check focus indicators visibility
- [ ] Test modal escape key handling
- [ ] Verify external links open safely
- [ ] Test checkbox interaction
- [ ] Verify content sanitization

### Browser Testing

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Test with OPFS disabled (Firefox)

### Accessibility Testing

- Use screen reader (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Check color contrast ratios
- Verify focus order
- Test with high contrast mode

## Future Enhancements

Potential improvements for future versions:

1. Search across all brain dump entries
2. Tag-based filtering and organization
3. Export entire history as archive
4. Import/merge from multiple sources
5. Collaborative editing (if cloud sync added)
6. Rich media preview for attachments
7. Bi-directional backlinks (show where current note is referenced)
8. Auto-save to cloud backup (optional)

## Performance Notes

- Version history limited to 50 entries to manage localStorage size
- Debounced auto-save (5 seconds) reduces localStorage writes
- Efficient diff algorithm for version comparison
- Lazy loading of OPFS initialization
- Minimal DOM manipulation for performance

## Support and Feedback

For issues or feature requests related to Brain Dump specifications, please open an issue on the GitHub repository with the `brain-dump` label.
