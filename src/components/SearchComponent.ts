import { SearchEngine, SearchResult, SearchFilters } from '../utils/searchEngine.js';
import { Module } from '../data/types/index.js';
import { accessibilityManager, FocusManager } from '../utils/accessibility.js';

export interface SearchComponentProps {
  modules: Module[];
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export class SearchComponent {
  private element: HTMLElement;
  private searchEngine: SearchEngine;
  private props: SearchComponentProps;
  private currentQuery = '';
  private currentFilters: SearchFilters = {};
  private isResultsVisible = false;
  private selectedResultIndex = -1;
  private debounceTimer?: number;

  constructor(container: HTMLElement, props: SearchComponentProps) {
    this.props = props;
    this.searchEngine = new SearchEngine(props.modules);
    this.element = this.createElement();
    container.appendChild(this.element);
    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-component';
    searchContainer.setAttribute('role', 'search');
    
    searchContainer.innerHTML = `
      <div class="search-input-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <input 
            type="text" 
            class="search-input"
            placeholder="${this.props.placeholder || 'Search modules and lessons...'}"
            aria-label="Search modules and lessons"
            aria-describedby="search-instructions"
            aria-expanded="false"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="search-clear" aria-label="Clear search" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div id="search-instructions" class="sr-only">
          Use arrow keys to navigate results, Enter to select, Escape to close
        </div>
      </div>

      ${this.props.showFilters ? this.renderFilters() : ''}

      <div class="search-results" role="listbox" aria-label="Search results" style="display: none;">
        <div class="search-results-content"></div>
      </div>

      <div class="search-suggestions" style="display: none;">
        <div class="search-suggestions-content"></div>
      </div>
    `;

    return searchContainer;
  }

  private renderFilters(): string {
    const availableFilters = this.searchEngine.getAvailableFilters();
    
    return `
      <div class="search-filters">
        <button class="search-filters-toggle" aria-expanded="false" aria-controls="search-filters-content">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
          </svg>
          <span>Filters</span>
          <span class="filter-count" style="display: none;"></span>
        </button>
        
        <div class="search-filters-content" id="search-filters-content" style="display: none;">
          <div class="filter-group">
            <h3 class="filter-group-title">Complexity Level</h3>
            <div class="filter-options" role="group" aria-labelledby="complexity-filter-title">
              ${availableFilters.complexities.map(complexity => `
                <label class="filter-option">
                  <input 
                    type="checkbox" 
                    name="complexity" 
                    value="${complexity}"
                    aria-describedby="complexity-${complexity.toLowerCase()}-desc"
                  />
                  <span class="filter-option-text">${complexity}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="filter-group">
            <h3 class="filter-group-title">Tools Required</h3>
            <div class="filter-options" role="group" aria-labelledby="tools-filter-title">
              ${availableFilters.tools.map(tool => `
                <label class="filter-option">
                  <input 
                    type="checkbox" 
                    name="tools" 
                    value="${tool}"
                    aria-describedby="tool-${tool.toLowerCase().replace(/\s+/g, '-')}-desc"
                  />
                  <span class="filter-option-text">${tool}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="filter-actions">
            <button class="filter-clear" type="button">Clear All</button>
            <button class="filter-apply" type="button">Apply Filters</button>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const searchInput = this.element.querySelector('.search-input') as HTMLInputElement;
    const clearButton = this.element.querySelector('.search-clear') as HTMLButtonElement;
    const resultsContainer = this.element.querySelector('.search-results') as HTMLElement;

    // Search input events
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.handleSearchInput(query);
    });

    searchInput.addEventListener('keydown', (e) => {
      this.handleSearchKeydown(e);
    });

    searchInput.addEventListener('focus', () => {
      if (this.currentQuery) {
        this.showResults();
      } else {
        this.showSuggestions();
      }
    });

    // Clear button
    clearButton.addEventListener('click', () => {
      this.clearSearch();
      searchInput.focus();
    });

    // Filter events
    if (this.props.showFilters) {
      this.setupFilterEvents();
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target as Node)) {
        this.hideResults();
        this.hideSuggestions();
      }
    });

    // Results container events
    resultsContainer.addEventListener('click', (e) => {
      const resultItem = (e.target as Element).closest('.search-result-item') as HTMLElement;
      if (resultItem) {
        const index = parseInt(resultItem.dataset.index || '0');
        this.selectResult(index);
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isResultsVisible) {
        this.hideResults();
        this.hideSuggestions();
        searchInput.focus();
      }
    });
  }

  private setupFilterEvents(): void {
    const filtersToggle = this.element.querySelector('.search-filters-toggle') as HTMLButtonElement;
    const filtersContent = this.element.querySelector('.search-filters-content') as HTMLElement;
    const clearFilters = this.element.querySelector('.filter-clear') as HTMLButtonElement;
    const applyFilters = this.element.querySelector('.filter-apply') as HTMLButtonElement;

    filtersToggle?.addEventListener('click', () => {
      const isOpen = filtersToggle.getAttribute('aria-expanded') === 'true';
      this.toggleFilters(!isOpen);
    });

    clearFilters?.addEventListener('click', () => {
      this.clearFilters();
    });

    applyFilters?.addEventListener('click', () => {
      this.applyFilters();
      this.toggleFilters(false);
    });

    // Filter checkbox events
    const filterInputs = this.element.querySelectorAll('.filter-option input') as NodeListOf<HTMLInputElement>;
    filterInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateFilterCount();
      });
    });
  }

  private handleSearchInput(query: string): void {
    this.currentQuery = query;
    
    // Show/hide clear button
    const clearButton = this.element.querySelector('.search-clear') as HTMLElement;
    clearButton.style.display = query ? 'flex' : 'none';

    // Update input aria-expanded
    const searchInput = this.element.querySelector('.search-input') as HTMLInputElement;
    searchInput.setAttribute('aria-expanded', query ? 'true' : 'false');

    // Debounce search
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      if (query.trim()) {
        this.performSearch(query);
      } else {
        this.hideResults();
        this.showSuggestions();
      }
    }, 300);
  }

  private handleSearchKeydown(e: KeyboardEvent): void {
    const resultsContainer = this.element.querySelector('.search-results') as HTMLElement;
    const resultItems = resultsContainer.querySelectorAll('.search-result-item') as NodeListOf<HTMLElement>;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (this.isResultsVisible && resultItems.length > 0) {
          this.selectedResultIndex = Math.min(this.selectedResultIndex + 1, resultItems.length - 1);
          this.updateResultSelection();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this.isResultsVisible && resultItems.length > 0) {
          this.selectedResultIndex = Math.max(this.selectedResultIndex - 1, -1);
          this.updateResultSelection();
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (this.selectedResultIndex >= 0 && resultItems.length > 0) {
          this.selectResult(this.selectedResultIndex);
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.hideResults();
        this.hideSuggestions();
        break;
    }
  }

  private performSearch(query: string): void {
    const results = this.searchEngine.search(query, this.currentFilters);
    this.displayResults(results);
    
    // Announce results count
    const count = results.length;
    const message = count === 0 
      ? 'No results found' 
      : `${count} result${count !== 1 ? 's' : ''} found`;
    accessibilityManager.announce(message, 'polite');
  }

  private displayResults(results: SearchResult[]): void {
    const resultsContainer = this.element.querySelector('.search-results') as HTMLElement;
    const resultsContent = this.element.querySelector('.search-results-content') as HTMLElement;

    if (results.length === 0) {
      resultsContent.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${this.currentQuery}"</p>
          <p class="search-no-results-suggestion">Try adjusting your search terms or filters</p>
        </div>
      `;
    } else {
      resultsContent.innerHTML = results.map((result, index) => `
        <div class="search-result-item" data-index="${index}" role="option" tabindex="-1">
          <div class="search-result-header">
            <h3 class="search-result-title">
              <span class="search-result-type">${result.type === 'module' ? '📚' : '📄'}</span>
              ${this.highlightText(result.title, this.currentQuery)}
            </h3>
            <div class="search-result-meta">
              <span class="badge badge-${result.complexity.toLowerCase()}">${result.complexity}</span>
              <span class="search-result-time">${result.estimatedTime}</span>
            </div>
          </div>
          
          <p class="search-result-description">
            ${result.moduleTitle ? `<span class="search-result-module">${result.moduleTitle} › </span>` : ''}
            ${this.highlightText(result.description, this.currentQuery)}
          </p>
          
          ${result.tools.length > 0 ? `
            <div class="search-result-tools">
              <span class="search-result-tools-label">Tools:</span>
              ${result.tools.map(tool => `<span class="search-result-tool">${tool}</span>`).join('')}
            </div>
          ` : ''}
          
          ${result.highlights.length > 0 ? `
            <div class="search-result-highlights">
              ${result.highlights.slice(0, 2).map(highlight => `
                <p class="search-result-highlight">${highlight}</p>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    }

    this.showResults();
    this.selectedResultIndex = -1;
  }

  private highlightText(text: string, query: string): string {
    if (!query.trim()) return text;
    
    const terms = query.toLowerCase().split(/\s+/);
    let highlighted = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
  }

  private showResults(): void {
    const resultsContainer = this.element.querySelector('.search-results') as HTMLElement;
    resultsContainer.style.display = 'block';
    this.isResultsVisible = true;
    this.hideSuggestions();
  }

  private hideResults(): void {
    const resultsContainer = this.element.querySelector('.search-results') as HTMLElement;
    resultsContainer.style.display = 'none';
    this.isResultsVisible = false;
    this.selectedResultIndex = -1;
  }

  private showSuggestions(): void {
    const suggestions = this.searchEngine.getSuggestions('');
    if (suggestions.length === 0) return;

    const suggestionsContainer = this.element.querySelector('.search-suggestions') as HTMLElement;
    const suggestionsContent = this.element.querySelector('.search-suggestions-content') as HTMLElement;

    suggestionsContent.innerHTML = `
      <div class="search-suggestions-header">
        <h3>Popular searches</h3>
      </div>
      <div class="search-suggestions-list">
        ${suggestions.map(suggestion => `
          <button class="search-suggestion-item" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            ${suggestion}
          </button>
        `).join('')}
      </div>
    `;

    // Add click events to suggestions
    const suggestionItems = suggestionsContent.querySelectorAll('.search-suggestion-item') as NodeListOf<HTMLButtonElement>;
    suggestionItems.forEach(item => {
      item.addEventListener('click', () => {
        const searchInput = this.element.querySelector('.search-input') as HTMLInputElement;
        searchInput.value = item.textContent?.trim() || '';
        this.handleSearchInput(searchInput.value);
      });
    });

    suggestionsContainer.style.display = 'block';
  }

  private hideSuggestions(): void {
    const suggestionsContainer = this.element.querySelector('.search-suggestions') as HTMLElement;
    suggestionsContainer.style.display = 'none';
  }

  private updateResultSelection(): void {
    const resultItems = this.element.querySelectorAll('.search-result-item') as NodeListOf<HTMLElement>;
    
    resultItems.forEach((item, index) => {
      if (index === this.selectedResultIndex) {
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  private selectResult(index: number): void {
    const resultsContent = this.element.querySelector('.search-results-content') as HTMLElement;
    const resultItems = resultsContent.querySelectorAll('.search-result-item') as NodeListOf<HTMLElement>;
    
    if (index >= 0 && index < resultItems.length) {
      const resultElement = resultItems[index];
      const resultIndex = parseInt(resultElement.dataset.index || '0');
      
      // Get the actual result data
      const results = this.searchEngine.search(this.currentQuery, this.currentFilters);
      const result = results[resultIndex];
      
      if (result) {
        // Call the callback if provided
        if (this.props.onResultSelect) {
          this.props.onResultSelect(result);
        } else {
          // Default behavior: navigate to the result
          window.location.href = result.url;
        }
        
        this.hideResults();
        accessibilityManager.announce(`Selected ${result.title}`, 'polite');
      }
    }
  }

  private toggleFilters(show: boolean): void {
    const filtersToggle = this.element.querySelector('.search-filters-toggle') as HTMLButtonElement;
    const filtersContent = this.element.querySelector('.search-filters-content') as HTMLElement;
    
    filtersToggle.setAttribute('aria-expanded', show.toString());
    filtersContent.style.display = show ? 'block' : 'none';
    
    if (show) {
      // Focus first filter input
      const firstInput = filtersContent.querySelector('input') as HTMLInputElement;
      firstInput?.focus();
    }
  }

  private clearFilters(): void {
    const filterInputs = this.element.querySelectorAll('.filter-option input') as NodeListOf<HTMLInputElement>;
    filterInputs.forEach(input => {
      input.checked = false;
    });
    
    this.currentFilters = {};
    this.updateFilterCount();
    
    // Re-run search if there's a query
    if (this.currentQuery) {
      this.performSearch(this.currentQuery);
    }
  }

  private applyFilters(): void {
    const complexityInputs = this.element.querySelectorAll('input[name="complexity"]:checked') as NodeListOf<HTMLInputElement>;
    const toolInputs = this.element.querySelectorAll('input[name="tools"]:checked') as NodeListOf<HTMLInputElement>;
    
    this.currentFilters = {
      complexity: Array.from(complexityInputs).map(input => input.value),
      tools: Array.from(toolInputs).map(input => input.value)
    };
    
    // Re-run search if there's a query
    if (this.currentQuery) {
      this.performSearch(this.currentQuery);
    }
  }

  private updateFilterCount(): void {
    const filterCount = this.element.querySelector('.filter-count') as HTMLElement;
    const checkedInputs = this.element.querySelectorAll('.filter-option input:checked') as NodeListOf<HTMLInputElement>;
    const count = checkedInputs.length;
    
    if (count > 0) {
      filterCount.textContent = count.toString();
      filterCount.style.display = 'inline';
    } else {
      filterCount.style.display = 'none';
    }
  }

  private clearSearch(): void {
    const searchInput = this.element.querySelector('.search-input') as HTMLInputElement;
    const clearButton = this.element.querySelector('.search-clear') as HTMLElement;
    
    searchInput.value = '';
    clearButton.style.display = 'none';
    this.currentQuery = '';
    this.hideResults();
    this.showSuggestions();
    
    searchInput.setAttribute('aria-expanded', 'false');
    accessibilityManager.announce('Search cleared', 'polite');
  }

  // Public methods
  public updateModules(modules: Module[]): void {
    this.props.modules = modules;
    this.searchEngine.updateIndex(modules);
  }

  public focus(): void {
    const searchInput = this.element.querySelector('.search-input') as HTMLInputElement;
    searchInput.focus();
  }

  public destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.element.remove();
  }
}