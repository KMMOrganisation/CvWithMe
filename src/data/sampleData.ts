import { Module, Lesson, ContentBlock } from './types/index.js';
// import { processCourseMarkdown } from '../utils/courseIntegration.js';

// Sample content blocks for lessons
const sampleContentBlocks: ContentBlock[] = [
  {
    id: 'intro-text-1',
    type: 'text',
    content: 'Welcome to your first lesson in creating a CV website! In this lesson, we\'ll cover the basics of HTML and set up your development environment.',
  },
  {
    id: 'setup-image-1',
    type: 'image',
    content: '/images/vscode-setup.png',
    metadata: {
      alt: 'Visual Studio Code setup screen showing the welcome page',
      caption: 'Visual Studio Code - your new best friend for web development'
    }
  },
  {
    id: 'code-example-1',
    type: 'code',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My CV</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
    metadata: {
      language: 'html',
      caption: 'Your first HTML file structure'
    }
  },
  {
    id: 'callout-1',
    type: 'callout',
    content: '💡 **Pro Tip**: Save your files frequently using Ctrl+S (or Cmd+S on Mac). This will become second nature as you develop!',
  }
];

// Sample lessons for Module 1
const module1Lessons: Lesson[] = [
  {
    id: 1,
    moduleId: 1,
    title: 'Setting Up Your Development Environment',
    slug: 'setup-development-environment',
    description: 'Learn how to install and configure the tools you\'ll need to build your CV website.',
    estimatedTime: '30-45 minutes',
    tools: ['Web Browser', 'Text Editor (VS Code recommended)'],
    complexity: 'Beginner',
    prerequisites: [],
    content: sampleContentBlocks,
    order: 1
  },
  {
    id: 2,
    moduleId: 1,
    title: 'Understanding HTML Basics',
    slug: 'html-basics',
    description: 'Discover the building blocks of web pages and write your first HTML code.',
    estimatedTime: '45-60 minutes',
    tools: ['Text Editor', 'Web Browser'],
    complexity: 'Beginner',
    prerequisites: ['Setting Up Your Development Environment'],
    content: [
      {
        id: 'html-intro-1',
        type: 'text',
        content: 'HTML (HyperText Markup Language) is the foundation of every website. Think of it as the skeleton that gives structure to your web page.',
      },
      {
        id: 'html-demo-1',
        type: 'video',
        content: '/videos/html-basics-demo.mp4',
        metadata: {
          caption: 'Watch how HTML elements create the structure of a webpage',
          autoplay: false
        }
      }
    ],
    order: 2
  },
  {
    id: 3,
    moduleId: 1,
    title: 'Creating Your First Web Page',
    slug: 'first-web-page',
    description: 'Put your HTML knowledge into practice by creating a simple web page.',
    estimatedTime: '60-75 minutes',
    tools: ['Text Editor', 'Web Browser'],
    complexity: 'Beginner',
    prerequisites: ['Understanding HTML Basics'],
    content: [
      {
        id: 'first-page-1',
        type: 'text',
        content: 'Now that you understand HTML basics, let\'s create your very first web page from scratch!',
      }
    ],
    order: 3
  }
];

