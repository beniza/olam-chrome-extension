/**
 * Unit Tests for OlamAPI Service (background.js)
 * Tests API communication and caching
 */

const { setupChromeMock, createMockOlamResponse } = require('../mocks/chrome-api');

describe('OlamAPI Service', () => {
  let OlamAPI;
  const API_BASE_URL = 'https://olam.in/api/dictionary';
  
  beforeEach(() => {
    setupChromeMock();
    global.fetch = jest.fn();
    
    // Recreate OlamAPI module
    OlamAPI = {
      async search(text, fromLang, toLang) {
        const url = `${API_BASE_URL}/${fromLang}/${toLang}/${encodeURIComponent(text)}`;
        
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          await this.cacheResult(text, data);
          
          return data;
        } catch (error) {
          console.error('Olam API error:', error);
          throw error;
        }
      },
      
      async cacheResult(query, result) {
        try {
          await chrome.storage.local.set({
            lastSearch: {
              query: query,
              result: result,
              timestamp: Date.now()
            }
          });
        } catch (error) {
          console.error('Cache error:', error);
        }
      },
      
      async getLastSearch() {
        try {
          const result = await chrome.storage.local.get(['lastSearch']);
          return result.lastSearch || null;
        } catch (error) {
          console.error('Cache retrieval error:', error);
          return null;
        }
      }
    };
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('search()', () => {
    test('should make API request with correct URL', async () => {
      const mockData = createMockOlamResponse('hello');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      await OlamAPI.search('hello', 'english', 'malayalam');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://olam.in/api/dictionary/english/malayalam/hello'
      );
    });
    
    test('should encode special characters in URL', async () => {
      const mockData = createMockOlamResponse('test word');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      await OlamAPI.search('test word', 'english', 'malayalam');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://olam.in/api/dictionary/english/malayalam/test%20word'
      );
    });
    
    test('should return parsed JSON data', async () => {
      const mockData = createMockOlamResponse('test');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      const result = await OlamAPI.search('test', 'english', 'malayalam');
      
      expect(result).toEqual(mockData);
    });
    
    test('should cache search result', async () => {
      const mockData = createMockOlamResponse('test');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      await OlamAPI.search('test', 'english', 'malayalam');
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          lastSearch: expect.objectContaining({
            query: 'test',
            result: mockData
          })
        })
      );
    });
    
    test('should throw error on HTTP error status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      await expect(
        OlamAPI.search('test', 'english', 'malayalam')
      ).rejects.toThrow('HTTP error! status: 404');
    });
    
    test('should throw error on network failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(
        OlamAPI.search('test', 'english', 'malayalam')
      ).rejects.toThrow('Network error');
    });
    
    test('should handle Malayalam text', async () => {
      const mockData = createMockOlamResponse('മലയാളം');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      await OlamAPI.search('മലയാളം', 'malayalam', 'malayalam');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('malayalam/malayalam/')
      );
    });
  });
  
  describe('cacheResult()', () => {
    test('should cache search result with timestamp', async () => {
      const mockResult = createMockOlamResponse('test');
      const beforeTime = Date.now();
      
      await OlamAPI.cacheResult('test', mockResult);
      
      const afterTime = Date.now();
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        lastSearch: {
          query: 'test',
          result: mockResult,
          timestamp: expect.any(Number)
        }
      });
      
      const callArgs = chrome.storage.local.set.mock.calls[0][0];
      expect(callArgs.lastSearch.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(callArgs.lastSearch.timestamp).toBeLessThanOrEqual(afterTime);
    });
    
    test('should handle cache errors gracefully', async () => {
      chrome.storage.local.set.mockRejectedValueOnce(new Error('Storage error'));
      
      // Should not throw
      await expect(
        OlamAPI.cacheResult('test', {})
      ).resolves.toBeUndefined();
    });
  });
  
  describe('getLastSearch()', () => {
    test('should retrieve cached search result', async () => {
      const mockCachedData = {
        query: 'test',
        result: createMockOlamResponse('test'),
        timestamp: Date.now()
      };
      
      chrome.storage.local.get.mockResolvedValueOnce({
        lastSearch: mockCachedData
      });
      
      const result = await OlamAPI.getLastSearch();
      
      expect(result).toEqual(mockCachedData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['lastSearch']);
    });
    
    test('should return null when no cache exists', async () => {
      chrome.storage.local.get.mockResolvedValueOnce({});
      
      const result = await OlamAPI.getLastSearch();
      
      expect(result).toBeNull();
    });
    
    test('should handle retrieval errors gracefully', async () => {
      chrome.storage.local.get.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await OlamAPI.getLastSearch();
      
      expect(result).toBeNull();
    });
  });
});

describe('detectLanguage() Utility', () => {
  test('should detect English text', () => {
    function detectLanguage(text) {
      return /[\u0D00-\u0D7F]/.test(text) ? 'malayalam' : 'english';
    }
    
    expect(detectLanguage('hello')).toBe('english');
    expect(detectLanguage('test')).toBe('english');
  });
  
  test('should detect Malayalam text', () => {
    function detectLanguage(text) {
      return /[\u0D00-\u0D7F]/.test(text) ? 'malayalam' : 'english';
    }
    
    expect(detectLanguage('മലയാളം')).toBe('malayalam');
    expect(detectLanguage('നമസ്കാരം')).toBe('malayalam');
  });
});
