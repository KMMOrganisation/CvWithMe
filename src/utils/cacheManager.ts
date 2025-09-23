/**
 * Cache Manager
 * 
 * Provides intelligent caching strategies for content, images, and API responses.
 * Improves performance by reducing redundant network requests and processing.
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  compress?: boolean; // Compress cached data
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private options: Required<CacheOptions>;
  private currentSize = 0;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 50 * 1024 * 1024, // 50MB default
      storage: 'memory',
      compress: false,
      ...options
    };

    // Load existing cache from storage
    this.loadFromStorage();
    
    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  private loadFromStorage(): void {
    if (this.options.storage === 'memory') return;

    try {
      const storage = this.getStorage();
      const cached = storage.getItem('cacheManager');
      if (cached) {
        const data = JSON.parse(cached);
        Object.entries(data).forEach(([key, entry]) => {
          this.cache.set(key, entry as CacheEntry<T>);
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (this.options.storage === 'memory') return;

    try {
      const storage = this.getStorage();
      const data = Object.fromEntries(this.cache.entries());
      storage.setItem('cacheManager', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private getStorage(): Storage {
    return this.options.storage === 'localStorage' ? localStorage : sessionStorage;
  }

  private calculateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  private evictLRU(): void {
    // Remove least recently used items when cache is full
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [key, entry] = entries[i];
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  public set(key: string, data: T, ttl?: number): void {
    const entryTtl = ttl || this.options.ttl;
    const size = this.calculateSize(data);
    
    // Check if we need to evict items
    if (this.currentSize + size > this.options.maxSize) {
      this.evictLRU();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: entryTtl,
      size
    };
    
    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.currentSize -= oldEntry.size;
    }
    
    this.cache.set(key, entry);
    this.currentSize += size;
    
    this.saveToStorage();
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }
    
    // Update timestamp for LRU
    entry.timestamp = Date.now();
    
    return entry.data;
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.saveToStorage();
  }

  public cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.delete(key));
  }

  public getStats(): {
    size: number;
    count: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.currentSize,
      count: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: 0 // Would need to track hits/misses for this
    };
  }
}

// Specialized cache managers for different content types
export class ImageCache extends CacheManager<string> {
  constructor() {
    super({
      ttl: 30 * 60 * 1000, // 30 minutes for images
      maxSize: 100 * 1024 * 1024, // 100MB for images
      storage: 'localStorage'
    });
  }

  async cacheImage(url: string): Promise<string> {
    const cached = this.get(url);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const dataUrl = await this.blobToDataUrl(blob);
      
      this.set(url, dataUrl);
      return dataUrl;
    } catch (error) {
      console.warn('Failed to cache image:', url, error);
      return url; // Return original URL as fallback
    }
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export class ContentCache extends CacheManager<any> {
  constructor() {
    super({
      ttl: 10 * 60 * 1000, // 10 minutes for content
      maxSize: 50 * 1024 * 1024, // 50MB for content
      storage: 'sessionStorage'
    });
  }

  async cacheContent(key: string, loader: () => Promise<any>): Promise<any> {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    try {
      const content = await loader();
      this.set(key, content);
      return content;
    } catch (error) {
      console.warn('Failed to load and cache content:', key, error);
      throw error;
    }
  }
}

// Global cache instances
export const imageCache = new ImageCache();
export const contentCache = new ContentCache();

// Service Worker integration for advanced caching
export class ServiceWorkerCache {
  private static isSupported = 'serviceWorker' in navigator && 'caches' in window;
  
  static async register(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  static async cacheResources(cacheName: string, urls: string[]): Promise<void> {
    if (!this.isSupported) return;

    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(urls);
      console.log(`Cached ${urls.length} resources in ${cacheName}`);
    } catch (error) {
      console.warn('Failed to cache resources:', error);
    }
  }

  static async getCachedResponse(request: Request): Promise<Response | undefined> {
    if (!this.isSupported) return undefined;

    try {
      return await caches.match(request);
    } catch (error) {
      console.warn('Failed to get cached response:', error);
      return undefined;
    }
  }
}

// Preloading utilities
export class ResourcePreloader {
  private static preloadedResources = new Set<string>();

  static preloadImage(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  static preloadVideo(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadeddata = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      video.onerror = reject;
      video.preload = 'metadata';
      video.src = src;
    });
  }

  static async preloadCriticalResources(resources: string[]): Promise<void> {
    const promises = resources.map(resource => {
      if (resource.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return this.preloadImage(resource);
      } else if (resource.match(/\.(mp4|webm|ogg)$/i)) {
        return this.preloadVideo(resource);
      }
      return Promise.resolve();
    });

    try {
      await Promise.allSettled(promises);
      console.log(`Preloaded ${resources.length} critical resources`);
    } catch (error) {
      console.warn('Some resources failed to preload:', error);
    }
  }
}

// Performance monitoring for cache effectiveness
export class CachePerformanceMonitor {
  private static metrics = {
    hits: 0,
    misses: 0,
    loadTimes: [] as number[]
  };

  static recordHit(): void {
    this.metrics.hits++;
  }

  static recordMiss(): void {
    this.metrics.misses++;
  }

  static recordLoadTime(time: number): void {
    this.metrics.loadTimes.push(time);
    // Keep only last 100 measurements
    if (this.metrics.loadTimes.length > 100) {
      this.metrics.loadTimes.shift();
    }
  }

  static getStats(): {
    hitRate: number;
    averageLoadTime: number;
    totalRequests: number;
  } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? this.metrics.hits / total : 0;
    const avgLoadTime = this.metrics.loadTimes.length > 0 
      ? this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length 
      : 0;

    return {
      hitRate,
      averageLoadTime: avgLoadTime,
      totalRequests: total
    };
  }

  static logStats(): void {
    const stats = this.getStats();
    console.group('Cache Performance Stats');
    console.log(`Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%`);
    console.log(`Average Load Time: ${stats.averageLoadTime.toFixed(2)}ms`);
    console.log(`Total Requests: ${stats.totalRequests}`);
    console.groupEnd();
  }
}