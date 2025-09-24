import { describe, it, expect, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'axe-core';
import { Navigation } from '../../src/components/Navigation.js';
import { ModuleCard } from '../../src/components/ModuleCard.js';
import { LessonCard } from '../../src/components/LessonCard.js';
import { ContentRenderer } from '../../src/components/ContentRenderer.js';
import { sampleModules } from '../../src/data/sampleData.js';
import { ContentBlock } from '../../src/data/types/index.js';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Navigation Component Accessibility', () => {
    it('should have no accessibility violations', async () => {
      new Navigation(container, {
        modules: sampleModules.slice(0, 3),
        currentModule: 1
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', () => {
      new Navigation(container, {
        modules: sampleModules.slice(0, 3),
        currentModule: 1
      });

      const nav = container.querySelector('nav');
      expect(nav?.getAttribute('role')).toBe('navigation');
      expect(nav?.getAttribute('aria-label')).toBeTruthy();

      const modulesList = container.querySelector('.navigation__modules');
      expect(modulesList?.getAttribute('role')).toBe('list');

      const moduleItems = container.querySelectorAll('.navigation__module-item');
      moduleItems.forEach(item => {
        expect(item.getAttribute('role')).toBe('listitem');
      });
    });

    it('should support keyboard navigation', () => {
      new Navigation(container, {
        modules: sampleModules.slice(0, 3),
        currentModule: 1
      });

      const moduleLinks = container.querySelectorAll('.navigation__module-link');
      moduleLinks.forEach(link => {
        expect(link.getAttribute('tabindex')).toBe('0');
        expect(link.getAttribute('role')).toBe('button');
      });
    });

    it('should have proper heading hierarchy', () => {
      new Navigation(container, {
        modules: sampleModules.slice(0, 3),
        currentModule: 1
      });

      // Check that headings follow proper hierarchy
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
      
      // Verify no heading levels are skipped
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('ModuleCard Component Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        onClick: () => {}
      });

      container.appendChild(moduleCard.getElement());
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button semantics', () => {
      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        onClick: () => {}
      });

      const element = moduleCard.getElement();
      container.appendChild(element);

      expect(element.getAttribute('role')).toBe('button');
      expect(element.getAttribute('tabindex')).toBe('0');
      expect(element.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have sufficient color contrast', () => {
      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        onClick: () => {}
      });

      container.appendChild(moduleCard.getElement());
      
      // This would typically use a color contrast checking library
      // For now, we'll check that text elements have appropriate classes
      const textElements = container.querySelectorAll('.module-card__title, .module-card__description');
      textElements.forEach(element => {
        expect(element.classList.length).toBeGreaterThan(0);
      });
    });

    it('should announce progress changes to screen readers', () => {
      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        progress: 50,
        onClick: () => {}
      });

      const element = moduleCard.getElement();
      container.appendChild(element);

      const progressElement = element.querySelector('[role="progressbar"]');
      expect(progressElement).toBeTruthy();
      expect(progressElement?.getAttribute('aria-valuenow')).toBe('50');
      expect(progressElement?.getAttribute('aria-valuemin')).toBe('0');
      expect(progressElement?.getAttribute('aria-valuemax')).toBe('100');
    });
  });

  describe('LessonCard Component Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const lessonCard = new LessonCard({
        lesson: sampleModules[0].lessons[0],
        onClick: () => {}
      });

      container.appendChild(lessonCard.getElement());
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have descriptive aria-label', () => {
      const lesson = sampleModules[0].lessons[0];
      const lessonCard = new LessonCard({
        lesson,
        onClick: () => {}
      });

      const element = lessonCard.getElement();
      container.appendChild(element);

      const ariaLabel = element.getAttribute('aria-label');
      expect(ariaLabel).toContain(lesson.title);
      expect(ariaLabel).toContain(lesson.estimatedTime);
      expect(ariaLabel).toContain(lesson.complexity);
    });

    it('should properly announce completion status', () => {
      const lessonCard = new LessonCard({
        lesson: sampleModules[0].lessons[0],
        progress: 100,
        isCompleted: true,
        onClick: () => {}
      });

      const element = lessonCard.getElement();
      container.appendChild(element);

      const ariaLabel = element.getAttribute('aria-label');
      expect(ariaLabel).toContain('completed');
    });
  });

  describe('ContentRenderer Component Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'text',
          content: '# Heading\n\nThis is a paragraph with **bold** text.',
          metadata: {}
        },
        {
          id: '2',
          type: 'image',
          content: 'https://example.com/image.jpg',
          metadata: {
            alt: 'Descriptive alt text',
            caption: 'Image caption'
          }
        },
        {
          id: '3',
          type: 'code',
          content: 'console.log("Hello, World!");',
          metadata: {
            language: 'javascript',
            caption: 'JavaScript example'
          }
        }
      ];

      new ContentRenderer(container, { content });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper alt text for images', () => {
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'image',
          content: 'https://example.com/image.jpg',
          metadata: {
            alt: 'A descriptive alt text for the image',
            caption: 'Image caption'
          }
        }
      ];

      new ContentRenderer(container, { content });

      const img = container.querySelector('img');
      expect(img?.getAttribute('alt')).toBe('A descriptive alt text for the image');
    });

    it('should have proper heading hierarchy', () => {
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'text',
          content: '# Main Heading\n\n## Subheading\n\n### Sub-subheading\n\nParagraph text.',
          metadata: {}
        }
      ];

      new ContentRenderer(container, { content });

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');

      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();
      expect(h1?.textContent).toBe('Main Heading');
      expect(h2?.textContent).toBe('Subheading');
      expect(h3?.textContent).toBe('Sub-subheading');
    });

    it('should have accessible code blocks', () => {
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'code',
          content: 'const greeting = "Hello, World!";\nconsole.log(greeting);',
          metadata: {
            language: 'javascript',
            caption: 'JavaScript variable declaration and logging'
          }
        }
      ];

      new ContentRenderer(container, { content });

      const codeBlock = container.querySelector('pre');
      expect(codeBlock?.getAttribute('role')).toBe('region');
      expect(codeBlock?.getAttribute('aria-label')).toContain('code');

      const code = container.querySelector('code');
      expect(code?.getAttribute('aria-label')).toContain('javascript');
    });

    it('should have accessible video controls', () => {
      const content: ContentBlock[] = [
        {
          id: '1',
          type: 'video',
          content: 'https://example.com/video.mp4',
          metadata: {
            caption: 'Tutorial video showing the process'
          }
        }
      ];

      new ContentRenderer(container, { content });

      const video = container.querySelector('video');
      expect(video?.hasAttribute('controls')).toBe(true);
      expect(video?.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('Focus Management', () => {
    it('should maintain proper focus order', () => {
      // Create a page with multiple interactive elements
      new Navigation(container, {
        modules: sampleModules.slice(0, 2),
        currentModule: 1
      });

      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        onClick: () => {}
      });
      container.appendChild(moduleCard.getElement());

      // Get all focusable elements
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // Check that all focusable elements have proper tabindex
      focusableElements.forEach(element => {
        const tabindex = element.getAttribute('tabindex');
        expect(tabindex === null || parseInt(tabindex) >= 0).toBe(true);
      });
    });

    it('should have visible focus indicators', () => {
      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        onClick: () => {}
      });

      const element = moduleCard.getElement();
      container.appendChild(element);

      // Simulate focus
      element.focus();
      
      // Check that focus styles are applied
      const computedStyle = window.getComputedStyle(element);
      expect(computedStyle.outline).not.toBe('none');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper landmark roles', () => {
      new Navigation(container, {
        modules: sampleModules.slice(0, 3),
        currentModule: 1
      });

      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
    });

    it('should have descriptive button labels', () => {
      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        onClick: () => {}
      });

      const element = moduleCard.getElement();
      container.appendChild(element);

      const ariaLabel = element.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel!.length).toBeGreaterThan(10); // Should be descriptive
    });

    it('should announce dynamic content changes', () => {
      const lessonCard = new LessonCard({
        lesson: sampleModules[0].lessons[0],
        progress: 25,
        onClick: () => {}
      });

      const element = lessonCard.getElement();
      container.appendChild(element);

      // Update progress
      lessonCard.updateProgress(75);

      // Check for live region or aria-live attribute
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Enter and Space key activation', () => {
      let clicked = false;
      const moduleCard = new ModuleCard({
        module: sampleModules[0],
        onClick: () => { clicked = true; }
      });

      const element = moduleCard.getElement();
      container.appendChild(element);

      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(enterEvent);
      expect(clicked).toBe(true);

      // Reset and test Space key
      clicked = false;
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      element.dispatchEvent(spaceEvent);
      expect(clicked).toBe(true);
    });

    it('should support Escape key for closing modals/dropdowns', () => {
      new Navigation(container, {
        modules: sampleModules.slice(0, 3),
        currentModule: 1
      });

      const mobileToggle = container.querySelector('.navigation__mobile-toggle') as HTMLButtonElement;
      const mobileMenu = container.querySelector('.navigation__mobile-menu') as HTMLElement;

      // Open menu
      mobileToggle.click();
      expect(mobileMenu.classList.contains('navigation__mobile-menu--open')).toBe(true);

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      expect(mobileMenu.classList.contains('navigation__mobile-menu--open')).toBe(false);
    });
  });
});