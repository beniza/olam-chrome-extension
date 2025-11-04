// =============================================================================
// OLAM DICTIONARY CHROME EXTENSION - CONTENT SCRIPT (REFACTORED)
// =============================================================================
// Inline dictionary lookup with Malayalam/English translations
// Features: Double-click search, context menu integration, result navigation
// =============================================================================

'use strict';

// =============================================================================
// STATE MANAGEMENT MODULE
// =============================================================================

/**
 * Application state manager
 * Centralizes all state management for easier testing and debugging
 */
const AppState = {
  // UI References
  popup: null,
  
  // User Settings
  doubleClickEnabled: true,
  resultLimit: 3,
  
  // Search State
  currentData: null,
  currentEntryIndex: 0,
  currentFilterTag: null,
  currentSearchWord: '',
  currentFromLang: '',
  currentToLang: '',
  
  /**
   * Reset search state
   */
  resetSearchState() {
    this.currentData = null;
    this.currentEntryIndex = 0;
    this.currentFilterTag = null;
    this.currentSearchWord = '';
    this.currentFromLang = '';
    this.currentToLang = '';
  },
  
  /**
   * Set search data
   * @param {Object} data - API response data
   * @param {string} word - Searched word
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   */
  setSearchData(data, word, fromLang, toLang) {
    this.currentData = data;
    this.currentSearchWord = word;
    this.currentFromLang = fromLang;
    this.currentToLang = toLang;
    this.currentEntryIndex = 0;
    this.currentFilterTag = null;
  },
  
  /**
   * Get filtered entries based on current filter tag
   * @returns {Array} Filtered entries
   */
  getFilteredEntries() {
    if (!this.currentData?.data?.entries) return [];
    
    if (!this.currentFilterTag) {
      return this.currentData.data.entries;
    }
    
    return this.currentData.data.entries.filter(
      entry => entry.tags?.includes(this.currentFilterTag)
    );
  },
  
  /**
   * Navigate to next entry
   * @returns {boolean} Success status
   */
  nextEntry() {
    const entries = this.getFilteredEntries();
    if (this.currentEntryIndex < entries.length - 1) {
      this.currentEntryIndex++;
      return true;
    }
    return false;
  },
  
  /**
   * Navigate to previous entry
   * @returns {boolean} Success status
   */
  prevEntry() {
    if (this.currentEntryIndex > 0) {
      this.currentEntryIndex--;
      return true;
    }
    return false;
  },
  
  /**
   * Set filter tag and reset entry index
   * @param {string|null} tag - Filter tag or null for all
   */
  setFilterTag(tag) {
    this.currentFilterTag = tag;
    this.currentEntryIndex = 0;
  }
};

// =============================================================================
// SETTINGS MODULE
// =============================================================================

/**
 * User settings management
 */
const Settings = {
  /**
   * Load settings from Chrome storage
   */
  async load() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['doubleClickEnabled', 'resultLimit'], (result) => {
        AppState.doubleClickEnabled = result.doubleClickEnabled !== false;
        AppState.resultLimit = result.resultLimit === 'all' ? 'all' : parseInt(result.resultLimit || '3', 10);
        resolve();
      });
    });
  },
  
  /**
   * Listen for settings changes
   */
  watchChanges() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.doubleClickEnabled) {
        AppState.doubleClickEnabled = changes.doubleClickEnabled.newValue;
      }
      if (changes.resultLimit) {
        AppState.resultLimit = changes.resultLimit.newValue === 'all' ? 'all' : parseInt(changes.resultLimit.newValue || '3', 10);
      }
    });
  }
};

// =============================================================================
// API MODULE
// =============================================================================

/**
 * API communication handler
 */
const API = {
  /**
   * Detect language from text
   * @param {string} text - Text to analyze
   * @returns {string} Detected language code
   */
  detectLanguage(text) {
    // Malayalam characters are in range U+0D00 to U+0D7F
    return /[\u0D00-\u0D7F]/.test(text) ? 'malayalam' : 'english';
  },
  
  /**
   * Search for a word in Olam dictionary
   * @param {string} text - Word to search
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   * @returns {Promise<Object>} API response
   */
  async search(text, fromLang = null, toLang = 'malayalam') {
    const sourceLang = fromLang || this.detectLanguage(text);
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'searchWord',
        text: text,
        fromLang: sourceLang,
        toLang: toLang
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (response?.success && response?.data) {
          resolve(response.data);
        } else {
          reject(new Error('Search failed'));
        }
      });
    });
  }
};

