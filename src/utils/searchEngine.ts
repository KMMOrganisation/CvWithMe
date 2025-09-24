import { Module, Lesson, ContentBlock } from '../data/types/index.js';

export interface SearchResult {
  type: 'module' | 'lesson';
  id: number;
  title: string;
  description: string;
  url: string;
  moduleTitle?: string;
  complexity: string;
  tools: string[];
  estimatedTime: string;
  highlights: string[];
  score: number;
}

export interface SearchFilters {
  complexity?: string[];
  tools?: string[];
  moduleId?: number;
}

export interface SearchIndex {
  modules: SearchableModule[];
  lessons: SearchableLesson[];
  allTools: string[];
  allComplexities: string[];
}

interface SearchableModule {
  id: number;
  title: string;
  slug: string;
  description: string;
  complexity: string;
  estimatedTime: string;
  searchableText: string;
  tools: string[];
}

interface SearchableLesson {
  id: number;
  moduleId: number;
  moduleTitle: string;
  title: string;
  slug: string;
  description: string;
  complexity: string;
  tools: string[];
  estimatedTime: string;
  searchableText: string;
}

export class SearchEngine {
  private index: SearchIndex;
  private modules: Module[];

  constructor(modules: Module[]) {
    this.modules = modules;
    this.index = this.buildSearchIndex(modules);
  }

  private buildSearchIndex(modules: Module[]): SearchIndex {
    const searchableModules: SearchableModule[] = [];
    const searchableLessons: SearchableLesson[] = [];
    const allTools = new Set<string>();
    const allComplexities = new Set<string>();

    modules.forEach(module => {
      // Add module complexity
      allComplexities.add(module.complexity);

      // Collect all tools from module lessons
      const moduleTools = new Set<string>();
      module.lessons.forEach(lesson => {
        lesson.tools.forEach(tool => {
          allTools.add(tool);
          moduleTools.add(tool);
        });
      });

      // Create searchable module
      const searchableModule: SearchableModule = {
        id: module.id,
        title: module.title,
        slug: module.slug,
        description: module.description,
        complexity: module.complexity,
        estimatedTime: module.estimatedTime,
        tools: Array.from(moduleTools),
        searchableText: this.createModuleSearchText(module)
      };
      searchableModules.push(searchableModule);

      // Create searchable lessons
      module.lessons.forEach(lesson => {
        allComplexities.add(lesson.complexity);
        lesson.tools.forEach(tool => allTools.add(tool));

        const searchableLesson: SearchableLesson = {
          id: lesson.id,
          moduleId: module.id,
          moduleTitle: module.title,
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          complexity: lesson.complexity,
          tools: lesson.tools,
          estimatedTime: lesson.estimatedTime,
          searchableText: this.createLessonSearchText(lesson)
        };
        searchableLessons.push(searchableLesson);
      });
    });

    return {
      modules: searchableModules,
      lessons: searchableLessons,
      allTools: Array.from(allTools).sort(),
      allComplexities: Array.from(allComplexities).sort()
    };
  }

  private createModuleSearchText(module: Module): string {
    const parts = [
      module.title,
      module.description,
      module.complexity,
      ...module.prerequisites,
      ...module.lessons.map(lesson => lesson.title),
      ...module.lessons.map(lesson => lesson.description)
    ];
    return parts.join(' ').toLowerCase();
  }

  private createLessonSearchText(lesson: Lesson): string {
    const contentText = lesson.content
      .filter(block => block.type === 'text' || block.type === 'callout')
      .map(block => this.extractTextFromContent(block.content))
      .join(' ');

    const parts = [
      lesson.title,
      lesson.description,
      lesson.complexity,
      ...lesson.tools,
      ...lesson.prerequisites,
      contentText
    ];
    return parts.join(' ').toLowerCase();
  }

  private extractTextFromContent(content: string): string {
    // Remove HTML tags and markdown formatting
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[#*`_~]/g, '') // Remove markdown formatting
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  }

  public search(query: string, filters: SearchFilters = {}): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/);
    const results: SearchResult[] = [];

