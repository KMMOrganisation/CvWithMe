import { NavigationProps } from '../data/types/index.js';
import { FocusManager, KeyboardNavigationHandler, accessibilityManager } from '../utils/accessibility.js';
import { SearchComponent } from './SearchComponent.js';

export class Navigation {
  private element: HTMLElement;
  private props: NavigationProps;
  private isMenuOpen = false;
  private searchComponent?: SearchComponent;

  private keyboardHandler?: KeyboardNavigationHandler;
  private focusTrap?: () => void;

  constructor(container: HTMLElement, props: NavigationProps) {
    this.props = props;
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupEventListeners();
    this.setupKeyboardNavigation();
    this.setupSearchComponent();
  }

  private createElement(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'navigation';
    nav.id = 'navigation';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    
    nav.innerHTML = `
      <div class="nav-container">
        <!-- Site Branding -->
        <div class="nav-brand">
          <a href="/" class="nav-brand-link" aria-label="CV Tutorial Website - Return to home page">
            <span class="nav-brand-icon" aria-hidden="true">🎓</span>
            <span class="nav-brand-text">CV Tutorial</span>
          </a>
        </div>

        <!-- Simple Navigation Links -->
        <div class="nav-links">
          <a href="/" class="nav-link nav-item-enhanced">Home</a>
          <a href="/?test=search" class="nav-link nav-item-enhanced">Search</a>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="nav-mobile-toggle btn-enhanced focus-enhanced" 
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="mobile-menu"
          aria-haspopup="true"
        >
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="sr-only">Menu</span>
        </button>

        <!-- Mobile Navigation Menu -->
        <div class="nav-mobile" id="mobile-menu" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
          <div class="nav-mobile-content">
            ${this.renderMobileNavigation()}
          </div>
        </div>
      </div>
    `;

    return nav;
  }

