/**
 * Accessibility Utilities
 * 
 * Provides utilities for managing focus, keyboard navigation, ARIA announcements,
 * and other accessibility features.
 */

export interface FocusableElement extends HTMLElement {
  focus(): void;
}

export interface AriaLiveRegion {
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  clear(): void;
}

/**
 * Focus Management Utilities
 */
export class FocusManager {
  private static focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): FocusableElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableSelectors)
    ) as FocusableElement[];
  }

  /**
   * Get the first focusable element in a container
   */
  static getFirstFocusable(container: HTMLElement): FocusableElement | null {
    const focusable = this.getFocusableElements(container);
    return focusable.length > 0 ? focusable[0] : null;
  }

  /**
   * Get the last focusable element in a container
   */
  static getLastFocusable(container: HTMLElement): FocusableElement | null {
    const focusable = this.getFocusableElements(container);
    return focusable.length > 0 ? focusable[focusable.length - 1] : null;
  }

  /**
   * Trap focus within a container (for modals, dropdowns, etc.)
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusable = this.getFocusableElements(container);
    if (focusable.length === 0) return () => {};

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    // Focus the first element initially
    firstFocusable.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Save and restore focus for temporary focus changes
   */
  static saveFocus(): () => void {
    const activeElement = document.activeElement as FocusableElement;
    
    return () => {
      if (activeElement && typeof activeElement.focus === 'function') {
        activeElement.focus();
      }
    };
  }
}

/**
 * ARIA Live Region Manager
 */
export class LiveRegionManager implements AriaLiveRegion {
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
    
    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  private createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.className = 'live-region sr-only';
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    return region;
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    // Clear first to ensure the message is announced even if it's the same
    region.textContent = '';
    
    // Use setTimeout to ensure the clearing is processed first
    setTimeout(() => {
      region.textContent = message;
    }, 100);
  }

  /**
   * Clear all live regions
   */
  clear(): void {
    this.politeRegion.textContent = '';
    this.assertiveRegion.textContent = '';
  }

  /**
   * Destroy the live regions
   */
  destroy(): void {
    this.politeRegion.remove();
    this.assertiveRegion.remove();
  }
}

/**
 * Keyboard Navigation Handler
 */
export class KeyboardNavigationHandler {
  private container: HTMLElement;
  private items: FocusableElement[] = [];
  private currentIndex: number = 0;
  private orientation: 'horizontal' | 'vertical' | 'both';

  constructor(
    container: HTMLElement, 
    options: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      wrap?: boolean;
      itemSelector?: string;
    } = {}
  ) {
    this.container = container;
    this.orientation = options.orientation || 'both';
    this.updateItems(options.itemSelector);
    this.setupEventListeners(options.wrap !== false);
  }

  private updateItems(selector?: string): void {
    if (selector) {
      this.items = Array.from(
        this.container.querySelectorAll(selector)
      ) as FocusableElement[];
    } else {
      this.items = FocusManager.getFocusableElements(this.container);
    }
  }

  private setupEventListeners(wrap: boolean): void {
    this.container.addEventListener('keydown', (event) => {
      this.handleKeyDown(event, wrap);
    });

    // Update current index when focus changes
    this.container.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const index = this.items.indexOf(target as FocusableElement);
      if (index !== -1) {
        this.currentIndex = index;
      }
    });
  }

  private handleKeyDown(event: KeyboardEvent, wrap: boolean): void {
    const { key } = event;
    let handled = false;

    switch (key) {
      case 'ArrowDown':
        if (this.orientation === 'vertical' || this.orientation === 'both') {
          this.moveNext(wrap);
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (this.orientation === 'vertical' || this.orientation === 'both') {
          this.movePrevious(wrap);
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (this.orientation === 'horizontal' || this.orientation === 'both') {
          this.moveNext(wrap);
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (this.orientation === 'horizontal' || this.orientation === 'both') {
          this.movePrevious(wrap);
          handled = true;
        }
        break;
      case 'Home':
        this.moveToFirst();
        handled = true;
        break;
      case 'End':
        this.moveToLast();
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private moveNext(wrap: boolean): void {
    if (this.items.length === 0) return;
    
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.items.length) {
      nextIndex = wrap ? 0 : this.items.length - 1;
    }
    
    this.focusItem(nextIndex);
  }

  private movePrevious(wrap: boolean): void {
    if (this.items.length === 0) return;
    
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = wrap ? this.items.length - 1 : 0;
    }
    
    this.focusItem(prevIndex);
  }

  private moveToFirst(): void {
    if (this.items.length > 0) {
      this.focusItem(0);
    }
  }

  private moveToLast(): void {
    if (this.items.length > 0) {
      this.focusItem(this.items.length - 1);
    }
  }

  private focusItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.items[index].focus();
    }
  }

  /**
   * Refresh the list of items (call when DOM changes)
   */
  refresh(itemSelector?: string): void {
    this.updateItems(itemSelector);
  }

  /**
   * Get the currently focused item index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Set focus to a specific item by index
   */
  setCurrentIndex(index: number): void {
    this.focusItem(index);
  }
}

/**
 * Skip Navigation Links
 */
export class SkipNavigation {
  private container: HTMLElement;

  constructor() {
    this.container = this.createSkipNavContainer();
    document.body.insertBefore(this.container, document.body.firstChild);
  }

