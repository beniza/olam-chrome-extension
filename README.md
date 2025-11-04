# Olam Dictionary Chrome Extension

A Chrome extension that integrates the Olam English-Malayalam dictionary into any webpage. Select text on any website and instantly search it in the comprehensive Olam dictionary.

## Features

- 🔍 **Text Selection Search**: Right-click on selected text and search in Olam dictionary
- 🌐 **Bi-directional Support**: 
  - English → Malayalam
  - Malayalam → Malayalam
- 🎨 **Beautiful UI**: Clean interface matching olam.in's design
- ⚡ **Fast Search**: Instant results using Olam's API
- 🔄 **Auto Language Detection**: Automatically detects Malayalam script
- 💾 **Search History**: Remembers your last search

## Installation

### For Development

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `chrome-plugin` directory

### Icons Required

Before loading the extension, you need to add icon files to the `icons/` directory:
- `icon16.png` (16×16 pixels)
- `icon48.png` (48×48 pixels)
- `icon128.png` (128×128 pixels)

See `icons/README.md` for details on creating icons.

## Usage

### Method 1: Context Menu (Right-click)
1. Select any text on a webpage
2. Right-click and choose "Search '[text]' in Olam Dictionary"
3. View results in the popup window

### Method 2: Extension Popup
1. Click the Olam extension icon in Chrome toolbar
2. Type or paste text in the search box
3. Select language direction (English→Malayalam or Malayalam→Malayalam)
4. Click search or press Enter

## Project Structure

```
chrome-plugin/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker (API calls, context menu)
├── content.js          # Content script (text selection detection)
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic and UI handling
├── styles.css          # Styling (matches olam.in theme)
├── icons/              # Extension icons directory
│   └── README.md       # Instructions for creating icons
└── README.md           # This file
```

## API Integration

This extension uses the Olam dictionary API:
- **Base URL**: `https://olam.in/api/dictionary/{from_lang}/{to_lang}/{word}`
- **Supported Languages**: 
  - `english` → `malayalam`
  - `malayalam` → `malayalam`

### Example API Call
```
https://olam.in/api/dictionary/english/malayalam/hello
```

## Permissions

The extension requires:
- `contextMenus`: For right-click menu integration
- `storage`: For saving search history
- `https://olam.in/*`: For API access

## Technologies Used

- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No external dependencies
- **CSS3**: Modern styling with flexbox
- **Olam API**: Dictionary data source

## Browser Compatibility

- ✅ Google Chrome (Manifest V3)
- ✅ Microsoft Edge (Chromium)
- ✅ Brave Browser
- ✅ Other Chromium-based browsers

## Future Enhancements

Potential features to add:
- [ ] Offline mode with cached results
- [ ] Search history panel
- [ ] Pronunciation audio
- [ ] Export/save favorite words
- [ ] Dark mode theme
- [ ] Keyboard shortcuts
- [ ] Firefox version

## Credits

- Dictionary data powered by [Olam.in](https://olam.in)
- Malayalam language support

## License

This extension is an independent project and is not officially affiliated with olam.in. Please respect their API usage policies.

## Support

For issues or suggestions, please open an issue in the repository.

---

**Note**: Make sure to create and add icon files before loading the extension in Chrome.
