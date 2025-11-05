/**
 * Language Detection Utility
 * Detects if text is Malayalam or English based on Unicode character ranges
 * 
 * This utility is shared across:
 * - background.js (service worker)
 * - content.js (content script)
 * - test files
 */

/**
 * Detect language from text
 * @param {string} text - Text to analyze
 * @returns {string} Detected language code ('malayalam' or 'english')
 */
function detectLanguage(text) {
  // Malayalam characters are in range U+0D00 to U+0D7F
  return /[\u0D00-\u0D7F]/.test(text) ? 'malayalam' : 'english';
}

// Export for CommonJS (tests using Jest/Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectLanguage };
}

// Make available globally for browser context (service worker and content scripts)
if (typeof self !== 'undefined') {
  self.detectLanguage = detectLanguage;
}
