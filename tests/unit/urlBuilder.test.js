/**
 * Unit Tests for URL Builder Utilities
 * Tests URL construction with proper encoding
 */

const { buildApiUrl, buildDictionaryUrl } = require('../../utils/urlBuilder');
const { API_BASE_URL, DICTIONARY_BASE_URL } = require('../../utils/constants');

describe('URL Builder Utilities', () => {
  describe('buildApiUrl()', () => {
    it('should build API URL with basic parameters', () => {
      const url = buildApiUrl('english', 'malayalam', 'hello');
      expect(url).toBe(`${API_BASE_URL}/english/malayalam/hello`);
    });

    it('should encode special characters in text', () => {
      const url = buildApiUrl('english', 'malayalam', 'hello world');
      expect(url).toBe(`${API_BASE_URL}/english/malayalam/hello%20world`);
    });

    it('should encode URL-unsafe characters', () => {
      const url = buildApiUrl('english', 'malayalam', 'test&query=value');
      expect(url).toBe(`${API_BASE_URL}/english/malayalam/test%26query%3Dvalue`);
    });

    it('should handle Malayalam text', () => {
      const url = buildApiUrl('malayalam', 'malayalam', 'നമസ്കാരം');
      expect(url).toContain(API_BASE_URL);
      expect(url).toContain('malayalam/malayalam');
      expect(url).toContain(encodeURIComponent('നമസ്കാരം'));
    });

    it('should handle auto language detection', () => {
      const url = buildApiUrl('auto', 'malayalam', 'test');
      expect(url).toBe(`${API_BASE_URL}/auto/malayalam/test`);
    });

    it('should encode symbols and punctuation', () => {
      const url = buildApiUrl('english', 'malayalam', 'test!@#$%');
      expect(url).toBe(`${API_BASE_URL}/english/malayalam/test!%40%23%24%25`);
    });

    it('should handle empty string text', () => {
      const url = buildApiUrl('english', 'malayalam', '');
      expect(url).toBe(`${API_BASE_URL}/english/malayalam/`);
    });

    it('should use correct base URL constant', () => {
      const url = buildApiUrl('english', 'malayalam', 'test');
      expect(url).toContain('https://olam.in/api/dictionary');
    });
  });

  describe('buildDictionaryUrl()', () => {
    it('should build dictionary URL with basic parameters', () => {
      const url = buildDictionaryUrl('english', 'malayalam', 'hello');
      expect(url).toBe(`${DICTIONARY_BASE_URL}/english/malayalam/hello`);
    });

    it('should encode special characters in text', () => {
      const url = buildDictionaryUrl('english', 'malayalam', 'hello world');
      expect(url).toBe(`${DICTIONARY_BASE_URL}/english/malayalam/hello%20world`);
    });

    it('should encode URL-unsafe characters', () => {
      const url = buildDictionaryUrl('english', 'malayalam', 'test&query=value');
      expect(url).toBe(`${DICTIONARY_BASE_URL}/english/malayalam/test%26query%3Dvalue`);
    });

    it('should handle Malayalam text', () => {
      const url = buildDictionaryUrl('malayalam', 'malayalam', 'പരീക്ഷ');
      expect(url).toContain(DICTIONARY_BASE_URL);
      expect(url).toContain('malayalam/malayalam');
      expect(url).toContain(encodeURIComponent('പരീക്ഷ'));
    });

    it('should handle auto language detection', () => {
      const url = buildDictionaryUrl('auto', 'malayalam', 'test');
      expect(url).toBe(`${DICTIONARY_BASE_URL}/auto/malayalam/test`);
    });

    it('should encode symbols and punctuation', () => {
      const url = buildDictionaryUrl('english', 'malayalam', 'test!@#$%');
      expect(url).toBe(`${DICTIONARY_BASE_URL}/english/malayalam/test!%40%23%24%25`);
    });

    it('should handle empty string text', () => {
      const url = buildDictionaryUrl('english', 'malayalam', '');
      expect(url).toBe(`${DICTIONARY_BASE_URL}/english/malayalam/`);
    });

    it('should use correct base URL constant', () => {
      const url = buildDictionaryUrl('english', 'malayalam', 'test');
      expect(url).toContain('https://olam.in/dictionary');
    });

    it('should use different base URL than API', () => {
      const apiUrl = buildApiUrl('english', 'malayalam', 'test');
      const dictUrl = buildDictionaryUrl('english', 'malayalam', 'test');
      expect(apiUrl).not.toBe(dictUrl);
      expect(apiUrl).toContain('/api/dictionary');
      expect(dictUrl).toContain('/dictionary');
      expect(dictUrl).not.toContain('/api/dictionary');
    });
  });

  describe('URL encoding consistency', () => {
    it('should produce identical encoding for same text in both functions', () => {
      const text = 'test string with spaces & symbols!';
      const apiUrl = buildApiUrl('english', 'malayalam', text);
      const dictUrl = buildDictionaryUrl('english', 'malayalam', text);
      
      const apiEncodedPart = apiUrl.split('/').pop();
      const dictEncodedPart = dictUrl.split('/').pop();
      
      expect(apiEncodedPart).toBe(dictEncodedPart);
      expect(apiEncodedPart).toBe(encodeURIComponent(text));
    });

    it('should handle mixed language text consistently', () => {
      const text = 'hello മലയാളം world';
      const apiUrl = buildApiUrl('auto', 'malayalam', text);
      const dictUrl = buildDictionaryUrl('auto', 'malayalam', text);
      
      const apiEncodedPart = apiUrl.split('/').pop();
      const dictEncodedPart = dictUrl.split('/').pop();
      
      expect(apiEncodedPart).toBe(dictEncodedPart);
    });
  });
});
