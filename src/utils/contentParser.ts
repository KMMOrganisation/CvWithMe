import { ContentBlock, Module, Lesson } from '../data/types/index.js';

// Interface for markdown frontmatter
export interface LessonFrontmatter {
  title: string;
  description: string;
  estimatedTime: string;
  tools: string[];
  complexity: string;
  prerequisites?: string[];
  order: number;
}

// Interface for parsed Course.md structure
export interface ParsedCourse {
  title: string;
  description: string;
  modules: Module[];
}

// Interface for extracted lesson metadata
export interface LessonMetadata {
  title: string;
  estimatedTime: string;
  tools: string[];
  complexity: string;
  videoScript?: string;
  slideDecks?: string[];
  codeExamples?: string[];
}

// Interface for parsed markdown content
export interface ParsedMarkdownLesson {
  frontmatter: LessonFrontmatter;
  content: ContentBlock[];
}

/**
 * Parses markdown frontmatter from the beginning of a markdown string
 */
export function parseFrontmatter(markdown: string): { frontmatter: LessonFrontmatter | null; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: null, content: markdown };
  }
  
  const [, frontmatterYaml, content] = match;
  
  try {
    // Simple YAML parser for frontmatter (basic key-value pairs)
    const frontmatter: Partial<LessonFrontmatter> = {};
    const lines = frontmatterYaml.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();
      
      // Handle different value types
      if (key === 'tools' || key === 'prerequisites') {
        // Parse array values (e.g., "['item1', 'item2']" or "- item1\n- item2")
        if (value.startsWith('[') && value.endsWith(']')) {
          const arrayContent = value.slice(1, -1);
          (frontmatter as any)[key] = arrayContent
            .split(',')
            .map(item => item.trim().replace(/['"]/g, ''))
            .filter(item => item.length > 0);
        } else {
          (frontmatter as any)[key] = [];
        }
      } else if (key === 'order') {
        (frontmatter as any)[key] = parseInt(value, 10);
      } else {
        (frontmatter as any)[key] = value.replace(/['"]/g, '');
      }
    }
    
    return { 
      frontmatter: frontmatter as LessonFrontmatter, 
      content: content.trim() 
    };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return { frontmatter: null, content: markdown };
  }
}

/**
 * Converts markdown content to ContentBlock array
 */
export function parseMarkdownToContentBlocks(markdown: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockId = 1;
  
  // Split content by double newlines to separate blocks
  const sections = markdown.split(/\n\s*\n/);
  
  for (const section of sections) {
    const trimmedSection = section.trim();
    if (!trimmedSection) continue;
    
    // Check for different content types
    if (trimmedSection.startsWith('```')) {
      // Code block
      const codeMatch = trimmedSection.match(/^```(\w+)?\s*\n([\s\S]*?)\n```$/);
      if (codeMatch) {
        const [, language, code] = codeMatch;
        blocks.push({
          id: `code-block-${blockId++}`,
          type: 'code',
          content: code.trim(),
          metadata: {
            language: language || 'text'
          }
        });
      }
    } else if (trimmedSection.startsWith('![')) {
      // Image
      const imageMatch = trimmedSection.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*\n(.*))?$/);
      if (imageMatch) {
        const [, alt, src, caption] = imageMatch;
        blocks.push({
          id: `image-${blockId++}`,
          type: 'image',
          content: src,
          metadata: {
            alt: alt || '',
            caption: caption?.trim() || undefined
          }
        });
      }
    } else if (trimmedSection.includes('📹') || trimmedSection.includes('.mp4') || trimmedSection.includes('.webm')) {
      // Video content
      const videoMatch = trimmedSection.match(/(?:📹\s*)?(?:\[([^\]]*)\])?\(([^)]+\.(?:mp4|webm|avi))\)(?:\s*\n(.*))?/);
      if (videoMatch) {
        const [, title, src, caption] = videoMatch;
        blocks.push({
          id: `video-${blockId++}`,
          type: 'video',
          content: src,
          metadata: {
            caption: caption?.trim() || title || undefined,
            autoplay: false
          }
        });
      }
    } else if (trimmedSection.includes('.gif') || trimmedSection.startsWith('🎬')) {
      // GIF content
      const gifMatch = trimmedSection.match(/(?:🎬\s*)?(?:\[([^\]]*)\])?\(([^)]+\.gif)\)(?:\s*\n(.*))?/);
      if (gifMatch) {
        const [, title, src, caption] = gifMatch;
        blocks.push({
          id: `gif-${blockId++}`,
          type: 'gif',
          content: src,
          metadata: {
            caption: caption?.trim() || title || undefined,
            loop: true
          }
        });
      }
    } else if (trimmedSection.startsWith('💡') || trimmedSection.startsWith('⚠️') || trimmedSection.startsWith('📝')) {
      // Callout/Note
      blocks.push({
        id: `callout-${blockId++}`,
        type: 'callout',
        content: trimmedSection
      });
    } else {
      // Regular text content
      blocks.push({
        id: `text-${blockId++}`,
        type: 'text',
        content: trimmedSection
      });
    }
  }
  
  return blocks;
}

