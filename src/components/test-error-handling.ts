/**
 * Error Handling Test Suite
 * 
 * Tests various error scenarios and fallback mechanisms
 */

import { createErrorBoundary } from '../utils/errorBoundary.js';
import { NetworkErrorHandler } from '../utils/networkErrorHandler.js';
import { createNotFoundPage } from '../pages/NotFoundPage.js';
import { ContentRenderer } from './ContentRenderer.js';

export function createErrorHandlingTest(): void {
  const app = document.querySelector('#app')!;
  
  app.innerHTML = `
    <div class="error-handling-test">
      <h1>Error Handling & Fallback Content Tests</h1>
      
      <div class="test-section">
        <h2>1. 404 Page Tests</h2>
        <div class="test-buttons">
          <button data-test="404-page">Test 404 Page</button>
          <button data-test="404-module">Test Module Not Found</button>
          <button data-test="404-lesson">Test Lesson Not Found</button>
          <button data-test="404-content">Test Content Not Found</button>
        </div>
        <div id="not-found-container" class="test-container"></div>
      </div>

      <div class="test-section">
        <h2>2. Media Error Tests</h2>
        <div class="test-buttons">
          <button data-test="image-error">Test Image Error</button>
          <button data-test="video-error">Test Video Error</button>
          <button data-test="gif-error">Test GIF Error</button>
        </div>
        <div id="media-container" class="test-container"></div>
      </div>

      <div class="test-section">
        <h2>3. Network Error Tests</h2>
        <div class="test-buttons">
          <button data-test="network-retry">Test Network Retry</button>
          <button data-test="connectivity-check">Test Connectivity</button>
          <button data-test="fetch-error">Test Fetch Error</button>
        </div>
        <div id="network-container" class="test-container"></div>
      </div>

      <div class="test-section">
        <h2>4. Error Boundary Tests</h2>
        <div class="test-buttons">
          <button data-test="js-error">Test JavaScript Error</button>
          <button data-test="component-error">Test Component Error</button>
          <button data-test="async-error">Test Async Error</button>
        </div>
        <div id="error-boundary-container" class="test-container"></div>
      </div>

      <div class="test-section">
        <h2>5. Graceful Degradation Tests</h2>
        <div class="test-buttons">
          <button data-test="browser-compat">Test Browser Compatibility</button>
          <button data-test="feature-fallback">Test Feature Fallbacks</button>
          <button data-test="offline-mode">Test Offline Mode</button>
        </div>
        <div id="degradation-container" class="test-container"></div>
      </div>
    </div>
  `;

  // Add test styles
  const style = document.createElement('style');
  style.textContent = `
    .error-handling-test {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .test-section {
      margin-bottom: 3rem;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    
    .test-section h2 {
      margin-top: 0;
      color: #374151;
    }
    
    .test-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    
    .test-buttons button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .test-buttons button:hover {
      background: #2563eb;
    }
    
    .test-container {
      min-height: 200px;
      border: 1px dashed #d1d5db;
      border-radius: 4px;
      padding: 1rem;
      background: #f9fafb;
    }
    
    .test-result {
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.875rem;
    }
    
    .test-result.success {
      background: #d1fae5;
      border: 1px solid #10b981;
      color: #065f46;
    }
    
    .test-result.error {
      background: #fee2e2;
      border: 1px solid #ef4444;
      color: #991b1b;
    }
    
    .test-result.info {
      background: #dbeafe;
      border: 1px solid #3b82f6;
      color: #1e40af;
    }
  `;
  document.head.appendChild(style);

  // Setup event listeners
  app.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const testType = target.getAttribute('data-test');
    
    if (testType) {
      handleTest(testType);
    }
  });

  function handleTest(testType: string): void {
    switch (testType) {
      case '404-page':
        test404Page();
        break;
      case '404-module':
        test404Module();
        break;
      case '404-lesson':
        test404Lesson();
        break;
      case '404-content':
        test404Content();
        break;
      case 'image-error':
        testImageError();
        break;
      case 'video-error':
        testVideoError();
        break;
      case 'gif-error':
        testGifError();
        break;
      case 'network-retry':
        testNetworkRetry();
        break;
      case 'connectivity-check':
        testConnectivityCheck();
        break;
      case 'fetch-error':
        testFetchError();
        break;
      case 'js-error':
        testJavaScriptError();
        break;
      case 'component-error':
        testComponentError();
        break;
      case 'async-error':
        testAsyncError();
        break;
      case 'browser-compat':
        testBrowserCompatibility();
        break;
      case 'feature-fallback':
        testFeatureFallbacks();
        break;
      case 'offline-mode':
        testOfflineMode();
        break;
    }
  }

  function test404Page(): void {
    const container = document.getElementById('not-found-container')!;
    createNotFoundPage(container, 'page', '/non-existent-page');
    showResult('not-found-container', 'success', '404 page rendered successfully');
  }

  function test404Module(): void {
    const container = document.getElementById('not-found-container')!;
    createNotFoundPage(container, 'module', '/module/non-existent-module');
    showResult('not-found-container', 'success', 'Module not found page rendered successfully');
  }

  function test404Lesson(): void {
    const container = document.getElementById('not-found-container')!;
    createNotFoundPage(container, 'lesson', '/module/test/lesson/non-existent');
    showResult('not-found-container', 'success', 'Lesson not found page rendered successfully');
  }

  function test404Content(): void {
    const container = document.getElementById('not-found-container')!;
    createNotFoundPage(container, 'content', '/content/missing-file.md');
    showResult('not-found-container', 'success', 'Content not found page rendered successfully');
  }

  function testImageError(): void {
    const container = document.getElementById('media-container')!;
    new ContentRenderer(container, {
      content: [{
        id: 'test-image-error',
        type: 'image',
        content: 'https://example.com/non-existent-image.jpg',
        metadata: {
          alt: 'Test image that will fail to load',
          caption: 'This image should trigger an error'
        }
      }]
    });
    showResult('media-container', 'info', 'Image error test initiated - should show retry button');
  }

  function testVideoError(): void {
    const container = document.getElementById('media-container')!;
    new ContentRenderer(container, {
      content: [{
        id: 'test-video-error',
        type: 'video',
        content: 'https://example.com/non-existent-video.mp4',
        metadata: {
          caption: 'This video should trigger an error'
        }
      }]
    });
    showResult('media-container', 'info', 'Video error test initiated - should show retry button');
  }

  function testGifError(): void {
    const container = document.getElementById('media-container')!;
    new ContentRenderer(container, {
      content: [{
        id: 'test-gif-error',
        type: 'gif',
        content: 'https://example.com/non-existent-animation.gif',
        metadata: {
          alt: 'Test GIF that will fail to load',
          caption: 'This GIF should trigger an error with static fallback option'
        }
      }]
    });
    showResult('media-container', 'info', 'GIF error test initiated - should show retry and static image options');
  }

  async function testNetworkRetry(): Promise<void> {
    try {
      showResult('network-container', 'info', 'Testing network retry mechanism...');
      
      await NetworkErrorHandler.fetchWithRetry(
        'https://httpstat.us/500', // This will return a 500 error
        {},
        { maxRetries: 2, baseDelay: 500 }
      );
      
      showResult('network-container', 'error', 'Unexpected success - should have failed');
    } catch (error) {
      showResult('network-container', 'success', `Network retry test completed: ${(error as Error).message}`);
    }
  }

  async function testConnectivityCheck(): Promise<void> {
    showResult('network-container', 'info', 'Checking network connectivity...');
    
    const connectivity = await NetworkErrorHandler.checkConnectivity();
    showResult('network-container', 'success', 
      `Connectivity: ${connectivity.isOnline ? 'Online' : 'Offline'}, ` +
      `Quality: ${connectivity.quality}, ` +
      `Latency: ${connectivity.latency || 'N/A'}ms`
    );
  }

  async function testFetchError(): Promise<void> {
    try {
      showResult('network-container', 'info', 'Testing fetch error handling...');
      
      await NetworkErrorHandler.fetchWithRetry('https://example.com/404-endpoint');
      showResult('network-container', 'error', 'Unexpected success');
    } catch (error) {
      const errorMessage = NetworkErrorHandler.createErrorMessage(error as Error);
      const suggestion = NetworkErrorHandler.getRetrySuggestion(error as Error);
      
      showResult('network-container', 'success', 
        `Error handled: ${errorMessage}. Suggestion: ${suggestion}`
      );
    }
  }

  function testJavaScriptError(): void {
    const container = document.getElementById('error-boundary-container')!;
    
    // Create error boundary
    createErrorBoundary(container, {
      onError: (errorInfo) => {
        showResult('error-boundary-container', 'success', 
          `Error boundary caught: ${errorInfo.error.message}`
        );
      }
    });
    
    // Trigger an error
    setTimeout(() => {
      throw new Error('Test JavaScript error for error boundary');
    }, 100);
    
    showResult('error-boundary-container', 'info', 'JavaScript error test initiated...');
  }

  function testComponentError(): void {
    const container = document.getElementById('error-boundary-container')!;
    
    // Create error boundary
    createErrorBoundary(container, {
      onError: (errorInfo) => {
        showResult('error-boundary-container', 'success', 
          `Component error caught: ${errorInfo.error.message}`
        );
      }
    });
    
    // Create a component that will error
    container.innerHTML = `
      <div onclick="this.nonExistentMethod()">
        Click me to trigger component error
      </div>
    `;
    
    showResult('error-boundary-container', 'info', 'Component error test ready - click the element above');
  }

  async function testAsyncError(): Promise<void> {
    const container = document.getElementById('error-boundary-container')!;
    
    createErrorBoundary(container, {
      onError: (errorInfo) => {
        showResult('error-boundary-container', 'success', 
          `Async error caught: ${errorInfo.error.message}`
        );
      }
    });
    
    // Trigger async error
    Promise.reject(new Error('Test async error'));
    
    showResult('error-boundary-container', 'info', 'Async error test initiated...');
  }

  function testBrowserCompatibility(): void {
    const support = {
      fetch: 'fetch' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      })()
    };
    
    const results = Object.entries(support)
      .map(([feature, supported]) => `${feature}: ${supported ? '✅' : '❌'}`)
      .join(', ');
    
    showResult('degradation-container', 'info', `Browser support: ${results}`);
  }

  function testFeatureFallbacks(): void {
    // Test lazy loading fallback
    if (!('IntersectionObserver' in window)) {
      showResult('degradation-container', 'info', 'IntersectionObserver not supported - using scroll events');
    } else {
      showResult('degradation-container', 'success', 'IntersectionObserver supported - using modern lazy loading');
    }
    
    // Test fetch fallback
    if (!('fetch' in window)) {
      showResult('degradation-container', 'info', 'Fetch not supported - would use XMLHttpRequest');
    } else {
      showResult('degradation-container', 'success', 'Fetch API supported');
    }
  }

  function testOfflineMode(): void {
    const isOnline = navigator.onLine;
    showResult('degradation-container', isOnline ? 'success' : 'info', 
      `Current status: ${isOnline ? 'Online' : 'Offline'}`
    );
    
    // Add offline/online event listeners for demo
    const onlineHandler = () => showResult('degradation-container', 'success', 'Connection restored!');
    const offlineHandler = () => showResult('degradation-container', 'info', 'Connection lost - offline mode active');
    
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    
    showResult('degradation-container', 'info', 'Offline/online event listeners added - try disconnecting your internet');
  }

  function showResult(containerId: string, type: 'success' | 'error' | 'info', message: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const result = document.createElement('div');
    result.className = `test-result ${type}`;
    result.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    
    container.appendChild(result);
    container.scrollTop = container.scrollHeight;
  }

  console.log('Error handling test suite loaded. Use the buttons to test different error scenarios.');
}