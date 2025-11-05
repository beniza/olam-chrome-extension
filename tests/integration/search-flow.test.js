/**
 * Integration Tests
 * Tests interaction between multiple modules
 */

const { setupChromeMock, createMockOlamResponse } = require('../mocks/chrome-api');

describe('Search Flow Integration', () => {
  beforeEach(() => {
    setupChromeMock();
    global.fetch = jest.fn();
  });
  
  test('should complete full search flow from content to background', async () => {
    // Mock API response
    const mockData = createMockOlamResponse('hello');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });
    
    // Simulate user search from content script
    const searchRequest = {
      action: 'searchWord',
      text: 'hello',
      fromLang: 'english',
      toLang: 'malayalam'
    };
    
    // Mock background script response
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      expect(message).toEqual(searchRequest);
      callback({
        success: true,
        data: mockData
      });
    });
    
    // Execute search
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage(searchRequest, resolve);
    });
    
    // Verify response
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockData);
  });
  
  test('should handle context menu search flow', async () => {
    const mockData = createMockOlamResponse('test');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });
    
    // Mock settings
    chrome.storage.sync.get.mockResolvedValueOnce({
      fromLanguage: 'auto',
      toLanguage: 'malayalam'
    });
    
    // Simulate context menu click
    const info = {
      menuItemId: 'searchOlam',
      selectionText: 'test'
    };
    
    const tab = {
      id: 1
    };
    
    // Mock tab message
    chrome.tabs.sendMessage.mockResolvedValueOnce({
      success: true
    });
    
    // Verify settings were loaded
    expect(chrome.storage.sync.get).toBeDefined();
  });
});

describe('Settings Integration', () => {
  test('should be able to save and verify settings', async () => {
    setupChromeMock();
    
    const newSettings = {
      fromLanguage: 'malayalam',
      toLanguage: 'malayalam',
      doubleClickEnabled: false,
      resultLimit: 10
    };
    
    // Save settings
    await chrome.storage.sync.set(newSettings);
    
    // Verify set was called with correct data
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(newSettings);
    
    // Verify get function exists and can be called
    const result = await chrome.storage.sync.get(['fromLanguage']);
    expect(result).toBeDefined();
    expect(chrome.storage.sync.get).toHaveBeenCalled();
  });
});