/**
 * Main function to parse a complete markdown lesson file
 */
export function parseMarkdownLesson(markdown: string): ParsedMarkdownLesson | null {
  try {
    const { frontmatter, content } = parseFrontmatter(markdown);
    
    if (!frontmatter) {
      throw new Error('Missing or invalid frontmatter');
    }
    
    const contentBlocks = parseMarkdownToContentBlocks(content);
    
    return {
      frontmatter,
      content: contentBlocks
    };
  } catch (error) {
    console.error('Error parsing markdown lesson:', error);
    return null;
  }
}

/**
 * Validates that a markdown lesson has all required fields
 */
export function validateLessonContent(lesson: ParsedMarkdownLesson): string[] {
  const errors: string[] = [];
  
  if (!lesson.frontmatter.title) {
    errors.push('Missing required field: title');
  }
  
  if (!lesson.frontmatter.description) {
    errors.push('Missing required field: description');
  }
  
  if (!lesson.frontmatter.estimatedTime) {
    errors.push('Missing required field: estimatedTime');
  }
  
  if (!lesson.frontmatter.complexity) {
    errors.push('Missing required field: complexity');
  }
  
  if (typeof lesson.frontmatter.order !== 'number') {
    errors.push('Missing or invalid field: order (must be a number)');
  }
  
  if (!Array.isArray(lesson.frontmatter.tools)) {
    errors.push('Invalid field: tools (must be an array)');
  }
  
  if (lesson.content.length === 0) {
    errors.push('Lesson content cannot be empty');
  }
  
  return errors;
}

/**
 * Parses the Course.md file to extract modules and lessons
 */
export function parseCourseMarkdown(courseContent: string): ParsedCourse | null {
  try {
    const lines = courseContent.split('\n');
    let currentIndex = 0;
    
    // Extract course title and description
    const courseTitle = extractCourseTitle(lines);
    const courseDescription = extractCourseDescription(lines);
    
    // Parse modules and lessons
    const modules = parseModulesFromCourse(courseContent);
    
    return {
      title: courseTitle,
      description: courseDescription,
      modules
    };
  } catch (error) {
    console.error('Error parsing Course.md:', error);
    return null;
  }
}

/**
 * Extracts the course title from Course.md
 */
function extractCourseTitle(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### **Course Title:')) {
      return trimmed
        .replace('### **Course Title:', '')
        .replace(/\*\*/g, '')
        .replace(/\\!/g, '!')
        .trim();
    }
  }
  return 'Code Your Dream Portfolio: From Zero to Web Hero!';
}

/**
 * Extracts the course description from Course.md
 */
function extractCourseDescription(lines: string[]): string {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('**Course Description:**')) {
      return line
        .replace('**Course Description:**', '')
        .trim();
    }
  }
  return 'Ready to build your very own online portfolio, even if you\'ve never written a line of code?';
}

/**
 * Parses modules from the course content
 */
