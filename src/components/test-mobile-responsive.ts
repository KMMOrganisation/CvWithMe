// Test file for mobile responsive design
import { Navigation } from './Navigation.js';
import { ModuleCard } from './ModuleCard.js';
import { LessonCard } from './LessonCard.js';
import { sampleModules } from '../data/sampleData.js';

// Test mobile responsive behavior
function testMobileResponsive() {
  console.log('Testing mobile responsive design...');
  
  // Create test container
  const testContainer = document.createElement('div');
  testContainer.id = 'mobile-test-container';
  testContainer.innerHTML = `
    <div class="mobile-test-section">
      <h2>Mobile Responsive Test</h2>
      <p>This page tests mobile responsive design features.</p>
      
      <!-- Navigation Test -->
      <div id="nav-test" class="test-section">
        <h3>Navigation Test</h3>
        <div id="navigation-container"></div>
      </div>
      
      <!-- Module Cards Test -->
      <div id="module-cards-test" class="test-section">
        <h3>Module Cards Test</h3>
        <div class="modules__grid" id="module-cards-container"></div>
      </div>
      
      <!-- Lesson Cards Test -->
      <div id="lesson-cards-test" class="test-section">
        <h3>Lesson Cards Test</h3>
        <div class="lesson-cards-grid" id="lesson-cards-container"></div>
      </div>
      
      <!-- Mobile Utilities Test -->
      <div id="utilities-test" class="test-section">
        <h3>Mobile Utilities Test</h3>
        <div class="mobile-utilities-demo">
          <button class="btn btn-primary touch-target">Touch Target Button</button>
          <div class="xs:hidden md:block">Hidden on mobile, visible on desktop</div>
          <div class="mobile-only">Mobile only content</div>
          <div class="tablet-up">Tablet and up content</div>
          <div class="desktop-up">Desktop only content</div>
        </div>
      </div>
      
      <!-- Responsive Images Test -->
      <div id="images-test" class="test-section">
        <h3>Responsive Images Test</h3>
        <div class="content-image">
          <img src="https://via.placeholder.com/800x400/627d98/ffffff?text=Responsive+Image" 
               alt="Test responsive image" 
               class="lazy-loading">
          <div class="content-caption">This image should be responsive and lazy-loaded</div>
        </div>
      </div>
      
      <!-- Touch Feedback Test -->
      <div id="touch-test" class="test-section">
        <h3>Touch Feedback Test</h3>
        <div class="touch-demo">
          <button class="btn btn-secondary touch-feedback">Touch Feedback Button</button>
          <a href="#" class="touch-feedback">Touch Feedback Link</a>
        </div>
      </div>
    </div>
  `;
  
  // Add styles for test
  const testStyles = document.createElement('style');
  testStyles.textContent = `
    .mobile-test-section {
      padding: var(--space-4);
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .test-section {
      margin-bottom: var(--space-8);
      padding: var(--space-4);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: white;
    }
    
    .test-section h3 {
      color: var(--primary-700);
      margin-bottom: var(--space-4);
    }
    
    .mobile-utilities-demo {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      align-items: flex-start;
    }
    
    .touch-demo {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
      .mobile-test-section {
        padding: var(--space-2);
      }
      
      .test-section {
        padding: var(--space-3);
        margin-bottom: var(--space-4);
      }
      
      .touch-demo {
        flex-direction: column;
        gap: var(--space-2);
      }
    }
  `;
  
  document.head.appendChild(testStyles);
  document.body.appendChild(testContainer);
  
  // Test Navigation
  const navContainer = document.getElementById('navigation-container');
  if (navContainer && sampleModules.length > 0) {
    new Navigation(navContainer, {
      modules: sampleModules,
      currentModule: 1,
      currentLesson: undefined
    });
  }
  
  // Test Module Cards
  const moduleCardsContainer = document.getElementById('module-cards-container');
  if (moduleCardsContainer) {
    sampleModules.slice(0, 3).forEach(module => {
      const moduleCard = new ModuleCard({ module });
      moduleCardsContainer.appendChild(moduleCard.getElement());
    });
  }
  
  // Test Lesson Cards
  const lessonCardsContainer = document.getElementById('lesson-cards-container');
  if (lessonCardsContainer && sampleModules[0]?.lessons) {
    sampleModules[0].lessons.slice(0, 3).forEach(lesson => {
      const lessonCard = new LessonCard({ lesson });
      lessonCardsContainer.appendChild(lessonCard.getElement());
    });
  }
  
  // Test lazy loading simulation
  setTimeout(() => {
    const lazyImages = document.querySelectorAll('.lazy-loading');
    lazyImages.forEach(img => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
    });
  }, 2000);
  
  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    document.head.appendChild(viewport);
  }
  
  // Test orientation change handling
  window.addEventListener('orientationchange', () => {
    console.log('Orientation changed, testing responsive adjustments...');
    setTimeout(() => {
      // Force a reflow to test responsive behavior
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
    }, 100);
  });
  
  console.log('Mobile responsive test setup complete!');
  console.log('Test features:');
  console.log('- Responsive navigation with mobile menu');
  console.log('- Touch-friendly card components');
  console.log('- Mobile utility classes');
  console.log('- Responsive images with lazy loading');
  console.log('- Touch feedback on interactive elements');
  console.log('- Orientation change handling');
}

// Auto-run test if this file is loaded directly
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', testMobileResponsive);
}

export { testMobileResponsive };