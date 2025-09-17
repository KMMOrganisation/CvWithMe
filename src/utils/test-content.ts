// Simple test file to verify our content parsing and validation works
import { 
  parseMarkdownLesson, 
  validateLessonContent, 
  sampleMarkdownLesson 
} from './contentParser.js';
import { 
  validateModule, 
  validateModules, 
  formatValidationErrors 
} from './contentValidator.js';
import { sampleModules } from '../data/sampleData.js';
import { ContentManager } from './contentUtils.js';

/**
 * Test content parsing
 */
export function testContentParsing(): void {
  console.log('🧪 Testing content parsing...');
  
  // Test markdown parsing
  const parsedLesson = parseMarkdownLesson(sampleMarkdownLesson);
  
  if (parsedLesson) {
    console.log('✅ Markdown parsing successful');
    console.log('📄 Parsed frontmatter:', parsedLesson.frontmatter);
    console.log('📝 Content blocks:', parsedLesson.content.length);
    
    // Test lesson validation
    const validationErrors = validateLessonContent(parsedLesson);
    if (validationErrors.length === 0) {
      console.log('✅ Lesson validation passed');
    } else {
      console.log('⚠️ Lesson validation warnings:', validationErrors);
    }
  } else {
    console.log('❌ Markdown parsing failed');
  }
}

/**
 * Test module validation
 */
export function testModuleValidation(): void {
  console.log('\n🧪 Testing module validation...');
  
  // Test individual module validation
  const firstModule = sampleModules[0];
  const moduleValidation = validateModule(firstModule);
  
  if (moduleValidation.isValid) {
    console.log('✅ Module validation passed');
  } else {
    console.log('❌ Module validation failed:');
    console.log(formatValidationErrors(moduleValidation.errors));
  }
  
  if (moduleValidation.warnings.length > 0) {
    console.log('⚠️ Module validation warnings:');
    console.log(formatValidationErrors(moduleValidation.warnings));
  }
  
  // Test all modules validation
  const modulesValidation = validateModules(sampleModules);
  
  if (modulesValidation.isValid) {
    console.log('✅ All modules validation passed');
  } else {
    console.log('❌ Modules validation failed:');
    console.log(formatValidationErrors(modulesValidation.errors));
  }
  
  if (modulesValidation.warnings.length > 0) {
    console.log('⚠️ Modules validation warnings:');
    console.log(formatValidationErrors(modulesValidation.warnings));
  }
}

/**
 * Test content manager
 */
export function testContentManager(): void {
  console.log('\n🧪 Testing content manager...');
  
  const contentManager = new ContentManager(sampleModules);
  
  // Test module retrieval
  const module1 = contentManager.getModule(1);
  if (module1) {
    console.log('✅ Module retrieval by ID successful:', module1.title);
  } else {
    console.log('❌ Module retrieval by ID failed');
  }
  
  // Test module retrieval by slug
  const moduleBySlug = contentManager.getModuleBySlug('getting-started');
  if (moduleBySlug) {
    console.log('✅ Module retrieval by slug successful:', moduleBySlug.title);
  } else {
    console.log('❌ Module retrieval by slug failed');
  }
  
  // Test lesson retrieval
  const lesson = contentManager.getLesson(1);
  if (lesson) {
    console.log('✅ Lesson retrieval successful:', lesson.lesson.title);
  } else {
    console.log('❌ Lesson retrieval failed');
  }
  
  // Test navigation
  const nextLesson = contentManager.getNextLesson(1);
  if (nextLesson) {
    console.log('✅ Next lesson navigation successful:', nextLesson.lesson.title);
  } else {
    console.log('❌ Next lesson navigation failed');
  }
  
  // Test progress calculation
  const progress = contentManager.calculateModuleProgress(1, [1, 2]);
  console.log('📊 Module progress calculation:', `${progress}%`);
  
  // Test module stats
  const stats = contentManager.getModuleStats(1);
  if (stats) {
    console.log('📈 Module stats:', stats);
  }
}

/**
 * Run all tests
 */
export function runAllTests(): void {
  console.log('🚀 Running content system tests...\n');
  
  try {
    testContentParsing();
    testModuleValidation();
    testContentManager();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  }
}

// Export for use in other files
export { sampleModules } from '../data/sampleData.js';