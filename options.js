// Options page script
document.addEventListener('DOMContentLoaded', function() {
  const doubleClickCheckbox = document.getElementById('doubleClickEnabled');
  const fromLanguageSelect = document.getElementById('fromLanguage');
  const toLanguageSelect = document.getElementById('toLanguage');
  const statusDiv = document.getElementById('status');
  
  // Load saved settings
  chrome.storage.sync.get(['doubleClickEnabled', 'fromLanguage', 'toLanguage'], function(result) {
    // Default to true if not set
    doubleClickCheckbox.checked = result.doubleClickEnabled !== false;
    
    // Set language preferences (defaults: english -> malayalam)
    fromLanguageSelect.value = result.fromLanguage || 'english';
    toLanguageSelect.value = result.toLanguage || 'malayalam';
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
    chrome.storage.sync.set({
      toLanguage: toLanguageSelect.value
    }, showStatus);
  });
});
