# Olam Dictionary Chrome Extension - Testing Guide

## 🆕 What's New in Version 1.2.0

This version includes smart UX improvements and bug fixes:

### ✨ New Features
- **Smart No-Results Message**: Shows current language settings when no results found
- **Quick Settings Access**: Clickable link to open settings from no-results message
- **Zoom Support**: Popup automatically repositions when page is zoomed in/out
- **Enhanced UX**: Helps users understand why searches fail due to language mismatches

### � Bug Fixes
- Fixed duplicate importScripts causing service worker registration failure
- Fixed detectLanguage function reference bug in content script
- Fixed content script injection for context menu on pages without pre-loaded scripts
- Removed unused variables (scrollX, scrollY) for code clarity

### ♻️ Code Improvements
- Extracted CONTENT_SCRIPT_FILES constant for single source of truth
- Updated Chrome API mocks to match real API structure
- Code review improvements implemented
- **105 comprehensive tests** (expanded from 100)

### � Documentation Updates
- Updated all documentation to reflect new features
- Fixed README references and made version-agnostic
- Added corner case documentation for zoom and language settings
- Improved error handling

### 📋 New Testing Sections
This checklist now includes:
- **Part 7C:** Wrong language setting handling
- **Part 8:** Zoom support testing (new in v1.2.0)
- **Part 11:** Automated test suite validation (105 tests)
- **Part 12:** Code quality and refactoring validation
- Updated no-results message testing with language settings

---

## 📦 For First-Time Users

Welcome! This guide will help you install and test the Olam Dictionary Chrome Extension. This extension allows you to look up English-Malayalam dictionary definitions by simply double-clicking words on any webpage.

---

## 🚀 Installation Instructions

### Prerequisites
- **Google Chrome** or **Microsoft Edge** (Chromium-based) browser
- The extension files (extracted from the ZIP file)

