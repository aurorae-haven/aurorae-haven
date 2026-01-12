# Manual Testing Guide: Schedule Page Button Implementation

## Overview
This guide provides step-by-step instructions for manually testing all button functionality on the Schedule page.

**Important Note:** The application uses **European date format (DD/MM/YYYY)** for all date displays. Internal storage uses ISO format (YYYY-MM-DD) for database compatibility.

## Prerequisites

### Setup
1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/aurorae-haven/aurorae-haven.git
   cd aurorae-haven
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000` (or the port shown in the terminal)

3. **Navigate to Schedule page:**
   - Open browser to `http://localhost:3000/aurorae-haven`
   - Click on "Schedule" in the navigation menu (or navigate to `http://localhost:3000/aurorae-haven/schedule`)

## Test Cases

### Test 1: Day View Button
**Purpose:** Verify the Day button is active by default and shows day schedule.

**Steps:**
1. Navigate to Schedule page
2. Observe the view mode buttons at the top

**Expected Results:**
- ✅ "Day" button has active styling (different background color)
- ✅ "Day" button has `aria-pressed="true"` attribute (check in browser dev tools)
- ✅ Current day's events are displayed (if any exist)
- ✅ Static demo blocks are visible (Morning Launch, Team Standup, Buy groceries)
- ✅ Date is displayed in European format: "Today · Tue 16/09/2025" (or current date in DD/MM/YYYY)

**Screenshot Location:** Check for visual active state on Day button

---

### Test 2: Week View Button
**Purpose:** Verify clicking Week button switches to week view.

**Steps:**
1. Navigate to Schedule page (should be in Day view by default)
2. Click the "Week" button
3. Observe the view change

**Expected Results:**
- ✅ "Week" button becomes active (gets active styling)
- ✅ "Week" button has `aria-pressed="true"` attribute
- ✅ "Day" button loses active styling
- ✅ "Day" button has `aria-pressed="false"` attribute
- ✅ Week's events are loaded (check browser console for network calls if using backend)
- ✅ No console errors appear

**How to Verify:**
- Open browser DevTools (F12)
- Go to Console tab
- Perform the test
- Check for no errors or warnings

---

### Test 3: Schedule Dropdown – Routine Option
**Purpose:** Verify selecting "Routine" from the Schedule dropdown opens the event creation modal.

**Steps:**
1. Navigate to Schedule page
2. Click the "Schedule" button to open the unified dropdown menu
3. In the dropdown, click the "Routine" option
4. Observe modal behavior

**Expected Results:**
- ✅ Modal appears with title "Add Routine"
- ✅ Modal contains form fields:
  - Title input (required)
  - Date input (required, HTML5 date picker)
  - Start Time input (required)
  - End Time input (required)
- ✅ Date picker shows dates in browser's locale format (typically DD/MM/YYYY for European locales)
- ✅ Modal has "Cancel" and "Create" buttons
- ✅ Modal can be closed by clicking Cancel
- ✅ Modal has proper keyboard navigation (Tab, Enter, Escape)
- ✅ All form fields have proper labels and aria-attributes
- ✅ Focus automatically moves to title input when modal opens

**Accessibility Check:**
- Press Tab key - focus should move through all interactive elements
- Press Escape key - modal should close
- Check that all inputs have associated labels
- Verify title input receives focus on modal open

---

### Test 4: Schedule Dropdown – Task Option
**Purpose:** Verify selecting "Task" from the Schedule dropdown opens the event creation modal for tasks.

**Steps:**
1. Navigate to Schedule page
2. Click the "Schedule" button to open the dropdown menu
3. From the dropdown, select "Task"
4. Observe modal behavior

**Expected Results:**
- ✅ Modal appears with title "Add Task"
- ✅ All form fields are present
- ✅ Modal functionality works as expected
- ✅ No console errors
- ✅ Title input auto-focused

---

### Test 5: Schedule Dropdown – Meeting Option
**Purpose:** Verify selecting "Meeting" from the Schedule dropdown opens the event creation modal for meetings.

**Steps:**
1. Navigate to Schedule page
2. Click the "Schedule" button
3. In the dropdown menu, select "Meeting"
4. Observe modal behavior

**Expected Results:**
- ✅ Modal appears with title "Add Meeting"
- ✅ All form fields are present
- ✅ Modal functionality works as expected
- ✅ No console errors
- ✅ Title input auto-focused

---

### Test 6: Event Creation - Valid Form
**Purpose:** Verify creating an event with valid data works correctly.

