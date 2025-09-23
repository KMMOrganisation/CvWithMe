/**
 * Network Error Handler
 * 
 * Provides comprehensive network error handling, retry mechanisms,
 * and graceful degradation for network failures
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error, attempt: number) => boolean;
}

export interface NetworkErrorInfo {
  error: Error;
  url: string;
  attempt: number;
  timestamp: Date;
  isOnline: boolean;
  connectionType?: string;
}

export class NetworkErrorHandler {
  private static readonly DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error: Error) => {
      // Retry on network errors, timeouts, and 5xx server errors
      return (
        error.name === 'NetworkError' ||
        error.message.includes('fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('5')
      );
    }
  };

  private static errorListeners: Set<(errorInfo: NetworkErrorInfo) => void> = new Set();
  private static isOnlineListenerSetup = false;

  /**
   * Fetch with automatic retry and error handling
   */
  static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<Response> {
    const opts = { ...this.DEFAULT_OPTIONS, ...retryOptions };
    let lastError: Error;

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
      try {
        // Add timeout to fetch if not specified
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const fetchOptions: RequestInit = {
          ...options,
          signal: options.signal || controller.signal
        };

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Notify error listeners
        this.notifyErrorListeners({
          error: lastError,
          url,
          attempt,
          timestamp: new Date(),
          isOnline: navigator.onLine,
          connectionType: this.getConnectionType()
        });

        // Check if we should retry
        if (attempt <= opts.maxRetries && opts.retryCondition(lastError, attempt)) {
          const delay = Math.min(
            opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
            opts.maxDelay
          );
          
          console.warn(`Fetch attempt ${attempt} failed, retrying in ${delay}ms...`, {
            url,
            error: lastError.message
          });
          
          await this.delay(delay);
          continue;
        }

        break;
      }
    }

    throw lastError!;
  }

  /**
   * Load image with retry and fallback options
   */
  static async loadImageWithFallback(
    src: string,
    fallbackSrc?: string,
    retryOptions: RetryOptions = {}
  ): Promise<HTMLImageElement> {
    const opts = { ...this.DEFAULT_OPTIONS, ...retryOptions };
    
    return new Promise((resolve, reject) => {
      let attempt = 1;
      
      const tryLoad = (imageSrc: string, isFallback = false) => {
        const img = new Image();
        
        img.onload = () => {
          if (isFallback) {
            console.warn(`Primary image failed, loaded fallback: ${imageSrc}`);
          }
          resolve(img);
        };
        
        img.onerror = () => {
          const error = new Error(`Image failed to load: ${imageSrc}`);
          
          this.notifyErrorListeners({
            error,
            url: imageSrc,
            attempt,
            timestamp: new Date(),
            isOnline: navigator.onLine,
            connectionType: this.getConnectionType()
          });

          if (!isFallback && attempt <= opts.maxRetries) {
            // Retry primary image
            attempt++;
            const delay = Math.min(
              opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
              opts.maxDelay
            );
            
            setTimeout(() => tryLoad(imageSrc), delay);
          } else if (!isFallback && fallbackSrc && fallbackSrc !== imageSrc) {
            // Try fallback image
            console.warn(`Primary image failed after ${attempt} attempts, trying fallback`);
            tryLoad(fallbackSrc, true);
          } else {
            reject(error);
          }
        };
        
        img.src = imageSrc;
      };
      
      tryLoad(src);
    });
  }

  /**
   * Load video with retry mechanism
   */
  static async loadVideoWithRetry(
    src: string,
    retryOptions: RetryOptions = {}
  ): Promise<HTMLVideoElement> {
    const opts = { ...this.DEFAULT_OPTIONS, ...retryOptions };
    
    return new Promise((resolve, reject) => {
      let attempt = 1;
      
      const tryLoad = () => {
        const video = document.createElement('video');
        
        const handleSuccess = () => {
          video.removeEventListener('loadeddata', handleSuccess);
          video.removeEventListener('error', handleError);
          resolve(video);
        };
        
        const handleError = () => {
          video.removeEventListener('loadeddata', handleSuccess);
          video.removeEventListener('error', handleError);
          
          const error = new Error(`Video failed to load: ${src}`);
          
          this.notifyErrorListeners({
            error,
            url: src,
            attempt,
            timestamp: new Date(),
            isOnline: navigator.onLine,
            connectionType: this.getConnectionType()
          });

          if (attempt <= opts.maxRetries) {
            attempt++;
            const delay = Math.min(
              opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
              opts.maxDelay
            );
            
            setTimeout(tryLoad, delay);
          } else {
            reject(error);
          }
        };
        
        video.addEventListener('loadeddata', handleSuccess);
        video.addEventListener('error', handleError);
        video.src = src;
        video.load();
      };
      
      tryLoad();
    });
  }

  /**
   * Check network connectivity and quality
   */
  static async checkConnectivity(): Promise<{
    isOnline: boolean;
    quality: 'good' | 'poor' | 'offline';
    latency?: number;
  }> {
    if (!navigator.onLine) {
      return { isOnline: false, quality: 'offline' };
    }

    try {
      const startTime = performance.now();
      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      const latency = performance.now() - startTime;

      return {
        isOnline: true,
        quality: latency < 500 ? 'good' : 'poor',
        latency
      };
    } catch (error) {
      return { isOnline: false, quality: 'offline' };
    }
  }

  /**
   * Get connection type information
   */
  private static getConnectionType(): string {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    return connection?.effectiveType || 'unknown';
  }

  /**
   * Setup online/offline event listeners
   */
  static setupConnectivityMonitoring(): void {
    if (this.isOnlineListenerSetup) return;
    
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.notifyConnectivityChange(true);
    });

    window.addEventListener('offline', () => {
      console.warn('Network connection lost');
      this.notifyConnectivityChange(false);
    });

    this.isOnlineListenerSetup = true;
  }

  /**
   * Add error listener
   */
  static addErrorListener(listener: (errorInfo: NetworkErrorInfo) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Notify error listeners
   */
  private static notifyErrorListeners(errorInfo: NetworkErrorInfo): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (error) {
        console.error('Error in network error listener:', error);
      }
    });
  }

  /**
   * Notify connectivity change
   */
  private static notifyConnectivityChange(isOnline: boolean): void {
    const event = new CustomEvent('connectivitychange', {
      detail: { isOnline }
    });
    document.dispatchEvent(event);
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a network-aware error message
   */
  static createErrorMessage(error: Error): string {
    if (!navigator.onLine) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }

    if (error.message.includes('timeout')) {
      return 'The request timed out. This might be due to a slow connection or server issues.';
    }

    if (error.message.includes('404')) {
      return 'The requested content was not found on the server.';
    }

    if (error.message.includes('5')) {
      return 'There was a server error. Please try again in a few moments.';
    }

    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'There was a network error. Please check your connection and try again.';
    }

    return 'An unexpected error occurred while loading content.';
  }

  /**
   * Get retry suggestion based on error type
   */
  static getRetrySuggestion(error: Error): string {
    if (!navigator.onLine) {
      return 'Check your internet connection';
    }

    if (error.message.includes('timeout')) {
      return 'Wait a moment and try again';
    }

    if (error.message.includes('5')) {
      return 'Server issue - try again later';
    }

    return 'Try refreshing the page';
  }
}

