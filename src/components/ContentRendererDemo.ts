/**
 * ContentRenderer Demo Component
 * 
 * Demonstrates the ContentRenderer component with various content types
 */

import { ContentRenderer, ContentRendererProps } from './ContentRenderer.js';
import { ContentBlock } from '../data/types/index.js';

// Sample content blocks for demonstration
const sampleContent: ContentBlock[] = [
  {
    id: 'text-1',
    type: 'text',
    content: 'Welcome to the **ContentRenderer** demo! This component can handle *multiple* content types including `inline code`, **bold text**, and *italic text*.\n\nThis is a new paragraph with some more content to demonstrate text rendering capabilities.'
  },
  {
    id: 'callout-1',
    type: 'callout',
    content: '💡 **Tip:** This is a helpful tip callout that provides additional information to learners.'
  },
  {
    id: 'code-1',
    type: 'code',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first webpage!</p>
</body>
</html>`,
    metadata: {
      language: 'html',
      caption: 'Basic HTML structure for a portfolio page'
    }
  },
  {
    id: 'callout-2',
    type: 'callout',
    content: '⚠️ **Warning:** Make sure to save your files before refreshing the browser to see changes.'
  },
  {
    id: 'code-2',
    type: 'code',
    content: `body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}`,
    metadata: {
      language: 'css',
      caption: 'Basic CSS styling for the portfolio'
    }
  },
  {
    id: 'image-1',
    type: 'image',
    content: 'https://via.placeholder.com/600x300/627d98/ffffff?text=Sample+Image',
    metadata: {
      alt: 'Sample placeholder image demonstrating image rendering',
      caption: 'This is how images appear in lesson content'
    }
  },
  {
    id: 'text-2',
    type: 'text',
    content: 'The ContentRenderer supports **lazy loading** for images and videos, which improves page performance. It also includes proper `accessibility` features like alt text and ARIA labels.'
  },
  {
    id: 'callout-3',
    type: 'callout',
    content: '📝 **Note:** All code blocks include a copy button for easy copying to your text editor.'
  },
  {
    id: 'code-3',
    type: 'code',
    content: `const greeting = "Hello, World!";
console.log(greeting);

function createPortfolio() {
  const portfolio = {
    name: "My Portfolio",
    sections: ["home", "about", "projects", "contact"]
  };
  
  return portfolio;
}

const myPortfolio = createPortfolio();`,
    metadata: {
      language: 'javascript',
      caption: 'JavaScript code example with syntax highlighting'
    }
  },
  {
    id: 'callout-4',
    type: 'callout',
    content: '❗ **Important:** Remember to test your website in different browsers to ensure compatibility.'
  }
];

export class ContentRendererDemo {
  private container: HTMLElement;
  private contentRenderer?: ContentRenderer;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="demo-section">
        <h2>ContentRenderer Component Demo</h2>
        <p>This demo showcases the ContentRenderer component's ability to handle various content types including text, code blocks, callouts, and images with proper accessibility and responsive design.</p>
        
        <div class="content-demo-container">
          <div id="content-renderer-demo"></div>
        </div>
        
        <div class="demo-controls">
          <button id="reload-content" class="btn btn-primary">Reload Content</button>
          <button id="add-content" class="btn btn-secondary">Add Sample Block</button>
          <button id="clear-content" class="btn btn-outline">Clear Content</button>
        </div>
        
        <div class="demo-info">
          <h3>Features Demonstrated:</h3>
          <ul>
            <li>✅ Rich text formatting (bold, italic, inline code)</li>
            <li>✅ Code blocks with syntax highlighting and copy functionality</li>
            <li>✅ Multiple callout types (tip, warning, note, important)</li>
            <li>✅ Image rendering with lazy loading and captions</li>
            <li>✅ Responsive design and accessibility features</li>
            <li>✅ Error handling for failed media loads</li>
            <li>✅ Proper ARIA labels and keyboard navigation</li>
          </ul>
        </div>
      </div>
    `;

    this.setupContentRenderer();
    this.setupEventListeners();
  }

  private setupContentRenderer(): void {
    const contentContainer = this.container.querySelector('#content-renderer-demo') as HTMLElement;
    if (contentContainer) {
      this.contentRenderer = new ContentRenderer(contentContainer, {
        content: sampleContent,
        className: 'demo-content'
      });
    }
  }

  private setupEventListeners(): void {
    const reloadBtn = this.container.querySelector('#reload-content') as HTMLButtonElement;
    const addBtn = this.container.querySelector('#add-content') as HTMLButtonElement;
    const clearBtn = this.container.querySelector('#clear-content') as HTMLButtonElement;

    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        this.contentRenderer?.updateContent(sampleContent);
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const newBlock: ContentBlock = {
          id: `dynamic-${Date.now()}`,
          type: 'callout',
          content: `🎉 **Dynamic Content:** This block was added at ${new Date().toLocaleTimeString()}!`
        };
        
        const currentContent = [...sampleContent, newBlock];
        this.contentRenderer?.updateContent(currentContent);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.contentRenderer?.updateContent([]);
      });
    }
  }

  public destroy(): void {
    this.contentRenderer?.destroy();
  }
}

// Factory function for easier usage
export function createContentRendererDemo(container: HTMLElement): ContentRendererDemo {
  return new ContentRendererDemo(container);
}