**Steps:**
1. Click the Schedule dropdown button and select any event type (Routine, Task, Meeting, or Habit)
2. Fill in the form:
   - Title: "Test Event"
   - Date: Select today's date
   - Start Time: "10:00"
   - End Time: "11:00"
3. Click "Create" button
4. Observe the results

**Expected Results:**
- ✅ Modal closes after submission
- ✅ No error messages appear
- ✅ New event appears on the schedule (if within 06:00-22:00 range)
- ✅ Event displays with correct title and time
- ✅ Event has unique styling based on type
- ✅ No console errors

**Note:** Events outside 06:00-22:00 won't be visible but should be saved.

---

### Test 7: Event Creation - Empty Title
**Purpose:** Verify validation prevents submission without a title.

**Steps:**
1. Click the Schedule dropdown button and select any event type
2. Leave Title field empty
3. Fill in date and times
4. Try to submit

**Expected Results:**
- ✅ HTML5 validation prevents form submission (required attribute)
- ✅ Browser shows native "Please fill out this field" message
- ✅ Modal remains open
- ✅ No event is created

---

### Test 8: Event Creation - Title Too Long
**Purpose:** Verify validation prevents titles over 200 characters.

**Steps:**
1. Click the Schedule dropdown button and select any event type
2. Enter a title with 201 characters (copy/paste: "A" × 201)
3. Fill in date and times
4. Click "Create"

**Expected Results:**
- ✅ Error message appears: "Title must be 200 characters or less"
- ✅ Form does not submit
- ✅ Modal remains open
- ✅ Error message is visible and properly styled

---

### Test 9: Event Creation - Invalid Time Range
**Purpose:** Verify validation prevents end time before start time.

**Steps:**
1. Click any "+ [Type]" button
2. Fill in:
   - Title: "Test"
   - Date: Today
   - Start Time: "15:00"
   - End Time: "14:00" (earlier than start)
3. Click "Create"

**Expected Results:**
- ✅ Error message appears: "End time must be after start time"
- ✅ Form does not submit
- ✅ Modal remains open
- ✅ Error message is red/styled appropriately

---

### Test 10: Error Notification Dismiss
**Purpose:** Verify error notifications can be dismissed.

**Steps:**
1. Trigger any error (e.g., disconnect internet if using backend)
2. Observe error notification in top-right corner
3. Click the X button on the notification

**Expected Results:**
- ✅ Error notification appears with error icon and message
- ✅ X button is visible on the right side
- ✅ Clicking X dismisses the notification
- ✅ Notification disappears smoothly
- ✅ Button has proper hover state

---

### Test 11: Loading State
**Purpose:** Verify loading indicator appears while fetching events.

**Steps:**
1. Open browser DevTools Network tab
2. Set network throttling to "Slow 3G" (optional)
3. Navigate to Schedule page or switch between Day/Week views
4. Observe loading behavior

**Expected Results:**
- ✅ Loading indicator appears (if load takes time)
- ✅ Loading message says "Loading schedule..."
- ✅ Loading state clears once data loads
- ✅ No content flash or layout shift

---

### Test 12: Dynamic vs Static Events
**Purpose:** Verify created events render alongside demo blocks.

**Steps:**
1. Create a new event (follow Test 6)
2. Observe the schedule display

**Expected Results:**
- ✅ New event appears on schedule
- ✅ Static demo blocks still visible
- ✅ No overlap or collision between events
- ✅ Events have unique keys (check in React DevTools)
- ✅ Dynamic events use `event-${id}` key prefix

---

### Test 13: Boundary Cases - Events Outside Schedule
**Purpose:** Verify events outside 06:00-22:00 are handled properly.

**Steps:**
1. Create event: Start "05:00", End "06:30"
2. Create event: Start "21:30", End "23:00"
3. Create event: Start "02:00", End "03:00"

**Expected Results:**
- ✅ Events completely outside range (02:00-03:00) don't render
- ✅ Events partially outside range are clamped to visible area
- ✅ No console errors
- ✅ No rendering glitches or overflow

---

### Test 14: Keyboard Navigation
**Purpose:** Verify all interactive elements are keyboard accessible.

**Steps:**
1. Navigate to Schedule page
2. Press Tab repeatedly
3. Test each interactive element with Enter/Space

