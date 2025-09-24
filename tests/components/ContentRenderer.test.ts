import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentRenderer } from '../../src/components/ContentRenderer.js';
import { ContentBlock } from '../../src/data/types/index.js';

describe('ContentRenderer Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should render text content blocks', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'text',
        content: 'This is a **bold** text with *italic* formatting.',
        metadata: {}
      }
    ];

    new ContentRenderer(container, { content });

    const textBlock = container.querySelector('.content-block--text');
    expect(textBlock).toBeTruthy();
    expect(textBlock?.innerHTML).toContain('<strong>bold</strong>');
    expect(textBlock?.innerHTML).toContain('<em>italic</em>');
  });

  it('should render code blocks with syntax highlighting', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'code',
        content: 'console.log("Hello, World!");',
        metadata: {
          language: 'javascript',
          caption: 'A simple console log'
        }
      }
    ];

    new ContentRenderer(container, { content });

    const codeBlock = container.querySelector('.content-block--code');
    expect(codeBlock).toBeTruthy();
    
    const code = codeBlock?.querySelector('code');
    expect(code?.textContent).toContain('console.log("Hello, World!");');
    
    const caption = codeBlock?.querySelector('.content-block__caption');
    expect(caption?.textContent).toBe('A simple console log');
  });

  it('should render image blocks with proper attributes', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'image',
        content: 'https://example.com/image.jpg',
        metadata: {
          alt: 'Test image',
          caption: 'This is a test image'
        }
      }
    ];

    new ContentRenderer(container, { content });

    const imageBlock = container.querySelector('.content-block--image');
    expect(imageBlock).toBeTruthy();
    
    const img = imageBlock?.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
    expect(img?.getAttribute('alt')).toBe('Test image');
    expect(img?.getAttribute('loading')).toBe('lazy');
    
    const caption = imageBlock?.querySelector('.content-block__caption');
    expect(caption?.textContent).toBe('This is a test image');
  });

  it('should render video blocks with controls', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'video',
        content: 'https://example.com/video.mp4',
        metadata: {
          caption: 'Tutorial video',
          autoplay: false
        }
      }
    ];

    new ContentRenderer(container, { content });

    const videoBlock = container.querySelector('.content-block--video');
    expect(videoBlock).toBeTruthy();
    
    const video = videoBlock?.querySelector('video');
    expect(video?.getAttribute('src')).toBe('https://example.com/video.mp4');
    expect(video?.hasAttribute('controls')).toBe(true);
    expect(video?.hasAttribute('autoplay')).toBe(false);
  });

  it('should render callout blocks with proper styling', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'callout',
        content: 'This is an important note!',
        metadata: {}
      }
    ];

    new ContentRenderer(container, { content });

    const calloutBlock = container.querySelector('.content-block--callout');
    expect(calloutBlock).toBeTruthy();
    expect(calloutBlock?.textContent).toContain('This is an important note!');
  });

  it('should handle multiple content blocks in order', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'text',
        content: 'First block',
        metadata: {}
      },
      {
        id: '2',
        type: 'code',
        content: 'console.log("Second block");',
        metadata: { language: 'javascript' }
      },
      {
        id: '3',
        type: 'text',
        content: 'Third block',
        metadata: {}
      }
    ];

    new ContentRenderer(container, { content });

    const blocks = container.querySelectorAll('.content-block');
    expect(blocks).toHaveLength(3);
    
    expect(blocks[0].textContent).toContain('First block');
    expect(blocks[1].textContent).toContain('console.log("Second block");');
    expect(blocks[2].textContent).toContain('Third block');
  });

  it('should apply custom className when provided', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'text',
        content: 'Test content',
        metadata: {}
      }
    ];

    new ContentRenderer(container, { 
      content, 
      className: 'custom-content-renderer' 
    });

    expect(container.querySelector('.custom-content-renderer')).toBeTruthy();
  });

  it('should handle empty content gracefully', () => {
    new ContentRenderer(container, { content: [] });

    const contentRenderer = container.querySelector('.content-renderer');
    expect(contentRenderer).toBeTruthy();
    expect(contentRenderer?.children).toHaveLength(0);
  });

  it('should implement lazy loading for images', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'image',
        content: 'https://example.com/large-image.jpg',
        metadata: {
          alt: 'Large image'
        }
      }
    ];

    new ContentRenderer(container, { content });

    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('should handle code blocks without language specification', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'code',
        content: 'Some generic code',
        metadata: {}
      }
    ];

    new ContentRenderer(container, { content });

    const codeBlock = container.querySelector('.content-block--code');
    expect(codeBlock).toBeTruthy();
    
    const code = codeBlock?.querySelector('code');
    expect(code?.textContent).toBe('Some generic code');
  });

  it('should provide copy functionality for code blocks', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'code',
        content: 'console.log("Copy me!");',
        metadata: { language: 'javascript' }
      }
    ];

    new ContentRenderer(container, { content });

    const copyButton = container.querySelector('.content-block__copy-button');
    expect(copyButton).toBeTruthy();
    expect(copyButton?.getAttribute('aria-label')).toContain('Copy code');
  });

  it('should handle markdown formatting in text blocks', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'text',
        content: '# Heading\n\nThis is **bold** and this is *italic*.\n\n- List item 1\n- List item 2',
        metadata: {}
      }
    ];

    new ContentRenderer(container, { content });

    const textBlock = container.querySelector('.content-block--text');
    expect(textBlock?.innerHTML).toContain('<h1>Heading</h1>');
    expect(textBlock?.innerHTML).toContain('<strong>bold</strong>');
    expect(textBlock?.innerHTML).toContain('<em>italic</em>');
    expect(textBlock?.innerHTML).toContain('<ul>');
    expect(textBlock?.innerHTML).toContain('<li>List item 1</li>');
  });

  it('should handle error states gracefully', () => {
    const content: ContentBlock[] = [
      {
        id: '1',
        type: 'image',
        content: 'invalid-url',
        metadata: {
          alt: 'Broken image'
        }
      }
    ];

    new ContentRenderer(container, { content });

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    
    // Simulate image load error
    const errorEvent = new Event('error');
    img?.dispatchEvent(errorEvent);
    
    // Should show fallback content
    const fallback = container.querySelector('.content-block__error');
    expect(fallback).toBeTruthy();
  });
});