// =============================================================================
// UI MODULE
// =============================================================================

/**
 * UI management and popup rendering
 */
const UI = {
  /**
   * Get popup template HTML
   * @returns {string} HTML template
   */
  getPopupTemplate() {
    return `<div class="olam-popup-header">
  <div class="olam-popup-title">
    <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="Olam" class="olam-icon">
    <span>Olam Dictionary</span>
  </div>
  
  <div class="olam-popup-nav" id="olam-nav" style="display: none;">
    <button class="olam-nav-btn" id="olam-prev-btn" title="Previous entry">‹</button>
    <span class="olam-nav-info" id="olam-nav-info">1/1</span>
    <button class="olam-nav-btn" id="olam-next-btn" title="Next entry">›</button>
  </div>
  
  <button class="olam-popup-settings" id="olam-settings-btn" title="Settings">⚙</button>
  <button class="olam-popup-close" id="olam-close-btn" title="Close">×</button>
</div>

<div class="olam-popup-content">
  <div class="olam-loading">
    <div class="olam-spinner"></div>
    <p>Searching...</p>
  </div>
  
  <div class="olam-results" id="olam-results"></div>
  
  <div class="olam-no-results" id="olam-no-results" style="display: none;">
    <p>No results found</p>
  </div>
</div>`;
  },
  
  /**
   * Create and initialize popup element
   * @returns {HTMLElement} Popup element
   */
  createPopup() {
    if (AppState.popup) return AppState.popup;
    
    const popup = document.createElement('div');
    popup.id = 'olam-dictionary-popup';
    popup.className = 'olam-popup-hidden';
    popup.innerHTML = this.getPopupTemplate();
    
    document.body.appendChild(popup);
    AppState.popup = popup;
    
    this.attachPopupEventListeners(popup);
    
    return popup;
  },
  
  /**
   * Attach event listeners to popup elements
   * @param {HTMLElement} popup - Popup element
   */
  attachPopupEventListeners(popup) {
    // Prevent click propagation
    popup.addEventListener('click', (e) => e.stopPropagation());
    
    // Close button
    popup.querySelector('#olam-close-btn').addEventListener('click', () => {
      this.hidePopup();
    });
    
    // Settings button
    popup.querySelector('#olam-settings-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openOptions' });
    });
    
    // Make popup draggable by title
    this.makeDraggable(popup);
  },
  
  /**
   * Make popup draggable by clicking and dragging the title area
   * @param {HTMLElement} popup - Popup element
   */
  makeDraggable(popup) {
    const title = popup.querySelector('.olam-popup-title');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    title.style.cursor = 'move';
    
    const dragStart = (e) => {
      if (e.type === 'mousedown') {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === title || title.contains(e.target)) {
          isDragging = true;
        }
      }
    };
    
    const dragEnd = (e) => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    };
    
    const drag = (e) => {
      if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        xOffset = currentX;
        yOffset = currentY;
        
        // Get current position
        const rect = popup.getBoundingClientRect();
        const newLeft = rect.left + currentX;
        const newTop = rect.top + currentY;
        
        // Set new position
        popup.style.left = newLeft + 'px';
        popup.style.top = newTop + 'px';
        
        // Reset offsets for next drag
        xOffset = 0;
        yOffset = 0;
        initialX = e.clientX;
        initialY = e.clientY;
      }
    };
    
    title.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
  },
  
  /**
   * Calculate optimal popup position
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @param {DOMRect} popupRect - Popup dimensions
   * @returns {Object} Position {left, top}
   */
  calculatePosition(x, y, popupRect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = x + 10;
    let top = y + 10;
    
    // Adjust if popup goes off-screen
    if (left + popupRect.width > viewportWidth) {
      left = viewportWidth - popupRect.width - 20;
    }
    
    if (top + popupRect.height > viewportHeight) {
      top = y - popupRect.height - 10;
    }
    
    return { left, top };
  },
  
  /**
   * Show popup at specified coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  showPopup(x, y) {
    const popup = this.createPopup();
    popup.classList.remove('olam-popup-hidden');
    popup.classList.add('olam-popup-visible');
    
    const popupRect = popup.getBoundingClientRect();
    const position = this.calculatePosition(x, y, popupRect);
    
    popup.style.left = `${position.left}px`;
    popup.style.top = `${position.top}px`;
  },
  
  /**
   * Hide popup
   */
  hidePopup() {
    if (AppState.popup) {
      AppState.popup.classList.remove('olam-popup-visible');
      AppState.popup.classList.add('olam-popup-hidden');
    }
  },
  
  /**
   * Show loading state
   */
  showLoading() {
    if (!AppState.popup) return;
    
    const loadingEl = AppState.popup.querySelector('.olam-loading');
    const resultsEl = AppState.popup.querySelector('#olam-results');
    const noResultsEl = AppState.popup.querySelector('#olam-no-results');
    
    loadingEl.style.display = 'flex';
    resultsEl.innerHTML = '';
    noResultsEl.style.display = 'none';
  },
  
  /**
   * Hide loading state
   */
  hideLoading() {
    if (!AppState.popup) return;
    
    const loadingEl = AppState.popup.querySelector('.olam-loading');
    loadingEl.style.display = 'none';
  },
  
  /**
   * Show no results message
   */
  showNoResults() {
    if (!AppState.popup) return;
    
    const resultsEl = AppState.popup.querySelector('#olam-results');
    const noResultsEl = AppState.popup.querySelector('#olam-no-results');
    
    resultsEl.innerHTML = '';
    noResultsEl.style.display = 'block';
  },
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    if (!AppState.popup) return;
    
    const resultsEl = AppState.popup.querySelector('#olam-results');
    resultsEl.innerHTML = `<div class="olam-error">${message}</div>`;
  }
};

