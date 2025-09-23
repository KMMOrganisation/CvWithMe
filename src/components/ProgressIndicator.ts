/**
 * Progress Indicator Component
 * 
 * Displays visual progress bars and completion states for modules and lessons
 */

export interface ProgressIndicatorProps {
  type: 'module' | 'lesson' | 'overall';
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showFraction?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  className?: string;
}

export class ProgressIndicator {
  private element: HTMLElement;
  private props: ProgressIndicatorProps;

  constructor(props: ProgressIndicatorProps) {
    this.props = props;
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = this.getContainerClasses();
    container.setAttribute('role', 'group');
    container.setAttribute('aria-labelledby', `progress-label-${this.generateId()}`);
    
    const percentage = this.calculatePercentage();
    const progressId = this.generateId();
    
    container.innerHTML = `
      ${this.props.label ? `<div class="progress-label" id="progress-label-${progressId}">${this.props.label}</div>` : ''}
      
      <div class="progress-bar-container">
        <div class="progress-bar-track">
          <div 
            class="progress-bar-fill ${this.props.animated ? 'animated' : ''}" 
            style="width: ${percentage}%"
            role="progressbar"
            aria-valuenow="${this.props.current}"
            aria-valuemin="0"
            aria-valuemax="${this.props.total}"
            aria-label="${this.getAriaLabel()}"
            aria-describedby="${this.shouldShowText() ? `progress-text-${progressId}` : ''}"
          ></div>
        </div>
        
        ${this.shouldShowText() ? `
          <div class="progress-text" id="progress-text-${progressId}" aria-live="polite">
            ${this.props.showPercentage ? `<span class="progress-percentage" aria-label="${Math.round(percentage)} percent complete">${Math.round(percentage)}%</span>` : ''}
            ${this.props.showFraction ? `<span class="progress-fraction" aria-label="${this.props.current} of ${this.props.total} completed">${this.props.current}/${this.props.total}</span>` : ''}
          </div>
        ` : ''}
      </div>
      
      ${this.props.type === 'module' ? this.createLessonDots() : ''}
    `;

    return container;
  }

  private getContainerClasses(): string {
    const classes = ['progress-indicator'];
    
    classes.push(`progress-indicator--${this.props.type}`);
    classes.push(`progress-indicator--${this.props.size || 'medium'}`);
    
    if (this.props.className) {
      classes.push(this.props.className);
    }
    
    if (this.calculatePercentage() === 100) {
      classes.push('progress-indicator--complete');
    }
    
    return classes.join(' ');
  }

  private calculatePercentage(): number {
    if (this.props.total === 0) return 0;
    return Math.min(100, Math.max(0, (this.props.current / this.props.total) * 100));
  }

  private shouldShowText(): boolean {
    return Boolean(this.props.showPercentage || this.props.showFraction);
  }

  private getAriaLabel(): string {
    const percentage = Math.round(this.calculatePercentage());
    return `${this.props.label || 'Progress'}: ${percentage}% complete (${this.props.current} of ${this.props.total})`;
  }

  private createLessonDots(): string {
    if (this.props.total <= 1) return '';
    
    const dots = [];
    for (let i = 0; i < this.props.total; i++) {
      const isCompleted = i < this.props.current;
      const isCurrent = i === this.props.current - 1;
      const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'not started';
      
      dots.push(`
        <div class="lesson-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}" 
             role="img"
             aria-label="Lesson ${i + 1}: ${status}"
             title="Lesson ${i + 1} (${status})">
          <span class="lesson-dot-number" aria-hidden="true">${i + 1}</span>
        </div>
      `);
    }
    
    return `
      <div class="lesson-dots" role="group" aria-label="Lesson progress indicators">
        ${dots.join('')}
      </div>
    `;
  }

  /**
   * Update progress values
   */
  public updateProgress(current: number, total?: number): void {
    this.props.current = current;
    if (total !== undefined) {
      this.props.total = total;
    }
    
    this.render();
  }

  /**
   * Set completion state
   */
  public setComplete(): void {
    this.updateProgress(this.props.total);
  }

  /**
   * Reset progress
   */
  public reset(): void {
    this.updateProgress(0);
  }

  /**
   * Re-render the component
   */
  private render(): void {
    const parent = this.element.parentElement;
    if (parent) {
      const newElement = this.createElement();
      parent.replaceChild(newElement, this.element);
      this.element = newElement;
    }
  }

  /**
   * Get the DOM element
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Append to a container
   */
  public appendTo(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  /**
   * Remove from DOM
   */
  public destroy(): void {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }

  /**
   * Get current progress percentage
   */
  public getPercentage(): number {
    return this.calculatePercentage();
  }

  /**
   * Check if progress is complete
   */
  public isComplete(): boolean {
    return this.props.current >= this.props.total;
  }

  /**
   * Generate a unique ID for this progress indicator
   */
  private generateId(): string {
    return `progress-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory functions for common progress indicator types
 */
export function createModuleProgress(
  completedLessons: number, 
  totalLessons: number, 
  label?: string
): ProgressIndicator {
  return new ProgressIndicator({
    type: 'module',
    current: completedLessons,
    total: totalLessons,
    label: label || 'Module Progress',
    showPercentage: true,
    showFraction: true,
    size: 'medium',
    animated: true
  });
}

export function createLessonProgress(
  currentLesson: number, 
  totalLessons: number, 
  label?: string
): ProgressIndicator {
  return new ProgressIndicator({
    type: 'lesson',
    current: currentLesson,
    total: totalLessons,
    label: label || 'Lesson Progress',
    showFraction: true,
    size: 'small',
    animated: false
  });
}

export function createOverallProgress(
  completedModules: number, 
  totalModules: number, 
  label?: string
): ProgressIndicator {
  return new ProgressIndicator({
    type: 'overall',
    current: completedModules,
    total: totalModules,
    label: label || 'Course Progress',
    showPercentage: true,
    size: 'large',
    animated: true
  });
}