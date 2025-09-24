import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '../../src/utils/router.js';
import { Setup, Mocks } from './test-helpers.js';

// Mock window.location and history
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  href: 'http://localhost:3000/',
};

const mockHistory = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  state: null
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true,
});

describe('Router', () => {
  let container: HTMLElement;
  let router: Router;

  beforeEach(() => {
    container = Setup.setupDOM();
    Setup.setupMocks();
    
    // Reset mocks
    vi.clearAllMocks();
    mockLocation.pathname = '/';
    mockLocation.search = '';
    mockLocation.hash = '';
    
    router = new Router(container);
  });

  afterEach(() => {
    Setup.teardownDOM(container);
  });

  describe('Route Registration', () => {
    it('should register routes correctly', () => {
      const handler = vi.fn();
      router.addRoute('/test', handler);
      
      // Navigate to the route
      router.navigate('/test');
      
      expect(handler).toHaveBeenCalled();
    });

    it('should handle parameterized routes', () => {
      const handler = vi.fn();
      router.addRoute('/module/:id', handler);
      
      router.navigate('/module/123');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: '123' }
        })
      );
    });

    it('should handle multiple parameters', () => {
      const handler = vi.fn();
      router.addRoute('/module/:moduleId/lesson/:lessonId', handler);
      
      router.navigate('/module/1/lesson/2');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { moduleId: '1', lessonId: '2' }
        })
      );
    });

    it('should handle query parameters', () => {
      const handler = vi.fn();
      router.addRoute('/search', handler);
      
      router.navigate('/search?q=test&filter=beginner');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { q: 'test', filter: 'beginner' }
        })
      );
    });
  });

  describe('Navigation', () => {
    it('should navigate to routes programmatically', () => {
      const handler = vi.fn();
      router.addRoute('/test', handler);
      
      router.navigate('/test');
      
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        null,
        '',
        '/test'
      );
      expect(handler).toHaveBeenCalled();
    });

    it('should replace current route when specified', () => {
      const handler = vi.fn();
      router.addRoute('/test', handler);
      
      router.navigate('/test', { replace: true });
      
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        null,
        '',
        '/test'
      );
    });

    it('should handle navigation with state', () => {
      const handler = vi.fn();
      const state = { data: 'test' };
      router.addRoute('/test', handler);
      
      router.navigate('/test', { state });
      
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        state,
        '',
        '/test'
      );
    });

    it('should handle browser back/forward navigation', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      router.addRoute('/page1', handler1);
      router.addRoute('/page2', handler2);
      
      // Navigate to page1, then page2
      router.navigate('/page1');
      router.navigate('/page2');
      
      // Simulate browser back button
      mockLocation.pathname = '/page1';
      const popStateEvent = new PopStateEvent('popstate', { state: null });
      window.dispatchEvent(popStateEvent);
      
      expect(handler1).toHaveBeenCalledTimes(2); // Initial + back navigation
    });
  });

  describe('Route Matching', () => {
    it('should match exact routes', () => {
      const handler = vi.fn();
      router.addRoute('/exact-match', handler);
      
      router.navigate('/exact-match');
      expect(handler).toHaveBeenCalled();
      
      handler.mockClear();
      router.navigate('/exact-match-not');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should match wildcard routes', () => {
      const handler = vi.fn();
      router.addRoute('/api/*', handler);
      
      router.navigate('/api/users');
      expect(handler).toHaveBeenCalled();
      
      handler.mockClear();
      router.navigate('/api/users/123');
      expect(handler).toHaveBeenCalled();
    });

    it('should prioritize exact matches over parameterized routes', () => {
      const exactHandler = vi.fn();
      const paramHandler = vi.fn();
      
      router.addRoute('/module/new', exactHandler);
      router.addRoute('/module/:id', paramHandler);
      
      router.navigate('/module/new');
      
      expect(exactHandler).toHaveBeenCalled();
      expect(paramHandler).not.toHaveBeenCalled();
    });

    it('should handle 404 routes', () => {
      const notFoundHandler = vi.fn();
      router.addRoute('*', notFoundHandler);
      
      router.navigate('/non-existent-route');
      
      expect(notFoundHandler).toHaveBeenCalled();
    });
  });

  describe('Route Guards', () => {
    it('should support before navigation guards', () => {
      const guard = vi.fn().mockReturnValue(true);
      const handler = vi.fn();
      
      router.addRoute('/protected', handler, { beforeEnter: guard });
      
      router.navigate('/protected');
      
      expect(guard).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });

    it('should prevent navigation when guard returns false', () => {
      const guard = vi.fn().mockReturnValue(false);
      const handler = vi.fn();
      
      router.addRoute('/protected', handler, { beforeEnter: guard });
      
      router.navigate('/protected');
      
      expect(guard).toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should support async guards', async () => {
      const guard = vi.fn().mockResolvedValue(true);
      const handler = vi.fn();
      
      router.addRoute('/async-protected', handler, { beforeEnter: guard });
      
      await router.navigate('/async-protected');
      
      expect(guard).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Route Parameters and Query Parsing', () => {
    it('should parse route parameters correctly', () => {
      const handler = vi.fn();
      router.addRoute('/user/:userId/post/:postId', handler);
      
      router.navigate('/user/123/post/456');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { userId: '123', postId: '456' }
        })
      );
    });

    it('should parse query parameters correctly', () => {
      const handler = vi.fn();
      router.addRoute('/search', handler);
      
      router.navigate('/search?q=javascript&category=tutorial&page=2');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { 
            q: 'javascript', 
            category: 'tutorial', 
            page: '2' 
          }
        })
      );
    });

    it('should handle encoded query parameters', () => {
      const handler = vi.fn();
      router.addRoute('/search', handler);
      
      router.navigate('/search?q=hello%20world&special=%26%3D%3F');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { 
            q: 'hello world', 
            special: '&=?' 
          }
        })
      );
    });

    it('should handle hash fragments', () => {
      const handler = vi.fn();
      router.addRoute('/page', handler);
      
      router.navigate('/page#section-1');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          hash: 'section-1'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle route handler errors gracefully', () => {
      const errorHandler = vi.fn();
      const faultyHandler = vi.fn().mockImplementation(() => {
        throw new Error('Route handler error');
      });
      
      router.onError(errorHandler);
      router.addRoute('/error-route', faultyHandler);
      
      router.navigate('/error-route');
      
      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ path: '/error-route' })
      );
    });

    it('should handle async route handler errors', async () => {
      const errorHandler = vi.fn();
      const faultyHandler = vi.fn().mockRejectedValue(new Error('Async error'));
      
      router.onError(errorHandler);
      router.addRoute('/async-error', faultyHandler);
      
      await router.navigate('/async-error');
      
      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ path: '/async-error' })
      );
    });
  });

  describe('Route Transitions', () => {
    it('should support route transition hooks', () => {
      const beforeLeave = vi.fn();
      const afterEnter = vi.fn();
      
      router.addRoute('/from', vi.fn(), { beforeLeave });
      router.addRoute('/to', vi.fn(), { afterEnter });
      
      router.navigate('/from');
      router.navigate('/to');
      
      expect(beforeLeave).toHaveBeenCalled();
      expect(afterEnter).toHaveBeenCalled();
    });

    it('should pass route context to transition hooks', () => {
      const beforeLeave = vi.fn();
      
      router.addRoute('/user/:id', vi.fn(), { beforeLeave });
      
      router.navigate('/user/123');
      router.navigate('/');
      
      expect(beforeLeave).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: '123' }
        })
      );
    });
  });

  describe('Base Path Support', () => {
    it('should handle base path configuration', () => {
      const routerWithBase = new Router(container, { basePath: '/app' });
      const handler = vi.fn();
      
      routerWithBase.addRoute('/test', handler);
      routerWithBase.navigate('/test');
      
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        null,
        '',
        '/app/test'
      );
    });
  });

  describe('Route Metadata', () => {
    it('should support route metadata', () => {
      const handler = vi.fn();
      const metadata = { title: 'Test Page', requiresAuth: true };
      
      router.addRoute('/test', handler, { meta: metadata });
      
      router.navigate('/test');
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: metadata
        })
      );
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of routes efficiently', () => {
      const handlers = Array.from({ length: 1000 }, () => vi.fn());
      
      // Register 1000 routes
      const startTime = performance.now();
      handlers.forEach((handler, i) => {
        router.addRoute(`/route-${i}`, handler);
      });
      const registrationTime = performance.now() - startTime;
      
      // Should register routes quickly
      expect(registrationTime).toBeLessThan(100);
      
      // Navigate to a route
      const navigationStart = performance.now();
      router.navigate('/route-500');
      const navigationTime = performance.now() - navigationStart;
      
      // Should navigate quickly even with many routes
      expect(navigationTime).toBeLessThan(50);
      expect(handlers[500]).toHaveBeenCalled();
    });
  });
});