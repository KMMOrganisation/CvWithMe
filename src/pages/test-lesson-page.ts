/**
 * Test page for LessonPage component with ContentRenderer
 */

import { LessonPage } from './LessonPage.js';
import { ContentRendererDemo } from '../components/ContentRendererDemo.js';
import { Lesson } from '../data/types/index.js';

// Sample lesson with rich content for testing
const sampleLesson: Lesson = {
  id: 1,
  moduleId: 1,
  title: "Creating Your First HTML Page",
  slug: "creating-first-html-page",
  description: "Learn how to create a basic HTML page structure and add your first content using proper HTML tags and semantic markup.",
  estimatedTime: "30-45 minutes",
  tools: ["VS Code", "Web Browser", "Text Editor"],
  complexity: "Beginner",
  prerequisites: ["Basic computer skills", "Text editor installed"],
  content: [
    {
      id: 'intro-text',
      type: 'text',
      content: 'Welcome to your first HTML lesson! In this lesson, you\'ll learn how to create a **basic HTML page** from scratch. HTML (HyperText Markup Language) is the foundation of every website on the internet.\n\nBy the end of this lesson, you\'ll have created your very own webpage with proper structure and content.'
    },
    {
      id: 'tip-callout',
      type: 'callout',
      content: '💡 **Tip:** Don\'t worry if HTML seems confusing at first. We\'ll go step by step, and you\'ll be writing HTML like a pro in no time!'
    },
    {
      id: 'html-structure',
      type: 'code',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Webpage</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first paragraph on the web!</p>
</body>
</html>`,
      metadata: {
        language: 'html',
        caption: 'Basic HTML document structure - this is the foundation of every webpage'
      }
    },
    {
      id: 'explanation-text',
      type: 'text',
      content: 'Let\'s break down what each part of this HTML code does:\n\n- `<!DOCTYPE html>` tells the browser this is an HTML5 document\n- `<html>` is the root element that contains all other elements\n- `<head>` contains metadata about the page (not visible to users)\n- `<body>` contains all the visible content of your webpage'
    },
    {
      id: 'warning-callout',
      type: 'callout',
      content: '⚠️ **Important:** Make sure to always close your HTML tags! Every opening tag like `<h1>` needs a closing tag like `</h1>`. This is crucial for proper HTML structure.'
    },
    {
      id: 'demo-image',
      type: 'image',
      content: 'https://via.placeholder.com/600x300/627d98/ffffff?text=HTML+Structure+Diagram',
      metadata: {
        alt: 'Diagram showing HTML document structure with head and body sections',
        caption: 'Visual representation of HTML document structure'
      }
    },
    {
      id: 'adding-content',
      type: 'text',
      content: 'Now let\'s add some more content to make our page more interesting. We\'ll add different types of headings and paragraphs to create a proper page structure.'
    },
    {
      id: 'enhanced-html',
      type: 'code',
      content: `<body>
    <h1>Welcome to My Portfolio</h1>
    <h2>About Me</h2>
    <p>Hi! I'm learning web development and this is my first website.</p>
    <p>I'm excited to learn HTML, CSS, and JavaScript to build amazing websites!</p>
    
    <h2>My Goals</h2>
    <p>Here are some things I want to accomplish:</p>
    <ul>
        <li>Learn HTML fundamentals</li>
        <li>Master CSS styling</li>
        <li>Build interactive features with JavaScript</li>
        <li>Create a professional portfolio</li>
    </ul>
</body>`,
      metadata: {
        language: 'html',
        caption: 'Enhanced HTML with headings, paragraphs, and a list'
      }
    },
    {
      id: 'note-callout',
      type: 'callout',
      content: '📝 **Note:** Notice how we use `<h1>` for the main title and `<h2>` for section headings. This creates a proper hierarchy that helps both users and search engines understand your content structure.'
    },
    {
      id: 'next-steps',
      type: 'text',
      content: 'Congratulations! You\'ve just created your first HTML page with proper structure and content. In the next lesson, we\'ll learn how to style this page with CSS to make it look beautiful and professional.\n\n**Remember to save your file** and open it in your web browser to see your creation come to life!'
    }
  ],
  order: 1
};

function createTestLessonPage(): void {
  console.log('🧪 Creating test lesson page...');

  // Create main container
  const container = document.createElement('div');
  container.id = 'test-lesson-container';
  document.body.appendChild(container);

  // Create lesson page with enhanced props
  const lessonPage = new LessonPage(container, {
    lesson: sampleLesson,
    module: {
      id: 1,
      title: "Getting Started with HTML",
      slug: "getting-started-html",
      totalLessons: 5
    },
    currentLessonIndex: 0, // First lesson (0-based index)
    onNavigateBack: () => {
      console.log('Navigate back to module');
      alert('Navigate back to module (demo)');
    },
    onNavigatePrevious: () => {
      console.log('Navigate to previous lesson');
      alert('Navigate to previous lesson (demo)');
    },
    onNavigateNext: () => {
      console.log('Navigate to next lesson');
      alert('Navigate to next lesson (demo)');
    },
    onNavigateToModule: (moduleSlug: string) => {
      console.log(`Navigate to module: ${moduleSlug}`);
      alert(`Navigate to module: ${moduleSlug} (demo)`);
    }
  });

  console.log('✅ Test lesson page created successfully!');

  // Add demo section
  const demoContainer = document.createElement('div');
  demoContainer.id = 'content-renderer-demo-section';
  demoContainer.style.marginTop = '4rem';
  demoContainer.style.padding = '2rem';
  demoContainer.style.backgroundColor = 'var(--gray-50)';
  demoContainer.style.borderRadius = 'var(--radius-lg)';
  document.body.appendChild(demoContainer);

  const demo = new ContentRendererDemo(demoContainer);
  console.log('✅ ContentRenderer demo added!');

  // Add cleanup function to window for testing
  (window as any).cleanupTestLessonPage = () => {
    lessonPage.destroy();
    demo.destroy();
    container.remove();
    demoContainer.remove();
    console.log('🧹 Test lesson page cleaned up');
  };

  console.log('💡 Use window.cleanupTestLessonPage() to clean up the test');
}

// Auto-run when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTestLessonPage);
  } else {
    createTestLessonPage();
  }
}

export { createTestLessonPage };