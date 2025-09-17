import { Module, Lesson, ContentBlock } from '../data/types/index.js';

// Validation error types
export interface ValidationError {
  type: 'error' | 'warning';
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates a ContentBlock object
 */
export function validateContentBlock(block: ContentBlock, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `ContentBlock[${index}]`;
  
  // Required fields
  if (!block.id || typeof block.id !== 'string') {
    errors.push({
      type: 'error',
      field: `${prefix}.id`,
      message: 'ContentBlock must have a valid string ID',
      value: block.id
    });
  }
  
  if (!block.type) {
    errors.push({
      type: 'error',
      field: `${prefix}.type`,
      message: 'ContentBlock must have a type',
      value: block.type
    });
  } else if (!['text', 'image', 'video', 'gif', 'code', 'callout'].includes(block.type)) {
    errors.push({
      type: 'error',
      field: `${prefix}.type`,
      message: 'ContentBlock type must be one of: text, image, video, gif, code, callout',
      value: block.type
    });
  }
  
  if (!block.content || typeof block.content !== 'string') {
    errors.push({
      type: 'error',
      field: `${prefix}.content`,
      message: 'ContentBlock must have valid string content',
      value: block.content
    });
  }
  
  // Type-specific validations
  if (block.type === 'image' || block.type === 'video' || block.type === 'gif') {
    if (block.content && !isValidUrl(block.content) && !isValidPath(block.content)) {
      errors.push({
        type: 'warning',
        field: `${prefix}.content`,
        message: `${block.type} content should be a valid URL or file path`,
        value: block.content
      });
    }
    
    if (block.type === 'image' && block.metadata && !block.metadata.alt) {
      errors.push({
        type: 'warning',
        field: `${prefix}.metadata.alt`,
        message: 'Images should have alt text for accessibility',
        value: block.metadata.alt
      });
    }
  }
  
  if (block.type === 'code' && block.metadata?.language) {
    const validLanguages = ['html', 'css', 'javascript', 'typescript', 'json', 'markdown', 'text'];
    if (!validLanguages.includes(block.metadata.language)) {
      errors.push({
        type: 'warning',
        field: `${prefix}.metadata.language`,
        message: `Code language '${block.metadata.language}' may not be supported`,
        value: block.metadata.language
      });
    }
  }
  
  return errors;
}

/**
 * Validates a Lesson object
 */
export function validateLesson(lesson: Lesson): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Required fields
  if (typeof lesson.id !== 'number' || lesson.id <= 0) {
    errors.push({
      type: 'error',
      field: 'id',
      message: 'Lesson ID must be a positive number',
      value: lesson.id
    });
  }
  
  if (typeof lesson.moduleId !== 'number' || lesson.moduleId <= 0) {
    errors.push({
      type: 'error',
      field: 'moduleId',
      message: 'Module ID must be a positive number',
      value: lesson.moduleId
    });
  }
  
  if (!lesson.title || typeof lesson.title !== 'string') {
    errors.push({
      type: 'error',
      field: 'title',
      message: 'Lesson must have a valid title',
      value: lesson.title
    });
  }
  
  if (!lesson.slug || typeof lesson.slug !== 'string') {
    errors.push({
      type: 'error',
      field: 'slug',
      message: 'Lesson must have a valid slug',
      value: lesson.slug
    });
  } else if (!/^[a-z0-9-]+$/.test(lesson.slug)) {
    errors.push({
      type: 'error',
      field: 'slug',
      message: 'Lesson slug must contain only lowercase letters, numbers, and hyphens',
      value: lesson.slug
    });
  }
  
  if (!lesson.description || typeof lesson.description !== 'string') {
    errors.push({
      type: 'error',
      field: 'description',
      message: 'Lesson must have a valid description',
      value: lesson.description
    });
  }
  
  if (!lesson.estimatedTime || typeof lesson.estimatedTime !== 'string') {
    errors.push({
      type: 'error',
      field: 'estimatedTime',
      message: 'Lesson must have a valid estimated time',
      value: lesson.estimatedTime
    });
  }
  
