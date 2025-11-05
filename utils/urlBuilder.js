/**
 * URL Builder Utilities
 * Constructs API and dictionary URLs with proper encoding
 */

/**
 * Build API URL for dictionary lookup
 * @param {string} fromLang - Source language
 * @param {string} toLang - Target language
 * @param {string} text - Word to search
 * @returns {string} Full API URL
 */
function buildApiUrl(fromLang, toLang, text) {
  return `${API_BASE_URL}/${fromLang}/${toLang}/${encodeURIComponent(text)}`;
}

/**
 * Build dictionary web URL for full details
 * @param {string} fromLang - Source language
 * @param {string} toLang - Target language
 * @param {string} text - Word to view
 * @returns {string} Full dictionary URL
 */
function buildDictionaryUrl(fromLang, toLang, text) {
  return `${DICTIONARY_BASE_URL}/${fromLang}/${toLang}/${encodeURIComponent(text)}`;
}

// Export for CommonJS (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildApiUrl,
    buildDictionaryUrl
  };
}
