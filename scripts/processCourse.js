import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Reads Course.md and generates a TypeScript file with the content
 */
function processCourseContent() {
  try {
    console.log('📖 Reading Course.md...');
    
    // Read the Course.md file from project root
    const coursePath = join(__dirname, '..', 'Course.md');
    const courseContent = readFileSync(coursePath, 'utf-8');
    
    console.log(`✅ Successfully read Course.md (${courseContent.length} characters)`);
    
    // Generate TypeScript content
    const tsContent = generateCourseDataFile(courseContent);
    
    // Write to src/data/courseContent.ts
    const outputPath = join(__dirname, '..', 'src', 'data', 'courseContent.ts');
    writeFileSync(outputPath, tsContent, 'utf-8');
    
    console.log(`✅ Generated courseContent.ts with embedded course data`);
    
    return true;
  } catch (error) {
    console.error('❌ Error processing Course.md:', error);
    
    // Generate empty content file as fallback
    const fallbackContent = generateFallbackCourseDataFile();
    const outputPath = join(__dirname, '..', 'src', 'data', 'courseContent.ts');
    writeFileSync(outputPath, fallbackContent, 'utf-8');
    
    console.log('⚠️ Generated fallback courseContent.ts');
    
    return false;
  }
}

/**
 * Generates TypeScript file content with embedded course data
 */
function generateCourseDataFile(courseContent) {
  // Escape the content for embedding in TypeScript
  const escapedContent = courseContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
  
  return `// This file is auto-generated from Course.md during build
// Do not edit manually - changes will be overwritten

/**
 * Course content loaded from Course.md at build time
 */
export const COURSE_MARKDOWN_CONTENT = \`${escapedContent}\`;

/**
 * Indicates whether real course content is available
 */
export const HAS_COURSE_CONTENT = true;

/**
 * Metadata about the course content
 */
export const COURSE_METADATA = {
  contentLength: ${courseContent.length},
  generatedAt: '${new Date().toISOString()}',
  source: 'Course.md'
};
`;
}

/**
 * Generates fallback TypeScript file when Course.md is not available
 */
function generateFallbackCourseDataFile() {
  return `// This file is auto-generated - Course.md was not found
// Using fallback empty content

/**
 * Course content (fallback - no Course.md found)
 */
export const COURSE_MARKDOWN_CONTENT = '';

/**
 * Indicates whether real course content is available
 */
export const HAS_COURSE_CONTENT = false;

/**
 * Metadata about the course content
 */
export const COURSE_METADATA = {
  contentLength: 0,
  generatedAt: '${new Date().toISOString()}',
  source: 'fallback'
};
`;
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  processCourseContent();
}

export { processCourseContent };