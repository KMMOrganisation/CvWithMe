#!/usr/bin/env node

/**
 * Content Build Script
 * 
 * This script processes markdown content and generates TypeScript files
 * for the application to consume. It handles:
 * - Parsing markdown files with frontmatter
 * - Validating content structure
 * - Generating TypeScript data files
 * - Asset optimization (future)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  contentDir: path.join(rootDir, 'content'),
  outputDir: path.join(rootDir, 'src/data'),
  assetsDir: path.join(rootDir, 'content/assets'),
  validateContent: true,
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

/**
 * Simple frontmatter parser
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: null, content };
  }
  
  const [, frontmatterYaml, bodyContent] = match;
  
  try {
    // Simple YAML parser for basic key-value pairs
    const frontmatter = {};
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
        // Parse array values
        if (value.startsWith('[') && value.endsWith(']')) {
          const arrayContent = value.slice(1, -1);
          frontmatter[key] = arrayContent
            .split(',')
            .map(item => item.trim().replace(/['"]/g, ''))
            .filter(item => item.length > 0);
        } else {
          frontmatter[key] = [];
        }
      } else if (key === 'order' || key === 'id') {
        frontmatter[key] = parseInt(value, 10);
      } else {
        frontmatter[key] = value.replace(/['"]/g, '');
      }
    }
    
    return { frontmatter, content: bodyContent.trim() };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return { frontmatter: null, content };
  }
}

/**
 * Convert markdown content to content blocks
 */
function parseContentBlocks(markdown) {
  const blocks = [];
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
    } else if (trimmedSection.includes('📹') || trimmedSection.includes('.mp4')) {
      // Video content
      const videoMatch = trimmedSection.match(/📹\s*\[([^\]]*)\]\(([^)]+)\)(?:\s*\n(.*))?/);
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
    } else if (trimmedSection.includes('🎬') || trimmedSection.includes('.gif')) {
      // GIF content
      const gifMatch = trimmedSection.match(/🎬\s*\[([^\]]*)\]\(([^)]+)\)(?:\s*\n(.*))?/);
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
 * Load and parse a lesson file
 */
async function loadLesson(lessonPath, moduleId) {
  try {
    const content = await fs.readFile(lessonPath, 'utf-8');
    const { frontmatter, content: bodyContent } = parseFrontmatter(content);
    
    if (!frontmatter) {
      throw new Error(`Invalid frontmatter in lesson: ${lessonPath}`);
    }
    
    const contentBlocks = parseContentBlocks(bodyContent);
    
    return {
      id: moduleId * 10 + frontmatter.order,
      moduleId,
      title: frontmatter.title,
      slug: createSlug(frontmatter.title),
      description: frontmatter.description,
      estimatedTime: frontmatter.estimatedTime,
      tools: frontmatter.tools || [],
      complexity: frontmatter.complexity,
      prerequisites: frontmatter.prerequisites || [],
      content: contentBlocks,
      order: frontmatter.order
    };
  } catch (error) {
    console.error(`Error loading lesson ${lessonPath}:`, error);
    return null;
  }
}

/**
 * Load and parse a module
 */
async function loadModule(moduleDir) {
  try {
    const modulePath = path.join(moduleDir, 'module.md');
    const lessonsDir = path.join(moduleDir, 'lessons');
    
    // Load module metadata
    const moduleContent = await fs.readFile(modulePath, 'utf-8');
    const { frontmatter } = parseFrontmatter(moduleContent);
    
    if (!frontmatter) {
      throw new Error(`Invalid frontmatter in module: ${modulePath}`);
    }
    
    // Load lessons
    const lessons = [];
    try {
      const lessonFiles = await fs.readdir(lessonsDir);
      const markdownFiles = lessonFiles.filter(file => file.endsWith('.md')).sort();
      
      for (const filename of markdownFiles) {
        const lessonPath = path.join(lessonsDir, filename);
        const lesson = await loadLesson(lessonPath, frontmatter.id);
        
        if (lesson) {
          lessons.push(lesson);
        }
      }
    } catch (error) {
      console.warn(`No lessons directory found for module: ${moduleDir}`);
    }
    
    // Sort lessons by order
    lessons.sort((a, b) => a.order - b.order);
    
    return {
      id: frontmatter.id,
      title: frontmatter.title,
      slug: frontmatter.slug,
      description: frontmatter.description,
      estimatedTime: frontmatter.estimatedTime,
      complexity: frontmatter.complexity,
      prerequisites: frontmatter.prerequisites || [],
      lessons,
      order: frontmatter.order
    };
  } catch (error) {
    console.error(`Error loading module ${moduleDir}:`, error);
    return null;
  }
}

/**
 * Create URL-friendly slug
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Load all modules
 */
