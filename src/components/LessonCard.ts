import { Lesson } from '../data/types/index.js';

export interface LessonCardProps {
  lesson: Lesson;
  progress?: number; // Progress percentage (0-100)
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
    const { lesson, progress = 0 } = this.props;
    
    // Create main card element
    const card = document.createElement('article');
    card.className = 'lesson-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Lesson: ${lesson.title}`);

    // Add click and keyboard event listeners
    this.addEventListeners(card);

    // Create card content
    card.innerHTML = `
      <div class="lesson-card__header">
        <div class="lesson-card__meta">
          <span class="lesson-card__order">Lesson ${lesson.order}</span>
          ${this.createComplexityBadge(lesson.complexity)}
        </div>
        ${progress > 0 ? this.createProgressIndicator(progress) : ''}
      </div>
      
      <div class="lesson-card__content">
        <h4 class="lesson-card__title">${lesson.title}</h4>
        <p class="lesson-card__description">${lesson.description}</p>
      </div>
      
      <div class="lesson-card__footer">
        <div class="lesson-card__stats">
          <div class="lesson-card__stat">
            <span class="lesson-card__stat-icon">⏱️</span>
            <span class="lesson-card__stat-text">${lesson.estimatedTime}</span>
          </div>
          ${lesson.tools.length > 0 ? this.createToolsDisplay(lesson.tools) : ''}
        </div>
        
        ${lesson.prerequisites.length > 0 ? this.createPrerequisites(lesson.prerequisites) : ''}
        
        <div class="lesson-card__action">
          <span class="lesson-card__cta">
            ${progress > 0 ? (progress === 100 ? 'Review Lesson' : 'Continue Lesson') : 'Start Lesson'}
            <span class="lesson-card__arrow">→</span>
          </span>
        </div>
      </div>
    `;

    return card;
  }

  private createComplexityBadge(complexity: string): string {
    const complexityClass = `complexity-${complexity.toLowerCase()}`;
    return `<span class="lesson-card__complexity badge ${complexityClass}">${complexity}</span>`;
  }

  private createProgressIndicator(progress: number): string {
    const isComplete = progress === 100;
    return `
      <div class="lesson-card__progress">
        <div class="lesson-card__progress-bar" style="width: ${progress}%"></div>
        <span class="lesson-card__progress-text">
          ${isComplete ? '✓ Complete' : `${Math.round(progress)}% complete`}
        </span>
      </div>
    `;
  }

  private createToolsDisplay(tools: string[]): string {
    const displayTools = tools.slice(0, 2); // Show max 2 tools in card
    const hasMore = tools.length > 2;
    
    return `
      <div class="lesson-card__stat">
        <span class="lesson-card__stat-icon">🛠️</span>
        <span class="lesson-card__stat-text">
          ${displayTools.join(', ')}${hasMore ? ` +${tools.length - 2} more` : ''}
        </span>
      </div>
    `;
  }

  private createPrerequisites(prerequisites: string[]): string {
    return `
      <div class="lesson-card__prerequisites">
        <span class="lesson-card__prerequisites-label">Prerequisites:</span>
        <ul class="lesson-card__prerequisites-list">
          ${prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  private addEventListeners(card: HTMLElement): void {
    const handleClick = () => {
      if (this.props.onClick) {
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

    // Add hover effects for better UX
    card.addEventListener('mouseenter', () => {
      card.classList.add('lesson-card--hovered');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('lesson-card--hovered');
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public updateProgress(progress: number): void {
    this.props.progress = progress;
    const progressElement = this.element.querySelector('.lesson-card__progress-bar') as HTMLElement;
    const progressText = this.element.querySelector('.lesson-card__progress-text') as HTMLElement;
    
    if (progressElement && progressText) {
      progressElement.style.width = `${progress}%`;
      const isComplete = progress === 100;
      progressText.textContent = isComplete ? '✓ Complete' : `${Math.round(progress)}% complete`;
    } else if (progress > 0) {
      // Add progress indicator if it doesn't exist
      const header = this.element.querySelector('.lesson-card__header');
      if (header) {
        header.insertAdjacentHTML('beforeend', this.createProgressIndicator(progress));
      }
    }

    // Update CTA text based on progress
    const ctaElement = this.element.querySelector('.lesson-card__cta');
    if (ctaElement) {
      const ctaText = ctaElement.querySelector('span:not(.lesson-card__arrow)');
      if (ctaText) {
        if (progress === 100) {
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