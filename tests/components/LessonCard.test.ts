import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { LessonCard } from '../../src/components/LessonCard.js';
import { sampleModules } from '../../src/data/sampleData.js';

describe('LessonCard Component', () => {
  let container: HTMLElement;
  let mockOnClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockOnClick = vi.fn();
  });

  it('should render lesson card with basic information', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    expect(element.classList.contains('lesson-card')).toBe(true);
    expect(element.textContent).toContain(lesson.title);
    expect(element.textContent).toContain(lesson.description);
    expect(element.textContent).toContain(lesson.estimatedTime);
  });

  it('should display complexity level', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    const complexity = element.querySelector('.lesson-card__complexity');
    expect(complexity?.textContent).toBe(lesson.complexity);
  });

  it('should show tools required', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    const toolsSection = element.querySelector('.lesson-card__tools');
    if (lesson.tools.length > 0) {
      expect(toolsSection).toBeTruthy();
      lesson.tools.slice(0, 2).forEach(tool => {
        expect(element.textContent).toContain(tool);
      });
    }
  });

  it('should display progress when provided', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      progress: 45,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    const progressBar = element.querySelector('.lesson-card__progress-bar');
    const progressText = element.querySelector('.lesson-card__progress-text');
    
    expect(progressBar).toBeTruthy();
    expect(progressText?.textContent).toContain('45%');
  });

  it('should show completed state when progress is 100%', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      progress: 100,
      isCompleted: true,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    expect(element.classList.contains('lesson-card--completed')).toBe(true);
    const progressText = element.querySelector('.lesson-card__progress-text');
    expect(progressText?.textContent).toContain('Complete');
  });

  it('should handle click events', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    fireEvent.click(element);
    expect(mockOnClick).toHaveBeenCalledWith(lesson);
  });

  it('should support keyboard navigation', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    fireEvent(element, enterEvent);
    expect(mockOnClick).toHaveBeenCalledWith(lesson);

    // Test Space key
    mockOnClick.mockClear();
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    fireEvent(element, spaceEvent);
    expect(mockOnClick).toHaveBeenCalledWith(lesson);
  });

  it('should have proper accessibility attributes', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    expect(element.getAttribute('role')).toBe('button');
    expect(element.getAttribute('tabindex')).toBe('0');
    expect(element.getAttribute('aria-label')).toContain(lesson.title);
  });

  it('should update progress correctly', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      progress: 25,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    // Update progress
    lessonCard.updateProgress(75);

    const progressText = element.querySelector('.lesson-card__progress-text');
    expect(progressText?.textContent).toContain('75%');
  });

  it('should display prerequisites when available', () => {
    const lessonWithPrereqs = sampleModules[0].lessons.find(l => l.prerequisites.length > 0);
    
    if (lessonWithPrereqs) {
      const lessonCard = new LessonCard({
        lesson: lessonWithPrereqs,
        onClick: mockOnClick
      });

      const element = lessonCard.getElement();
      container.appendChild(element);

      const prerequisites = element.querySelector('.lesson-card__prerequisites');
      expect(prerequisites).toBeTruthy();
      lessonWithPrereqs.prerequisites.forEach(prereq => {
        expect(element.textContent).toContain(prereq);
      });
    }
  });

  it('should handle tools display with overflow', () => {
    const lessonWithManyTools = {
      ...sampleModules[0].lessons[0],
      tools: ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Tool 5']
    };

    const lessonCard = new LessonCard({
      lesson: lessonWithManyTools,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    // Should show first 2 tools and a "more" indicator
    expect(element.textContent).toContain('Tool 1');
    expect(element.textContent).toContain('Tool 2');
    expect(element.textContent).toContain('+3 more');
  });

  it('should handle focus and blur events', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    // Test focus
    fireEvent.focus(element);
    expect(element.classList.contains('lesson-card--focused')).toBe(true);

    // Test blur
    fireEvent.blur(element);
    expect(element.classList.contains('lesson-card--focused')).toBe(false);
  });

  it('should cleanup properly when destroyed', () => {
    const lesson = sampleModules[0].lessons[0];
    const lessonCard = new LessonCard({
      lesson,
      onClick: mockOnClick
    });

    const element = lessonCard.getElement();
    container.appendChild(element);

    expect(container.contains(element)).toBe(true);

    lessonCard.destroy();
    expect(container.contains(element)).toBe(false);
  });
});