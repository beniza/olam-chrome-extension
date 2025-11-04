// =============================================================================
// OLAM DICTIONARY CHROME EXTENSION - CONTENT SCRIPT
// =============================================================================
// This script runs on every webpage and provides inline dictionary lookup
// Features:
// - Double-click any word to search (can be disabled in settings)
// - Shows popup near cursor with Malayalam/English translations
// - Navigate between multiple dictionary entries
// - Filter results by source (E.K. Kurup, Crowd Sourced)
// =============================================================================

// =============================================================================
// GLOBAL STATE VARIABLES
// =============================================================================

let popup = null;                    // Reference to the popup DOM element
let doubleClickEnabled = true;       // Setting: whether double-click triggers dictionary

// Current search/display state
let currentData = null;              // Full API response data
let currentEntryIndex = 0;           // Which entry we're currently showing (for navigation)
let currentFilterTag = null;         // Active source filter (null = show all sources)
let currentSearchWord = '';          // The word we searched for
let currentFromLang = '';            // Source language (english/malayalam)
let currentToLang = '';              // Target language (always malayalam)

// =============================================================================
// SETTINGS MANAGEMENT
// =============================================================================

// Load double-click setting from Chrome storage
chrome.storage.sync.get(['doubleClickEnabled'], function(result) {
  doubleClickEnabled = result.doubleClickEnabled !== false; // Default to true
});

// Listen for settings changes (when user updates in options page)
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.doubleClickEnabled) {
    doubleClickEnabled = changes.doubleClickEnabled.newValue;
  }
});

// =============================================================================
// POPUP DOM CREATION AND MANAGEMENT
// =============================================================================

/**
 * Creates and returns the popup element (only created once per page)
 * The popup contains header, navigation, loading state, results area
 */
