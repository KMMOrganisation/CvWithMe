import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on landing page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on module page', async ({ page }) => {
    await page.goto('/module/1');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on lesson page', async ({ page }) => {
    await page.goto('/module/1/lesson/1');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    // Should navigate or activate the focused element
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(async (heading) => {
        const tagName = await heading.evaluate(el => el.tagName);
        return parseInt(tagName.charAt(1));
      })
    );
    
    // Check that heading levels don't skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation has proper role
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
    
    // Check buttons have proper labels
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/');
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live]');
    await expect(liveRegions.first()).toBeAttached();
    
    // Navigate to trigger announcements
    await page.locator('.module-card').first().click();
    
    // Check that announcements are made (would need screen reader testing in real scenario)
    const announcements = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    await expect(announcements.first()).toBeAttached();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Use axe to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('should handle focus management properly', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu (if on mobile viewport)
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileToggle = page.locator('.navigation__mobile-toggle');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      
      // Focus should move to first item in menu
      const firstMenuItem = page.locator('.navigation__mobile-menu .navigation__module-link').first();
      await expect(firstMenuItem).toBeFocused();
      
      // Escape should close menu and return focus
      await page.keyboard.press('Escape');
      await expect(mobileToggle).toBeFocused();
    }
  });

  test('should provide skip navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Tab to reveal skip links
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('.skip-link, [href="#main-content"]').first();
    if (await skipLink.isVisible()) {
      await skipLink.click();
      
      // Should focus main content
      const mainContent = page.locator('#main-content, main').first();
      await expect(mainContent).toBeFocused();
    }
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Check that animations are disabled or reduced
    const animatedElements = page.locator('.skeleton, .loading-animation');
    if (await animatedElements.first().isVisible()) {
      const element = animatedElements.first();
      const animationDuration = await element.evaluate(el => 
        getComputedStyle(el).animationDuration
      );
      
      // Should have no animation or very short duration
      expect(animationDuration === '0s' || animationDuration === 'none').toBeTruthy();
    }
  });

  test('should have proper form labels and descriptions', async ({ page }) => {
    await page.goto('/');
    
    // Check search input
    const searchInput = page.locator('input[type="search"], .search-component__input');
    if (await searchInput.isVisible()) {
      const label = await searchInput.getAttribute('aria-label');
      const labelledBy = await searchInput.getAttribute('aria-labelledby');
      const placeholder = await searchInput.getAttribute('placeholder');
      
      // Should have some form of label
      expect(label || labelledBy || placeholder).toBeTruthy();
    }
  });

  test('should handle error states accessibly', async ({ page }) => {
    // Navigate to invalid route to trigger 404
    await page.goto('/invalid-route');
    
    const errorPage = page.locator('.not-found-page, .error-page');
    await expect(errorPage).toBeVisible();
    
    // Check accessibility of error page
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Should have proper heading
    const errorHeading = page.locator('h1');
    await expect(errorHeading).toBeVisible();
    
    // Should have helpful navigation
    const homeLink = page.locator('a[href="/"], .back-to-home');
    await expect(homeLink).toBeVisible();
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    
    // Check that content is still visible and accessible
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Key elements should still be visible
    await expect(page.locator('.navigation')).toBeVisible();
    await expect(page.locator('.module-card').first()).toBeVisible();
  });
});