// Jellyfin Video Looper - Content Script

let isLoopEnabled = true;
let loopButton = null;

// Load saved state
chrome.storage.sync.get(['loopEnabled'], (result) => {
  if (result.loopEnabled !== undefined) {
    isLoopEnabled = result.loopEnabled;
  }
  applyLoopToAllVideos();
  injectLoopButton();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleLoop') {
    isLoopEnabled = request.enabled;
    applyLoopToAllVideos();
    updateLoopButton();
  }
});

// Apply loop setting to all video elements
function applyLoopToAllVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.loop = isLoopEnabled;
  });
}

// Toggle loop function
function toggleLoop() {
  isLoopEnabled = !isLoopEnabled;
  chrome.storage.sync.set({ loopEnabled: isLoopEnabled });
  applyLoopToAllVideos();
  updateLoopButton();
}

// Update button appearance
function updateLoopButton() {
  if (loopButton) {
    const icon = loopButton.querySelector('#loop-icon') || loopButton.querySelector('i');
    if (icon) {
      if (isLoopEnabled) {
        if (loopButton.classList.contains('v-btn')) {
          loopButton.classList.add('v-btn--active');
        }
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path></svg>';
        icon.style.color = 'rgb(76, 175, 80)'; // Green when active
      } else {
        if (loopButton.classList.contains('v-btn')) {
          loopButton.classList.remove('v-btn--active');
        }
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"></path></svg>';
        icon.style.color = '';
      }
    }
  }
}

// Inject loop button into Jellyfin UI
function injectLoopButton() {
  // Try to find the playback settings dropdown menu
  // Look for v-menu elements (they appear when dropdown is opened)
  const menus = document.querySelectorAll('.v-menu .v-card, .v-overlay__content .v-card');
  
  for (const menuCard of menus) {
    // Check if this is the playback settings menu
    // by looking for speed/subtitle/quality options
    const hasSpeedOption = menuCard.textContent.includes('Geschwindigkeit') || 
                          menuCard.textContent.includes('Speed') ||
                          menuCard.textContent.includes('1x') ||
                          menuCard.textContent.includes('1.5x');
    
    if (hasSpeedOption && !document.getElementById('jellyfin-loop-btn')) {
      // Find the list container inside the card
      const listContainer = menuCard.querySelector('.v-list, .v-card-text, [role="list"]');
      
      if (listContainer) {
        // Create a list item with switch like Jellyfin's other options
        loopButton = document.createElement('div');
        loopButton.id = 'jellyfin-loop-btn';
        loopButton.className = 'v-list-item v-list-item--density-default v-list-item--variant-text';
        loopButton.setAttribute('role', 'listitem');
        loopButton.style.cursor = 'pointer';
        loopButton.style.padding = '0 16px';
        loopButton.style.minHeight = '48px';
        loopButton.innerHTML = `
          <span class="v-list-item__overlay"></span>
          <span class="v-list-item__underlay"></span>
          <div class="v-list-item__content" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span class="v-list-item-title" style="display: flex; align-items: center;">
              <i class="v-icon notranslate v-theme--dark v-icon--size-default mr-2" aria-hidden="true" id="loop-icon"></i>
              Loop
            </span>
            <label class="v-switch v-switch--inset" style="margin-left: auto;">
              <input type="checkbox" id="loop-checkbox" ${isLoopEnabled ? 'checked' : ''}>
              <span class="v-switch__track"></span>
              <span class="v-switch__thumb"></span>
            </label>
          </div>
        `;
        
        // Add click handler for the whole item
        loopButton.addEventListener('click', (e) => {
          if (e.target.id !== 'loop-checkbox') {
            toggleLoop();
            // Update checkbox
            const checkbox = loopButton.querySelector('#loop-checkbox');
            if (checkbox) checkbox.checked = isLoopEnabled;
          }
        });
        
        // Also add change handler for checkbox
        const checkbox = loopButton.querySelector('#loop-checkbox');
        if (checkbox) {
          checkbox.addEventListener('change', toggleLoop);
        }
        
        // Insert at the beginning of the list
        if (listContainer.firstChild) {
          listContainer.insertBefore(loopButton, listContainer.firstChild);
        } else {
          listContainer.appendChild(loopButton);
        }
        
        // Update initial state
        updateLoopButton();
        return; // Success, don't try fallback
      }
    }
  }
  
  // Fallback: Add button next to settings button in controls
  if (!loopButton) {
    const controlsContainer = document.querySelector('.osd-bottom .controls-wrapper .d-flex') || 
                             document.querySelector('[data-v-685078e4] .player-controls');
    
    if (controlsContainer && !document.getElementById('jellyfin-loop-btn')) {
      loopButton = document.createElement('button');
      loopButton.id = 'jellyfin-loop-btn';
      loopButton.type = 'button';
      loopButton.className = 'v-btn v-btn--icon v-theme--dark v-btn--density-default rounded-xl v-btn--size-default v-btn--variant-text mx-1';
      loopButton.innerHTML = `
        <span class="v-btn__overlay"></span>
        <span class="v-btn__underlay"></span>
        <span class="v-btn__content" data-no-activator="">
          <i class="v-icon notranslate v-theme--dark v-icon--size-default" aria-hidden="true"></i>
        </span>
      `;
      loopButton.setAttribute('title', 'Loop Toggle');
      
      loopButton.addEventListener('click', toggleLoop);
      controlsContainer.appendChild(loopButton);
      updateLoopButton();
    }
  }
}

// MutationObserver to detect UI changes and inject button
const observer = new MutationObserver(() => {
  applyLoopToAllVideos();
  injectLoopButton();
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Special observer for dropdown menus (they appear when clicked)
const menuObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        // Check if this is a menu/dropdown
        if (node.classList && (
          node.classList.contains('v-menu') ||
          node.classList.contains('v-list') ||
          node.classList.contains('v-overlay__content') ||
          node.getAttribute('role') === 'menu'
        )) {
          setTimeout(injectLoopButton, 100);
        }
        // Also check children
        const menus = node.querySelectorAll?.('.v-menu, .v-list, [role="menu"]');
        if (menus && menus.length > 0) {
          setTimeout(injectLoopButton, 100);
        }
      }
    });
  });
});

menuObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// Try to inject button periodically
setInterval(() => {
  injectLoopButton();
  applyLoopToAllVideos();
}, 2000);

// Also try on load
window.addEventListener('load', () => {
  setTimeout(() => {
    injectLoopButton();
    applyLoopToAllVideos();
  }, 2000);
});
