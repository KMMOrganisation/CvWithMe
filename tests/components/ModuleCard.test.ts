import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { ModuleCard } from '../../src/components/ModuleCard.js';
import { sampleModules } from '../../src/data/sampleData.js';

describe('ModuleCard Component', () => {
  let container: HTMLElement;
  let mockOnClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockOnClick = vi.fn();
  });

  it('should render module card with basic information', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    expect(element.classList.contains('module-card')).toBe(true);
    expect(element.textContent).toContain(module.title);
    expect(element.textContent).toContain(module.description);
    expect(element.textContent).toContain(module.estimatedTime);
  });

  it('should display lesson count correctly', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    const lessonCount = element.querySelector('.module-card__lesson-count');
    expect(lessonCount?.textContent).toContain(`${module.lessons.length} lessons`);
  });

  it('should show complexity level', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    const complexity = element.querySelector('.module-card__complexity');
    expect(complexity?.textContent).toBe(module.complexity);
  });

  it('should display progress when provided', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      progress: 60,
      completedLessons: 3,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    const progressBar = element.querySelector('.module-card__progress-bar');
    const progressText = element.querySelector('.module-card__progress-text');
    
    expect(progressBar).toBeTruthy();
    expect(progressText?.textContent).toContain('60%');
    expect(progressText?.textContent).toContain('3 of');
  });

  it('should handle click events', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    fireEvent.click(element);
    expect(mockOnClick).toHaveBeenCalledWith(module);
  });

  it('should support keyboard navigation', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    fireEvent(element, enterEvent);
    expect(mockOnClick).toHaveBeenCalledWith(module);

    // Test Space key
    mockOnClick.mockClear();
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    fireEvent(element, spaceEvent);
    expect(mockOnClick).toHaveBeenCalledWith(module);
  });

  it('should have proper accessibility attributes', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    expect(element.getAttribute('role')).toBe('button');
    expect(element.getAttribute('tabindex')).toBe('0');
    expect(element.getAttribute('aria-label')).toContain(module.title);
  });

  it('should update progress correctly', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      progress: 30,
      completedLessons: 2,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    // Update progress
    moduleCard.updateProgress(80, 4);

    const progressText = element.querySelector('.module-card__progress-text');
    expect(progressText?.textContent).toContain('80%');
    expect(progressText?.textContent).toContain('4 of');
  });

  it('should show completed state when progress is 100%', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      progress: 100,
      completedLessons: module.lessons.length,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    expect(element.classList.contains('module-card--completed')).toBe(true);
    const progressText = element.querySelector('.module-card__progress-text');
    expect(progressText?.textContent).toContain('Complete');
  });

  it('should display prerequisites when available', () => {
    const moduleWithPrereqs = {
      ...sampleModules[0],
      prerequisites: ['Basic HTML knowledge', 'Text editor setup']
    };

    const moduleCard = new ModuleCard({
      module: moduleWithPrereqs,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    const prerequisites = element.querySelector('.module-card__prerequisites');
    expect(prerequisites).toBeTruthy();
    expect(prerequisites?.textContent).toContain('Basic HTML knowledge');
    expect(prerequisites?.textContent).toContain('Text editor setup');
  });

  it('should handle hover effects', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    // Test mouse enter
    fireEvent.mouseEnter(element);
    expect(element.classList.contains('module-card--hover')).toBe(true);

    // Test mouse leave
    fireEvent.mouseLeave(element);
    expect(element.classList.contains('module-card--hover')).toBe(false);
  });

  it('should cleanup properly when destroyed', () => {
    const module = sampleModules[0];
    const moduleCard = new ModuleCard({
      module,
      onClick: mockOnClick
    });

    const element = moduleCard.getElement();
    container.appendChild(element);

    expect(container.contains(element)).toBe(true);

    moduleCard.destroy();
    expect(container.contains(element)).toBe(false);
  });
});