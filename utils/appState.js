/**
 * AppState Class - Manages search results state for popup.js
 * Handles entry navigation, filtering, and word limiting
 */
class AppState {
  constructor({ entries = [], maxWords = 3, query = '' }) {
    this.allEntries = entries;
    this.maxWords = maxWords;
    this.query = query;
    this.currentIndex = 0;
    this.currentSourceFilter = null;
  }

  /**
   * Get all entries filtered by current source filter
   */
  getFilteredEntries() {
    if (!this.currentSourceFilter) {
      return this.allEntries;
    }
    return this.allEntries.filter(entry => 
      entry.tags?.includes(this.currentSourceFilter)
    );
  }

  /**
   * Get count of filtered entries
   */
  getFilteredEntriesCount() {
    return this.getFilteredEntries().length;
  }

  /**
   * Get the current entry based on current index and filters
   */
  getCurrentEntry() {
    const filtered = this.getFilteredEntries();
    return filtered[this.currentIndex] || null;
  }

  /**
   * Get current index
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Check if previous entry exists
   */
  hasPrevious() {
    return this.currentIndex > 0;
  }

  /**
   * Check if next entry exists
   */
  hasNext() {
    const filtered = this.getFilteredEntries();
    return this.currentIndex < filtered.length - 1;
  }

  /**
   * Navigate to next entry
   */
  nextEntry() {
    if (this.hasNext()) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  /**
   * Navigate to previous entry
   */
  previousEntry() {
    if (this.hasPrevious()) {
      this.currentIndex--;
      return true;
    }
    return false;
  }

  /**
   * Set source filter and reset index
   */
  setSourceFilter(source) {
    this.currentSourceFilter = source;
    this.currentIndex = 0;
  }

  /**
   * Get all available source tags from entries
   */
  getAvailableSources() {
    const sourcesSet = new Set();
    this.allEntries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          if (tag.startsWith('src:')) {
            sourcesSet.add(tag);
          }
        });
      }
    });
    return Array.from(sourcesSet).sort();
  }

  /**
   * Limit words in content array based on maxWords setting
   */
  limitWords(content) {
    if (!Array.isArray(content)) return [];
    if (this.maxWords === Infinity || this.maxWords === -1) {
      return content;
    }
    return content.slice(0, this.maxWords);
  }
}
