/**
 * Test suite for UX enhancements including animations, micro-interactions, and visual polish
 */

import { getAllModules } from '../data/index.js';
import { createModuleCard } from './ModuleCard.js';
import { createLessonCard } from './LessonCard.js';
import { animationUtils } from '../utils/animationUtils.js';

function createUXEnhancementsTest(): void {
  const app = document.querySelector('#app') as HTMLElement;
  
  app.innerHTML = `
    <div class="container">
      <header class="header bg-gradient-subtle">
        <h1 class="text-hierarchy-1">UX Enhancements Test Suite</h1>
        <p class="text-body-large">Testing animations, micro-interactions, and visual polish</p>
      </header>

      <main class="main">
        <!-- Animation Tests -->
        <section class="demo-section">
          <h2 class="text-hierarchy-2">Animation Tests</h2>
          
          <div class="test-group">
            <h3 class="text-hierarchy-3">Scroll Reveal Animations</h3>
            <div class="grid grid-cols-3 grid-gap-4">
              <div class="card card-enhanced scroll-reveal" data-delay="0">
                <h4>Reveal 1</h4>
                <p>This card should fade in from bottom when scrolled into view.</p>
              </div>
              <div class="card card-enhanced scroll-reveal" data-delay="100">
                <h4>Reveal 2</h4>
                <p>This card should fade in with a 100ms delay.</p>
              </div>
              <div class="card card-enhanced scroll-reveal" data-delay="200">
                <h4>Reveal 3</h4>
                <p>This card should fade in with a 200ms delay.</p>
              </div>
            </div>
          </div>

          <div class="test-group">
            <h3 class="text-hierarchy-3">Button Animations</h3>
            <div class="button-test-grid">
              <button class="btn btn-primary btn-enhanced">Enhanced Primary</button>
              <button class="btn btn-secondary btn-enhanced">Enhanced Secondary</button>
              <button class="btn btn-outline btn-enhanced">Enhanced Outline</button>
              <button class="btn btn-enhanced-primary">Gradient Primary</button>
              <button class="btn btn-enhanced-secondary">Elevated Secondary</button>
            </div>
          </div>

          <div class="test-group">
            <h3 class="text-hierarchy-3">Progress Animations</h3>
            <div class="progress-test">
              <div class="progress progress-enhanced" id="test-progress-1">
                <div class="progress-bar" style="width: 0%"></div>
              </div>
              <button class="btn btn-primary" onclick="animateTestProgress(1, 75)">
                Animate to 75%
              </button>
            </div>
            <div class="progress-test">
              <div class="progress progress-enhanced" id="test-progress-2">
                <div class="progress-bar" style="width: 0%"></div>
              </div>
              <button class="btn btn-primary" onclick="animateTestProgress(2, 100)">
                Animate to 100%
              </button>
            </div>
          </div>
        </section>

        <!-- Micro-interaction Tests -->
        <section class="demo-section">
          <h2 class="text-hierarchy-2">Micro-interaction Tests</h2>
          
          <div class="test-group">
            <h3 class="text-hierarchy-3">Enhanced Cards</h3>
            <div class="grid grid-cols-2 grid-gap-4">
              <div class="card card-enhanced hover-lift">
                <h4>Hover Lift Card</h4>
                <p>This card should lift up on hover with enhanced shadow.</p>
                <button class="btn btn-primary btn-enhanced">Action Button</button>
              </div>
              <div class="card card-outlined hover-scale">
                <h4>Hover Scale Card</h4>
                <p>This card should scale slightly on hover.</p>
                <button class="btn btn-secondary btn-enhanced">Secondary Action</button>
              </div>
            </div>
          </div>

          <div class="test-group">
            <h3 class="text-hierarchy-3">Interactive Elements</h3>
            <div class="interactive-test-grid">
              <a href="#" class="link-enhanced">Enhanced Link</a>
              <span class="badge badge-enhanced badge-primary">Enhanced Badge</span>
              <div class="tooltip-enhanced" data-tooltip="This is a tooltip">
                Hover for tooltip
              </div>
              <input type="text" class="input-enhanced" placeholder="Enhanced input field">
            </div>
          </div>

          <div class="test-group">
            <h3 class="text-hierarchy-3">Navigation Enhancements</h3>
            <nav class="nav-test">
              <a href="#" class="nav-item-enhanced">Home</a>
              <a href="#" class="nav-item-enhanced active">Current Page</a>
              <a href="#" class="nav-item-enhanced">About</a>
              <a href="#" class="nav-item-enhanced">Contact</a>
            </nav>
          </div>
        </section>

        <!-- Visual Hierarchy Tests -->
        <section class="demo-section">
          <h2 class="text-hierarchy-2">Visual Hierarchy Tests</h2>
          
          <div class="test-group">
            <h3 class="text-hierarchy-3">Typography Hierarchy</h3>
            <div class="typography-test">
              <h1 class="text-hierarchy-1">Hierarchy Level 1</h1>
              <h2 class="text-hierarchy-2">Hierarchy Level 2</h2>
              <h3 class="text-hierarchy-3">Hierarchy Level 3</h3>
              <h4 class="text-hierarchy-4">Hierarchy Level 4</h4>
              <h5 class="text-hierarchy-5">Hierarchy Level 5</h5>
              <p class="text-body-large">Large body text for important content</p>
              <p class="text-body">Regular body text for standard content</p>
              <p class="text-body-small">Small body text for secondary information</p>
              <p class="text-caption">Caption text for metadata</p>
            </div>
          </div>

          <div class="test-group">
            <h3 class="text-hierarchy-3">Color Contrast Tests</h3>
            <div class="contrast-test-grid">
              <div class="status-success">Success Status</div>
              <div class="status-warning">Warning Status</div>
              <div class="status-error">Error Status</div>
              <div class="status-info">Info Status</div>
            </div>
          </div>

          <div class="test-group">
            <h3 class="text-hierarchy-3">Shadow Variations</h3>
            <div class="shadow-test-grid">
              <div class="card shadow-subtle">Subtle Shadow</div>
              <div class="card shadow-moderate">Moderate Shadow</div>
              <div class="card shadow-strong">Strong Shadow</div>
              <div class="card shadow-dramatic">Dramatic Shadow</div>
              <div class="card shadow-colored">Colored Shadow</div>
            </div>
          </div>
        </section>

        <!-- Real Component Tests -->
        <section class="demo-section">
          <h2 class="text-hierarchy-2">Enhanced Component Tests</h2>
          
          <div class="test-group">
            <h3 class="text-hierarchy-3">Module Cards with Enhancements</h3>
            <div class="module-cards-test" id="module-cards-container">
              <!-- Module cards will be inserted here -->
            </div>
          </div>

          <div class="test-group">
            <h3 class="text-hierarchy-3">Lesson Cards with Enhancements</h3>
            <div class="lesson-cards-test" id="lesson-cards-container">
              <!-- Lesson cards will be inserted here -->
            </div>
          </div>
        </section>

        <!-- Loading States Tests -->
        <section class="demo-section">
          <h2 class="text-hierarchy-2">Loading States Tests</h2>
          
          <div class="test-group">
            <h3 class="text-hierarchy-3">Loading Animations</h3>
            <div class="loading-test-grid">
              <div class="loading-test-item">
                <h4>Pulse Loading</h4>
                <div class="card loading-pulse">Loading content...</div>
              </div>
              <div class="loading-test-item">
                <h4>Shimmer Loading</h4>
                <div class="card loading-shimmer">Loading content...</div>
              </div>
              <div class="loading-test-item">
                <h4>Spinner Loading</h4>
                <div class="loading-spinner-container">
                  <div class="loading-spinner">⟳</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- State Feedback Tests -->
        <section class="demo-section">
          <h2 class="text-hierarchy-2">State Feedback Tests</h2>
          
          <div class="test-group">
            <h3 class="text-hierarchy-3">Success and Error States</h3>
            <div class="state-test-grid">
              <button class="btn btn-primary" onclick="showSuccessState(this)">
                Trigger Success Animation
              </button>
              <button class="btn btn-secondary" onclick="showErrorState(this)">
                Trigger Error Animation
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;

  // Add custom styles for the test
  const testStyles = `
    <style>
      .button-test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-4);
        margin-bottom: var(--space-6);
      }

      .progress-test {
        margin-bottom: var(--space-4);
      }

      .progress-test .progress {
        margin-bottom: var(--space-2);
      }

      .interactive-test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--space-4);
        align-items: center;
      }

      .nav-test {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-4);
        background: var(--gray-100);
        border-radius: var(--radius-md);
      }

      .typography-test > * {
        margin-bottom: var(--space-2);
      }

      .contrast-test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--space-4);
      }

      .contrast-test-grid > div {
        padding: var(--space-3);
        border-radius: var(--radius-md);
        text-align: center;
        font-weight: 500;
      }

      .shadow-test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--space-4);
      }

      .shadow-test-grid .card {
        padding: var(--space-4);
        text-align: center;
        background: white;
      }

      .module-cards-test,
      .lesson-cards-test {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-4);
      }

      .loading-test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-4);
      }

      .loading-test-item h4 {
        margin-bottom: var(--space-2);
      }

      .loading-spinner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 60px;
      }

      .loading-spinner {
        font-size: var(--text-2xl);
      }

      .state-test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-4);
      }

      .test-group {
        margin-bottom: var(--space-8);
      }

      .input-enhanced input {
        width: 100%;
        padding: var(--space-3);
        border: 2px solid var(--border-medium);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
      }
    </style>
  `;

  document.head.insertAdjacentHTML('beforeend', testStyles);

  // Initialize real components
  initializeRealComponents();

  // Add global functions for testing
  addTestFunctions();

  // Initialize scroll reveals for test elements
  setTimeout(() => {
    animationUtils.addScrollReveal('.scroll-reveal', { stagger: 100, once: false });
    console.log('✅ UX Enhancements test initialized with all animations and interactions');
  }, 100);
}

function initializeRealComponents(): void {
  const modules = getAllModules();
  
  // Add module cards
  const moduleContainer = document.getElementById('module-cards-container');
  if (moduleContainer && modules.length > 0) {
    modules.slice(0, 2).forEach((module, index) => {
      const moduleCard = createModuleCard({
        module,
        progress: index === 0 ? 60 : 0,
        completedLessons: index === 0 ? 2 : 0,
        onClick: (module) => {
          animationUtils.showSuccess(moduleContainer);
          console.log('Module clicked:', module.title);
        }
      });
      moduleContainer.appendChild(moduleCard.getElement());
    });
  }

  // Add lesson cards
  const lessonContainer = document.getElementById('lesson-cards-container');
  if (lessonContainer && modules.length > 0 && modules[0].lessons.length > 0) {
    modules[0].lessons.slice(0, 3).forEach((lesson, index) => {
      const lessonCard = createLessonCard({
        lesson,
        progress: index === 0 ? 100 : index === 1 ? 45 : 0,
        isCompleted: index === 0,
        onClick: (lesson) => {
          animationUtils.showSuccess(lessonContainer);
          console.log('Lesson clicked:', lesson.title);
        }
      });
      lessonContainer.appendChild(lessonCard.getElement());
    });
  }
}

function addTestFunctions(): void {
  // Add global functions for testing
  (window as any).animateTestProgress = (id: number, targetWidth: number) => {
    animationUtils.animateProgress(`#test-progress-${id}`, targetWidth);
  };

  (window as any).showSuccessState = (button: HTMLElement) => {
    animationUtils.showSuccess(button);
  };

  (window as any).showErrorState = (button: HTMLElement) => {
    animationUtils.showError(button);
  };
}

// Export for use in main.ts
export { createUXEnhancementsTest };