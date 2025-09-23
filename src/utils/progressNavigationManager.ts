/**
 * Progress Navigation Manager
 * 
 * Integrates progress tracking with navigation state management
 * Provides a unified interface for managing both progress and navigation
 */

import { progressTracker, ProgressState, ModuleProgress } from './progressTracker.js';
import { navigationState, NavigationState } from './navigationState.js';
import { Module, Lesson } from '../data/types/index.js';

export interface ProgressNavigationState {
  navigation: NavigationState;
  progress: ProgressState;
  moduleProgress?: ModuleProgress;
  currentModule?: Module;
  currentLesson?: Lesson;
}

export interface ProgressNavigationEvent {
  type: 'navigation' | 'progress' | 'combined';
  state: ProgressNavigationState;
  previousState?: ProgressNavigationState;
}

export class ProgressNavigationManager {
  private modules: Module[] = [];
  private currentState: ProgressNavigationState;
  private listeners: Set<(event: ProgressNavigationEvent) => void> = new Set();
  private unsubscribeProgress?: () => void;
  private unsubscribeNavigation?: () => void;

  constructor(modules: Module[] = []) {
    this.modules = modules;
    this.currentState = this.buildCurrentState();
    this.setupListeners();
  }

  /**
   * Initialize the manager with modules data
   */
  public initialize(modules: Module[]): void {
    this.modules = modules;
    navigationState.initialize();
    this.updateCurrentState();
  }

  /**
   * Build current state from both systems
   */
  private buildCurrentState(): ProgressNavigationState {
    const navState = navigationState.getCurrentState();
    const progressState = progressTracker.getCurrentState() as ProgressState;
    
    const currentModule = this.findModuleBySlug(navState.moduleSlug);
    const currentLesson = currentModule ? 
      this.findLessonBySlug(currentModule, navState.lessonSlug) : undefined;
    
    const moduleProgress = currentModule ? 
      progressTracker.calculateModuleProgress(
        currentModule.id,
        currentModule.lessons.length,
        currentModule.lessons.map(l => l.id)
      ) : undefined;

    return {
      navigation: navState,
      progress: progressState,
      moduleProgress,
      currentModule,
      currentLesson
    };
  }

  /**
   * Setup listeners for both systems
   */
  private setupListeners(): void {
    // Listen to progress changes
    this.unsubscribeProgress = progressTracker.subscribe((progressState) => {
      const previousState = this.currentState;
      this.currentState = {
        ...this.currentState,
        progress: progressState,
        moduleProgress: this.currentState.currentModule ? 
          progressTracker.calculateModuleProgress(
            this.currentState.currentModule.id,
            this.currentState.currentModule.lessons.length,
            this.currentState.currentModule.lessons.map(l => l.id)
          ) : undefined
      };
      
      this.notifyListeners({
        type: 'progress',
        state: this.currentState,
        previousState
      });
    });

    // Listen to navigation changes
    this.unsubscribeNavigation = navigationState.subscribe(() => {
      const previousState = this.currentState;
      this.updateCurrentState();
      
      // Update progress tracker with current navigation
      if (this.currentState.currentModule) {
        progressTracker.setCurrentState(
          this.currentState.currentModule.id,
          this.currentState.currentLesson?.id
        );
      }
      
      this.notifyListeners({
        type: 'navigation',
        state: this.currentState,
        previousState
      });
    });
  }

  /**
   * Update current state from both systems
   */
  private updateCurrentState(): void {
    this.currentState = this.buildCurrentState();
    
    // Resolve IDs from slugs and update navigation state
    if (this.currentState.currentModule && this.currentState.navigation.moduleSlug) {
      navigationState.setCurrentIds(
        this.currentState.currentModule.id,
        this.currentState.currentLesson?.id
      );
    }
  }

  /**
   * Navigate to home page
   */
  public navigateToHome(): void {
    navigationState.navigateToHome();
  }

  /**
   * Navigate to module page
   */
  public navigateToModule(moduleId: number): void {
    const module = this.modules.find(m => m.id === moduleId);
    if (module) {
      navigationState.navigateToModule(module.slug, module.id);
    }
  }

