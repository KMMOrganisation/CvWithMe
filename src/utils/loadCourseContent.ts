import { processCourseMarkdown } from './courseIntegration.js';
import { Module } from '../data/types/index.js';

// This will be populated at build time with the actual Course.md content
let COURSE_CONTENT: string | null = null;

/**
 * Sets the course content (called during build process)
 */
export function setCourseContent(content: string): void {
  COURSE_CONTENT = content;
}

/**
 * Loads and processes course content that was loaded at build time
 */
export function loadAndProcessCourse(): Module[] {
  try {
    if (!COURSE_CONTENT) {
      console.warn('Course.md content not available, using sample data');
      return [];
    }
    
    console.log('📖 Processing Course.md content');
    console.log(`📏 Content size: ${COURSE_CONTENT.length} characters`);
    
    // Process the markdown content
    const modules = processCourseMarkdown(COURSE_CONTENT);
    
    console.log(`✅ Successfully parsed ${modules.length} modules from Course.md`);
    
    return modules;
  } catch (error) {
    console.error('❌ Error processing Course.md:', error);
    return [];
  }
}

/**
 * Checks if course content is available
 */
export function isCourseContentAvailable(): boolean {
  return COURSE_CONTENT !== null && COURSE_CONTENT.length > 0;
}

/**
 * Gets basic info about the loaded course content
 */
export function getCourseContentInfo(): {
  available: boolean;
  size?: number;
  moduleCount?: number;
} {
  if (!COURSE_CONTENT) {
    return { available: false };
  }
  
  try {
    const modules = processCourseMarkdown(COURSE_CONTENT);
    return {
      available: true,
      size: COURSE_CONTENT.length,
      moduleCount: modules.length
    };
  } catch (error) {
    return {
      available: true,
      size: COURSE_CONTENT.length,
      moduleCount: 0
    };
  }
}