  if (!Array.isArray(lesson.tools)) {
    errors.push({
      type: 'error',
      field: 'tools',
      message: 'Lesson tools must be an array',
      value: lesson.tools
    });
  }
  
  if (!lesson.complexity || typeof lesson.complexity !== 'string') {
    errors.push({
      type: 'error',
      field: 'complexity',
      message: 'Lesson must have a valid complexity level',
      value: lesson.complexity
    });
  }
  
  if (!Array.isArray(lesson.prerequisites)) {
    errors.push({
      type: 'error',
      field: 'prerequisites',
      message: 'Lesson prerequisites must be an array',
      value: lesson.prerequisites
    });
  }
  
  if (!Array.isArray(lesson.content)) {
    errors.push({
      type: 'error',
      field: 'content',
      message: 'Lesson content must be an array of ContentBlocks',
      value: lesson.content
    });
  } else {
    // Validate each content block
    lesson.content.forEach((block, index) => {
      const blockErrors = validateContentBlock(block, index);
      errors.push(...blockErrors.filter(e => e.type === 'error'));
      warnings.push(...blockErrors.filter(e => e.type === 'warning'));
    });
  }
  
  if (typeof lesson.order !== 'number' || lesson.order <= 0) {
    errors.push({
      type: 'error',
      field: 'order',
      message: 'Lesson order must be a positive number',
      value: lesson.order
    });
  }
  
  // Warnings
  if (lesson.title.length > 100) {
    warnings.push({
      type: 'warning',
      field: 'title',
      message: 'Lesson title is quite long (over 100 characters)',
      value: lesson.title.length
    });
  }
  
  if (lesson.description.length > 300) {
    warnings.push({
      type: 'warning',
      field: 'description',
      message: 'Lesson description is quite long (over 300 characters)',
      value: lesson.description.length
    });
  }
  
