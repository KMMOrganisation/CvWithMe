import { Module } from '../data/types/index.js';

export interface ModuleCardProps {
  module: Module;
  progress?: number; // Progress percentage (0-100)
  onClick?: (module: Module) => void;
}

export class ModuleCard {
  private props: ModuleCardProps;
  private element: HTMLElement;

  constructor(props: ModuleCardProps) {
    this.props = props;
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const { module, progress = 0 } = this.props;
    
    // Create main card element
    const card = document.createElement('article');
    card.className = 'module-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Module: ${module.title}`);

    // Add click and keyboard event listeners
    this.addEventListeners(card);

    // Create card content
    card.innerHTML = `
      <div class="module-card__header">
        <div class="module-card__meta">
          <span class="module-card__order">Module ${module.order}</span>
          ${this.createComplexityBadge(module.complexity)}
        </div>
        ${progress > 0 ? this.createProgressIndicator(progress) : ''}
      </div>
      
      <div class="module-card__content">
        <h3 class="module-card__title">${module.title}</h3>
        <p class="module-card__description">${module.description}</p>
      </div>
      
      <div class="module-card__footer">
        <div class="module-card__stats">
          <div class="module-card__stat">
            <span class="module-card__stat-icon">⏱️</span>
            <span class="module-card__stat-text">${module.estimatedTime}</span>
          </div>
          <div class="module-card__stat">
            <span class="module-card__stat-icon">📚</span>
            <span class="module-card__stat-text">${module.lessons.length} lesson${module.lessons.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        ${module.prerequisites.length > 0 ? this.createPrerequisites(module.prerequisites) : ''}
        
        <div class="module-card__action">
          <span class="module-card__cta">
            ${progress > 0 ? 'Continue Learning' : 'Start Module'}
            <span class="module-card__arrow">→</span>
          </span>
        </div>
      </div>
    `;

    return card;
  }

  private createComplexityBadge(complexity: string): string {
    const complexityClass = `complexity-${complexity.toLowerCase()}`;
    return `<span class="module-card__complexity badge ${complexityClass}">${complexity}</span>`;
  }

  private createProgressIndicator(progress: number): string {
    return `
      <div class="module-card__progress">
        <div class="module-card__progress-bar" style="width: ${progress}%"></div>
        <span class="module-card__progress-text">${Math.round(progress)}% complete</span>
      </div>
    `;
  }

  private createPrerequisites(prerequisites: string[]): string {
    return `
      <div class="module-card__prerequisites">
        <span class="module-card__prerequisites-label">Prerequisites:</span>
        <ul class="module-card__prerequisites-list">
          ${prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  private addEventListeners(card: HTMLElement): void {
    const handleClick = () => {
      if (this.props.onClick) {
        this.props.onClick(this.props.module);
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
      card.classList.add('module-card--focused');
    });

    card.addEventListener('blur', () => {
      card.classList.remove('module-card--focused');
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public updateProgress(progress: number): void {
    this.props.progress = progress;
    const progressElement = this.element.querySelector('.module-card__progress-bar') as HTMLElement;
    const progressText = this.element.querySelector('.module-card__progress-text') as HTMLElement;
    
    if (progressElement && progressText) {
      progressElement.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}% complete`;
    } else if (progress > 0) {
      // Add progress indicator if it doesn't exist
      const header = this.element.querySelector('.module-card__header');
      if (header) {
        header.insertAdjacentHTML('beforeend', this.createProgressIndicator(progress));
      }
    }

    // Update CTA text based on progress
    const ctaElement = this.element.querySelector('.module-card__cta');
    if (ctaElement) {
      const ctaText = ctaElement.querySelector('span:not(.module-card__arrow)');
      if (ctaText) {
        ctaText.textContent = progress > 0 ? 'Continue Learning' : 'Start Module';
      }
    }
  }

  public destroy(): void {
    // Clean up event listeners
    this.element.remove();
  }
}

// Factory function for easier component creation
export function createModuleCard(props: ModuleCardProps): ModuleCard {
  return new ModuleCard(props);
}