/**
 * Mock Chrome API Utilities
 * Provides helper functions for mocking Chrome extension APIs
 */

/**
 * Mock chrome.storage.sync
 */
export const mockChromeStorageSync = {
  get: jest.fn((keys, callback) => {
    const mockData = {
      doubleClickEnabled: true,
      fromLanguage: 'auto',
      toLanguage: 'malayalam',
      resultLimit: 3
    };
    
    if (callback) {
      callback(mockData);
    }
    return Promise.resolve(mockData);
  }),
  
  set: jest.fn((items, callback) => {
    if (callback) {
      callback();
    }
    return Promise.resolve();
  }),
  
  clear: jest.fn((callback) => {
    if (callback) {
      callback();
    }
    return Promise.resolve();
  })
};

/**
 * Mock chrome.storage.local
 */
export const mockChromeStorageLocal = {
  get: jest.fn((keys, callback) => {
    const mockData = {};
    if (callback) {
      callback(mockData);
    }
    return Promise.resolve(mockData);
  }),
  
  set: jest.fn((items, callback) => {
    if (callback) {
      callback();
    }
    return Promise.resolve();
  }),
  
  clear: jest.fn((callback) => {
    if (callback) {
      callback();
    }
    return Promise.resolve();
  })
};

/**
 * Mock chrome.runtime
 */
export const mockChromeRuntime = {
  sendMessage: jest.fn((message, callback) => {
    const mockResponse = {
      success: true,
      data: []
    };
    if (callback) {
      callback(mockResponse);
    }
    return Promise.resolve(mockResponse);
  }),
  
  onMessage: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn()
  },
  
  getURL: jest.fn((path) => `chrome-extension://mock-id/${path}`)
};

/**
 * Mock chrome.contextMenus
 */
export const mockChromeContextMenus = {
  create: jest.fn((properties, callback) => {
    if (callback) {
      callback();
    }
    return 'mock-menu-id';
  }),
  
  remove: jest.fn((menuItemId, callback) => {
    if (callback) {
      callback();
    }
    return Promise.resolve();
  }),
  
  onClicked: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
};

/**
 * Mock chrome.tabs
 */
export const mockChromeTabs = {
  query: jest.fn((queryInfo, callback) => {
    const mockTabs = [{
      id: 1,
      url: 'https://example.com',
      active: true
    }];
    if (callback) {
      callback(mockTabs);
    }
    return Promise.resolve(mockTabs);
  }),
  
  sendMessage: jest.fn((tabId, message, callback) => {
    if (callback) {
      callback({ success: true });
    }
    return Promise.resolve({ success: true });
  })
};

/**
 * Setup complete Chrome mock
 */
export function setupChromeMock() {
  global.chrome = {
    storage: {
      sync: mockChromeStorageSync,
      local: mockChromeStorageLocal
    },
    runtime: mockChromeRuntime,
    contextMenus: mockChromeContextMenus,
    tabs: mockChromeTabs
  };
}

/**
 * Create mock Olam API response
 */
export function createMockOlamResponse(word = 'test') {
  return [
    {
      content: [word],
      relations: [
        {
          gloss: ['പരീക്ഷണം', 'പരിശോധന'],
          info: 'E.K. Kurup',
          types: ['noun'],
          tags: ['src:ekkurup']
        }
      ]
    }
  ];
}

/**
 * Create mock DOM element
 */
export function createMockPopup() {
  const popup = document.createElement('div');
  popup.id = 'olam-dictionary-popup';
  popup.className = 'olam-popup';
  
  const header = document.createElement('div');
  header.className = 'olam-header';
  popup.appendChild(header);
  
  const content = document.createElement('div');
  content.className = 'olam-content';
  popup.appendChild(content);
  
  return popup;
}

/**
 * Wait for condition to be true
 */
export function waitFor(condition, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(checkCondition, 50);
      }
    };
    
    checkCondition();
  });
}
