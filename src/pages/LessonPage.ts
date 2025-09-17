/**
 * LessonPage Component
 * 
 * Displays individual lesson content using the ContentRenderer component
 */

import { ContentRenderer } from '../components/ContentRenderer.js';
import { Lesson } from '../data/types/index.js';

export interface LessonPageProps {
  lesson: Lesson;
  onNavigateBack?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
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
    const { lesson } = this.props;
    
    this.container.innerHTML = `
      <div class="lesson-page">
        <header class="lesson-header">
          <nav class="lesson-breadcrumb">
            <button class="breadcrumb-btn" id="back-to-module">
              ← Back to Module
            </button>
          </nav>
          
          <div class="lesson-title-section">
            <h1 class="lesson-title">${lesson.title}</h1>
            <p class="lesson-description">${lesson.description}</p>
          </div>
          
          <div class="lesson-metadata">
            <div class="metadata-item">
              <span class="metadata-label">Time:</span>
              <span class="metadata-value">${lesson.estimatedTime}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Complexity:</span>
              <span class="metadata-value badge badge-primary">${lesson.complexity}</span>
            </div>
            ${lesson.tools.length > 0 ? `
              <div class="metadata-item">
                <span class="metadata-label">Tools:</span>
                <div class="tools-list">
                  ${lesson.tools.map(tool => `<span class="tool-badge">${tool}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${lesson.prerequisites.length > 0 ? `
              <div class="metadata-item">
                <span class="metadata-label">Prerequisites:</span>
                <div class="prerequisites-list">
                  ${lesson.prerequisites.map(prereq => `<span class="prerequisite-badge">${prereq}</span>`).join('')}
                </div>
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
              <span class="progress-text">Lesson Progress</span>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: 100%"></div>
              </div>
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

  private setupEventListeners(): void {
    // Back to module navigation
    const backBtn = this.container.querySelector('#back-to-module') as HTMLButtonElement;
    if (backBtn && this.props.onNavigateBack) {
      backBtn.addEventListener('click', this.props.onNavigateBack);
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