**Expected Results:**
- ✅ Tab moves focus through all buttons in logical order
- ✅ Focus indicators are visible (outline or similar)
- ✅ Enter/Space activates buttons
- ✅ In modal, Tab moves through form fields
- ✅ Escape closes modal
- ✅ Interactive schedule blocks can receive focus and be activated with Enter/Space

---

### Test 15: Screen Reader Compatibility
**Purpose:** Verify ARIA labels are properly implemented.

**Steps:**
1. Enable screen reader (VoiceOver on Mac, NVDA/JAWS on Windows)
2. Navigate through Schedule page
3. Interact with buttons and forms

**Expected Results:**
- ✅ Day button announces: "View day schedule" and pressed state
- ✅ Week button announces: "View week schedule" and pressed state
- ✅ Add buttons announce: "Add [type] to schedule"
- ✅ Form fields announce their labels
- ✅ Error messages are announced
- ✅ Required fields are announced as required
- ✅ Interactive schedule blocks announce their type, title, and time

---

## Automated Test Verification

Run the test suite to verify all functionality:

```bash
# Run all tests
npm test

# Run only Schedule-related tests
npm test -- src/__tests__/Schedule.test.js src/__tests__/EventModal.test.js
```

**Expected Output:**
- ✅ 36/36 tests passing
- ✅ No test failures
- ✅ Test coverage meets requirements

---

## Common Issues & Troubleshooting

### Issue: Buttons don't respond to clicks
**Solution:** 
- Check browser console for JavaScript errors
- Verify `npm install` completed successfully
- Try clearing browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Modal doesn't open
**Solution:**
- Check console for errors
- Verify EventModal component is imported correctly
- Check if modal state is being updated

### Issue: Events don't appear after creation
**Solution:**
- Check if event time is within 06:00-22:00 range
- Verify event was saved (check browser DevTools Application > IndexedDB)
- Check console for errors during save operation

### Issue: Styling looks wrong
**Solution:**
- Ensure CSS files are loaded (check Network tab)
- Verify CSS custom properties are defined in base.css
- Check if `color-mix()` is supported in your browser (use Chrome/Firefox/Edge latest)

### Issue: Dates display in wrong format
**Solution:**
- The app uses European format (DD/MM/YYYY) for display
- HTML5 date inputs may show in browser's locale format
- Internal storage uses ISO format (YYYY-MM-DD)
- If you need to change format, update `timeUtils.js` functions

---

## Browser Compatibility Testing

Test in multiple browsers:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Note:** `color-mix()` CSS function requires modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+)

---

## Performance Checks

1. **Lighthouse Audit:**
   - Open DevTools > Lighthouse
   - Run audit on Schedule page
   - Check Performance, Accessibility, Best Practices scores

2. **Memory Leaks:**
   - Open DevTools > Performance Monitor
   - Navigate to Schedule page
   - Create several events
   - Switch between Day/Week views multiple times
   - Monitor memory usage (should remain stable)

---

## Reporting Issues

If you find any issues during manual testing:

1. Note the test case number
2. Document steps to reproduce
3. Include browser version and OS
4. Attach screenshots/console errors
5. Check if issue exists in both dev and production builds

---

## Success Criteria

All tests should pass with:
- ✅ No console errors or warnings
- ✅ All buttons functional and accessible
- ✅ Proper user feedback (loading, errors)
- ✅ Data persists correctly
- ✅ Keyboard navigation works
- ✅ Screen readers can use the interface
- ✅ Responsive design works on mobile
- ✅ No visual glitches or layout issues
- ✅ European date format displays correctly
- ✅ Interactive schedule blocks respond to clicks and keyboard events

---

## Manual Testing Results Log

Use this template to log your testing results:

| Test # | Test Name | Pass/Fail | Notes | Tester | Date |
|--------|-----------|-----------|-------|--------|------|
| 1 | Day View Button | | | | |
| 2 | Week View Button | | | | |
| 3 | Schedule Dropdown – Routine Option | | | | |
| 4 | Schedule Dropdown – Task Option | | | | |
| 5 | Schedule Dropdown – Meeting Option | | | | |
| 6 | Event Creation - Valid | | | | |
| 7 | Event Creation - Empty Title | | | | |
| 8 | Event Creation - Long Title | | | | |
| 9 | Event Creation - Invalid Time | | | | |
| 10 | Error Notification Dismiss | | | | |
| 11 | Loading State | | | | |
| 12 | Dynamic vs Static Events | | | | |
| 13 | Boundary Cases | | | | |
| 14 | Keyboard Navigation | | | | |
| 15 | Screen Reader | | | | |
