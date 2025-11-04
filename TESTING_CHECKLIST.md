# Olam Dictionary Chrome Extension - Testing Guide

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
- Extension version shows: **1.1.0**
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
- [ ] 1. Double-click on any English word (e.g., "dictionary", "search", "article")
- [ ] 2. A popup window appears near your cursor
- [ ] 3. The popup shows:
  - "Olam Dictionary" header with icon
  - Malayalam translation(s)
  - Word type (noun, verb, etc.)
  - "View full details →" link
- [ ] 4. Verify the Malayalam text displays correctly (not squares/gibberish)

**Expected Result:** ✅ Popup appears within 1 second with accurate Malayalam translations

---

### Part 2: Malayalam Word Search

**Test Environment:**
- Visit a Malayalam news website (e.g., https://www.manoramaonline.com)

**Steps:**
- [ ] 1. Double-click on a Malayalam word
- [ ] 2. Popup appears near the cursor
- [ ] 3. English translation(s) are displayed
- [ ] 4. The search completes successfully

**Expected Result:** ✅ Malayalam words can be searched and display English meanings

---

### Part 3: Context Menu Search

**Steps:**
- [ ] 1. On any webpage, **select** a word by clicking and dragging (don't double-click)
- [ ] 2. **Right-click** on the selected word
- [ ] 3. Choose **"Search [word] in Olam Dictionary"** from the context menu
- [ ] 4. Popup appears near the selected text with results
- [ ] 5. No loading spinner appears (results show immediately or within 1 second)

**Expected Result:** ✅ Context menu search works for both English and Malayalam words

---

### Part 4: Popup Behavior

#### 4A: Dragging the Popup
- [ ] 1. Open a search result (double-click any word)
- [ ] 2. Move your mouse over the **blue header bar** (where it says "Olam Dictionary")
- [ ] 3. Notice the cursor changes to a "move" icon (hand/arrows)
- [ ] 4. Click and **drag** the header to move the popup to a different location
- [ ] 5. The popup follows your mouse and repositions smoothly

**Expected Result:** ✅ Popup can be dragged to any position on the screen

#### 4B: Closing the Popup

Test all three methods:
- [ ] 1. Click the **× button** (top-right of popup) → popup closes
- [ ] 2. Press the **Escape key** on your keyboard → popup closes
- [ ] 3. Click **anywhere outside the popup** → popup closes

**Expected Result:** ✅ All three methods successfully close the popup

#### 4C: Smart Positioning
- [ ] 1. Double-click a word near the **right edge** of the browser window
- [ ] 2. Popup appears but stays within the visible area (doesn't get cut off)
- [ ] 3. Double-click a word near the **bottom edge**
- [ ] 4. Popup appears above the word instead of below
- [ ] 5. Popup never goes off-screen

**Expected Result:** ✅ Popup intelligently adjusts position to stay visible

---

### Part 5: Navigation & Filtering

**Test with a word that has multiple meanings (e.g., "run", "set", "play"):**

#### 5A: Multiple Entries
- [ ] 1. Search a word with multiple dictionary entries
- [ ] 2. Navigation controls appear: **‹ 1/3 ›** (arrows and counter)
- [ ] 3. Click the **› button** (next) → shows entry 2/3
- [ ] 4. Click the **‹ button** (previous) → shows entry 1/3
- [ ] 5. Counter updates correctly with each click
- [ ] 6. Buttons are disabled when at first/last entry

**Expected Result:** ✅ Can navigate between multiple dictionary entries

#### 5B: Source Filtering
- [ ] 1. Search a word with multiple sources (look for filter buttons below the word)
- [ ] 2. You see buttons: "All Sources", "E. K. Kurup", "Crowd Sourced"
- [ ] 3. Click **"E. K. Kurup"** → shows only entries from that source
- [ ] 4. Counter updates (e.g., from 1/5 to 1/2)
- [ ] 5. Active filter has a blue background
- [ ] 6. Click **"All Sources"** → shows all entries again

**Expected Result:** ✅ Can filter results by source dictionary

---

### Part 6: Settings Configuration

#### 6A: Opening Settings
- [ ] 1. Open any search result
- [ ] 2. Click the **⚙ (gear) icon** in the popup header
- [ ] 3. A new tab opens with "Olam Dictionary Settings"
- [ ] 4. Page displays all available settings

**Expected Result:** ✅ Settings page opens in a new tab

#### 6B: Double-Click Toggle
- [ ] 1. In Settings, find "Double-click opens dictionary"
- [ ] 2. Toggle it **OFF** (switch turns gray)
- [ ] 3. Go to any webpage and try double-clicking a word
- [ ] 4. Nothing happens (popup doesn't open)
- [ ] 5. Toggle it back **ON**
- [ ] 6. Double-click a word → popup opens

**Expected Result:** ✅ Double-click can be disabled and re-enabled

#### 6C: Language Preferences
- [ ] 1. In Settings, find "Language Preferences"
- [ ] 2. **Search from:** dropdown shows "Auto-detect" (default)
- [ ] 3. Change it to "Malayalam"
- [ ] 4. **Translate to:** change to "English"
- [ ] 5. Settings save automatically (green "Settings saved!" message appears)
- [ ] 6. Use context menu (right-click) to search a Malayalam word
- [ ] 7. Results use the selected language preferences

**Note:** Double-click search always auto-detects language regardless of this setting.

**Expected Result:** ✅ Language preferences work for context menu searches

#### 6D: Result Limit
- [ ] 1. In Settings, find "Number of words to display"
- [ ] 2. Default is **"3 words"**
- [ ] 3. Change to **"5 words"** → Settings save
- [ ] 4. Search a word with many translations
- [ ] 5. Verify 5 words are shown (instead of 3)
- [ ] 6. Change to **"All words"**
- [ ] 7. A warning message appears: "⚠️ Showing all words may make the popup very large"
- [ ] 8. Search a word → all available translations are displayed

**Expected Result:** ✅ Result limit setting controls how many words are shown

---

### Part 7: Special Features

#### 7A: View Full Details Link
- [ ] 1. Open any search result
- [ ] 2. Click the **"View full details →"** link at the bottom
- [ ] 3. Opens https://olam.in website in a new tab
- [ ] 4. Shows the complete dictionary entry with all details

**Expected Result:** ✅ Link opens the full dictionary page on Olam.in

#### 7B: No Results Handling
- [ ] 1. Search a nonsense word (e.g., "xyzabc123")
- [ ] 2. Popup shows "No results found" message
- [ ] 3. No navigation controls appear

**Expected Result:** ✅ Gracefully handles words not in the dictionary

---

### Part 8: Page Layout Protection

**Test Environment:**
- Visit any website with text content

**Steps:**
- [ ] 1. Note the current page layout (content position)
- [ ] 2. Double-click a word to open the popup
- [ ] 3. Check if the page content shifted or shrank
- [ ] 4. Page content should remain in the same position
- [ ] 5. Scroll the page up and down
- [ ] 6. Popup position stays fixed relative to the viewport (doesn't scroll with page)

**Expected Result:** ✅ Page layout is not affected by the popup

---

### Part 9: Performance & Reliability

#### 9A: Speed Test
- [ ] 1. Double-click a word → results appear within **1 second**
- [ ] 2. Navigate between entries → switching is **instant** (no delay)
- [ ] 3. Switch filters → results update **instantly**
- [ ] 4. Open and close popup 10 times → consistent fast performance

**Expected Result:** ✅ Extension is fast and responsive

#### 9B: Console Errors Check
- [ ] 1. Press **F12** to open Chrome DevTools
- [ ] 2. Go to the **Console** tab
- [ ] 3. Perform several searches (double-click, context menu)
- [ ] 4. Check console for red error messages
- [ ] 5. Only informational messages (if any) should appear

**Expected Result:** ✅ No JavaScript errors in console

---

### Part 10: Cross-Browser Testing (Optional)

If you have Microsoft Edge:
- [ ] 1. Open **Microsoft Edge** browser
- [ ] 2. Go to `edge://extensions/`
- [ ] 3. Follow the same installation steps as Chrome
- [ ] 4. Repeat key tests (double-click, context menu, settings)
- [ ] 5. Verify everything works the same

**Expected Result:** ✅ Extension works identically in Edge

---

## 📊 Test Results Form

**Date Tested:** _______________________

**Tester Name:** _______________________

**Browser:** Chrome _____ / Edge _____

**Browser Version:** _______________________

**Operating System:** Windows _____ / Mac _____ / Linux _____

**Extension Version:** 1.1.0

---

### Test Summary

| Test Category | Status | Notes |
|--------------|--------|-------|
| English Double-Click Search | ☐ Pass ☐ Fail | |
| Malayalam Double-Click Search | ☐ Pass ☐ Fail | |
| Context Menu Search | ☐ Pass ☐ Fail | |
| Popup Dragging | ☐ Pass ☐ Fail | |
| Popup Closing (3 methods) | ☐ Pass ☐ Fail | |
| Smart Positioning | ☐ Pass ☐ Fail | |
| Entry Navigation | ☐ Pass ☐ Fail | |
| Source Filtering | ☐ Pass ☐ Fail | |
| Settings - Double-Click Toggle | ☐ Pass ☐ Fail | |
| Settings - Language Preferences | ☐ Pass ☐ Fail | |
| Settings - Result Limit | ☐ Pass ☐ Fail | |
| Full Details Link | ☐ Pass ☐ Fail | |
| No Results Handling | ☐ Pass ☐ Fail | |
| Page Layout Protection | ☐ Pass ☐ Fail | |
| Performance (Speed) | ☐ Pass ☐ Fail | |
| No Console Errors | ☐ Pass ☐ Fail | |

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

### Problem: Popup doesn't appear
**Solution:**
1. Check if double-click is enabled in Settings
2. Refresh the webpage (F5) after installing the extension
3. Check browser console (F12) for errors
4. Make sure the extension is enabled (chrome://extensions/)

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

