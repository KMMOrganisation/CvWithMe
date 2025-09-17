/**
 * LessonPage Component
 * 
 * Displays individual lesson content using the ContentRenderer component
 */

import { ContentRenderer } from '../components/ContentRenderer.js';
import { Lesson } from '../data/types/index.js';

export interface LessonPageProps {
  lesson: Lesson;
  module?: {
    id: number;
    title: string;
    slug: string;
    totalLessons: number;
  };
  currentLessonIndex?: number;
  onNavigateBack?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onNavigateToModule?: (moduleSlug: string) => void;
}

export class LessonPage {
  private container: HTMLElement;
  private props: LessonPageProps;
  private contentRenderer?: ContentRenderer;

  constructor(container: HTMLElement, props: LessonPageProps) {
    this.container = container;
    this.props = props;
    this.render();
  }

  private render(): void {
    const { lesson, module, currentLessonIndex } = this.props;
    
    this.container.innerHTML = `
      <div class="lesson-page">
        <header class="lesson-header">
          <nav class="lesson-breadcrumb" aria-label="Breadcrumb navigation">
            <ol class="breadcrumb-list">
              <li class="breadcrumb-item">
                <a href="/" class="breadcrumb-link">Home</a>
                <span class="breadcrumb-separator" aria-hidden="true">›</span>
              </li>
              ${module ? `
                <li class="breadcrumb-item">
                  <button class="breadcrumb-link breadcrumb-btn" id="back-to-module" data-module-slug="${module.slug}">
                    ${module.title}
                  </button>
                  <span class="breadcrumb-separator" aria-hidden="true">›</span>
                </li>
              ` : ''}
              <li class="breadcrumb-item">
                <span class="breadcrumb-current" aria-current="page">${lesson.title}</span>
              </li>
            </ol>
          </nav>
          
          <div class="lesson-title-section">
            <h1 class="lesson-title">${lesson.title}</h1>
            <p class="lesson-description">${lesson.description}</p>
          </div>
          
          <div class="lesson-metadata">
            <div class="metadata-item">
              <span class="metadata-label">
                <svg class="metadata-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
                Time:
              </span>
              <span class="metadata-value">${lesson.estimatedTime}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">
                <svg class="metadata-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                </svg>
                Complexity:
              </span>
              <span class="metadata-value badge badge-${lesson.complexity.toLowerCase()}">${lesson.complexity}</span>
            </div>
            ${lesson.tools.length > 0 ? `
              <div class="metadata-item">
                <span class="metadata-label">
                  <svg class="metadata-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293L2.5 6.5l.94.94-.94.94-.94-.94L0 8l1-1 .94.94L3.5 6.379a.5.5 0 0 0 0-.758L1.94 4.06 1 5 0 4l1.5-1.5L3 4l-1 1 .94.94 1.06-1.061C5.34 3.439 6.5 3.16 8 3.16c1.5 0 2.66.279 4 .719L13.06 2.94 14 2l1 1-1.5 1.5L12 6l1-1-.94-.94L10.5 5.621a.5.5 0 0 0 0 .758L12.06 7.94 13 7l1 1-1 1-1.5-1.5-.94.94.94.94L12.5 9.5l-.708.293a1 1 0 0 1-.708.293h-.07a1 1 0 0 0-.815.419L8 13.5l-2.2-3.081a1 1 0 0 0-.815-.419h-.07a1 1 0 0 1-.708-.293L3.5 8.5l-.94-.94.94-.94.94.94L6 6l-1-1-.94.94L2.5 4.379a.5.5 0 0 0 0-.758L4.06 2.06 5 3l1-1L4.5 0.5 3 2 2 1l1.5 1.5L2.44 3.56C1.16 3.96 0 4.24 0 6s1.16 2.04 2.44 2.44L1 10l1 1 1.5-1.5L4.06 10.94 3 12l1 1 1.5-1.5.94.94-.94.94L6 14l1-1-.94-.94L7.5 10.621a.5.5 0 0 0 0-.758L5.94 8.06 5 9 4 8l1.5-1.5.94.94-.94.94L6.5 8.5l.708-.293a1 1 0 0 1 .708-.293h.07a1 1 0 0 0 .815-.419L10.5 4.5l1.06 1.061L12.5 4.5 14 6l-1 1-.94-.94L10.5 7.621a.5.5 0 0 0 0 .758L12.06 9.94 13 9l1 1-1 1-1.5-1.5-.94.94.94.94L10.5 11.5l-.708.293a1 1 0 0 1-.708.293h-.07a1 1 0 0 0-.815.419L8 15.5z"/>
                  </svg>
                  Tools:
                </span>
                <div class="tools-list">
                  ${lesson.tools.map(tool => `<span class="tool-badge">${tool}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${lesson.prerequisites.length > 0 ? `
              <div class="metadata-item">
                <span class="metadata-label">
                  <svg class="metadata-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                  </svg>
                  Prerequisites:
                </span>
                <div class="prerequisites-list">
                  ${lesson.prerequisites.map(prereq => `<span class="prerequisite-badge">${prereq}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${module && typeof currentLessonIndex === 'number' ? `
              <div class="metadata-item">
                <span class="metadata-label">
                  <svg class="metadata-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                  </svg>
                  Progress:
                </span>
                <span class="metadata-value">Lesson ${currentLessonIndex + 1} of ${module.totalLessons}</span>
              </div>
            ` : ''}
          </div>
        </header>

        <main class="lesson-content">
          <div id="lesson-content-renderer" class="lesson-content-container">
            <!-- Content will be rendered here by ContentRenderer -->
          </div>
        </main>

        <footer class="lesson-navigation">
          <button class="nav-btn nav-btn-previous" id="previous-lesson" ${!this.props.onNavigatePrevious ? 'disabled' : ''}>
            <span class="nav-icon">←</span>
            <span class="nav-text">Previous Lesson</span>
          </button>
          
          <div class="lesson-progress">
            <div class="progress-indicator">
              <span class="progress-text">${module ? `${module.title} Progress` : 'Lesson Progress'}</span>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${this.calculateProgressPercentage()}%"></div>
              </div>
              ${module && typeof currentLessonIndex === 'number' ? `
                <span class="progress-fraction">${currentLessonIndex + 1} / ${module.totalLessons}</span>
              ` : ''}
            </div>
          </div>
          
          <button class="nav-btn nav-btn-next" id="next-lesson" ${!this.props.onNavigateNext ? 'disabled' : ''}>
            <span class="nav-text">Next Lesson</span>
            <span class="nav-icon">→</span>
          </button>
        </footer>
      </div>
    `;

    this.setupContentRenderer();
    this.setupEventListeners();
  }

  private setupContentRenderer(): void {
    const contentContainer = this.container.querySelector('#lesson-content-renderer') as HTMLElement;
    if (contentContainer && this.props.lesson.content) {
      this.contentRenderer = new ContentRenderer(contentContainer, {
        content: this.props.lesson.content,
        className: 'lesson-content-blocks'
      });
    }
  }

  private calculateProgressPercentage(): number {
    const { module, currentLessonIndex } = this.props;
    if (module && typeof currentLessonIndex === 'number') {
      return Math.round(((currentLessonIndex + 1) / module.totalLessons) * 100);
    }
    return 100; // Default to 100% if no progress info available
  }

  private setupEventListeners(): void {
    // Back to module navigation
    const backBtn = this.container.querySelector('#back-to-module') as HTMLButtonElement;
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        const moduleSlug = backBtn.getAttribute('data-module-slug');
        if (this.props.onNavigateToModule && moduleSlug) {
          this.props.onNavigateToModule(moduleSlug);
        } else if (this.props.onNavigateBack) {
          this.props.onNavigateBack();
        }
      });
    }

    // Previous lesson navigation
    const prevBtn = this.container.querySelector('#previous-lesson') as HTMLButtonElement;
    if (prevBtn && this.props.onNavigatePrevious) {
      prevBtn.addEventListener('click', this.props.onNavigatePrevious);
    }

    // Next lesson navigation
    const nextBtn = this.container.querySelector('#next-lesson') as HTMLButtonElement;
    if (nextBtn && this.props.onNavigateNext) {
      nextBtn.addEventListener('click', this.props.onNavigateNext);
    }

    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    // Only handle navigation if no input elements are focused
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (this.props.onNavigatePrevious) {
          event.preventDefault();
          this.props.onNavigatePrevious();
        }
        break;
      case 'ArrowRight':
        if (this.props.onNavigateNext) {
          event.preventDefault();
          this.props.onNavigateNext();
        }
        break;
      case 'Escape':
        if (this.props.onNavigateBack) {
          event.preventDefault();
          this.props.onNavigateBack();
        }
        break;
    }
  }

  public updateLesson(newLesson: Lesson): void {
    this.props.lesson = newLesson;
    this.render();
  }

  public destroy(): void {
    this.contentRenderer?.destroy();
    document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }
}

// Factory function for easier usage
export function createLessonPage(
  container: HTMLElement, 
  props: LessonPageProps
): LessonPage {
  return new LessonPage(container, props);
}