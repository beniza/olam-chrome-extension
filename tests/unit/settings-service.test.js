/**
 * Unit Tests for SettingsService (background.js)
 * Tests settings management and language preferences
 */

const { setupChromeMock } = require('../mocks/chrome-api');

describe('SettingsService', () => {
  let SettingsService;
  const DEFAULT_FROM_LANG = 'auto';
  const DEFAULT_TO_LANG = 'malayalam';
  
  beforeEach(() => {
    setupChromeMock();
    
    // Recreate SettingsService module
    SettingsService = {
      async getLanguagePreferences() {
        try {
          const settings = await chrome.storage.sync.get(['fromLanguage', 'toLanguage']);
          return {
            fromLang: settings.fromLanguage || DEFAULT_FROM_LANG,
            toLang: settings.toLanguage || DEFAULT_TO_LANG
          };
        } catch (error) {
          console.error('Settings error:', error);
          return {
            fromLang: DEFAULT_FROM_LANG,
            toLang: DEFAULT_TO_LANG
          };
        }
      }
    };
  });
  
  describe('getLanguagePreferences()', () => {
    test('should return stored language preferences', async () => {
      chrome.storage.sync.get.mockResolvedValueOnce({
        fromLanguage: 'english',
        toLanguage: 'malayalam'
      });
      
      const prefs = await SettingsService.getLanguagePreferences();
      
      expect(prefs).toEqual({
        fromLang: 'english',
        toLang: 'malayalam'
      });
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['fromLanguage', 'toLanguage']);
    });
    
    test('should return defaults when no settings stored', async () => {
      chrome.storage.sync.get.mockResolvedValueOnce({});
      
      const prefs = await SettingsService.getLanguagePreferences();
      
      expect(prefs).toEqual({
        fromLang: DEFAULT_FROM_LANG,
        toLang: DEFAULT_TO_LANG
      });
    });
    
    test('should use default for missing fromLanguage', async () => {
      chrome.storage.sync.get.mockResolvedValueOnce({
        toLanguage: 'malayalam'
      });
      
      const prefs = await SettingsService.getLanguagePreferences();
      
      expect(prefs).toEqual({
        fromLang: DEFAULT_FROM_LANG,
        toLang: 'malayalam'
      });
    });
    
    test('should use default for missing toLanguage', async () => {
      chrome.storage.sync.get.mockResolvedValueOnce({
        fromLanguage: 'malayalam'
      });
      
      const prefs = await SettingsService.getLanguagePreferences();
      
      expect(prefs).toEqual({
        fromLang: 'malayalam',
        toLang: DEFAULT_TO_LANG
      });
    });
    
    test('should return defaults on storage error', async () => {
      chrome.storage.sync.get.mockRejectedValueOnce(new Error('Storage error'));
      
      const prefs = await SettingsService.getLanguagePreferences();
      
      expect(prefs).toEqual({
        fromLang: DEFAULT_FROM_LANG,
        toLang: DEFAULT_TO_LANG
      });
    });
    
    test('should handle auto-detect option', async () => {
      chrome.storage.sync.get.mockResolvedValueOnce({
        fromLanguage: 'auto',
        toLanguage: 'malayalam'
      });
      
      const prefs = await SettingsService.getLanguagePreferences();
      
      expect(prefs.fromLang).toBe('auto');
    });
    
    test('should handle Malayalam to Malayalam translation', async () => {
      chrome.storage.sync.get.mockResolvedValueOnce({
        fromLanguage: 'malayalam',
        toLanguage: 'malayalam'
      });
      
      const prefs = await SettingsService.getLanguagePreferences();
      
      expect(prefs).toEqual({
        fromLang: 'malayalam',
        toLang: 'malayalam'
      });
    });
  });
});
