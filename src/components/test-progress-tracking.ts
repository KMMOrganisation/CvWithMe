/**
 * Progress Tracking Test Component
 * 
 * Demonstrates and tests the progress tracking and navigation state management
 */

import { progressNavigationManager } from '../utils/progressNavigationManager.js';
import { createModuleProgress, createOverallProgress } from './ProgressIndicator.js';

export function createProgressTrackingTest(): void {
  const app = document.querySelector('#app');
  if (!app) return;

  // Clear existing content
  app.innerHTML = '';

  // Create test container
  const container = document.createElement('div');
  container.className = 'progress-test-container';
  container.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;

  container.innerHTML = `
    <h1>Progress Tracking & Navigation Test</h1>
    <p>This page demonstrates the progress tracking and URL-based navigation state management.</p>
    
    <div class="test-section">
      <h2>Overall Progress</h2>
      <div id="overall-progress"></div>
    </div>
    
    <div class="test-section">
      <h2>Module Progress</h2>
      <div id="module-progress"></div>
    </div>
    
    <div class="test-section">
      <h2>Progress Controls</h2>
      <div class="controls">
        <button id="mark-lesson-1">Mark Lesson 1 Complete</button>
        <button id="mark-lesson-2">Mark Lesson 2 Complete</button>
        <button id="mark-lesson-3">Mark Lesson 3 Complete</button>
        <button id="clear-progress">Clear All Progress</button>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Navigation Controls</h2>
      <div class="controls">
        <button id="nav-home">Navigate to Home</button>
        <button id="nav-module-1">Navigate to Module 1</button>
        <button id="nav-lesson-1">Navigate to Lesson 1</button>
        <button id="nav-next">Navigate to Next Lesson</button>
        <button id="nav-prev">Navigate to Previous Lesson</button>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Current State</h2>
      <div id="current-state">
        <pre id="state-display"></pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>URL State</h2>
      <div id="url-state">
        <p>Current URL: <code id="current-url"></code></p>
        <button id="copy-url">Copy Shareable URL</button>
      </div>
    </div>
    
    <style>
      .test-section {
        margin: 2rem 0;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
      }
      
      .test-section h2 {
        margin-top: 0;
        color: #333;
      }
      
      .controls {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .controls button {
        padding: 0.5rem 1rem;
        border: 1px solid #007acc;
        background: #007acc;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      
      .controls button:hover {
        background: #005a9e;
      }
      
      .controls button:disabled {
        background: #ccc;
        border-color: #ccc;
        cursor: not-allowed;
      }
      
      #state-display {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.8rem;
        overflow-x: auto;
      }
      
      #current-url {
        background: #f0f0f0;
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.9rem;
      }
    </style>
  `;

  app.appendChild(container);

  // Initialize progress indicators
  setupProgressIndicators();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup state monitoring
  setupStateMonitoring();
  
  // Initial state update
  updateStateDisplay();
  updateURLDisplay();

  console.log('✅ Progress tracking test initialized');
}

function setupProgressIndicators(): void {
  const overallProgress = progressNavigationManager.getOverallProgress();
  
  // Overall progress indicator
  const overallContainer = document.getElementById('overall-progress');
  if (overallContainer) {
    const overallIndicator = createOverallProgress(
      overallProgress.completedModules,
      overallProgress.totalModules,
      'Course Progress'
    );
    overallIndicator.appendTo(overallContainer);
  }
  
  // Module progress indicators
  const moduleContainer = document.getElementById('module-progress');
  if (moduleContainer) {
    const moduleProgressMap = progressNavigationManager.getAllModuleProgress();
    
    moduleProgressMap.forEach((progress, moduleId) => {
      const moduleDiv = document.createElement('div');
      moduleDiv.style.marginBottom = '1rem';
      
      const moduleIndicator = createModuleProgress(
        progress.completedLessons,
        progress.totalLessons,
        `Module ${moduleId}`
      );
      
      moduleIndicator.appendTo(moduleDiv);
      moduleContainer.appendChild(moduleDiv);
    });
  }
}

