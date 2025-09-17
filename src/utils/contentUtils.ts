// Re-export utilities for easier importing
export * from './contentParser.js';
export * from './contentValidator.js';

// Additional utility functions for content management
import { Module, Lesson } from '../data/types/index.js';
import { sampleModules } from '../data/sampleData.js';
import { validateModules, ValidationResult } from './contentValidator.js';

/**
 * Content management utilities
 */
export class ContentManager {
  private modules: Module[] = [];
  
  constructor(initialModules: Module[] = []) {
    this.setModules(initialModules);
  }
  
  /**
   * Set modules with validation
   */
  setModules(modules: Module[]): ValidationResult {
    const validation = validateModules(modules);
    
    if (validation.isValid) {
      this.modules = modules;
    }
    
    return validation;
  }
  
  /**
   * Get all modules
   */
  getModules(): Module[] {
    return [...this.modules];
  }
  
  /**
   * Get module by ID
   */
  getModule(id: number): Module | undefined {
    return this.modules.find(module => module.id === id);
  }
  
  /**
   * Get module by slug
   */
  getModuleBySlug(slug: string): Module | undefined {
    return this.modules.find(module => module.slug === slug);
  }
  
  /**
   * Get lesson by ID across all modules
   */
  getLesson(lessonId: number): { module: Module; lesson: Lesson } | undefined {
    for (const module of this.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return { module, lesson };
      }
    }
    return undefined;
  }
  
  /**
   * Get lesson by slug within a specific module
   */
  getLessonBySlug(moduleSlug: string, lessonSlug: string): { module: Module; lesson: Lesson } | undefined {
    const module = this.getModuleBySlug(moduleSlug);
    if (!module) return undefined;
    
    const lesson = module.lessons.find(l => l.slug === lessonSlug);
    if (!lesson) return undefined;
    
    return { module, lesson };
  }
  
  /**
   * Get next lesson in sequence
   */
  getNextLesson(currentLessonId: number): { module: Module; lesson: Lesson } | undefined {
    const current = this.getLesson(currentLessonId);
    if (!current) return undefined;
    
    const { module, lesson } = current;
    
    // Try to find next lesson in same module
    const nextLessonInModule = module.lessons.find(l => l.order === lesson.order + 1);
    if (nextLessonInModule) {
      return { module, lesson: nextLessonInModule };
    }
    
    // Try to find first lesson in next module
    const nextModule = this.modules.find(m => m.order === module.order + 1);
    if (nextModule && nextModule.lessons.length > 0) {
      const firstLesson = nextModule.lessons.find(l => l.order === 1);
      if (firstLesson) {
        return { module: nextModule, lesson: firstLesson };
      }
    }
    
    return undefined;
  }
  
  /**
   * Get previous lesson in sequence
   */
  getPreviousLesson(currentLessonId: number): { module: Module; lesson: Lesson } | undefined {
    const current = this.getLesson(currentLessonId);
    if (!current) return undefined;
    
    const { module, lesson } = current;
    
    // Try to find previous lesson in same module
    const prevLessonInModule = module.lessons.find(l => l.order === lesson.order - 1);
    if (prevLessonInModule) {
      return { module, lesson: prevLessonInModule };
    }
    
    // Try to find last lesson in previous module
    const prevModule = this.modules.find(m => m.order === module.order - 1);
    if (prevModule && prevModule.lessons.length > 0) {
      const lastLesson = prevModule.lessons.reduce((prev, current) => 
        current.order > prev.order ? current : prev
      );
      return { module: prevModule, lesson: lastLesson };
    }
    
    return undefined;
  }
  
  /**
   * Calculate progress for a module based on completed lessons
   */
  calculateModuleProgress(moduleId: number, completedLessonIds: number[]): number {
    const module = this.getModule(moduleId);
    if (!module || module.lessons.length === 0) return 0;
    
    const completedCount = module.lessons.filter(lesson => 
      completedLessonIds.includes(lesson.id)
    ).length;
    
    return Math.round((completedCount / module.lessons.length) * 100);
  }
  
  /**
   * Get module statistics
   */
  getModuleStats(moduleId: number): {
    totalLessons: number;
    estimatedTotalTime: string;
    complexity: string;
    tools: string[];
  } | undefined {
    const module = this.getModule(moduleId);
    if (!module) return undefined;
    
    // Extract unique tools from all lessons
    const allTools = new Set<string>();
    module.lessons.forEach(lesson => {
      lesson.tools.forEach(tool => allTools.add(tool));
    });
    
    return {
      totalLessons: module.lessons.length,
      estimatedTotalTime: module.estimatedTime,
      complexity: module.complexity,
      tools: Array.from(allTools)
    };
  }
}

// Create a default content manager instance with sample data
export const defaultContentManager = new ContentManager(sampleModules);

/**
 * Error handling for content operations
 */
export function handleContentError(error: unknown, context: string): string {
  if (error instanceof Error) {
    console.error(`Content error in ${context}:`, error.message);
    return `Failed to ${context}: ${error.message}`;
  }
  
  console.error(`Unknown error in ${context}:`, error);
  return `An unexpected error occurred while ${context}`;
}

/**
 * Safe content loading with error handling
 */
export async function safeLoadContent<T>(
  loader: () => Promise<T> | T,
  fallback: T,
  context: string
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    console.error(handleContentError(error, context));
    return fallback;
  }
}