/**
 * Unit Tests for API Module (content.js)
 * Tests language detection and search functionality
 */

const { setupChromeMock } = require('../mocks/chrome-api');
const { detectLanguage } = require('../../utils/detectLanguage');

describe('API Module', () => {
  let API;
  
  beforeEach(() => {
    setupChromeMock();
    
    // Recreate API module
    API = {
      async search(text, fromLang = null, toLang = 'malayalam') {
        const sourceLang = fromLang || detectLanguage(text);
        
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'searchWord',
            text: text,
            fromLang: sourceLang,
            toLang: toLang
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (response?.success && response?.data) {
              resolve(response.data);
            } else {
              reject(new Error('Search failed'));
            }
          });
        });
      }
    };
  });
  
  describe('detectLanguage()', () => {
    test('should detect English text', () => {
      expect(detectLanguage('hello')).toBe('english');
      expect(detectLanguage('test word')).toBe('english');
      expect(detectLanguage('Hello World!')).toBe('english');
    });
    
    test('should detect Malayalam text', () => {
      expect(detectLanguage('മലയാളം')).toBe('malayalam');
      expect(detectLanguage('നമസ്കാരം')).toBe('malayalam');
      expect(detectLanguage('പരീക്ഷ')).toBe('malayalam');
    });
    
    test('should detect Malayalam in mixed text', () => {
      expect(detectLanguage('hello മലയാളം')).toBe('malayalam');
      expect(detectLanguage('test പരീക്ഷ word')).toBe('malayalam');
    });
    
    test('should handle numbers and special characters', () => {
      expect(detectLanguage('123')).toBe('english');
      expect(detectLanguage('!@#$%')).toBe('english');
      expect(detectLanguage('test123')).toBe('english');
    });
    
    test('should handle empty string', () => {
      expect(detectLanguage('')).toBe('english');
    });
    
    test('should handle Unicode Malayalam range correctly', () => {
      // Test Malayalam Unicode range boundaries (U+0D00 to U+0D7F)
      expect(detectLanguage('\u0D00')).toBe('malayalam'); // Start of range
      expect(detectLanguage('\u0D7F')).toBe('malayalam'); // End of range
      expect(detectLanguage('\u0CFF')).toBe('english');   // Before range
      expect(detectLanguage('\u0D80')).toBe('english');   // After range
    });
  });
  
  describe('search()', () => {
    test('should send search message with correct parameters', async () => {
      const mockResponse = {
        success: true,
        data: { entries: [{ content: ['test'] }] }
      };
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(mockResponse);
      });
      
      await API.search('hello', 'english', 'malayalam');
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        {
          action: 'searchWord',
          text: 'hello',
          fromLang: 'english',
          toLang: 'malayalam'
        },
        expect.any(Function)
      );
    });
    
    test('should auto-detect language when fromLang not provided', async () => {
      const mockResponse = {
        success: true,
        data: { entries: [] }
      };
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(mockResponse);
      });
      
      await API.search('മലയാളം');
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          fromLang: 'malayalam'
        }),
        expect.any(Function)
      );
    });
    
    test('should resolve with data on successful search', async () => {
      const mockData = {
        entries: [
          { content: ['test'], relations: [] }
        ]
      };
      
      const mockResponse = {
        success: true,
        data: mockData
      };
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(mockResponse);
      });
      
      const result = await API.search('test', 'english', 'malayalam');
      
      expect(result).toEqual(mockData);
    });
    
    test('should reject on Chrome runtime error', async () => {
      chrome.runtime.lastError = { message: 'Connection error' };
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(null);
      });
      
      await expect(API.search('test')).rejects.toThrow('Connection error');
      
      delete chrome.runtime.lastError;
    });
    
    test('should reject when response indicates failure', async () => {
      const mockResponse = {
        success: false,
        data: null
      };
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(mockResponse);
      });
      
      await expect(API.search('test')).rejects.toThrow('Search failed');
    });
    
    test('should reject when response data is missing', async () => {
      const mockResponse = {
        success: true,
        data: null
      };
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(mockResponse);
      });
      
      await expect(API.search('test')).rejects.toThrow('Search failed');
    });
    
    test('should use malayalam as default target language', async () => {
      const mockResponse = {
        success: true,
        data: { entries: [] }
      };
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(mockResponse);
      });
      
      await API.search('test', 'english');
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          toLang: 'malayalam'
        }),
        expect.any(Function)
      );
    });
    
    test('should handle concurrent searches', async () => {
      const mockResponse = {
        success: true,
        data: { entries: [] }
      };
      
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        setTimeout(() => callback(mockResponse), 10);
      });
      
      const searches = [
        API.search('test1'),
        API.search('test2'),
        API.search('test3')
      ];
      
      await Promise.all(searches);
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(3);
    });
  });
});
