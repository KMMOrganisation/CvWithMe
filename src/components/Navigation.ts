import { NavigationProps } from '../data/types/index.js';

export class Navigation {
  private element: HTMLElement;
  private props: NavigationProps;
  private isMenuOpen = false;
  // private focusableElements: HTMLElement[] = [];

  constructor(container: HTMLElement, props: NavigationProps) {
    this.props = props;
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }

  private createElement(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'navigation';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    
    nav.innerHTML = `
      <div class="nav-container">
        <!-- Site Branding -->
        <div class="nav-brand">
          <a href="/" class="nav-brand-link" aria-label="CV Tutorial Website - Home">
            <span class="nav-brand-icon">🎓</span>
            <span class="nav-brand-text">CV Tutorial</span>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <div class="nav-desktop">
          ${this.renderModuleNavigation()}
          ${this.renderBreadcrumbs()}
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="nav-mobile-toggle" 
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- Mobile Navigation Menu -->
        <div class="nav-mobile" id="mobile-menu" aria-hidden="true">
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
      return '<div class="nav-modules">No modules available</div>';
    }

    return `
      <div class="nav-modules">
        <button 
          class="nav-modules-toggle"
          aria-label="View all modules"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <span>Modules</span>
          <svg class="nav-dropdown-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 0 0 .708-.708L8.354 4.939a.5.5 0 0 0-.708 0L3.72 8.865a.5.5 0 1 0 .708.708z"/>
          </svg>
        </button>
        <div class="nav-modules-dropdown" role="menu" aria-hidden="true">
          ${this.props.modules.map((module) => `
            <a 
              href="/module/${module.slug}" 
              class="nav-module-item ${this.props.currentModule === module.id ? 'active' : ''}"
              role="menuitem"
              tabindex="-1"
            >
              <div class="nav-module-info">
                <span class="nav-module-title">${module.title}</span>
                <span class="nav-module-meta">
                  ${module.lessons.length} lessons • ${module.estimatedTime}
                </span>
              </div>
              <span class="nav-module-complexity badge badge-${module.complexity.toLowerCase()}">
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
        <span class="nav-mobile-title">Navigation</span>
        <button class="nav-mobile-close" aria-label="Close navigation menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      ${this.renderBreadcrumbs()}
      
      <div class="nav-mobile-modules">
        <h3 class="nav-mobile-section-title">Modules</h3>
        ${this.props.modules.map(module => `
          <a 
            href="/module/${module.slug}" 
            class="nav-mobile-module ${this.props.currentModule === module.id ? 'active' : ''}"
          >
            <div class="nav-mobile-module-info">
              <span class="nav-mobile-module-title">${module.title}</span>
              <span class="nav-mobile-module-meta">
                ${module.lessons.length} lessons • ${module.estimatedTime}
              </span>
            </div>
            <span class="badge badge-${module.complexity.toLowerCase()}">
              ${module.complexity}
            </span>
          </a>
        `).join('')}
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
    // const modulesDropdown = this.element.querySelector('.nav-modules-dropdown') as HTMLElement;
    
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
      }
    });
    
    mobileMenu?.addEventListener('transitionend', () => {
      if (!this.isMenuOpen) {
        document.body.style.overflow = '';
      }
    });
  }

  private setupKeyboardNavigation(): void {
    // Find all focusable elements
    this.updateFocusableElements();

    // Handle keyboard navigation in dropdowns
    const modulesToggle = this.element.querySelector('.nav-modules-toggle') as HTMLButtonElement;
    const moduleItems = this.element.querySelectorAll('.nav-module-item') as NodeListOf<HTMLElement>;

    modulesToggle?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openModulesDropdown();
        moduleItems[0]?.focus();
      }
    });

    moduleItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextItem = moduleItems[index + 1] || moduleItems[0];
            nextItem.focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prevItem = moduleItems[index - 1] || moduleItems[moduleItems.length - 1];
            prevItem.focus();
            break;
          case 'Escape':
            e.preventDefault();
            this.closeModulesDropdown();
            modulesToggle?.focus();
            break;
        }
      });
    });
  }

  private updateFocusableElements(): void {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    // this.focusableElements = Array.from(
    //   this.element.querySelectorAll(focusableSelectors.join(', '))
    // ) as HTMLElement[];
    
    // For now, just ensure the selectors are available for future use
    this.element.querySelectorAll(focusableSelectors.join(', '));
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
    menu?.setAttribute('aria-hidden', (!this.isMenuOpen).toString());
    
    if (this.isMenuOpen) {
      menu?.classList.add('open');
      // Focus first focusable element in mobile menu
      const firstFocusable = menu?.querySelector('a, button') as HTMLElement;
      firstFocusable?.focus();
    } else {
      menu?.classList.remove('open');
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
    }
  }

  public destroy(): void {
    this.element.remove();
  }
}