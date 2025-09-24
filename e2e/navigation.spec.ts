import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate from landing page to module page', async ({ page }) => {
    // Wait for the landing page to load
    await expect(page.locator('.landing-page')).toBeVisible();
    
    // Click on the first module card
    const firstModuleCard = page.locator('.module-card').first();
    await expect(firstModuleCard).toBeVisible();
    await firstModuleCard.click();
    
    // Should navigate to module page
    await expect(page).toHaveURL(/\/module\/\d+/);
    await expect(page.locator('.module-page')).toBeVisible();
  });

  test('should navigate from module page to lesson page', async ({ page }) => {
    // Navigate to a module first
    await page.goto('/module/1');
    await expect(page.locator('.module-page')).toBeVisible();
    
    // Click on the first lesson card
    const firstLessonCard = page.locator('.lesson-card').first();
    await expect(firstLessonCard).toBeVisible();
    await firstLessonCard.click();
    
    // Should navigate to lesson page
    await expect(page).toHaveURL(/\/module\/\d+\/lesson\/\d+/);
    await expect(page.locator('.lesson-page')).toBeVisible();
  });

  test('should use breadcrumb navigation', async ({ page }) => {
    // Navigate to a lesson
    await page.goto('/module/1/lesson/1');
    await expect(page.locator('.lesson-page')).toBeVisible();
    
    // Check breadcrumbs are present
    const breadcrumbs = page.locator('.navigation__breadcrumbs');
    await expect(breadcrumbs).toBeVisible();
    
    // Click on module breadcrumb
    const moduleBreadcrumb = breadcrumbs.locator('a').nth(1);
    await moduleBreadcrumb.click();
    
    // Should navigate back to module page
    await expect(page).toHaveURL(/\/module\/\d+$/);
    await expect(page.locator('.module-page')).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through pages
    await page.goto('/');
    await page.locator('.module-card').first().click();
    await page.locator('.lesson-card').first().click();
    
    // Use browser back button
    await page.goBack();
    await expect(page.locator('.module-page')).toBeVisible();
    
    // Use browser forward button
    await page.goForward();
    await expect(page.locator('.lesson-page')).toBeVisible();
  });

  test('should navigate between lessons within a module', async ({ page }) => {
    // Navigate to first lesson
    await page.goto('/module/1/lesson/1');
    await expect(page.locator('.lesson-page')).toBeVisible();
    
    // Click next lesson button
    const nextButton = page.locator('.lesson-navigation__next');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/\/module\/1\/lesson\/\d+/);
      await expect(page.locator('.lesson-page')).toBeVisible();
    }
  });

  test('should handle mobile navigation menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu toggle is visible
    const mobileToggle = page.locator('.navigation__mobile-toggle');
    await expect(mobileToggle).toBeVisible();
    
    // Open mobile menu
    await mobileToggle.click();
    const mobileMenu = page.locator('.navigation__mobile-menu');
    await expect(mobileMenu).toHaveClass(/navigation__mobile-menu--open/);
    
    // Click on a module in mobile menu
    const moduleLink = mobileMenu.locator('.navigation__module-link').first();
    await moduleLink.click();
    
    // Should navigate and close menu
    await expect(page).toHaveURL(/\/module\/\d+/);
    await expect(mobileMenu).not.toHaveClass(/navigation__mobile-menu--open/);
  });
});

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should perform search and display results', async ({ page }) => {
    // Find and use search input
    const searchInput = page.locator('.search-component__input');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('HTML');
    await searchInput.press('Enter');
    
    // Should navigate to search results page
    await expect(page).toHaveURL(/\/search\?q=HTML/);
    await expect(page.locator('.search-page')).toBeVisible();
    
    // Should display search results
    const searchResults = page.locator('.search-results__item');
    await expect(searchResults.first()).toBeVisible();
  });

  test('should handle empty search gracefully', async ({ page }) => {
    const searchInput = page.locator('.search-component__input');
    await searchInput.fill('');
    await searchInput.press('Enter');
    
    // Should show appropriate message for empty search
    await expect(page.locator('.search-results__empty')).toBeVisible();
  });

  test('should filter search results', async ({ page }) => {
    await page.goto('/search?q=CSS');
    
    // Use complexity filter
    const complexityFilter = page.locator('.search-filters__complexity');
    await complexityFilter.selectOption('Beginner');
    
    // Results should update
    const searchResults = page.locator('.search-results__item');
    await expect(searchResults.first()).toBeVisible();
  });
});

test.describe('Progress Tracking', () => {
  test('should track lesson progress', async ({ page }) => {
    // Navigate to a lesson
    await page.goto('/module/1/lesson/1');
    
    // Scroll through content to simulate progress
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    // Wait for progress to update
    await page.waitForTimeout(1000);
    
    // Check progress indicator
    const progressBar = page.locator('.progress-indicator__bar');
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(progressValue || '0')).toBeGreaterThan(0);
  });

  test('should mark lesson as complete when finished', async ({ page }) => {
    // Navigate to a lesson
    await page.goto('/module/1/lesson/1');
    
    // Scroll to bottom to complete lesson
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait for completion
    await page.waitForTimeout(2000);
    
    // Check completion status
    const completionIndicator = page.locator('.lesson-page__completion');
    await expect(completionIndicator).toBeVisible();
  });

  test('should update module progress based on lesson completion', async ({ page }) => {
    // Complete a lesson
    await page.goto('/module/1/lesson/1');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Navigate back to module page
    await page.goto('/module/1');
    
    // Check module progress
    const moduleProgress = page.locator('.module-page__progress');
    await expect(moduleProgress).toBeVisible();
    
    const progressText = await moduleProgress.textContent();
    expect(progressText).toMatch(/\d+%/); // Should show percentage
  });
});

test.describe('Error Handling', () => {
  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');
    
    await expect(page.locator('.not-found-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('404');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Should show offline message or cached content
    const offlineIndicator = page.locator('.network-error, .offline-message');
    await expect(offlineIndicator).toBeVisible();
  });

  test('should retry failed content loading', async ({ page }) => {
    // Navigate to a page with content
    await page.goto('/module/1/lesson/1');
    
    // Simulate network failure and recovery
    await page.route('**/*', route => route.abort());
    await page.reload();
    
    // Should show error state
    const errorState = page.locator('.content-error, .loading-error');
    await expect(errorState).toBeVisible();
    
    // Remove route interception to simulate recovery
    await page.unroute('**/*');
    
    // Click retry button if available
    const retryButton = page.locator('.retry-button, .error-retry');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await expect(page.locator('.lesson-page')).toBeVisible();
    }
  });
});