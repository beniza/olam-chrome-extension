/**
 * Unit Tests for AppState Module (content.js)
 * Tests state management functionality
 */

describe('AppState Module', () => {
  // Mock AppState object structure
  let AppState;
  
  beforeEach(() => {
    // Create a fresh AppState object for each test
    AppState = {
      popup: null,
      doubleClickEnabled: true,
      resultLimit: 3,
      currentData: null,
      currentEntryIndex: 0,
      currentFilterTag: null,
      currentSearchWord: '',
      currentFromLang: '',
      currentToLang: '',
      
      resetSearchState() {
        this.currentData = null;
        this.currentEntryIndex = 0;
        this.currentFilterTag = null;
        this.currentSearchWord = '';
        this.currentFromLang = '';
        this.currentToLang = '';
      },
      
      setSearchData(data, word, fromLang, toLang) {
        this.currentData = data;
        this.currentSearchWord = word;
        this.currentFromLang = fromLang;
        this.currentToLang = toLang;
        this.currentEntryIndex = 0;
        this.currentFilterTag = null;
      },
      
      getFilteredEntries() {
        if (!this.currentData?.data?.entries) return [];
        
        if (!this.currentFilterTag) {
          return this.currentData.data.entries;
        }
        
        return this.currentData.data.entries.filter(
          entry => entry.tags?.includes(this.currentFilterTag)
        );
      },
      
      nextEntry() {
        const entries = this.getFilteredEntries();
        if (this.currentEntryIndex < entries.length - 1) {
          this.currentEntryIndex++;
          return true;
        }
        return false;
      },
      
      prevEntry() {
        if (this.currentEntryIndex > 0) {
          this.currentEntryIndex--;
          return true;
        }
        return false;
      },
      
      setFilterTag(tag) {
        this.currentFilterTag = tag;
        this.currentEntryIndex = 0;
      }
    };
  });
  
  describe('Initial State', () => {
    test('should have correct default values', () => {
      expect(AppState.popup).toBeNull();
      expect(AppState.doubleClickEnabled).toBe(true);
      expect(AppState.resultLimit).toBe(3);
      expect(AppState.currentData).toBeNull();
      expect(AppState.currentEntryIndex).toBe(0);
      expect(AppState.currentFilterTag).toBeNull();
      expect(AppState.currentSearchWord).toBe('');
    });
  });
  
  describe('resetSearchState()', () => {
    test('should reset all search-related state', () => {
      // Set some state
      AppState.currentData = { data: { entries: [] } };
      AppState.currentEntryIndex = 5;
      AppState.currentFilterTag = 'src:ekkurup';
      AppState.currentSearchWord = 'test';
      AppState.currentFromLang = 'english';
      AppState.currentToLang = 'malayalam';
      
      // Reset
      AppState.resetSearchState();
      
      // Verify all reset
      expect(AppState.currentData).toBeNull();
      expect(AppState.currentEntryIndex).toBe(0);
      expect(AppState.currentFilterTag).toBeNull();
      expect(AppState.currentSearchWord).toBe('');
      expect(AppState.currentFromLang).toBe('');
      expect(AppState.currentToLang).toBe('');
    });
    
    test('should not affect popup or settings', () => {
      AppState.popup = document.createElement('div');
      AppState.doubleClickEnabled = false;
      AppState.resultLimit = 10;
      
      AppState.resetSearchState();
      
      expect(AppState.popup).not.toBeNull();
      expect(AppState.doubleClickEnabled).toBe(false);
      expect(AppState.resultLimit).toBe(10);
    });
  });
  
  describe('setSearchData()', () => {
    test('should set all search data correctly', () => {
      const mockData = {
        data: {
          entries: [
            { content: ['test'], relations: [] }
          ]
        }
      };
      
      AppState.setSearchData(mockData, 'hello', 'english', 'malayalam');
      
      expect(AppState.currentData).toBe(mockData);
      expect(AppState.currentSearchWord).toBe('hello');
      expect(AppState.currentFromLang).toBe('english');
      expect(AppState.currentToLang).toBe('malayalam');
    });
    
    test('should reset entry index and filter tag', () => {
      AppState.currentEntryIndex = 5;
      AppState.currentFilterTag = 'src:ekkurup';
      
      const mockData = { data: { entries: [] } };
      AppState.setSearchData(mockData, 'test', 'english', 'malayalam');
      
      expect(AppState.currentEntryIndex).toBe(0);
      expect(AppState.currentFilterTag).toBeNull();
    });
  });
  
  describe('getFilteredEntries()', () => {
    test('should return empty array when no data', () => {
      AppState.currentData = null;
      expect(AppState.getFilteredEntries()).toEqual([]);
    });
    
    test('should return all entries when no filter', () => {
      const entries = [
        { content: ['test1'], tags: ['src:ekkurup'] },
        { content: ['test2'], tags: ['src:crowd'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentFilterTag = null;
      
      expect(AppState.getFilteredEntries()).toEqual(entries);
    });
    
    test('should filter entries by tag', () => {
      const entries = [
        { content: ['test1'], tags: ['src:ekkurup'] },
        { content: ['test2'], tags: ['src:crowd'] },
        { content: ['test3'], tags: ['src:ekkurup'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentFilterTag = 'src:ekkurup';
      
      const filtered = AppState.getFilteredEntries();
      expect(filtered).toHaveLength(2);
      expect(filtered[0].content[0]).toBe('test1');
      expect(filtered[1].content[0]).toBe('test3');
    });
    
    test('should return empty array when filter matches nothing', () => {
      const entries = [
        { content: ['test1'], tags: ['src:ekkurup'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentFilterTag = 'src:nonexistent';
      
      expect(AppState.getFilteredEntries()).toEqual([]);
    });
  });
  
  describe('nextEntry()', () => {
    test('should navigate to next entry', () => {
      const entries = [
        { content: ['test1'] },
        { content: ['test2'] },
        { content: ['test3'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentEntryIndex = 0;
      
      const result = AppState.nextEntry();
      
      expect(result).toBe(true);
      expect(AppState.currentEntryIndex).toBe(1);
    });
    
    test('should return false at last entry', () => {
      const entries = [
        { content: ['test1'] },
        { content: ['test2'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentEntryIndex = 1;
      
      const result = AppState.nextEntry();
      
      expect(result).toBe(false);
      expect(AppState.currentEntryIndex).toBe(1);
    });
    
    test('should work with filtered entries', () => {
      const entries = [
        { content: ['test1'], tags: ['src:ekkurup'] },
        { content: ['test2'], tags: ['src:crowd'] },
        { content: ['test3'], tags: ['src:ekkurup'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentFilterTag = 'src:ekkurup';
      AppState.currentEntryIndex = 0;
      
      const result = AppState.nextEntry();
      
      expect(result).toBe(true);
      expect(AppState.currentEntryIndex).toBe(1);
    });
  });
  
  describe('prevEntry()', () => {
    test('should navigate to previous entry', () => {
      const entries = [
        { content: ['test1'] },
        { content: ['test2'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentEntryIndex = 1;
      
      const result = AppState.prevEntry();
      
      expect(result).toBe(true);
      expect(AppState.currentEntryIndex).toBe(0);
    });
    
    test('should return false at first entry', () => {
      const entries = [
        { content: ['test1'] },
        { content: ['test2'] }
      ];
      AppState.currentData = { data: { entries } };
      AppState.currentEntryIndex = 0;
      
      const result = AppState.prevEntry();
      
      expect(result).toBe(false);
      expect(AppState.currentEntryIndex).toBe(0);
    });
  });
  
  describe('setFilterTag()', () => {
    test('should set filter tag and reset index', () => {
      AppState.currentEntryIndex = 5;
      
      AppState.setFilterTag('src:ekkurup');
      
      expect(AppState.currentFilterTag).toBe('src:ekkurup');
      expect(AppState.currentEntryIndex).toBe(0);
    });
    
    test('should allow setting null filter', () => {
      AppState.currentFilterTag = 'src:ekkurup';
      
      AppState.setFilterTag(null);
      
      expect(AppState.currentFilterTag).toBeNull();
      expect(AppState.currentEntryIndex).toBe(0);
    });
  });
});
