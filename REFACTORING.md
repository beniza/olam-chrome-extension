# Olam Dictionary Extension - Refactored Architecture

## Overview

This document describes the refactored architecture of the Olam Dictionary Chrome Extension. The refactoring focuses on:
- **Modularity**: Clear separation of concerns
- **Testability**: Pure functions and dependency injection
- **Maintainability**: Consistent patterns and documentation
- **Reliability**: Better error handling and state management

## Architecture

### File Structure

```
chrome-plugin/
├── content-refactored.js    # Content script (modular)
├── background-refactored.js # Service worker (modular)
├── content.js               # Original content script
├── background.js            # Original service worker
├── options.js               # Settings page
├── popup.js                 # Toolbar popup
├── manifest.json            # Extension manifest
├── styles.css               # All styles
└── icons/                   # Extension icons
```

## Content Script Architecture (`content-refactored.js`)

The content script is organized into **7 distinct modules**:

### 1. **AppState Module**
Centralized state management using a singleton object.

```javascript
AppState = {
  popup, doubleClickEnabled, currentData, currentEntryIndex,
  currentFilterTag, currentSearchWord, currentFromLang, currentToLang
}
```

**Key Methods:**
- `resetSearchState()` - Clear search data
- `setSearchData(data, word, fromLang, toLang)` - Store new search
- `getFilteredEntries()` - Get entries with active filter
- `nextEntry()` / `prevEntry()` - Navigate entries
- `setFilterTag(tag)` - Change active filter

**Benefits:**
- Single source of truth
- Easy to test state transitions
- Clear state lifecycle

### 2. **Settings Module**
User preference management.

```javascript
Settings = {
  async load(),
  watchChanges()
}
```

**Responsibilities:**
- Load settings from `chrome.storage.sync`
- Listen for settings changes
- Update `AppState` with new values

### 3. **API Module**
Communication with Olam dictionary API.

```javascript
API = {
  detectLanguage(text),
  async search(text, fromLang, toLang)
}
```

**Key Features:**
- Language detection (Malayalam Unicode range)
- Promise-based API calls
- Error handling with proper rejection

### 4. **UI Module**
DOM manipulation and popup management.

```javascript
UI = {
  createPopup(),
  showPopup(x, y),
  hidePopup(),
  showLoading(),
  hideLoading(),
  showNoResults(),
  showError(message)
}
```

**Responsibilities:**
- Popup lifecycle (create, show, hide)
- Position calculation
- Loading state management
- Template generation

**Key Methods:**
- `calculatePosition(x, y, popupRect)` - Smart positioning
- `attachPopupEventListeners(popup)` - Event delegation

### 5. **Renderer Module**
Results rendering and display.

```javascript
Renderer = {
  renderResults(),
  renderEntry(entry),
  renderSourceFilters(container),
  renderMeaning(container, relation),
  renderType(container, relation),
  renderDetailsLink(container),
  updateNavigation()
}
```

**Responsibilities:**
- Display dictionary entries
- Render source filter buttons
- Navigation controls
- Incremental rendering

**Design Pattern:**
- Component-based rendering
- Pure rendering functions (given state → render HTML)
- Testable rendering logic

### 6. **SearchController Module**
Orchestrates search flow.

```javascript
SearchController = {
  async search(text, x, y),
  displayResults(data, word, x, y)
}
```

**Responsibilities:**
- Coordinate UI, API, and State modules
- Handle search lifecycle:
  1. Show popup + loading
  2. Call API
  3. Update state
  4. Render results
  5. Handle errors

**Two Paths:**
1. **User-initiated** (double-click): `search()`
2. **Context menu**: `displayResults()` (pre-fetched data)

### 7. **EventHandlers Module**
User interaction handling.

```javascript
EventHandlers = {
  init(),
  setupDoubleClick(),
  setupKeyboard(),
  setupClickOutside(),
  setupMessageListener(),
  handleContextMenuSearch(request)
}
```

**Events:**
- `dblclick` - Word lookup
- `keydown` (Escape) - Close popup
- `click` (outside) - Close popup
- `chrome.runtime.onMessage` - Context menu results

## Background Service Worker Architecture (`background-refactored.js`)

The service worker is organized into **5 modules**:

### 1. **OlamAPI Service**
API communication layer.

```javascript
OlamAPI = {
  async search(text, fromLang, toLang),
  async cacheResult(query, result),
  async getLastSearch()
}
```

**Features:**
- Fetch API usage
- Result caching in `chrome.storage.local`
- Error handling

### 2. **SettingsService**
User preferences retrieval.

```javascript
SettingsService = {
  async getLanguagePreferences()
}
```

**Returns:**
- `fromLang` - Source language
- `toLang` - Target language
- Defaults to `english` → `malayalam`

### 3. **ContextMenuService**
Context menu management.

```javascript
ContextMenuService = {
  init(),
  async handleClick(info, tab)
}
```

**Flow:**
1. User selects text → right-click → "Search in Olam"
2. Get language preferences
3. Call API
4. Send results to content script

### 4. **MessageHandler**
Message routing and handling.

