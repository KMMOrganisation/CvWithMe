import { Module, Lesson } from '../data/types/index.js';
import { LessonCard } from '../components/LessonCard.js';
import { Navigation } from '../components/Navigation.js';

export interface ModulePageProps {
  module: Module;
  allModules: Module[];
  progress?: number; // Overall module progress (0-100)
  lessonProgress?: Map<number, number>; // Progress for individual lessons
  onLessonClick?: (lesson: Lesson) => void;
  onModuleNavigation?: (moduleId: number) => void;
}

export class ModulePage {
  private props: ModulePageProps;
  private element: HTMLElement;
  private navigation: Navigation;

  constructor(container: HTMLElement, props: ModulePageProps) {
    this.props = props;
    this.element = this.createElement();
    
    // Initialize navigation with current module context
    this.navigation = new Navigation(container, {
      modules: props.allModules,
      currentModule: props.module.id,
      currentLesson: undefined
    });
    
    container.appendChild(this.element);
    this.initializeLessonCards();
    this.initializeModuleNavigation();
  }

  private createElement(): HTMLElement {
    const page = document.createElement('div');
    page.className = 'module-page';
    
    page.innerHTML = `
      ${this.createModuleHeader()}
      ${this.createLessonsSection()}
      ${this.createModuleNavigation()}
    `;

    return page;
  }

  private createModuleHeader(): string {
    const { module, progress = 0 } = this.props;
    const completedLessons = this.getCompletedLessonsCount();
    
    return `
      <section class="module-header" id="module-header">
        <div class="container">
          <div class="module-header__content">
            <div class="module-header__meta">
              <span class="module-header__order">Module ${module.order}</span>
              ${this.createComplexityBadge(module.complexity)}
            </div>
            
            <h1 class="module-header__title">${module.title}</h1>
            <p class="module-header__description">${module.description}</p>
            
            <div class="module-header__stats">
              <div class="module-header__stat">
                <span class="module-header__stat-icon">⏱️</span>
                <span class="module-header__stat-text">${module.estimatedTime}</span>
                <span class="module-header__stat-label">Estimated Time</span>
              </div>
              <div class="module-header__stat">
                <span class="module-header__stat-icon">📚</span>
                <span class="module-header__stat-text">${module.lessons.length}</span>
                <span class="module-header__stat-label">Lessons</span>
              </div>
              <div class="module-header__stat">
                <span class="module-header__stat-icon">✅</span>
                <span class="module-header__stat-text">${completedLessons}/${module.lessons.length}</span>
                <span class="module-header__stat-label">Completed</span>
              </div>
            </div>
            
            ${progress > 0 ? this.createProgressIndicator(progress) : ''}
            
            ${module.prerequisites.length > 0 ? this.createPrerequisites(module.prerequisites) : ''}
          </div>
        </div>
      </section>
    `;
  }

  private createLessonsSection(): string {
    return `
      <section class="module-lessons" id="module-lessons">
        <div class="container">
          <div class="module-lessons__header">
            <h2>Lessons in This Module</h2>
            <p class="module-lessons__description">
              Complete these lessons in order to master the concepts in this module.
            </p>
          </div>
          <div class="module-lessons__grid" id="lessons-grid">
            <!-- Lesson cards will be inserted here -->
          </div>
        </div>
      </section>
    `;
  }

  private createModuleNavigation(): string {
    const previousModule = this.getPreviousModule();
    const nextModule = this.getNextModule();
    
    return `
      <section class="module-navigation" id="module-navigation">
        <div class="container">
          <div class="module-navigation__content">
            ${previousModule ? `
              <div class="module-nav-item module-nav-item--previous">
                <button 
                  class="module-nav-button" 
                  data-module-id="${previousModule.id}"
                  aria-label="Go to previous module: ${previousModule.title}"
                >
                  <div class="module-nav-button__icon">←</div>
                  <div class="module-nav-button__content">
                    <span class="module-nav-button__label">Previous Module</span>
                    <span class="module-nav-button__title">${previousModule.title}</span>
                  </div>
                </button>
              </div>
            ` : '<div class="module-nav-item"></div>'}
            
            <div class="module-nav-item module-nav-item--center">
              <a href="/" class="btn btn-secondary">
                <span>Back to Overview</span>
              </a>
            </div>
            
            ${nextModule ? `
              <div class="module-nav-item module-nav-item--next">
                <button 
                  class="module-nav-button" 
                  data-module-id="${nextModule.id}"
                  aria-label="Go to next module: ${nextModule.title}"
                >
                  <div class="module-nav-button__content">
                    <span class="module-nav-button__label">Next Module</span>
                    <span class="module-nav-button__title">${nextModule.title}</span>
                  </div>
                  <div class="module-nav-button__icon">→</div>
                </button>
              </div>
            ` : '<div class="module-nav-item"></div>'}
          </div>
        </div>
      </section>
    `;
  }

