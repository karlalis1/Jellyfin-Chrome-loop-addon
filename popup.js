// Jellyfin Video Looper - Popup Script

const toggle = document.getElementById('loopToggle');
const status = document.getElementById('status');

// Load saved state
chrome.storage.sync.get(['loopEnabled'], (result) => {
  if (result.loopEnabled !== undefined) {
    toggle.checked = result.loopEnabled;
    updateStatus(result.loopEnabled);
  }
});

// Toggle loop on change
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  
  // Save to storage
  chrome.storage.sync.set({ loopEnabled: enabled });
  
  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleLoop',
        enabled: enabled
      });
    }
  });
  
  updateStatus(enabled);
});

function updateStatus(enabled) {
  status.textContent = enabled ? 'Loop enabled' : 'Loop disabled';
}
