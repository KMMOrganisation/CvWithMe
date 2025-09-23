/**
 * Simple Router with Error Handling
 * 
 * Handles client-side routing with 404 error pages and fallback navigation
 */

import { navigationState, NavigationState } from './navigationState.js';
import { createNotFoundPage } from '../pages/NotFoundPage.js';
import { getAllModules, getModuleBySlug, getLessonBySlug } from '../data/index.js';
import { createErrorBoundary } from './errorBoundary.js';

export interface Route {
  path: string;
  component: (container: HTMLElement, params: RouteParams) => void;
  title?: string;
  requiresData?: boolean;
}

export interface RouteParams {
  [key: string]: string;
}

export interface RouterOptions {
  container: HTMLElement;
  routes: Route[];
  notFoundComponent?: (container: HTMLElement, path: string) => void;
  onRouteChange?: (route: Route, params: RouteParams) => void;
  onError?: (error: Error, path: string) => void;
}

export class Router {
  private container: HTMLElement;
  private routes: Route[];
  private currentRoute?: Route;
  private currentParams: RouteParams = {};
  private notFoundComponent: (container: HTMLElement, path: string) => void;
  private onRouteChange?: (route: Route, params: RouteParams) => void;
  private onError?: (error: Error, path: string) => void;
  private isInitialized = false;

  constructor(options: RouterOptions) {
    this.container = options.container;
    this.routes = options.routes;
    this.notFoundComponent = options.notFoundComponent || this.defaultNotFoundComponent;
    this.onRouteChange = options.onRouteChange;
    this.onError = options.onError;

    this.setupErrorBoundary();
    this.setupNavigationListener();
  }

  /**
   * Initialize the router
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.handleCurrentRoute();
  }

  /**
   * Setup error boundary for the router container
   */
  private setupErrorBoundary(): void {
    createErrorBoundary(this.container, {
      onError: (errorInfo) => {
        console.error('Router error:', errorInfo);
        if (this.onError) {
          this.onError(errorInfo.error, window.location.pathname);
        }
      },
      fallbackContent: `
        <div class="router-error">
          <h2>Navigation Error</h2>
          <p>There was an error loading this page.</p>
          <button onclick="window.location.href = '/'">Return to Homepage</button>
        </div>
      `
    });
  }

