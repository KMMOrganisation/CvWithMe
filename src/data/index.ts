import { Module } from './types/index.js';
import { loadRealCourseData, updateModulesData, getCurrentModules, sampleModules } from './sampleData.js';
import { validateParsedModules, generateCourseReport } from '../utils/courseIntegration.js';

/**
 * Initializes the course data by loading from Course.md or falling back to sample data
 */
export async function initializeCourseData(): Promise<Module[]> {
  try {
    console.log('Initializing course data...');
    
    // Try to load real course data
    const modules = await loadRealCourseData();
    
    // Validate the loaded modules
    const validation = validateParsedModules(modules);
    
    if (!validation.isValid) {
      console.error('Course data validation failed:', validation.errors);
      console.warn('Using sample data instead');
      updateModulesData(sampleModules);
      return sampleModules;
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Course data validation warnings:', validation.warnings);
    }
    
    // Update the global modules data
    updateModulesData(modules);
    
    // Generate and log a summary report
    const report = generateCourseReport(modules);
    console.log(report);
    
    return modules;
  } catch (error) {
    console.error('Failed to initialize course data:', error);
    updateModulesData(sampleModules);
    return sampleModules;
  }
}

/**
 * Gets all available modules
 */
export function getAllModules(): Module[] {
  return getCurrentModules();
}

/**
 * Gets a specific module by ID
 */
export function getModule(id: number): Module | undefined {
  return getCurrentModules().find(module => module.id === id);
}

/**
 * Gets all lessons for a specific module
 */
export function getModuleLessons(moduleId: number): Module['lessons'] {
  const module = getModule(moduleId);
  return module ? module.lessons : [];
}

/**
 * Gets a specific lesson by ID
 */
export function getLesson(lessonId: number): Module['lessons'][0] | undefined {
  for (const module of getCurrentModules()) {
    const lesson = module.lessons.find(lesson => lesson.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

/**
 * Gets a module by its slug
 */
export function getModuleBySlug(slug: string): Module | undefined {
  return getCurrentModules().find(module => module.slug === slug);
}

/**
 * Gets a lesson by its slug within a specific module
 */
export function getLessonBySlug(moduleId: number, lessonSlug: string): Module['lessons'][0] | undefined {
  const module = getModule(moduleId);
  if (!module) return undefined;
  
  return module.lessons.find(lesson => lesson.slug === lessonSlug);
}

/**
 * Gets course statistics
 */
export function getCourseStats() {
  const modules = getCurrentModules();
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const totalContentBlocks = modules.reduce((total, module) => 
    total + module.lessons.reduce((lessonTotal, lesson) => 
      lessonTotal + lesson.content.length, 0), 0);
  
  return {
    totalModules: modules.length,
    totalLessons,
    totalContentBlocks,
    modules: modules.map(module => ({
      id: module.id,
      title: module.title,
      lessonCount: module.lessons.length,
      estimatedTime: module.estimatedTime,
      complexity: module.complexity
    }))
  };
}

/**
 * Refreshes course data by reloading from Course.md
 */
export async function refreshCourseData(): Promise<Module[]> {
  console.log('Refreshing course data...');
  return await initializeCourseData();
}

// Export types for convenience
export type { Module } from './types/index.js';
export type { Lesson } from './types/index.js';
export type { ContentBlock } from './types/index.js';