  private renderModuleNavigation(): string {
    if (!this.props.modules.length) {
      return '<div class="nav-modules" role="status" aria-live="polite">No modules available</div>';
    }

    return `
      <div class="nav-modules">
        <button 
          class="nav-modules-toggle"
          aria-label="View all course modules"
          aria-expanded="false"
          aria-haspopup="menu"
          aria-controls="modules-dropdown"
        >
          <span>Modules</span>
          <svg class="nav-dropdown-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 0 0 .708-.708L8.354 4.939a.5.5 0 0 0-.708 0L3.72 8.865a.5.5 0 1 0 .708.708z"/>
          </svg>
        </button>
        <div class="nav-modules-dropdown" id="modules-dropdown" role="menu" aria-hidden="true" aria-labelledby="nav-modules-toggle">
          ${this.props.modules.map((module) => `
            <a 
              href="/module/${module.slug}" 
              class="nav-module-item ${this.props.currentModule === module.id ? 'active' : ''}"
              role="menuitem"
              tabindex="-1"
              aria-describedby="module-${module.id}-desc"
              ${this.props.currentModule === module.id ? 'aria-current="page"' : ''}
            >
              <div class="nav-module-info">
                <span class="nav-module-title">${module.title}</span>
                <span class="nav-module-meta" id="module-${module.id}-desc">
                  ${module.lessons.length} lesson${module.lessons.length !== 1 ? 's' : ''} • ${module.estimatedTime}
                </span>
              </div>
              <span class="nav-module-complexity badge badge-${module.complexity.toLowerCase()}" aria-label="Complexity: ${module.complexity}">
                ${module.complexity}
              </span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderBreadcrumbs(): string {
    const breadcrumbs = this.generateBreadcrumbs();
    
    if (breadcrumbs.length <= 1) {
      return '';
    }

    return `
      <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
        <ol class="breadcrumb-list">
          ${breadcrumbs.map((crumb, index) => `
            <li class="breadcrumb-item">
              ${index === breadcrumbs.length - 1 
                ? `<span class="breadcrumb-current" aria-current="page">${crumb.title}</span>`
                : `<a href="${crumb.url}" class="breadcrumb-link">${crumb.title}</a>`
              }
              ${index < breadcrumbs.length - 1 ? '<span class="breadcrumb-separator" aria-hidden="true">›</span>' : ''}
            </li>
          `).join('')}
        </ol>
      </nav>
    `;
  }

  private renderMobileNavigation(): string {
    return `
      <div class="nav-mobile-header">
        <h2 class="nav-mobile-title" id="mobile-menu-title">Menu</h2>
        <button class="nav-mobile-close" aria-label="Close navigation menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="sr-only">Close</span>
        </button>
      </div>
      
      <div class="nav-mobile-links">
        <a href="/" class="nav-mobile-link">Home</a>
        <a href="/?test=search" class="nav-mobile-link">Search</a>
        <a href="/?test=module" class="nav-mobile-link">Modules</a>
      </div>
      
      <div class="nav-mobile-search" id="nav-mobile-search-container">
        <!-- Mobile search component will be inserted here -->
      </div>
    `;
  }

  private generateBreadcrumbs(): Array<{title: string, url: string}> {
    const breadcrumbs = [{title: 'Home', url: '/'}];
    
    if (this.props.currentModule) {
      const module = this.props.modules.find(m => m.id === this.props.currentModule);
      if (module) {
        breadcrumbs.push({
          title: module.title,
          url: `/module/${module.slug}`
        });
        
        if (this.props.currentLesson) {
          const lesson = module.lessons.find(l => l.id === this.props.currentLesson);
          if (lesson) {
            breadcrumbs.push({
              title: lesson.title,
              url: `/module/${module.slug}/lesson/${lesson.slug}`
            });
          }
        }
      }
    }
    
    return breadcrumbs;
  }

  private setupEventListeners(): void {
    // Mobile menu toggle
    const mobileToggle = this.element.querySelector('.nav-mobile-toggle') as HTMLButtonElement;
    const mobileClose = this.element.querySelector('.nav-mobile-close') as HTMLButtonElement;
    
    mobileToggle?.addEventListener('click', () => this.toggleMobileMenu());
    mobileClose?.addEventListener('click', () => this.closeMobileMenu());

    // Desktop modules dropdown
    const modulesToggle = this.element.querySelector('.nav-modules-toggle') as HTMLButtonElement;
    
    modulesToggle?.addEventListener('click', () => this.toggleModulesDropdown());
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target as Node)) {
        this.closeAllDropdowns();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
        this.closeMobileMenu();
      }
    });

    // Prevent body scroll when mobile menu is open
    const mobileMenu = this.element.querySelector('.nav-mobile') as HTMLElement;
    mobileMenu?.addEventListener('transitionstart', () => {
      if (this.isMenuOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
    });
    
    mobileMenu?.addEventListener('transitionend', () => {
      if (!this.isMenuOpen) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    });

    // Touch event handling for better mobile experience
    this.setupTouchEvents();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      // Close mobile menu on orientation change
      setTimeout(() => {
        this.closeMobileMenu();
      }, 100);
    });

    // Handle resize events
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        // Close mobile menu if screen becomes large enough
        if (window.innerWidth > 768) {
          this.closeMobileMenu();
        }
      }, 150);
    });
  }

  private setupTouchEvents(): void {
    const mobileMenu = this.element.querySelector('.nav-mobile') as HTMLElement;
    if (!mobileMenu) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    // Handle swipe to close on mobile menu
    mobileMenu.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    mobileMenu.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      // If swiping down significantly, close menu
      if (deltaY > 100) {
        this.closeMobileMenu();
        isDragging = false;
      }
    }, { passive: true });

    mobileMenu.addEventListener('touchend', () => {
      isDragging = false;
    }, { passive: true });

    // Add touch feedback to interactive elements
    const interactiveElements = this.element.querySelectorAll('button, a');
    interactiveElements.forEach(element => {
      element.classList.add('touch-feedback');
    });
  }

  private setupSearchComponent(): void {
    // Mobile search (in mobile menu)
    const mobileSearchContainer = this.element.querySelector('#nav-mobile-search-container') as HTMLElement;
    if (mobileSearchContainer) {
      new SearchComponent(mobileSearchContainer, {
        modules: this.props.modules,
        placeholder: 'Search course content...',
        showFilters: true,
        onResultSelect: (result) => {
          // Close mobile menu and navigate
          this.closeMobileMenu();
          window.location.href = result.url;
        }
      });
    }
  }

  private setupKeyboardNavigation(): void {
    // Find all focusable elements
    this.updateFocusableElements();

    // Handle keyboard navigation in dropdowns
    const modulesToggle = this.element.querySelector('.nav-modules-toggle') as HTMLButtonElement;
    const moduleItems = this.element.querySelectorAll('.nav-module-item') as NodeListOf<HTMLElement>;

    modulesToggle?.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.openModulesDropdown();
          moduleItems[0]?.focus();
          accessibilityManager.announce('Modules menu opened', 'polite');
          break;
        case 'Escape':
          e.preventDefault();
          this.closeModulesDropdown();
          break;
      }
    });

    // Set up keyboard navigation for dropdown menu
    const dropdown = this.element.querySelector('.nav-modules-dropdown') as HTMLElement;
    if (dropdown) {
      this.keyboardHandler = new KeyboardNavigationHandler(dropdown, {
        orientation: 'vertical',
        wrap: true,
        itemSelector: '.nav-module-item'
      });
    }

    moduleItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            this.closeModulesDropdown();
            modulesToggle?.focus();
            accessibilityManager.announce('Modules menu closed', 'polite');
            break;
          case 'Tab':
            // Allow tab to close dropdown and move to next element
            if (!e.shiftKey && index === moduleItems.length - 1) {
              this.closeModulesDropdown();
            } else if (e.shiftKey && index === 0) {
              this.closeModulesDropdown();
            }
            break;
        }
      });

      // Announce module selection
      item.addEventListener('focus', () => {
        const title = item.querySelector('.nav-module-title')?.textContent;
        const meta = item.querySelector('.nav-module-meta')?.textContent;
        if (title && meta) {
          accessibilityManager.announce(`${title}, ${meta}`, 'polite');
        }
      });
    });

    // Add keyboard shortcut for search (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.searchComponent?.focus();
      }
    });
  }

  private updateFocusableElements(): void {
    FocusManager.getFocusableElements(this.element);
  }

  private toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateMobileMenuState();
  }

  private closeMobileMenu(): void {
    this.isMenuOpen = false;
    this.updateMobileMenuState();
  }

  private updateMobileMenuState(): void {
    const toggle = this.element.querySelector('.nav-mobile-toggle') as HTMLButtonElement;
    const menu = this.element.querySelector('.nav-mobile') as HTMLElement;
    
    toggle?.setAttribute('aria-expanded', this.isMenuOpen.toString());
    toggle?.setAttribute('aria-label', this.isMenuOpen ? 'Close navigation menu' : 'Open navigation menu');
    menu?.setAttribute('aria-hidden', (!this.isMenuOpen).toString());
    
    if (this.isMenuOpen) {
      menu?.classList.add('open');
      
      // Set up focus trap for mobile menu
      this.focusTrap = FocusManager.trapFocus(menu);
      
      // Announce menu state
      accessibilityManager.announce('Navigation menu opened', 'polite');
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      menu?.classList.remove('open');
      
      // Clean up focus trap
      if (this.focusTrap) {
        this.focusTrap();
        this.focusTrap = undefined;
      }
      
      // Restore focus to toggle button
      toggle?.focus();
      
      // Announce menu state
      accessibilityManager.announce('Navigation menu closed', 'polite');
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  private toggleModulesDropdown(): void {
    const toggle = this.element.querySelector('.nav-modules-toggle') as HTMLButtonElement;
    // const dropdown = this.element.querySelector('.nav-modules-dropdown') as HTMLElement;
    const isOpen = toggle?.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
      this.closeModulesDropdown();
    } else {
      this.openModulesDropdown();
    }
  }

  private openModulesDropdown(): void {
    const toggle = this.element.querySelector('.nav-modules-toggle') as HTMLButtonElement;
    const dropdown = this.element.querySelector('.nav-modules-dropdown') as HTMLElement;
    
    toggle?.setAttribute('aria-expanded', 'true');
    dropdown?.setAttribute('aria-hidden', 'false');
    dropdown?.classList.add('open');
    
    // Set tabindex for menu items
    const menuItems = dropdown?.querySelectorAll('.nav-module-item') as NodeListOf<HTMLElement>;
    menuItems?.forEach(item => item.setAttribute('tabindex', '0'));
  }

  private closeModulesDropdown(): void {
    const toggle = this.element.querySelector('.nav-modules-toggle') as HTMLButtonElement;
    const dropdown = this.element.querySelector('.nav-modules-dropdown') as HTMLElement;
    
    toggle?.setAttribute('aria-expanded', 'false');
    dropdown?.setAttribute('aria-hidden', 'true');
    dropdown?.classList.remove('open');
    
    // Remove tabindex from menu items
    const menuItems = dropdown?.querySelectorAll('.nav-module-item') as NodeListOf<HTMLElement>;
    menuItems?.forEach(item => item.setAttribute('tabindex', '-1'));
  }

  private closeAllDropdowns(): void {
    this.closeModulesDropdown();
  }

  // Public methods for updating navigation state
  public updateProps(newProps: NavigationProps): void {
    this.props = newProps;
    this.render();
  }

  private render(): void {
    const container = this.element.parentElement;
    if (container) {
      container.removeChild(this.element);
      this.element = this.createElement();
      container.appendChild(this.element);
      this.setupEventListeners();
      this.setupKeyboardNavigation();
      this.setupSearchComponent();
    }
  }

  public destroy(): void {
    // Clean up focus trap if active
    if (this.focusTrap) {
      this.focusTrap();
    }
    
    // Clean up keyboard handler
    if (this.keyboardHandler) {
      accessibilityManager.unregisterKeyboardHandler('navigation-dropdown');
    }
    
    // Clean up search component
    if (this.searchComponent) {
      this.searchComponent.destroy();
    }
    
    this.element.remove();
  }
}