// =============================================================================
// RENDERER MODULE
// =============================================================================

/**
 * Results rendering and display
 */
const Renderer = {
  /**
   * Render search results
   */
  renderResults() {
    const entries = AppState.getFilteredEntries();
    
    if (entries.length === 0) {
      UI.showNoResults();
      this.updateNavigation();
      return;
    }
    
    this.renderEntry(entries[AppState.currentEntryIndex]);
    this.updateNavigation();
  },
  
  /**
   * Render a single dictionary entry
   * @param {Object} entry - Dictionary entry
   */
  renderEntry(entry) {
    if (!AppState.popup) return;
    
    const resultsEl = AppState.popup.querySelector('#olam-results');
    resultsEl.innerHTML = '';
    
    // Word header
    const wordDiv = document.createElement('div');
    wordDiv.className = 'olam-word';
    wordDiv.textContent = entry.content[0];
    resultsEl.appendChild(wordDiv);
    
    // Source filters
    this.renderSourceFilters(resultsEl);
    
    // Meaning and type
    if (entry.relations?.length > 0) {
      this.renderMeaning(resultsEl, entry.relations[0]);
      this.renderType(resultsEl, entry.relations[0]);
    }
    
    // Full details link
    this.renderDetailsLink(resultsEl);
  },
  
  /**
   * Render source filter buttons
   * @param {HTMLElement} container - Container element
   */
  renderSourceFilters(container) {
    const allTags = this.collectSourceTags();
    
    if (allTags.size === 0) return;
    
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'olam-tag-filters';
    
    // "All Sources" button
    const allBtn = this.createFilterButton('All Sources', null);
    tagsDiv.appendChild(allBtn);
    
    // Individual source buttons
    allTags.forEach(tag => {
      const btn = this.createFilterButton(this.formatSourceTag(tag), tag);
      tagsDiv.appendChild(btn);
    });
    
    container.appendChild(tagsDiv);
  },
  
  /**
   * Collect all source tags from entries
   * @returns {Set<string>} Set of source tags
   */
  collectSourceTags() {
    const tags = new Set();
    
    AppState.currentData?.data?.entries?.forEach(entry => {
      entry.tags?.forEach(tag => {
        if (tag.startsWith('src:')) {
          tags.add(tag);
        }
      });
    });
    
    return tags;
  },
  
  /**
   * Format source tag for display
   * @param {string} tag - Raw tag
   * @returns {string} Formatted tag
   */
  formatSourceTag(tag) {
    if (tag === 'src:ekkurup') return 'E. K. Kurup';
    if (tag === 'src:crowd') return 'Crowd Sourced';
    return tag.replace('src:', '');
  },
  
  /**
   * Create filter button element
   * @param {string} label - Button label
   * @param {string|null} tag - Filter tag
   * @returns {HTMLElement} Button element
   */
  createFilterButton(label, tag) {
    const btn = document.createElement('button');
    btn.className = 'olam-tag-filter';
    btn.textContent = label;
    
    // Add active/inactive classes
    if (AppState.currentFilterTag === tag) {
      btn.classList.add('active');
    } else if (AppState.currentFilterTag !== null) {
      btn.classList.add('inactive');
    }
    
    // Add special styling
    if (tag === 'src:ekkurup') btn.classList.add('tag-ekkurup');
    if (tag === 'src:crowd') btn.classList.add('tag-crowd');
    
    btn.onclick = () => {
      AppState.setFilterTag(AppState.currentFilterTag === tag ? null : tag);
      this.renderResults();
    };
    
    return btn;
  },
  
  /**
   * Render meaning section
   * @param {HTMLElement} container - Container element
   * @param {Object} relation - Relation data
   */
  renderMeaning(container, relation) {
    if (!relation.content) return;
    
    const meaningDiv = document.createElement('div');
    meaningDiv.className = 'olam-meaning';
    
    const limit = AppState.resultLimit;
    let words;
    let hasMore = false;
    
    if (limit === 'all') {
      words = relation.content;
    } else {
      words = relation.content.slice(0, limit);
      hasMore = relation.content.length > limit;
    }
    
    meaningDiv.textContent = words.join(', ');
    if (hasMore) {
      meaningDiv.textContent += '...';
    }
    
    container.appendChild(meaningDiv);
  },
  
  /**
   * Render word type section
   * @param {HTMLElement} container - Container element
   * @param {Object} relation - Relation data
   */
  renderType(container, relation) {
    if (!relation.relation?.types) return;
    
    const typeDiv = document.createElement('div');
    typeDiv.className = 'olam-type';
    typeDiv.textContent = relation.relation.types.join(', ');
    container.appendChild(typeDiv);
  },
  
  /**
   * Render full details link
   * @param {HTMLElement} container - Container element
   */
  renderDetailsLink(container) {
    const linkDiv = document.createElement('div');
    linkDiv.className = 'olam-link';
    linkDiv.innerHTML = `
      <a href="https://olam.in/dictionary/${AppState.currentFromLang}/${AppState.currentToLang}/${encodeURIComponent(AppState.currentSearchWord)}" target="_blank">
        View full details →
      </a>
    `;
    container.appendChild(linkDiv);
  },
  
  /**
   * Update navigation controls
   */
  updateNavigation() {
    if (!AppState.popup) return;
    
    const navEl = AppState.popup.querySelector('#olam-nav');
    const entries = AppState.getFilteredEntries();
    
    // Show/hide navigation
    if (entries.length <= 1) {
      navEl.style.display = 'none';
      return;
    }
    
    navEl.style.display = 'flex';
    
    // Update counter
    const navInfo = navEl.querySelector('#olam-nav-info');
    navInfo.textContent = `${AppState.currentEntryIndex + 1}/${entries.length}`;
    
    // Update buttons
    this.updateNavigationButtons(navEl, entries.length);
  },
  
  /**
   * Update navigation buttons state
   * @param {HTMLElement} navEl - Navigation element
   * @param {number} totalEntries - Total number of entries
   */
  updateNavigationButtons(navEl, totalEntries) {
    const prevBtn = navEl.querySelector('#olam-prev-btn');
    const nextBtn = navEl.querySelector('#olam-next-btn');
    
    // Enable/disable buttons
    prevBtn.disabled = AppState.currentEntryIndex === 0;
    nextBtn.disabled = AppState.currentEntryIndex >= totalEntries - 1;
    
    // Replace to remove old listeners
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    // Attach new listeners
    newPrevBtn.addEventListener('click', () => {
      if (AppState.prevEntry()) {
        this.renderResults();
      }
    });
    
    newNextBtn.addEventListener('click', () => {
      if (AppState.nextEntry()) {
        this.renderResults();
      }
    });
  }
};

