/**
 * Shared Constants
 * Application-wide constants used across multiple modules
 */

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

// Content Script Files (must match manifest.json order for dynamic injection)
const CONTENT_SCRIPT_FILES = [
  'utils/constants.js',
  'utils/detectLanguage.js',
  'utils/urlBuilder.js',
  'content.js'
];

// Export for CommonJS (tests using Jest/Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_BASE_URL,
    DICTIONARY_BASE_URL,
    DEFAULT_FROM_LANG,
    DEFAULT_TO_LANG,
    SUPPORTED_LANGUAGES,
    CONTEXT_MENU_ID,
    CONTENT_SCRIPT_FILES
  };
}

// Make available globally for browser context (service worker and content scripts)
if (typeof self !== 'undefined') {
  self.API_BASE_URL = API_BASE_URL;
  self.DICTIONARY_BASE_URL = DICTIONARY_BASE_URL;
  self.DEFAULT_FROM_LANG = DEFAULT_FROM_LANG;
  self.DEFAULT_TO_LANG = DEFAULT_TO_LANG;
  self.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
  self.CONTEXT_MENU_ID = CONTEXT_MENU_ID;
  self.CONTENT_SCRIPT_FILES = CONTENT_SCRIPT_FILES;
}
