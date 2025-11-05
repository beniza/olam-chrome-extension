/**
 * Unit Tests for Constants Module
 * Tests application-wide configuration constants
 */

const {
  API_BASE_URL,
  DICTIONARY_BASE_URL,
  DEFAULT_FROM_LANG,
  DEFAULT_TO_LANG,
  SUPPORTED_LANGUAGES,
  CONTEXT_MENU_ID
} = require('../../utils/constants');

describe('Constants Module', () => {
  describe('API URLs', () => {
    it('should define API base URL', () => {
      expect(API_BASE_URL).toBeDefined();
      expect(typeof API_BASE_URL).toBe('string');
    });

    it('should use correct API endpoint', () => {
      expect(API_BASE_URL).toBe('https://olam.in/api/dictionary');
    });

    it('should define dictionary base URL', () => {
      expect(DICTIONARY_BASE_URL).toBeDefined();
      expect(typeof DICTIONARY_BASE_URL).toBe('string');
    });

    it('should use correct dictionary URL', () => {
      expect(DICTIONARY_BASE_URL).toBe('https://olam.in/dictionary');
    });

    it('should have different URLs for API and dictionary', () => {
      expect(API_BASE_URL).not.toBe(DICTIONARY_BASE_URL);
    });

    it('should use HTTPS protocol', () => {
      expect(API_BASE_URL).toMatch(/^https:\/\//);
      expect(DICTIONARY_BASE_URL).toMatch(/^https:\/\//);
    });

    it('should not have trailing slashes', () => {
      expect(API_BASE_URL).not.toMatch(/\/$/);
      expect(DICTIONARY_BASE_URL).not.toMatch(/\/$/);
    });
  });

  describe('Default Languages', () => {
    it('should define default from language', () => {
      expect(DEFAULT_FROM_LANG).toBeDefined();
      expect(typeof DEFAULT_FROM_LANG).toBe('string');
    });

    it('should use auto-detection by default', () => {
      expect(DEFAULT_FROM_LANG).toBe('auto');
    });

    it('should define default to language', () => {
      expect(DEFAULT_TO_LANG).toBeDefined();
      expect(typeof DEFAULT_TO_LANG).toBe('string');
    });

    it('should use malayalam as default target', () => {
      expect(DEFAULT_TO_LANG).toBe('malayalam');
    });

    it('should have different default languages', () => {
      expect(DEFAULT_FROM_LANG).not.toBe(DEFAULT_TO_LANG);
    });
  });

  describe('Supported Languages', () => {
    it('should define supported languages object', () => {
      expect(SUPPORTED_LANGUAGES).toBeDefined();
      expect(typeof SUPPORTED_LANGUAGES).toBe('object');
    });

    it('should include auto detection', () => {
      expect(SUPPORTED_LANGUAGES).toHaveProperty('AUTO');
      expect(SUPPORTED_LANGUAGES.AUTO).toBe('auto');
    });

    it('should include english', () => {
      expect(SUPPORTED_LANGUAGES).toHaveProperty('ENGLISH');
      expect(SUPPORTED_LANGUAGES.ENGLISH).toBe('english');
    });

    it('should include malayalam', () => {
      expect(SUPPORTED_LANGUAGES).toHaveProperty('MALAYALAM');
      expect(SUPPORTED_LANGUAGES.MALAYALAM).toBe('malayalam');
    });

    it('should have exactly 3 supported languages', () => {
      expect(Object.keys(SUPPORTED_LANGUAGES)).toHaveLength(3);
    });

    it('should use consistent key format', () => {
      const keys = Object.keys(SUPPORTED_LANGUAGES);
      keys.forEach(key => {
        expect(key).toMatch(/^[A-Z]+$/); // uppercase only
      });
    });

    it('should use lowercase for language codes', () => {
      const values = Object.values(SUPPORTED_LANGUAGES);
      values.forEach(value => {
        expect(value).toMatch(/^[a-z]+$/); // lowercase only
      });
    });

    it('should map to default languages', () => {
      const languageCodes = Object.values(SUPPORTED_LANGUAGES);
      expect(languageCodes).toContain(DEFAULT_FROM_LANG);
      expect(languageCodes).toContain(DEFAULT_TO_LANG);
    });
  });

  describe('Context Menu', () => {
    it('should define context menu ID', () => {
      expect(CONTEXT_MENU_ID).toBeDefined();
      expect(typeof CONTEXT_MENU_ID).toBe('string');
    });

    it('should use descriptive context menu ID', () => {
      expect(CONTEXT_MENU_ID).toBe('searchOlam');
    });

    it('should not be empty', () => {
      expect(CONTEXT_MENU_ID.length).toBeGreaterThan(0);
    });
  });

  describe('Module Exports', () => {
    it('should export all required constants', () => {
      const constants = require('../../utils/constants');
      
      expect(constants).toHaveProperty('API_BASE_URL');
      expect(constants).toHaveProperty('DICTIONARY_BASE_URL');
      expect(constants).toHaveProperty('DEFAULT_FROM_LANG');
      expect(constants).toHaveProperty('DEFAULT_TO_LANG');
      expect(constants).toHaveProperty('SUPPORTED_LANGUAGES');
      expect(constants).toHaveProperty('CONTEXT_MENU_ID');
    });

    it('should export exactly 6 constants', () => {
      const constants = require('../../utils/constants');
      expect(Object.keys(constants)).toHaveLength(6);
    });
  });

  describe('Constant Values', () => {
    it('should not modify API_BASE_URL', () => {
      const original = API_BASE_URL;
      expect(() => {
        // In strict mode, this would throw, but we can at least verify value doesn't change
        const modified = API_BASE_URL + '/test';
        expect(API_BASE_URL).toBe(original);
        expect(modified).not.toBe(API_BASE_URL);
      }).not.toThrow();
    });

    it('should maintain consistency in SUPPORTED_LANGUAGES', () => {
      // Verify the structure is as expected
      expect(Object.keys(SUPPORTED_LANGUAGES)).toEqual(['AUTO', 'ENGLISH', 'MALAYALAM']);
      expect(Object.values(SUPPORTED_LANGUAGES)).toEqual(['auto', 'english', 'malayalam']);
    });
  });
});
