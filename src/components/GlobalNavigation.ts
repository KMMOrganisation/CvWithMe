/**
 * Global Navigation Component
 * 
 * Provides consistent navigation across all pages with proper browser history support
 */

import { Module } from '../data/types/index.js';

export interface GlobalNavigationProps {
  modules: Module[];
  currentPage?: 'home' | 'module' | 'lesson' | 'search';
  currentModule?: Module;
  currentLesson?: any;
  onNavigate?: (path: string) => void;
}

export class GlobalNavigation {
  private element: HTMLElement;
  private props: GlobalNavigationProps;
  private isMenuOpen = false;

  constructor(container: HTMLElement, props: GlobalNavigationProps) {
    this.props = props;
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'global-navigation';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    
    nav.innerHTML = `
      <div class="global-nav-container">
        <!-- Brand/Logo -->
        <div class="global-nav-brand">
          <a href="/" class="global-nav-brand-link" data-navigate="/">
            <span class="global-nav-icon" aria-hidden="true">🎓</span>
            <span class="global-nav-text">CV Tutorial</span>
          </a>
        </div>

        <!-- Breadcrumbs -->
        <div class="global-nav-breadcrumbs">
          ${this.renderBreadcrumbs()}
        </div>

        <!-- Main Navigation Links -->
        <div class="global-nav-links">
          <a href="/" class="global-nav-link ${this.props.currentPage === 'home' ? 'active' : ''}" data-navigate="/">
            <span class="nav-link-icon" aria-hidden="true">🏠</span>
            <span>Home</span>
          </a>
          <div class="global-nav-modules-dropdown">
            <button class="global-nav-modules-toggle" aria-expanded="false" aria-haspopup="menu">
              <span class="nav-link-icon" aria-hidden="true">📚</span>
              <span>Modules</span>
              <span class="dropdown-arrow" aria-hidden="true">▼</span>
            </button>
            <div class="global-nav-modules-menu" role="menu" aria-hidden="true">
              ${this.renderModulesMenu()}
            </div>
          </div>
          <a href="/?search=true" class="global-nav-link ${this.props.currentPage === 'search' ? 'active' : ''}" data-navigate="/?search=true">
            <span class="nav-link-icon" aria-hidden="true">🔍</span>
            <span>Search</span>
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button class="global-nav-mobile-toggle" aria-label="Open navigation menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- Mobile Menu -->
        <div class="global-nav-mobile-menu" aria-hidden="true">
          <div class="mobile-menu-header">
            <h2>Navigation</h2>
            <button class="mobile-menu-close" aria-label="Close navigation menu">✕</button>
          </div>
          <div class="mobile-menu-content">
            <a href="/" class="mobile-nav-link" data-navigate="/">
              <span class="nav-link-icon">🏠</span>
              Home
            </a>
            <div class="mobile-modules-section">
              <h3>Modules</h3>
              ${this.renderMobileModulesMenu()}
            </div>
            <a href="/?search=true" class="mobile-nav-link" data-navigate="/?search=true">
              <span class="nav-link-icon">🔍</span>
              Search
            </a>
          </div>
        </div>
      </div>
    `;

    return nav;
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
                : `<a href="${crumb.url}" class="breadcrumb-link" data-navigate="${crumb.url}">${crumb.title}</a>`
              }
              ${index < breadcrumbs.length - 1 ? '<span class="breadcrumb-separator" aria-hidden="true">›</span>' : ''}
            </li>
          `).join('')}
        </ol>
      </nav>
    `;
  }

  private renderModulesMenu(): string {
    return this.props.modules.map(module => `
      <a href="/module/${module.slug}" 
         class="modules-menu-item ${this.props.currentModule?.id === module.id ? 'active' : ''}" 
         role="menuitem"
         data-navigate="/module/${module.slug}">
        <div class="module-menu-info">
          <span class="module-menu-title">${module.title}</span>
          <span class="module-menu-meta">${module.lessons.length} lessons • ${module.estimatedTime}</span>
        </div>
        <span class="module-complexity badge-${module.complexity.toLowerCase()}">${module.complexity}</span>
      </a>
    `).join('');
  }

  private renderMobileModulesMenu(): string {
    return this.props.modules.map(module => `
      <a href="/module/${module.slug}" 
         class="mobile-module-item ${this.props.currentModule?.id === module.id ? 'active' : ''}"
         data-navigate="/module/${module.slug}">
        <span class="mobile-module-title">${module.title}</span>
        <span class="mobile-module-meta">${module.lessons.length} lessons</span>
      </a>
    `).join('');
  }

  private generateBreadcrumbs(): Array<{title: string, url: string}> {
    const breadcrumbs = [{title: 'Home', url: '/'}];
    
    if (this.props.currentModule) {
      breadcrumbs.push({
        title: this.props.currentModule.title,
        url: `/module/${this.props.currentModule.slug}`
      });
      
      if (this.props.currentLesson) {
        breadcrumbs.push({
          title: this.props.currentLesson.title,
          url: `/module/${this.props.currentModule.slug}/lesson/${this.props.currentLesson.slug}`
        });
      }
    }
    
    return breadcrumbs;
  }

  private setupEventListeners(): void {
    // Handle all navigation clicks
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const navLink = target.closest('[data-navigate]') as HTMLElement;
      
      if (navLink) {
        e.preventDefault();
        const path = navLink.getAttribute('data-navigate');
        if (path && this.props.onNavigate) {
          this.props.onNavigate(path);
        }
      }
    });

    // Mobile menu toggle
    const mobileToggle = this.element.querySelector('.global-nav-mobile-toggle') as HTMLButtonElement;
    const mobileClose = this.element.querySelector('.mobile-menu-close') as HTMLButtonElement;
    
    mobileToggle?.addEventListener('click', () => this.toggleMobileMenu());
    mobileClose?.addEventListener('click', () => this.closeMobileMenu());

    // Modules dropdown
    const modulesToggle = this.element.querySelector('.global-nav-modules-toggle') as HTMLButtonElement;
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
    const toggle = this.element.querySelector('.global-nav-mobile-toggle') as HTMLButtonElement;
    const menu = this.element.querySelector('.global-nav-mobile-menu') as HTMLElement;
    
    toggle?.setAttribute('aria-expanded', this.isMenuOpen.toString());
    menu?.setAttribute('aria-hidden', (!this.isMenuOpen).toString());
    
    if (this.isMenuOpen) {
      menu?.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      menu?.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  private toggleModulesDropdown(): void {
    const toggle = this.element.querySelector('.global-nav-modules-toggle') as HTMLButtonElement;
    const isOpen = toggle?.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
      this.closeModulesDropdown();
    } else {
      this.openModulesDropdown();
    }
  }

  private openModulesDropdown(): void {
    const toggle = this.element.querySelector('.global-nav-modules-toggle') as HTMLButtonElement;
    const menu = this.element.querySelector('.global-nav-modules-menu') as HTMLElement;
    
    toggle?.setAttribute('aria-expanded', 'true');
    menu?.setAttribute('aria-hidden', 'false');
    menu?.classList.add('open');
  }

  private closeModulesDropdown(): void {
    const toggle = this.element.querySelector('.global-nav-modules-toggle') as HTMLButtonElement;
    const menu = this.element.querySelector('.global-nav-modules-menu') as HTMLElement;
    
    toggle?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-hidden', 'true');
    menu?.classList.remove('open');
  }

  private closeAllDropdowns(): void {
    this.closeModulesDropdown();
  }

  public updateProps(newProps: Partial<GlobalNavigationProps>): void {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  private render(): void {
    const container = this.element.parentElement;
    if (container) {
      container.removeChild(this.element);
      this.element = this.createElement();
      container.appendChild(this.element);
      this.setupEventListeners();
    }
  }

  public destroy(): void {
    this.element.remove();
  }
}