function parseModulesFromCourse(courseContent: string): Module[] {
  const modules: Module[] = [];
  
  // Split by section headers (### **Section X:)
  const sectionRegex = /### \*\*Section (\d+): ([^*]+)\*\*/g;
  const sections = courseContent.split(sectionRegex);
  
  let moduleId = 1;
  
  for (let i = 1; i < sections.length; i += 3) {
    const sectionNumber = parseInt(sections[i], 10);
    const sectionTitle = sections[i + 1].trim();
    const sectionContent = sections[i + 2] || '';
    
    // Parse lessons from this section
    const lessons = parseLessonsFromSection(sectionContent, moduleId);
    
    // Calculate estimated time from lessons
    const totalMinutes = lessons.reduce((total, lesson) => {
      const timeMatch = lesson.estimatedTime.match(/(\d+)-?(\d+)?/);
      if (timeMatch) {
        const min = parseInt(timeMatch[1], 10);
        const max = timeMatch[2] ? parseInt(timeMatch[2], 10) : min;
        return total + Math.ceil((min + max) / 2);
      }
      return total + 30; // default 30 minutes
    }, 0);
    
    const estimatedHours = Math.ceil(totalMinutes / 60);
    
    modules.push({
      id: moduleId,
      title: sectionTitle,
      slug: createSlug(sectionTitle),
      description: generateModuleDescription(sectionTitle, lessons.length),
      estimatedTime: `${estimatedHours}-${estimatedHours + 1} hours`,
      complexity: 'Beginner' as const,
      prerequisites: moduleId > 1 ? [modules[moduleId - 2].title] : [],
      lessons,
      order: moduleId
    });
    
    moduleId++;
  }
  
  return modules;
}

/**
 * Parses lessons from a section content
 */
function parseLessonsFromSection(sectionContent: string, moduleId: number): Lesson[] {
  const lessons: Lesson[] = [];
  
  // Split by lesson headers (#### **Lesson X.Y:)
  const lessonRegex = /#### \*\*Lesson (\d+)\.(\d+): ([^*]+)\*\*/g;
  const lessonParts = sectionContent.split(lessonRegex);
  
  let lessonId = (moduleId - 1) * 10 + 1; // Ensure unique lesson IDs across modules
  
  for (let i = 1; i < lessonParts.length; i += 4) {
    const sectionNum = parseInt(lessonParts[i], 10);
    const lessonNum = parseInt(lessonParts[i + 1], 10);
    const lessonTitle = lessonParts[i + 2].trim();
    const lessonContent = lessonParts[i + 3] || '';
    
    // Extract lesson metadata and content
    const metadata = extractLessonMetadata(lessonContent);
    const contentBlocks = parseLessonContent(lessonContent);
    
    lessons.push({
      id: lessonId,
      moduleId,
      title: lessonTitle,
      slug: createSlug(lessonTitle),
      description: generateLessonDescription(lessonTitle),
      estimatedTime: metadata.estimatedTime,
      tools: metadata.tools,
      complexity: metadata.complexity,
      prerequisites: lessonId > (moduleId - 1) * 10 + 1 ? [lessons[lessons.length - 1]?.title] : [],
      content: contentBlocks,
      order: lessonNum
    });
    
    lessonId++;
  }
  
  return lessons;
}

/**
 * Extracts metadata from lesson content (video scripts, slide decks, etc.)
 */
function extractLessonMetadata(lessonContent: string): LessonMetadata {
  const metadata: LessonMetadata = {
    title: '',
    estimatedTime: '30-45 minutes',
    tools: ['Text Editor', 'Web Browser'],
    complexity: 'Beginner'
  };
  
  // Extract video script duration for time estimation
  const videoScriptMatch = lessonContent.match(/\*\*Video Script:\*\*/);
  if (videoScriptMatch) {
    // Look for time markers in video script
    const timeMarkers = lessonContent.match(/\(\d+:\d+-\d+:\d+\)/g);
    if (timeMarkers && timeMarkers.length > 0) {
      const lastMarker = timeMarkers[timeMarkers.length - 1];
      const timeMatch = lastMarker.match(/\((\d+):(\d+)-(\d+):(\d+)\)/);
      if (timeMatch) {
        const endMinutes = parseInt(timeMatch[3], 10);
        const endSeconds = parseInt(timeMatch[4], 10);
        const totalMinutes = endMinutes + Math.ceil(endSeconds / 60);
        metadata.estimatedTime = `${totalMinutes}-${totalMinutes + 15} minutes`;
      }
    }
  }
  
  // Extract tools from content
  const toolsMatch = lessonContent.match(/(?:tools?|software|need|require)[^.]*?(?:VS Code|Visual Studio Code|Text Editor|Web Browser|Chrome|Firefox|Edge)/gi);
  if (toolsMatch) {
    const tools = new Set<string>();
    toolsMatch.forEach(match => {
      if (match.toLowerCase().includes('vs code') || match.toLowerCase().includes('visual studio code')) {
        tools.add('VS Code');
      }
      if (match.toLowerCase().includes('text editor')) {
        tools.add('Text Editor');
      }
      if (match.toLowerCase().includes('web browser') || match.toLowerCase().includes('browser')) {
        tools.add('Web Browser');
      }
      if (match.toLowerCase().includes('chrome')) {
        tools.add('Google Chrome');
      }
      if (match.toLowerCase().includes('firefox')) {
        tools.add('Mozilla Firefox');
      }
    });
    metadata.tools = Array.from(tools);
  }
  
  return metadata;
}

