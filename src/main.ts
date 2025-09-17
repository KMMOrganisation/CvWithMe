import './styles/main.css'
import { initializeCourseData, getAllModules, getCourseStats } from './data/index.js'
import { LandingPage } from './pages/LandingPage.js'
import { testCourseParser } from './utils/test-course-parser.js'
import { testModulePage } from './pages/test-module-page.js'
import { createTestLessonPage } from './pages/test-lesson-page.js'
import { runContentRendererTests } from './components/test-content-renderer.js'

// Main application entry point
console.log('CV Tutorial Website - Landing Page Implementation')

// Initialize course data system
let courseStats: any = null

async function initializeApp() {
  console.log('🚀 Initializing course data system...')
  
  try {
    // Initialize course data (will try to load Course.md or fall back to sample data)
    await initializeCourseData()
    courseStats = getCourseStats()
    
    console.log('✅ Course data initialized successfully!')
    console.log(`📚 Loaded ${courseStats.totalModules} modules with ${courseStats.totalLessons} total lessons`)
    console.log(`📝 Total content blocks: ${courseStats.totalContentBlocks}`)
    
    // Test the course parser
    console.log('🧪 Testing Course.md parser...')
    await testCourseParser()
    
  } catch (error) {
    console.error('❌ Failed to initialize course data:', error)
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  const app = document.querySelector<HTMLDivElement>('#app')!
  
  // Clear any existing content
  app.innerHTML = ''
  
  // Initialize the course data first
  await initializeApp()
  
  // Get modules from the initialized data
  const currentModules = getAllModules()
  
  // Check URL parameters to determine which page to show
  const urlParams = new URLSearchParams(window.location.search)
  const testPage = urlParams.get('test')
  
  if (testPage === 'module') {
    // Test the module page
    console.log('🧪 Loading ModulePage test...')
    await testModulePage()
  } else if (testPage === 'lesson') {
    // Test the lesson page with ContentRenderer
    console.log('🧪 Loading LessonPage with ContentRenderer test...')
    createTestLessonPage()
  } else if (testPage === 'content') {
    // Test the ContentRenderer component
    console.log('🧪 Running ContentRenderer tests...')
    runContentRendererTests()
  } else {
    // Create and initialize the landing page (default)
    const landingPage = new LandingPage(app, {
      modules: currentModules,
      courseStats: {
        totalModules: courseStats?.totalModules || 0,
        totalLessons: courseStats?.totalLessons || 0,
        totalContentBlocks: courseStats?.totalContentBlocks || 0
      }
    })
    
    console.log('✅ Landing page initialized with hero section, module grid, and responsive design')
    console.log('✅ Navigation component integrated with smooth scroll functionality')
    console.log('✅ Module cards rendered with real course data and progress indicators')
    console.log('💡 Available test pages:')
    console.log('   - ?test=module (ModulePage test)')
    console.log('   - ?test=lesson (LessonPage with ContentRenderer test)')
    console.log('   - ?test=content (ContentRenderer component tests)')
  }
})