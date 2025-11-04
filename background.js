// =============================================================================
// OLAM DICTIONARY CHROME EXTENSION - BACKGROUND SERVICE WORKER (REFACTORED)
// =============================================================================
// Handles API requests, context menu, and message passing
// =============================================================================

'use strict';

// =============================================================================
// CONSTANTS
// =============================================================================

const API_BASE_URL = 'https://olam.in/api/dictionary';
const CONTEXT_MENU_ID = 'searchOlam';
const DEFAULT_FROM_LANG = 'english';
const DEFAULT_TO_LANG = 'malayalam';

// =============================================================================
// API SERVICE
// =============================================================================

/**
 * API service for Olam dictionary
 */
const OlamAPI = {
  /**
   * Search for a word in Olam dictionary
   * @param {string} text - Word to search
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   * @returns {Promise<Object>} API response
   */
  async search(text, fromLang, toLang) {
    const url = `${API_BASE_URL}/${fromLang}/${toLang}/${encodeURIComponent(text)}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      await this.cacheResult(text, data);
      
      return data;
    } catch (error) {
      console.error('Olam API error:', error);
      throw error;
    }
  },
  
  /**
   * Cache search result
   * @param {string} query - Search query
   * @param {Object} result - Search result
   */
  async cacheResult(query, result) {
    try {
      await chrome.storage.local.set({
        lastSearch: {
          query: query,
          result: result,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Cache error:', error);
    }
  },
  
  /**
   * Get last cached search result
   * @returns {Promise<Object|null>} Cached result or null
   */
  async getLastSearch() {
    try {
      const result = await chrome.storage.local.get(['lastSearch']);
      return result.lastSearch || null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }
};

// =============================================================================
// SETTINGS SERVICE
// =============================================================================

/**
 * Settings service
 */
const SettingsService = {
  /**
   * Get user language preferences
   * @returns {Promise<Object>} Language settings
   */
  async getLanguagePreferences() {
    try {
      const settings = await chrome.storage.sync.get(['fromLanguage', 'toLanguage']);
      return {
        fromLang: settings.fromLanguage || DEFAULT_FROM_LANG,
        toLang: settings.toLanguage || DEFAULT_TO_LANG
      };
    } catch (error) {
      console.error('Settings error:', error);
      return {
        fromLang: DEFAULT_FROM_LANG,
        toLang: DEFAULT_TO_LANG
      };
    }
  }
};

// =============================================================================
// CONTEXT MENU SERVICE
// =============================================================================

/**
 * Context menu management
 */
const ContextMenuService = {
  /**
   * Initialize context menu
   */
  init() {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Search "%s" in Olam Dictionary',
      contexts: ['selection']
    });
  },
  
  /**
   * Handle context menu click
   * @param {Object} info - Click info
   * @param {Object} tab - Active tab
   */
  async handleClick(info, tab) {
    if (info.menuItemId !== CONTEXT_MENU_ID) return;
    
    const text = info.selectionText;
    if (!text) return;
    
    try {
      // Get language preferences
      const { fromLang, toLang } = await SettingsService.getLanguagePreferences();
      
      // Perform search
      const data = await OlamAPI.search(text, fromLang, toLang);
      
      // Send results to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showPopup',
        word: text,
        data: data
      });
    } catch (error) {
      console.error('Context menu search error:', error);
    }
  }
};

// =============================================================================
// MESSAGE HANDLER
// =============================================================================

/**
 * Message handling service
 */
const MessageHandler = {
  /**
   * Handle incoming messages
   * @param {Object} request - Message request
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response callback
   * @returns {boolean} True to keep channel open
   */
  async handle(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'searchWord':
          await this.handleSearch(request, sendResponse);
          return true;
          
        case 'getLastSearch':
          await this.handleGetLastSearch(sendResponse);
          return true;
          
        case 'openOptions':
          this.handleOpenOptions();
          return false;
          
        default:
          console.warn('Unknown action:', request.action);
          sendResponse({ success: false, error: 'Unknown action' });
          return false;
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
      return false;
    }
  },
  
  /**
   * Handle search request
   * @param {Object} request - Search request
   * @param {Function} sendResponse - Response callback
   */
  async handleSearch(request, sendResponse) {
    const { text, fromLang, toLang } = request;
    
    if (!text) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }
    
    try {
      const data = await OlamAPI.search(
        text,
        fromLang || DEFAULT_FROM_LANG,
        toLang || DEFAULT_TO_LANG
      );
      
      sendResponse({ success: true, data: data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  },
  
  /**
   * Handle get last search request
   * @param {Function} sendResponse - Response callback
   */
  async handleGetLastSearch(sendResponse) {
    const lastSearch = await OlamAPI.getLastSearch();
    sendResponse(lastSearch);
  },
  
  /**
   * Handle open options request
   */
  handleOpenOptions() {
    chrome.runtime.openOptionsPage();
  }
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the background service worker
 */
function init() {
  // Setup context menu on install
  chrome.runtime.onInstalled.addListener(() => {
    ContextMenuService.init();
  });
  
  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    ContextMenuService.handleClick(info, tab);
  });
  
  // Handle messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    MessageHandler.handle(request, sender, sendResponse);
    return true; // Keep channel open for async responses
  });
}

// Start the service worker
init();
