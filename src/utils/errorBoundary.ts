/**
 * Error Boundary System
 * 
 * Provides graceful error handling and recovery for the application.
 * Catches errors and displays user-friendly fallback content.
 */

export interface ErrorInfo {
  error: Error;
  errorInfo?: string;
  componentStack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export interface ErrorBoundaryOptions {
  fallbackContent?: string | HTMLElement;
  onError?: (errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  retryText?: string;
  showErrorDetails?: boolean;
}

export class ErrorBoundary {
  private container: HTMLElement;
  private options: ErrorBoundaryOptions;
  private originalContent: string = '';
  private hasError: boolean = false;

  constructor(container: HTMLElement, options: ErrorBoundaryOptions = {}) {
    this.container = container;
    this.options = {
      enableRetry: true,
      retryText: 'Try Again',
      showErrorDetails: false,
      ...options
    };
    
    this.originalContent = container.innerHTML;
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    // Catch JavaScript errors in this container's context
    window.addEventListener('error', (event) => {
      if (this.isErrorInContainer(event.target as Element)) {
        this.handleError(event.error || new Error(event.message));
      }
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(`Unhandled promise rejection: ${event.reason}`));
    });

    // Catch image loading errors
    this.container.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        this.handleMediaError(target);
      }
    }, true);
  }

  private isErrorInContainer(element: Element | null): boolean {
    if (!element) return false;
    return this.container.contains(element);
  }

  private handleError(error: Error): void {
    if (this.hasError) return; // Prevent error loops
    
    this.hasError = true;
    
    const errorInfo: ErrorInfo = {
      error,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Call error callback if provided
    if (this.options.onError) {
      try {
        this.options.onError(errorInfo);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    }

    // Log error for debugging
    console.error('ErrorBoundary caught error:', error);
    
    // Show fallback UI
    this.showErrorFallback(errorInfo);
  }

  private handleMediaError(element: HTMLElement): void {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'media-error-fallback';
    
    const isVideo = element.tagName === 'VIDEO';
    const icon = isVideo ? '🎥' : '📷';
    const type = isVideo ? 'video' : 'image';
    
    errorContainer.innerHTML = `
      <div class="error-icon">${icon}</div>
      <p class="error-message">Failed to load ${type}</p>
      <button class="error-retry-btn" onclick="this.parentElement.previousElementSibling.src = this.parentElement.previousElementSibling.getAttribute('data-src') || this.parentElement.previousElementSibling.src">
        Retry
      </button>
    `;
    
    // Hide the failed element and show fallback
    element.style.display = 'none';
    element.parentNode?.insertBefore(errorContainer, element.nextSibling);
  }

  private showErrorFallback(errorInfo: ErrorInfo): void {
    const fallbackElement = document.createElement('div');
    fallbackElement.className = 'error-boundary-fallback';
    
    if (typeof this.options.fallbackContent === 'string') {
      fallbackElement.innerHTML = this.options.fallbackContent;
    } else if (this.options.fallbackContent instanceof HTMLElement) {
      fallbackElement.appendChild(this.options.fallbackContent.cloneNode(true));
    } else {
      // Default fallback content
      fallbackElement.innerHTML = this.createDefaultFallback(errorInfo);
    }
    
    // Replace container content with fallback
    this.container.innerHTML = '';
    this.container.appendChild(fallbackElement);
  }

  private createDefaultFallback(errorInfo: ErrorInfo): string {
    const showDetails = this.options.showErrorDetails;
    const retryButton = this.options.enableRetry 
      ? `<button class="error-retry-btn" onclick="window.errorBoundaryRetry('${this.container.id}')">
           ${this.options.retryText}
         </button>`
      : '';
    
    const errorDetails = showDetails 
      ? `<details class="error-details">
           <summary>Error Details</summary>
           <pre class="error-stack">${errorInfo.error.stack || errorInfo.error.message}</pre>
           <p class="error-info">
             <strong>Time:</strong> ${errorInfo.timestamp.toLocaleString()}<br>
             <strong>URL:</strong> ${errorInfo.url}
           </p>
         </details>`
      : '';
    
    return `
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Something went wrong</h3>
        <p class="error-message">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>
        ${retryButton}
        ${errorDetails}
      </div>
    `;
  }

  public retry(): void {
    this.hasError = false;
    this.container.innerHTML = this.originalContent;
    
    // Re-initialize any components that were in the container
    const event = new CustomEvent('errorBoundaryRetry', {
      detail: { container: this.container }
    });
    this.container.dispatchEvent(event);
  }

  public reset(): void {
    this.hasError = false;
    this.container.innerHTML = this.originalContent;
  }

  public updateContent(newContent: string): void {
    this.originalContent = newContent;
    if (!this.hasError) {
      this.container.innerHTML = newContent;
    }
  }
}

// Global retry function for error boundaries
declare global {
  interface Window {
    errorBoundaryRetry: (containerId: string) => void;
    errorBoundaries: Map<string, ErrorBoundary>;
  }
}

window.errorBoundaries = new Map();
window.errorBoundaryRetry = (containerId: string) => {
  const errorBoundary = window.errorBoundaries.get(containerId);
  if (errorBoundary) {
    errorBoundary.retry();
  }
};

// Factory function for easier usage
export function createErrorBoundary(
  container: HTMLElement,
  options: ErrorBoundaryOptions = {}
): ErrorBoundary {
  const errorBoundary = new ErrorBoundary(container, options);
  
  // Store in global map for retry functionality
  if (container.id) {
    window.errorBoundaries.set(container.id, errorBoundary);
  }
  
  return errorBoundary;
}

// Utility function to wrap async operations with error handling
export async function withErrorBoundary<T>(
  container: HTMLElement,
  operation: () => Promise<T>,
  options: ErrorBoundaryOptions = {}
): Promise<T | null> {
  const errorBoundary = createErrorBoundary(container, options);
  
  try {
    return await operation();
  } catch (error) {
    errorBoundary['handleError'](error as Error);
    return null;
  }
}

// Network error recovery utilities
export class NetworkErrorHandler {
  private static retryDelays = [1000, 2000, 5000]; // Progressive delays
  
  static async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = this.retryDelays[attempt] || 5000;
          console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
  
  static async loadImageWithFallback(
    src: string, 
    fallbackSrc?: string
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (fallbackSrc && src !== fallbackSrc) {
          // Try fallback
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => reject(new Error('Both primary and fallback images failed to load'));
          fallbackImg.src = fallbackSrc;
        } else {
          reject(new Error('Image failed to load'));
        }
      };
      
      img.src = src;
    });
  }
}

// Performance monitoring for error tracking
export class PerformanceMonitor {
  private static errorCounts = new Map<string, number>();
  // Performance entries for monitoring (unused for now)
  // private static performanceEntries: PerformanceEntry[] = [];
  
  static trackError(error: Error, context?: string): void {
    const key = `${error.name}: ${error.message}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
    
    // Log performance data when errors occur
    if (context) {
      console.warn(`Error in ${context}:`, error);
      this.logPerformanceMetrics();
    }
  }
  
  static logPerformanceMetrics(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      console.group('Performance Metrics');
      console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
      console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
      
      paint.forEach(entry => {
        console.log(`${entry.name}:`, entry.startTime, 'ms');
      });
      
      console.log('Error Counts:', Object.fromEntries(this.errorCounts));
      console.groupEnd();
    }
  }
}