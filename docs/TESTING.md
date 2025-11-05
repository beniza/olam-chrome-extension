# Testing Guide

## Overview

This document describes the testing infrastructure for the Olam Dictionary Chrome Extension. The project uses Jest as the testing framework with support for Chrome Extension APIs.

## Testing Stack

- **Jest** - Testing framework
- **jest-environment-jsdom** - DOM environment for browser-like testing
- **jest-webextension-mock** - Mock Chrome Extension APIs
- **@types/chrome** - TypeScript definitions for Chrome APIs (for IDE support)

## Installation

Install testing dependencies:

```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test suites
```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test file
npm test -- appstate.test.js
```

## Test Structure

```
tests/
├── setup.js                     # Global test setup
├── mocks/
│   └── chrome-api.js           # Chrome API mocks and utilities
├── unit/
│   ├── appstate.test.js        # AppState module tests
│   ├── api.test.js             # API module tests
│   ├── background-api.test.js  # OlamAPI service tests
│   └── settings-service.test.js # SettingsService tests
└── integration/
    └── (integration tests)
```

## Test Coverage

The testing suite covers:

### Content Script (content.js)
- **AppState Module** - State management
  - Initial state verification
  - State reset functionality
  - Search data management
  - Entry filtering
  - Navigation (prev/next)
  - Filter tag management

- **API Module** - Communication
  - Language detection (English/Malayalam)
  - Search functionality
  - Message passing to background
  - Error handling

### Background Worker (background.js)
- **OlamAPI Service** - Dictionary API
  - API requests with correct URLs
  - URL encoding for special characters
  - Response parsing
  - Result caching
  - Error handling for HTTP errors
  - Network failure handling

- **SettingsService** - User preferences
  - Language preference retrieval
  - Default values
  - Error handling
  - Auto-detect support

## Writing Tests

### Basic Test Structure

```javascript
describe('Module Name', () => {
  beforeEach(() => {
    // Setup code
  });

  test('should do something', () => {
    // Test code
    expect(result).toBe(expected);
  });
});
```

### Testing with Chrome APIs

```javascript
import { setupChromeMock } from '../mocks/chrome-api';

describe('My Module', () => {
  beforeEach(() => {
    setupChromeMock(); // Initialize Chrome API mocks
  });

  test('should use chrome.storage', async () => {
    chrome.storage.sync.get.mockResolvedValueOnce({ key: 'value' });
    
    // Your test code
    
    expect(chrome.storage.sync.get).toHaveBeenCalled();
  });
});
```

### Testing Async Functions

```javascript
test('should handle async operations', async () => {
  const result = await myAsyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Handling

```javascript
test('should handle errors gracefully', async () => {
  mockFunction.mockRejectedValueOnce(new Error('Test error'));
  
  await expect(functionUnderTest()).rejects.toThrow('Test error');
});
```

## Mock Utilities

### Chrome API Mocks

Located in `tests/mocks/chrome-api.js`:

- `setupChromeMock()` - Initialize all Chrome API mocks
- `mockChromeStorageSync` - Mock chrome.storage.sync
- `mockChromeStorageLocal` - Mock chrome.storage.local
- `mockChromeRuntime` - Mock chrome.runtime
- `mockChromeContextMenus` - Mock chrome.contextMenus
- `mockChromeTabs` - Mock chrome.tabs

### Helper Functions

```javascript
// Create mock Olam API response
const mockResponse = createMockOlamResponse('word');

// Create mock DOM popup element
const popup = createMockPopup();

// Wait for async condition
await waitFor(() => condition === true, 1000);
```

## Best Practices

### 1. Isolation
Each test should be independent and not rely on other tests.

```javascript
beforeEach(() => {
  // Reset state before each test
});
```

### 2. Clear Descriptions
Use descriptive test names that explain what is being tested.

```javascript
test('should detect Malayalam text using Unicode range', () => {
  // ...
});
```

### 3. Arrange-Act-Assert
Structure tests with clear setup, execution, and verification phases.

```javascript
test('example test', () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toBe('expected');
});
```

### 4. Mock External Dependencies
Always mock Chrome APIs and external services.

```javascript
beforeEach(() => {
  global.fetch = jest.fn();
  setupChromeMock();
});
```

### 5. Test Edge Cases
Include tests for error conditions and boundary cases.

```javascript
test('should handle empty input', () => {
  expect(detectLanguage('')).toBe('english');
});

test('should handle null data', () => {
  expect(getFilteredEntries()).toEqual([]);
});
```

## Coverage Goals

Target coverage metrics:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report after running:
```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Continuous Integration

Tests should be run:
1. Before committing code
2. In CI/CD pipeline
3. Before merging pull requests

### Pre-commit Hook Example

```bash
#!/bin/sh
npm test
```

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module 'jest-webextension-mock'`
**Solution**: Run `npm install`

**Issue**: Chrome API mocks not working
**Solution**: Ensure `setupChromeMock()` is called in `beforeEach()`

**Issue**: Tests timeout
**Solution**: Increase Jest timeout in test file:
```javascript
jest.setTimeout(10000); // 10 seconds
```

**Issue**: DOM-related errors
**Solution**: Ensure `testEnvironment: 'jsdom'` is set in package.json

## Future Enhancements

- [ ] Integration tests for full user flows
- [ ] E2E tests using Puppeteer or Playwright
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Test coverage badges
- [ ] Automated test reports

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Chrome Extension Testing](https://developer.chrome.com/docs/extensions/mv3/testing/)
- [jest-webextension-mock](https://github.com/clarkbw/jest-webextension-mock)

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation if needed

---

Last updated: November 2025