  if (lesson.content.length === 0) {
    warnings.push({
      type: 'warning',
      field: 'content',
      message: 'Lesson has no content blocks',
      value: lesson.content.length
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a Module object
 */
export function validateModule(module: Module): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Required fields
  if (typeof module.id !== 'number' || module.id <= 0) {
    errors.push({
      type: 'error',
      field: 'id',
      message: 'Module ID must be a positive number',
      value: module.id
    });
  }
  
  if (!module.title || typeof module.title !== 'string') {
    errors.push({
      type: 'error',
      field: 'title',
      message: 'Module must have a valid title',
      value: module.title
    });
  }
  
  if (!module.slug || typeof module.slug !== 'string') {
    errors.push({
      type: 'error',
      field: 'slug',
      message: 'Module must have a valid slug',
      value: module.slug
    });
  } else if (!/^[a-z0-9-]+$/.test(module.slug)) {
    errors.push({
      type: 'error',
      field: 'slug',
      message: 'Module slug must contain only lowercase letters, numbers, and hyphens',
      value: module.slug
    });
  }
  
  if (!module.description || typeof module.description !== 'string') {
    errors.push({
      type: 'error',
      field: 'description',
      message: 'Module must have a valid description',
      value: module.description
    });
  }
  
  if (!module.estimatedTime || typeof module.estimatedTime !== 'string') {
    errors.push({
      type: 'error',
      field: 'estimatedTime',
      message: 'Module must have a valid estimated time',
      value: module.estimatedTime
    });
  }
  
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(module.complexity)) {
    errors.push({
      type: 'error',
      field: 'complexity',
      message: 'Module complexity must be Beginner, Intermediate, or Advanced',
      value: module.complexity
    });
  }
  
  if (!Array.isArray(module.prerequisites)) {
    errors.push({
      type: 'error',
      field: 'prerequisites',
      message: 'Module prerequisites must be an array',
      value: module.prerequisites
    });
  }
  
  if (!Array.isArray(module.lessons)) {
    errors.push({
      type: 'error',
      field: 'lessons',
      message: 'Module lessons must be an array',
      value: module.lessons
    });
  } else {
    // Validate each lesson
    module.lessons.forEach((lesson, index) => {
      const lessonValidation = validateLesson(lesson);
      lessonValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `lessons[${index}].${error.field}`
        });
      });
      lessonValidation.warnings.forEach(warning => {
        warnings.push({
          ...warning,
          field: `lessons[${index}].${warning.field}`
        });
      });
    });
    
    // Check for duplicate lesson IDs within module
    const lessonIds = module.lessons.map(l => l.id);
    const duplicateIds = lessonIds.filter((id, index) => lessonIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push({
        type: 'error',
        field: 'lessons',
        message: 'Module contains lessons with duplicate IDs',
        value: duplicateIds
      });
    }
    
    // Check lesson order consistency
    const orders = module.lessons.map(l => l.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        warnings.push({
          type: 'warning',
          field: 'lessons',
          message: 'Lesson order numbers are not consecutive starting from 1',
          value: orders
        });
        break;
      }
    }
  }
  
  if (typeof module.order !== 'number' || module.order <= 0) {
    errors.push({
      type: 'error',
      field: 'order',
      message: 'Module order must be a positive number',
      value: module.order
    });
  }
  
  // Warnings
  if (module.lessons.length === 0) {
    warnings.push({
      type: 'warning',
      field: 'lessons',
      message: 'Module has no lessons',
      value: module.lessons.length
    });
  }
  
  if (module.lessons.length > 10) {
    warnings.push({
      type: 'warning',
      field: 'lessons',
      message: 'Module has many lessons (over 10) - consider splitting into multiple modules',
      value: module.lessons.length
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates an array of modules for consistency
 */
export function validateModules(modules: Module[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  if (!Array.isArray(modules)) {
    errors.push({
      type: 'error',
      field: 'modules',
      message: 'Modules must be an array',
      value: modules
    });
    return { isValid: false, errors, warnings };
  }
  
  // Validate each module
  modules.forEach((module, index) => {
    const moduleValidation = validateModule(module);
    moduleValidation.errors.forEach(error => {
      errors.push({
        ...error,
        field: `modules[${index}].${error.field}`
      });
    });
    moduleValidation.warnings.forEach(warning => {
      warnings.push({
        ...warning,
        field: `modules[${index}].${warning.field}`
      });
    });
  });
  
  // Check for duplicate module IDs
  const moduleIds = modules.map(m => m.id);
  const duplicateIds = moduleIds.filter((id, index) => moduleIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push({
      type: 'error',
      field: 'modules',
      message: 'Duplicate module IDs found',
      value: duplicateIds
    });
  }
  
  // Check for duplicate module slugs
  const moduleSlugs = modules.map(m => m.slug);
  const duplicateSlugs = moduleSlugs.filter((slug, index) => moduleSlugs.indexOf(slug) !== index);
  if (duplicateSlugs.length > 0) {
    errors.push({
      type: 'error',
      field: 'modules',
      message: 'Duplicate module slugs found',
      value: duplicateSlugs
    });
  }
  
  // Check module order consistency
  const orders = modules.map(m => m.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      warnings.push({
        type: 'warning',
        field: 'modules',
        message: 'Module order numbers are not consecutive starting from 1',
        value: orders
      });
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Helper functions
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function isValidPath(string: string): boolean {
  // Check if it looks like a file path (starts with / or ./ or ../ or contains file extension)
  return /^(\.{0,2}\/|\/|[a-zA-Z]:).*\.[a-zA-Z0-9]+$/.test(string) || 
         /^(images|videos|assets)\//.test(string);
}

/**
 * Error handling utilities
 */
export class ContentValidationError extends Error {
  public validationErrors: ValidationError[];
  
  constructor(message: string, validationErrors: ValidationError[]) {
    super(message);
    this.name = 'ContentValidationError';
    this.validationErrors = validationErrors;
  }
}

export function throwIfInvalid(validationResult: ValidationResult, context: string): void {
  if (!validationResult.isValid) {
    throw new ContentValidationError(
      `Validation failed for ${context}`,
      validationResult.errors
    );
  }
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => 
    `${error.type.toUpperCase()}: ${error.field} - ${error.message}${
      error.value !== undefined ? ` (got: ${JSON.stringify(error.value)})` : ''
    }`
  ).join('\n');
}