// Sample modules
export const sampleModules: Module[] = [
  {
    id: 1,
    title: 'Getting Started with Web Development',
    slug: 'getting-started',
    description: 'Learn the fundamentals of web development and set up your development environment. Perfect for absolute beginners with no prior experience.',
    estimatedTime: '3-4 hours',
    complexity: 'Beginner',
    prerequisites: [],
    lessons: module1Lessons,
    order: 1
  },
  {
    id: 2,
    title: 'Building Your CV Structure',
    slug: 'cv-structure',
    description: 'Create the basic HTML structure for your CV, including sections for personal information, experience, and skills.',
    estimatedTime: '2-3 hours',
    complexity: 'Beginner',
    prerequisites: ['Getting Started with Web Development'],
    lessons: [
      {
        id: 4,
        moduleId: 2,
        title: 'Planning Your CV Layout',
        slug: 'planning-cv-layout',
        description: 'Learn how to structure your CV content and plan the sections you\'ll need.',
        estimatedTime: '30-45 minutes',
        tools: ['Pen and Paper', 'Text Editor'],
        complexity: 'Beginner',
        prerequisites: [],
        content: [
          {
            id: 'cv-planning-1',
            type: 'text',
            content: 'Before we start coding, let\'s plan what sections your CV should include and how to organize them effectively.',
          }
        ],
        order: 1
      },
      {
        id: 5,
        moduleId: 2,
        title: 'Creating HTML Sections',
        slug: 'html-sections',
        description: 'Build the main sections of your CV using semantic HTML elements.',
        estimatedTime: '45-60 minutes',
        tools: ['Text Editor', 'Web Browser'],
        complexity: 'Beginner',
        prerequisites: ['Planning Your CV Layout'],
        content: [
          {
            id: 'html-sections-1',
            type: 'text',
            content: 'Let\'s create the main sections of your CV using proper HTML semantic elements like header, main, and section.',
          }
        ],
        order: 2
      }
    ],
    order: 2
  },
  {
    id: 3,
    title: 'Styling with CSS',
    slug: 'styling-css',
    description: 'Make your CV look professional and visually appealing using CSS for colors, fonts, and layout.',
    estimatedTime: '4-5 hours',
    complexity: 'Beginner',
    prerequisites: ['Building Your CV Structure'],
    lessons: [
      {
        id: 6,
        moduleId: 3,
        title: 'CSS Fundamentals',
        slug: 'css-fundamentals',
        description: 'Learn the basics of CSS and how to style your HTML elements.',
        estimatedTime: '60-75 minutes',
        tools: ['Text Editor', 'Web Browser'],
        complexity: 'Beginner',
        prerequisites: [],
        content: [
          {
            id: 'css-intro-1',
            type: 'text',
            content: 'CSS (Cascading Style Sheets) is what makes websites look beautiful. Let\'s learn how to use it to style your CV.',
          }
        ],
        order: 1
      }
    ],
    order: 3
  }
];

// Helper function to get a module by ID
export function getModuleById(id: number): Module | undefined {
  return currentModules.find(module => module.id === id);
}

// Helper function to get a lesson by ID
export function getLessonById(lessonId: number): Lesson | undefined {
  for (const module of currentModules) {
    const lesson = module.lessons.find(lesson => lesson.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

// Helper function to get lessons by module ID
export function getLessonsByModuleId(moduleId: number): Lesson[] {
  const module = getModuleById(moduleId);
  return module ? module.lessons : [];
}

// Helper function to get total lesson count for a module
export function getModuleLessonCount(moduleId: number): number {
  const module = getModuleById(moduleId);
  return module ? module.lessons.length : 0;
}

/**
 * Loads real course content from Course.md and replaces sample data
 */
export async function loadRealCourseData(): Promise<Module[]> {
  try {
    // Import the course loader
    const { loadAndProcessCourse, isCourseContentAvailable } = await import('../utils/loadCourseContent.js');
    
    // Check if Course.md content is available
    const courseAvailable = isCourseContentAvailable();
    
    if (!courseAvailable) {
      console.warn('Course.md content not available, using sample data');
      return sampleModules;
    }
    
    // Load and process the course content
    const realModules = loadAndProcessCourse();
    
    if (realModules.length > 0) {
      console.log(`✅ Successfully loaded ${realModules.length} modules from Course.md`);
      return realModules;
    } else {
      console.warn('⚠️ No modules found in Course.md, falling back to sample data');
      return sampleModules;
    }
  } catch (error) {
    console.error('❌ Error loading Course.md, using sample data:', error);
    return sampleModules;
  }
}

/**
 * Global variable to store the current modules (either real or sample)
 */
let currentModules: Module[] = sampleModules;

/**
 * Updates the current modules data
 */
export function updateModulesData(modules: Module[]): void {
  currentModules = modules;
}

/**
 * Gets the current modules (real or sample)
 */
export function getCurrentModules(): Module[] {
  return currentModules;
}