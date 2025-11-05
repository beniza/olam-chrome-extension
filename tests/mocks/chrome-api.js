/**
 * Mock Chrome API Utilities
 * Provides helper functions for mocking Chrome extension APIs
 */

/**
 * Mock chrome.storage.sync
 */
const mockChromeStorageSync = {
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
const mockChromeStorageLocal = {
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
const mockChromeRuntime = {
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
const mockChromeContextMenus = {
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
const mockChromeTabs = {
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
function setupChromeMock() {
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
 * Create mock Olam API response matching actual API structure
 * @param {string} word - The word being searched
 * @param {string} fromLang - Source language (default: 'english')
 * @param {string} toLang - Target language (default: 'malayalam')
 * @returns {Object} Mock API response
 */
function createMockOlamResponse(word = 'test', fromLang = 'english', toLang = 'malayalam') {
  return {
    data: {
      entries: [
        {
          guid: 'mock-guid-1',
          weight: -1000,
          initial: word[0].toUpperCase(),
          lang: fromLang,
          content: [word],
          content_length: 1,
          tokens: `'${word.toLowerCase()}':1`,
          tags: ['src:ekkurup'],
          phones: [],
          notes: '',
          meta: {},
          status: 'enabled',
          relations: [
            {
              guid: 'mock-relation-guid-1',
              weight: 1,
              initial: 'പ',
              lang: toLang,
              content: ['പരീക്ഷണം', 'പരിശോധന'],
              content_length: 2,
              tokens: '',
              tags: ['src:ekkurup'],
              phones: [],
              notes: '',
              meta: {},
              status: 'enabled',
              created_at: '2025-11-01T05:15:21.46612Z',
              updated_at: '2025-11-01T05:15:21.46612Z',
              total_relations: 1,
              relation: {
                types: ['noun'],
                tags: ['src:ekkurup'],
                notes: '',
                weight: 0,
                status: 'enabled',
                created_at: '2025-11-01T05:15:21.46612Z',
                updated_at: '2025-11-01T05:15:21.46612Z'
              }
            }
          ],
          created_at: '2025-11-01T05:15:21.46612Z',
          updated_at: '2025-11-01T05:15:21.46612Z',
          total_relations: 1
        }
      ],
      query: {
        q: word,
        from_lang: fromLang,
        to_lang: toLang,
        types: [],
        tags: [],
        status: 'enabled',
        page: 0,
        per_page: 0
      },
      page: 1,
      per_page: 10,
      total_pages: 1,
      total: 1
    }
  };
}

/**
 * Create mock DOM element
 */
function createMockPopup() {
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
function waitFor(condition, timeout = 1000) {
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

// Export for CommonJS
module.exports = {
  mockChromeStorageSync,
  mockChromeStorageLocal,
  mockChromeRuntime,
  mockChromeContextMenus,
  mockChromeTabs,
  setupChromeMock,
  createMockOlamResponse,
  createMockPopup,
  waitFor
};
