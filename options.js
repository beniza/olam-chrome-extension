// Options page script
document.addEventListener('DOMContentLoaded', function() {
  const doubleClickCheckbox = document.getElementById('doubleClickEnabled');
  const fromLanguageSelect = document.getElementById('fromLanguage');
  const toLanguageSelect = document.getElementById('toLanguage');
  const resultLimitSelect = document.getElementById('resultLimit');
  const allWordsWarning = document.getElementById('allWordsWarning');
  const statusDiv = document.getElementById('status');
  
  // Load saved settings
  chrome.storage.sync.get(['doubleClickEnabled', 'fromLanguage', 'toLanguage', 'resultLimit'], function(result) {
    // Default to true if not set
    doubleClickCheckbox.checked = result.doubleClickEnabled !== false;
    
    // Set language preferences (defaults: auto -> malayalam)
    fromLanguageSelect.value = result.fromLanguage || 'auto';
    
    // Always force toLanguage to malayalam (only supported option)
    toLanguageSelect.value = 'malayalam';
    
    // Update storage if it had invalid value
    if (result.toLanguage !== 'malayalam') {
      chrome.storage.sync.set({ toLanguage: 'malayalam' });
    }
    
    // Set result limit (default: 3)
    resultLimitSelect.value = result.resultLimit || '3';
    
    // Show warning if 'all' is selected
    if (resultLimitSelect.value === 'all') {
      allWordsWarning.style.display = 'block';
    }
  });
  
  // Show/hide warning when result limit changes
  resultLimitSelect.addEventListener('change', function() {
    if (resultLimitSelect.value === 'all') {
      allWordsWarning.style.display = 'block';
    } else {
      allWordsWarning.style.display = 'none';
    }
  });
  
  // Show status message helper
  function showStatus() {
    statusDiv.classList.add('show');
    setTimeout(function() {
      statusDiv.classList.remove('show');
    }, 2000);
  }
  
  // Save settings when double-click checkbox changes
  doubleClickCheckbox.addEventListener('change', function() {
    chrome.storage.sync.set({
      doubleClickEnabled: doubleClickCheckbox.checked
    }, showStatus);
  });
  
  // Save settings when language preferences change
  fromLanguageSelect.addEventListener('change', function() {
    chrome.storage.sync.set({
      fromLanguage: fromLanguageSelect.value
    }, showStatus);
  });
  
  toLanguageSelect.addEventListener('change', function() {
    // Always enforce malayalam as target language (only supported option)
    chrome.storage.sync.set({
      toLanguage: 'malayalam'
    }, showStatus);
  });
  
  // Save settings when result limit changes
  resultLimitSelect.addEventListener('change', function() {
    chrome.storage.sync.set({
      resultLimit: resultLimitSelect.value
    }, showStatus);
  });
});