/**
 * Browser compatibility checker
 */
export class BrowserCompatibility {
  /**
   * Check if browser supports modern features
   */
  static checkSupport(): {
    fetch: boolean;
    intersectionObserver: boolean;
    webp: boolean;
    serviceWorker: boolean;
    localStorage: boolean;
  } {
    return {
      fetch: 'fetch' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      webp: this.supportsWebP(),
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: this.supportsLocalStorage()
    };
  }

  /**
   * Check WebP support
   */
  private static supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check localStorage support
   */
  private static supportsLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get fallback strategies for unsupported features
   */
  static getFallbackStrategies(): {
    fetch?: string;
    intersectionObserver?: string;
    webp?: string;
    serviceWorker?: string;
    localStorage?: string;
  } {
    const support = this.checkSupport();
    const fallbacks: any = {};

    if (!support.fetch) {
      fallbacks.fetch = 'Use XMLHttpRequest for network requests';
    }

    if (!support.intersectionObserver) {
      fallbacks.intersectionObserver = 'Use scroll event listeners for lazy loading';
    }

    if (!support.webp) {
      fallbacks.webp = 'Serve JPEG/PNG images instead of WebP';
    }

    if (!support.serviceWorker) {
      fallbacks.serviceWorker = 'Use application cache or manual caching';
    }

    if (!support.localStorage) {
      fallbacks.localStorage = 'Use session storage or cookies';
    }

    return fallbacks;
  }

  /**
   * Show browser compatibility warning if needed
   */
  static showCompatibilityWarning(): void {
    const support = this.checkSupport();
    const criticalFeatures = ['fetch'];
    const missingCritical = criticalFeatures.filter(feature => !support[feature as keyof typeof support]);

    if (missingCritical.length > 0) {
      const warning = document.createElement('div');
      warning.className = 'browser-compatibility-warning';
      warning.innerHTML = `
        <div class="warning-content">
          <h3>⚠️ Browser Compatibility Notice</h3>
          <p>Your browser doesn't support some modern features used by this website.</p>
          <p>For the best experience, please update your browser or use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
          <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
        </div>
      `;
      
      document.body.insertBefore(warning, document.body.firstChild);
    }
  }
}