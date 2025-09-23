import { ModulePage } from './ModulePage.js';
import { getAllModules } from '../data/index.js';
import { Lesson } from '../data/types/index.js';

/**
 * Test function to demonstrate the ModulePage component
 * This shows how to use the ModulePage with sample data and progress tracking
 */
export async function testModulePage(): Promise<void> {
  console.log('🧪 Testing ModulePage component...');
  
  try {
    // Get all modules from the data system
    const allModules = getAllModules();
    
    if (allModules.length === 0) {
      console.error('❌ No modules available for testing');
      return;
    }
    
    // Use the first module for testing
    const testModule = allModules[0];
    
    // Create sample lesson progress (some lessons partially completed)
    const lessonProgress = new Map<number, number>();
    testModule.lessons.forEach((lesson, index) => {
      if (index === 0) {
        lessonProgress.set(lesson.id, 100); // First lesson completed
      } else if (index === 1) {
        lessonProgress.set(lesson.id, 60); // Second lesson partially completed
      } else {
        lessonProgress.set(lesson.id, 0); // Other lessons not started
      }
    });
    
    // Calculate overall module progress
    const totalProgress = Array.from(lessonProgress.values()).reduce((sum, progress) => sum + progress, 0);
    const moduleProgress = totalProgress / testModule.lessons.length;
    
    console.log(`📚 Testing with module: "${testModule.title}"`);
    console.log(`📊 Module progress: ${Math.round(moduleProgress)}%`);
    console.log(`📝 Lessons: ${testModule.lessons.length}`);
    
    // Clear the app container
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = '';
    
    // Create the module page
    const modulePage = new ModulePage(app, {
      module: testModule,
      allModules: allModules,
      progress: moduleProgress,
      lessonProgress: lessonProgress,
      onLessonClick: (lesson: Lesson) => {
        console.log(`🎯 Lesson clicked: "${lesson.title}"`);
        console.log(`📋 Lesson details:`, {
          id: lesson.id,
          estimatedTime: lesson.estimatedTime,
          tools: lesson.tools,
          complexity: lesson.complexity,
          prerequisites: lesson.prerequisites
        });
        
        // Simulate lesson navigation
        alert(`Opening lesson: ${lesson.title}\n\nThis would navigate to the lesson page with:\n- ${lesson.content.length} content blocks\n- Tools: ${lesson.tools.join(', ')}\n- Complexity: ${lesson.complexity}`);
      },
      onModuleNavigation: (moduleId: number) => {
        const targetModule = allModules.find(m => m.id === moduleId);
        if (targetModule) {
          console.log(`🔄 Navigating to module: "${targetModule.title}"`);
          
          // Simulate module navigation by creating a new module page
          app.innerHTML = '';
          
          // Create new lesson progress for the target module
          const newLessonProgress = new Map<number, number>();
          targetModule.lessons.forEach((lesson, index) => {
            // Simulate some random progress
            newLessonProgress.set(lesson.id, index < 2 ? Math.random() * 100 : 0);
          });
          
          const newTotalProgress = Array.from(newLessonProgress.values()).reduce((sum, progress) => sum + progress, 0);
          const newModuleProgress = newTotalProgress / targetModule.lessons.length;
          
          new ModulePage(app, {
            module: targetModule,
            allModules: allModules,
            progress: newModuleProgress,
            lessonProgress: newLessonProgress,
            onLessonClick: (lesson: Lesson) => {
              console.log(`🎯 New lesson clicked: "${lesson.title}"`);
            },
            onModuleNavigation: (nextModuleId: number) => {
              console.log(`🔄 Further navigation to module ID: ${nextModuleId}`);
            }
          });
        }
      }
    });
    
    console.log('✅ ModulePage component created successfully!');
    console.log('🎮 Try clicking on lesson cards and navigation buttons');
    
    // Test progress updates after a delay
    setTimeout(() => {
      console.log('🔄 Testing progress update...');
      
      // Update progress for the second lesson
      lessonProgress.set(testModule.lessons[1].id, 100);
      const newTotalProgress = Array.from(lessonProgress.values()).reduce((sum, progress) => sum + progress, 0);
      const newModuleProgress = newTotalProgress / testModule.lessons.length;
      
      modulePage.updateProgress(newModuleProgress, lessonProgress);
      console.log(`📊 Updated module progress to: ${Math.round(newModuleProgress)}%`);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error testing ModulePage:', error);
  }
}

/**
 * Test function specifically for module navigation features
 */
export function testModuleNavigation(): void {
  console.log('🧪 Testing module navigation features...');
  
  const allModules = getAllModules();
  
  if (allModules.length < 2) {
    console.warn('⚠️ Need at least 2 modules to test navigation');
    return;
  }
  
  // Test with middle module to show both previous and next navigation
  const middleIndex = Math.floor(allModules.length / 2);
  const testModule = allModules[middleIndex];
  
  console.log(`🎯 Testing navigation with module ${testModule.order}: "${testModule.title}"`);
  
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = '';
  
  new ModulePage(app, {
    module: testModule,
    allModules: allModules,
    progress: 45, // Sample progress
    onModuleNavigation: (moduleId: number) => {
      const targetModule = allModules.find(m => m.id === moduleId);
      console.log(`🔄 Navigation test: Moving to "${targetModule?.title}"`);
    }
  });
  
  console.log('✅ Module navigation test setup complete!');
}

// Export for use in main.ts or other test files
export { testModulePage as default };