  /**
   * Navigate to lesson page
   */
  public navigateToLesson(moduleId: number, lessonId: number): void {
    const module = this.modules.find(m => m.id === moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    
    if (module && lesson) {
      navigationState.navigateToLesson(
        module.slug,
        lesson.slug,
        module.id,
        lesson.id
      );
    }
  }

  /**
   * Navigate to next lesson in sequence
   */
  public navigateToNextLesson(): boolean {
    if (!this.currentState.currentLesson || !this.currentState.currentModule) {
      return false;
    }

    const currentModule = this.currentState.currentModule;
    const currentLesson = this.currentState.currentLesson;
    
    // Find next lesson in current module
    const nextLessonInModule = currentModule.lessons.find(
      l => l.order === currentLesson.order + 1
    );
    
    if (nextLessonInModule) {
      this.navigateToLesson(currentModule.id, nextLessonInModule.id);
      return true;
    }
    
    // Find first lesson in next module
    const nextModule = this.modules.find(m => m.order === currentModule.order + 1);
    if (nextModule && nextModule.lessons.length > 0) {
      const firstLesson = nextModule.lessons.find(l => l.order === 1);
      if (firstLesson) {
        this.navigateToLesson(nextModule.id, firstLesson.id);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Navigate to previous lesson in sequence
   */
  public navigateToPreviousLesson(): boolean {
    if (!this.currentState.currentLesson || !this.currentState.currentModule) {
      return false;
    }

    const currentModule = this.currentState.currentModule;
    const currentLesson = this.currentState.currentLesson;
    
    // Find previous lesson in current module
    const prevLessonInModule = currentModule.lessons.find(
      l => l.order === currentLesson.order - 1
    );
    
    if (prevLessonInModule) {
      this.navigateToLesson(currentModule.id, prevLessonInModule.id);
      return true;
    }
    
    // Find last lesson in previous module
    const prevModule = this.modules.find(m => m.order === currentModule.order - 1);
    if (prevModule && prevModule.lessons.length > 0) {
      const lastLesson = prevModule.lessons.reduce((prev, current) => 
        current.order > prev.order ? current : prev
      );
      this.navigateToLesson(prevModule.id, lastLesson.id);
      return true;
    }
    
    return false;
  }

  /**
   * Mark current lesson as completed and optionally navigate to next
   */
  public completeCurrentLesson(navigateToNext = false): boolean {
    if (!this.currentState.currentLesson) {
      return false;
    }
    
    progressTracker.markLessonCompleted(this.currentState.currentLesson.id);
    
    if (navigateToNext) {
      return this.navigateToNextLesson();
    }
    
    return true;
  }

  /**
   * Mark lesson as completed
   */
  public markLessonCompleted(lessonId: number): void {
    progressTracker.markLessonCompleted(lessonId);
  }

  /**
   * Mark lesson as incomplete
   */
  public markLessonIncomplete(lessonId: number): void {
    progressTracker.markLessonIncomplete(lessonId);
  }

  /**
   * Check if lesson is completed
   */
  public isLessonCompleted(lessonId: number): boolean {
    return progressTracker.isLessonCompleted(lessonId);
  }

  /**
   * Get module progress
   */
  public getModuleProgress(moduleId: number): ModuleProgress | undefined {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) return undefined;
    
    return progressTracker.calculateModuleProgress(
      moduleId,
      module.lessons.length,
      module.lessons.map(l => l.id)
    );
  }

  /**
   * Get all module progress
   */
  public getAllModuleProgress(): Map<number, ModuleProgress> {
    const progressMap = new Map<number, ModuleProgress>();
    
    this.modules.forEach(module => {
      const progress = this.getModuleProgress(module.id);
      if (progress) {
        progressMap.set(module.id, progress);
      }
    });
    
    return progressMap;
  }

  /**
   * Get current state
   */
  public getCurrentState(): ProgressNavigationState {
    return { ...this.currentState };
  }

  /**
   * Get shareable URL for current state
   */
  public getShareableURL(): string {
    return navigationState.getShareableURL();
  }

  /**
   * Get overall course progress
   */
  public getOverallProgress(): {
    completedLessons: number;
    totalLessons: number;
    completedModules: number;
    totalModules: number;
    percentage: number;
  } {
    const totalLessons = this.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedLessons = progressTracker.getCompletedLessons().length;
    
    const moduleProgressMap = this.getAllModuleProgress();
    const completedModules = Array.from(moduleProgressMap.values())
      .filter(progress => progress.percentage === 100).length;
    
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    return {
      completedLessons,
      totalLessons,
      completedModules,
      totalModules: this.modules.length,
      percentage
    };
  }

  /**
   * Find module by slug
   */
  private findModuleBySlug(slug?: string): Module | undefined {
    if (!slug) return undefined;
    return this.modules.find(m => m.slug === slug);
  }

  /**
   * Find lesson by slug within a module
   */
  private findLessonBySlug(module: Module, slug?: string): Lesson | undefined {
    if (!slug) return undefined;
    return module.lessons.find(l => l.slug === slug);
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (event: ProgressNavigationEvent) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(event: ProgressNavigationEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Error in progress navigation listener:', error);
      }
    });
  }

  /**
   * Clear all progress
   */
  public clearProgress(): void {
    progressTracker.clearProgress();
  }

  /**
   * Export progress data
   */
  public exportProgress(): string {
    return progressTracker.exportProgress();
  }

  /**
   * Import progress data
   */
  public importProgress(data: string): boolean {
    return progressTracker.importProgress(data);
  }

  /**
   * Cleanup listeners
   */
  public destroy(): void {
    this.unsubscribeProgress?.();
    this.unsubscribeNavigation?.();
    this.listeners.clear();
  }
}

// Create a singleton instance
export const progressNavigationManager = new ProgressNavigationManager();