import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/dom';
import { Navigation } from '../../src/components/Navigation.js';
import { sampleModules } from '../../src/data/sampleData.js';

describe('Navigation Component', () => {
  let container: HTMLElement;
  let navigation: Navigation;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should render navigation with modules', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 1
    });

    expect(container.querySelector('.navigation')).toBeTruthy();
    expect(container.querySelector('.navigation__brand')).toBeTruthy();
    expect(container.querySelector('.navigation__modules')).toBeTruthy();
  });

  it('should display correct number of modules', () => {
    const testModules = sampleModules.slice(0, 3);
    navigation = new Navigation(container, {
      modules: testModules,
      currentModule: 1
    });

    const moduleItems = container.querySelectorAll('.navigation__module-item');
    expect(moduleItems).toHaveLength(testModules.length);
  });

  it('should highlight current module', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 2
    });

    const currentModuleItem = container.querySelector('.navigation__module-item--current');
    expect(currentModuleItem).toBeTruthy();
    expect(currentModuleItem?.textContent).toContain(sampleModules[1].title);
  });

  it('should handle mobile menu toggle', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 1
    });

    const mobileToggle = container.querySelector('.navigation__mobile-toggle') as HTMLButtonElement;
    const mobileMenu = container.querySelector('.navigation__mobile-menu') as HTMLElement;

    expect(mobileToggle).toBeTruthy();
    expect(mobileMenu).toBeTruthy();

    // Initially closed
    expect(mobileMenu.classList.contains('navigation__mobile-menu--open')).toBe(false);

    // Click to open
    fireEvent.click(mobileToggle);
    expect(mobileMenu.classList.contains('navigation__mobile-menu--open')).toBe(true);

    // Click to close
    fireEvent.click(mobileToggle);
    expect(mobileMenu.classList.contains('navigation__mobile-menu--open')).toBe(false);
  });

  it('should support keyboard navigation', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 1
    });

    const firstModuleLink = container.querySelector('.navigation__module-link') as HTMLElement;
    expect(firstModuleLink.getAttribute('tabindex')).toBe('0');

    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    fireEvent(firstModuleLink, enterEvent);

    // Test Space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    fireEvent(firstModuleLink, spaceEvent);
  });

  it('should have proper ARIA attributes', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 1
    });

    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('role')).toBe('navigation');
    expect(nav?.getAttribute('aria-label')).toBe('Course modules');

    const modulesList = container.querySelector('.navigation__modules');
    expect(modulesList?.getAttribute('role')).toBe('list');

    const moduleItems = container.querySelectorAll('.navigation__module-item');
    moduleItems.forEach(item => {
      expect(item.getAttribute('role')).toBe('listitem');
    });
  });

  it('should handle breadcrumb navigation', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 2,
      currentLesson: 1
    });

    const breadcrumbs = container.querySelector('.navigation__breadcrumbs');
    expect(breadcrumbs).toBeTruthy();
    expect(breadcrumbs?.getAttribute('aria-label')).toBe('Breadcrumb navigation');
  });

  it('should close mobile menu on escape key', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 1
    });

    const mobileToggle = container.querySelector('.navigation__mobile-toggle') as HTMLButtonElement;
    const mobileMenu = container.querySelector('.navigation__mobile-menu') as HTMLElement;

    // Open menu
    fireEvent.click(mobileToggle);
    expect(mobileMenu.classList.contains('navigation__mobile-menu--open')).toBe(true);

    // Press escape
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    fireEvent(document, escapeEvent);
    expect(mobileMenu.classList.contains('navigation__mobile-menu--open')).toBe(false);
  });

  it('should update current module when props change', () => {
    navigation = new Navigation(container, {
      modules: sampleModules.slice(0, 3),
      currentModule: 1
    });

    // Update to different module
    navigation.updateCurrentModule(3);

    const currentModuleItem = container.querySelector('.navigation__module-item--current');
    expect(currentModuleItem?.textContent).toContain(sampleModules[2].title);
  });
});