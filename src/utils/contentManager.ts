import { Module, Lesson, ContentBlock } from '../data/types/index.js';
import { 
  parseFrontmatter, 
  parseMarkdownToContentBlocks, 
  validateLessonContent,
  ParsedMarkdownLesson,
  LessonFrontmatter 
} from './contentParser.js';
import { validateModule, validateModules, ValidationResult } from './contentValidator.js';

// Interface for module frontmatter
export interface ModuleFrontmatter {
  id: number;
  title: string;
  slug: string;
  description: string;
  estimatedTime: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  order: number;
}

// Interface for parsed module
export interface ParsedModule {
  frontmatter: ModuleFrontmatter;
  content: string;
  lessons: ParsedMarkdownLesson[];
}

// Content management configuration
export interface ContentConfig {
  contentDir: string;
  assetsDir: string;
  cacheEnabled: boolean;
  validateOnLoad: boolean;
}

// Default configuration
export const DEFAULT_CONTENT_CONFIG: ContentConfig = {
  contentDir: 'content',
  assetsDir: 'content/assets',
  cacheEnabled: true,
  validateOnLoad: true
};

/**
 * Content Manager class for handling markdown-based content
 */
export class ContentManager {
  private config: ContentConfig;
  private moduleCache: Map<string, ParsedModule> = new Map();
  private lessonCache: Map<string, ParsedMarkdownLesson> = new Map();

  constructor(config: Partial<ContentConfig> = {}) {
    this.config = { ...DEFAULT_CONTENT_CONFIG, ...config };
  }

  /**
   * Loads and parses a module from markdown file
   */
  async loadModule(moduleSlug: string): Promise<ParsedModule | null> {
    const cacheKey = `module-${moduleSlug}`;
    
    if (this.config.cacheEnabled && this.moduleCache.has(cacheKey)) {
      return this.moduleCache.get(cacheKey)!;
    }

    try {
      const modulePath = `${this.config.contentDir}/modules/${moduleSlug}/module.md`;
      const moduleContent = await this.loadFile(modulePath);
      
      if (!moduleContent) {
        console.warn(`Module file not found: ${modulePath}`);
        return null;
      }

      const { frontmatter, content } = parseFrontmatter(moduleContent);
      
      if (!frontmatter) {
        throw new Error(`Invalid frontmatter in module: ${moduleSlug}`);
      }

      // Load lessons for this module
      const lessons = await this.loadModuleLessons(moduleSlug);

      const parsedModule: ParsedModule = {
        frontmatter: frontmatter as ModuleFrontmatter,
        content,
        lessons
      };

      if (this.config.cacheEnabled) {
        this.moduleCache.set(cacheKey, parsedModule);
      }

      return parsedModule;
    } catch (error) {
      console.error(`Error loading module ${moduleSlug}:`, error);
      return null;
    }
  }

  /**
   * Loads all lessons for a module
   */
  async loadModuleLessons(moduleSlug: string): Promise<ParsedMarkdownLesson[]> {
    try {
      const lessonsDir = `${this.config.contentDir}/modules/${moduleSlug}/lessons`;
      const lessonFiles = await this.listFiles(lessonsDir, '.md');
      
      const lessons: ParsedMarkdownLesson[] = [];
      
      for (const filename of lessonFiles.sort()) {
        const lessonPath = `${lessonsDir}/${filename}`;
        const lesson = await this.loadLesson(lessonPath);
        
        if (lesson) {
          lessons.push(lesson);
        }
      }

      // Sort lessons by order
      return lessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
    } catch (error) {
      console.error(`Error loading lessons for module ${moduleSlug}:`, error);
      return [];
    }
  }

  /**
   * Loads and parses a lesson from markdown file
   */
  async loadLesson(lessonPath: string): Promise<ParsedMarkdownLesson | null> {
    const cacheKey = `lesson-${lessonPath}`;
    
    if (this.config.cacheEnabled && this.lessonCache.has(cacheKey)) {
      return this.lessonCache.get(cacheKey)!;
    }

    try {
      const lessonContent = await this.loadFile(lessonPath);
      
      if (!lessonContent) {
        console.warn(`Lesson file not found: ${lessonPath}`);
        return null;
      }

      const { frontmatter, content } = parseFrontmatter(lessonContent);
      
      if (!frontmatter) {
        throw new Error(`Invalid frontmatter in lesson: ${lessonPath}`);
      }

      const contentBlocks = parseMarkdownToContentBlocks(content);

      const parsedLesson: ParsedMarkdownLesson = {
        frontmatter: frontmatter as LessonFrontmatter,
        content: contentBlocks
      };

      // Validate lesson if enabled
      if (this.config.validateOnLoad) {
        const validationErrors = validateLessonContent(parsedLesson);
        if (validationErrors.length > 0) {
          console.warn(`Validation warnings for lesson ${lessonPath}:`, validationErrors);
        }
      }

      if (this.config.cacheEnabled) {
        this.lessonCache.set(cacheKey, parsedLesson);
      }

      return parsedLesson;
    } catch (error) {
      console.error(`Error loading lesson ${lessonPath}:`, error);
      return null;
    }
  }

