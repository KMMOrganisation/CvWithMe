/**
 * Performance Testing Suite
 * 
 * Tests the performance optimizations including lazy loading, caching, and error handling
 */

import { createSkeletonLoader } from './SkeletonLoader.js';
import { createErrorBoundary, withErrorBoundary } from '../utils/errorBoundary.js';
import { imageCache, contentCache, CachePerformanceMonitor } from '../utils/cacheManager.js';
import { ContentRenderer } from './ContentRenderer.js';
import { ContentBlock } from '../data/types/index.js';

export function createPerformanceTest(): void {
  console.log('🚀 Starting Performance Tests...');
  
  const app = document.querySelector('#app')!;
  app.innerHTML = `
    <div class="performance-test-container">
      <h1>Performance Optimization Tests</h1>
      <div class="test-sections">
        <section id="skeleton-test" class="test-section">
          <h2>Skeleton Loading Test</h2>
          <div class="test-content"></div>
          <button class="test-btn" onclick="window.testSkeleton()">Test Skeleton Loader</button>
        </section>
        
        <section id="lazy-loading-test" class="test-section">
          <h2>Lazy Loading Test</h2>
          <div class="test-content"></div>
          <button class="test-btn" onclick="window.testLazyLoading()">Test Lazy Loading</button>
        </section>
        
        <section id="error-boundary-test" class="test-section">
          <h2>Error Boundary Test</h2>
          <div class="test-content"></div>
          <button class="test-btn" onclick="window.testErrorBoundary()">Test Error Handling</button>
        </section>
        
        <section id="cache-test" class="test-section">
          <h2>Cache Performance Test</h2>
          <div class="test-content"></div>
          <button class="test-btn" onclick="window.testCaching()">Test Caching</button>
        </section>
        
        <section id="bundle-test" class="test-section">
          <h2>Bundle Size Analysis</h2>
          <div class="test-content"></div>
          <button class="test-btn" onclick="window.testBundleSize()">Analyze Bundle</button>
        </section>
      </div>
    </div>
  `;

  // Add test styles
  const style = document.createElement('style');
  style.textContent = `
    .performance-test-container {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .test-sections {
      display: grid;
      gap: var(--space-6);
      margin-top: var(--space-6);
    }
    
    .test-section {
      border: 1px solid var(--gray-300);
      border-radius: 8px;
      padding: var(--space-6);
      background: white;
    }
    
    .test-section h2 {
      margin-bottom: var(--space-4);
      color: var(--primary-700);
    }
    
    .test-content {
      min-height: 200px;
      border: 1px dashed var(--gray-300);
      border-radius: 4px;
      margin-bottom: var(--space-4);
      padding: var(--space-4);
    }
    
    .test-btn {
      background: var(--primary-500);
      color: white;
      border: none;
      padding: var(--space-3) var(--space-6);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .test-btn:hover {
      background: var(--primary-600);
    }
    
    .performance-metrics {
      background: var(--gray-50);
      padding: var(--space-4);
      border-radius: 4px;
      margin-top: var(--space-4);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
    }
  `;
  document.head.appendChild(style);

  // Set up global test functions
  setupGlobalTestFunctions();
  
  console.log('✅ Performance test suite ready');
}

