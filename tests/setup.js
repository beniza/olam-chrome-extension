/**
 * Jest Test Setup
 * Initializes test environment with Chrome API mocks
 */

// Import jest-webextension-mock to mock Chrome APIs
require('jest-webextension-mock');

// Additional global test setup
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch API for API tests
global.fetch = jest.fn();

// Setup DOM environment
document.body.innerHTML = '';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
  
  // Reset Chrome API mocks
  if (global.chrome) {
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
    chrome.storage.sync.get.mockClear();
    chrome.storage.sync.set.mockClear();
    chrome.runtime.sendMessage.mockClear();
    chrome.runtime.onMessage.addListener.mockClear();
  }
});