  /**
   * Loads all modules and converts them to the application format
   */
  async loadAllModules(): Promise<Module[]> {
    try {
      const moduleDirs = await this.listDirectories(`${this.config.contentDir}/modules`);
      const modules: Module[] = [];

      for (const moduleDir of moduleDirs.sort()) {
        const parsedModule = await this.loadModule(moduleDir);
        
        if (parsedModule) {
          const module = this.convertToModule(parsedModule);
          modules.push(module);
        }
      }

      // Sort modules by order
      const sortedModules = modules.sort((a, b) => a.order - b.order);

      // Validate all modules if enabled
      if (this.config.validateOnLoad) {
        const validation = validateModules(sortedModules);
        if (!validation.isValid) {
          console.error('Module validation errors:', validation.errors);
        }
        if (validation.warnings.length > 0) {
          console.warn('Module validation warnings:', validation.warnings);
        }
      }

      return sortedModules;
    } catch (error) {
      console.error('Error loading all modules:', error);
      return [];
    }
  }

  /**
   * Converts a ParsedModule to the application Module format
   */
  private convertToModule(parsedModule: ParsedModule): Module {
    const lessons: Lesson[] = parsedModule.lessons.map((parsedLesson, index) => ({
      id: parsedModule.frontmatter.id * 10 + parsedLesson.frontmatter.order,
      moduleId: parsedModule.frontmatter.id,
      title: parsedLesson.frontmatter.title,
      slug: this.createSlug(parsedLesson.frontmatter.title),
      description: parsedLesson.frontmatter.description,
      estimatedTime: parsedLesson.frontmatter.estimatedTime,
      tools: parsedLesson.frontmatter.tools || [],
      complexity: parsedLesson.frontmatter.complexity,
      prerequisites: parsedLesson.frontmatter.prerequisites || [],
      content: parsedLesson.content,
      order: parsedLesson.frontmatter.order
    }));

    return {
      id: parsedModule.frontmatter.id,
      title: parsedModule.frontmatter.title,
      slug: parsedModule.frontmatter.slug,
      description: parsedModule.frontmatter.description,
      estimatedTime: parsedModule.frontmatter.estimatedTime,
      complexity: parsedModule.frontmatter.complexity,
      prerequisites: parsedModule.frontmatter.prerequisites,
      lessons,
      order: parsedModule.frontmatter.order
    };
  }

  /**
   * Creates a URL-friendly slug from a title
   */
  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Validates content structure and returns validation results
   */
  async validateContent(): Promise<ValidationResult> {
    const modules = await this.loadAllModules();
    return validateModules(modules);
  }

  /**
   * Clears the content cache
   */
  clearCache(): void {
    this.moduleCache.clear();
    this.lessonCache.clear();
  }

  /**
   * Updates content cache for a specific module
   */
  async refreshModule(moduleSlug: string): Promise<ParsedModule | null> {
    const cacheKey = `module-${moduleSlug}`;
    this.moduleCache.delete(cacheKey);
    
    // Also clear lesson cache for this module
    const lessonsDir = `${this.config.contentDir}/modules/${moduleSlug}/lessons`;
    const lessonFiles = await this.listFiles(lessonsDir, '.md');
    
    for (const filename of lessonFiles) {
      const lessonPath = `${lessonsDir}/${filename}`;
      this.lessonCache.delete(`lesson-${lessonPath}`);
    }

    return this.loadModule(moduleSlug);
  }

  /**
   * File system abstraction methods
   * These would be implemented differently in browser vs Node.js environments
   */
  private async loadFile(path: string): Promise<string | null> {
    // In a real implementation, this would use fetch() in browser
    // or fs.readFile() in Node.js
    // For now, return null to indicate file system operations need implementation
    console.warn(`File system operation not implemented: loadFile(${path})`);
    return null;
  }

  private async listFiles(dir: string, extension?: string): Promise<string[]> {
    // In a real implementation, this would list directory contents
    console.warn(`File system operation not implemented: listFiles(${dir})`);
    return [];
  }

  private async listDirectories(dir: string): Promise<string[]> {
    // In a real implementation, this would list subdirectories
    console.warn(`File system operation not implemented: listDirectories(${dir})`);
    return [];
  }
}

/**
 * Default content manager instance
 */
export const contentManager = new ContentManager();

/**
 * Utility functions for content management
 */
export const ContentUtils = {
  /**
   * Creates a new lesson file from template
   */
  createLessonFromTemplate(
    title: string,
    description: string,
    estimatedTime: string = '30-45 minutes',
    tools: string[] = ['Web Browser', 'Text Editor'],
    complexity: string = 'Beginner',
    order: number = 1
  ): string {
    const frontmatter = {
      title,
      description,
      estimatedTime,
      tools,
      complexity,
      prerequisites: [],
      order
    };

    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          const arrayItems = value.map(item => `'${item}'`).join(', ');
          return `${key}: [${arrayItems}]`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    return `---
${yamlFrontmatter}
---

# ${title}

## Introduction

Brief introduction to the lesson and what students will accomplish.

## Learning Objectives

By the end of this lesson, you will be able to:
- Objective 1
- Objective 2
- Objective 3

## Step-by-Step Instructions

### Step 1: Getting Started

Detailed instructions for the first step.

💡 **Pro Tip**: Add helpful tips and best practices here.

## Summary

Recap of what was covered in this lesson.

## Next Steps

What students should do next and preview of upcoming content.
`;
  },

  /**
   * Validates lesson frontmatter
   */
  validateLessonFrontmatter(frontmatter: any): string[] {
    const errors: string[] = [];
    const required = ['title', 'description', 'estimatedTime', 'complexity', 'order'];
    
    for (const field of required) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (frontmatter.order && typeof frontmatter.order !== 'number') {
      errors.push('Order must be a number');
    }

    if (frontmatter.tools && !Array.isArray(frontmatter.tools)) {
      errors.push('Tools must be an array');
    }

    return errors;
  }
};