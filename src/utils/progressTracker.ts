/**
 * Progress Tracking System
 * 
 * Manages lesson and module completion progress using localStorage
 * and URL-based state management for navigation
 */

export interface ProgressState {
  completedLessons: Set<number>;
  currentModule?: number;
  currentLesson?: number;
  lastVisited?: string; // ISO timestamp
}

export interface ModuleProgress {
  moduleId: number;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export class ProgressTracker {
  private static readonly STORAGE_KEY = 'cv-tutorial-progress';

  
  private progressState: ProgressState;
  private listeners: Set<(state: ProgressState) => void> = new Set();

  constructor() {
    this.progressState = this.loadProgressFromStorage();
    this.setupStorageListener();
  }

  /**
   * Load progress from localStorage
   */
  private loadProgressFromStorage(): ProgressState {
    try {
      const stored = localStorage.getItem(ProgressTracker.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          completedLessons: new Set(parsed.completedLessons || []),
          currentModule: parsed.currentModule,
          currentLesson: parsed.currentLesson,
          lastVisited: parsed.lastVisited
        };
      }
    } catch (error) {
      console.warn('Failed to load progress from storage:', error);
    }
    
    return {
      completedLessons: new Set(),
      lastVisited: new Date().toISOString()
    };
  }

  /**
   * Save progress to localStorage
   */
  private saveProgressToStorage(): void {
    try {
      const toSave = {
        completedLessons: Array.from(this.progressState.completedLessons),
        currentModule: this.progressState.currentModule,
        currentLesson: this.progressState.currentLesson,
        lastVisited: new Date().toISOString()
      };
      
      localStorage.setItem(ProgressTracker.STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save progress to storage:', error);
    }
  }

  /**
   * Listen for storage changes from other tabs
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === ProgressTracker.STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.progressState = {
            completedLessons: new Set(parsed.completedLessons || []),
            currentModule: parsed.currentModule,
            currentLesson: parsed.currentLesson,
            lastVisited: parsed.lastVisited
          };
          this.notifyListeners();
        } catch (error) {
          console.warn('Failed to parse storage update:', error);
        }
      }
    });
  }

  /**
   * Mark a lesson as completed
   */
  public markLessonCompleted(lessonId: number): void {
    this.progressState.completedLessons.add(lessonId);
    this.saveProgressToStorage();
    this.notifyListeners();
  }

  /**
   * Mark a lesson as incomplete
   */
  public markLessonIncomplete(lessonId: number): void {
    this.progressState.completedLessons.delete(lessonId);
    this.saveProgressToStorage();
    this.notifyListeners();
  }

  /**
   * Check if a lesson is completed
   */
  public isLessonCompleted(lessonId: number): boolean {
    return this.progressState.completedLessons.has(lessonId);
  }

  /**
   * Get all completed lesson IDs
   */
  public getCompletedLessons(): number[] {
    return Array.from(this.progressState.completedLessons);
  }

  /**
   * Calculate module progress
   */
  public calculateModuleProgress(moduleId: number, totalLessons: number, lessonIds: number[]): ModuleProgress {
    const completedInModule = lessonIds.filter(id => this.isLessonCompleted(id)).length;
    const percentage = totalLessons > 0 ? Math.round((completedInModule / totalLessons) * 100) : 0;
    
    return {
      moduleId,
      completedLessons: completedInModule,
      totalLessons,
      percentage
    };
  }

  /**
   * Set current navigation state
   */
  public setCurrentState(moduleId?: number, lessonId?: number): void {
    this.progressState.currentModule = moduleId;
    this.progressState.currentLesson = lessonId;
    this.saveProgressToStorage();
    this.notifyListeners();
  }

  /**
   * Get current navigation state
   */
  public getCurrentState(): { moduleId?: number; lessonId?: number } {
    return {
      moduleId: this.progressState.currentModule,
      lessonId: this.progressState.currentLesson
    };
  }

  /**
   * Clear all progress (for testing or reset)
   */
  public clearProgress(): void {
    this.progressState = {
      completedLessons: new Set(),
      lastVisited: new Date().toISOString()
    };
    this.saveProgressToStorage();
    this.notifyListeners();
  }

  /**
   * Get progress statistics
   */
  public getProgressStats(): {
    totalCompletedLessons: number;
    lastVisited?: string;
  } {
    return {
      totalCompletedLessons: this.progressState.completedLessons.size,
      lastVisited: this.progressState.lastVisited
    };
  }

  /**
   * Subscribe to progress changes
   */
  public subscribe(listener: (state: ProgressState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.progressState);
      } catch (error) {
        console.warn('Error in progress listener:', error);
      }
    });
  }

  /**
   * Export progress data (for backup/sharing)
   */
  public exportProgress(): string {
    return JSON.stringify({
      completedLessons: Array.from(this.progressState.completedLessons),
      currentModule: this.progressState.currentModule,
      currentLesson: this.progressState.currentLesson,
      lastVisited: this.progressState.lastVisited,
      exportedAt: new Date().toISOString()
    });
  }

  /**
   * Import progress data (for restore/sharing)
   */
  public importProgress(progressData: string): boolean {
    try {
      const parsed = JSON.parse(progressData);
      this.progressState = {
        completedLessons: new Set(parsed.completedLessons || []),
        currentModule: parsed.currentModule,
        currentLesson: parsed.currentLesson,
        lastVisited: parsed.lastVisited || new Date().toISOString()
      };
      this.saveProgressToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.warn('Failed to import progress data:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const progressTracker = new ProgressTracker();