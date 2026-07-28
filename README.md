# Jellyfin Video Looper - Chrome Extension

Automatically loops all videos on Jellyfin (and any other website) with a toggle option.

## Features

- **Auto-loop**: All videos automatically play in loop mode
- **Toggle Switch**: Easy on/off control via popup
- **Persistent State**: Your preference is saved across browser sessions
- **Dynamic Detection**: Automatically applies to dynamically loaded videos

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select this folder (the folder containing manifest.json)
5. The extension is now installed!

## Usage

- Click the extension icon in your browser toolbar
- Toggle the "Loop Videos" switch to enable/disable looping
- The setting is automatically saved and applied to all videos

## Files

- `manifest.json` - Extension configuration
- `content.js` - Script that applies loop to video elements
- `popup.html` - Popup UI with toggle switch
- `popup.js` - Popup logic for toggle functionality

## Notes

- Works on all websites, not just Jellyfin
- Loop setting persists across browser sessions
- Videos are detected automatically, including dynamically loaded ones
