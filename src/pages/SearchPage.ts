import { SearchComponent } from '../components/SearchComponent.js';
import { Module } from '../data/types/index.js';
import { getCurrentModules } from '../data/sampleData.js';

export class SearchPage {
  private element: HTMLElement;
  private searchComponent?: SearchComponent;
  private modules: Module[];

  constructor(container: HTMLElement) {
    this.modules = getCurrentModules();
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupSearchComponent();
  }

  private createElement(): HTMLElement {
    const page = document.createElement('div');
    page.className = 'search-page';
    
    page.innerHTML = `
      <div class="search-page-container">
        <header class="search-page-header">
          <h1 class="search-page-title">Search Course Content</h1>
          <p class="search-page-description">
            Find modules, lessons, and topics across the entire CV tutorial course.
            Use filters to narrow down results by complexity level and required tools.
          </p>
        </header>

        <div class="search-page-content">
          <div class="search-page-search-container" id="search-container">
            <!-- Search component will be inserted here -->
          </div>

          <div class="search-page-stats">
            <div class="search-stats-item">
              <span class="search-stats-number">${this.modules.length}</span>
              <span class="search-stats-label">Modules</span>
            </div>
            <div class="search-stats-item">
              <span class="search-stats-number">${this.getTotalLessons()}</span>
              <span class="search-stats-label">Lessons</span>
            </div>
            <div class="search-stats-item">
              <span class="search-stats-number">${this.getUniqueTools().length}</span>
              <span class="search-stats-label">Tools</span>
            </div>
          </div>

          <div class="search-page-tips">
            <h2 class="search-tips-title">Search Tips</h2>
            <ul class="search-tips-list">
              <li>Use specific terms like "HTML", "CSS", or "VS Code" for better results</li>
              <li>Filter by complexity level to find content matching your skill level</li>
              <li>Search for tools to find lessons that use specific software</li>
              <li>Use keyboard shortcuts: <kbd>Ctrl+K</kbd> (or <kbd>Cmd+K</kbd>) to focus search</li>
              <li>Navigate results with arrow keys and press Enter to select</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    return page;
  }

  private setupSearchComponent(): void {
    const searchContainer = this.element.querySelector('#search-container') as HTMLElement;
    if (searchContainer) {
      this.searchComponent = new SearchComponent(searchContainer, {
        modules: this.modules,
        placeholder: 'Search for modules, lessons, topics...',
        showFilters: true,
        onResultSelect: (result) => {
          // Navigate to the selected result
          window.location.href = result.url;
        }
      });

      // Auto-focus search input
      setTimeout(() => {
        this.searchComponent?.focus();
      }, 100);
    }
  }

  private getTotalLessons(): number {
    return this.modules.reduce((total, module) => total + module.lessons.length, 0);
  }

  private getUniqueTools(): string[] {
    const tools = new Set<string>();
    this.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        lesson.tools.forEach(tool => tools.add(tool));
      });
    });
    return Array.from(tools);
  }

  public updateModules(modules: Module[]): void {
    this.modules = modules;
    if (this.searchComponent) {
      this.searchComponent.updateModules(modules);
    }
    
    // Update stats
    const statsItems = this.element.querySelectorAll('.search-stats-number');
    if (statsItems.length >= 3) {
      (statsItems[0] as HTMLElement).textContent = this.modules.length.toString();
      (statsItems[1] as HTMLElement).textContent = this.getTotalLessons().toString();
      (statsItems[2] as HTMLElement).textContent = this.getUniqueTools().length.toString();
    }
  }

  public destroy(): void {
    if (this.searchComponent) {
      this.searchComponent.destroy();
    }
    this.element.remove();
  }
}