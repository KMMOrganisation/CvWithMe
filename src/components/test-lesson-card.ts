import { LessonCard } from './LessonCard.js';
import { sampleModules } from '../data/sampleData.js';

/**
 * Test function to verify LessonCard component functionality
 */
export function testLessonCard(): void {
  console.log('🧪 Testing LessonCard component...');
  
  try {
    // Get a sample lesson for testing
    const sampleLesson = sampleModules[0].lessons[0];
    
    // Test 1: Basic LessonCard creation
    console.log('🔍 Test 1: Basic LessonCard creation');
    const basicCard = new LessonCard({
      lesson: sampleLesson,
      onClick: (lesson) => {
        console.log('✅ Click handler working:', lesson.title);
      }
    });
    
    const basicElement = basicCard.getElement();
    if (basicElement && basicElement.classList.contains('lesson-card')) {
      console.log('✅ Basic LessonCard created successfully');
    } else {
      console.error('❌ Basic LessonCard creation failed');
      return;
    }
    
    // Test 2: LessonCard with progress
    console.log('🔍 Test 2: LessonCard with progress');
    const progressCard = new LessonCard({
      lesson: sampleLesson,
      progress: 50,
      onClick: (lesson) => {
        console.log('✅ Progress card click handler working:', lesson.title);
      }
    });
    
    const progressElement = progressCard.getElement();
    const progressBar = progressElement.querySelector('.lesson-card__progress-bar');
    if (progressBar) {
      console.log('✅ Progress indicator created successfully');
    } else {
      console.error('❌ Progress indicator creation failed');
    }
    
    // Test 3: Progress update functionality
    console.log('🔍 Test 3: Progress update functionality');
    progressCard.updateProgress(75);
    const updatedProgressText = progressElement.querySelector('.lesson-card__progress-text');
    if (updatedProgressText && updatedProgressText.textContent?.includes('75%')) {
      console.log('✅ Progress update working correctly');
    } else {
      console.error('❌ Progress update failed');
    }
    
    // Test 4: Complete lesson state
    console.log('🔍 Test 4: Complete lesson state');
    progressCard.updateProgress(100);
    const completedProgressText = progressElement.querySelector('.lesson-card__progress-text');
    if (completedProgressText && completedProgressText.textContent?.includes('Complete')) {
      console.log('✅ Complete lesson state working correctly');
    } else {
      console.error('❌ Complete lesson state failed');
    }
    
    // Test 5: LessonCard with prerequisites
    console.log('🔍 Test 5: LessonCard with prerequisites');
    const lessonWithPrereqs = sampleModules[0].lessons.find(lesson => lesson.prerequisites.length > 0);
    if (lessonWithPrereqs) {
      const prereqCard = new LessonCard({
        lesson: lessonWithPrereqs,
        onClick: (lesson) => {
          console.log('✅ Prerequisites card click handler working:', lesson.title);
        }
      });
      
      const prereqElement = prereqCard.getElement();
      const prereqSection = prereqElement.querySelector('.lesson-card__prerequisites');
      if (prereqSection) {
        console.log('✅ Prerequisites section created successfully');
      } else {
        console.error('❌ Prerequisites section creation failed');
      }
    } else {
      console.log('⚠️ No lessons with prerequisites found for testing');
    }
    
    // Test 6: Accessibility attributes
    console.log('🔍 Test 6: Accessibility attributes');
    const accessibilityTests = [
      { attribute: 'role', expectedValue: 'button' },
      { attribute: 'tabindex', expectedValue: '0' },
      { attribute: 'aria-label', expectedValue: `Lesson: ${sampleLesson.title}` }
    ];
    
    let accessibilityPassed = true;
    accessibilityTests.forEach(test => {
      const actualValue = basicElement.getAttribute(test.attribute);
      if (actualValue !== test.expectedValue) {
        console.error(`❌ Accessibility test failed: ${test.attribute} = "${actualValue}", expected "${test.expectedValue}"`);
        accessibilityPassed = false;
      }
    });
    
    if (accessibilityPassed) {
      console.log('✅ Accessibility attributes test passed');
    }
    
    // Test 7: Keyboard navigation
    console.log('🔍 Test 7: Keyboard navigation');
    let keyboardTestPassed = false;
    
    // Simulate keyboard events
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    // Add temporary click handler to test keyboard events
    const originalOnClick = basicCard['props'].onClick;
    basicCard['props'].onClick = (lesson) => {
      keyboardTestPassed = true;
      console.log('✅ Keyboard navigation working:', lesson.title);
    };
    
    basicElement.dispatchEvent(enterEvent);
    if (keyboardTestPassed) {
      console.log('✅ Enter key navigation test passed');
    } else {
      console.error('❌ Enter key navigation test failed');
    }
    
    // Reset for space key test
    keyboardTestPassed = false;
    basicElement.dispatchEvent(spaceEvent);
    if (keyboardTestPassed) {
      console.log('✅ Space key navigation test passed');
    } else {
      console.error('❌ Space key navigation test failed');
    }
    
    // Restore original click handler
    basicCard['props'].onClick = originalOnClick;
    
    // Test 8: Component cleanup
    console.log('🔍 Test 8: Component cleanup');
    const elementParent = document.createElement('div');
    elementParent.appendChild(basicElement);
    
    basicCard.destroy();
    if (!elementParent.contains(basicElement)) {
      console.log('✅ Component cleanup working correctly');
    } else {
      console.error('❌ Component cleanup failed');
    }
    
    console.log('✅ All LessonCard tests completed successfully!');
    
  } catch (error) {
    console.error('❌ LessonCard test failed:', error);
  }
}

