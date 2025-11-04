// Background service worker for Chrome extension
let lastSelectedText = '';

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'searchOlam',
    title: 'Search "%s" in Olam Dictionary',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchOlam') {
    lastSelectedText = info.selectionText;
    
    // Get user preferences or use defaults
    chrome.storage.sync.get(['fromLanguage', 'toLanguage'], (settings) => {
      const fromLang = settings.fromLanguage || 'english';
      const toLang = settings.toLanguage || 'malayalam';
      
      // Search and then notify content script to show popup
      searchInOlam(info.selectionText, fromLang, toLang).then((data) => {
        // Send message to content script to display results
        chrome.tabs.sendMessage(tab.id, {
          action: 'showPopup',
          word: info.selectionText,
          data: data
        });
      });
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'textSelected') {
    lastSelectedText = request.text;
  }
});

// Function to search in Olam API
async function searchInOlam(text, fromLang, toLang) {
  const apiUrl = `https://olam.in/api/dictionary/${fromLang}/${toLang}/${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Store the result for popup to retrieve
    chrome.storage.local.set({
      lastSearch: {
        query: text,
        result: data,
        timestamp: Date.now()
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching from Olam API:', error);
    return null;
  }
}

// Export function for popup to get last selected text
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLastSearch') {
    chrome.storage.local.get(['lastSearch'], (result) => {
      sendResponse(result.lastSearch || null);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'searchWord') {
    const fromLang = request.fromLang || 'english';
    const toLang = request.toLang || 'malayalam';
    
    searchInOlam(request.text, fromLang, toLang).then((data) => {
      sendResponse({ success: true, data: data });
    }).catch((error) => {
      console.error('Search error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
    return true;
  }
});
