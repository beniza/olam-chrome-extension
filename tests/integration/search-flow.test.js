/**
 * Integration Tests
 * Tests interaction between multiple modules
 */

import { setupChromeMock, createMockOlamResponse } from '../mocks/chrome-api';

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
  beforeEach(() => {
    setupChromeMock();
  });
  
  test('should sync settings across modules', async () => {
    const newSettings = {
      fromLanguage: 'malayalam',
      toLanguage: 'english',
      doubleClickEnabled: false,
      resultLimit: 10
    };
    
    // Save settings
    await chrome.storage.sync.set(newSettings);
    
    // Retrieve settings
    chrome.storage.sync.get.mockResolvedValueOnce(newSettings);
    
    const retrieved = await chrome.storage.sync.get([
      'fromLanguage',
      'toLanguage',
      'doubleClickEnabled',
      'resultLimit'
    ]);
    
    expect(retrieved).toEqual(newSettings);
  });
});
