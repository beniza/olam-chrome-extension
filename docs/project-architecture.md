# Olam Dictionary Chrome Extension - Project Architecture

**Version:** 1.2.1  
**Last Updated:** November 5, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Module Architecture](#module-architecture)
3. [Component Diagram](#component-diagram)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Process Maps](#process-maps)
7. [File Structure](#file-structure)
8. [Communication Patterns](#communication-patterns)
9. [State Management](#state-management)
10. [Testing Architecture](#testing-architecture)

---

## Overview

The Olam Dictionary Chrome Extension is a Manifest V3 extension that provides instant English-Malayalam dictionary lookups through double-click and context menu interactions. The architecture follows a modular design with clear separation of concerns between UI, API, and utilities.

### Core Technologies
- **Chrome Extension Manifest V3**
- **Vanilla JavaScript (ES6+)**
- **Jest Testing Framework**
- **Chrome Storage API** (sync & local)
- **Olam.in REST API**

### Architecture Principles
- **Modular Design**: Shared utilities in `utils/` directory
- **Single Source of Truth**: Centralized constants and configurations
- **Event-Driven**: Message passing between contexts
- **Cached Results**: Local storage for performance
- **Test-Driven**: 105 automated tests covering all components

---

## Module Architecture

### Core Modules

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Content      │  │  Background  │  │  Popup UI       │  │
│  │  Script       │  │  Service     │  │  (popup.js)     │  │
│  │  (content.js) │  │  Worker      │  │                 │  │
│  │               │  │  (background)│  │                 │  │
│  └───────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│          │                  │                    │           │
│          └──────────────────┴────────────────────┘           │
│                             │                                │
│                  ┌──────────▼──────────┐                    │
│                  │   Shared Utilities   │                    │
│                  │   (utils/)           │                    │
│                  │  - detectLanguage    │                    │
│                  │  - constants         │                    │
│                  │  - urlBuilder        │                    │
│                  └──────────────────────┘                    │
│                                                               │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Settings     │  │  Options     │  │  Styles         │  │
│  │  (options.js) │  │  Page        │  │  (styles.css)   │  │
│  │               │  │  (options.   │  │                 │  │
│  │               │  │   html)      │  │                 │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  External APIs   │
                   │  - Olam.in API   │
                   │  - Olam.in Web   │
                   └──────────────────┘
```

---

## Component Diagram

### 1. Content Script (content.js)
**Role:** Handles user interactions on web pages

**Responsibilities:**
- Listen for double-click events
- Detect clicked word
- Show inline popup with results
- Handle popup positioning and dragging
- Manage popup state and navigation

**Key Components:**
- `AppState`: Global state management
- `API`: Interface for background communication
- `PopupUI`: Popup rendering and interaction
- `EventListeners`: User interaction handlers

**Dependencies:**
- `utils/detectLanguage.js`
- `utils/constants.js`
- `utils/urlBuilder.js`

---

### 2. Background Service Worker (background.js)
**Role:** Handles API communication and data management

**Responsibilities:**
- Make HTTP requests to Olam API
- Cache search results
- Manage context menu
- Handle messages from content scripts
- Retrieve and validate settings

**Key Components:**
- `OlamAPI`: API communication layer
- `ContextMenu`: Right-click menu management
- `SettingsService`: Chrome storage interface
- `MessageHandler`: Inter-component communication

**Dependencies:**
- `utils/detectLanguage.js`
- `utils/constants.js`
- `utils/urlBuilder.js`

---

### 3. Popup UI (popup.js)
**Role:** Extension toolbar popup interface

**Responsibilities:**
- Manual search interface
- Display search results
- Link to full dictionary
- Settings access

**Dependencies:**
- `utils/constants.js`
- `utils/urlBuilder.js`

---

### 4. Options Page (options.js)
**Role:** Extension settings configuration

**Responsibilities:**
- Save/load user preferences
- Validate settings
- Provide UI feedback

**Settings:**
- Double-click toggle
- Language preferences (from/to)
- Result limit

---

### 5. Shared Utilities (utils/)

#### detectLanguage.js
```javascript
/**
 * Detects if text contains Malayalam characters
 * @param {string} text - Text to analyze
 * @returns {string} - 'malayalam' or 'english'
 */
function detectLanguage(text)
```

**Algorithm:**
- Tests for Malayalam Unicode range: U+0D00 to U+0D7F
- Returns 'malayalam' if any character in range
- Defaults to 'english' otherwise

#### constants.js
```javascript
// API Configuration
const API_BASE_URL = 'https://olam.in/api/dictionary';
const DICTIONARY_BASE_URL = 'https://olam.in/dictionary';

// Language Defaults
const DEFAULT_FROM_LANG = 'auto';
const DEFAULT_TO_LANG = 'malayalam';

// Language Options
const SUPPORTED_LANGUAGES = {
  AUTO: 'auto',
  ENGLISH: 'english',
  MALAYALAM: 'malayalam'
};

// Context Menu
const CONTEXT_MENU_ID = 'searchOlam';
```

#### urlBuilder.js
```javascript
/**
 * Build API URL for dictionary lookup
 */
function buildApiUrl(fromLang, toLang, text)

/**
 * Build dictionary web URL for full details
 */
function buildDictionaryUrl(fromLang, toLang, text)
```

**Features:**
- Proper URI encoding with `encodeURIComponent()`
- Consistent URL structure
- Supports all language combinations

---

## Data Flow

### 1. Double-Click Search Flow

```
┌──────────────┐
│ User         │
│ Double-Clicks│
│ Word         │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Content Script (content.js)                              │
├──────────────────────────────────────────────────────────┤
│ 1. EventListener.handleDoubleClick()                     │
│    - Get word at cursor position                         │
│    - Store word in AppState.currentSearchWord            │
│    - Detect language: detectLanguage(word)               │
│    └─→ Sets AppState.currentFromLang                     │
│                                                           │
│ 2. API.search(word, fromLang, 'malayalam')              │
│    └─→ chrome.runtime.sendMessage()                      │
└──────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ Background Service Worker (background.js)                │
├──────────────────────────────────────────────────────────┤
│ 3. chrome.runtime.onMessage listener                     │
│    - Receives: { action: 'search', text, fromLang, toLang }│
│                                                           │
│ 4. SettingsService.getLanguageSettings()                 │
│    - Get user preferences from chrome.storage.sync       │
│    - Returns: { fromLang, toLang }                       │
│    - Validate: toLang must be 'malayalam'                │
│                                                           │
│ 5. OlamAPI.search(text, fromLang, toLang)               │
│    a. Check cache: chrome.storage.local.get(text)        │
│       - If cached → return immediately                    │
│    b. Build URL: buildApiUrl(fromLang, toLang, text)     │
│       └─→ 'https://olam.in/api/dictionary/english/malayalam/word'│
│    c. fetch(url)                                          │
│       └─→ GET request to Olam API                        │
│    d. response.json()                                     │
│    e. Cache result: chrome.storage.local.set()           │
│    f. Return data                                         │
│                                                           │
│ 6. sendResponse({ success: true, data })                 │
└──────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ Content Script (content.js)                              │
├──────────────────────────────────────────────────────────┤
│ 7. API.search() callback receives response               │
│    - Store in AppState.apiResponse                       │
│    - Parse and filter results                            │
│                                                           │
│ 8. PopupUI.render()                                      │
│    - Create popup DOM element                            │
│    - Position near cursor                                │
│    - Display word meanings                               │
│    - Add navigation controls (if multiple entries)       │
│    - Add filter buttons (if multiple sources)            │
│    - Attach event listeners                              │
│                                                           │
│ 9. document.body.appendChild(popup)                      │
│    └─→ Popup appears on page                             │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ User Sees    │
│ Translation  │
│ Popup        │
└──────────────┘
```

### 2. Context Menu Search Flow

```
User Selects Text → Right-Click → Click Menu Item
                                        │
                                        ▼
                    ┌───────────────────────────────────┐
                    │ Background Service Worker         │
                    ├───────────────────────────────────┤
                    │ chrome.contextMenus.onClicked     │
                    │ - Get selected text               │
                    │ - Detect language                 │
                    │ - Fetch from API                  │
                    │ - Send message to content script  │
                    └───────────────┬───────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────────┐
                    │ Content Script                    │
                    ├───────────────────────────────────┤
                    │ chrome.runtime.onMessage          │
                    │ - Receive search results          │
                    │ - Render popup at selection       │
                    └───────────────────────────────────┘
```

### 3. Settings Update Flow

```
User Changes Setting in options.html
       │
       ▼
┌─────────────────────────────┐
│ Options Page (options.js)   │
├─────────────────────────────┤
│ 1. Event listener triggered │
│ 2. Validate input           │
│ 3. chrome.storage.sync.set()│
│    - Save preferences       │
│ 4. Show success message     │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Chrome Storage (Sync)       │
│ - Syncs across devices      │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Background Service Worker   │
├─────────────────────────────┤
│ Settings retrieved on next  │
│ search request              │
└─────────────────────────────┘
```

---

## API Integration

### Olam.in API

#### Endpoint Structure
```
Base URL: https://olam.in/api/dictionary
Format: /{fromLang}/{toLang}/{word}
```

#### Supported Language Pairs
1. **English → Malayalam**: `/english/malayalam/word`
2. **Malayalam → Malayalam**: `/malayalam/malayalam/വാക്ക്`

#### Request Format
```http
GET /api/dictionary/english/malayalam/hello HTTP/1.1
Host: olam.in
Accept: application/json
```

#### Response Format
```json
{
    "data": {
        "entries": [
            {
                "guid": "0ecf76a4-690c-4498-9b6f-de5b99780196",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female"
                ],
                "content_length": 1,
                "tokens": "'femal':1",
                "tags": [
                    "src:ekkurup"
                ],
                "phones": [
                    "ഫീമെയിൽ"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "2336fd87-acf6-4a94-916d-592aeb6a5ee4",
                        "weight": 1,
                        "initial": "സ",
                        "lang": "malayalam",
                        "content": [
                            "സ്ത്രൈണ",
                            "സ്ത്രീയെ സംബന്ധിച്ച",
                            "സ്ത്രീ സംബന്ധിയായ",
                            "പെൺവർഗ്ഗമായ",
                            "സ്ത്രീസഹജമായ",
                            "സ്ത്രീധർമ്മമനുസരിച്ചുള്ള",
                            "സ്ത്രീസ്വഭാവമുള്ള",
                            "സ്ത്രീജനോചിതമായ",
                            "സ്ത്രൈണമായ",
                            "സ്ത്രൈണപ്രകൃതിയു"
                        ],
                        "content_length": 10,
                        "tokens": "",
                        "tags": [
                            "src:ekkurup"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {
                            "synonyms": [
                                "feminine",
                                "womanly",
                                "ladylike",
                                "feminal"
                            ]
                        },
                        "status": "enabled",
                        "created_at": "2025-11-01T05:15:21.46612Z",
                        "updated_at": "2025-11-01T05:15:21.46612Z",
                        "total_relations": 2,
                        "relation": {
                            "types": [
                                "adjective"
                            ],
                            "tags": [
                                "src:ekkurup"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:15:21.46612Z",
                            "updated_at": "2025-11-01T05:15:21.46612Z"
                        }
                    },
                    {
                        "guid": "bf209fa5-5144-45e9-a8c4-6924aa5bc86f",
                        "weight": 1,
                        "initial": "പ",
                        "lang": "malayalam",
                        "content": [
                            "പെണ്ണ്",
                            "സ്ത്രീ",
                            "പെൺ",
                            "മാത",
                            "മാതു",
                            "മാത്",
                            "നാരി",
                            "നാരിയാൾ",
                            "മഹിള",
                            "മഹീള",
                            "മഹേള",
                            "മഹേളിക",
                            "വധൂജനം",
                            "മനുഷി",
                            "മാനുഷി",
                            "മഹിളാ",
                            "ശ്വൻ",
                            "പെഞ്ചാതി",
                            "കാരിക",
                            "ഗ്ന",
                            "ജനി",
                            "ജനിക",
                            "ലലിത",
                            "ലളിത",
                            "അമ്മാർ",
                            "തോക",
                            "വനിത",
                            "വധു",
                            "അംഗന",
                            "നങ്ക",
                            "രാമ",
                            "ത്രിഗർത്ത",
                            "യോഷ",
                            "വശ",
                            "വാശിത",
                            "വാസിത",
                            "വാസുര",
                            "വിവാഹിത",
                            "വരവേണി",
                            "മംഗലസ്ത്രീ",
                            "പെൺകൊച്ച്",
                            "യോഷണ",
                            "യോഷണാ",
                            "ജോഷ",
                            "ജോഷിത",
                            "ജോഷിത്ത്",
                            "യോഷിത്ത്",
                            "പുരന്ധ്രി",
                            "ക്ഷവിക",
                            "പൗരുഷി",
                            "പുരുഷി",
                            "യോഷിത",
                            "വഞ്ചനി",
                            "നിശാന്തനാരി",
                            "മർത്ത്യ",
                            "കുടുംബിനി",
                            "ഭരണപരമായ വകുപ്പുകളുടെ മേൽച്ചുമതല വഹിക്കുന്ന സ്ത്രീ",
                            "പ്രകൃതി",
                            "ഗുണഗൗരി",
                            "സുവാസിനി",
                            "ഭർത്തൃമതി",
                            "ഭർത്തൃമതിയായ സ്ത്രീ",
                            "ഭർത്തൃസാൽകൃത",
                            "മംഗല്യവതി",
                            "മംഗല്യസ്ത്രീ",
                            "സാധാരണസ്ത്രീ",
                            "മംഗല",
                            "മംഗള",
                            "മല്ല",
                            "മെല്ലിയൽ",
                            "രക്ഷാധികാരിണി",
                            "വരസ്ത്രീ",
                            "പ്രൗഢാംഗന",
                            "വൃദ്ധസുന്ദരി",
                            "മാന്യവനിത",
                            "പെൺകുട്ടി",
                            "ഋതുമതി",
                            "രജസ്വലാ",
                            "കുമാരി",
                            "കന്യക",
                            "കന്നിയാവ്",
                            "കന്യാവ്",
                            "പിണാ",
                            "മൂത്തച്ചി",
                            "മൂത്താച്ചി",
                            "മൂത്തി",
                            "പ്രായമുള്ള സ്ത്രീ",
                            "മടവി",
                            "പെൺജാതി",
                            "പെൺപിറന്നവർ",
                            "ഇട്ടിയമ്മ",
                            "പെൺപിള്ള",
                            "വിലാസിക",
                            "പെണ്ണുംപിള്ള",
                            "പെണ്ണുമ്പിള്ള",
                            "മുതിർന്ന സ്ത്രീ",
                            "ഓമന",
                            "സുന്ദരി",
                            "പെൺകിടാവ്",
                            "പെൺമണി",
                            "ലലന",
                            "ലലനാ",
                            "ലലനാമണി",
                            "നതാംഗി",
                            "പെൺകൊടി",
                            "ബാല",
                            "ബാലിക",
                            "വല്ലി",
                            "ധനി",
                            "ധനിക",
                            "ധനീക",
                            "യുവതി",
                            "വധൂടി",
                            "യൗവനിക",
                            "തരുണി",
                            "പ്രമദ",
                            "പ്രമദാ",
                            "കിടാത്തി",
                            "പുലക്കള്ളി",
                            "കീഴാളപ്പെണ്ണ്",
                            "അരുവ",
                            "ചെറുപ്പക്കാരി",
                            "ചേടി",
                            "പെണ്ടാട്ടി",
                            "പൊണ്ടാട്ടി",
                            "പെണ്ടി",
                            "പെണ്ട്",
                            "അവിവാഹിതയായ പെൺകുട്ടി",
                            "വാമ",
                            "പ്രൗഢ",
                            "അവിവാഹിത",
                            "കാണേലി",
                            "കന്യാപ്പെണ്ണ്",
                            "തെെക്കിഴവി",
                            "പെണ്ണാൾ",
                            "തിരുന്തിഴ",
                            "അതിയാട്ടി",
                            "കന്നിപ്പെണ്ണ്",
                            "അനാഘ്രാതകുസുമം",
                            "മങ്ക",
                            "മടന്ത",
                            "മടവാർ",
                            "ദാരിക",
                            "കുഴലാൾ",
                            "കുഴലി",
                            "കൂന്തലാൾ",
                            "മായോൾ",
                            "മനസ്വിനി",
                            "നിതംബിനി",
                            "അബല",
                            "മാലു",
                            "സീമന്തിനി",
                            "തലോദരി",
                            "പ്രതീപ്രദർശിനി",
                            "ചപല",
                            "കോത",
                            "മിനുക്കി",
                            "മിനുക്കിച്ചി",
                            "പകിട്ടുകാരി",
                            "നിതംബവതി",
                            "വിസുര",
                            "മാനിനി",
                            "അക്ഷത",
                            "അന്യപൂർവ്വ",
                            "അനവദ്യ",
                            "അനൂഢ",
                            "നാടൻപെണ്ണ്",
                            "വർണ്ണിനി",
                            "അപരിണീത",
                            "ദേവസുന്ദരി",
                            "ദേവാംഗന",
                            "ദേവകന്യക",
                            "സുമംഗലി",
                            "സുമംഗളാ",
                            "സുമംഗളാലാ",
                            "ശ്യാമ",
                            "ഔറത്ത്",
                            "കമല",
                            "ലക്ഷണ",
                            "വരവർണ്ണിനി",
                            "വരാരോഹ",
                            "ശിഖരിണി",
                            "ഉത്തമസ്ത്രീ",
                            "ഹരേണു",
                            "മത്തകാശിനി",
                            "കല്യാണി",
                            "കൊമ്പി",
                            "കൊമ്പിച്ചി",
                            "കൊമ്പിയ",
                            "സൗഭാഗ്യവതി",
                            "ഭഗിനി",
                            "ഭഗ്നി",
                            "മാന്യമഹിള",
                            "ചാരുവ്രത",
                            "ചാരുവർദ്ധന",
                            "നാരീമണി",
                            "മഹതി",
                            "ബഹുമാന്യ",
                            "ബഹുമാനിനി",
                            "മാന്യസ്ത്രീ",
                            "മഹിളാരത്നം",
                            "സ്ത്രീരത്നം",
                            "പെണ്ണിൽക്കണ്ണ്",
                            "മേന്നടയാൾ",
                            "നാരീരത്നം",
                            "പരമാംഗന",
                            "ശീതള",
                            "പ്രതീപദർശിനി",
                            "സഭർത്തൃക",
                            "സുദർശന",
                            "സുനയന",
                            "സുഭ്രു",
                            "സൂര്യവല്ലി"
                        ],
                        "content_length": 213,
                        "tokens": "",
                        "tags": [
                            "src:ekkurup"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {
                            "synonyms": [
                                "woman",
                                "lady",
                                "girl",
                                "female",
                                "matron",
                                "lass",
                                "lassie",
                                "colleen",
                                "chick",
                                "girlie",
                                "filly",
                                "biddy",
                                "bird",
                                "wifie",
                                "sister",
                                "dame",
                                "broad",
                                "gal",
                                "jane",
                                "Sheila",
                                "maid",
                                "maiden",
                                "damsel",
                                "wench",
                                "gentlewoman"
                            ]
                        },
                        "status": "enabled",
                        "created_at": "2025-11-01T05:15:21.46612Z",
                        "updated_at": "2025-11-01T05:15:21.46612Z",
                        "total_relations": 2,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:ekkurup"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:15:21.46612Z",
                            "updated_at": "2025-11-01T05:15:21.46612Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:15:21.46612Z",
                "updated_at": "2025-11-01T05:15:21.46612Z",
                "total_relations": 2
            },
            {
                "guid": "56a03e57-5b50-4889-a810-ab01fef29806",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female calf"
                ],
                "content_length": 1,
                "tokens": "'calf':2 'femal':1",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ഫീമെയിൽ കാഫ്"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "64a0f24b-0a1d-45ef-87b1-71a3e79bfb50",
                        "weight": 1,
                        "initial": "പ",
                        "lang": "malayalam",
                        "content": [
                            "പശുക്കിടാവ്"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:17:00.224795Z",
                        "updated_at": "2025-11-01T05:17:00.224795Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:17:00.224795Z",
                            "updated_at": "2025-11-01T05:17:00.224795Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:17:00.224795Z",
                "updated_at": "2025-11-01T05:17:00.224795Z",
                "total_relations": 1
            },
            {
                "guid": "95e39ef7-9823-4a80-b79a-b34b52be742b",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female duck"
                ],
                "content_length": 1,
                "tokens": "'duck':2 'femal':1",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ഫീമെയിൽ ഡക്ക്"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "fb30e518-9b11-4117-ab22-abb5a3de5403",
                        "weight": 1,
                        "initial": "പ",
                        "lang": "malayalam",
                        "content": [
                            "പെൺതാറാവ്"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:16:54.594194Z",
                        "updated_at": "2025-11-01T05:16:54.594194Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:16:54.594194Z",
                            "updated_at": "2025-11-01T05:16:54.594194Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:16:54.594194Z",
                "updated_at": "2025-11-01T05:16:54.594194Z",
                "total_relations": 1
            },
            {
                "guid": "9a455480-860e-4c6d-9304-3b2f2f677797",
                "weight": -1000,
                "initial": "C",
                "lang": "english",
                "content": [
                    "creature neither male or female"
                ],
                "content_length": 1,
                "tokens": "'creatur':1 'femal':5 'male':3 'neither':2",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ക്രിയേച്ചർ നീദർ മെയിൽ ഓർ ഫിമെയിൽ"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "40aa0729-7232-471f-85c4-1c903fc70a5f",
                        "weight": 1,
                        "initial": "ആ",
                        "lang": "malayalam",
                        "content": [
                            "ആണും പെണ്ണുംകെട്ട ജന്തു"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:17:00.224795Z",
                        "updated_at": "2025-11-01T05:17:00.224795Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:17:00.224795Z",
                            "updated_at": "2025-11-01T05:17:00.224795Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:17:00.224795Z",
                "updated_at": "2025-11-01T05:17:00.224795Z",
                "total_relations": 1
            },
            {
                "guid": "78ec9ede-1a6b-4fbd-a040-cfa33191734a",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female genital organ"
                ],
                "content_length": 1,
                "tokens": "'femal':1 'genit':2 'organ':3",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ഫീമെയിൽ ജെനിറ്റൽ ഓർഗൻ"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "287d28dc-150c-4ee0-b056-b447af987f22",
                        "weight": 1,
                        "initial": "സ",
                        "lang": "malayalam",
                        "content": [
                            "സ്ത്രീയുടെ ജനനേന്ദ്രിയം"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:16:54.594194Z",
                        "updated_at": "2025-11-01T05:16:54.594194Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:16:54.594194Z",
                            "updated_at": "2025-11-01T05:16:54.594194Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:16:54.594194Z",
                "updated_at": "2025-11-01T05:16:54.594194Z",
                "total_relations": 1
            },
            {
                "guid": "bad6ac48-7748-4115-b4a4-8eb8939bb0aa",
                "weight": -1000,
                "initial": "M",
                "lang": "english",
                "content": [
                    "male and female"
                ],
                "content_length": 1,
                "tokens": "'femal':3 'male':1",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "മെയ്ൽ ആൻഡ് ഫീമെയ്ൽ"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "01271d4b-772e-4cd0-8aca-257dc6b9ced8",
                        "weight": 1,
                        "initial": "ആ",
                        "lang": "malayalam",
                        "content": [
                            "ആണും പെണ്ണും"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:16:54.594194Z",
                        "updated_at": "2025-11-01T05:16:54.594194Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:16:54.594194Z",
                            "updated_at": "2025-11-01T05:16:54.594194Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:16:54.594194Z",
                "updated_at": "2025-11-01T05:16:54.594194Z",
                "total_relations": 1
            },
            {
                "guid": "43015d48-5f98-4d40-ac09-5070091d34c6",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female of deer"
                ],
                "content_length": 1,
                "tokens": "'deer':3 'femal':1",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ഫീമെയിൽ ഓഫ് ഡിയർ"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "76a5108b-f1f5-48f6-81b6-aaca1e5113af",
                        "weight": 1,
                        "initial": "പ",
                        "lang": "malayalam",
                        "content": [
                            "പെൺമാൻ"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:17:00.224795Z",
                        "updated_at": "2025-11-01T05:17:00.224795Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:17:00.224795Z",
                            "updated_at": "2025-11-01T05:17:00.224795Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:17:00.224795Z",
                "updated_at": "2025-11-01T05:17:00.224795Z",
                "total_relations": 1
            },
            {
                "guid": "d3434006-0513-47ca-87c0-503da2bd7277",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female sex"
                ],
                "content_length": 1,
                "tokens": "'femal':1 'sex':2",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ഫീമെയിൽ സെക്സ്"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "6c1e3858-71cd-4d17-ba1b-b11327f9193c",
                        "weight": 1,
                        "initial": "സ",
                        "lang": "malayalam",
                        "content": [
                            "സ്ത്രീവർഗ്ഗം"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:16:54.594194Z",
                        "updated_at": "2025-11-01T05:16:54.594194Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:16:54.594194Z",
                            "updated_at": "2025-11-01T05:16:54.594194Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:16:54.594194Z",
                "updated_at": "2025-11-01T05:16:54.594194Z",
                "total_relations": 1
            },
            {
                "guid": "b1ba6958-b6c0-4afc-90a0-5dc00b5d9e53",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female fox"
                ],
                "content_length": 1,
                "tokens": "'femal':1 'fox':2",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ഫീമെയിൽ ഫോക്സ്"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "32d537d3-ac19-4846-9521-39da0c1c8e88",
                        "weight": 1,
                        "initial": "പ",
                        "lang": "malayalam",
                        "content": [
                            "പെൺകുറുക്കൻ"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:16:54.594194Z",
                        "updated_at": "2025-11-01T05:16:54.594194Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:16:54.594194Z",
                            "updated_at": "2025-11-01T05:16:54.594194Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:16:54.594194Z",
                "updated_at": "2025-11-01T05:16:54.594194Z",
                "total_relations": 1
            },
            {
                "guid": "039807b6-ca22-4192-b5c1-d2db9ad823a1",
                "weight": -1000,
                "initial": "F",
                "lang": "english",
                "content": [
                    "female crab"
                ],
                "content_length": 1,
                "tokens": "'crab':2 'femal':1",
                "tags": [
                    "src:crowd"
                ],
                "phones": [
                    "ഫീമെയിൽ ക്രാബ്"
                ],
                "notes": "",
                "meta": {},
                "status": "enabled",
                "relations": [
                    {
                        "guid": "c704e2df-3cee-45f7-957c-ae8c2304b623",
                        "weight": 1,
                        "initial": "ക",
                        "lang": "malayalam",
                        "content": [
                            "കർക്കടകി"
                        ],
                        "content_length": 1,
                        "tokens": "",
                        "tags": [
                            "src:crowd"
                        ],
                        "phones": [],
                        "notes": "",
                        "meta": {},
                        "status": "enabled",
                        "created_at": "2025-11-01T05:17:00.224795Z",
                        "updated_at": "2025-11-01T05:17:00.224795Z",
                        "total_relations": 1,
                        "relation": {
                            "types": [
                                "noun"
                            ],
                            "tags": [
                                "src:crowd"
                            ],
                            "notes": "",
                            "weight": 0,
                            "status": "enabled",
                            "created_at": "2025-11-01T05:17:00.224795Z",
                            "updated_at": "2025-11-01T05:17:00.224795Z"
                        }
                    }
                ],
                "created_at": "2025-11-01T05:17:00.224795Z",
                "updated_at": "2025-11-01T05:17:00.224795Z",
                "total_relations": 1
            }
        ],
        "query": {
            "q": "female",
            "from_lang": "english",
            "to_lang": "malayalam",
            "types": [],
            "tags": [],
            "status": "enabled",
            "page": 0,
            "per_page": 0
        },
        "page": 1,
        "per_page": 10,
        "total_pages": 4,
        "total": 37
    }
}
```

#### Error Handling
- **404**: Word not found
- **500**: Server error
- **Network error**: Connection failed

#### Caching Strategy
```javascript
// Cache structure in chrome.storage.local
{
  "hello": {
    "data": { /* API response */ },
    "timestamp": 1699200000000,
    "ttl": 86400000  // 24 hours
  }
}
```

**Benefits:**
- Reduces API calls
- Faster response times
- Offline capability (for cached words)

---

## Process Maps

### Search Process (Detailed)

```
START
  │
  ├─→ User Action?
  │   ├─→ [Double-Click] ──────────────┐
  │   └─→ [Context Menu] ──────────────┤
  │                                     │
  ▼                                     ▼
Check if Double-Click Enabled    Get Selected Text
  │                                     │
  ├─→ [Disabled] → EXIT                 │
  │                                     │
  ▼                                     │
Get Word at Cursor Position             │
  │                                     │
  └─────────────────┬───────────────────┘
                    │
                    ▼
            Detect Language
          detectLanguage(text)
                    │
        ├───────────┴───────────┐
        ▼                       ▼
    [Malayalam]             [English]
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        Set AppState.currentFromLang
                    │
                    ▼
    Send Message to Background
    chrome.runtime.sendMessage({
      action: 'search',
      text: word,
      fromLang: detected,
      toLang: 'malayalam'
    })
                    │
                    ▼
    ┌───────────────────────────┐
    │ Background Service Worker │
    └───────────┬───────────────┘
                │
                ▼
    Get User Settings
    chrome.storage.sync.get()
                │
                ▼
    Validate toLang = 'malayalam'
                │
                ▼
    Check Cache
    chrome.storage.local.get(word)
                │
        ├───────┴────────┐
        ▼                ▼
    [Found]          [Not Found]
        │                │
        │                ▼
        │      Build API URL
        │      buildApiUrl(from, to, word)
        │                │
        │                ▼
        │       Fetch from Olam API
        │       fetch(url)
        │                │
        │                ▼
        │       Parse JSON Response
        │                │
        │                ▼
        │       Cache Result
        │       chrome.storage.local.set()
        │                │
        └────────┬───────┘
                 │
                 ▼
    Return Response to Content Script
                 │
                 ▼
    ┌───────────────────┐
    │  Content Script   │
    └─────────┬─────────┘
              │
              ▼
    Store in AppState
    AppState.apiResponse = data
              │
              ▼
    Parse Results
    - Filter by source (if selected)
    - Limit words (per settings)
    - Extract definitions
              │
              ▼
    Calculate Popup Position
    - Get cursor/selection coordinates
    - Check viewport boundaries
    - Adjust if near edges
              │
              ▼
    Render Popup DOM
    - Header (title, settings, close)
    - Search word display
    - Definitions list
    - Navigation (if multiple entries)
    - Filters (if multiple sources)
    - "View full details" link
              │
              ▼
    Attach Event Listeners
    - Close button
    - Escape key
    - Outside click
    - Drag handler (on header)
    - Navigation buttons
    - Filter buttons
    - Details link
              │
              ▼
    Insert into DOM
    document.body.appendChild(popup)
              │
              ▼
    Popup Visible to User
              │
              ▼
    Wait for User Action
              │
        ├─────┴──────┬──────────┬──────────┐
        ▼            ▼          ▼          ▼
    [Close]    [Navigate]  [Filter]  [Details]
        │            │          │          │
        │            └──────────┴────→ Update Popup
        │                       │
        │                       └──────→ Re-render
        ▼
    Remove Popup from DOM
    popup.remove()
        │
        ▼
      EXIT
```

### Popup Rendering Process

```
START: Render Popup
        │
        ▼
Create Popup Container
popup = createElement('div')
popup.className = 'olam-popup'
        │
        ▼
Create Header
- Logo + Title
- Settings button (⚙)
- Close button (×)
        │
        ▼
Display Search Word
- Highlight current word
- Show language direction
        │
        ▼
Get Current Entry
entry = filteredResults[currentIndex]
        │
        ▼
Render Definitions
FOR EACH definition IN entry.definitions:
  - Word type (noun, verb, etc.)
  - Malayalam translation
  - Example sentences (if any)
        │
        ▼
Add Navigation Controls?
IF filteredResults.length > 1:
  - Previous button (‹)
  - Counter (1/3)
  - Next button (›)
        │
        ▼
Add Source Filters?
IF multiple sources available:
  - "All Sources" button
  - "E. K. Kurup" button
  - "Crowd Sourced" button
  - Highlight active filter
        │
        ▼
Add Footer
- "View full details →" link
- Build URL: buildDictionaryUrl()
        │
        ▼
Calculate Position
- Get cursor/selection position
- Viewport boundaries check
- Adjust if near edges
        │
        ▼
Apply Position
popup.style.left = x + 'px'
popup.style.top = y + 'px'
        │
        ▼
Attach Event Handlers
- closePopup()
- handleNavigation()
- handleFilter()
- enableDrag()
- handleEscape()
- handleOutsideClick()
        │
        ▼
Insert into DOM
document.body.appendChild(popup)
        │
        ▼
      DONE
```

---

## File Structure

```
olam-chrome-extension/
│
├── manifest.json                 # Extension configuration (Manifest V3)
│
├── background.js                 # Background service worker
│   ├── OlamAPI                   # API communication
│   ├── ContextMenu               # Right-click menu
│   ├── SettingsService           # Storage management
│   └── MessageHandler            # Inter-component messaging
│
├── content.js                    # Content script (injected into pages)
│   ├── AppState                  # Global state management
│   ├── API                       # Background communication interface
│   ├── PopupUI                   # Popup rendering
│   ├── EventListeners            # User interaction handlers
│   └── DragHandler               # Popup dragging
│
├── popup.html                    # Extension toolbar popup UI
├── popup.js                      # Popup functionality
│
├── options.html                  # Settings page UI
├── options.js                    # Settings management
│
├── styles.css                    # Popup and UI styles
│
├── utils/                        # Shared utilities
│   ├── detectLanguage.js         # Language detection
│   ├── constants.js              # Configuration constants
│   └── urlBuilder.js             # URL construction
│
├── icons/                        # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── tests/                        # Test suite
│   ├── setup.js                  # Jest configuration
│   ├── mocks/
│   │   └── chrome-api.js         # Chrome API mocks
│   ├── unit/
│   │   ├── api.test.js           # Content script API tests
│   │   ├── background-api.test.js# Background API tests
│   │   ├── appstate.test.js      # State management tests
│   │   ├── settings-service.test.js # Settings tests
│   │   ├── urlBuilder.test.js    # URL builder tests
│   │   └── constants.test.js     # Constants tests
│   └── integration/
│       └── search-flow.test.js   # End-to-end tests
│
├── package.json                  # Dependencies and scripts
├── jest.config.js                # Jest configuration
│
├── README.md                     # Project documentation
├── TESTING_CHECKLIST.md          # Manual testing guide
├── CODE_REVIEW.md                # Code review notes
└── IMPLEMENTATION.md             # Implementation details
```

---

## Communication Patterns

### Message Passing Architecture

#### 1. Content Script → Background Worker

```javascript
// Content Script sends message
chrome.runtime.sendMessage({
  action: 'search',
  text: 'hello',
  fromLang: 'english',
  toLang: 'malayalam'
}, (response) => {
  if (response.success) {
    console.log('Results:', response.data);
  } else {
    console.error('Error:', response.error);
  }
});
```

```javascript
// Background Worker receives message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'search') {
    OlamAPI.search(request.text, request.fromLang, request.toLang)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
  }
});
```

#### 2. Background Worker → Content Script

```javascript
// Background Worker sends message
chrome.tabs.sendMessage(tabId, {
  action: 'showResults',
  data: searchResults,
  position: { x: 100, y: 200 }
});
```

```javascript
// Content Script receives message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showResults') {
    PopupUI.render(request.data, request.position);
    sendResponse({ received: true });
  }
});
```

### Storage Communication

#### Chrome Storage Sync (User Settings)
```javascript
// Save settings
chrome.storage.sync.set({
  doubleClickEnabled: true,
  fromLanguage: 'auto',
  toLanguage: 'malayalam',
  resultLimit: 3
});

// Load settings
chrome.storage.sync.get(['fromLanguage', 'toLanguage'], (result) => {
  const fromLang = result.fromLanguage || 'auto';
  const toLang = result.toLanguage || 'malayalam';
});
```

#### Chrome Storage Local (Cache)
```javascript
// Cache search result
chrome.storage.local.set({
  [`cache_${word}`]: {
    data: apiResponse,
    timestamp: Date.now()
  }
});

// Retrieve from cache
chrome.storage.local.get([`cache_${word}`], (result) => {
  if (result[`cache_${word}`]) {
    return result[`cache_${word}`].data;
  }
});
```

---

## State Management

### AppState (Content Script)

```javascript
const AppState = {
  // Current search context
  currentSearchWord: '',
  currentFromLang: 'auto',
  currentToLang: 'malayalam',
  
  // API response data
  apiResponse: null,
  
  // UI state
  currentEntryIndex: 0,
  currentSourceFilter: 'all',
  popupVisible: false,
  
  // User preferences (loaded from storage)
  doubleClickEnabled: true,
  resultLimit: 3,
  
  // Methods
  reset() {
    this.currentSearchWord = '';
    this.apiResponse = null;
    this.currentEntryIndex = 0;
    this.currentSourceFilter = 'all';
  },
  
  updateFromSettings(settings) {
    this.doubleClickEnabled = settings.doubleClickEnabled ?? true;
    this.resultLimit = settings.resultLimit ?? 3;
  }
};
```

### State Lifecycle

```
Page Load
    │
    ▼
Initialize AppState
- Set defaults
- Load settings from chrome.storage.sync
    │
    ▼
User Triggers Search
    │
    ▼
Update State
- currentSearchWord
- currentFromLang
- currentToLang
    │
    ▼
API Call
    │
    ▼
Update State
- apiResponse
- Reset currentEntryIndex
- Reset currentSourceFilter
    │
    ▼
Render UI
- Read from AppState
    │
    ▼
User Interacts (Navigate/Filter)
    │
    ▼
Update State
- currentEntryIndex
- currentSourceFilter
    │
    ▼
Re-render UI
    │
    ▼
User Closes Popup
    │
    ▼
Reset State
- AppState.reset()
    │
    ▼
Ready for Next Search
```

---

## Testing Architecture

### Test Structure

```
tests/
├── setup.js                    # Global test setup
│   ├── Jest configuration
│   ├── jsdom environment
│   └── Chrome API mocks
│
├── mocks/
│   └── chrome-api.js          # Reusable Chrome API mocks
│       ├── setupChromeMock()
│       └── createMockOlamResponse()
│
├── unit/                      # Unit tests (102 tests)
│   ├── api.test.js           # Content script API (11 tests)
│   ├── background-api.test.js# Background API (17 tests)
│   ├── appstate.test.js      # State management (16 tests)
│   ├── settings-service.test.js # Settings (7 tests)
│   ├── urlBuilder.test.js    # URL builder (19 tests)
│   └── constants.test.js     # Constants (32 tests)
│
└── integration/               # Integration tests (3 tests)
    └── search-flow.test.js   # End-to-end flows
```

### Test Coverage

```
Component               Tests    Coverage
─────────────────────────────────────────
AppState                  16     State management
API (Content)             11     Search, language detection
OlamAPI (Background)      17     API calls, caching
Settings Service           7     Storage, defaults
URL Builder               19     URL construction
Constants                 27     Configuration
Integration                3     End-to-end flows
─────────────────────────────────────────
Total                    100     Comprehensive
```

### Testing Strategy

#### 1. Unit Tests
- Test individual functions in isolation
- Mock external dependencies (Chrome APIs, fetch)
- Verify input/output correctness
- Test edge cases and error handling

#### 2. Integration Tests
- Test component interaction
- Verify message passing
- Test end-to-end search flows
- Validate state transitions

#### 3. Mock Strategy
```javascript
// Chrome API mocks
chrome.runtime.sendMessage = jest.fn();
chrome.storage.sync.get = jest.fn();
chrome.storage.local.set = jest.fn();

// Fetch mocks
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData)
  })
);
```

---

## Performance Considerations

### Optimization Strategies

#### 1. Caching
- **Local Storage Cache**: Reduces API calls
- **Cache Duration**: 24 hours (configurable)
- **Cache Size**: Limited by Chrome (5MB)

#### 2. Lazy Loading
- Content script only loads when needed
- Background worker stays alive (service worker)
- Popup only loads when toolbar icon clicked

#### 3. DOM Optimization
- Single popup instance (reuse DOM)
- Event delegation for navigation/filters
- Minimize reflows/repaints

#### 4. API Efficiency
- Batch requests (future enhancement)
- Debounce rapid searches
- Cancel previous requests

### Memory Management

```javascript
// Cleanup on popup close
function closePopup() {
  // Remove event listeners
  document.removeEventListener('keydown', handleEscape);
  document.removeEventListener('click', handleOutsideClick);
  
  // Remove DOM element
  popup.remove();
  
  // Reset state
  AppState.reset();
  
  // Clear references
  popup = null;
}
```

---

## Security Considerations

### Content Security Policy

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Permissions

```json
{
  "permissions": [
    "storage",        // For caching and settings
    "contextMenus",   // For right-click menu
    "activeTab"       // For content script injection
  ]
}
```

### Data Privacy
- **No personal data collection**
- **No analytics or tracking**
- **Local storage only**
- **HTTPS API calls**

### Input Sanitization
```javascript
// Sanitize user input before API call
function sanitizeText(text) {
  return text.trim().slice(0, 100); // Limit length
}

// Escape HTML in popup
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

---

## Future Architecture Considerations

### Scalability
1. **Multi-language support**: Architecture supports adding more languages
2. **Offline mode**: Service worker can handle offline scenarios
3. **Advanced caching**: IndexedDB for larger cache
4. **Performance monitoring**: Add telemetry (opt-in)

### Maintainability
1. **Modular design**: Easy to add new features
2. **Test coverage**: 105 tests ensure stability
3. **Documentation**: Comprehensive architecture docs
4. **Code patterns**: Consistent style and structure

### Extensibility
1. **Plugin system**: Allow custom dictionaries
2. **API abstraction**: Easy to switch dictionary sources
3. **Theme support**: Customizable popup styles
4. **Keyboard shortcuts**: Add configurable hotkeys

---

## Deployment Architecture

### Build Process
```bash
# Development
npm install          # Install dependencies
npm test             # Run test suite
npm run test:watch   # Watch mode for development

# Production
# No build step required (vanilla JS)
# Load extension directly in chrome://extensions/
```

### Version Control
```
main branch          # Stable production code
testing branch       # Testing and QA
feature/* branches   # New features
bugfix/* branches    # Bug fixes
```

### Release Process
1. Create feature branch
2. Implement and test
3. Run automated tests (`npm test`)
4. Manual testing (TESTING_CHECKLIST.md)
5. Code review
6. Merge to testing branch
7. QA validation
8. Merge to main
9. Tag release version
10. Publish to Chrome Web Store

---

## Debugging and Monitoring

### Debug Tools

#### Content Script
```javascript
// Chrome DevTools (Page Console)
// F12 on any webpage
console.log('Search triggered:', AppState.currentSearchWord);
console.log('API Response:', AppState.apiResponse);
```

#### Background Worker
```javascript
// chrome://extensions/ → Click "service worker"
console.log('API Request:', url);
console.log('Cache hit:', cacheKey);
console.error('API Error:', error);
```

#### Popup
```javascript
// Right-click popup → Inspect
console.log('Popup rendered:', popup.innerHTML);
```

### Error Tracking

```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Extension error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno
  });
});
```

---

## Corner Cases & Production Readiness

### Real API Testing
Comprehensive API testing was conducted with 10 test scenarios covering:
- English → Malayalam translations
- Malayalam → Malayalam translations  
- Edge cases (non-existent words, special characters, multi-word phrases)
- Large datasets (222 entries, 60+ translation words)
- Pagination scenarios (up to 23 pages)

**Result:** ✅ All corner cases properly handled with no code changes needed.

### Identified Corner Cases

1. **Empty Results**: Words not found (e.g., "xyzabc", "hello world")
   - Handler: Shows "No results found" message with language settings reminder
   - Feature: Displays current Source/Target language settings
   - Action: Clickable link to open settings page
   - Code: `content.js` lines 460-495

2. **Wrong Language Setting**: Searching with incorrect source language
   - Handler: No results message shows current settings (e.g., "Source: Malayalam")
   - UX: Helps users understand why search failed
   - Action: Direct link to change settings without leaving current page

3. **Page Zoom**: User zooms in/out while popup is visible
   - Handler: Popup automatically repositions within viewport bounds
   - Code: Visual viewport API with resize listeners
   - Prevents: Popup going off-screen or title bar disappearing

4. **Pagination**: Large result sets split into pages
   - Handler: Shows first 10 entries (by design)
   - Navigation: User can browse with ← → buttons
   - Code: `content.js` lines 68-92

5. **Large Content Arrays**: 50+ translation words per relation
   - Handler: Result limit feature (default: 50 words)
   - User control: Settings allow 10/20/50/all
   - Code: `content.js` lines 586-605

6. **Special Characters**: Queries like "test!@#"
   - Handler: URL encoding + API gracefully ignores
   - Code: `utils/urlBuilder.js`

7. **Multi-Word Phrases**: Queries like "hello world"
   - Handler: Same as empty results (Olam is word-based)
   - Code: Same as corner case #1

### Error Handling Coverage

✅ **Null Safety**:
```javascript
// All critical paths protected
if (data.data && data.data.entries && data.data.entries.length > 0)
if (!relation.content) return;
if (!relation.relation?.types) return;
```

✅ **Try-Catch Blocks**: All API calls wrapped with error handling

✅ **User Feedback**: Clear messages for all states (loading, success, error, empty)

### Testing Documentation

For detailed corner case analysis, test results, and code validation:
- **Corner Cases Report**: `.local/corner-cases-analysis.md`
- **API Test Results**: `.local/api-test-results.json`
- **Test Analysis**: `.local/api-analysis-report.md`

---

## Glossary

**AppState**: Global state object in content script that manages current search context

**Background Service Worker**: Persistent script that handles API calls and storage

**Content Script**: Script injected into web pages to handle user interactions

**Context Menu**: Right-click menu option for searching selected text

**Double-Click Search**: Primary interaction method for word lookup

**Manifest V3**: Latest Chrome Extension manifest version with service workers

**Olam API**: External dictionary API providing Malayalam translations

**Popup UI**: Inline dictionary popup that appears on web pages

**Service Worker**: Background script that runs independently of web pages

**Storage Sync**: Chrome storage that syncs across user's devices

**Storage Local**: Chrome storage that stays on local device

---

**Document Version:** 1.1  
**Last Updated:** November 5, 2025  
**Maintained By:** Development Team  
**Review Cycle:** Quarterly

**Recent Updates:**
- v1.1 (Nov 5, 2025): Added corner cases analysis and production readiness section
- v1.0 (Nov 5, 2025): Initial comprehensive architecture documentation
