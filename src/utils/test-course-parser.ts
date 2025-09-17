import { parseCourseMarkdown, validateCourseContent } from './contentParser.js';
import { validateParsedModules, generateCourseReport } from './courseIntegration.js';

/**
 * Test function to parse Course.md content and validate the results
 */
export async function testCourseParser(): Promise<void> {
  try {
    console.log('🧪 Testing Course.md parser...');
    
    // Try to load embedded Course.md content
    let courseContent: string;
    
    try {
      const { COURSE_MARKDOWN_CONTENT, HAS_COURSE_CONTENT } = await import('../data/courseContent.js');
      
      if (HAS_COURSE_CONTENT && COURSE_MARKDOWN_CONTENT) {
        courseContent = COURSE_MARKDOWN_CONTENT;
        console.log('✅ Successfully loaded embedded Course.md content');
      } else {
        throw new Error('No embedded course content available');
      }
    } catch (error) {
      console.error('❌ Failed to load embedded Course.md:', error);
      console.log('📝 Using sample Course.md content for testing...');
      courseContent = getSampleCourseContent();
    }
    
    // Parse the course content
    console.log('🔍 Parsing course content...');
    const parsedCourse = parseCourseMarkdown(courseContent);
    
    if (!parsedCourse) {
      console.error('❌ Failed to parse course content');
      return;
    }
    
    console.log('✅ Successfully parsed course content');
    console.log(`📚 Course Title: ${parsedCourse.title}`);
    console.log(`📖 Course Description: ${parsedCourse.description}`);
    console.log(`📦 Found ${parsedCourse.modules.length} modules`);
    
    // Validate the parsed content
    console.log('🔍 Validating parsed content...');
    const courseValidation = validateCourseContent(parsedCourse);
    const moduleValidation = validateParsedModules(parsedCourse.modules);
    
    if (courseValidation.length > 0) {
      console.warn('⚠️ Course validation issues:', courseValidation);
    }
    
    if (!moduleValidation.isValid) {
      console.error('❌ Module validation failed:', moduleValidation.errors);
    } else {
      console.log('✅ Module validation passed');
    }
    
    if (moduleValidation.warnings.length > 0) {
      console.warn('⚠️ Module validation warnings:', moduleValidation.warnings);
    }
    
    // Generate and display report
    console.log('📊 Generating course report...');
    const report = generateCourseReport(parsedCourse.modules);
    console.log(report);
    
    // Test specific parsing features
    console.log('🔍 Testing specific parsing features...');
    testParsingFeatures(parsedCourse.modules);
    
    console.log('✅ Course parser test completed successfully!');
    
  } catch (error) {
    console.error('❌ Course parser test failed:', error);
  }
}

/**
 * Tests specific parsing features
 */
function testParsingFeatures(modules: any[]): void {
  let totalVideoScripts = 0;
  let totalSlideDecks = 0;
  let totalCodeBlocks = 0;
  let totalCallouts = 0;
  
  modules.forEach(module => {
    module.lessons.forEach((lesson: any) => {
      lesson.content.forEach((block: any) => {
        switch (block.type) {
          case 'code':
            totalCodeBlocks++;
            break;
          case 'callout':
            totalCallouts++;
            if (block.content.includes('Video Script')) {
              totalVideoScripts++;
            }
            if (block.content.includes('Slide Deck')) {
              totalSlideDecks++;
            }
            break;
        }
      });
    });
  });
  
  console.log(`📹 Video scripts detected: ${totalVideoScripts}`);
  console.log(`📊 Slide decks detected: ${totalSlideDecks}`);
  console.log(`💻 Code blocks parsed: ${totalCodeBlocks}`);
  console.log(`💡 Callouts created: ${totalCallouts}`);
}

/**
 * Sample Course.md content for testing when the real file isn't available
 */
function getSampleCourseContent(): string {
  return `### **Course Title: Code Your Dream Portfolio: From Zero to Web Hero!**

**Course Description:** Ready to build your very own online portfolio, even if you've never written a line of code? This course is for *you*! We'll start from scratch, writing every piece of code together, step-by-step.

---

### **Section 1: Your First Lines of Code - Setting Up for Success**

---

#### **Lesson 1.1: Welcome! Your Digital Workshop**

**Video Script:**

**(0:00-0:15) INTRO MUSIC & ANIMATED TITLE CARD: "Code Your Dream Portfolio: Lesson 1.1 - Welcome! Your Digital Workshop"**

**(0:15-0:30) HOST ON SCREEN (Friendly, enthusiastic tone):** "Hi everyone, and welcome! I'm so excited to have you join me on this journey. In this course, we're going to build an amazing portfolio website, even if you've never coded before."

**Slide Deck Example:**

* **Slide 1: Title Slide**
  * **Headline:** Code Your Dream Portfolio: From Zero to Web Hero!
  * **Subtitle:** Lesson 1.1: Welcome! Your Digital Workshop
  * **Image:** A friendly host photo or simple web dev icon.

* **Slide 2: What is a Website?**
  * **Headline:** Website = LEGOs!
  * **Content:**
    * **HTML:** The Structure (Bones / Instruction Manual)
    * **CSS:** The Style (Clothes / Paint & Decorations)
  * **Image:** Simple, distinct icons for HTML, CSS.

---

#### **Lesson 1.2: Your First Webpage: \`index.html\`**

**Video Script:**

**(0:00-0:10) INTRO MUSIC & ANIMATED TITLE CARD: "Code Your Dream Portfolio: Lesson 1.2 - Your First Webpage: index.html"**

**(0:10-0:40) HOST ON SCREEN / SCREENSHARE (VS Code open):** "Welcome back! In our last lesson, we set up our project folder in VS Code. Now, let's create the very first file for our website: \`index.html\`."

HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Portfolio</title>
</head>
<body>

</body>
</html>

**Slide Deck Example:**

* **Slide 1: Title Slide**
  * **Headline:** Code Your Dream Portfolio: From Zero to Web Hero!
  * **Subtitle:** Lesson 1.2: Your First Webpage: index.html

* **Slide 2: Creating \`index.html\`**
  * **Headline:** Step 1: New File!
  * **Content:**
    * In VS Code sidebar, hover over \`MYPORTFOLIOWEBSITE\`.
    * Click the "New File" icon.
    * Type \`index.html\` and press **Enter**.

---

### **Section 2: Styling Your Site with CSS - Making it Pretty!**

---

#### **Lesson 2.1: Your Style Sheet: \`style.css\`**

**Video Script:**

**(0:00-0:10) INTRO MUSIC & ANIMATED TITLE CARD: "Code Your Dream Portfolio: Lesson 2.1 - Your Style Sheet: style.css"**

**(0:10-0:30) HOST ON SCREEN:** "Welcome back! Now we're going to make our website look amazing with CSS!"

**Slide Deck Example:**

* **Slide 1: Title Slide**
  * **Headline:** Code Your Dream Portfolio: From Zero to Web Hero!
  * **Subtitle:** Lesson 2.1: Your Style Sheet: style.css`;
}

/**
 * Run the test when this module is imported
 */
if (typeof window !== 'undefined') {
  // Only run in browser environment
  document.addEventListener('DOMContentLoaded', () => {
    // Add a button to manually trigger the test
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Course Parser';
    testButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;';
    testButton.onclick = testCourseParser;
    document.body.appendChild(testButton);
  });
}