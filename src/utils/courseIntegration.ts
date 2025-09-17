import { Module } from '../data/types/index.js';
import { parseCourseMarkdown, validateCourseContent } from './contentParser.js';

/**
 * Loads and parses the Course.md file to replace sample data
 */
export async function loadCourseContent(): Promise<Module[]> {
  try {
    // In a real application, this would load from the file system
    // For now, we'll simulate loading the Course.md content
    const courseContent = await loadCourseMarkdown();
    
    if (!courseContent) {
      throw new Error('Failed to load Course.md content');
    }
    
    const parsedCourse = parseCourseMarkdown(courseContent);
    
    if (!parsedCourse) {
      throw new Error('Failed to parse Course.md content');
    }
    
    // Validate the parsed content
    const validationErrors = validateCourseContent(parsedCourse);
    if (validationErrors.length > 0) {
      console.warn('Course content validation warnings:', validationErrors);
    }
    
    return parsedCourse.modules;
  } catch (error) {
    console.error('Error loading course content:', error);
    // Return empty array on error - the application should handle this gracefully
    return [];
  }
}

/**
 * Loads the Course.md file content
 * In a real application, this would read from the file system
 */
async function loadCourseMarkdown(): Promise<string | null> {
  try {
    // This is a placeholder - in a real app you'd use fetch() or fs.readFile()
    // For now, we'll return null to indicate the file should be loaded externally
    return null;
  } catch (error) {
    console.error('Error reading Course.md file:', error);
    return null;
  }
}

/**
 * Processes Course.md content and returns structured data
 */
export function processCourseMarkdown(courseMarkdown: string): Module[] {
  try {
    const parsedCourse = parseCourseMarkdown(courseMarkdown);
    
    if (!parsedCourse) {
      throw new Error('Failed to parse course markdown');
    }
    
    // Validate the content
    const errors = validateCourseContent(parsedCourse);
    if (errors.length > 0) {
      console.warn('Course validation warnings:', errors);
    }
    
    return parsedCourse.modules;
  } catch (error) {
    console.error('Error processing course markdown:', error);
    return [];
  }
}

/**
 * Validates that Course.md has been properly parsed
 */
export function validateParsedModules(modules: Module[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (modules.length === 0) {
    errors.push('No modules were parsed from Course.md');
    return { isValid: false, errors, warnings };
  }
  
  // Check each module
  modules.forEach((module, index) => {
    if (!module.title) {
      errors.push(`Module ${index + 1} is missing a title`);
    }
    
    if (!module.lessons || module.lessons.length === 0) {
      errors.push(`Module "${module.title}" has no lessons`);
    }
    
    if (module.lessons) {
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title) {
          errors.push(`Lesson ${lessonIndex + 1} in module "${module.title}" is missing a title`);
        }
        
        if (!lesson.content || lesson.content.length === 0) {
          warnings.push(`Lesson "${lesson.title}" has no content blocks`);
        }
        
        if (!lesson.estimatedTime) {
          warnings.push(`Lesson "${lesson.title}" is missing estimated time`);
        }
        
        if (!lesson.tools || lesson.tools.length === 0) {
          warnings.push(`Lesson "${lesson.title}" has no tools specified`);
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generates a summary report of the parsed course content
 */
export function generateCourseReport(modules: Module[]): string {
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const totalContentBlocks = modules.reduce((total, module) => 
    total + module.lessons.reduce((lessonTotal, lesson) => 
      lessonTotal + lesson.content.length, 0), 0);
  
  let report = `Course Content Summary:\n`;
  report += `- Total Modules: ${modules.length}\n`;
  report += `- Total Lessons: ${totalLessons}\n`;
  report += `- Total Content Blocks: ${totalContentBlocks}\n\n`;
  
  modules.forEach((module, index) => {
    report += `Module ${index + 1}: ${module.title}\n`;
    report += `  - Lessons: ${module.lessons.length}\n`;
    report += `  - Estimated Time: ${module.estimatedTime}\n`;
    report += `  - Complexity: ${module.complexity}\n`;
    
    module.lessons.forEach((lesson, lessonIndex) => {
      report += `    Lesson ${lessonIndex + 1}: ${lesson.title}\n`;
      report += `      - Content Blocks: ${lesson.content.length}\n`;
      report += `      - Estimated Time: ${lesson.estimatedTime}\n`;
      report += `      - Tools: ${lesson.tools.join(', ')}\n`;
    });
    report += '\n';
  });
  
  return report;
}