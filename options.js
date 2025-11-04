// Options page script
document.addEventListener('DOMContentLoaded', function() {
  const doubleClickCheckbox = document.getElementById('doubleClickEnabled');
  const statusDiv = document.getElementById('status');
  
  // Load saved settings
  chrome.storage.sync.get(['doubleClickEnabled'], function(result) {
    // Default to true if not set
    doubleClickCheckbox.checked = result.doubleClickEnabled !== false;
  });
  
  // Save settings when changed
  doubleClickCheckbox.addEventListener('change', function() {
    const enabled = doubleClickCheckbox.checked;
    
    chrome.storage.sync.set({
      doubleClickEnabled: enabled
    }, function() {
      // Show status message
      statusDiv.classList.add('show');
      setTimeout(function() {
        statusDiv.classList.remove('show');
      }, 2000);
    });
  });
});