function createPopup() {
  if (popup) return popup; // Return existing popup if already created
  
  popup = document.createElement('div');
  popup.id = 'olam-dictionary-popup';
  popup.className = 'olam-popup-hidden';
  popup.innerHTML = `
    <div class="olam-popup-header">
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
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // ===== EVENT LISTENERS =====
  
  // Stop event propagation when clicking inside popup (prevents accidental closing)
  popup.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Close button
  popup.querySelector('#olam-close-btn').addEventListener('click', hidePopup);
  
  // Settings button - opens options page
  popup.querySelector('#olam-settings-btn').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'openOptions' });
  });
  
  return popup;
}

/**
 * Shows the popup near the specified coordinates
 * Automatically adjusts position if popup would go off-screen
 */
function showPopup(x, y) {
  const popupEl = createPopup();
  popupEl.classList.remove('olam-popup-hidden');
  popupEl.classList.add('olam-popup-visible');
  
  // Get popup dimensions and viewport size
  const popupRect = popupEl.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Default position: slightly offset from cursor
  let left = x + 10;
  let top = y + 10;
  
  // Adjust horizontal position if popup goes off right edge
  if (left + popupRect.width > viewportWidth) {
    left = viewportWidth - popupRect.width - 20;
  }
  
  // Adjust vertical position if popup goes off bottom edge
  if (top + popupRect.height > viewportHeight) {
    top = y - popupRect.height - 10; // Show above cursor instead
  }
  
  // Set fixed position (relative to viewport, not document)
  // No need to add scroll offset since position:fixed uses viewport coordinates
  popupEl.style.left = left + 'px';
  popupEl.style.top = top + 'px';
}

/**
 * Hides the popup
 */
function hidePopup() {
  if (popup) {
    popup.classList.remove('olam-popup-visible');
    popup.classList.add('olam-popup-hidden');
  }
}

// =============================================================================
// DICTIONARY API SEARCH
// =============================================================================

/**
 * Searches for a word in the Olam dictionary
 * Makes API call via background script to avoid CORS issues
 * @param {string} text - The word/phrase to search for
 * @param {number} x - X coordinate for popup positioning
 * @param {number} y - Y coordinate for popup positioning
 */
async function searchInOlam(text, x, y) {
  showPopup(x, y);
  
  const loadingEl = popup.querySelector('.olam-loading');
  const resultsEl = popup.querySelector('#olam-results');
  const noResultsEl = popup.querySelector('#olam-no-results');
  
  // Show loading state
  loadingEl.style.display = 'flex';
  resultsEl.innerHTML = '';
  noResultsEl.style.display = 'none';
  
  // Auto-detect language based on Unicode range
  // Malayalam characters are in range U+0D00 to U+0D7F
  const isMalayalam = /[\u0D00-\u0D7F]/.test(text);
  const fromLang = isMalayalam ? 'malayalam' : 'english';
  const toLang = 'malayalam';
  
  try {
    // Send message to background script to make API call
    // (Content scripts can't make cross-origin requests directly)
    chrome.runtime.sendMessage({
      action: 'searchWord',
      text: text,
      fromLang: fromLang,
      toLang: toLang
    }, function(response) {
      // Check if extension context is still valid
      if (chrome.runtime.lastError) {
        console.error('Extension context error:', chrome.runtime.lastError);
        loadingEl.style.display = 'none';
        resultsEl.innerHTML = '<div class="olam-error">Please reload the page after updating the extension</div>';
        return;
      }
      
      loadingEl.style.display = 'none';
      
      // Display results if found
      if (response && response.success && response.data) {
        const data = response.data;
        if (data.data && data.data.entries && data.data.entries.length > 0) {
          displayResults(data, text, fromLang, toLang);
        } else {
          noResultsEl.style.display = 'block';
        }
      } else {
        noResultsEl.style.display = 'block';
      }
    });
  } catch (error) {
    console.error('Error fetching from Olam:', error);
    loadingEl.style.display = 'none';
    resultsEl.innerHTML = '<div class="olam-error">Error loading results</div>';
  }
}

// =============================================================================
// RESULTS DISPLAY
// =============================================================================

/**
 * Displays dictionary results in the popup
 * Sets up navigation and renders first entry
 * @param {Object} data - API response data
 * @param {string} searchWord - The searched word
 * @param {string} fromLang - Source language
 * @param {string} toLang - Target language
 */
function displayResults(data, searchWord, fromLang, toLang) {
  const resultsEl = popup.querySelector('#olam-results');
  const navEl = popup.querySelector('#olam-nav');
  
  // Store data for navigation
  currentData = data;
  currentEntryIndex = 0;
  currentFilterTag = null;
  currentSearchWord = searchWord;
  currentFromLang = fromLang;
  currentToLang = toLang;
  
  // Validate data
  if (!data.data || !data.data.entries || data.data.entries.length === 0) {
    popup.querySelector('#olam-no-results').style.display = 'block';
    navEl.style.display = 'none';
    return;
  }
  
  // Show navigation controls if multiple entries exist
  if (data.data.entries.length > 1) {
    navEl.style.display = 'flex';
    updateNavigation();
  } else {
    navEl.style.display = 'none';
  }
  
  // Render the first entry
  renderCurrentEntry();
}

/**
 * Renders the current dictionary entry based on currentEntryIndex and currentFilterTag
 * Displays: word, source filters, meaning, type, and link to full details
 */
function renderCurrentEntry() {
  const resultsEl = popup.querySelector('#olam-results');
  resultsEl.innerHTML = '';
  
  if (!currentData || !currentData.data || !currentData.data.entries) {
    return;
  }
  
  let entries = currentData.data.entries;
  
  // Apply source filter if active
  if (currentFilterTag) {
    entries = entries.filter(entry => entry.tags && entry.tags.includes(currentFilterTag));
    if (entries.length === 0) {
      resultsEl.innerHTML = '<div class="olam-no-results"><p>No results for this source</p></div>';
      return;
    }
    // Reset index if out of bounds after filtering
    if (currentEntryIndex >= entries.length) {
      currentEntryIndex = 0;
    }
  }
  
  const entry = entries[currentEntryIndex];
  
  // ===== WORD HEADER =====
  const wordDiv = document.createElement('div');
  wordDiv.className = 'olam-word';
  wordDiv.textContent = entry.content[0];
  resultsEl.appendChild(wordDiv);
  
  // ===== SOURCE FILTER TAGS =====
  // Collect all source tags from all entries
  const allTags = new Set();
  currentData.data.entries.forEach(e => {
    if (e.tags) {
      e.tags.forEach(tag => {
        if (tag.startsWith('src:')) {
          allTags.add(tag);
        }
      });
    }
  });
  
  // Display source filter buttons if multiple sources exist
  if (allTags.size > 0) {
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'olam-tag-filters';
    
    // "All Sources" button
    const allBtn = document.createElement('button');
    allBtn.className = 'olam-tag-filter' + (currentFilterTag === null ? ' active' : '');
    allBtn.textContent = 'All Sources';
    
    // Add inactive class when a specific filter is active
    if (currentFilterTag !== null) {
      allBtn.classList.add('inactive');
    }
    
    allBtn.onclick = function() {
      currentFilterTag = null;
      currentEntryIndex = 0;
      renderCurrentEntry();
      updateNavigation();
    };
    tagsDiv.appendChild(allBtn);
    
    // Individual source filter buttons
    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'olam-tag-filter' + (currentFilterTag === tag ? ' active' : '');
      
      // Add inactive class when another filter is active
      if (currentFilterTag !== null && currentFilterTag !== tag) {
        btn.classList.add('inactive');
      }
      
      // Special styling for known sources
      if (tag === 'src:ekkurup') {
        btn.classList.add('tag-ekkurup');
        btn.textContent = 'E. K. Kurup';
      } else if (tag === 'src:crowd') {
        btn.classList.add('tag-crowd');
        btn.textContent = 'Crowd Sourced';
      } else {
        btn.textContent = tag.replace('src:', '');
      }
      
      btn.onclick = function() {
        // Toggle: if clicking on active filter, deactivate it
        if (currentFilterTag === tag) {
          currentFilterTag = null;
        } else {
          currentFilterTag = tag;
        }
        currentEntryIndex = 0;
        renderCurrentEntry();
        updateNavigation();
      };
      
      tagsDiv.appendChild(btn);
    });
    
    resultsEl.appendChild(tagsDiv);
  }
  
  // ===== TRANSLATION/MEANING =====
  if (entry.relations && entry.relations.length > 0) {
    const relation = entry.relations[0];
    
    // Display first 3 words of meaning
    const meaningDiv = document.createElement('div');
    meaningDiv.className = 'olam-meaning';
    const words = relation.content.slice(0, 3);
    meaningDiv.textContent = words.join(', ');
    if (relation.content.length > 3) {
      meaningDiv.textContent += '...';
    }
    resultsEl.appendChild(meaningDiv);
    
    // Display word type (noun, verb, etc.)
    if (relation.relation && relation.relation.types) {
      const typeDiv = document.createElement('div');
      typeDiv.className = 'olam-type';
      typeDiv.textContent = relation.relation.types.join(', ');
      resultsEl.appendChild(typeDiv);
    }
  }
  
  // ===== LINK TO FULL DETAILS =====
  const linkDiv = document.createElement('div');
  linkDiv.className = 'olam-link';
  linkDiv.innerHTML = `
    <a href="https://olam.in/dictionary/${currentFromLang}/${currentToLang}/${encodeURIComponent(currentSearchWord)}" target="_blank">
      View full details →
    </a>
  `;
  resultsEl.appendChild(linkDiv);
}

/**
 * Updates the navigation controls (prev/next buttons, counter)
 * Called after changing currentEntryIndex or currentFilterTag
 */
function updateNavigation() {
  const navInfo = popup.querySelector('#olam-nav-info');
  const prevBtn = popup.querySelector('#olam-prev-btn');
  const nextBtn = popup.querySelector('#olam-next-btn');
  
  if (!currentData || !currentData.data || !currentData.data.entries) {
    return;
  }
  
  // Get entries (filtered or all)
  let entries = currentData.data.entries;
  if (currentFilterTag) {
    entries = entries.filter(entry => entry.tags && entry.tags.includes(currentFilterTag));
  }
  
  // Update counter display
  navInfo.textContent = `${currentEntryIndex + 1}/${entries.length}`;
  
  // Enable/disable buttons based on position
  prevBtn.disabled = currentEntryIndex === 0;
  nextBtn.disabled = currentEntryIndex >= entries.length - 1;
  
  // Replace buttons to remove old event listeners (prevents multiple bindings)
  const newPrevBtn = prevBtn.cloneNode(true);
  const newNextBtn = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
  nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
  
  // Previous button click handler
  newPrevBtn.addEventListener('click', function() {
    if (currentEntryIndex > 0) {
      currentEntryIndex--;
      renderCurrentEntry();
      updateNavigation();
    }
  });
  
  // Next button click handler
  newNextBtn.addEventListener('click', function() {
    let entries = currentData.data.entries;
    if (currentFilterTag) {
      entries = entries.filter(entry => entry.tags && entry.tags.includes(currentFilterTag));
    }
    
    if (currentEntryIndex < entries.length - 1) {
      currentEntryIndex++;
      renderCurrentEntry();
      updateNavigation();
    }
  });
}

// =============================================================================
// EVENT LISTENERS - USER INTERACTION
// =============================================================================

/**
 * Double-click event listener
 * Triggers dictionary lookup when user double-clicks a word
 */
document.addEventListener('dblclick', function(e) {
  // Check if feature is enabled in settings
  if (!doubleClickEnabled) {
    return;
  }
  
  // Don't trigger if clicking inside the popup itself
  if (popup && popup.contains(e.target)) {
    return;
  }
  
  // Get the selected word (browser automatically selects word on double-click)
  const word = window.getSelection().toString().trim();
  
  // Search if word is valid length
  if (word.length > 0 && word.length < 100) {
    searchInOlam(word, e.clientX, e.clientY);
  }
});

/**
 * Escape key event listener
 * Closes the popup when user presses Escape
 */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && popup && popup.classList.contains('olam-popup-visible')) {
    hidePopup();
  }
});

/**
 * Click outside event listener
 * Closes the popup when user clicks outside of it
 */
document.addEventListener('click', function(e) {
  if (popup && !popup.contains(e.target) && popup.classList.contains('olam-popup-visible')) {
    hidePopup();
  }
});
