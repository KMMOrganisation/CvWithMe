import { SearchComponent } from './SearchComponent.js';
import { SearchPage } from '../pages/SearchPage.js';
import { getAllModules } from '../data/index.js';

export function createSearchTest(): void {
  const app = document.querySelector('#app') as HTMLElement;
  app.innerHTML = '';

  // Create test container
  const container = document.createElement('div');
  container.className = 'search-test-container';
  container.innerHTML = `
    <div class="search-test-header">
      <h1>Search Functionality Test</h1>
      <p>Testing search and filtering capabilities for modules and lessons</p>
    </div>
    
    <div class="search-test-sections">
      <section class="search-test-section">
        <h2>1. Embedded Search Component</h2>
        <p>Search component integrated into navigation or other pages:</p>
        <div id="embedded-search-container" class="search-test-demo"></div>
      </section>

      <section class="search-test-section">
        <h2>2. Dedicated Search Page</h2>
        <p>Full-featured search page with stats and tips:</p>
        <div id="search-page-container" class="search-test-demo"></div>
      </section>

      <section class="search-test-section">
        <h2>3. Search Features Demo</h2>
        <div class="search-features-grid">
          <div class="search-feature">
            <h3>🔍 Text Search</h3>
            <p>Search through module and lesson titles, descriptions, and content</p>
            <ul>
              <li>Try: "HTML", "CSS", "VS Code"</li>
              <li>Try: "beginner", "setup", "website"</li>
            </ul>
          </div>
          
          <div class="search-feature">
            <h3>🎯 Filtering</h3>
            <p>Filter results by complexity level and required tools</p>
            <ul>
              <li>Complexity: Beginner, Intermediate, Advanced</li>
              <li>Tools: VS Code, Web Browser, etc.</li>
            </ul>
          </div>
          
          <div class="search-feature">
            <h3>💡 Smart Suggestions</h3>
            <p>Auto-complete and search suggestions</p>
            <ul>
              <li>Popular search terms</li>
              <li>Module and lesson titles</li>
              <li>Tool names</li>
            </ul>
          </div>
          
          <div class="search-feature">
            <h3>⌨️ Keyboard Navigation</h3>
            <p>Full keyboard accessibility</p>
            <ul>
              <li>Ctrl+K / Cmd+K to focus search</li>
              <li>Arrow keys to navigate results</li>
              <li>Enter to select, Escape to close</li>
            </ul>
          </div>
          
          <div class="search-feature">
            <h3>🎨 Result Highlighting</h3>
            <p>Visual highlighting of search terms</p>
            <ul>
              <li>Highlighted matches in titles</li>
              <li>Context snippets with highlights</li>
              <li>Relevance-based scoring</li>
            </ul>
          </div>
          
          <div class="search-feature">
            <h3>📱 Mobile Optimized</h3>
            <p>Responsive design for all devices</p>
            <ul>
              <li>Touch-friendly interface</li>
              <li>Full-screen overlays on mobile</li>
              <li>Optimized for small screens</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  `;

  app.appendChild(container);

  // Add test styles
  const style = document.createElement('style');
  style.textContent = `
    .search-test-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-4);
    }

    .search-test-header {
      text-align: center;
      margin-bottom: var(--space-12);
    }

    .search-test-header h1 {
      margin: 0 0 var(--space-4) 0;
      font-size: var(--text-4xl);
      color: var(--gray-900);
    }

    .search-test-header p {
      margin: 0;
      font-size: var(--text-lg);
      color: var(--gray-600);
    }

    .search-test-sections {
      display: flex;
      flex-direction: column;
      gap: var(--space-12);
    }

    .search-test-section {
      background: white;
      padding: var(--space-8);
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .search-test-section h2 {
      margin: 0 0 var(--space-4) 0;
      font-size: var(--text-2xl);
      color: var(--gray-900);
    }

    .search-test-section > p {
      margin: 0 0 var(--space-6) 0;
      color: var(--gray-600);
    }

    .search-test-demo {
      border: 2px dashed var(--gray-300);
      border-radius: 8px;
      padding: var(--space-6);
      background: var(--gray-50);
      min-height: 200px;
    }

    .search-features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-6);
    }

    .search-feature {
      padding: var(--space-6);
      background: var(--gray-50);
      border-radius: 8px;
      border-left: 4px solid var(--primary-500);
    }

    .search-feature h3 {
      margin: 0 0 var(--space-3) 0;
      font-size: var(--text-lg);
      color: var(--gray-900);
    }

    .search-feature p {
      margin: 0 0 var(--space-3) 0;
      color: var(--gray-700);
    }

    .search-feature ul {
      margin: 0;
      padding-left: var(--space-4);
      color: var(--gray-600);
    }

    .search-feature li {
      margin-bottom: var(--space-1);
    }

    @media (max-width: 768px) {
      .search-test-container {
        padding: var(--space-6) var(--space-3);
      }

      .search-test-header h1 {
        font-size: var(--text-3xl);
      }

      .search-features-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize components
  const modules = getAllModules();

  // 1. Embedded Search Component
  const embeddedContainer = document.getElementById('embedded-search-container') as HTMLElement;
  if (embeddedContainer) {
    embeddedContainer.innerHTML = '<p>Embedded search component (as used in navigation):</p>';
    
    const searchWrapper = document.createElement('div');
    searchWrapper.style.maxWidth = '500px';
    searchWrapper.style.margin = 'var(--space-4) 0';
    
    new SearchComponent(searchWrapper, {
      modules,
      placeholder: 'Search modules and lessons...',
      showFilters: true,
      onResultSelect: (result) => {
        alert(`Selected: ${result.title}\nType: ${result.type}\nURL: ${result.url}`);
      }
    });
    
    embeddedContainer.appendChild(searchWrapper);
  }

  // 2. Search Page
  const searchPageContainer = document.getElementById('search-page-container') as HTMLElement;
  if (searchPageContainer) {
    searchPageContainer.innerHTML = '<p>Full search page experience:</p>';
    
    const pageWrapper = document.createElement('div');
    pageWrapper.style.border = '1px solid var(--gray-300)';
    pageWrapper.style.borderRadius = '8px';
    pageWrapper.style.overflow = 'hidden';
    pageWrapper.style.marginTop = 'var(--space-4)';
    
    new SearchPage(pageWrapper);
    searchPageContainer.appendChild(pageWrapper);
  }

  console.log('🔍 Search functionality test initialized');
  console.log('📊 Available search features:');
  console.log('   - Text search across modules and lessons');
  console.log('   - Filtering by complexity and tools');
  console.log('   - Auto-complete suggestions');
  console.log('   - Keyboard navigation (Ctrl+K to focus)');
  console.log('   - Result highlighting');
  console.log('   - Mobile-responsive design');
  console.log('');
  console.log('🧪 Try these searches:');
  console.log('   - "HTML" - Find HTML-related content');
  console.log('   - "VS Code" - Find lessons using VS Code');
  console.log('   - "beginner" - Find beginner-level content');
  console.log('   - "setup" - Find setup and configuration lessons');
}