/**
 * Parses lesson content into ContentBlock array
 */
function parseLessonContent(lessonContent: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockId = 1;
  
  // Split content into sections
  const sections = lessonContent.split(/\*\*(?:Video Script|Slide Deck Example):\*\*/);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;
    
    if (i === 0) {
      // This is content before video script or slide deck
      const textBlocks = parseTextContent(section, blockId);
      blocks.push(...textBlocks);
      blockId += textBlocks.length;
    } else if (section.includes('HOST ON SCREEN') || section.includes('SCREENSHARE')) {
      // This is a video script section
      blocks.push({
        id: `video-script-${blockId++}`,
        type: 'callout',
        content: `🎬 **Video Script Available**\n\nThis lesson includes a detailed video script with step-by-step instructions and visual demonstrations.`
      });
    } else if (section.includes('Slide') || section.includes('Headline')) {
      // This is a slide deck section
      const slideBlocks = parseSlideContent(section, blockId);
      blocks.push(...slideBlocks);
      blockId += slideBlocks.length;
    }
  }
  
  return blocks;
}

/**
 * Parses text content into ContentBlocks
 */
function parseTextContent(content: string, startId: number): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockId = startId;
  
  // Split by paragraphs and process each
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    
    // Check for code blocks
    if (trimmed.includes('```') || trimmed.includes('HTML') || trimmed.includes('<')) {
      const codeMatch = trimmed.match(/```(\w+)?\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        const [, language, code] = codeMatch;
        blocks.push({
          id: `code-${blockId++}`,
          type: 'code',
          content: code.trim(),
          metadata: {
            language: language || 'html'
          }
        });
        continue;
      }
      
      // Check for inline HTML code
      if (trimmed.includes('<') && trimmed.includes('>')) {
        blocks.push({
          id: `code-${blockId++}`,
          type: 'code',
          content: trimmed,
          metadata: {
            language: 'html'
          }
        });
        continue;
      }
    }
    
    // Check for callouts/tips
    if (trimmed.includes('💡') || trimmed.includes('⚠️') || trimmed.includes('📝') || 
        trimmed.includes('**Pro Tip') || trimmed.includes('**Important') || 
        trimmed.includes('**Note')) {
      blocks.push({
        id: `callout-${blockId++}`,
        type: 'callout',
        content: trimmed
      });
      continue;
    }
    
    // Regular text content
    blocks.push({
      id: `text-${blockId++}`,
      type: 'text',
      content: trimmed
    });
  }
  
  return blocks;
}

/**
 * Parses slide deck content into ContentBlocks
 */
function parseSlideContent(slideContent: string, startId: number): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockId = startId;
  
  // Add a callout for slide deck availability
  blocks.push({
    id: `slides-${blockId++}`,
    type: 'callout',
    content: `📊 **Slide Deck Available**\n\nThis lesson includes a comprehensive slide deck with visual examples and step-by-step instructions.`
  });
  
  // Extract key slide content
  const slides = slideContent.split(/\* \*\*Slide \d+:/);
  
  for (let i = 1; i < slides.length; i++) {
    const slide = slides[i].trim();
    const headlineMatch = slide.match(/\*\*Headline:\*\* (.+)/);
    const contentMatch = slide.match(/\*\*Content:\*\*([\s\S]*?)(?:\*\*Image:|$)/);
    
    if (headlineMatch) {
      const headline = headlineMatch[1].trim();
      let content = headline;
      
      if (contentMatch) {
        const slideContent = contentMatch[1].trim();
        content = `**${headline}**\n\n${slideContent}`;
      }
      
      blocks.push({
        id: `slide-content-${blockId++}`,
        type: 'text',
        content: content
      });
    }
  }
  
  return blocks;
}

/**
 * Creates a URL-friendly slug from a title
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Generates a description for a module based on its title and lesson count
 */
function generateModuleDescription(title: string, lessonCount: number): string {
  const descriptions: Record<string, string> = {
    'Your First Lines of Code - Setting Up for Success': 'Learn the fundamentals of web development and set up your development environment. Perfect for absolute beginners with no prior experience.',
    'Styling Your Site with CSS - Making it Pretty!': 'Transform your basic HTML into a beautiful, professional-looking website using CSS for colors, fonts, and layout.',
    'Adding Interactivity with JavaScript': 'Bring your website to life with interactive elements and dynamic functionality using JavaScript.',
    'Making Your Site Responsive': 'Ensure your website looks great on all devices with responsive design techniques and mobile optimization.',
    'Publishing Your Portfolio': 'Learn how to deploy your finished CV website to the internet so others can see your work.'
  };
  
  return descriptions[title] || `Master the concepts in this module through ${lessonCount} comprehensive lessons designed for beginners.`;
}

/**
 * Generates a description for a lesson based on its title
 */
function generateLessonDescription(title: string): string {
  const descriptions: Record<string, string> = {
    'Welcome! Your Digital Workshop': 'Set up your development environment and get familiar with the tools you\'ll use to build your website.',
    'Your First Webpage: `index.html`': 'Create your very first HTML file and understand the basic structure of a web page.',
    'Adding Your First Content: Headings and Paragraphs': 'Learn how to add text content to your webpage using HTML headings and paragraphs.',
    'Exploring Your Portfolio\'s Sections (HTML Dive)': 'Structure your portfolio into logical sections and understand semantic HTML elements.',
    'Your Style Sheet: `style.css`': 'Create your first CSS file and learn how to connect it to your HTML for styling.'
  };
  
  return descriptions[title] || `Learn essential web development concepts through hands-on practice and clear explanations.`;
}

/**
 * Validates parsed course content
 */
export function validateCourseContent(course: ParsedCourse): string[] {
  const errors: string[] = [];
  
  if (!course.title) {
    errors.push('Course title is missing');
  }
  
  if (!course.description) {
    errors.push('Course description is missing');
  }
  
  if (!course.modules || course.modules.length === 0) {
    errors.push('No modules found in course');
  }
  
  course.modules.forEach((module, index) => {
    if (!module.title) {
      errors.push(`Module ${index + 1} is missing a title`);
    }
    
    if (!module.lessons || module.lessons.length === 0) {
      errors.push(`Module "${module.title}" has no lessons`);
    }
    
    module.lessons.forEach((lesson, lessonIndex) => {
      if (!lesson.title) {
        errors.push(`Lesson ${lessonIndex + 1} in module "${module.title}" is missing a title`);
      }
      
      if (!lesson.content || lesson.content.length === 0) {
        errors.push(`Lesson "${lesson.title}" has no content`);
      }
    });
  });
  
  return errors;
}

/**
 * Sample markdown content for testing
 */
export const sampleMarkdownLesson = `---
title: "Setting Up Your Development Environment"
description: "Learn how to install and configure the tools you'll need to build your CV website."
estimatedTime: "30-45 minutes"
tools: ['Web Browser', 'Text Editor (VS Code recommended)']
complexity: "Beginner"
prerequisites: []
order: 1
---

# Setting Up Your Development Environment

Welcome to your first lesson in creating a CV website! In this lesson, we'll cover the basics of setting up your development environment.

## What You'll Need

Before we start coding, you'll need to install a few essential tools:

💡 **Pro Tip**: Don't worry if this seems overwhelming at first. We'll go through each step together!

### Text Editor

We recommend Visual Studio Code (VS Code) as your text editor. It's free, powerful, and beginner-friendly.

![VS Code Interface](images/vscode-setup.png)
*Visual Studio Code - your new best friend for web development*

### Web Browser

You'll need a modern web browser to test your website. We recommend:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge

## Your First HTML File

Let's create your very first HTML file:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My CV</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
\`\`\`

📹 [Watch the setup process](videos/vscode-setup-demo.mp4)
*Step-by-step guide to setting up VS Code*

⚠️ **Important**: Make sure to save your file with the .html extension so your browser recognizes it as a web page.

## Next Steps

Congratulations! You've set up your development environment. In the next lesson, we'll dive deeper into HTML basics.`;