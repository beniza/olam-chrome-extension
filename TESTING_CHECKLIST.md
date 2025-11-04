# Testing Checklist for Refactored Olam Dictionary Extension

## Setup
1. Remove the extension from Chrome (chrome://extensions/)
2. Reload the extension from this branch folder
3. Verify version shows 1.1.0

## Basic Functionality Tests

### ✅ Double-Click Search
- [ ] Navigate to any English webpage (e.g., Wikipedia, CNN)
- [ ] Double-click on an English word
- [ ] Popup appears near the cursor
- [ ] Search results display correctly
- [ ] Malayalam translations are visible

### ✅ Context Menu Search
- [ ] Select an English word on any webpage
- [ ] Right-click → Select "Search [word] in Olam Dictionary"
- [ ] Popup appears near the selected text
- [ ] Search results display correctly
- [ ] No spinning loader (loading state should be hidden)

### ✅ Malayalam Search
- [ ] Visit a Malayalam news site (e.g., Manorama Online)
- [ ] Double-click on a Malayalam word
- [ ] Popup appears with results
- [ ] English translations are shown

## Popup Behavior Tests

### ✅ Positioning
- [ ] Popup appears near cursor/selection
- [ ] Popup doesn't go off-screen (right edge)
- [ ] Popup doesn't go off-screen (bottom edge)
- [ ] Popup positions above cursor if no space below

### ✅ Closing
- [ ] Click outside popup → popup closes
- [ ] Press Escape key → popup closes
- [ ] Click close button (×) → popup closes

### ✅ Settings Button
- [ ] Click gear icon (⚙) in popup header
- [ ] Options page opens in new tab
- [ ] Can change settings and save

## Results Display Tests

### ✅ Single Entry
- [ ] Search word with single result
- [ ] Navigation controls are hidden
- [ ] Word, meaning, and type display correctly

### ✅ Multiple Entries
- [ ] Search word with multiple results (e.g., "run")
- [ ] Navigation controls appear (‹ 1/3 ›)
- [ ] Click next button → shows next entry
- [ ] Click previous button → shows previous entry
- [ ] Counter updates correctly

### ✅ Source Filtering
- [ ] Search word with multiple sources
- [ ] "All Sources", "E. K. Kurup", "Crowd Sourced" buttons appear
- [ ] Click "E. K. Kurup" → shows only E.K. Kurup entries
- [ ] Counter updates (e.g., 1/2 instead of 1/5)
- [ ] Click "All Sources" → shows all entries again
- [ ] Active filter has blue background
- [ ] Inactive filters are grayed out

### ✅ Details Link
- [ ] Click "View full details →" link
- [ ] Opens Olam.in website in new tab
- [ ] Shows full dictionary entry

### ✅ No Results
- [ ] Search gibberish word (e.g., "xyzabc")
- [ ] "No results found" message displays
- [ ] No navigation controls shown

## Settings Tests

### ✅ Double-Click Toggle
- [ ] Open extension options page
- [ ] Disable "Enable double-click to search"
- [ ] Save settings
- [ ] Go to any webpage
- [ ] Double-click a word → nothing happens
- [ ] Re-enable the setting
- [ ] Double-click a word → popup appears

### ✅ Language Preferences
- [ ] Open extension options
- [ ] Change "From Language" to Malayalam
- [ ] Change "To Language" to English
- [ ] Save settings
- [ ] Right-click search should use these preferences
- [ ] Note: Double-click still auto-detects language

## Error Handling Tests

### ✅ Extension Reload
- [ ] Open popup on a page
- [ ] Reload extension in chrome://extensions/
- [ ] Try to search again
- [ ] Should show error message about reloading page

### ✅ Network Errors
- [ ] Disconnect internet
- [ ] Try to search a word
- [ ] Should show error message
- [ ] Reconnect internet
- [ ] Search works again

## Layout Protection Tests

### ✅ Page Layout
- [ ] Visit Manorama Online article
- [ ] Trigger popup search
- [ ] Page content should NOT shrink to left
- [ ] Page layout remains intact
- [ ] Scroll page → popup stays fixed in viewport

## Performance Tests

### ✅ Speed
- [ ] Double-click search → results appear quickly (<500ms)
- [ ] Context menu search → results appear quickly
- [ ] Navigation between entries → instant (no lag)
- [ ] Filter switching → instant

### ✅ Memory
- [ ] Open/close popup multiple times
- [ ] No console errors
- [ ] No memory leaks visible

## Console Tests

### ✅ No Errors
- [ ] Open DevTools Console (F12)
- [ ] Perform all above tests
- [ ] No JavaScript errors should appear
- [ ] Only informational logs (if any)

## Cross-Browser Tests (Optional)

### Chrome
- [ ] All tests pass on Chrome

### Edge (Chromium)
- [ ] All tests pass on Edge

## Final Verification

- [ ] All checkboxes above are checked ✅
- [ ] Extension works as expected
- [ ] No regressions from previous version
- [ ] Ready to merge to master branch

---

## Test Results Summary

**Date Tested:** _______________  
**Tested By:** _______________  
**Chrome Version:** _______________  
**Extension Version:** 1.1.0

**Total Tests:** 60+  
**Passed:** _____  
**Failed:** _____  
**Blocked:** _____

**Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Status:** ☐ PASS / ☐ FAIL / ☐ NEEDS FIXES

**Notes:**
_____________________________________________________
_____________________________________________________
_____________________________________________________