    // Search modules
    this.index.modules.forEach(module => {
      if (this.matchesFilters(module, filters)) {
        const score = this.calculateScore(module.searchableText, queryTerms, module.title);
        if (score > 0) {
          const highlights = this.generateHighlights(module.searchableText, queryTerms);
          results.push({
            type: 'module',
            id: module.id,
            title: module.title,
            description: module.description,
            url: `/module/${module.slug}`,
            complexity: module.complexity,
            tools: module.tools,
            estimatedTime: module.estimatedTime,
            highlights,
            score
          });
        }
      }
    });

    // Search lessons
    this.index.lessons.forEach(lesson => {
      if (this.matchesFilters(lesson, filters)) {
        const score = this.calculateScore(lesson.searchableText, queryTerms, lesson.title);
        if (score > 0) {
          const highlights = this.generateHighlights(lesson.searchableText, queryTerms);
          const module = this.modules.find(m => m.id === lesson.moduleId);
          results.push({
            type: 'lesson',
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            url: `/module/${module?.slug}/lesson/${lesson.slug}`,
            moduleTitle: lesson.moduleTitle,
            complexity: lesson.complexity,
            tools: lesson.tools,
            estimatedTime: lesson.estimatedTime,
            highlights,
            score
          });
        }
      }
    });

    // Sort by score (highest first) and return
    return results.sort((a, b) => b.score - a.score);
  }

  private matchesFilters(item: SearchableModule | SearchableLesson, filters: SearchFilters): boolean {
    // Filter by complexity
    if (filters.complexity && filters.complexity.length > 0) {
      if (!filters.complexity.includes(item.complexity)) {
        return false;
      }
    }

    // Filter by tools
    if (filters.tools && filters.tools.length > 0) {
      const hasMatchingTool = filters.tools.some(tool => 
        item.tools.some(itemTool => 
          itemTool.toLowerCase().includes(tool.toLowerCase())
        )
      );
      if (!hasMatchingTool) {
        return false;
      }
    }

    // Filter by module (for lessons)
    if (filters.moduleId && 'moduleId' in item) {
      if (item.moduleId !== filters.moduleId) {
        return false;
      }
    }

    return true;
  }

  private calculateScore(text: string, queryTerms: string[], title: string): number {
    let score = 0;
    const titleLower = title.toLowerCase();

    queryTerms.forEach(term => {
      // Exact title match gets highest score
      if (titleLower === term) {
        score += 100;
      }
      // Title contains term gets high score
      else if (titleLower.includes(term)) {
        score += 50;
      }
      // Text contains term gets base score
      else if (text.includes(term)) {
        score += 10;
        // Bonus for multiple occurrences
        const matches = (text.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(matches - 1, 5) * 2;
      }
    });

    return score;
  }

  private generateHighlights(text: string, queryTerms: string[]): string[] {
    const highlights: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    sentences.forEach(sentence => {
      const hasMatch = queryTerms.some(term => 
        sentence.toLowerCase().includes(term.toLowerCase())
      );
      
      if (hasMatch && highlights.length < 3) {
        let highlighted = sentence.trim();
        queryTerms.forEach(term => {
          const regex = new RegExp(`(${term})`, 'gi');
          highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        highlights.push(highlighted);
      }
    });

    return highlights;
  }

  public getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase();
    const suggestions = new Set<string>();

    // Add module titles that start with or contain the query
    this.index.modules.forEach(module => {
      if (module.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(module.title);
      }
    });

    // Add lesson titles that start with or contain the query
    this.index.lessons.forEach(lesson => {
      if (lesson.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(lesson.title);
      }
    });

    // Add tools that match
    this.index.allTools.forEach(tool => {
      if (tool.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(tool);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  public getAvailableFilters(): { tools: string[], complexities: string[] } {
    return {
      tools: this.index.allTools,
      complexities: this.index.allComplexities
    };
  }

  public updateIndex(modules: Module[]): void {
    this.modules = modules;
    this.index = this.buildSearchIndex(modules);
  }
}