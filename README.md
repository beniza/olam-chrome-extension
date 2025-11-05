# Olam Dictionary Chrome Extension

> 🎯 **Quick dictionary lookups for English-Malayalam translations on any webpage**

A powerful Chrome extension that seamlessly integrates the [Olam.in](https://olam.in) English-Malayalam dictionary into your browsing experience. Get instant translations with just a double-click or right-click.

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## ✨ Features

### Core Functionality
- 🖱️ **Double-Click Search**: Simply double-click any word to see its translation
- 📋 **Context Menu Search**: Right-click selected text for instant lookup
- 🌍 **Multi-Language Support**: English → Malayalam and Malayalam → Malayalam lookups
- 🔄 **Auto Language Detection**: Automatically identifies Malayalam text (Unicode U+0D00-U+0D7F)
- 📍 **Smart Positioning**: Popup appears near cursor and adjusts to stay on-screen
- 🖐️ **Draggable Popup**: Move the popup anywhere by dragging the title bar

### Advanced Features
- 📑 **Multiple Entries Navigation**: Browse through different dictionary entries with prev/next buttons
- 🏷️ **Source Filtering**: Filter results by dictionary source (E.K. Kurup, Crowd Sourced)
- ⚙️ **Customizable Settings**: Configure double-click, language preferences, and result limits
- 💡 **Smart No-Results Message**: Shows current language settings and quick link to change them when no results found
- 🎨 **Clean UI**: Beautiful design matching Olam.in's aesthetic
- ⚡ **Fast & Responsive**: Results appear in under 1 second
- 🛡️ **Layout Protection**: Doesn't interfere with page layout or content
- 🔍 **Zoom Support**: Popup repositions automatically when page is zoomed in/out

### User Settings
- **Double-Click Toggle**: Enable/disable double-click functionality
- **Language Preferences**: Configure source language (Auto-detect, English, Malayalam) and target (Malayalam only)
- **Result Limit**: Display 3, 5, 10, or all translation words

---

## 🚀 Installation

### For End Users (Recommended)

1. **Download the Extension**
   - Go to the [Releases page](https://github.com/beniza/olam-chrome-extension/releases)
   - Download the latest release ZIP file
   - Extract all files to a folder (e.g., `olam-dictionary-extension`)

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top-right corner)
   - Click **"Load unpacked"**
   - Select the extracted extension folder
   - The extension icon appears in your toolbar

3. **Start Using**
   - Visit any webpage
   - Double-click any English or Malayalam word
   - Enjoy instant translations!

📚 **Detailed installation and testing guide**: See [docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md)

### For Developers

```bash
# Clone the repository
git clone https://github.com/beniza/olam-chrome-extension.git
cd olam-chrome-extension

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the olam-chrome-extension directory
```

---

## 📖 Usage Guide

### Double-Click Search
1. Visit any webpage with English or Malayalam text
2. **Double-click** on a word
3. A popup appears with translations near your cursor
4. Click the **× button**, press **Escape**, or click outside to close

### Context Menu Search
1. **Select** text by clicking and dragging
2. **Right-click** on the selected text
3. Choose **"Search [word] in Olam Dictionary"**
4. Results appear in a popup

### Navigating Results
- Use **‹** and **›** buttons to browse multiple dictionary entries
- Click source filter buttons (**E.K. Kurup**, **Crowd Sourced**) to filter results
- Click **"View full details →"** to open the complete entry on Olam.in

### Moving the Popup
- **Hover** over the blue title bar (cursor changes to move icon)
- **Click and drag** to reposition the popup anywhere on screen

### Accessing Settings
- Click the **⚙ gear icon** in the popup header
- Or click the extension icon in Chrome toolbar → **Options**

---

## ⚙️ Configuration

Access settings by clicking the gear icon (⚙) in any dictionary popup.

### Available Settings

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| **Double-click to search** | On/Off | On | Enable or disable double-click word lookup |
| **Search from** | Auto-detect, English, Malayalam | Auto-detect | Source language for context menu searches |
| **Translate to** | Malayalam | Malayalam | Target language for translations |
| **Number of words** | 3, 5, 10, All | 3 | How many translation words to display |

> **Note**: Double-click search always auto-detects language. Currently supports English → Malayalam and Malayalam → Malayalam lookups.

---

## 📁 Project Structure

```
chrome-plugin/
├── manifest.json              # Extension configuration (Manifest V3)
├── content.js                 # Main content script (modular architecture)
├── background.js              # Service worker (API, context menu)
├── popup.html                 # Extension toolbar popup
├── popup.js                   # Popup functionality
├── options.html               # Settings page
├── options.js                 # Settings management
├── styles.css                 # All styling (623 lines)
├── README.md                  # This file
├── icons/                     # Extension icons
│   ├── icon16.png            # 16×16 toolbar icon
│   ├── icon48.png            # 48×48 extension icon
│   └── icon128.png           # 128×128 store icon
├── docs/                      # Documentation
│   ├── project-architecture.md # System architecture (2100+ lines)
│   ├── TESTING_CHECKLIST.md  # Comprehensive testing guide
│   ├── failing-cases.md      # API inconsistencies report
│   └── TESTING.md            # Testing documentation
├── tests/                     # Test suite (105 tests)
├── utils/                     # Utility modules
└── plugin-description.json    # Extension metadata
```

### Code Architecture

**Refactored & Modular Design (v1.1.0)**

**Content Script** (`content.js` - 900+ lines)
- **AppState**: Centralized state management
- **Settings**: User preference handling
- **API**: Dictionary API communication
- **UI**: DOM manipulation and popup lifecycle
- **Renderer**: Results rendering and display
- **SearchController**: Search orchestration
- **EventHandlers**: User interaction management

**Background Worker** (`background.js` - 280+ lines)
- **OlamAPI**: API service with caching
- **SettingsService**: Language preferences
- **ContextMenuService**: Right-click menu
- **MessageHandler**: Inter-script communication
- **Constants**: Configuration values

📖 **Architecture details**: See [docs/project-architecture.md](docs/project-architecture.md)

---

## 🔌 API Integration

### Olam Dictionary API

- **Base URL**: `https://olam.in/api/dictionary/{from_lang}/{to_lang}/{word}`
- **Supported Languages**: 
  - `english` → `malayalam`
  - `malayalam` → `malayalam`

### Example API Calls
```bash
# English to Malayalam
https://olam.in/api/dictionary/english/malayalam/hello

# Malayalam to Malayalam
https://olam.in/api/dictionary/malayalam/malayalam/നമസ്കാരം
```

### Response Caching
Results are cached locally using `chrome.storage.local` for improved performance.

---

## 🔐 Permissions

The extension requires the following Chrome permissions:

| Permission | Purpose |
|------------|---------|
| `contextMenus` | Add "Search in Olam Dictionary" to right-click menu |
| `storage` | Save user settings and cache search results |
| `https://olam.in/*` | Access Olam API for dictionary lookups |

**No data collection**: This extension does not collect, store, or transmit any personal data.

---

## 🌐 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Google Chrome | ✅ Fully Supported | Chrome 88+ (Manifest V3) |
| Microsoft Edge | ✅ Fully Supported | Edge 88+ (Chromium) |
| Brave Browser | ✅ Fully Supported | Latest version |
| Opera | ✅ Expected to work | Chromium-based |
| Firefox | ❌ Not supported | Requires Manifest V2 adaptation |

---

## 🧪 Testing

### Automated Testing

Comprehensive automated test suite using Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Test Statistics:**
- **Total Tests**: 105
- **Test Suites**: 7
- **Coverage**: Unit tests, Integration tests

**Test Breakdown:**
- 📦 **AppState (16 tests)**: State management, configuration loading, settings updates
- 🔌 **API Service (11 tests)**: Content script API, language detection, search functionality  
- 🌐 **OlamAPI (17 tests)**: Background API communication, caching, error handling
- ⚙️ **Settings Service (7 tests)**: Chrome storage, default values, validation
- 🔗 **URL Builder (19 tests)**: URL construction, encoding, consistency
- 📋 **Constants (32 tests)**: Configuration values, exports, structure validation, content script files
- 🔄 **Integration (3 tests)**: End-to-end search flow, component interaction

**Test Coverage:**
- ✅ Language detection (detectLanguage utility)
- ✅ URL building (buildApiUrl, buildDictionaryUrl)
- ✅ Constants validation (API URLs, defaults, supported languages)
- ✅ API communication and caching
- ✅ Settings storage and retrieval
- ✅ State management
- ✅ Integration flows

### Manual Testing

Comprehensive testing checklist available for quality assurance:

- **Manual Testing**: [docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md)
  - 16 test categories
  - Step-by-step instructions
  - Expected results for each test
  - Issue tracking form
  - First-time user installation guide

**Manual Test Coverage:**
- ✅ Double-click search (English & Malayalam)
- ✅ Context menu search
- ✅ Popup behavior (positioning, dragging, closing)
- ✅ Navigation and filtering
- ✅ Settings configuration
- ✅ Performance and reliability
- ✅ Cross-browser compatibility

---

## 🛠️ Development

### Prerequisites
- Node.js (optional, for future tooling)
- Chrome 88+ or compatible browser
- Basic understanding of Chrome Extension APIs

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/beniza/olam-chrome-extension.git
cd olam-chrome-extension

# Install dependencies
npm install

# Run tests
npm test

# Load extension in Chrome
# chrome://extensions/ → Developer mode → Load unpacked
```

### Code Style
- Modern JavaScript (ES6+)
- Modular architecture with clear separation of concerns
- Comprehensive JSDoc documentation
- Consistent naming conventions

### Automated Testing

The project includes comprehensive automated testing using Jest. See [TESTING.md](TESTING.md) for detailed testing documentation.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
```

**Test Suite (105 tests, all passing):**
- ✅ **AppState Module**: State management, search data, filtering, navigation (16 tests)
- ✅ **API Module**: Language detection (English/Malayalam/Unicode), search functionality (11 tests)
- ✅ **OlamAPI Service**: Dictionary API calls, URL construction, caching, error handling (17 tests)
- ✅ **SettingsService**: User preferences, defaults, error recovery (7 tests)
- ✅ **URL Builder**: URL construction, encoding, consistency (19 tests)
- ✅ **Constants**: Configuration values, exports, content script files (32 tests)
- ✅ **Integration Tests**: Search flow, settings synchronization (3 tests)
- ✅ **Chrome Extension API Mocks**: Complete mock implementations for testing

**Test Coverage Targets:**
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

### Making Changes
1. Create a feature branch from `main`
2. Make your changes following the modular structure
3. Write or update tests for your changes
4. Run `npm test` to ensure all tests pass
5. Test manually using [docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md)
6. Document changes in commit messages
7. Submit pull request

---

## 📊 Version History

### v1.2.0 (Current)
- ✨ Smart no-results message with language settings reminder
- ✨ Clickable link to open settings from no-results message
- ✨ Automatic popup repositioning on page zoom
- 🐛 Fixed duplicate importScripts causing service worker failure
- 🐛 Fixed detectLanguage function reference bug
- 🐛 Fixed content script injection for context menu
- ♻️ Refactored code review improvements (removed unused variables, extracted constants)
- 📚 Updated documentation with new features
- 🧪 Expanded test suite to 105 tests

### v1.1.0 (Refactored)
- ✨ Complete codebase refactoring with modular architecture
- ✨ Added Malayalam word double-click support
- ✨ Draggable popup functionality
- ✨ Configurable result limit (3, 5, 10, or all words)
- ✨ Auto-detect language option
- ✨ Comprehensive settings page
- 🐛 Fixed template string syntax issues
- 🐛 Fixed context menu search with proper language handling
- 🐛 Fixed page layout interference
- 📚 Added extensive documentation (docs/project-architecture.md, docs/TESTING_CHECKLIST.md)

### v1.0.1
- 🐛 Fixed page layout shrinkage issue
- 🐛 Added CSS isolation
- ⚙️ Added settings gear icon

### v1.0.0
- 🎉 Initial release
- 🔍 Basic double-click and context menu search
- 🌐 English → Malayalam translation
- 🎨 Clean popup UI

---

## 🚧 Roadmap

### Planned Features
- [ ] **Offline Mode**: Cache frequently used words for offline access
- [ ] **Search History Panel**: View and manage your search history
- [ ] **Pronunciation Audio**: Listen to word pronunciations
- [ ] **Favorites/Bookmarks**: Save and organize favorite words
- [ ] **Dark Mode**: Eye-friendly dark theme option
- [ ] **Keyboard Shortcuts**: Custom hotkeys for quick access
- [ ] **Firefox Support**: Port to Firefox with Manifest V2
- [ ] **TypeScript Migration**: Add type safety
- [ ] **Chrome Web Store**: Publish for easy installation

### Future Enhancements
- [ ] Export search history to CSV/JSON
- [ ] Integration with other dictionary APIs
- [ ] Word of the day notification
- [ ] Spaced repetition learning mode
- [ ] Browser sync for settings and history

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Use the issue tracker to report problems
2. **Suggest Features**: Share your ideas for improvements
3. **Submit Pull Requests**: Help improve the code
4. **Test**: Try the extension and provide feedback
5. **Documentation**: Improve or translate documentation

### Contribution Guidelines
- Follow existing code style and architecture
- Add tests for new features
- Update documentation
- Write clear commit messages

---

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 Olam Dictionary Extension Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🧪 Testing & Quality Assurance

This extension has undergone comprehensive testing to ensure robust handling of real-world scenarios.

### Automated Testing
- **105 Test Cases**: Complete coverage of all features and edge cases
- **Test Framework**: Jest with custom Chrome API mocks
- **Run Tests**: `npm test` to execute full test suite

### Real API Testing & Corner Case Analysis

We conducted extensive testing with **21 real API calls** to validate behavior across diverse scenarios:

#### Test Coverage
- **Single Word Searches**: English & Malayalam (7 tests)
- **Multi-Word Phrases**: English & Malayalam (5 tests)
- **Mixed Language**: English-Malayalam combinations (6 tests)
- **Edge Cases**: Non-existent words, special characters, punctuation (3 tests)

#### Corner Cases Identified & Validated

| # | Corner Case | Status | Handling |
|---|-------------|--------|----------|
| 1 | Empty results (non-existent words) | ✅ Validated | Shows "No results found" with language settings reminder |
| 2 | Wrong language setting | ✅ Handled | Shows current settings and link to change them |
| 3 | Pagination (222+ entries) | ✅ Validated | First 10 entries with navigation |
| 4 | Large content arrays (60+ words) | ✅ Validated | Result limit feature (default: 50) |
| 5 | Special characters | ✅ Validated | URL-encoded, API ignores them |
| 6 | Multi-word English phrases | ✅ Validated | Returns empty (API limitation) |
| 7 | Multi-word Malayalam phrases | ✅ Validated | Returns empty (API limitation) |
| 8 | Mixed language queries | ✅ Validated | Returns empty (API limitation) |
| 9 | Page zoom in/out | ✅ Handled | Popup repositions automatically |

#### Testing Documentation

Comprehensive test results and analysis available:

**In `docs/` directory:**
- **[`project-architecture.md`](docs/project-architecture.md)**: System architecture & data flows (2100+ lines)
- **[`failing-cases.md`](docs/failing-cases.md)**: API limitations report for Olam.in developers

**In `.local/` directory (gitignored):**
- **`api-test-results.json`**: Raw API responses from 21 tests
- **`api-analysis-report.md`**: Automated corner case categorization
- **`corner-cases-analysis.md`**: Detailed validation (7KB)
- **`EXTENDED_TESTING_SUMMARY.md`**: Complete testing report

**Result**: ✅ All corner cases properly handled. No code changes needed.

### API Limitations & Known Issues

See [docs/failing-cases.md](docs/failing-cases.md) for documented API limitations that have been reported to Olam.in developers.

---

## 🙏 Credits & Acknowledgments

- **Dictionary Data**: Powered by [Olam.in](https://olam.in) - India's first open-source Malayalam dictionary
- **Malayalam Language**: Unicode Consortium for Malayalam script support
- **Community**: Thanks to all testers and contributors
- **API Testing**: Comprehensive real-world testing validates robust error handling

> **Disclaimer**: This extension is an independent project and is not officially affiliated with or endorsed by Olam.in. Please respect their API usage policies and terms of service.

---

## 📞 Support

### Getting Help
- 📖 **Documentation**: Read [docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md) for detailed guides
- 🐛 **Bug Reports**: Open an issue with reproduction steps
- 💡 **Feature Requests**: Suggest improvements via issues
- 📧 **Contact**: Reach out through the repository

### Troubleshooting
See the [Troubleshooting section](docs/TESTING_CHECKLIST.md#-troubleshooting) in the testing checklist for common issues and solutions.

---

## 🌟 Show Your Support

If you find this extension useful:
- ⭐ Star the repository
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📢 Share with others who might benefit
- 🤝 Contribute to the codebase

---

**Made with ❤️ for the Malayalam language community**

*Last updated: November 2025*


