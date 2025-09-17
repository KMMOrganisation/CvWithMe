import './styles/main.css'
import { initializeCourseData, getAllModules, getCourseStats } from './data/index.js'
import { Navigation } from './components/Navigation.js'
import { ModuleCard } from './components/ModuleCard.js'
import { testCourseParser } from './utils/test-course-parser.js'

// Main application entry point
console.log('CV Tutorial Website - Development Environment Ready!')

// Initialize course data system
// let modules: any[] = []
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
  
  // Initialize the course data first
  await initializeApp()
  
  // Get modules from the initialized data
  const currentModules = getAllModules()
  
  // Create navigation component
  const navigation = new Navigation(app, {
    modules: currentModules,
    currentModule: undefined,
    currentLesson: undefined
  })
  
  // Create module cards container
  const moduleCardsContainer = document.createElement('div')
  moduleCardsContainer.className = 'grid grid-cols-3'
  moduleCardsContainer.style.gap = '1.5rem'
  moduleCardsContainer.style.marginTop = '1rem'
  
  // Generate module cards using the ModuleCard component
  currentModules.forEach((module, index) => {
    const progress = index === 0 ? 25 : index === 1 ? 75 : 0; // Demo progress for first two modules
    
    const moduleCard = new ModuleCard({
      module,
      progress,
      onClick: (clickedModule) => {
        // Update navigation to show current module
        navigation.updateProps({
          modules: currentModules,
          currentModule: clickedModule.id,
          currentLesson: undefined
        })
        
        alert(`Opening module: ${clickedModule.title}\n\nNavigation updated to show current module context.\nThis would navigate to the module page with ${clickedModule.lessons.length} lessons.`)
      }
    })
    
    moduleCardsContainer.appendChild(moduleCard.getElement())
  })
  
  // Create main content container
  const mainContent = document.createElement('div')
  mainContent.className = 'container'
  mainContent.innerHTML = `
    <header class="header">
      <h1>CV Tutorial Website</h1>
      <p>Learn to build your own professional CV website</p>
    </header>
    <main class="main">
      <div class="card">
        <h2>Development Environment Ready! 🚀</h2>
        <p>Welcome to the CV Tutorial Website. This platform will guide you through creating your own professional CV website step by step.</p>
        
        <div style="margin-top: 2rem;">
          <h3>Available Modules</h3>
          <div id="module-cards-container"></div>
        </div>
        
        <div class="card" style="margin-top: 2rem; background: var(--gray-50);">
          <h3>System Status</h3>
          <p>✅ Data models and content structure implemented</p>
          <p>✅ Course.md parser and integration system ready</p>
          <p>✅ Course data loaded (${courseStats?.totalModules || 0} modules, ${courseStats?.totalLessons || 0} lessons)</p>
          <p>✅ Content blocks parsed (${courseStats?.totalContentBlocks || 0} total blocks)</p>
          <p>✅ Content parsing utilities with video script and slide deck extraction</p>
          <p>✅ Content validation and error handling active</p>
          <p>✅ Navigation component implemented with accessibility support</p>
          <p>✅ ModuleCard component with hover effects and progress indicators</p>
        </div>
      </div>
    </main>
  `
  
  app.appendChild(mainContent)
  
  // Add the module cards to the container
  const moduleCardsContainerElement = document.getElementById('module-cards-container')
  if (moduleCardsContainerElement) {
    moduleCardsContainerElement.appendChild(moduleCardsContainer)
  }
  
  // Add global function for module viewing (for demo purposes)
  ;(window as any).viewModule = (moduleId: number) => {
    const module = currentModules.find(m => m.id === moduleId)
    if (module) {
      // Update navigation to show current module
      navigation.updateProps({
        modules: currentModules,
        currentModule: moduleId,
        currentLesson: undefined
      })
      
      alert(`Opening module: ${module.title}\n\nNavigation updated to show current module context.\nThis would navigate to the module page with ${module.lessons.length} lessons.`)
    }
  }
  
  console.log('✅ Navigation component initialized with responsive design and accessibility features')
})