import { ContentBlock } from '../data/types/index.js';

/**
 * Content rendering utilities for markdown-based content
 */
export class ContentRenderer {
  /**
   * Renders a content block to HTML
   */
  static renderContentBlock(block: ContentBlock): string {
    switch (block.type) {
      case 'text':
        return this.renderText(block.content);
      
      case 'code':
        return this.renderCode(block.content, block.metadata?.language);
      
      case 'image':
        return this.renderImage(block.content, block.metadata?.alt, block.metadata?.caption);
      
      case 'video':
        return this.renderVideo(block.content, block.metadata?.caption);
      
      case 'gif':
        return this.renderGif(block.content, block.metadata?.caption);
      
      case 'callout':
        return this.renderCallout(block.content);
      
      default:
        console.warn(`Unknown content block type: ${block.type}`);
        return `<div class="unknown-content">${this.escapeHtml(block.content)}</div>`;
    }
  }

  /**
   * Renders text content with markdown-like formatting
   */
  private static renderText(content: string): string {
    let html = this.escapeHtml(content);
    
    // Convert markdown-style formatting
    html = html
      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return `<div class="content-text">${html}</div>`;
  }

  /**
   * Renders code blocks with syntax highlighting
   */
  private static renderCode(content: string, language?: string): string {
    const escapedContent = this.escapeHtml(content);
    const langClass = language ? ` language-${language}` : '';
    
    return `
      <div class="content-code">
        <pre><code class="code-block${langClass}">${escapedContent}</code></pre>
        ${language ? `<div class="code-language">${language}</div>` : ''}
      </div>
    `;
  }

  /**
   * Renders images with alt text and captions
   */
  private static renderImage(src: string, alt?: string, caption?: string): string {
    const altText = alt || '';
    const imageSrc = this.resolveAssetPath(src);
    
    return `
      <div class="content-image">
        <img src="${imageSrc}" alt="${this.escapeHtml(altText)}" loading="lazy">
        ${caption ? `<div class="image-caption">${this.escapeHtml(caption)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Renders video content
   */
  private static renderVideo(src: string, caption?: string): string {
    const videoSrc = this.resolveAssetPath(src);
    
    return `
      <div class="content-video">
        <video controls preload="metadata">
          <source src="${videoSrc}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        ${caption ? `<div class="video-caption">${this.escapeHtml(caption)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Renders GIF content
   */
  private static renderGif(src: string, caption?: string): string {
    const gifSrc = this.resolveAssetPath(src);
    
    return `
      <div class="content-gif">
        <img src="${gifSrc}" alt="Animated demonstration" loading="lazy">
        ${caption ? `<div class="gif-caption">${this.escapeHtml(caption)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Renders callout/note content
   */
  private static renderCallout(content: string): string {
    let calloutType = 'info';
    let icon = '💡';
    
    // Determine callout type based on emoji
    if (content.startsWith('💡')) {
      calloutType = 'tip';
      icon = '💡';
    } else if (content.startsWith('⚠️')) {
      calloutType = 'warning';
      icon = '⚠️';
    } else if (content.startsWith('📝')) {
      calloutType = 'note';
      icon = '📝';
    } else if (content.includes('**Pro Tip')) {
      calloutType = 'tip';
      icon = '💡';
    } else if (content.includes('**Important')) {
      calloutType = 'warning';
      icon = '⚠️';
    }
    
    // Remove the emoji from the beginning if present
    const cleanContent = content.replace(/^[💡⚠️📝]\s*/, '');
    const formattedContent = this.renderText(cleanContent);
    
    return `
      <div class="content-callout callout-${calloutType}">
        <div class="callout-icon">${icon}</div>
        <div class="callout-content">${formattedContent}</div>
      </div>
    `;
  }

  /**
   * Renders an array of content blocks
   */
  static renderContentBlocks(blocks: ContentBlock[]): string {
    return blocks.map(block => this.renderContentBlock(block)).join('\n');
  }

  /**
   * Resolves asset paths relative to the content directory
   */
  private static resolveAssetPath(src: string): string {
    // If it's already a full URL, return as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // If it starts with a slash, it's absolute
    if (src.startsWith('/')) {
      return src;
    }
    
    // If it starts with ../, resolve relative to content
    if (src.startsWith('../')) {
      return src.replace('../', '/content/');
    }
    
    // Otherwise, assume it's relative to assets
    return `/content/assets/${src}`;
  }

  /**
   * Escapes HTML characters
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Creates a table of contents from content blocks
   */
  static generateTableOfContents(blocks: ContentBlock[]): { id: string; title: string; level: number }[] {
    const toc: { id: string; title: string; level: number }[] = [];
    
    blocks.forEach((block, index) => {
      if (block.type === 'text') {
        // Look for heading patterns in text content
        const headingMatch = block.content.match(/^(#{1,6})\s+(.+)$/m);
        if (headingMatch) {
          const [, hashes, title] = headingMatch;
          const level = hashes.length;
          const id = `heading-${index}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          
          toc.push({ id, title, level });
        }
      }
    });
    
    return toc;
  }

  /**
   * Estimates reading time for content blocks
   */
  static estimateReadingTime(blocks: ContentBlock[]): number {
    const wordsPerMinute = 200; // Average reading speed
    let totalWords = 0;
    
    blocks.forEach(block => {
      switch (block.type) {
        case 'text':
        case 'callout':
          totalWords += block.content.split(/\s+/).length;
          break;
        case 'code':
          // Code takes longer to read and understand
          totalWords += block.content.split(/\s+/).length * 1.5;
          break;
        case 'image':
        case 'video':
        case 'gif':
          // Add time for viewing media
          totalWords += 50; // Equivalent to 50 words
          break;
      }
    });
    
    return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
  }
}

/**
 * Content rendering helper functions
 */
export const ContentUtils = {
  /**
   * Renders content blocks to HTML string
   */
  render: (blocks: ContentBlock[]): string => {
    return ContentRenderer.renderContentBlocks(blocks);
  },

  /**
   * Gets estimated reading time
   */
  getReadingTime: (blocks: ContentBlock[]): number => {
    return ContentRenderer.estimateReadingTime(blocks);
  },

  /**
   * Generates table of contents
   */
  getTOC: (blocks: ContentBlock[]) => {
    return ContentRenderer.generateTableOfContents(blocks);
  },

  /**
   * Extracts plain text from content blocks
   */
  extractText: (blocks: ContentBlock[]): string => {
    return blocks
      .filter(block => block.type === 'text' || block.type === 'callout')
      .map(block => block.content)
      .join(' ')
      .replace(/[#*`\[\]()]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ')
      .trim();
  }
};