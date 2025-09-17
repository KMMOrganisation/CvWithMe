import { processCourseMarkdown } from './courseIntegration.js';
import { Module } from '../data/types/index.js';
import { COURSE_MARKDOWN_CONTENT, HAS_COURSE_CONTENT, COURSE_METADATA } from '../data/courseContent.js';

/**
 * Loads and processes course content that was embedded at build time
 */
export function loadAndProcessCourse(): Module[] {
  try {
    if (!HAS_COURSE_CONTENT || !COURSE_MARKDOWN_CONTENT) {
      console.warn('Course.md content not available, using sample data');
      return [];
    }
    
    console.log('📖 Processing embedded Course.md content');
    console.log(`📏 Content size: ${COURSE_MARKDOWN_CONTENT.length} characters`);
    console.log(`🕒 Generated at: ${COURSE_METADATA.generatedAt}`);
    
    // Process the markdown content
    const modules = processCourseMarkdown(COURSE_MARKDOWN_CONTENT);
    
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
  return HAS_COURSE_CONTENT && COURSE_MARKDOWN_CONTENT.length > 0;
}

/**
 * Gets basic info about the loaded course content
 */
export function getCourseContentInfo(): {
  available: boolean;
  size?: number;
  moduleCount?: number;
  generatedAt?: string;
  source?: string;
} {
  if (!HAS_COURSE_CONTENT) {
    return { available: false };
  }
  
  try {
    const modules = processCourseMarkdown(COURSE_MARKDOWN_CONTENT);
    return {
      available: true,
      size: COURSE_MARKDOWN_CONTENT.length,
      moduleCount: modules.length,
      generatedAt: COURSE_METADATA.generatedAt,
      source: COURSE_METADATA.source
    };
  } catch (error) {
    return {
      available: true,
      size: COURSE_MARKDOWN_CONTENT.length,
      moduleCount: 0,
      generatedAt: COURSE_METADATA.generatedAt,
      source: COURSE_METADATA.source
    };
  }
}