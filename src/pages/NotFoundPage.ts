/**
 * 404 Not Found Page Component
 * 
 * Displays a helpful 404 page with navigation options when users
 * encounter missing content or invalid URLs
 */

import { getAllModules } from '../data/index.js';
import { navigationState } from '../utils/navigationState.js';
import { createErrorBoundary } from '../utils/errorBoundary.js';

export interface NotFoundPageOptions {
  type?: 'page' | 'module' | 'lesson' | 'content';
  requestedPath?: string;
  suggestedModules?: any[];
  onNavigate?: (path: string) => void;
}

export class NotFoundPage {
  private container: HTMLElement;
  private options: NotFoundPageOptions;

  constructor(container: HTMLElement, options: NotFoundPageOptions = {}) {
    this.container = container;
    this.options = {
      type: 'page',
      ...options
    };

    this.render();
    this.setupEventListeners();
    this.setupErrorBoundary();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="not-found-page">
        <div class="not-found-content">
          ${this.renderHeader()}
          ${this.renderMessage()}
          ${this.renderSuggestions()}
          ${this.renderNavigation()}
        </div>
      </div>
    `;
  }

  private renderHeader(): string {
    const { type } = this.options;
    
    const icons = {
      page: '📄',
      module: '📚',
      lesson: '📖',
      content: '🔍'
    };

    const titles = {
      page: 'Page Not Found',
      module: 'Module Not Found',
      lesson: 'Lesson Not Found',
      content: 'Content Not Available'
    };

    return `
      <div class="not-found-header">
        <div class="not-found-icon">${icons[type || 'page']}</div>
        <h1 class="not-found-title">${titles[type || 'page']}</h1>
        <div class="not-found-code">404</div>
      </div>
    `;
  }

  private renderMessage(): string {
    const { type, requestedPath } = this.options;
    
    const messages = {
      page: 'The page you\'re looking for doesn\'t exist or has been moved.',
      module: 'The module you\'re trying to access is not available.',
      lesson: 'This lesson could not be found or is not yet available.',
      content: 'The requested content is currently unavailable.'
    };

    const suggestions = {
      page: 'Check the URL for typos or use the navigation below to find what you\'re looking for.',
      module: 'Browse our available modules below or return to the homepage.',
      lesson: 'Try accessing the lesson from its parent module or check if it\'s been moved.',
      content: 'The content may be temporarily unavailable. Try refreshing the page or check back later.'
    };

    return `
      <div class="not-found-message">
        <p class="primary-message">${messages[type || 'page']}</p>
        <p class="suggestion-message">${suggestions[type || 'page']}</p>
        ${requestedPath ? `<p class="requested-path">Requested: <code>${requestedPath}</code></p>` : ''}
      </div>
    `;
  }

  private renderSuggestions(): string {
    const modules = this.options.suggestedModules || getAllModules().slice(0, 3);
    
    if (!modules.length) {
      return '';
    }

    return `
      <div class="not-found-suggestions">
        <h2>Popular Modules</h2>
        <div class="suggestion-grid">
          ${modules.map(module => `
            <div class="suggestion-card" data-module-slug="${module.slug}">
              <h3>${module.title}</h3>
              <p>${module.description}</p>
              <div class="suggestion-meta">
                <span class="lesson-count">${module.lessons?.length || 0} lessons</span>
                <span class="complexity">${module.complexity}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderNavigation(): string {
    return `
      <div class="not-found-navigation">
        <div class="nav-buttons">
          <button class="nav-btn primary" data-action="home">
            <span class="btn-icon">🏠</span>
            Go to Homepage
          </button>
          <button class="nav-btn secondary" data-action="back">
            <span class="btn-icon">←</span>
            Go Back
          </button>
          <button class="nav-btn secondary" data-action="modules">
            <span class="btn-icon">📚</span>
            Browse Modules
          </button>
        </div>
        
        <div class="help-section">
          <h3>Need Help?</h3>
          <ul class="help-links">
            <li><a href="/" data-action="home">Return to Homepage</a></li>
            <li><a href="/?help=navigation" data-action="help">Navigation Guide</a></li>
            <li><a href="/?help=search" data-action="search">Search Content</a></li>
          </ul>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Navigation button handlers
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('[data-action]') as HTMLElement;
      
      if (!button) return;
      
      event.preventDefault();
      const action = button.getAttribute('data-action');
      
      switch (action) {
        case 'home':
          this.navigateToHome();
          break;
        case 'back':
          this.goBack();
          break;
        case 'modules':
          this.navigateToModules();
          break;
        case 'help':
          this.showHelp(button.getAttribute('href'));
          break;
        case 'search':
          this.showSearch();
          break;
      }
    });

    // Module suggestion handlers
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const card = target.closest('.suggestion-card') as HTMLElement;
      
      if (!card) return;
      
      const moduleSlug = card.getAttribute('data-module-slug');
      if (moduleSlug) {
        this.navigateToModule(moduleSlug);
      }
    });

    // Keyboard navigation
    this.container.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.goBack();
      }
    });
  }

  private setupErrorBoundary(): void {
    createErrorBoundary(this.container, {
      onError: (errorInfo) => {
        console.error('NotFoundPage error:', errorInfo);
      },
      fallbackContent: `
        <div class="error-fallback">
          <h2>Unable to display 404 page</h2>
          <p>There was an error displaying the not found page.</p>
          <button onclick="window.location.href = '/'">Return to Homepage</button>
        </div>
      `
    });
  }

  private navigateToHome(): void {
    if (this.options.onNavigate) {
      this.options.onNavigate('/');
    } else {
      navigationState.navigateToHome();
      window.location.href = '/';
    }
  }

  private navigateToModule(moduleSlug: string): void {
    if (this.options.onNavigate) {
      this.options.onNavigate(`/module/${moduleSlug}`);
    } else {
      navigationState.navigateToModule(moduleSlug);
      window.location.href = `/module/${moduleSlug}`;
    }
  }

  private navigateToModules(): void {
    // Scroll to modules section on homepage
    if (this.options.onNavigate) {
      this.options.onNavigate('/#modules');
    } else {
      navigationState.navigateToHome();
      window.location.href = '/#modules';
    }
  }

  private goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigateToHome();
    }
  }

  private showHelp(href: string | null): void {
    if (href) {
      window.location.href = href;
    }
  }

  private showSearch(): void {
    // Trigger search functionality if available
    const searchEvent = new CustomEvent('showSearch', {
      detail: { source: 'not-found-page' }
    });
    document.dispatchEvent(searchEvent);
  }

  /**
   * Update the page with new options
   */
  public update(options: Partial<NotFoundPageOptions>): void {
    this.options = { ...this.options, ...options };
    this.render();
  }

  /**
   * Destroy the component and clean up
   */
  public destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Factory function to create different types of 404 pages
 */
export function createNotFoundPage(
  container: HTMLElement,
  type: NotFoundPageOptions['type'] = 'page',
  requestedPath?: string
): NotFoundPage {
  const modules = getAllModules();
  
  return new NotFoundPage(container, {
    type,
    requestedPath,
    suggestedModules: modules.slice(0, 3)
  });
}

/**
 * Show a 404 page for missing modules
 */
export function showModuleNotFound(
  container: HTMLElement,
  moduleSlug: string
): NotFoundPage {
  return createNotFoundPage(container, 'module', `/module/${moduleSlug}`);
}

/**
 * Show a 404 page for missing lessons
 */
export function showLessonNotFound(
  container: HTMLElement,
  moduleSlug: string,
  lessonSlug: string
): NotFoundPage {
  return createNotFoundPage(container, 'lesson', `/module/${moduleSlug}/lesson/${lessonSlug}`);
}

/**
 * Show a 404 page for missing content
 */
export function showContentNotFound(
  container: HTMLElement,
  contentPath: string
): NotFoundPage {
  return createNotFoundPage(container, 'content', contentPath);
}