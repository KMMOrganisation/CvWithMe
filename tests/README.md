# CV Tutorial Website - Testing Suite

This directory contains a comprehensive testing suite for the CV Tutorial Website, covering unit tests, integration tests, accessibility tests, performance tests, and end-to-end tests.

## 🧪 Test Structure

```
tests/
├── components/           # Unit tests for React/TS components
├── utils/               # Unit tests for utility functions
├── integration/         # Integration tests for user flows
├── accessibility/       # Accessibility-specific tests
├── performance/         # Performance and optimization tests
├── setup.ts            # Test environment setup
└── utils/
    └── test-helpers.ts  # Common testing utilities

e2e/                     # End-to-end tests (Playwright)
├── navigation.spec.ts   # Navigation flow tests
└── accessibility.spec.ts # E2E accessibility tests
```

## 🚀 Running Tests

### All Tests
```bash
# Run the complete test suite
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Specific Test Types
```bash
# Unit tests only
npm run test -- tests/components tests/utils

# Integration tests
npm run test -- tests/integration

# Accessibility tests
npm run test:accessibility

# Performance tests
npm run test:performance

# End-to-end tests
npm run test:e2e
```

### Custom Test Runner
```bash
# Run comprehensive test suite with reporting
node scripts/test-runner.js

# Run specific test types
node scripts/test-runner.js --unit
node scripts/test-runner.js --e2e
node scripts/test-runner.js --accessibility
node scripts/test-runner.js --performance
```

## 📋 Test Categories

### 1. Unit Tests (`tests/components/`, `tests/utils/`)

Tests individual components and utility functions in isolation.

**Coverage includes:**
- Component rendering and props handling
- User interaction events (click, keyboard, focus)
- State management and updates
- Error handling and edge cases
- Accessibility attributes and ARIA support

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { ModuleCard } from '../../src/components/ModuleCard.js';

describe('ModuleCard Component', () => {
  it('should render with correct props', () => {
    const moduleCard = new ModuleCard({
      module: sampleModule,
      onClick: vi.fn()
    });
    
    const element = moduleCard.getElement();
    expect(element.textContent).toContain(sampleModule.title);
  });
});
```

### 2. Integration Tests (`tests/integration/`)

Tests complete user workflows and component interactions.

**Coverage includes:**
- Navigation between pages
- Search functionality
- Progress tracking
- State persistence
- Error recovery

### 3. Accessibility Tests (`tests/accessibility/`)

Ensures the application meets WCAG 2.1 AA standards.

**Coverage includes:**
- Automated accessibility scanning with axe-core
- Keyboard navigation testing
- Screen reader compatibility
- Focus management
- Color contrast validation
- ARIA attributes and roles

### 4. Performance Tests (`tests/performance/`)

Validates performance optimizations and resource usage.

**Coverage includes:**
- Component render times
- Memory usage and leak detection
- Bundle size analysis
- Lazy loading effectiveness
- Cache performance
- Animation performance

### 5. End-to-End Tests (`e2e/`)

Tests the complete application in real browsers using Playwright.

**Coverage includes:**
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile responsiveness
- Real user interactions
- Network conditions
- Accessibility in real browsers

## 🛠 Testing Tools and Libraries

### Core Testing Framework
- **Vitest**: Fast unit test runner with TypeScript support
- **jsdom**: DOM environment for unit tests
- **@testing-library/dom**: DOM testing utilities

### Accessibility Testing
- **axe-core**: Automated accessibility testing
- **@axe-core/playwright**: Playwright integration for axe

### End-to-End Testing
- **Playwright**: Cross-browser E2E testing
- **@playwright/test**: Playwright test runner

### Performance Testing
- **Lighthouse CI**: Performance auditing
- **Bundle analyzer**: Bundle size analysis

## 📊 Test Reports and Coverage

### Coverage Reports
Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI integration

### E2E Test Reports
Playwright generates reports in `playwright-report/`:
- HTML report with screenshots and videos
- Test traces for debugging failures

### Performance Reports
Performance metrics are saved in `test-reports/`:
- Bundle analysis
- Lighthouse scores
- Custom performance metrics

## 🔧 Configuration Files

### Vitest Configuration (`vitest.config.ts`)
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

### Playwright Configuration (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } }
  ]
});
```

## 🎯 Testing Best Practices

### 1. Test Structure
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Follow the Arrange-Act-Assert pattern

### 2. Component Testing
```typescript
// ✅ Good: Test behavior, not implementation
it('should navigate to module when clicked', () => {
  const onClickMock = vi.fn();
  const moduleCard = new ModuleCard({ module, onClick: onClickMock });
  
  fireEvent.click(moduleCard.getElement());
  
  expect(onClickMock).toHaveBeenCalledWith(module);
});

// ❌ Avoid: Testing implementation details
it('should call internal method', () => {
  expect(moduleCard.handleClick).toHaveBeenCalled();
});
```

### 3. Accessibility Testing
```typescript
// Test keyboard navigation
it('should support keyboard navigation', () => {
  const element = component.getElement();
  
  fireEvent.keyDown(element, { key: 'Enter' });
  expect(mockOnClick).toHaveBeenCalled();
  
  fireEvent.keyDown(element, { key: ' ' });
  expect(mockOnClick).toHaveBeenCalled();
});

// Test ARIA attributes
it('should have proper ARIA attributes', () => {
  const element = component.getElement();
  
  expect(element.getAttribute('role')).toBe('button');
  expect(element.getAttribute('aria-label')).toBeTruthy();
});
```

### 4. Performance Testing
```typescript
it('should render within performance budget', () => {
  const startTime = performance.now();
  
  new ContentRenderer(container, { content: largeContent });
  
  const renderTime = performance.now() - startTime;
  expect(renderTime).toBeLessThan(100); // 100ms budget
});
```

## 🚨 Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npm test -- tests/components/ModuleCard.test.ts

# Run tests matching pattern
npm test -- --grep "navigation"

# Run tests in debug mode
npm test -- --inspect-brk
```

### Playwright Debugging
```bash
# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Generate trace
npx playwright test --trace on
```

### Common Issues and Solutions

1. **Test timeouts**: Increase timeout for slow operations
2. **Flaky tests**: Add proper waits and assertions
3. **Memory leaks**: Ensure proper cleanup in `afterEach`
4. **Mock issues**: Reset mocks between tests

## 📈 Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main/develop branches
- Scheduled runs (nightly)

### GitHub Actions Workflow
The CI pipeline includes:
1. Unit and integration tests
2. Accessibility validation
3. Performance benchmarks
4. Cross-browser E2E tests
5. Mobile testing
6. Security audits
7. Bundle analysis

### Quality Gates
- Minimum 80% code coverage
- All accessibility tests must pass
- Performance budgets must be met
- No high-severity security vulnerabilities

## 🤝 Contributing to Tests

### Adding New Tests
1. Create test files following the naming convention: `*.test.ts`
2. Use the test helpers from `tests/utils/test-helpers.ts`
3. Follow the existing patterns and structure
4. Ensure tests are deterministic and isolated

### Test Naming Convention
```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should expected behavior', () => {
      // Test implementation
    });
  });
});
```

### Accessibility Test Requirements
All new components must include:
- Keyboard navigation tests
- ARIA attribute validation
- Screen reader compatibility
- Color contrast verification (where applicable)

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Performance Testing Guide](https://web.dev/performance/)

---

For questions or issues with the testing suite, please check the existing test files for examples or create an issue in the project repository.