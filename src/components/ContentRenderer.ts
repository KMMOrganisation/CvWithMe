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
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );
    }
  }

  private loadMedia(element: HTMLElement): void {
    const dataSrc = element.getAttribute('data-src');
    if (dataSrc) {
      if (element.tagName === 'IMG') {
        (element as HTMLImageElement).src = dataSrc;
        element.removeAttribute('data-src');
        element.classList.remove('lazy-loading');
        element.classList.add('lazy-loaded');
      } else if (element.tagName === 'VIDEO') {
        const video = element as HTMLVideoElement;
        video.src = dataSrc;
        element.removeAttribute('data-src');
        element.classList.remove('lazy-loading');
        element.classList.add('lazy-loaded');
      }
    }
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

    // Set up error handling
    img.onerror = () => {
      img.style.display = 'none';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'content-error';
      errorDiv.innerHTML = `
        <div class="error-icon">📷</div>
        <p>Image could not be loaded</p>
        <small>${block.metadata?.alt || 'No description available'}</small>
      `;
      figure.appendChild(errorDiv);
    };

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

    // Set up error handling
    video.onerror = () => {
      video.style.display = 'none';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'content-error';
      errorDiv.innerHTML = `
        <div class="error-icon">🎥</div>
        <p>Video could not be loaded</p>
        <small>${block.metadata?.caption || 'No description available'}</small>
      `;
      figure.appendChild(errorDiv);
    };

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

    // Set up error handling
    img.onerror = () => {
      img.style.display = 'none';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'content-error';
      errorDiv.innerHTML = `
        <div class="error-icon">🎬</div>
        <p>Animation could not be loaded</p>
        <small>${block.metadata?.alt || 'No description available'}</small>
      `;
      figure.appendChild(errorDiv);
    };

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