import { Module } from '../data/types/index.js';
import { ProgressIndicator, createModuleProgress } from './ProgressIndicator.js';
import { accessibilityManager } from '../utils/accessibility.js';

export interface ModuleCardProps {
  module: Module;
  progress?: number; // Progress percentage (0-100)
  completedLessons?: number; // Number of completed lessons
  onClick?: (module: Module) => void;
  onQuickStart?: (module: Module) => void;
  onLessonClick?: (lesson: any) => void;
  showQuickAccess?: boolean; // Show quick start and lesson preview
}

export class ModuleCard {
  private props: ModuleCardProps;
  private element: HTMLElement;
  private progressIndicator?: ProgressIndicator;

  constructor(props: ModuleCardProps) {
    this.props = props;
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const { module, progress = 0, completedLessons = 0 } = this.props;
    
    // Create main card element
    const card = document.createElement('article');
    card.className = 'module-card card-enhanced hover-lift focus-enhanced interactive scroll-reveal';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    // Enhanced aria-label with progress information
    const progressText = completedLessons > 0 
      ? `, ${completedLessons} of ${module.lessons.length} lessons completed`
      : '';
    card.setAttribute('aria-label', `Module ${module.order}: ${module.title}. ${module.complexity} level. ${module.estimatedTime}${progressText}. Click to open module.`);
    
    // Add describedby for additional context
    card.setAttribute('aria-describedby', `module-${module.id}-description`);

    // Add click and keyboard event listeners
    this.addEventListeners(card);

    // Create card content
    card.innerHTML = `
      <div class="module-card__header">
        <div class="module-card__meta">
          <span class="module-card__order" aria-label="Module number ${module.order}">Module ${module.order}</span>
          ${this.createComplexityBadge(module.complexity)}
        </div>
        <div class="module-card__progress-container" id="progress-${module.id}" aria-live="polite">
          <!-- Progress indicator will be inserted here -->
        </div>
      </div>
      
      <div class="module-card__content">
        <h3 class="module-card__title">${module.title}</h3>
        <p class="module-card__description" id="module-${module.id}-description">${module.description}</p>
      </div>
      
      <div class="module-card__footer">
        <div class="module-card__stats" role="group" aria-label="Module statistics">
          <div class="module-card__stat">
            <span class="module-card__stat-icon" aria-hidden="true">⏱️</span>
            <span class="module-card__stat-text" aria-label="Estimated time: ${module.estimatedTime}">${module.estimatedTime}</span>
          </div>
          <div class="module-card__stat">
            <span class="module-card__stat-icon" aria-hidden="true">📚</span>
            <span class="module-card__stat-text" aria-label="${module.lessons.length} lesson${module.lessons.length !== 1 ? 's' : ''}">${module.lessons.length} lesson${module.lessons.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        ${module.prerequisites.length > 0 ? this.createPrerequisites(module.prerequisites) : ''}
        
        <div class="module-card__actions">
          <div class="module-card__primary-action">
            <span class="module-card__cta" aria-hidden="true">
              ${progress > 0 ? 'Continue Learning' : 'View Module'}
              <span class="module-card__arrow">→</span>
            </span>
          </div>
          ${this.props.showQuickAccess ? this.createQuickAccessActions() : ''}
        </div>
        
        ${this.props.showQuickAccess ? this.createLessonPreview() : ''}
      </div>
    `;

    // Add progress indicator if there's progress
    this.setupProgressIndicator();

    return card;
  }

  private createComplexityBadge(complexity: string): string {
    const complexityClass = `complexity-${complexity.toLowerCase()}`;
    return `<span class="module-card__complexity badge ${complexityClass}" aria-label="Complexity level: ${complexity}">${complexity}</span>`;
  }

  private setupProgressIndicator(): void {
    const { module, completedLessons = 0 } = this.props;
    
    if (completedLessons > 0 || this.props.progress) {
      const progressContainer = this.element.querySelector(`#progress-${module.id}`) as HTMLElement;
      if (progressContainer) {
        this.progressIndicator = createModuleProgress(
          completedLessons,
          module.lessons.length,
          `Module ${module.order} Progress`
        );
        this.progressIndicator.appendTo(progressContainer);
      }
    }
  }

