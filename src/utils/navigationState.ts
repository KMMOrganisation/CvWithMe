/**
 * Navigation State Management
 * 
 * Manages URL-based navigation state and browser history
 * without requiring user accounts or server-side state
 */

export interface NavigationState {
  page: 'home' | 'module' | 'lesson';
  moduleSlug?: string;
  lessonSlug?: string;
  moduleId?: number;
  lessonId?: number;
}

export interface StateChangeEvent {
  state: NavigationState;
  url: string;
  isPopState: boolean;
}

export class NavigationStateManager {
  private currentState: NavigationState;
  private listeners: Set<(event: StateChangeEvent) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.currentState = this.parseCurrentURL();
    this.setupPopStateListener();
  }

  /**
   * Initialize the navigation state manager
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.updateStateFromURL();
  }

  /**
   * Parse the current URL to determine navigation state
   */
  private parseCurrentURL(): NavigationState {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Handle different URL patterns:
    // / -> home
    // /module/[slug] -> module page
    // /module/[slug]/lesson/[lesson-slug] -> lesson page
    // ?module=[slug] -> module page (query param fallback)
    // ?module=[slug]&lesson=[lesson-slug] -> lesson page (query param fallback)
    
    if (path === '/' || path === '') {
      // Check for query parameters
      const moduleSlug = searchParams.get('module');
      const lessonSlug = searchParams.get('lesson');
      
      if (moduleSlug && lessonSlug) {
        return {
          page: 'lesson',
          moduleSlug,
          lessonSlug
        };
      } else if (moduleSlug) {
        return {
          page: 'module',
          moduleSlug
        };
      }
      
      return { page: 'home' };
    }
    
    // Parse path-based routing
    const pathParts = path.split('/').filter(part => part.length > 0);
    
    if (pathParts.length >= 2 && pathParts[0] === 'module') {
      const moduleSlug = pathParts[1];
      
      if (pathParts.length >= 4 && pathParts[2] === 'lesson') {
        const lessonSlug = pathParts[3];
        return {
          page: 'lesson',
          moduleSlug,
          lessonSlug
        };
      }
      
      return {
        page: 'module',
        moduleSlug
      };
    }
    
    // Default to home for unrecognized paths
    return { page: 'home' };
  }

  /**
   * Setup popstate listener for browser back/forward navigation
   */
  private setupPopStateListener(): void {
    window.addEventListener('popstate', (event) => {
      const newState = this.parseCurrentURL();
      const oldState = this.currentState;
      this.currentState = newState;
      
      // Add IDs if available in the popstate event
      if (event.state) {
        this.currentState.moduleId = event.state.moduleId;
        this.currentState.lessonId = event.state.lessonId;
      }
      
      this.notifyListeners({
        state: this.currentState,
        url: window.location.href,
        isPopState: true
      });
      
      console.log('Navigation state changed (popstate):', {
        from: oldState,
        to: this.currentState
      });
    });
  }

  /**
   * Navigate to home page
   */
  public navigateToHome(pushState = true): void {
    const newState: NavigationState = { page: 'home' };
    const url = '/';
    
    this.updateState(newState, url, pushState);
  }

  /**
   * Navigate to module page
   */
  public navigateToModule(moduleSlug: string, moduleId?: number, pushState = true): void {
    const newState: NavigationState = {
      page: 'module',
      moduleSlug,
      moduleId
    };
    const url = `/module/${moduleSlug}`;
    
    this.updateState(newState, url, pushState);
  }

  /**
   * Navigate to lesson page
   */
  public navigateToLesson(
    moduleSlug: string, 
    lessonSlug: string, 
    moduleId?: number, 
    lessonId?: number, 
    pushState = true
  ): void {
    const newState: NavigationState = {
      page: 'lesson',
      moduleSlug,
      lessonSlug,
      moduleId,
      lessonId
    };
    const url = `/module/${moduleSlug}/lesson/${lessonSlug}`;
    
    this.updateState(newState, url, pushState);
  }

  /**
   * Navigate using query parameters (fallback for simple routing)
   */
  public navigateWithQuery(moduleSlug?: string, lessonSlug?: string, pushState = true): void {
    const params = new URLSearchParams();
    
    if (moduleSlug) {
      params.set('module', moduleSlug);
    }
    
    if (lessonSlug) {
      params.set('lesson', lessonSlug);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/?${queryString}` : '/';
    
    const newState: NavigationState = {
      page: lessonSlug ? 'lesson' : moduleSlug ? 'module' : 'home',
      moduleSlug,
      lessonSlug
    };
    
    this.updateState(newState, url, pushState);
  }

  /**
   * Update the current state and URL
   */
  private updateState(newState: NavigationState, url: string, pushState: boolean): void {
    const oldState = this.currentState;
    this.currentState = newState;
    
    if (pushState) {
      // Create state object for popstate
      const stateObj = {
        moduleId: newState.moduleId,
        lessonId: newState.lessonId,
        timestamp: Date.now()
      };
      
      window.history.pushState(stateObj, '', url);
    } else {
      window.history.replaceState(null, '', url);
    }
    
    this.notifyListeners({
      state: this.currentState,
      url,
      isPopState: false
    });
    
    console.log('Navigation state updated:', {
      from: oldState,
      to: this.currentState,
      url,
      pushState
    });
  }

  /**
   * Update state from current URL without changing history
   */
  private updateStateFromURL(): void {
    const newState = this.parseCurrentURL();
    const oldState = this.currentState;
    this.currentState = newState;
    
    this.notifyListeners({
      state: this.currentState,
      url: window.location.href,
      isPopState: false
    });
    
    console.log('Navigation state initialized:', {
      from: oldState,
      to: this.currentState
    });
  }

  /**
   * Get current navigation state
   */
  public getCurrentState(): NavigationState {
    return { ...this.currentState };
  }

  /**
   * Check if currently on a specific page type
   */
  public isOnPage(page: NavigationState['page']): boolean {
    return this.currentState.page === page;
  }

  /**
   * Get current URL
   */
  public getCurrentURL(): string {
    return window.location.href;
  }

  /**
   * Generate URL for a given state
   */
  public generateURL(state: Partial<NavigationState>): string {
    if (state.page === 'lesson' && state.moduleSlug && state.lessonSlug) {
      return `/module/${state.moduleSlug}/lesson/${state.lessonSlug}`;
    } else if (state.page === 'module' && state.moduleSlug) {
      return `/module/${state.moduleSlug}`;
    } else {
      return '/';
    }
  }

  /**
   * Generate shareable URL with current state
   */
  public getShareableURL(): string {
    return this.generateURL(this.currentState);
  }

  /**
   * Navigate back in history
   */
  public goBack(): void {
    window.history.back();
  }

  /**
   * Navigate forward in history
   */
  public goForward(): void {
    window.history.forward();
  }

  /**
   * Replace current state without adding to history
   */
  public replaceState(moduleSlug?: string, lessonSlug?: string): void {
    if (lessonSlug && moduleSlug) {
      this.navigateToLesson(moduleSlug, lessonSlug, undefined, undefined, false);
    } else if (moduleSlug) {
      this.navigateToModule(moduleSlug, undefined, false);
    } else {
      this.navigateToHome(false);
    }
  }

  /**
   * Subscribe to navigation state changes
   */
  public subscribe(listener: (event: StateChangeEvent) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(event: StateChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Error in navigation listener:', error);
      }
    });
  }

  /**
   * Set module and lesson IDs for current state (when resolved from slugs)
   */
  public setCurrentIds(moduleId?: number, lessonId?: number): void {
    if (this.currentState.moduleId !== moduleId || this.currentState.lessonId !== lessonId) {
      this.currentState.moduleId = moduleId;
      this.currentState.lessonId = lessonId;
      
      // Update history state with IDs
      const stateObj = {
        moduleId,
        lessonId,
        timestamp: Date.now()
      };
      
      window.history.replaceState(stateObj, '', window.location.href);
    }
  }

  /**
   * Check if browser supports history API
   */
  public static isHistorySupported(): boolean {
    return !!(window.history && window.history.pushState);
  }
}

// Create a singleton instance
export const navigationState = new NavigationStateManager();