  /**
   * Setup navigation state listener
   */
  private setupNavigationListener(): void {
    navigationState.subscribe((event) => {
      if (this.isInitialized) {
        this.handleStateChange(event.state);
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      if (this.isInitialized) {
        this.handleCurrentRoute();
      }
    });
  }

  /**
   * Handle current route based on URL
   */
  private handleCurrentRoute(): void {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    try {
      // Try to match path-based routes first
      const pathRoute = this.matchRoute(path);
      if (pathRoute) {
        this.loadRoute(pathRoute.route, pathRoute.params);
        return;
      }

      // Try query parameter routes as fallback
      const moduleSlug = searchParams.get('module');
      const lessonSlug = searchParams.get('lesson');
      
      if (lessonSlug && moduleSlug) {
        this.loadLessonFromQuery(moduleSlug, lessonSlug);
      } else if (moduleSlug) {
        this.loadModuleFromQuery(moduleSlug);
      } else if (path === '/' || path === '') {
        this.loadHomeRoute();
      } else {
        this.show404(path);
      }
    } catch (error) {
      console.error('Error handling route:', error);
      if (this.onError) {
        this.onError(error as Error, path);
      }
      this.show404(path);
    }
  }

  /**
   * Handle navigation state changes
   */
  private handleStateChange(state: NavigationState): void {
    try {
      switch (state.page) {
        case 'home':
          this.loadHomeRoute();
          break;
        case 'module':
          if (state.moduleSlug) {
            this.loadModuleRoute(state.moduleSlug);
          } else {
            this.show404('/module');
          }
          break;
        case 'lesson':
          if (state.moduleSlug && state.lessonSlug) {
            this.loadLessonRoute(state.moduleSlug, state.lessonSlug);
          } else {
            this.show404('/lesson');
          }
          break;
        default:
          this.show404(window.location.pathname);
      }
    } catch (error) {
      console.error('Error handling state change:', error);
      if (this.onError) {
        this.onError(error as Error, window.location.pathname);
      }
      this.show404(window.location.pathname);
    }
  }

  /**
   * Match route pattern to current path
   */
  private matchRoute(path: string): { route: Route; params: RouteParams } | null {
    for (const route of this.routes) {
      const params = this.extractParams(route.path, path);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  /**
   * Extract parameters from route path
   */
  private extractParams(pattern: string, path: string): RouteParams | null {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: RouteParams = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // Parameter
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Literal doesn't match
        return null;
      }
    }

    return params;
  }

  /**
   * Load a specific route
   */
  private async loadRoute(route: Route, params: RouteParams): Promise<void> {
    try {
      // Check if route requires data to be loaded
      if (route.requiresData) {
        const dataAvailable = await this.checkDataAvailability(params);
        if (!dataAvailable) {
          this.show404(window.location.pathname);
          return;
        }
      }

      // Update document title
      if (route.title) {
        document.title = route.title;
      }

      // Load the route component
      this.currentRoute = route;
      this.currentParams = params;
      
      route.component(this.container, params);

      // Notify route change
      if (this.onRouteChange) {
        this.onRouteChange(route, params);
      }

    } catch (error) {
      console.error('Error loading route:', error);
      if (this.onError) {
        this.onError(error as Error, window.location.pathname);
      }
      this.show404(window.location.pathname);
    }
  }

  /**
   * Check if required data is available for the route
   */
  private async checkDataAvailability(params: RouteParams): Promise<boolean> {
    try {
      if (params.moduleSlug) {
        const module = getModuleBySlug(params.moduleSlug);
        if (!module) return false;

        if (params.lessonSlug) {
          const lesson = getLessonBySlug(module.id, params.lessonSlug);
          return !!lesson;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking data availability:', error);
      return false;
    }
  }

  /**
   * Load home route
   */
  private loadHomeRoute(): void {
    const homeRoute = this.routes.find(r => r.path === '/');
    if (homeRoute) {
      this.loadRoute(homeRoute, {});
    } else {
      // Fallback home component
      this.container.innerHTML = `
        <div class="home-fallback">
          <h1>CV Tutorial Website</h1>
          <p>Welcome to the CV Tutorial Website</p>
          <div class="modules-list">
            ${getAllModules().map(module => `
              <div class="module-item">
                <h3><a href="/module/${module.slug}">${module.title}</a></h3>
                <p>${module.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  /**
   * Load module route
   */
  private loadModuleRoute(moduleSlug: string): void {
    const module = getModuleBySlug(moduleSlug);
    if (!module) {
      this.showModuleNotFound(moduleSlug);
      return;
    }

    const moduleRoute = this.routes.find(r => r.path === '/module/:moduleSlug');
    if (moduleRoute) {
      this.loadRoute(moduleRoute, { moduleSlug });
    } else {
      this.showModuleNotFound(moduleSlug);
    }
  }

  /**
   * Load lesson route
   */
  private loadLessonRoute(moduleSlug: string, lessonSlug: string): void {
    const module = getModuleBySlug(moduleSlug);
    if (!module) {
      this.showModuleNotFound(moduleSlug);
      return;
    }

    const lesson = getLessonBySlug(module.id, lessonSlug);
    if (!lesson) {
      this.showLessonNotFound(moduleSlug, lessonSlug);
      return;
    }

    const lessonRoute = this.routes.find(r => r.path === '/module/:moduleSlug/lesson/:lessonSlug');
    if (lessonRoute) {
      this.loadRoute(lessonRoute, { moduleSlug, lessonSlug });
    } else {
      this.showLessonNotFound(moduleSlug, lessonSlug);
    }
  }

  /**
   * Load module from query parameters
   */
  private loadModuleFromQuery(moduleSlug: string): void {
    const module = getModuleBySlug(moduleSlug);
    if (module) {
      navigationState.navigateToModule(moduleSlug, module.id, false);
    } else {
      this.showModuleNotFound(moduleSlug);
    }
  }

  /**
   * Load lesson from query parameters
   */
  private loadLessonFromQuery(moduleSlug: string, lessonSlug: string): void {
    const module = getModuleBySlug(moduleSlug);
    if (!module) {
      this.showModuleNotFound(moduleSlug);
      return;
    }

    const lesson = getLessonBySlug(module.id, lessonSlug);
    if (lesson) {
      navigationState.navigateToLesson(moduleSlug, lessonSlug, module.id, lesson.id, false);
    } else {
      this.showLessonNotFound(moduleSlug, lessonSlug);
    }
  }

  /**
   * Show 404 page
   */
  private show404(path: string): void {
    try {
      this.notFoundComponent(this.container, path);
      document.title = '404 - Page Not Found';
    } catch (error) {
      console.error('Error showing 404 page:', error);
      this.container.innerHTML = `
        <div class="error-fallback">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/">Return to Homepage</a>
        </div>
      `;
    }
  }

  /**
   * Show module not found page
   */
  private showModuleNotFound(moduleSlug: string): void {
    createNotFoundPage(this.container, 'module', `/module/${moduleSlug}`);
    document.title = 'Module Not Found';
  }

  /**
   * Show lesson not found page
   */
  private showLessonNotFound(moduleSlug: string, lessonSlug: string): void {
    createNotFoundPage(this.container, 'lesson', `/module/${moduleSlug}/lesson/${lessonSlug}`);
    document.title = 'Lesson Not Found';
  }

  /**
   * Default 404 component
   */
  private defaultNotFoundComponent(container: HTMLElement, path: string): void {
    createNotFoundPage(container, 'page', path);
  }

  /**
   * Navigate to a specific path
   */
  public navigate(path: string): void {
    window.history.pushState(null, '', path);
    this.handleCurrentRoute();
  }

  /**
   * Get current route information
   */
  public getCurrentRoute(): { route?: Route; params: RouteParams } {
    return {
      route: this.currentRoute,
      params: { ...this.currentParams }
    };
  }

  /**
   * Add a new route
   */
  public addRoute(route: Route): void {
    this.routes.push(route);
  }

  /**
   * Remove a route
   */
  public removeRoute(path: string): void {
    this.routes = this.routes.filter(route => route.path !== path);
  }
}

/**
 * Create a simple router instance
 */
export function createRouter(options: RouterOptions): Router {
  return new Router(options);
}