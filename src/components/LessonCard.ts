import { Lesson } from '../data/types/index.js';
import { accessibilityManager } from '../utils/accessibility.js';

export interface LessonCardProps {
  lesson: Lesson;
  progress?: number; // Progress percentage (0-100)
  isCompleted?: boolean; // Whether lesson is completed
  onClick?: (lesson: Lesson) => void;
}

export class LessonCard {
  private props: LessonCardProps;
  private element: HTMLElement;

  constructor(props: LessonCardProps) {
    this.props = props;
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const { lesson, progress = 0, isCompleted = false } = this.props;
    
    // Create main card element
    const card = document.createElement('article');
    card.className = `lesson-card card-enhanced hover-lift focus-enhanced interactive scroll-reveal ${isCompleted ? 'lesson-card--completed' : ''}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    // Enhanced aria-label with status and progress
    const statusText = isCompleted ? 'Completed' : progress > 0 ? `${Math.round(progress)}% complete` : 'Not started';
    const toolsText = lesson.tools.length > 0 ? `. Tools needed: ${lesson.tools.join(', ')}` : '';
    card.setAttribute('aria-label', `Lesson ${lesson.order}: ${lesson.title}. ${lesson.complexity} level. ${lesson.estimatedTime}. Status: ${statusText}${toolsText}. Click to open lesson.`);
    
    // Add describedby for additional context
    card.setAttribute('aria-describedby', `lesson-${lesson.id}-description`);

    // Add click and keyboard event listeners
    this.addEventListeners(card);

    // Create card content
    card.innerHTML = `
      <div class="lesson-card__header">
        <div class="lesson-card__meta">
          <span class="lesson-card__order" aria-label="Lesson number ${lesson.order}">Lesson ${lesson.order}</span>
          ${this.createComplexityBadge(lesson.complexity)}
        </div>
        <div aria-live="polite" aria-atomic="true">
          ${isCompleted ? this.createCompletionIndicator() : progress > 0 ? this.createProgressIndicator(progress) : ''}
        </div>
      </div>
      
      <div class="lesson-card__content">
        <h4 class="lesson-card__title">${lesson.title}</h4>
        <p class="lesson-card__description" id="lesson-${lesson.id}-description">${lesson.description}</p>
      </div>
      
      <div class="lesson-card__footer">
        <div class="lesson-card__stats" role="group" aria-label="Lesson details">
          <div class="lesson-card__stat">
            <span class="lesson-card__stat-icon" aria-hidden="true">⏱️</span>
            <span class="lesson-card__stat-text" aria-label="Estimated time: ${lesson.estimatedTime}">${lesson.estimatedTime}</span>
          </div>
          ${lesson.tools.length > 0 ? this.createToolsDisplay(lesson.tools) : ''}
        </div>
        
        ${lesson.prerequisites.length > 0 ? this.createPrerequisites(lesson.prerequisites) : ''}
        
        <div class="lesson-card__action">
          <span class="lesson-card__cta" aria-hidden="true">
            ${isCompleted ? 'Review Lesson' : progress > 0 ? 'Continue Lesson' : 'Start Lesson'}
            <span class="lesson-card__arrow">→</span>
          </span>
        </div>
      </div>
    `;

    return card;
  }

  private createComplexityBadge(complexity: string): string {
    const complexityClass = `complexity-${complexity.toLowerCase()}`;
    return `<span class="lesson-card__complexity badge ${complexityClass}" aria-label="Complexity level: ${complexity}">${complexity}</span>`;
  }

  private createProgressIndicator(progress: number): string {
    return `
      <div class="lesson-card__progress" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Lesson progress">
        <div class="lesson-card__progress-bar" style="width: ${progress}%"></div>
        <span class="lesson-card__progress-text">${Math.round(progress)}% complete</span>
      </div>
    `;
  }

  private createCompletionIndicator(): string {
    return `
      <div class="lesson-card__completion" role="status" aria-label="Lesson completed">
        <span class="lesson-card__completion-icon" aria-hidden="true">✓</span>
        <span class="lesson-card__completion-text">Completed</span>
      </div>
    `;
  }

  private createToolsDisplay(tools: string[]): string {
    const displayTools = tools.slice(0, 2); // Show max 2 tools in card
    const hasMore = tools.length > 2;
    const toolsText = displayTools.join(', ') + (hasMore ? ` and ${tools.length - 2} more` : '');
    
    return `
      <div class="lesson-card__stat">
        <span class="lesson-card__stat-icon" aria-hidden="true">🛠️</span>
        <span class="lesson-card__stat-text" aria-label="Tools needed: ${toolsText}">
          ${displayTools.join(', ')}${hasMore ? ` +${tools.length - 2} more` : ''}
        </span>
      </div>
    `;
  }

  private createPrerequisites(prerequisites: string[]): string {
    return `
      <div class="lesson-card__prerequisites" role="group" aria-labelledby="lesson-prereq-label-${this.props.lesson.id}">
        <span class="lesson-card__prerequisites-label" id="lesson-prereq-label-${this.props.lesson.id}">Prerequisites:</span>
        <ul class="lesson-card__prerequisites-list" aria-labelledby="lesson-prereq-label-${this.props.lesson.id}">
          ${prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  private addEventListeners(card: HTMLElement): void {
    const handleClick = () => {
      if (this.props.onClick) {
        // Announce the action to screen readers
        accessibilityManager.announce(`Opening ${this.props.lesson.title}`, 'polite');
        this.props.onClick(this.props.lesson);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    };

    card.addEventListener('click', handleClick);
    card.addEventListener('keydown', handleKeyDown);

    // Add focus management for accessibility
    card.addEventListener('focus', () => {
      card.classList.add('lesson-card--focused');
    });

    card.addEventListener('blur', () => {
      card.classList.remove('lesson-card--focused');
    });

    // Add hover effects for better UX (but not on touch devices)
    if (window.matchMedia('(hover: hover)').matches) {
      card.addEventListener('mouseenter', () => {
        card.classList.add('lesson-card--hovered');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('lesson-card--hovered');
      });
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public updateProgress(progress: number, isCompleted?: boolean): void {
    this.props.progress = progress;
    this.props.isCompleted = isCompleted ?? (progress === 100);
    
    // Update card class
    if (this.props.isCompleted) {
      this.element.classList.add('lesson-card--completed');
    } else {
      this.element.classList.remove('lesson-card--completed');
    }
    
    // Update progress/completion indicator
    const header = this.element.querySelector('.lesson-card__header');
    const existingProgress = header?.querySelector('.lesson-card__progress, .lesson-card__completion');
    
    if (existingProgress) {
      existingProgress.remove();
    }
    
    if (this.props.isCompleted) {
      header?.insertAdjacentHTML('beforeend', this.createCompletionIndicator());
    } else if (progress > 0) {
      header?.insertAdjacentHTML('beforeend', this.createProgressIndicator(progress));
    }

    // Update CTA text based on progress
    const ctaElement = this.element.querySelector('.lesson-card__cta');
    if (ctaElement) {
      const ctaText = ctaElement.querySelector('span:not(.lesson-card__arrow)');
      if (ctaText) {
        if (this.props.isCompleted) {
          ctaText.textContent = 'Review Lesson';
        } else if (progress > 0) {
          ctaText.textContent = 'Continue Lesson';
        } else {
          ctaText.textContent = 'Start Lesson';
        }
      }
    }
  }

  public destroy(): void {
    // Clean up event listeners
    this.element.remove();
  }
}

// Factory function for easier component creation
export function createLessonCard(props: LessonCardProps): LessonCard {
  return new LessonCard(props);
}