### Step 1: Extract the Files
1. Locate the downloaded ZIP file (e.g., `olam-dictionary-extension.zip`)
2. Right-click the ZIP file → Select "Extract All..." or "Extract Here"
3. Remember the location where files are extracted (e.g., `Downloads\olam-dictionary-extension\`)

### Step 2: Enable Developer Mode in Chrome

1. Open **Google Chrome**
2. Type `chrome://extensions/` in the address bar and press Enter
3. Look for the **"Developer mode"** toggle in the top-right corner
4. Click to **turn ON** Developer mode
   - You should now see additional buttons appear: "Load unpacked", "Pack extension", "Update"

### Step 3: Load the Extension

1. Click the **"Load unpacked"** button (top-left area)
2. A file browser window will open
3. Navigate to the folder where you extracted the extension files
4. Select the **folder containing `manifest.json`** (the main extension folder)
5. Click **"Select Folder"** (or "Open" on Mac)

### Step 4: Verify Installation

✅ **Success indicators:**
- The extension appears in your extensions list with the Olam Dictionary icon
- Extension version shows: **1.2.0**
- No error messages are displayed
- The extension is enabled (toggle switch is blue/on)

### Step 5: Pin the Extension (Optional but Recommended)

1. Click the **puzzle piece icon** (🧩) in Chrome's toolbar (top-right)
2. Find "Olam Dictionary" in the list
3. Click the **pin icon** (📌) next to it
4. The Olam Dictionary icon now appears directly in your toolbar

---

## 🧪 Testing Checklist

### Part 1: Basic Double-Click Search (English Words)

**Test Environment:**
- Visit any English website (e.g., https://en.wikipedia.org or https://www.bbc.com/news)

**Steps:**
- [x] 1. Double-click on any English word (e.g., "dictionary", "search", "article")
- [x] 2. A popup window appears near your cursor
- [x] 3. The popup shows:
  - "Olam Dictionary" header with icon
  - Malayalam translation(s)
  - Word type (noun, verb, etc.)
  - "View full details →" link
- [x] 4. Verify the Malayalam text displays correctly (not squares/gibberish)

**Expected Result:** ✅ Popup appears within 1 second with accurate Malayalam translations

---

### Part 2: Malayalam Word Search

**Test Environment:**
- Visit a Malayalam news website (e.g., https://www.manoramaonline.com)

**Steps:**
- [x] 1. Double-click on a Malayalam word
- [x] 2. Popup appears near the cursor
- [x] 3. English translation(s) are displayed
- [x] 4. The search completes successfully

**Expected Result:** ✅ Malayalam words can be searched and display English meanings

---

### Part 3: Context Menu Search

**Steps:**
- [x] 1. On any webpage, **select** a word by clicking and dragging (don't double-click)
- [x] 2. **Right-click** on the selected word
- [x] 3. Choose **"Search [word] in Olam Dictionary"** from the context menu
- [x] 4. Popup appears near the selected text with results
- [x] 5. No loading spinner appears (results show immediately or within 1 second)

**Expected Result:** ✅ Context menu search works for both English and Malayalam words

---

### Part 4: Popup Behavior

#### 4A: Dragging the Popup
- [x] 1. Open a search result (double-click any word)
- [x] 2. Move your mouse over the **blue header bar** (where it says "Olam Dictionary")
- [x] 3. Notice the cursor changes to a "move" icon (hand/arrows)
- [x] 4. Click and **drag** the header to move the popup to a different location
- [x] 5. The popup follows your mouse and repositions smoothly

**Expected Result:** ✅ Popup can be dragged to any position on the screen

#### 4B: Closing the Popup

Test all three methods:
- [x] 1. Click the **× button** (top-right of popup) → popup closes
- [x] 2. Press the **Escape key** on your keyboard → popup closes
- [x] 3. Click **anywhere outside the popup** → popup closes

**Expected Result:** ✅ All three methods successfully close the popup

#### 4C: Smart Positioning
- [x] 1. Double-click a word near the **right edge** of the browser window
- [x] 2. Popup appears but stays within the visible area (doesn't get cut off)
- [x] 3. Double-click a word near the **bottom edge**
- [x] 4. Popup appears above the word instead of below
- [x] 5. Popup never goes off-screen

**Expected Result:** ✅ Popup intelligently adjusts position to stay visible

---

### Part 5: Navigation & Filtering

**Test with a word that has multiple meanings (e.g., "run", "set", "play"):**

#### 5A: Multiple Entries
- [x] 1. Search a word with multiple dictionary entries
- [x] 2. Navigation controls appear: **‹ 1/3 ›** (arrows and counter)
- [x] 3. Click the **› button** (next) → shows entry 2/3
- [x] 4. Click the **‹ button** (previous) → shows entry 1/3
- [x] 5. Counter updates correctly with each click
- [x] 6. Buttons are disabled when at first/last entry

**Expected Result:** ✅ Can navigate between multiple dictionary entries

#### 5B: Source Filtering
- [x] 1. Search a word with multiple sources (look for filter buttons below the word)
- [x] 2. You see buttons: "All Sources", "E. K. Kurup", "Crowd Sourced"
- [x] 3. Click **"E. K. Kurup"** → shows only entries from that source
- [x] 4. Counter updates (e.g., from 1/5 to 1/2)
- [x] 5. Active filter has a blue background
- [x] 6. Click **"All Sources"** → shows all entries again

**Expected Result:** ✅ Can filter results by source dictionary

---

### Part 6: Settings Configuration

#### 6A: Opening Settings
- [x] 1. Open any search result
- [x] 2. Click the **⚙ (gear) icon** in the popup header
- [x] 3. A new tab opens with "Olam Dictionary Settings"
- [x] 4. Page displays all available settings

**Expected Result:** ✅ Settings page opens in a new tab

#### 6B: Double-Click Toggle
- [x] 1. In Settings, find "Double-click opens dictionary"
- [x] 2. Toggle it **OFF** (switch turns gray)
- [x] 3. Go to any webpage and try double-clicking a word
- [x] 4. Nothing happens (popup doesn't open)
- [x] 5. Toggle it back **ON**
- [x] 6. Double-click a word → popup opens

**Expected Result:** ✅ Double-click can be disabled and re-enabled

#### 6C: Language Preferences
- [x] 1. In Settings, find "Language Preferences"
- [x] 2. **Search from:** dropdown shows "Auto-detect" (default)
- [x] 3. Change it to "Malayalam"
- [ ] 4. **Translate to:** change to "English"
- [x] 5. Settings save automatically (green "Settings saved!" message appears)
- [x] 6. Use context menu (right-click) to search a Malayalam word
- [x] 7. Results use the selected language preferences

**Note:** Double-click search always auto-detects language regardless of this setting.

**Expected Result:** ✅ Language preferences work for context menu searches

#### 6D: Result Limit
- [x] 1. In Settings, find "Number of words to display"
- [x] 2. Default is **"3 words"**
- [x] 3. Change to **"5 words"** → Settings save
- [x] 4. Search a word with many translations
- [x] 5. Verify 5 words are shown (instead of 3)
- [x] 6. Change to **"All words"**
- [x] 7. A warning message appears: "⚠️ Showing all words may make the popup very large"
- [x] 8. Search a word → all available translations are displayed

**Expected Result:** ✅ Result limit setting controls how many words are shown

---

### Part 7: Special Features

#### 7A: View Full Details Link
- [x] 1. Open any search result
- [ ] 2. Click the **"View full details →"** link at the bottom
- [x] 3. Opens https://olam.in website in a new tab
- [x] 4. Shows the complete dictionary entry with all details

**Expected Result:** ✅ Link opens the full dictionary page on Olam.in

#### 7B: No Results Handling
- [x] 1. Search a nonsense word (e.g., "xyzabc123")
- [x] 2. Popup shows "No results found" message
- [x] 3. Message displays "Your current language setting:"
- [x] 4. Shows "Source: [Language]" and "Target: [Language]"
- [x] 5. Shows clickable link "⚙️ Click here to change settings"
- [x] 6. Click the settings link
- [x] 7. Options page opens in new tab
- [x] 8. Popup closes automatically

**Expected Result:** ✅ Gracefully handles words not in dictionary with helpful language settings reminder

#### 7C: Wrong Language Setting
- [x] 1. Open options page (⚙️ icon in popup or extension settings)
- [x] 2. Set "Source Language" to "Malayalam"
- [x] 3. Save settings
- [x] 4. Search an English word (e.g., "hello")
- [x] 5. No results message shows "Source: Malayalam"
- [x] 6. User can immediately see why search failed
- [x] 7. Click settings link to change language

**Expected Result:** ✅ User understands language mismatch and can quickly fix it

---

### Part 8: Zoom Support

**Test Environment:**
- Visit any website with text content

#### 8A: Popup Position on Zoom
- [x] 1. Double-click a word to show popup
- [x] 2. Press Ctrl/Cmd + to zoom in (150%)
- [x] 3. Popup repositions automatically
- [x] 4. Popup stays within viewport bounds
- [x] 5. Press Ctrl/Cmd - to zoom out (75%)
- [x] 6. Popup repositions again
- [x] 7. Title bar remains visible
- [x] 8. All popup content accessible

**Expected Result:** ✅ Popup adapts to zoom level changes automatically

#### 8B: Zoom Before Search
- [x] 1. Zoom page to 200% (Ctrl/Cmd +)
- [x] 2. Double-click a word
- [x] 3. Popup appears at correct position
- [x] 4. Popup doesn't go off-screen
- [x] 5. Reset zoom to 100% (Ctrl/Cmd 0)

**Expected Result:** ✅ Popup positioning accounts for page zoom level

---

### Part 9: Page Layout Protection

**Test Environment:**
- Visit any website with text content

**Steps:**
- [x] 1. Note the current page layout (content position)
- [x] 2. Double-click a word to open the popup
- [x] 3. Check if the page content shifted or shrank
- [x] 4. Page content should remain in the same position
- [x] 5. Scroll the page up and down
- [x] 6. Popup position stays fixed relative to the viewport (doesn't scroll with page)

**Expected Result:** ✅ Page layout is not affected by the popup

---

### Part 10: Performance & Reliability

#### 9A: Speed Test
- [x] 1. Double-click a word → results appear within **1 second**
- [x] 2. Navigate between entries → switching is **instant** (no delay)
- [x] 3. Switch filters → results update **instantly**
- [x] 4. Open and close popup 10 times → consistent fast performance

**Expected Result:** ✅ Extension is fast and responsive

#### 9B: Console Errors Check
- [x] 1. Press **F12** to open Chrome DevTools
- [x] 2. Go to the **Console** tab
- [x] 3. Perform several searches (double-click, context menu)
- [x] 4. Check console for red error messages
- [x] 5. Only informational messages (if any) should appear

**Expected Result:** ✅ No JavaScript errors in console

---

### Part 11: Automated Test Suite (For Developers)

**Prerequisites:**
- Node.js installed (version 14 or higher)
- npm (comes with Node.js)

#### 10A: Initial Setup
- [x] 1. Open a terminal/command prompt in the extension folder
- [x] 2. Run `npm install` → Dependencies install successfully
- [x] 3. No error messages during installation
- [x] 4. Check that `node_modules` folder is created

**Expected Result:** ✅ Dependencies install without errors
#### 10B: Run Test Suite
- [x] 1. In terminal, run `npm test`
- [x] 2. Jest starts and runs all test suites
- [x] 3. Test results show:
  - **Test Suites:** 7 passed, 7 total
  - **Tests:** 100 passed, 100 total
  - No failed or skipped tests
- [x] 4. All tests complete in under 5 seconds
- [x] 5. No red error messages appear

**Expected Result:** ✅ All 100 tests pass successfully

#### 10C: Individual Test Suites
Verify each test suite passes:
- [x] **AppState Tests** (16 tests) - State management, configuration
- [x] **API Service Tests** (11 tests) - Content script API, language detection
- [x] **OlamAPI Tests** (17 tests) - Background API, caching, error handling
- [x] **Settings Service Tests** (7 tests) - Chrome storage, defaults
- [x] **URL Builder Tests** (19 tests) - URL construction, encoding
- [x] **Constants Tests** (27 tests) - Configuration values, exports
- [x] **Integration Tests** (3 tests) - End-to-end search flow

**Expected Result:** ✅ Each test suite passes independently

#### 10D: Test Watch Mode (Optional)
- [x] 1. Run `npm run test:watch`
- [x] 2. Jest starts in watch mode
- [x] 3. Make a small change to any `.js` file
- [x] 4. Tests automatically re-run
- [x] 5. Press `q` to quit watch mode

**Expected Result:** ✅ Watch mode detects changes and re-runs tests

#### 10E: Test Coverage (Optional)
- [x] 1. Run `npm run test:coverage`
- [x] 2. Coverage report is generated
- [x] 3. Shows coverage percentages for each file
- [x] 4. HTML report is created in `coverage/` folder
- [x] 5. Open `coverage/lcov-report/index.html` in browser

**Expected Result:** ✅ Coverage report shows comprehensive test coverage

---

### Part 12: Code Quality & Refactoring Validation

This section validates that the recent code refactoring maintains functionality.

#### 11A: Language Detection Utility
- [x] 1. Search an **English word** (e.g., "hello")
- [-] 2. Check browser console (F12) - should log detected language: "english"
- [x] 3. Search a **Malayalam word** (e.g., "നമസ്കാരം")
- [-] 4. Console should log detected language: "malayalam"
- [x] 5. Search **mixed text** (e.g., "hello മലയാളം")
- [-] 6. Should detect as "malayalam" (Malayalam takes priority)

**Expected Result:** ✅ Language detection works correctly for all word types

#### 11B: URL Construction
- [x] 1. Open browser DevTools (F12) → **Network** tab
- [x] 2. Search a word (e.g., "book")
- [x] 3. Check the Network tab for API request
- [x] 4. Verify URL format: `https://olam.in/api/dictionary/english/malayalam/book`
- [x] 5. Search a word with **spaces** (e.g., "hello world")
- [x] 6. Verify URL encodes spaces: `hello%20world`
- [x] 7. Search a word with **special characters** (e.g., "test&query")
- [x] 8. Verify special chars are encoded: `test%26query`

**Expected Result:** ✅ URLs are correctly constructed with proper encoding

#### 11C: Constants Configuration
- [x] 1. Open browser console (F12)
- [x] 2. Type: `API_BASE_URL` and press Enter
- [x] 3. Should output: `"https://olam.in/api/dictionary"`
- [x] 4. Type: `DICTIONARY_BASE_URL` and press Enter
- [x] 5. Should output: `"https://olam.in/dictionary"`
- [x] 6. Type: `DEFAULT_TO_LANG` and press Enter
- [x] 7. Should output: `"malayalam"`

**Expected Result:** ✅ Constants are globally available and correctly set

#### 11D: Shared Utilities Integration
- [x] 1. Search multiple words in succession (at least 5)
- [x] 2. Use both double-click and context menu methods
- [x] 3. Check console for any "undefined" errors
- [x] 4. Verify all searches work without issues
- [x] 5. Open Settings → change language preferences
- [x] 6. Perform searches with new settings
- [x] 7. Everything continues working smoothly

**Expected Result:** ✅ All shared utilities work seamlessly across components

#### 11E: Service Worker (Background Script)
- [x] 1. Go to `chrome://extensions/`
- [x] 2. Find Olam Dictionary extension
- [x] 3. Click **"service worker"** link (or **"Inspect views"** → **"background page"**)
- [x] 4. Console window opens for background script
- [x] 5. Perform a search on any webpage
- [x] 6. Background console shows API request logs
- [x] 7. No errors appear (red text)
- [x] 8. Verify functions are defined: Type `buildApiUrl` → should show function code

**Expected Result:** ✅ Background service worker runs without errors

---

### Part 13: Cross-Browser Testing (Optional)

If you have Microsoft Edge:
- [x] 1. Open **Microsoft Edge** browser
- [x] 2. Go to `edge://extensions/`
- [x] 3. Follow the same installation steps as Chrome
- [x] 4. Repeat key tests (double-click, context menu, settings)
- [x] 5. Verify everything works the same

**Expected Result:** ✅ Extension works identically in Edge

---

## 📊 Test Results Form

**Date Tested:** _______________________

**Tester Name:** _______________________

**Browser:** Chrome _____ / Edge _____

**Browser Version:** _______________________

**Operating System:** Windows _____ / Mac _____ / Linux _____

**Extension Version:** 1.2.0

---

### Test Summary

| Test Category | Status | Notes |
|--------------|--------|-------|
| English Double-Click Search | ✅ Pass ☐ Fail | |
| Malayalam Double-Click Search | ✅ Pass ☐ Fail | |
| Context Menu Search | ✅ Pass ☐ Fail | |
| Popup Dragging | ✅ Pass ☐ Fail | |
| Popup Closing (3 methods) | ✅ Pass ☐ Fail | |
| Smart Positioning | ✅ Pass ☐ Fail | |
| Entry Navigation | ✅ Pass ☐ Fail | |
| Source Filtering | ✅ Pass ☐ Fail | |
| Settings - Double-Click Toggle | ✅ Pass ☐ Fail | |
| Settings - Language Preferences | ✅ Pass ☐ Fail | |
| Settings - Result Limit | ✅ Pass ☐ Fail | |
| Full Details Link | ✅ Pass ☐ Fail | |
| No Results Handling | ✅ Pass ☐ Fail | |
| Page Layout Protection | ✅ Pass ☐ Fail | |
| Performance (Speed) | ✅ Pass ☐ Fail | |
| No Console Errors | ✅ Pass ☐ Fail | |
| **Automated Tests (Developers)** | ✅ Pass ☐ Fail ☐ N/A | |
| Test Suite Execution | ✅ Pass ☐ Fail ☐ N/A | |
| All 100 Tests Pass | ✅ Pass ☐ Fail ☐ N/A | |
| **Code Quality Validation** | ✅ Pass ☐ Fail | |
| Language Detection | ✅ Pass ☐ Fail | |
| URL Construction | ✅ Pass ☐ Fail | |
| Constants Available | ✅ Pass ☐ Fail | |
| Shared Utilities Integration | ✅ Pass ☐ Fail | |
| Service Worker Functions | ✅ Pass ☐ Fail | |

**Total Manual Tests:** _____ / 16
**Total Developer Tests:** _____ / 8 (or mark N/A if not applicable)
**Total Code Quality Tests:** _____ / 5
**Overall Total:** _____ / 29 tests

**Total Tests Completed:** _____ / 16

---

### Issues Found

**Issue #1:**
- **Severity:** ☐ Critical ☐ Major ☐ Minor
- **Description:** _________________________________________________
- **Steps to Reproduce:** _________________________________________
- **Expected Behavior:** __________________________________________
- **Actual Behavior:** ____________________________________________

**Issue #2:**
- **Severity:** ☐ Critical ☐ Major ☐ Minor
- **Description:** _________________________________________________
- **Steps to Reproduce:** _________________________________________

**Issue #3:**
- **Severity:** ☐ Critical ☐ Major ☐ Minor
- **Description:** _________________________________________________

---

### Overall Assessment

**Final Result:** ☐ PASS ☐ FAIL ☐ PASS WITH MINOR ISSUES

**Overall Experience Rating:**
☐ Excellent ☐ Good ☐ Fair ☐ Poor

**Comments:**
________________________________________________________________
________________________________________________________________
________________________________________________________________
________________________________________________________________

**Would you recommend this extension?** ☐ Yes ☐ No

**Why or why not?**
________________________________________________________________
________________________________________________________________

---

## 🆘 Troubleshooting

### Problem: Extension won't load
**Solution:**
1. Make sure all files are extracted from the ZIP
2. Select the folder containing `manifest.json`, not a subfolder
3. Ensure Developer Mode is enabled
4. Try refreshing the extensions page (click the refresh icon)

### Problem: "File is missing" error
**Solution:**
- Re-extract the ZIP file completely
- Make sure no files were blocked by antivirus
- Check that `manifest.json`, `content.js`, and `background.js` exist
- Verify `utils/` folder exists with: `detectLanguage.js`, `constants.js`, `urlBuilder.js`

### Problem: Popup doesn't appear
**Solution:**
1. Check if double-click is enabled in Settings
2. Refresh the webpage (F5) after installing the extension
3. Check browser console (F12) for errors
4. Make sure the extension is enabled (chrome://extensions/)
5. Verify service worker is running (click "service worker" link in chrome://extensions/)

### Problem: "buildApiUrl is not defined" or similar errors
**Solution:**
1. Verify all utility files are loaded correctly
2. Check `chrome://extensions/` → Click "service worker" → Look for import errors
3. Make sure `utils/urlBuilder.js`, `utils/constants.js`, and `utils/detectLanguage.js` exist
4. Reload the extension (click refresh icon in chrome://extensions/)

### Problem: Automated tests fail
**Solution:**
1. Run `npm install` again to ensure all dependencies are installed
2. Delete `node_modules` folder and `package-lock.json`, then run `npm install` again
3. Check Node.js version: `node --version` (should be 14+)
4. Clear Jest cache: `npm test -- --clearCache`
5. Check for file permission issues

### Problem: Malayalam text shows as squares
**Solution:**
- Your system needs Malayalam fonts installed
- Windows: Install "Malayalam fonts" from Windows Settings → Time & Language → Language
- Mac: Malayalam is supported by default

### Problem: Can't find context menu option
**Solution:**
1. You must **select** text first (click and drag to highlight)
2. Then right-click on the highlighted text
3. Look for "Search [word] in Olam Dictionary" in the menu

---

## 📧 Feedback & Support

If you encounter issues or have suggestions:
1. Note down the exact steps that caused the problem
2. Take a screenshot if possible
3. Check the browser console for error messages (F12 → Console tab)
4. Report with details: browser version, OS, and what you were trying to do

---

## ✨ Quick Reference Card

**Double-Click Search:**
- Double-click any word → popup appears

**Context Menu Search:**
- Select word → right-click → "Search in Olam Dictionary"

**Move Popup:**
- Drag the blue header bar

**Close Popup:**
- Click × button OR press Escape OR click outside

**Open Settings:**
- Click ⚙ gear icon in popup

**Navigate Entries:**
- Use ‹ and › buttons when multiple entries exist

**Filter by Source:**
- Click "E. K. Kurup" or "Crowd Sourced" buttons

---

**Thank you for testing the Olam Dictionary Extension!** 🎉

