/**
 * Simple Navigation Bar - Just the basics
 */

export class SimpleNavbar {
  private element: HTMLElement;

  constructor(container: HTMLElement) {
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'simple-navbar';
    
    nav.innerHTML = `
      <div class="navbar-container">
        <a href="/" class="navbar-brand">
          <span class="navbar-icon">🎓</span>
          <span class="navbar-text">CV Tutorial</span>
        </a>
        <div class="navbar-links">
          <a href="/" class="navbar-link">Home</a>
        </div>
      </div>
    `;

    return nav;
  }

  private setupEventListeners(): void {
    // Handle navigation clicks properly for browser history
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = link.getAttribute('href');
        if (path) {
          window.history.pushState({}, '', path);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    });
  }

  public destroy(): void {
    this.element.remove();
  }
}