  private createComplexityBadge(complexity: string): string {
    const complexityClass = `complexity-${complexity.toLowerCase()}`;
    return `<span class="module-header__complexity badge ${complexityClass}">${complexity}</span>`;
  }

  private createProgressIndicator(progress: number): string {
    return `
      <div class="module-header__progress">
        <div class="module-header__progress-info">
          <span class="module-header__progress-label">Module Progress</span>
          <span class="module-header__progress-percentage">${Math.round(progress)}%</span>
        </div>
        <div class="module-header__progress-bar">
          <div class="module-header__progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
  }

  private createPrerequisites(prerequisites: string[]): string {
    return `
      <div class="module-header__prerequisites">
        <h3 class="module-header__prerequisites-title">Prerequisites</h3>
        <ul class="module-header__prerequisites-list">
          ${prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  private initializeLessonCards(): void {
    const lessonsGrid = this.element.querySelector('#lessons-grid');
    if (!lessonsGrid) return;

    this.props.module.lessons.forEach((lesson) => {
      const lessonProgress = this.props.lessonProgress?.get(lesson.id) || 0;
      
      const lessonCard = new LessonCard({
        lesson,
        progress: lessonProgress,
        onClick: (clickedLesson) => {
          this.handleLessonClick(clickedLesson);
        }
      });
      
      lessonsGrid.appendChild(lessonCard.getElement());
    });
  }

  private initializeModuleNavigation(): void {
    const navButtons = this.element.querySelectorAll('.module-nav-button');
    
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const moduleId = parseInt((e.currentTarget as HTMLElement).getAttribute('data-module-id') || '0');
        if (moduleId && this.props.onModuleNavigation) {
          this.props.onModuleNavigation(moduleId);
        }
      });

      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).click();
        }
      });
    });
  }

  private handleLessonClick(lesson: Lesson): void {
    // Update navigation to show current lesson
    this.navigation.updateProps({
      modules: this.props.allModules,
      currentModule: this.props.module.id,
      currentLesson: lesson.id
    });
    
    if (this.props.onLessonClick) {
      this.props.onLessonClick(lesson);
    }
  }

  private getPreviousModule(): Module | null {
    const currentOrder = this.props.module.order;
    return this.props.allModules.find(m => m.order === currentOrder - 1) || null;
  }

  private getNextModule(): Module | null {
    const currentOrder = this.props.module.order;
    return this.props.allModules.find(m => m.order === currentOrder + 1) || null;
  }

  private getCompletedLessonsCount(): number {
    if (!this.props.lessonProgress) return 0;
    
    return this.props.module.lessons.filter(lesson => {
      const progress = this.props.lessonProgress?.get(lesson.id) || 0;
      return progress === 100;
    }).length;
  }

  // Public methods for updating the module page
  public updateProgress(moduleProgress: number, lessonProgress?: Map<number, number>): void {
    this.props.progress = moduleProgress;
    this.props.lessonProgress = lessonProgress;
    
    // Update progress indicator
    const progressElement = this.element.querySelector('.module-header__progress-fill') as HTMLElement;
    const progressText = this.element.querySelector('.module-header__progress-percentage') as HTMLElement;
    
    if (progressElement && progressText) {
      progressElement.style.width = `${moduleProgress}%`;
      progressText.textContent = `${Math.round(moduleProgress)}%`;
    }
    
    // Update completed lessons count
    const completedCount = this.getCompletedLessonsCount();
    const completedStat = this.element.querySelector('.module-header__stat:nth-child(3) .module-header__stat-text');
    if (completedStat) {
      completedStat.textContent = `${completedCount}/${this.props.module.lessons.length}`;
    }
    
    // Update individual lesson cards
    if (lessonProgress) {
      this.props.module.lessons.forEach(lesson => {
        const progress = lessonProgress.get(lesson.id) || 0;
        const lessonCard = this.element.querySelector(`[data-lesson-id="${lesson.id}"]`);
        // Note: This would require adding data attributes to lesson cards
        // For now, we'll re-render the lesson cards if needed
      });
    }
  }

  public updateProps(newProps: Partial<ModulePageProps>): void {
    this.props = { ...this.props, ...newProps };
    
    // Re-render if module changed
    if (newProps.module) {
      const lessonsGrid = this.element.querySelector('#lessons-grid');
      if (lessonsGrid) {
        lessonsGrid.innerHTML = '';
        this.initializeLessonCards();
      }
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public destroy(): void {
    this.navigation.destroy();
    this.element.remove();
  }
}