function setupEventListeners(): void {
  // Progress control buttons
  document.getElementById('mark-lesson-1')?.addEventListener('click', () => {
    progressNavigationManager.markLessonCompleted(1);
    updateProgressIndicators();
  });
  
  document.getElementById('mark-lesson-2')?.addEventListener('click', () => {
    progressNavigationManager.markLessonCompleted(2);
    updateProgressIndicators();
  });
  
  document.getElementById('mark-lesson-3')?.addEventListener('click', () => {
    progressNavigationManager.markLessonCompleted(3);
    updateProgressIndicators();
  });
  
  document.getElementById('clear-progress')?.addEventListener('click', () => {
    progressNavigationManager.clearProgress();
    updateProgressIndicators();
  });
  
  // Navigation control buttons
  document.getElementById('nav-home')?.addEventListener('click', () => {
    progressNavigationManager.navigateToHome();
  });
  
  document.getElementById('nav-module-1')?.addEventListener('click', () => {
    progressNavigationManager.navigateToModule(1);
  });
  
  document.getElementById('nav-lesson-1')?.addEventListener('click', () => {
    progressNavigationManager.navigateToLesson(1, 1);
  });
  
  document.getElementById('nav-next')?.addEventListener('click', () => {
    const success = progressNavigationManager.navigateToNextLesson();
    if (!success) {
      alert('No next lesson available');
    }
  });
  
  document.getElementById('nav-prev')?.addEventListener('click', () => {
    const success = progressNavigationManager.navigateToPreviousLesson();
    if (!success) {
      alert('No previous lesson available');
    }
  });
  
  // URL controls
  document.getElementById('copy-url')?.addEventListener('click', () => {
    const url = progressNavigationManager.getShareableURL();
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!');
    }).catch(() => {
      alert(`URL: ${url}`);
    });
  });
}

function setupStateMonitoring(): void {
  // Subscribe to progress and navigation changes
  progressNavigationManager.subscribe((event) => {
    console.log('Progress/Navigation event:', event);
    updateStateDisplay();
    updateURLDisplay();
    
    if (event.type === 'progress') {
      updateProgressIndicators();
    }
  });
  
  // Monitor URL changes
  window.addEventListener('popstate', () => {
    updateURLDisplay();
  });
}

function updateProgressIndicators(): void {
  // Clear and recreate progress indicators
  const overallContainer = document.getElementById('overall-progress');
  const moduleContainer = document.getElementById('module-progress');
  
  if (overallContainer) {
    overallContainer.innerHTML = '';
  }
  
  if (moduleContainer) {
    moduleContainer.innerHTML = '';
  }
  
  setupProgressIndicators();
}

function updateStateDisplay(): void {
  const stateDisplay = document.getElementById('state-display');
  if (!stateDisplay) return;
  
  const currentState = progressNavigationManager.getCurrentState();
  const overallProgress = progressNavigationManager.getOverallProgress();
  
  const stateInfo = {
    navigation: currentState.navigation,
    currentModule: currentState.currentModule ? {
      id: currentState.currentModule.id,
      title: currentState.currentModule.title,
      slug: currentState.currentModule.slug
    } : null,
    currentLesson: currentState.currentLesson ? {
      id: currentState.currentLesson.id,
      title: currentState.currentLesson.title,
      slug: currentState.currentLesson.slug
    } : null,
    moduleProgress: currentState.moduleProgress,
    overallProgress,
    completedLessons: Array.from(currentState.progress.completedLessons)
  };
  
  stateDisplay.textContent = JSON.stringify(stateInfo, null, 2);
}

function updateURLDisplay(): void {
  const urlElement = document.getElementById('current-url');
  if (urlElement) {
    urlElement.textContent = window.location.href;
  }
}