  private createPrerequisites(prerequisites: string[]): string {
    return `
      <div class="module-card__prerequisites" role="group" aria-labelledby="prereq-label-${this.props.module.id}">
        <span class="module-card__prerequisites-label" id="prereq-label-${this.props.module.id}">Prerequisites:</span>
        <ul class="module-card__prerequisites-list" aria-labelledby="prereq-label-${this.props.module.id}">
          ${prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  private createQuickAccessActions(): string {
    console.log('Creating quick access actions for module:', this.props.module.title);
    return `
      <div class="module-card__quick-actions">
        <button class="module-card__quick-start-btn" data-action="quick-start" aria-label="Start first lesson of ${this.props.module.title}">
          <span class="quick-start-icon">⚡</span>
          Quick Start
        </button>
        <button class="module-card__toggle-lessons" data-action="toggle-lessons" aria-label="Show lessons in ${this.props.module.title}" aria-expanded="false">
          <span class="toggle-icon">📋</span>
          <span class="toggle-text">Lessons</span>
          <span class="toggle-arrow">▼</span>
        </button>
      </div>
    `;
  }

  private createLessonPreview(): string {
    const { module } = this.props;
    return `
      <div class="module-card__lessons-preview" data-lessons-preview style="display: none;" aria-hidden="true">
        <div class="lessons-preview__header">
          <h4>Lessons in this module:</h4>
        </div>
        <ul class="lessons-preview__list" role="list">
          ${module.lessons.map((lesson, index) => `
            <li class="lessons-preview__item" role="listitem">
              <button class="lesson-preview-btn" data-lesson-id="${lesson.id}" data-lesson-index="${index}" aria-label="Start lesson: ${lesson.title}">
                <span class="lesson-number">${index + 1}.</span>
                <span class="lesson-title">${lesson.title}</span>
                <span class="lesson-time">${lesson.estimatedTime}</span>
                <span class="lesson-arrow">→</span>
              </button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  private addEventListeners(card: HTMLElement): void {
    const handleMainClick = (event: Event) => {
      // Don't trigger main click if clicking on quick action buttons
      const target = event.target as HTMLElement;
      if (target.closest('.module-card__quick-actions') || target.closest('.lessons-preview__list')) {
        return;
      }
      
      if (this.props.onClick) {
        // Announce the action to screen readers
        accessibilityManager.announce(`Opening ${this.props.module.title}`, 'polite');
        this.props.onClick(this.props.module);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target as HTMLElement;
        if (!target.closest('.module-card__quick-actions') && !target.closest('.lessons-preview__list')) {
          event.preventDefault();
          handleMainClick(event);
        }
      }
    };

    card.addEventListener('click', handleMainClick);
    card.addEventListener('keydown', handleKeyDown);

    // Add quick action event listeners
    this.addQuickActionListeners(card);

    // Add focus management for accessibility
    card.addEventListener('focus', () => {
      card.classList.add('module-card--focused');
    });

    card.addEventListener('blur', () => {
      card.classList.remove('module-card--focused');
    });

    // Add hover effects for better UX (but not on touch devices)
    if (window.matchMedia('(hover: hover)').matches) {
      card.addEventListener('mouseenter', () => {
        card.classList.add('module-card--hovered');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('module-card--hovered');
      });
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public updateProgress(completedLessons: number, progress?: number): void {
    this.props.completedLessons = completedLessons;
    this.props.progress = progress;
    
    // Update progress indicator
    if (this.progressIndicator) {
      this.progressIndicator.updateProgress(completedLessons, this.props.module.lessons.length);
    } else if (completedLessons > 0) {
      // Create progress indicator if it doesn't exist
      this.setupProgressIndicator();
    }

    // Update CTA text based on progress
    const ctaElement = this.element.querySelector('.module-card__cta');
    if (ctaElement) {
      const ctaText = ctaElement.querySelector('span:not(.module-card__arrow)');
      if (ctaText) {
        ctaText.textContent = completedLessons > 0 ? 'Continue Learning' : 'Start Module';
      }
    }
  }

  public destroy(): void {
    // Clean up progress indicator
    this.progressIndicator?.destroy();
    // Clean up event listeners
    this.element.remove();
  }

  private addQuickActionListeners(card: HTMLElement): void {
    console.log('Adding quick action listeners for module:', this.props.module.title);
    
    // Quick start button
    const quickStartBtn = card.querySelector('.module-card__quick-start-btn');
    console.log('Quick start button found:', !!quickStartBtn);
    
    if (quickStartBtn) {
      quickStartBtn.addEventListener('click', (e) => {
        console.log('Quick start button clicked!');
        e.stopPropagation();
        if (this.props.onQuickStart) {
          console.log('Calling onQuickStart callback');
          accessibilityManager.announce(`Starting first lesson of ${this.props.module.title}`, 'polite');
          this.props.onQuickStart(this.props.module);
        } else {
          console.log('No onQuickStart callback provided');
        }
      });
    }

    // Toggle lessons button
    const toggleBtn = card.querySelector('.module-card__toggle-lessons');
    const lessonsPreview = card.querySelector('.module-card__lessons-preview') as HTMLElement;
    
    if (toggleBtn && lessonsPreview) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLessonsPreview(toggleBtn as HTMLElement, lessonsPreview);
      });
    }

    // Individual lesson buttons
    const lessonBtns = card.querySelectorAll('.lesson-preview-btn');
    lessonBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lessonIndex = parseInt((btn as HTMLElement).dataset.lessonIndex || '0', 10);
        const lesson = this.props.module.lessons[lessonIndex];
        if (lesson && this.props.onLessonClick) {
          accessibilityManager.announce(`Starting lesson: ${lesson.title}`, 'polite');
          this.props.onLessonClick(lesson);
        }
      });
    });
  }

  private toggleLessonsPreview(toggleBtn: HTMLElement, lessonsPreview: HTMLElement): void {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    const newExpanded = !isExpanded;
    
    // Update ARIA state
    toggleBtn.setAttribute('aria-expanded', newExpanded.toString());
    lessonsPreview.setAttribute('aria-hidden', (!newExpanded).toString());
    
    // Update visual state
    if (newExpanded) {
      lessonsPreview.style.display = 'block';
      toggleBtn.querySelector('.toggle-arrow')!.textContent = '▲';
      toggleBtn.querySelector('.toggle-text')!.textContent = 'Hide';
      this.element.classList.add('module-card--expanded');
    } else {
      lessonsPreview.style.display = 'none';
      toggleBtn.querySelector('.toggle-arrow')!.textContent = '▼';
      toggleBtn.querySelector('.toggle-text')!.textContent = 'Lessons';
      this.element.classList.remove('module-card--expanded');
    }
    
    // Announce the change
    const action = newExpanded ? 'expanded' : 'collapsed';
    accessibilityManager.announce(`Lessons list ${action}`, 'polite');
  }
}

// Factory function for easier component creation
export function createModuleCard(props: ModuleCardProps): ModuleCard {
  return new ModuleCard(props);
}