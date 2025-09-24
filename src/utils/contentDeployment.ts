import { ContentManager } from './contentManager.js';
import { validateModules } from './contentValidator.js';
import { Module } from '../data/types/index.js';

/**
 * Content deployment configuration
 */
export interface DeploymentConfig {
  sourceDir: string;
  outputDir: string;
  validateBeforeDeploy: boolean;
  generateStaticFiles: boolean;
  optimizeAssets: boolean;
}

/**
 * Deployment result information
 */
export interface DeploymentResult {
  success: boolean;
  modulesProcessed: number;
  lessonsProcessed: number;
  errors: string[];
  warnings: string[];
  outputFiles: string[];
}

/**
 * Content deployment manager
 */
export class ContentDeployment {
  private contentManager: ContentManager;
  private config: DeploymentConfig;

  constructor(contentManager: ContentManager, config: DeploymentConfig) {
    this.contentManager = contentManager;
    this.config = config;
  }

  /**
   * Deploys content from markdown files to the application
   */
  async deploy(): Promise<DeploymentResult> {
    const result: DeploymentResult = {
      success: false,
      modulesProcessed: 0,
      lessonsProcessed: 0,
      errors: [],
      warnings: [],
      outputFiles: []
    };

    try {
      console.log('Starting content deployment...');

      // Load all modules from markdown
      const modules = await this.contentManager.loadAllModules();
      
      if (modules.length === 0) {
        result.errors.push('No modules found to deploy');
        return result;
      }

      // Validate content if enabled
      if (this.config.validateBeforeDeploy) {
        const validation = await this.contentManager.validateContent();
        
        if (!validation.isValid) {
          result.errors.push(...validation.errors.map(e => e.message));
          return result;
        }
        
        if (validation.warnings.length > 0) {
          result.warnings.push(...validation.warnings.map(w => w.message));
        }
      }

      // Generate static content files
      if (this.config.generateStaticFiles) {
        await this.generateStaticContent(modules, result);
      }

      // Update application data
      await this.updateApplicationData(modules, result);

      // Count processed items
      result.modulesProcessed = modules.length;
      result.lessonsProcessed = modules.reduce((total, module) => total + module.lessons.length, 0);
      
      result.success = true;
      console.log(`Content deployment completed successfully: ${result.modulesProcessed} modules, ${result.lessonsProcessed} lessons`);

    } catch (error) {
      result.errors.push(`Deployment failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Content deployment failed:', error);
    }

    return result;
  }

  /**
   * Generates static content files for production
   */
  private async generateStaticContent(modules: Module[], result: DeploymentResult): Promise<void> {
    try {
      // Generate course content TypeScript file
      const courseContentTs = this.generateCourseContentFile(modules);
      const courseContentPath = `${this.config.outputDir}/courseContent.ts`;
      
      await this.writeFile(courseContentPath, courseContentTs);
      result.outputFiles.push(courseContentPath);

      // Generate module index file
      const moduleIndexTs = this.generateModuleIndexFile(modules);
      const moduleIndexPath = `${this.config.outputDir}/moduleIndex.ts`;
      
      await this.writeFile(moduleIndexPath, moduleIndexTs);
      result.outputFiles.push(moduleIndexPath);

      // Generate JSON data files for API consumption
      const modulesJson = JSON.stringify(modules, null, 2);
      const modulesJsonPath = `${this.config.outputDir}/modules.json`;
      
      await this.writeFile(modulesJsonPath, modulesJson);
      result.outputFiles.push(modulesJsonPath);

      console.log(`Generated ${result.outputFiles.length} static content files`);

    } catch (error) {
      throw new Error(`Failed to generate static content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates the courseContent.ts file
   */
  private generateCourseContentFile(modules: Module[]): string {
    const moduleExports = modules.map(module => {
      const lessonsData = module.lessons.map(lesson => ({
        id: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        estimatedTime: lesson.estimatedTime,
        tools: lesson.tools,
        complexity: lesson.complexity,
        prerequisites: lesson.prerequisites,
        content: lesson.content,
        order: lesson.order
      }));

      return {
        id: module.id,
        title: module.title,
        slug: module.slug,
        description: module.description,
        estimatedTime: module.estimatedTime,
        complexity: module.complexity,
        prerequisites: module.prerequisites,
        lessons: lessonsData,
        order: module.order
      };
    });

    return `// This file is auto-generated from markdown content during build
// Do not edit manually - changes will be overwritten

import { Module } from './types/index.js';

/**
 * Course modules loaded from markdown content
 */
export const COURSE_MODULES: Module[] = ${JSON.stringify(moduleExports, null, 2)};

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
 * Get lessons for a module
 */
export function getLessonsForModule(moduleId: number): any[] {
  const module = getModuleById(moduleId);
  return module ? module.lessons : [];
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
   * Generates the module index file
   */
  private generateModuleIndexFile(modules: Module[]): string {
    const moduleImports = modules.map(module => 
      `export { default as ${this.toCamelCase(module.slug)} } from './${module.slug}/index.js';`
    ).join('\n');

    const moduleMap = modules.map(module => 
      `  '${module.slug}': ${this.toCamelCase(module.slug)}`
    ).join(',\n');

    return `// Auto-generated module index
// Do not edit manually

${moduleImports}

export const moduleMap = {
${moduleMap}
};

export const moduleList = [
${modules.map(module => `  '${module.slug}'`).join(',\n')}
];
`;
  }

  /**
   * Updates application data with new content
   */
  private async updateApplicationData(modules: Module[], result: DeploymentResult): Promise<void> {
    try {
      // In a real implementation, this would update the application's data store
      // For now, we'll just log the update
      console.log('Updating application data with new content...');
      
      // Update the existing courseContent.ts file
      const updatedContent = this.generateCourseContentFile(modules);
      const targetPath = 'src/data/courseContent.ts';
      
      await this.writeFile(targetPath, updatedContent);
      result.outputFiles.push(targetPath);

    } catch (error) {
      throw new Error(`Failed to update application data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validates content before deployment
   */
  async validateContent(): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const modules = await this.contentManager.loadAllModules();
      const validation = validateModules(modules);
      
      return {
        isValid: validation.isValid,
        errors: validation.errors.map(e => e.message),
        warnings: validation.warnings.map(w => w.message)
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
        warnings: []
      };
    }
  }

  /**
   * Optimizes assets for production
   */
  private async optimizeAssets(): Promise<void> {
    if (!this.config.optimizeAssets) return;

    // In a real implementation, this would:
    // - Compress images
    // - Optimize videos
    // - Generate responsive image variants
    // - Create WebP versions of images
    console.log('Asset optimization would be implemented here');
  }

  /**
   * Utility methods
   */
  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  private async writeFile(path: string, content: string): Promise<void> {
    // In a real implementation, this would write to the file system
    // For now, we'll just log what would be written
    console.log(`Would write file: ${path} (${content.length} characters)`);
  }
}

/**
 * Default deployment configuration
 */
export const DEFAULT_DEPLOYMENT_CONFIG: DeploymentConfig = {
  sourceDir: 'content',
  outputDir: 'src/data',
  validateBeforeDeploy: true,
  generateStaticFiles: true,
  optimizeAssets: false
};

/**
 * Creates a deployment manager with default configuration
 */
export function createContentDeployment(
  contentManager: ContentManager,
  config: Partial<DeploymentConfig> = {}
): ContentDeployment {
  const fullConfig = { ...DEFAULT_DEPLOYMENT_CONFIG, ...config };
  return new ContentDeployment(contentManager, fullConfig);
}

/**
 * Quick deployment function for common use cases
 */
export async function deployContent(
  contentManager: ContentManager,
  config: Partial<DeploymentConfig> = {}
): Promise<DeploymentResult> {
  const deployment = createContentDeployment(contentManager, config);
  return deployment.deploy();
}