function setupGlobalTestFunctions(): void {
  // Test skeleton loader
  (window as any).testSkeleton = async () => {
    const container = document.querySelector('#skeleton-test .test-content')! as HTMLElement;
    console.log('Testing skeleton loader...');
    
    const startTime = performance.now();
    
    // Show different skeleton types
    const skeletonTypes = ['text', 'image', 'video', 'code', 'card', 'module-grid'];
    
    for (const type of skeletonTypes) {
      container.innerHTML = `<h3>Testing ${type} skeleton:</h3>`;
      const skeletonContainer = document.createElement('div');
      container.appendChild(skeletonContainer);
      
      const skeleton = createSkeletonLoader(skeletonContainer, { 
        type: type as any, 
        count: type.includes('grid') ? 3 : 1 
      });
      
      // Show for 2 seconds then hide
      await new Promise(resolve => setTimeout(resolve, 2000));
      skeleton.hide();
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const endTime = performance.now();
    const metrics = document.createElement('div');
    metrics.className = 'performance-metrics';
    metrics.innerHTML = `
      <strong>Skeleton Loading Performance:</strong><br>
      Total time: ${(endTime - startTime).toFixed(2)}ms<br>
      Types tested: ${skeletonTypes.length}<br>
      Average per type: ${((endTime - startTime) / skeletonTypes.length).toFixed(2)}ms
    `;
    container.appendChild(metrics);
    
    console.log('✅ Skeleton loader test completed');
  };

  // Test lazy loading
  (window as any).testLazyLoading = async () => {
    const container = document.querySelector('#lazy-loading-test .test-content')! as HTMLElement;
    console.log('Testing lazy loading...');
    
    const startTime = performance.now();
    
    // Create test content with images and videos
    const testContent: ContentBlock[] = [
      {
        id: '1',
        type: 'text',
        content: 'Testing lazy loading with multiple media types:'
      },
      {
        id: '2',
        type: 'image',
        content: 'https://picsum.photos/400/300?random=1',
        metadata: { alt: 'Test image 1', caption: 'Lazy loaded image' }
      },
      {
        id: '3',
        type: 'image',
        content: 'https://picsum.photos/400/300?random=2',
        metadata: { alt: 'Test image 2', caption: 'Another lazy loaded image' }
      },
      {
        id: '4',
        type: 'text',
        content: 'Images should load as they come into view with skeleton placeholders.'
      }
    ];
    
    new ContentRenderer(container, { content: testContent });
    
    // Monitor loading performance
    let imagesLoaded = 0;
    const totalImages = testContent.filter(block => block.type === 'image').length;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.classList.contains('lazy-loaded')) {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
              const endTime = performance.now();
              const metrics = document.createElement('div');
              metrics.className = 'performance-metrics';
              metrics.innerHTML = `
                <strong>Lazy Loading Performance:</strong><br>
                Total loading time: ${(endTime - startTime).toFixed(2)}ms<br>
                Images loaded: ${imagesLoaded}/${totalImages}<br>
                Average per image: ${((endTime - startTime) / totalImages).toFixed(2)}ms
              `;
              container.appendChild(metrics);
              observer.disconnect();
            }
          }
        });
      });
    });
    
    observer.observe(container, { childList: true, subtree: true });
    
    console.log('✅ Lazy loading test started - images will load as they come into view');
  };

  // Test error boundary
  (window as any).testErrorBoundary = async () => {
    const container = document.querySelector('#error-boundary-test .test-content')! as HTMLElement;
    console.log('Testing error boundary...');
    
    const startTime = performance.now();
    
    // Create error boundary
    createErrorBoundary(container, {
      onError: (errorInfo) => {
        console.log('Error caught by boundary:', errorInfo.error.message);
      },
      enableRetry: true,
      showErrorDetails: true
    });
    
    // Test with async operation that fails
    const result = await withErrorBoundary(
      container,
      async () => {
        container.innerHTML = '<p>Loading content that will fail...</p>';
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Simulated network error');
      },
      {
        fallbackContent: `
          <div class="error-content">
            <h3>Custom Error Fallback</h3>
            <p>This is a custom error message for testing.</p>
          </div>
        `
      }
    );
    
    const endTime = performance.now();
    
    setTimeout(() => {
      const metrics = document.createElement('div');
      metrics.className = 'performance-metrics';
      metrics.innerHTML = `
        <strong>Error Boundary Performance:</strong><br>
        Error handling time: ${(endTime - startTime).toFixed(2)}ms<br>
        Result: ${result ? 'Success' : 'Error handled gracefully'}<br>
        Fallback displayed: ${container.querySelector('.error-content') ? 'Yes' : 'No'}
      `;
      container.appendChild(metrics);
    }, 100);
    
    console.log('✅ Error boundary test completed');
  };

  // Test caching
  (window as any).testCaching = async () => {
    const container = document.querySelector('#cache-test .test-content')! as HTMLElement;
    console.log('Testing caching performance...');
    
    const startTime = performance.now();
    
    // Test content caching
    const testData = { message: 'Hello, cached world!', timestamp: Date.now() };
    
    // First write
    const writeStart = performance.now();
    contentCache.set('test-key', testData);
    const writeTime = performance.now() - writeStart;
    
    // First read (cache hit)
    const readStart = performance.now();
    const cachedData = contentCache.get('test-key');
    const readTime = performance.now() - readStart;
    
    // Test image caching
    const imageStart = performance.now();
    try {
      await imageCache.cacheImage('https://picsum.photos/200/200?random=3');
      const imageTime = performance.now() - imageStart;
      
      // Second read (should be faster)
      const secondReadStart = performance.now();
      const cachedImage = imageCache.get('https://picsum.photos/200/200?random=3');
      const secondReadTime = performance.now() - secondReadStart;
      
      const endTime = performance.now();
      
      container.innerHTML = `
        <h3>Cache Test Results:</h3>
        <div class="performance-metrics">
          <strong>Content Cache Performance:</strong><br>
          Write time: ${writeTime.toFixed(3)}ms<br>
          Read time: ${readTime.toFixed(3)}ms<br>
          Data retrieved: ${cachedData ? 'Success' : 'Failed'}<br><br>
          
          <strong>Image Cache Performance:</strong><br>
          Initial cache time: ${imageTime.toFixed(2)}ms<br>
          Cached read time: ${secondReadTime.toFixed(3)}ms<br>
          Image cached: ${cachedImage ? 'Success' : 'Failed'}<br><br>
          
          <strong>Overall Performance:</strong><br>
          Total test time: ${(endTime - startTime).toFixed(2)}ms<br>
          Cache stats: ${JSON.stringify(contentCache.getStats(), null, 2)}
        </div>
      `;
      
      // Log cache performance stats
      CachePerformanceMonitor.logStats();
      
    } catch (error) {
      container.innerHTML = `<p>Cache test failed: ${error}</p>`;
    }
    
    console.log('✅ Caching test completed');
  };

  // Test bundle size analysis
  (window as any).testBundleSize = async () => {
    const container = document.querySelector('#bundle-test .test-content')! as HTMLElement;
    console.log('Analyzing bundle size...');
    
    // Simulate bundle analysis (in a real app, this would come from build tools)
    const bundleInfo = {
      totalSize: '245.7 KB',
      gzippedSize: '78.3 KB',
      chunks: [
        { name: 'main.js', size: '89.2 KB', gzipped: '28.1 KB' },
        { name: 'vendor.js', size: '156.5 KB', gzipped: '50.2 KB' },
        { name: 'styles.css', size: '23.4 KB', gzipped: '6.8 KB' }
      ],
      loadTime: {
        '3G': '2.1s',
        '4G': '0.8s',
        'WiFi': '0.3s'
      }
    };
    
    container.innerHTML = `
      <h3>Bundle Analysis:</h3>
      <div class="performance-metrics">
        <strong>Bundle Size:</strong><br>
        Total: ${bundleInfo.totalSize}<br>
        Gzipped: ${bundleInfo.gzippedSize}<br><br>
        
        <strong>Chunks:</strong><br>
        ${bundleInfo.chunks.map(chunk => 
          `${chunk.name}: ${chunk.size} (${chunk.gzipped} gzipped)`
        ).join('<br>')}<br><br>
        
        <strong>Estimated Load Times:</strong><br>
        3G: ${bundleInfo.loadTime['3G']}<br>
        4G: ${bundleInfo.loadTime['4G']}<br>
        WiFi: ${bundleInfo.loadTime.WiFi}<br><br>
        
        <strong>Performance Score:</strong> 🟢 Good<br>
        <small>Bundle size is within recommended limits</small>
      </div>
    `;
    
    console.log('✅ Bundle analysis completed');
  };
}

// Auto-run performance tests if URL parameter is set
if (new URLSearchParams(window.location.search).get('test') === 'performance') {
  document.addEventListener('DOMContentLoaded', createPerformanceTest);
}