  private createSkipNavContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'skip-navigation';
    container.setAttribute('role', 'navigation');
    container.setAttribute('aria-label', 'Skip navigation');
    
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#footer', text: 'Skip to footer' }
    ];

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.className = 'skip-nav';
      skipLink.textContent = link.text;
      container.appendChild(skipLink);
    });

    return container;
  }

  /**
   * Add a custom skip link
   */
  addSkipLink(href: string, text: string): void {
    const skipLink = document.createElement('a');
    skipLink.href = href;
    skipLink.className = 'skip-nav';
    skipLink.textContent = text;
    this.container.appendChild(skipLink);
  }

  /**
   * Remove the skip navigation
   */
  destroy(): void {
    this.container.remove();
  }
}

/**
 * Heading Hierarchy Validator
 */
export class HeadingHierarchy {
  /**
   * Validate and fix heading hierarchy in a container
   */
  static validateAndFix(container: HTMLElement = document.body): void {
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let expectedLevel = 1;
    let hasH1 = false;

    headings.forEach((heading) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      // Ensure there's only one h1 per page
      if (currentLevel === 1) {
        if (hasH1) {
          console.warn('Multiple h1 elements found. Consider using h2 for subsequent headings.');
        }
        hasH1 = true;
        expectedLevel = 2;
        return;
      }

      // Check for skipped levels
      if (currentLevel > expectedLevel + 1) {
        console.warn(
          `Heading level skipped: Found h${currentLevel} but expected h${expectedLevel} or lower.`,
          heading
        );
      }

      expectedLevel = currentLevel + 1;
    });

    if (!hasH1 && headings.length > 0) {
      console.warn('No h1 element found. The page should have exactly one h1 element.');
    }
  }

  /**
   * Generate a table of contents from headings
   */
  static generateTOC(container: HTMLElement = document.body): HTMLElement {
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const toc = document.createElement('nav');
    toc.setAttribute('role', 'navigation');
    toc.setAttribute('aria-label', 'Table of contents');
    
    const list = document.createElement('ol');
    list.className = 'toc-list';
    
    headings.forEach((heading, index) => {
      // Add ID if not present
      if (!heading.id) {
        heading.id = `heading-${index + 1}`;
      }
      
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent || '';
      link.className = `toc-level-${heading.tagName.charAt(1)}`;
      
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
    
    toc.appendChild(list);
    return toc;
  }
}

/**
 * Global accessibility manager
 */
export class AccessibilityManager {
  private liveRegion: LiveRegionManager;
  private skipNav: SkipNavigation;
  private keyboardNavHandlers: Map<string, KeyboardNavigationHandler> = new Map();

  constructor() {
    this.liveRegion = new LiveRegionManager();
    this.skipNav = new SkipNavigation();
    this.initializeGlobalFeatures();
  }

  private initializeGlobalFeatures(): void {
    // Add main content landmark if not present
    this.ensureMainLandmark();
    
    // Validate heading hierarchy
    HeadingHierarchy.validateAndFix();
    
    // Set up global keyboard navigation
    this.setupGlobalKeyboardHandling();
    
    // Add focus-visible polyfill behavior
    this.setupFocusVisible();
  }

  private ensureMainLandmark(): void {
    if (!document.querySelector('main')) {
      const main = document.createElement('main');
      main.id = 'main-content';
      main.setAttribute('role', 'main');
      
      // Move existing content to main
      const body = document.body;
      while (body.firstChild && body.firstChild !== main) {
        main.appendChild(body.firstChild);
      }
      
      body.appendChild(main);
    }
  }

  private setupGlobalKeyboardHandling(): void {
    document.addEventListener('keydown', (event) => {
      // Escape key handling
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
    });
  }

  private setupFocusVisible(): void {
    let hadKeyboardEvent = true;

    const pointerEvents = ['mousedown', 'pointerdown'];
    const keyboardEvents = ['keydown'];

    pointerEvents.forEach(event => {
      document.addEventListener(event, () => {
        hadKeyboardEvent = false;
      });
    });

    keyboardEvents.forEach(event => {
      document.addEventListener(event, (e) => {
        if ((e as KeyboardEvent).metaKey || (e as KeyboardEvent).altKey || (e as KeyboardEvent).ctrlKey) {
          return;
        }
        hadKeyboardEvent = true;
      });
    });

    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (hadKeyboardEvent || target.matches(':focus-visible')) {
        target.classList.add('focus-visible');
      }
    }, true);

    document.addEventListener('blur', (event) => {
      const target = event.target as HTMLElement;
      target.classList.remove('focus-visible');
    }, true);
  }

  private handleEscapeKey(): void {
    // Close any open dropdowns, modals, etc.
    const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
    openDropdowns.forEach(element => {
      if (element instanceof HTMLElement) {
        element.click(); // Trigger close
      }
    });
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.liveRegion.announce(message, priority);
  }

  /**
   * Register a keyboard navigation handler
   */
  registerKeyboardHandler(id: string, handler: KeyboardNavigationHandler): void {
    this.keyboardNavHandlers.set(id, handler);
  }

  /**
   * Unregister a keyboard navigation handler
   */
  unregisterKeyboardHandler(id: string): void {
    this.keyboardNavHandlers.delete(id);
  }

  /**
   * Destroy all accessibility features
   */
  destroy(): void {
    this.liveRegion.destroy();
    this.skipNav.destroy();
    this.keyboardNavHandlers.clear();
  }
}

// Global instance
export const accessibilityManager = new AccessibilityManager();

// Export utility functions (already exported above as classes)