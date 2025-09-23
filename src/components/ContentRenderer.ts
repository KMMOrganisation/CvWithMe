/**
 * ContentRenderer Component
 * 
 * Renders rich lesson content including text, images, videos, GIFs, code blocks, and callouts.
 * Supports accessibility features, lazy loading, and responsive design.
 */

import { ContentBlock } from '../data/types/index.js';

export interface ContentRendererProps {
  content: ContentBlock[];
  className?: string;
}

export class ContentRenderer {
  private container: HTMLElement;
  private props: ContentRendererProps;
  private intersectionObserver?: IntersectionObserver;

  constructor(container: HTMLElement, props: ContentRendererProps) {
    this.container = container;
    this.props = props;
    this.setupLazyLoading();
    this.render();
  }

  private setupLazyLoading(): void {
    // Set up intersection observer for lazy loading images and videos
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              this.loadMedia(element);
              this.intersectionObserver?.unobserve(element);
            }
          });
        },
        {
          rootMargin: '100px 0px', // Increased for better preloading
          threshold: 0.1
        }
      );
    }
  }

  private async loadMedia(element: HTMLElement): Promise<void> {
    const dataSrc = element.getAttribute('data-src');
    if (!dataSrc) return;

    try {
      if (element.tagName === 'IMG') {
        const img = element as HTMLImageElement;
        
        // Show skeleton while loading
        const skeleton = document.createElement('div');
        skeleton.className = 'image-skeleton';
        skeleton.innerHTML = '<div class="skeleton-placeholder">📷</div>';
        img.parentNode?.insertBefore(skeleton, img);
        
        // Load image with performance optimizations
        await this.loadImageOptimized(img, dataSrc);
        
        // Remove skeleton and show image
        skeleton.remove();
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        
      } else if (element.tagName === 'VIDEO') {
        const video = element as HTMLVideoElement;
        
        // Show skeleton while loading
        const skeleton = document.createElement('div');
        skeleton.className = 'video-skeleton';
        skeleton.innerHTML = '<div class="skeleton-placeholder">🎥</div>';
        video.parentNode?.insertBefore(skeleton, video);
        
        // Load video
        video.src = dataSrc;
        video.addEventListener('loadeddata', () => {
          skeleton.remove();
          video.classList.remove('lazy-loading');
          video.classList.add('lazy-loaded');
        }, { once: true });
      }
      
      element.removeAttribute('data-src');
    } catch (error) {
      console.error('Failed to load media:', error);
      element.classList.add('lazy-error');
    }
  }

  private async loadImageOptimized(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a new image for preloading
      const preloadImg = new Image();
      
      preloadImg.onload = () => {
        // Check if we should use WebP format
        const supportsWebP = this.supportsWebP();
        const optimizedSrc = supportsWebP ? this.getWebPVersion(src) : src;
        
        img.src = optimizedSrc;
        img.onload = () => resolve();
        img.onerror = () => {
          // Fallback to original if WebP fails
          if (optimizedSrc !== src) {
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Image failed to load'));
          } else {
            reject(new Error('Image failed to load'));
          }
        };
      };
      
      preloadImg.onerror = () => reject(new Error('Image preload failed'));
      preloadImg.src = src;
    });
  }

  private supportsWebP(): boolean {
    // Check if browser supports WebP
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private getWebPVersion(src: string): string {
    // Convert image URL to WebP version if available
    // This would depend on your image serving strategy
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  private renderTextContent(block: ContentBlock): HTMLElement {
    const textElement = document.createElement('div');
    textElement.className = 'content-text';
    textElement.innerHTML = this.processTextContent(block.content);
    return textElement;
  }

  private processTextContent(content: string): string {
    // Process markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>') // Inline code
      .replace(/\n\n/g, '</p><p>') // Paragraph breaks
      .replace(/\n/g, '<br>'); // Line breaks
  }

  private renderImageContent(block: ContentBlock): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'content-image';

    const img = document.createElement('img');
    img.className = 'lazy-loading';
    img.setAttribute('data-src', block.content);
    img.alt = block.metadata?.alt || '';
    img.loading = 'lazy';

    // Add placeholder while loading
    img.style.backgroundColor = 'var(--gray-100)';
    img.style.minHeight = '200px';
    img.style.display = 'block';

    // Enhanced error handling with retry mechanism
    let retryCount = 0;
    const maxRetries = 2;
    
    const handleImageError = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`Image load failed, retrying (${retryCount}/${maxRetries}):`, block.content);
        
        // Try again after a short delay
        setTimeout(() => {
          img.src = block.content + `?retry=${retryCount}&t=${Date.now()}`;
        }, 1000 * retryCount);
        return;
      }
      
      // All retries failed, show error fallback
      img.style.display = 'none';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'content-error media-error';
      errorDiv.innerHTML = `
        <div class="error-icon">📷</div>
        <p>Image could not be loaded</p>
        <small>${block.metadata?.alt || 'No description available'}</small>
        <button class="error-retry-btn" data-action="retry-image">
          <span class="retry-icon">🔄</span>
          Try Again
        </button>
      `;
      
      // Add retry button functionality
      const retryBtn = errorDiv.querySelector('.error-retry-btn') as HTMLButtonElement;
      retryBtn.addEventListener('click', () => {
        errorDiv.remove();
        img.style.display = 'block';
        retryCount = 0;
        img.src = block.content + `?manual-retry=${Date.now()}`;
      });
      
      figure.appendChild(errorDiv);
    };

    img.onerror = handleImageError;

    figure.appendChild(img);

    // Add caption if provided
    if (block.metadata?.caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'content-caption';
      figcaption.textContent = block.metadata.caption;
      figure.appendChild(figcaption);
    }

    // Set up lazy loading
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = block.content;
    }

    return figure;
  }

  private renderVideoContent(block: ContentBlock): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'content-video';

    const video = document.createElement('video');
    video.className = 'lazy-loading';
    video.setAttribute('data-src', block.content);
    video.controls = true;
    video.preload = 'metadata';
    
    if (block.metadata?.autoplay) {
      video.autoplay = true;
      video.muted = true; // Required for autoplay in most browsers
    }

    if (block.metadata?.loop) {
      video.loop = true;
    }

    // Add accessibility attributes
    video.setAttribute('aria-label', block.metadata?.caption || 'Video content');

    // Enhanced error handling with retry mechanism
    let retryCount = 0;
    const maxRetries = 2;
    
    const handleVideoError = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`Video load failed, retrying (${retryCount}/${maxRetries}):`, block.content);
        
        // Try again after a short delay
        setTimeout(() => {
          video.src = block.content + `?retry=${retryCount}&t=${Date.now()}`;
          video.load();
        }, 1500 * retryCount);
        return;
      }
      
      // All retries failed, show error fallback
      video.style.display = 'none';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'content-error media-error';
      errorDiv.innerHTML = `
        <div class="error-icon">🎥</div>
        <p>Video could not be loaded</p>
        <small>${block.metadata?.caption || 'No description available'}</small>
        <button class="error-retry-btn" data-action="retry-video">
          <span class="retry-icon">🔄</span>
          Try Again
        </button>
        <div class="error-details">
          <p>This might be due to:</p>
          <ul>
            <li>Network connectivity issues</li>
            <li>Unsupported video format</li>
            <li>File not found on server</li>
          </ul>
        </div>
      `;
      
      // Add retry button functionality
      const retryBtn = errorDiv.querySelector('.error-retry-btn') as HTMLButtonElement;
      retryBtn.addEventListener('click', () => {
        errorDiv.remove();
        video.style.display = 'block';
        retryCount = 0;
        video.src = block.content + `?manual-retry=${Date.now()}`;
        video.load();
      });
      
      figure.appendChild(errorDiv);
    };

    video.onerror = handleVideoError;
    video.addEventListener('error', handleVideoError);

    figure.appendChild(video);

    // Add caption if provided
    if (block.metadata?.caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'content-caption';
      figcaption.textContent = block.metadata.caption;
      figure.appendChild(figcaption);
    }

    // Set up lazy loading
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(video);
    } else {
      // Fallback for browsers without IntersectionObserver
      video.src = block.content;
    }

    return figure;
  }

  private renderGifContent(block: ContentBlock): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'content-gif';

    const img = document.createElement('img');
    img.className = 'lazy-loading gif-content';
    img.setAttribute('data-src', block.content);
    img.alt = block.metadata?.alt || 'Animated demonstration';
    img.loading = 'lazy';

    if (block.metadata?.loop !== false) {
      // GIFs loop by default
      img.style.animation = 'none';
    }

    // Add placeholder while loading
    img.style.backgroundColor = 'var(--gray-100)';
    img.style.minHeight = '200px';
    img.style.display = 'block';

    // Enhanced error handling with retry mechanism
    let retryCount = 0;
    const maxRetries = 2;
    
    const handleGifError = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`GIF load failed, retrying (${retryCount}/${maxRetries}):`, block.content);
        
        // Try again after a short delay
        setTimeout(() => {
          img.src = block.content + `?retry=${retryCount}&t=${Date.now()}`;
        }, 1000 * retryCount);
        return;
      }
      
      // All retries failed, show error fallback with static image option
      img.style.display = 'none';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'content-error media-error';
      errorDiv.innerHTML = `
        <div class="error-icon">🎬</div>
        <p>Animation could not be loaded</p>
        <small>${block.metadata?.alt || 'No description available'}</small>
        <div class="error-actions">
          <button class="error-retry-btn" data-action="retry-gif">
            <span class="retry-icon">🔄</span>
            Try Again
          </button>
          <button class="error-fallback-btn" data-action="show-static">
            <span class="static-icon">📷</span>
            Show Static Image
          </button>
        </div>
      `;
      
      // Add retry button functionality
      const retryBtn = errorDiv.querySelector('.error-retry-btn') as HTMLButtonElement;
      retryBtn.addEventListener('click', () => {
        errorDiv.remove();
        img.style.display = 'block';
        retryCount = 0;
        img.src = block.content + `?manual-retry=${Date.now()}`;
      });
      
      // Add static image fallback
      const staticBtn = errorDiv.querySelector('.error-fallback-btn') as HTMLButtonElement;
      staticBtn.addEventListener('click', () => {
        const staticSrc = block.content.replace(/\.gif$/i, '.jpg').replace(/\.gif$/i, '.png');
        if (staticSrc !== block.content) {
          errorDiv.remove();
          img.style.display = 'block';
          img.src = staticSrc;
          img.alt = (block.metadata?.alt || 'Static image') + ' (static version)';
        }
      });
      
      figure.appendChild(errorDiv);
    };

    img.onerror = handleGifError;

    figure.appendChild(img);

    // Add caption if provided
    if (block.metadata?.caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'content-caption';
      figcaption.textContent = block.metadata.caption;
      figure.appendChild(figcaption);
    }

    // Set up lazy loading
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = block.content;
    }

    return figure;
  }

  private renderCodeContent(block: ContentBlock): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'content-code';

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    
    // Add language class for syntax highlighting
    if (block.metadata?.language) {
      code.className = `language-${block.metadata.language}`;
      pre.setAttribute('data-language', block.metadata.language);
    }

    code.textContent = block.content;
    pre.appendChild(code);

    // Add copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-btn';
    copyButton.innerHTML = `
      <span class="copy-icon">📋</span>
      <span class="copy-text">Copy</span>
    `;
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');
    
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.content);
        copyButton.innerHTML = `
          <span class="copy-icon">✅</span>
          <span class="copy-text">Copied!</span>
        `;
        setTimeout(() => {
          copyButton.innerHTML = `
            <span class="copy-icon">📋</span>
            <span class="copy-text">Copy</span>
          `;
        }, 2000);
      } catch (err) {
        console.warn('Failed to copy code:', err);
        copyButton.innerHTML = `
          <span class="copy-icon">❌</span>
          <span class="copy-text">Failed</span>
        `;
        setTimeout(() => {
          copyButton.innerHTML = `
            <span class="copy-icon">📋</span>
            <span class="copy-text">Copy</span>
          `;
        }, 2000);
      }
    });

    const codeHeader = document.createElement('div');
    codeHeader.className = 'code-header';
    
    if (block.metadata?.language) {
      const languageLabel = document.createElement('span');
      languageLabel.className = 'code-language';
      languageLabel.textContent = block.metadata.language.toUpperCase();
      codeHeader.appendChild(languageLabel);
    }
    
    codeHeader.appendChild(copyButton);

    figure.appendChild(codeHeader);
    figure.appendChild(pre);

    // Add caption if provided
    if (block.metadata?.caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'content-caption';
      figcaption.textContent = block.metadata.caption;
      figure.appendChild(figcaption);
    }

    return figure;
  }

  private renderCalloutContent(block: ContentBlock): HTMLElement {
    const callout = document.createElement('div');
    callout.className = 'content-callout';
    
    // Determine callout type from metadata or content
    const calloutType = this.determineCalloutType(block.content);
    callout.classList.add(`callout-${calloutType}`);

    const icon = document.createElement('div');
    icon.className = 'callout-icon';
    icon.innerHTML = this.getCalloutIcon(calloutType);

    const content = document.createElement('div');
    content.className = 'callout-content';
    content.innerHTML = this.processTextContent(block.content);

    callout.appendChild(icon);
    callout.appendChild(content);

    return callout;
  }

  private determineCalloutType(content: string): string {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('note:') || lowerContent.includes('💡')) return 'note';
    if (lowerContent.includes('warning:') || lowerContent.includes('⚠️')) return 'warning';
    if (lowerContent.includes('tip:') || lowerContent.includes('💡')) return 'tip';
    if (lowerContent.includes('important:') || lowerContent.includes('❗')) return 'important';
    if (lowerContent.includes('error:') || lowerContent.includes('❌')) return 'error';
    return 'info';
  }

  private getCalloutIcon(type: string): string {
    const icons = {
      note: '📝',
      warning: '⚠️',
      tip: '💡',
      important: '❗',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type as keyof typeof icons] || icons.info;
  }

  private renderContentBlock(block: ContentBlock): HTMLElement {
    switch (block.type) {
      case 'text':
        return this.renderTextContent(block);
      case 'image':
        return this.renderImageContent(block);
      case 'video':
        return this.renderVideoContent(block);
      case 'gif':
        return this.renderGifContent(block);
      case 'code':
        return this.renderCodeContent(block);
      case 'callout':
        return this.renderCalloutContent(block);
      default:
        console.warn(`Unknown content block type: ${block.type}`);
        return this.renderTextContent(block);
    }
  }

  public render(): void {
    // Clear existing content
    this.container.innerHTML = '';
    
    // Add base class
    this.container.className = `content-renderer ${this.props.className || ''}`;

    // Render each content block
    this.props.content.forEach((block) => {
      const blockElement = this.renderContentBlock(block);
      blockElement.setAttribute('data-block-id', block.id);
      blockElement.setAttribute('data-block-type', block.type);
      this.container.appendChild(blockElement);
    });
  }

  public destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  public updateContent(newContent: ContentBlock[]): void {
    this.props.content = newContent;
    this.render();
  }
}

// Factory function for easier usage
export function createContentRenderer(
  container: HTMLElement, 
  props: ContentRendererProps
): ContentRenderer {
  return new ContentRenderer(container, props);
}