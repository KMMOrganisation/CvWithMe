import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { Router } from '../../src/utils/router.js';
import { NavigationState } from '../../src/utils/navigationState.js';
import { sampleModules } from '../../src/data/sampleData.js';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    search: '',
    hash: '',
    href: 'http://localhost:3000/',
  },
  writable: true,
});

// Mock history API
const mockPushState = vi.fn();
const mockReplaceState = vi.fn();
Object.defineProperty(window, 'history', {
  value: {
    pushState: mockPushState,
    replaceState: mockReplaceState,
    back: vi.fn(),
    forward: vi.fn(),
  },
  writable: true,
});

describe('Navigation Integration Tests', () => {
  let container: HTMLElement;
  let router: Router;
  let navigationState: NavigationState;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);

    // Reset mocks
    mockPushState.mockClear();
    mockReplaceState.mockClear();

    // Initialize navigation state and router
    navigationState = new NavigationState();
    router = new Router(container);
  });

  it('should navigate to landing page by default', () => {
    expect(navigationState.getCurrentRoute()).toBe('/');
    expect(container.querySelector('.landing-page')).toBeTruthy();
  });

  it('should navigate to module page when module is selected', () => {
    const moduleId = sampleModules[0].id;

    // Navigate to module
    navigationState.navigateToModule(moduleId);

    expect(navigationState.getCurrentRoute()).toBe(`/module/${moduleId}`);
    expect(navigationState.getCurrentModule()).toBe(moduleId);
    expect(mockPushState).toHaveBeenCalledWith(
      { moduleId },
      '',
      `/module/${moduleId}`
    );
  });

  it('should navigate to lesson page when lesson is selected', () => {
    const moduleId = sampleModules[0].id;
    const lessonId = sampleModules[0].lessons[0].id;

    // Navigate to lesson
    navigationState.navigateToLesson(moduleId, lessonId);

    expect(navigationState.getCurrentRoute()).toBe(`/module/${moduleId}/lesson/${lessonId}`);
    expect(navigationState.getCurrentModule()).toBe(moduleId);
    expect(navigationState.getCurrentLesson()).toBe(lessonId);
    expect(mockPushState).toHaveBeenCalledWith(
      { moduleId, lessonId },
      '',
      `/module/${moduleId}/lesson/${lessonId}`
    );
  });

  it('should handle browser back/forward navigation', () => {
    const moduleId = sampleModules[0].id;
    const lessonId = sampleModules[0].lessons[0].id;

    // Navigate to module, then lesson
    navigationState.navigateToModule(moduleId);
    navigationState.navigateToLesson(moduleId, lessonId);

    // Simulate browser back button
    const popStateEvent = new PopStateEvent('popstate', {
      state: { moduleId }
    });

    window.dispatchEvent(popStateEvent);

    expect(navigationState.getCurrentRoute()).toBe(`/module/${moduleId}`);
    expect(navigationState.getCurrentLesson()).toBeUndefined();
  });

  it('should update URL when navigating between lessons in same module', () => {
    const moduleId = sampleModules[0].id;
    const firstLessonId = sampleModules[0].lessons[0].id;
    const secondLessonId = sampleModules[0].lessons[1].id;

    // Navigate to first lesson
    navigationState.navigateToLesson(moduleId, firstLessonId);
    expect(navigationState.getCurrentLesson()).toBe(firstLessonId);

    // Navigate to second lesson
    navigationState.navigateToLesson(moduleId, secondLessonId);
    expect(navigationState.getCurrentLesson()).toBe(secondLessonId);
    expect(mockPushState).toHaveBeenLastCalledWith(
      { moduleId, lessonId: secondLessonId },
      '',
      `/module/${moduleId}/lesson/${secondLessonId}`
    );
  });

  it('should handle invalid routes gracefully', () => {
    // Try to navigate to non-existent module
    navigationState.navigateToModule(999);

    // Should redirect to 404 or landing page
    expect(navigationState.getCurrentRoute()).toBe('/404');
  });

  it('should preserve navigation state across page refreshes', () => {
    const moduleId = sampleModules[0].id;
    const lessonId = sampleModules[0].lessons[0].id;

    // Navigate to lesson
    navigationState.navigateToLesson(moduleId, lessonId);

    // Simulate page refresh by creating new navigation state with current URL
    window.location.pathname = `/module/${moduleId}/lesson/${lessonId}`;
    const newNavigationState = new NavigationState();

    expect(newNavigationState.getCurrentModule()).toBe(moduleId);
    expect(newNavigationState.getCurrentLesson()).toBe(lessonId);
  });

  it('should handle navigation with query parameters', () => {
    const moduleId = sampleModules[0].id;

    // Navigate with query parameters
    navigationState.navigateToModule(moduleId, { progress: '50' });

    expect(navigationState.getCurrentRoute()).toBe(`/module/${moduleId}?progress=50`);
  });

  it('should support breadcrumb navigation', () => {
    const moduleId = sampleModules[0].id;
    const lessonId = sampleModules[0].lessons[0].id;

    // Navigate to lesson
    navigationState.navigateToLesson(moduleId, lessonId);

    const breadcrumbs = navigationState.getBreadcrumbs();
    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0].title).toBe('Home');
    expect(breadcrumbs[1].title).toBe(sampleModules[0].title);
    expect(breadcrumbs[2].title).toBe(sampleModules[0].lessons[0].title);
  });

  it('should handle next/previous lesson navigation', () => {
    const moduleId = sampleModules[0].id;
    const lessons = sampleModules[0].lessons;

    // Start at first lesson
    navigationState.navigateToLesson(moduleId, lessons[0].id);

    // Navigate to next lesson
    const nextLesson = navigationState.getNextLesson();
    expect(nextLesson?.id).toBe(lessons[1].id);

    navigationState.navigateToNextLesson();
    expect(navigationState.getCurrentLesson()).toBe(lessons[1].id);

    // Navigate to previous lesson
    const prevLesson = navigationState.getPreviousLesson();
    expect(prevLesson?.id).toBe(lessons[0].id);

    navigationState.navigateToPreviousLesson();
    expect(navigationState.getCurrentLesson()).toBe(lessons[0].id);
  });

  it('should handle module completion and progression', () => {
    const firstModuleId = sampleModules[0].id;
    const secondModuleId = sampleModules[1].id;
    const lastLessonId = sampleModules[0].lessons[sampleModules[0].lessons.length - 1].id;

    // Navigate to last lesson of first module
    navigationState.navigateToLesson(firstModuleId, lastLessonId);

    // Complete the lesson (simulate)
    navigationState.markLessonComplete(lastLessonId);

    // Check if module is complete
    const isModuleComplete = navigationState.isModuleComplete(firstModuleId);
    expect(isModuleComplete).toBe(true);

    // Navigate to next module
    const nextModule = navigationState.getNextModule();
    expect(nextModule?.id).toBe(secondModuleId);
  });

  it('should handle search navigation', () => {
    const searchQuery = 'HTML basics';

    // Navigate to search results
    navigationState.navigateToSearch(searchQuery);

    expect(navigationState.getCurrentRoute()).toBe(`/search?q=${encodeURIComponent(searchQuery)}`);
    expect(navigationState.getSearchQuery()).toBe(searchQuery);
  });

  it('should handle deep linking to specific content', () => {
    const moduleId = sampleModules[0].id;
    const lessonId = sampleModules[0].lessons[0].id;
    const sectionId = 'introduction';

    // Navigate to specific section within lesson
    navigationState.navigateToLessonSection(moduleId, lessonId, sectionId);

    expect(navigationState.getCurrentRoute()).toBe(`/module/${moduleId}/lesson/${lessonId}#${sectionId}`);
    expect(window.location.hash).toBe(`#${sectionId}`);
  });
});