```javascript
MessageHandler = {
  async handle(request, sender, sendResponse),
  async handleSearch(request, sendResponse),
  async handleGetLastSearch(sendResponse),
  handleOpenOptions()
}
```

**Supported Actions:**
- `searchWord` - Perform API search
- `getLastSearch` - Retrieve cached result
- `openOptions` - Open settings page

### 5. **Constants**
Configuration constants.

```javascript
const API_BASE_URL = 'https://olam.in/api/dictionary';
const CONTEXT_MENU_ID = 'searchOlam';
const DEFAULT_FROM_LANG = 'english';
const DEFAULT_TO_LANG = 'malayalam';
```

## Key Improvements

### 1. **Separation of Concerns**
- Each module has a single responsibility
- Clear interfaces between modules
- No circular dependencies

### 2. **Testability**
All modules can be tested independently:

```javascript
// Test API module
const result = API.detectLanguage('മലയാളം');
assert.equal(result, 'malayalam');

// Test State module
AppState.setSearchData(mockData, 'test', 'english', 'malayalam');
assert.equal(AppState.currentSearchWord, 'test');

// Test Renderer
const entries = AppState.getFilteredEntries();
assert.equal(entries.length, 3);
```

### 3. **Error Handling**
- Try-catch blocks in all async functions
- User-friendly error messages
- Console logging for debugging

### 4. **Code Readability**
- JSDoc comments on all functions
- Consistent naming conventions
- Logical code organization

### 5. **Performance**
- Event delegation
- Efficient DOM manipulation
- Result caching

## Data Flow

### Double-Click Search Flow

```
User double-clicks word
    ↓
EventHandlers.setupDoubleClick()
    ↓
SearchController.search(word, x, y)
    ↓
UI.showPopup(x, y) + UI.showLoading()
    ↓
API.search(word, fromLang, toLang)
    ↓
Background: OlamAPI.search() → fetch API
    ↓
Content: SearchController receives response
    ↓
AppState.setSearchData(data, word, ...)
    ↓
UI.hideLoading()
    ↓
Renderer.renderResults()
    ↓
Renderer.renderEntry() + updateNavigation()
```

### Context Menu Search Flow

```
User selects text → right-click → "Search in Olam"
    ↓
Background: ContextMenuService.handleClick()
    ↓
SettingsService.getLanguagePreferences()
    ↓
OlamAPI.search(text, fromLang, toLang)
    ↓
chrome.tabs.sendMessage(tab, { action: 'showPopup', data })
    ↓
Content: EventHandlers.handleContextMenuSearch()
    ↓
SearchController.displayResults(data, word, x, y)
    ↓
UI.showPopup() + UI.hideLoading()
    ↓
AppState.setSearchData(data, word, ...)
    ↓
Renderer.renderResults()
```

## Testing Strategy

### Unit Testing
Each module can be tested in isolation:

1. **AppState**: Test state transitions
2. **API**: Mock `chrome.runtime.sendMessage`
3. **UI**: Test DOM creation and positioning
4. **Renderer**: Test HTML generation
5. **SearchController**: Mock dependencies

### Integration Testing
Test module interactions:

1. Search flow (UI → Controller → API → Renderer)
2. Navigation flow (State → Renderer)
3. Filter flow (State → Renderer)

### Manual Testing Checklist

- [ ] Double-click word → popup appears near cursor
- [ ] Search result displays correctly
- [ ] Navigate between multiple entries (prev/next)
- [ ] Filter by source (E.K. Kurup, Crowd Sourced)
- [ ] Click outside → popup closes
- [ ] Press Escape → popup closes
- [ ] Right-click → "Search in Olam" → results appear
- [ ] Settings button → opens options page
- [ ] Disable double-click in settings → feature disabled
- [ ] Malayalam text detection works
- [ ] English text detection works
- [ ] No results message displays
- [ ] Error handling (network errors)

## Migration Path

To switch from old to refactored code:

1. **Update `manifest.json`:**
   ```json
   "content_scripts": [{
     "js": ["content-refactored.js"]
   }]
   ```

2. **Update service worker:**
   ```json
   "background": {
     "service_worker": "background-refactored.js"
   }
   ```

3. **Test thoroughly** using checklist above

4. **Remove old files** after validation:
   - Delete `content.js`
   - Delete `background.js`
   - Rename refactored files

## Future Enhancements

### 1. **Unit Tests**
Add Jest or Mocha tests for all modules:
```bash
npm install --save-dev jest
npm test
```

### 2. **TypeScript Migration**
Convert to TypeScript for type safety:
```typescript
interface DictionaryEntry {
  content: string[];
  relations: Relation[];
  tags: string[];
}
```

### 3. **Module Bundling**
Use Webpack/Rollup for:
- Code splitting
- Tree shaking
- Minification

### 4. **Performance Monitoring**
Add telemetry:
- Search latency
- Error rates
- Feature usage

## Conclusion

The refactored architecture provides:
- ✅ **Maintainability**: Clear module boundaries
- ✅ **Testability**: Isolated, pure functions
- ✅ **Reliability**: Better error handling
- ✅ **Scalability**: Easy to add features
- ✅ **Documentation**: Comprehensive JSDoc

The codebase is now production-ready and test-ready.