async function loadAllModules() {
  const modulesDir = path.join(CONFIG.contentDir, 'modules');
  const modules = [];
  
  try {
    const moduleDirectories = await fs.readdir(modulesDir);
    
    for (const dirName of moduleDirectories) {
      const moduleDir = path.join(modulesDir, dirName);
      const stats = await fs.stat(moduleDir);
      
      if (stats.isDirectory()) {
        const module = await loadModule(moduleDir);
        if (module) {
          modules.push(module);
        }
      }
    }
  } catch (error) {
    console.error('Error loading modules:', error);
    return [];
  }
  
  // Sort modules by order
  return modules.sort((a, b) => a.order - b.order);
}

/**
 * Generate courseContent.ts file
 */
function generateCourseContentFile(modules) {
  const moduleExports = JSON.stringify(modules, null, 2);
  
  return `// This file is auto-generated from markdown content during build
// Do not edit manually - changes will be overwritten

import { Module } from './types/index.js';

/**
 * Course modules loaded from markdown content
 */
export const COURSE_MODULES: Module[] = ${moduleExports};

/**
 * Get all modules
 */
export function getAllModules(): Module[] {
  return COURSE_MODULES;
}

/**
 * Get module by ID
 */
export function getModuleById(id: number): Module | undefined {
  return COURSE_MODULES.find(module => module.id === id);
}

/**
 * Get module by slug
 */
export function getModuleBySlug(slug: string): Module | undefined {
  return COURSE_MODULES.find(module => module.slug === slug);
}

/**
 * Get lesson by ID
 */
export function getLessonById(lessonId: number): { module: Module; lesson: any } | undefined {
  for (const module of COURSE_MODULES) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) {
      return { module, lesson };
    }
  }
  return undefined;
}

/**
 * Course metadata
 */
export const COURSE_METADATA = {
  title: "Code Your Dream Portfolio: From Zero to Web Hero!",
  description: "Ready to build your very own online portfolio, even if you've never written a line of code?",
  totalModules: ${modules.length},
  totalLessons: ${modules.reduce((total, module) => total + module.lessons.length, 0)},
  lastUpdated: "${new Date().toISOString()}"
};
`;
}

/**
 * Validate content structure
 */
function validateContent(modules) {
  const errors = [];
  const warnings = [];
  
  if (modules.length === 0) {
    errors.push('No modules found');
    return { isValid: false, errors, warnings };
  }
  
  modules.forEach((module, moduleIndex) => {
    if (!module.title) {
      errors.push(`Module ${moduleIndex + 1} missing title`);
    }
    
    if (!module.slug) {
      errors.push(`Module ${moduleIndex + 1} missing slug`);
    }
    
    if (module.lessons.length === 0) {
      warnings.push(`Module "${module.title}" has no lessons`);
    }
    
    module.lessons.forEach((lesson, lessonIndex) => {
      if (!lesson.title) {
        errors.push(`Lesson ${lessonIndex + 1} in module "${module.title}" missing title`);
      }
      
      if (!lesson.content || lesson.content.length === 0) {
        warnings.push(`Lesson "${lesson.title}" has no content`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Main build function
 */
async function buildContent() {
  console.log('🚀 Starting content build process...');
  
  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    // Load all modules
    console.log('📖 Loading modules from markdown files...');
    const modules = await loadAllModules();
    
    if (modules.length === 0) {
      console.error('❌ No modules found to process');
      process.exit(1);
    }
    
    console.log(`✅ Loaded ${modules.length} modules with ${modules.reduce((total, m) => total + m.lessons.length, 0)} lessons`);
    
    // Validate content
    if (CONFIG.validateContent) {
      console.log('🔍 Validating content structure...');
      const validation = validateContent(modules);
      
      if (!validation.isValid) {
        console.error('❌ Content validation failed:');
        validation.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
      
      if (validation.warnings.length > 0) {
        console.warn('⚠️  Content validation warnings:');
        validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
      }
      
      console.log('✅ Content validation passed');
    }
    
    // Generate TypeScript files
    console.log('📝 Generating TypeScript files...');
    
    const courseContentTs = generateCourseContentFile(modules);
    const outputPath = path.join(CONFIG.outputDir, 'courseContent.ts');
    
    await fs.writeFile(outputPath, courseContentTs, 'utf-8');
    console.log(`✅ Generated: ${outputPath}`);
    
    // Generate JSON for API consumption
    const modulesJson = JSON.stringify(modules, null, 2);
    const jsonPath = path.join(CONFIG.outputDir, 'modules.json');
    
    await fs.writeFile(jsonPath, modulesJson, 'utf-8');
    console.log(`✅ Generated: ${jsonPath}`);
    
    console.log('🎉 Content build completed successfully!');
    
    // Print summary
    console.log('\n📊 Build Summary:');
    console.log(`  Modules processed: ${modules.length}`);
    console.log(`  Lessons processed: ${modules.reduce((total, m) => total + m.lessons.length, 0)}`);
    console.log(`  Output files: 2`);
    
  } catch (error) {
    console.error('❌ Content build failed:', error);
    process.exit(1);
  }
}

// Run the build if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildContent();
}

export { buildContent, loadAllModules, validateContent };