/**
 * Test LessonCard component with various lesson configurations
 */
export function testLessonCardVariations(): void {
  console.log('🧪 Testing LessonCard variations...');
  
  try {
    // Test with different complexity levels
    const complexityLevels = ['Beginner', 'Intermediate', 'Advanced'];
    
    complexityLevels.forEach(complexity => {
      const testLesson = {
        ...sampleModules[0].lessons[0],
        complexity
      };
      
      const card = new LessonCard({
        lesson: testLesson,
        onClick: () => {}
      });
      
      const element = card.getElement();
      const complexityBadge = element.querySelector('.lesson-card__complexity');
      
      if (complexityBadge && complexityBadge.textContent === complexity) {
        console.log(`✅ ${complexity} complexity level rendered correctly`);
      } else {
        console.error(`❌ ${complexity} complexity level rendering failed`);
      }
    });
    
    // Test with different tool configurations
    const toolConfigurations = [
      [],
      ['Text Editor'],
      ['Text Editor', 'Web Browser'],
      ['Text Editor', 'Web Browser', 'Git', 'Node.js', 'VS Code Extensions']
    ];
    
    toolConfigurations.forEach((tools) => {
      const testLesson = {
        ...sampleModules[0].lessons[0],
        tools
      };
      
      const card = new LessonCard({
        lesson: testLesson,
        onClick: () => {}
      });
      
      const element = card.getElement();
      const toolsDisplay = element.querySelector('.lesson-card__stat-text');
      
      if (tools.length === 0) {
        // Should not have tools display
        const toolsSection = element.querySelector('.lesson-card__stat:has(.lesson-card__stat-icon:contains("🛠️"))');
        if (!toolsSection) {
          console.log('✅ Empty tools array handled correctly');
        } else {
          console.error('❌ Empty tools array handling failed');
        }
      } else if (tools.length <= 2) {
        // Should display all tools
        if (toolsDisplay && tools.every(tool => toolsDisplay.textContent?.includes(tool))) {
          console.log(`✅ Tools display (${tools.length} tools) rendered correctly`);
        } else {
          console.error(`❌ Tools display (${tools.length} tools) rendering failed`);
        }
      } else {
        // Should display first 2 tools + "more" indicator
        if (toolsDisplay && toolsDisplay.textContent?.includes('+')) {
          console.log(`✅ Tools display with "more" indicator (${tools.length} tools) rendered correctly`);
        } else {
          console.error(`❌ Tools display with "more" indicator (${tools.length} tools) rendering failed`);
        }
      }
    });
    
    console.log('✅ All LessonCard variation tests completed!');
    
  } catch (error) {
    console.error('❌ LessonCard variation tests failed:', error);
  }
}

/**
 * Run all LessonCard tests
 */
export function runAllLessonCardTests(): void {
  console.log('🚀 Running all LessonCard tests...\n');
  
  testLessonCard();
  console.log(''); // Add spacing
  testLessonCardVariations();
  
  console.log('\n✅ All LessonCard tests completed!');
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Add a button to manually trigger the tests
    const testButton = document.createElement('button');
    testButton.textContent = 'Test LessonCard';
    testButton.style.cssText = 'position: fixed; top: 50px; right: 10px; z-index: 9999; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;';
    testButton.onclick = runAllLessonCardTests;
    document.body.appendChild(testButton);
  });
}