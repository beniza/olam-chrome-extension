# Olam Dictionary Extension - Implementation Plan

## Architecture Overview

### File Structure and Purpose

```
chrome-plugin/
├── manifest.json          # Extension configuration and permissions
├── content.js            # Runs on webpages - handles UI and user interaction
├── background.js         # Service worker - handles API calls
├── popup.html            # Optional toolbar popup UI
├── popup.js              # Optional toolbar popup logic
├── options.html          # Settings page UI
├── options.js            # Settings page logic
├── styles.css            # All styling (inline popup + toolbar popup)
├── icons/                # Extension icons (16x16, 48x48, 128x128)
└── README.md             # Documentation
```

## Core Features

### 1. Double-Click Dictionary Lookup (PRIMARY FEATURE)
- **Trigger**: User double-clicks any word on any webpage
- **Behavior**: 
  - Browser automatically selects the word
  - Extension captures the selection
  - Displays inline popup near cursor
- **Settings**: Can be disabled in options page (default: enabled)

### 2. Inline Popup Display
- **Positioning**: Appears near cursor, auto-adjusts if off-screen
- **Content**:
  - Word being searched
  - Source filter tags (E.K. Kurup, Crowd Sourced, All Sources)
  - First 3 words of translation
  - Word type (noun, verb, etc.)
  - Link to full details on olam.in
- **Navigation**: Previous/Next buttons if multiple entries exist
- **Close**: X button, Escape key, or click outside

### 3. Multi-Entry Navigation
- **Display**: Shows "1/3", "2/3", etc. in header
- **Controls**: ◀️ ▶️ buttons to flip through entries
- **Visibility**: Only shown when multiple results exist

### 4. Source Filtering
- **Sources**:
  - **E.K. Kurup** (src:ekkurup) - Green background - Most reliable
  - **Crowd Sourced** (src:crowd) - Orange background
  - **All Sources** - Default view
- **Behavior**: Clicking a filter shows only entries from that source

### 5. Language Auto-Detection
- **Malayalam**: Unicode range U+0D00 to U+0D7F
- **English**: Everything else
- **API**: Calls appropriate endpoint based on detected language

## Technical Implementation

### Content Script (content.js)

**Responsibilities:**
- Listen for double-click events
- Create and manage inline popup DOM
- Handle popup positioning (with off-screen detection)
- Display dictionary results
- Manage navigation between entries
- Handle source filtering
- Load and respect user settings

**Key Functions:**
- `createPopup()` - Creates popup DOM (once per page)
- `showPopup(x, y)` - Positions and displays popup
- `hidePopup()` - Hides popup
- `searchInOlam(text, x, y)` - Initiates search via background script
- `displayResults(data, ...)` - Sets up result display
- `renderCurrentEntry()` - Renders active entry with filters
- `updateNavigation()` - Updates prev/next buttons

**Event Listeners:**
- `dblclick` - Main trigger for dictionary lookup
- `click` (on close button) - Hide popup
- `keydown` (Escape key) - Hide popup
- `click` (outside popup) - Hide popup

### Background Script (background.js)

**Responsibilities:**
- Make API calls to olam.in (avoids CORS issues)
- Create context menu option
- Store last search in Chrome storage

**API Endpoint:**
```
https://olam.in/api/dictionary/{from_lang}/{to_lang}/{word}
```

**Message Handlers:**
- `searchWord` - Fetches from API, returns data
- `getLastSearch` - Retrieves stored search from Chrome storage

### Settings (options.html/js)

**Settings:**
- `doubleClickEnabled` (boolean, default: true)

**Storage:**
- Uses `chrome.storage.sync` for cross-device sync
- Changes trigger live updates via `chrome.storage.onChanged`

## Known Issues FIXED

### Issue 1: Double-Click Text Selection
**Problem**: Old mouseup listener was preventing normal text selection
**Solution**: Removed mouseup listener entirely, only using double-click now
**Result**: Users can select text normally, double-click triggers dictionary

### Issue 2: Duplicate Code
**Problem**: Old code from previous attempts left in place
**Solution**: Complete rewrite of content.js with clean structure
**Result**: No duplicate functions or event listeners

### Issue 3: Screen Positioning
**Problem**: Popup positioning not working correctly
**Solution**: Verified positioning logic - uses absolute positioning with proper viewport bounds checking
**Status**: No issues found - positioning works correctly

## Data Flow

```
User Double-Clicks Word
    ↓
content.js: dblclick event handler
    ↓
content.js: Get selected text
    ↓
content.js: Detect language (Malayalam/English)
    ↓
content.js: Send message to background.js
    ↓
background.js: Fetch from olam.in API
    ↓
background.js: Return data to content.js
    ↓
content.js: displayResults()
    ↓
content.js: renderCurrentEntry()
    ↓
User sees popup with translation
```

## Styling

**Font**: Meera (imported from smc.org.in) for Malayalam text
**Colors**:
- Primary Blue: #4299e1 (header, links)
- E.K. Kurup Tag: Green (#48bb78)
- Crowd Sourced Tag: Orange (#fc8181)
**Layout**: Clean, minimal, matching olam.in aesthetic

## Permissions Required

- `storage` - Save settings and last search
- `contextMenus` - Right-click menu option
- `https://olam.in/*` - API access

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge
- ✅ Brave
- ✅ Other Chromium browsers

## Future Enhancements (Not Implemented)

- Offline mode with cached results
- Search history panel
- Pronunciation audio
- Keyboard shortcuts
- Dark mode
- Firefox version