// =============================================================================
// SEARCH CONTROLLER
// =============================================================================

/**
 * Main search controller
 */
const SearchController = {
  /**
   * Perform dictionary search
   * @param {string} text - Text to search
   * @param {number} x - X coordinate for popup
   * @param {number} y - Y coordinate for popup
   */
  async search(text, x, y) {
    UI.showPopup(x, y);
    UI.showLoading();
    
    try {
      const data = await API.search(text);
      
      if (data?.data?.entries?.length > 0) {
        const fromLang = API.detectLanguage(text);
        AppState.setSearchData(data, text, fromLang, 'malayalam');
        UI.hideLoading();
        Renderer.renderResults();
      } else {
        UI.hideLoading();
        UI.showNoResults();
      }
    } catch (error) {
      console.error('Search error:', error);
      UI.hideLoading();
      UI.showError(error.message === 'Extension context invalidated' 
        ? 'Please reload the page after updating the extension'
        : 'Error loading results');
    }
  },
  
  /**
   * Display pre-fetched results (from context menu)
   * @param {Object} data - API response data
   * @param {string} word - Searched word
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  displayResults(data, word, x, y) {
    UI.showPopup(x, y);
    UI.hideLoading();
    
    if (data?.data?.entries?.length > 0) {
      const fromLang = API.detectLanguage(word);
      AppState.setSearchData(data, word, fromLang, 'malayalam');
      Renderer.renderResults();
    } else {
      UI.showNoResults();
    }
  }
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Event handler setup and management
 */
const EventHandlers = {
  /**
   * Initialize all event listeners
   */
  init() {
    this.setupDoubleClick();
    this.setupKeyboard();
    this.setupClickOutside();
    this.setupMessageListener();
  },
  
  /**
   * Setup double-click handler
   */
  setupDoubleClick() {
    document.addEventListener('dblclick', (e) => {
      if (!AppState.doubleClickEnabled) return;
      if (AppState.popup?.contains(e.target)) return;
      
      let word = window.getSelection().toString().trim();
      
      // If no selection (common with Malayalam text), try to extract word manually
      if (!word && (e.target.nodeType === Node.TEXT_NODE || e.target.firstChild?.nodeType === Node.TEXT_NODE)) {
        word = this.extractWordAtPoint(e.target, e);
      }
      
      if (word && word.length > 0 && word.length < 100) {
        SearchController.search(word, e.clientX, e.clientY);
      }
    });
  },
  
  /**
   * Extract word at click point (for Malayalam and other scripts)
   * @param {Node} node - Target node
   * @param {Event} event - Click event
   * @returns {string} Extracted word
   */
  extractWordAtPoint(node, event) {
    const textNode = node.nodeType === Node.TEXT_NODE ? node : node.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return '';
    
    const text = textNode.textContent;
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!range) return '';
    
    const offset = range.startOffset;
    
    // Define word boundary patterns for different scripts
    // Malayalam: continuous Malayalam characters
    // English: alphanumeric and hyphens
    const wordPattern = /[\u0D00-\u0D7F]+|[a-zA-Z0-9\-]+/g;
    
    let match;
    while ((match = wordPattern.exec(text)) !== null) {
      if (offset >= match.index && offset <= match.index + match[0].length) {
        // Select the word
        const selection = window.getSelection();
        const newRange = document.createRange();
        newRange.setStart(textNode, match.index);
        newRange.setEnd(textNode, match.index + match[0].length);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        return match[0];
      }
    }
    
    return '';
  },
  
  /**
   * Setup keyboard handlers
   */
  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.popup?.classList.contains('olam-popup-visible')) {
        UI.hidePopup();
      }
    });
  },
  
  /**
   * Setup click outside handler
   */
  setupClickOutside() {
    document.addEventListener('click', (e) => {
      if (AppState.popup && 
          !AppState.popup.contains(e.target) && 
          AppState.popup.classList.contains('olam-popup-visible')) {
        UI.hidePopup();
      }
    });
  },
  
  /**
   * Setup Chrome message listener
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'showPopup') {
        this.handleContextMenuSearch(request);
        sendResponse({ success: true });
      }
      return true;
    });
  },
  
  /**
   * Handle context menu search message
   * @param {Object} request - Message request
   */
  handleContextMenuSearch(request) {
    const selection = window.getSelection();
    let x = window.innerWidth / 2;
    let y = 100;
    
    if (selection?.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (rect) {
        x = rect.left + (rect.width / 2);
        y = rect.bottom + 5;
      }
    }
    
    SearchController.displayResults(request.data, request.word, x, y);
  }
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the extension
 */
async function init() {
  await Settings.load();
  Settings.watchChanges();
  EventHandlers.init();
}

// Start the extension
init();
