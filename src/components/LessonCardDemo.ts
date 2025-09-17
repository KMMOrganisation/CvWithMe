import { LessonCard } from './LessonCard.js';
import { sampleModules } from '../data/sampleData.js';

/**
 * Demo component to showcase LessonCard functionality
 * This demonstrates various lesson card states and configurations
 */
export class LessonCardDemo {
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="demo-container">
        <h2>Lesson Card Component Demo</h2>
        <p>This demo shows different states and configurations of the LessonCard component.</p>
        
        <section class="demo-section">
          <h3>Basic Lesson Cards</h3>
          <div class="lesson-cards-grid" id="basic-lessons"></div>
        </section>
        
        <section class="demo-section">
          <h3>Lesson Cards with Progress</h3>
          <div class="lesson-cards-grid" id="progress-lessons"></div>
        </section>
        
        <section class="demo-section">
          <h3>Lesson Cards with Prerequisites</h3>
          <div class="lesson-cards-grid" id="prerequisite-lessons"></div>
        </section>
        
        <section class="demo-section">
          <h3>Interactive Demo</h3>
          <div class="demo-controls">
            <button id="update-progress-btn" class="demo-button">Update Progress</button>
            <button id="reset-progress-btn" class="demo-button">Reset Progress</button>
          </div>
          <div class="lesson-cards-grid" id="interactive-lessons"></div>
        </section>
      </div>
    `;

    this.renderBasicLessons();
    this.renderProgressLessons();
    this.renderPrerequisiteLessons();
    this.renderInteractiveLessons();
    this.setupInteractiveControls();
  }

  private renderBasicLessons(): void {
    const container = document.getElementById('basic-lessons');
    if (!container) return;

    // Get sample lessons from the first module
    const lessons = sampleModules[0].lessons.slice(0, 3);
    
    lessons.forEach(lesson => {
      const lessonCard = new LessonCard({
        lesson,
        onClick: (clickedLesson) => {
          console.log('Lesson clicked:', clickedLesson.title);
          alert(`Starting lesson: ${clickedLesson.title}`);
        }
      });
      
      container.appendChild(lessonCard.getElement());
    });
  }

  private renderProgressLessons(): void {
    const container = document.getElementById('progress-lessons');
    if (!container) return;

    // Get sample lessons and add different progress states
    const lessons = sampleModules[1].lessons;
    const progressStates = [25, 75, 100];
    
    lessons.forEach((lesson, index) => {
      const progress = progressStates[index % progressStates.length];
      const lessonCard = new LessonCard({
        lesson,
        progress,
        onClick: (clickedLesson) => {
          console.log('Lesson with progress clicked:', clickedLesson.title);
          alert(`${progress === 100 ? 'Reviewing' : 'Continuing'} lesson: ${clickedLesson.title}`);
        }
      });
      
      container.appendChild(lessonCard.getElement());
    });
  }

  private renderPrerequisiteLessons(): void {
    const container = document.getElementById('prerequisite-lessons');
    if (!container) return;

    // Create lessons with various prerequisite configurations
    const lessonsWithPrereqs = sampleModules[0].lessons.filter(lesson => lesson.prerequisites.length > 0);
    
    lessonsWithPrereqs.forEach(lesson => {
      const lessonCard = new LessonCard({
        lesson,
        onClick: (clickedLesson) => {
          console.log('Lesson with prerequisites clicked:', clickedLesson.title);
          alert(`Prerequisites required for: ${clickedLesson.title}`);
        }
      });
      
      container.appendChild(lessonCard.getElement());
    });
  }

  private renderInteractiveLessons(): void {
    const container = document.getElementById('interactive-lessons');
    if (!container) return;

    // Store lesson cards for interactive demo
    this.interactiveLessonCards = [];

    const lessons = sampleModules[2].lessons.slice(0, 2);
    
    lessons.forEach(lesson => {
      const lessonCard = new LessonCard({
        lesson,
        progress: 0,
        onClick: (clickedLesson) => {
          console.log('Interactive lesson clicked:', clickedLesson.title);
          alert(`Interactive lesson: ${clickedLesson.title}`);
        }
      });
      
      this.interactiveLessonCards.push(lessonCard);
      container.appendChild(lessonCard.getElement());
    });
  }

  private interactiveLessonCards: LessonCard[] = [];

  private setupInteractiveControls(): void {
    const updateBtn = document.getElementById('update-progress-btn');
    const resetBtn = document.getElementById('reset-progress-btn');

    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        this.interactiveLessonCards.forEach((card) => {
          const randomProgress = Math.floor(Math.random() * 101);
          card.updateProgress(randomProgress);
        });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.interactiveLessonCards.forEach(card => {
          card.updateProgress(0);
        });
      });
    }
  }

  public destroy(): void {
    // Clean up all lesson cards
    this.interactiveLessonCards.forEach(card => card.destroy());
    this.container.innerHTML = '';
  }
}

// Factory function for easier demo creation
export function createLessonCardDemo(containerId: string): LessonCardDemo {
  return new LessonCardDemo(containerId);
}

// Auto-initialize if demo container exists
document.addEventListener('DOMContentLoaded', () => {
  const demoContainer = document.getElementById('lesson-card-demo');
  if (demoContainer) {
    createLessonCardDemo('lesson-card-demo');
  }
});