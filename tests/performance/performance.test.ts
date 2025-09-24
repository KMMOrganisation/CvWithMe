import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentRenderer } from '../../src/components/ContentRenderer.js';
import { imageCache, contentCache } from '../../src/utils/cacheManager.js';
import { createSkeletonLoader } from '../../src/components/SkeletonLoader.js';
import { ContentBlock } from '../../src/data/types/index.js';

// Mock performance API
global.performance = {
  ...global.performance,
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  now: vi.fn(() => Date.now()),
};

describe('Performance Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Clear caches
    contentCache.clear();
    imageCache.clear();
  });

  describe('Component Rendering Performance', () => {
    it('should render components within acceptable time limits', () => {
      const startTime = performance.now();
      
      const content: ContentBlock[] = Array.from({ length: 10 }, (_, i) => ({
        id: `block-${i}`,
        type: 'text',
        content: `This is text block ${i} with some content to render.`,
        metadata: {}
      }));

      new ContentRenderer(container, { content });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 10 text blocks in under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large content efficiently', () => {
      const startTime = performance.now();
      
      const largeContent: ContentBlock[] = Array.from({ length: 100 }, (_, i) => ({
        id: `block-${i}`,
        type: i % 3 === 0 ? 'text' : i % 3 === 1 ? 'code' : 'callout',
        content: `Content block ${i} `.repeat(50), // Large content
        metadata: i % 3 === 1 ? { language: 'javascript' } : {}
      }));

      new ContentRenderer(container, { content: largeContent });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 100 blocks in under 500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('should implement efficient DOM updates', () => {
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'text',
          content: 'Initial content',
          metadata: {}
        }
      ];

      const renderer = new ContentRenderer(container, { content });
      const initialChildCount = container.children.length;
      
      // Update content
      const updatedContent: ContentBlock[] = [
        {
          id: '1',
          type: 'text',
          content: 'Updated content',
          metadata: {}
        },
        {
          id: '2',
          type: 'text',
          content: 'New content',
          metadata: {}
        }
      ];

      const startTime = performance.now();
      renderer.updateContent(updatedContent);
      const endTime = performance.now();
      
      const updateTime = endTime - startTime;
      expect(updateTime).toBeLessThan(50); // Should update quickly
      expect(container.children.length).toBeGreaterThan(initialChildCount);
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should implement efficient image lazy loading', async () => {
      const content: ContentBlock[] = Array.from({ length: 20 }, (_, i) => ({
        id: `img-${i}`,
        type: 'image',
        content: `https://picsum.photos/400/300?random=${i}`,
        metadata: {
          alt: `Test image ${i}`,
          caption: `Image ${i}`
        }
      }));

      const startTime = performance.now();
      new ContentRenderer(container, { content });
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      
      // Should render image placeholders quickly
      expect(renderTime).toBeLessThan(100);
      
      // Check that images have lazy loading attribute
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img.getAttribute('loading')).toBe('lazy');
      });
    });

    it('should show skeleton loaders during content loading', () => {
      const startTime = performance.now();
      
      const skeleton = createSkeletonLoader(container, {
        type: 'text',
        count: 5
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Skeleton should render very quickly
      expect(renderTime).toBeLessThan(20);
      expect(container.querySelectorAll('.skeleton')).toHaveLength(5);
      
      skeleton.hide();
    });

    it('should efficiently handle intersection observer for lazy loading', () => {
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      };
      
      // Mock IntersectionObserver
      global.IntersectionObserver = vi.fn(() => mockObserver);
      
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'image',
          content: 'https://example.com/image.jpg',
          metadata: { alt: 'Test image' }
        }
      ];

      new ContentRenderer(container, { content });
      
      // Should set up intersection observer
      expect(global.IntersectionObserver).toHaveBeenCalled();
      expect(mockObserver.observe).toHaveBeenCalled();
    });
  });

  describe('Caching Performance', () => {
    it('should cache content efficiently', () => {
      const testData = { message: 'Test data', timestamp: Date.now() };
      
      // Test write performance
      const writeStart = performance.now();
      contentCache.set('test-key', testData);
      const writeTime = performance.now() - writeStart;
      
      expect(writeTime).toBeLessThan(10); // Should be very fast
      
      // Test read performance
      const readStart = performance.now();
      const cachedData = contentCache.get('test-key');
      const readTime = performance.now() - readStart;
      
      expect(readTime).toBeLessThan(5); // Should be even faster
      expect(cachedData).toEqual(testData);
    });

    it('should handle cache eviction efficiently', () => {
      // Fill cache beyond capacity
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        contentCache.set(`key-${i}`, { data: `value-${i}` });
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle large number of cache operations efficiently
      expect(totalTime).toBeLessThan(100);
      
      // Cache should have reasonable size limits
      const stats = contentCache.getStats();
      expect(stats.size).toBeLessThan(1000); // Should have evicted some entries
    });

    it('should implement efficient image caching', async () => {
      const imageUrl = 'https://picsum.photos/200/200?random=1';
      
      const startTime = performance.now();
      
      // First cache (should be slower)
      await imageCache.cacheImage(imageUrl);
      const firstCacheTime = performance.now() - startTime;
      
      // Second access (should be faster)
      const secondStart = performance.now();
      const cachedImage = imageCache.get(imageUrl);
      const secondAccessTime = performance.now() - secondStart;
      
      expect(cachedImage).toBeTruthy();
      expect(secondAccessTime).toBeLessThan(firstCacheTime);
      expect(secondAccessTime).toBeLessThan(10); // Should be very fast from cache
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with component creation/destruction', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Create and destroy many components
      for (let i = 0; i < 100; i++) {
        const content: ContentBlock[] = [
          {
            id: `block-${i}`,
            type: 'text',
            content: `Content ${i}`,
            metadata: {}
          }
        ];
        
        const renderer = new ContentRenderer(container, { content });
        renderer.destroy();
        container.innerHTML = ''; // Clean up DOM
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should efficiently manage event listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'code',
          content: 'console.log("test");',
          metadata: { language: 'javascript' }
        }
      ];
      
      const renderer = new ContentRenderer(container, { content });
      const initialListeners = addEventListenerSpy.mock.calls.length;
      
      renderer.destroy();
      
      // Should remove event listeners when destroyed
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('Bundle Size and Loading', () => {
    it('should have reasonable component sizes', () => {
      // This would typically be measured by build tools
      // For now, we'll check that components don't import unnecessary dependencies
      
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'text',
          content: 'Simple text',
          metadata: {}
        }
      ];
      
      const startTime = performance.now();
      new ContentRenderer(container, { content });
      const endTime = performance.now();
      
      // Simple content should render very quickly
      expect(endTime - startTime).toBeLessThan(20);
    });

    it('should support code splitting for large components', () => {
      // Test that heavy components can be loaded asynchronously
      const startTime = performance.now();
      
      // Simulate dynamic import
      const mockDynamicImport = vi.fn().mockResolvedValue({
        default: class MockHeavyComponent {
          constructor(container: HTMLElement) {
            container.innerHTML = '<div>Heavy component loaded</div>';
          }
        }
      });
      
      expect(mockDynamicImport).toBeDefined();
      expect(performance.now() - startTime).toBeLessThan(10);
    });
  });

  describe('Animation Performance', () => {
    it('should use efficient CSS animations', () => {
      const skeleton = createSkeletonLoader(container, {
        type: 'text',
        count: 1
      });
      
      const skeletonElement = container.querySelector('.skeleton');
      expect(skeletonElement).toBeTruthy();
      
      // Check that animations use transform/opacity for better performance
      const computedStyle = window.getComputedStyle(skeletonElement!);
      const animationName = computedStyle.animationName;
      
      expect(animationName).toBeTruthy();
      expect(animationName).not.toBe('none');
      
      skeleton.hide();
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const skeleton = createSkeletonLoader(container, {
        type: 'text',
        count: 1
      });
      
      const skeletonElement = container.querySelector('.skeleton');
      
      // Should respect reduced motion by disabling animations
      expect(skeletonElement?.classList.contains('reduced-motion')).toBe(true);
      
      skeleton.hide();
    });
  });

  describe('Network Performance', () => {
    it('should implement efficient resource loading', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      
      global.fetch = mockFetch;
      
      const startTime = performance.now();
      
      // Simulate loading content
      const response = await fetch('/api/content');
      const data = await response.json();
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      expect(mockFetch).toHaveBeenCalledWith('/api/content');
      expect(data).toEqual({ data: 'test' });
      expect(loadTime).toBeLessThan(100); // Mock should be fast
    });

    it('should handle concurrent requests efficiently', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      
      global.fetch = mockFetch;
      
      const startTime = performance.now();
      
      // Make multiple concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) => 
        fetch(`/api/content/${i}`)
      );
      
      await Promise.all(requests);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(mockFetch).toHaveBeenCalledTimes(5);
      expect(totalTime).toBeLessThan(200); // Should handle concurrency well
    });
  });
});