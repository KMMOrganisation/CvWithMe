/**
 * SkeletonLoader Component
 * 
 * Provides skeleton loading states for various content types while actual content loads.
 * Improves perceived performance and user experience during loading.
 */

export interface SkeletonLoaderProps {
  type: 'text' | 'image' | 'video' | 'code' | 'card' | 'module-grid' | 'lesson-grid';
  count?: number;
  className?: string;
}

export class SkeletonLoader {
  private container: HTMLElement;
  private props: SkeletonLoaderProps;

  constructor(container: HTMLElement, props: SkeletonLoaderProps) {
    this.container = container;
    this.props = props;
    this.render();
  }

  private createTextSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-text';
    
    // Create multiple lines with varying widths
    const lines = [100, 85, 92, 78, 95]; // Percentage widths
    lines.forEach((width, index) => {
      const line = document.createElement('div');
      line.className = 'skeleton-line';
      line.style.width = `${width}%`;
      line.style.animationDelay = `${index * 0.1}s`;
      skeleton.appendChild(line);
    });

    return skeleton;
  }

  private createImageSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-image';
    
    const placeholder = document.createElement('div');
    placeholder.className = 'skeleton-placeholder';
    placeholder.innerHTML = '📷';
    
    skeleton.appendChild(placeholder);
    return skeleton;
  }

  private createVideoSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-video';
    
    const placeholder = document.createElement('div');
    placeholder.className = 'skeleton-placeholder';
    placeholder.innerHTML = '🎥';
    
    const controls = document.createElement('div');
    controls.className = 'skeleton-video-controls';
    
    skeleton.appendChild(placeholder);
    skeleton.appendChild(controls);
    return skeleton;
  }

  private createCodeSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-code';
    
    const header = document.createElement('div');
    header.className = 'skeleton-code-header';
    
    const content = document.createElement('div');
    content.className = 'skeleton-code-content';
    
    // Create code-like lines
    const codeLines = [95, 70, 85, 60, 90, 75];
    codeLines.forEach((width, index) => {
      const line = document.createElement('div');
      line.className = 'skeleton-code-line';
      line.style.width = `${width}%`;
      line.style.animationDelay = `${index * 0.15}s`;
      content.appendChild(line);
    });
    
    skeleton.appendChild(header);
    skeleton.appendChild(content);
    return skeleton;
  }

  private createCardSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-card';
    
    const header = document.createElement('div');
    header.className = 'skeleton-card-header';
    
    const title = document.createElement('div');
    title.className = 'skeleton-card-title';
    
    const meta = document.createElement('div');
    meta.className = 'skeleton-card-meta';
    
    const content = document.createElement('div');
    content.className = 'skeleton-card-content';
    
    // Add multiple content lines
    for (let i = 0; i < 3; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton-line';
      line.style.width = `${Math.random() * 30 + 70}%`;
      line.style.animationDelay = `${i * 0.1}s`;
      content.appendChild(line);
    }
    
    skeleton.appendChild(header);
    skeleton.appendChild(title);
    skeleton.appendChild(meta);
    skeleton.appendChild(content);
    return skeleton;
  }

  private createModuleGridSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-module-grid';
    
    const count = this.props.count || 6;
    for (let i = 0; i < count; i++) {
      const cardSkeleton = this.createCardSkeleton();
      cardSkeleton.style.animationDelay = `${i * 0.1}s`;
      skeleton.appendChild(cardSkeleton);
    }
    
    return skeleton;
  }

  private createLessonGridSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-lesson-grid';
    
    const count = this.props.count || 4;
    for (let i = 0; i < count; i++) {
      const cardSkeleton = this.createCardSkeleton();
      cardSkeleton.classList.add('skeleton-lesson-card');
      cardSkeleton.style.animationDelay = `${i * 0.1}s`;
      skeleton.appendChild(cardSkeleton);
    }
    
    return skeleton;
  }

  public render(): void {
    this.container.innerHTML = '';
    
    if (this.props.className) {
      this.container.classList.add(this.props.className);
    }
    
    let skeletonElement: HTMLElement;
    
    switch (this.props.type) {
      case 'text':
        skeletonElement = this.createTextSkeleton();
        break;
      case 'image':
        skeletonElement = this.createImageSkeleton();
        break;
      case 'video':
        skeletonElement = this.createVideoSkeleton();
        break;
      case 'code':
        skeletonElement = this.createCodeSkeleton();
        break;
      case 'card':
        skeletonElement = this.createCardSkeleton();
        break;
      case 'module-grid':
        skeletonElement = this.createModuleGridSkeleton();
        break;
      case 'lesson-grid':
        skeletonElement = this.createLessonGridSkeleton();
        break;
      default:
        skeletonElement = this.createTextSkeleton();
    }
    
    this.container.appendChild(skeletonElement);
  }

  public hide(): void {
    const skeletons = this.container.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => {
      skeleton.classList.add('skeleton-fade-out');
      setTimeout(() => {
        if (skeleton.parentNode) {
          skeleton.parentNode.removeChild(skeleton);
        }
      }, 300);
    });
  }

  public show(): void {
    this.render();
  }
}

// Factory function for easier usage
export function createSkeletonLoader(
  container: HTMLElement,
  props: SkeletonLoaderProps
): SkeletonLoader {
  return new SkeletonLoader(container, props);
}

// Utility function to show skeleton while loading content
export async function withSkeleton<T>(
  container: HTMLElement,
  skeletonType: SkeletonLoaderProps['type'],
  loadingFunction: () => Promise<T>
): Promise<T> {
  const skeleton = new SkeletonLoader(container, { type: skeletonType });
  
  try {
    const result = await loadingFunction();
    skeleton.hide();
    return result;
  } catch (error) {
    skeleton.hide();
    throw error;
  }
}