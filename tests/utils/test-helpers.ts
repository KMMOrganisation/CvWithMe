/**
 * Test Utilities and Helpers
 * 
 * Common utilities for testing components and functionality
 */

import { vi } from 'vitest';
import { ContentBlock } from '../../src/data/types/index.js';

/**
 * Creates a mock DOM element with common properties
 */
export function createMockElement(tagName: string = 'div', attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement(tagName);
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  return element;
}

/**
 * Creates sample content blocks for testing
 */
export function createSampleContent(count: number = 3): ContentBlock[] {
  const types: ContentBlock['type'][] = ['text', 'code', 'image', 'video', 'callout'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `block-${i}`,
    type: types[i % types.length],
    content: `Sample content ${i}`,
    metadata: {
      caption: `Caption ${i}`,
      alt: `Alt text ${i}`,
      language: 'javascript'
    }
  }));
}

/**
 * Simulates user interaction events
 */
export class UserInteractionSimulator {
  static click(element: HTMLElement): void {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
  }
  
  static keydown(element: HTMLElement, key: string, options: KeyboardEventInit = {}): void {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options
    });
    element.dispatchEvent(event);
  }
  
  static focus(element: HTMLElement): void {
    const event = new FocusEvent('focus', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
  
  static blur(element: HTMLElement): void {
    const event = new FocusEvent('blur', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
  
  static mouseEnter(element: HTMLElement): void {
    const event = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
  
  static mouseLeave(element: HTMLElement): void {
    const event = new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  static measureRenderTime(renderFn: () => void): number {
    const start = performance.now();
    renderFn();
    return performance.now() - start;
  }
  
  static async measureAsyncOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
  }
  
  static createLargeDataset(size: number): any[] {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
      description: `Description for item ${i}`.repeat(10),
      data: new Array(100).fill(`data-${i}`)
    }));
  }
}

/**
 * Accessibility testing utilities
 */
export class AccessibilityTestUtils {
  static checkAriaAttributes(element: HTMLElement, expectedAttributes: Record<string, string>): boolean {
    return Object.entries(expectedAttributes).every(([attr, value]) => {
      return element.getAttribute(attr) === value;
    });
  }
  
  static checkKeyboardNavigation(element: HTMLElement): boolean {
    const tabIndex = element.getAttribute('tabindex');
    const role = element.getAttribute('role');
    
    // Element should be focusable
    return (tabIndex === '0' || tabIndex === null) && 
           (role === 'button' || element.tagName === 'BUTTON' || element.tagName === 'A');
  }
  
  static checkHeadingHierarchy(container: HTMLElement): boolean {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const levels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        return false; // Skipped heading level
      }
    }
    return true;
  }
  
  static checkColorContrast(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // This is a simplified check - in real scenarios, use a proper contrast ratio calculator
    return color !== backgroundColor && color !== 'transparent' && backgroundColor !== 'transparent';
  }
}

/**
 * Mock implementations for testing
 */
export class MockImplementations {
  static createMockIntersectionObserver(): void {
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: []
    }));
  }
  
  static createMockResizeObserver(): void {
    global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));
  }
  
  static createMockMatchMedia(): void {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
  
  static createMockLocalStorage(): void {
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage
    });
  }
  
  static createMockFetch(responses: Record<string, any> = {}): void {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      const response = responses[url] || { data: 'mock data' };
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response))
      });
    });
  }
}

/**
 * Test data generators
 */
export class TestDataGenerators {
  static generateModule(id: number = 1) {
    return {
      id,
      title: `Module ${id}: Test Module`,
      slug: `module-${id}`,
      description: `This is a test module ${id} for testing purposes.`,
      estimatedTime: '2-3 hours',
      complexity: 'Beginner' as const,
      prerequisites: [],
      lessons: this.generateLessons(3, id),
      order: id
    };
  }
  
  static generateLessons(count: number = 3, moduleId: number = 1) {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      moduleId,
      title: `Lesson ${i + 1}: Test Lesson`,
      slug: `lesson-${i + 1}`,
      description: `This is test lesson ${i + 1}.`,
      estimatedTime: '30-45 minutes',
      tools: ['Text Editor', 'Web Browser'],
      complexity: 'Beginner',
      prerequisites: i > 0 ? [`Lesson ${i}`] : [],
      content: this.createSampleContent(5),
      order: i + 1
    }));
  }
  
  static generateUser() {
    return {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      progress: {
        completedLessons: [1, 2],
        currentModule: 1,
        currentLesson: 3
      }
    };
  }
}

/**
 * Assertion helpers for common test patterns
 */
export class TestAssertions {
  static assertElementExists(container: HTMLElement, selector: string): HTMLElement {
    const element = container.querySelector(selector) as HTMLElement;
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    return element;
  }
  
  static assertElementHasClass(element: HTMLElement, className: string): void {
    if (!element.classList.contains(className)) {
      throw new Error(`Element does not have class "${className}"`);
    }
  }
  
  static assertElementHasAttribute(element: HTMLElement, attribute: string, value?: string): void {
    if (!element.hasAttribute(attribute)) {
      throw new Error(`Element does not have attribute "${attribute}"`);
    }
    
    if (value !== undefined && element.getAttribute(attribute) !== value) {
      throw new Error(`Element attribute "${attribute}" is "${element.getAttribute(attribute)}", expected "${value}"`);
    }
  }
  
  static assertElementIsVisible(element: HTMLElement): void {
    const styles = window.getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
      throw new Error('Element is not visible');
    }
  }
  
  static assertElementIsFocusable(element: HTMLElement): void {
    const tabIndex = element.getAttribute('tabindex');
    const isInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
    
    if (!isInteractive && tabIndex !== '0') {
      throw new Error('Element is not focusable');
    }
  }
}

/**
 * Setup and teardown utilities
 */
export class TestSetup {
  static setupDOM(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    return container;
  }
  
  static teardownDOM(container?: HTMLElement): void {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    } else {
      document.body.innerHTML = '';
    }
  }
  
  static setupMocks(): void {
    MockImplementations.createMockIntersectionObserver();
    MockImplementations.createMockResizeObserver();
    MockImplementations.createMockMatchMedia();
    MockImplementations.createMockLocalStorage();
  }
  
  static setupPerformanceMonitoring(): void {
    // Mock performance API if not available
    if (!global.performance) {
      global.performance = {
        now: () => Date.now(),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => [])
      } as any;
    }
  }
}

// Export all utilities
export {
  UserInteractionSimulator as UserInteraction,
  PerformanceTestUtils as Performance,
  AccessibilityTestUtils as Accessibility,
  MockImplementations as Mocks,
  TestDataGenerators as TestData,
  TestAssertions as Assertions,
  TestSetup as Setup
};