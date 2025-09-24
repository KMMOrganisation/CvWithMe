import './styles/main.css'
import './styles/skeleton.css'
import './styles/error-boundary.css'
import './styles/not-found.css'
import { animationUtils } from './utils/animationUtils.js'
import { initializeCourseData, getAllModules, getCourseStats } from './data/index.js'
import { LandingPage } from './pages/LandingPage.js'
import { testCourseParser } from './utils/test-course-parser.js'
import { testModulePage } from './pages/test-module-page.js'
import { createTestLessonPage } from './pages/test-lesson-page.js'
import { runContentRendererTests } from './components/test-content-renderer.js'
import { createProgressTrackingTest } from './components/test-progress-tracking.js'
import { createAccessibilityTest } from './components/test-accessibility.js'
import { createPerformanceTest } from './components/test-performance.js'
import { createErrorHandlingTest } from './components/test-error-handling.js'
import { createSearchTest } from './components/test-search.js'
import { createUXEnhancementsTest } from './components/test-ux-enhancements.js'
import { progressNavigationManager } from './utils/progressNavigationManager.js'
import { HeadingHierarchy } from './utils/accessibility.js'
import { createErrorBoundary } from './utils/errorBoundary.js'
import { ServiceWorkerCache, ResourcePreloader, CachePerformanceMonitor } from './utils/cacheManager.js'
import { createSkeletonLoader } from './components/SkeletonLoader.js'
import { NetworkErrorHandler, BrowserCompatibility } from './utils/networkErrorHandler.js'
// Router and 404 page imports (for future use)
// import { createRouter } from './utils/router.js'
// import { createNotFoundPage } from './pages/NotFoundPage.js'

// Main application entry point
console.log('CV Tutorial Website - Landing Page Implementation')

// Initialize course data system
let courseStats: any = null

async function initializeApp() {
  console.log('🚀 Initializing course data system...')
  
  try {
    // Register service worker for caching
    await ServiceWorkerCache.register()
    console.log('✅ Service Worker registered for offline caching')
    
    // Initialize course data (will try to load Course.md or fall back to sample data)
    await initializeCourseData()
    courseStats = getCourseStats()
    
    console.log('✅ Course data initialized successfully!')
    console.log(`📚 Loaded ${courseStats.totalModules} modules with ${courseStats.totalLessons} total lessons`)
    console.log(`📝 Total content blocks: ${courseStats.totalContentBlocks}`)
    
    // Initialize progress and navigation management
    const modules = getAllModules()
    progressNavigationManager.initialize(modules)
    console.log('✅ Progress tracking and navigation state initialized!')
    
    // Preload critical resources
    const criticalResources = [
      '/src/styles/main.css',
      '/src/styles/components.css',
      '/src/styles/skeleton.css'
    ]
    await ResourcePreloader.preloadCriticalResources(criticalResources)
    console.log('✅ Critical resources preloaded')
    
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
  
  // Check browser compatibility and show warnings if needed
  BrowserCompatibility.showCompatibilityWarning()
  
  // Setup network error monitoring
  NetworkErrorHandler.setupConnectivityMonitoring()
  NetworkErrorHandler.addErrorListener((errorInfo) => {
    console.warn('Network error detected:', errorInfo)
    // Could show user-friendly network error notifications here
  })
  
  // Set up error boundary for the entire app
  createErrorBoundary(app, {
    onError: (errorInfo) => {
      console.error('Application error:', errorInfo)
      CachePerformanceMonitor.recordMiss() // Track errors as cache misses
    },
    enableRetry: true,
    showErrorDetails: true // Enable in development
  })
  
  // Show skeleton while initializing
  const skeleton = createSkeletonLoader(app, { type: 'module-grid', count: 6 })
  
  try {
    // Initialize the course data first
    await initializeApp()
    
    // Hide skeleton with animation
    skeleton.hide()
    
    // Initialize animation utilities
    animationUtils.initializeAll()
    console.log('✅ Animation utilities initialized with scroll reveals and micro-interactions')
    
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
  } else if (testPage === 'progress') {
    // Test the progress tracking system
    console.log('🧪 Running Progress Tracking tests...')
    createProgressTrackingTest()
  } else if (testPage === 'accessibility') {
    // Test the accessibility features
    console.log('🧪 Running Accessibility tests...')
    createAccessibilityTest(app)
  } else if (testPage === 'performance') {
    // Test the performance optimizations
    console.log('🧪 Running Performance tests...')
    createPerformanceTest()
  } else if (testPage === 'errors') {
    // Test the error handling and fallback content
    console.log('🧪 Running Error Handling tests...')
    createErrorHandlingTest()
  } else if (testPage === 'search') {
    // Test the search and filtering functionality
    console.log('🧪 Running Search and Filtering tests...')
    createSearchTest()
  } else if (testPage === 'ux') {
    // Test the UX enhancements including animations and micro-interactions
    console.log('🧪 Running UX Enhancements tests...')
    createUXEnhancementsTest()
  } else {
    // Create and initialize the landing page (default)
    new LandingPage(app, {
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
    console.log('✅ Progress tracking and URL-based navigation state management active')
    
    // Log current progress state
    const overallProgress = progressNavigationManager.getOverallProgress()
    console.log(`📊 Current progress: ${overallProgress.completedLessons}/${overallProgress.totalLessons} lessons completed (${overallProgress.percentage}%)`)
    
    // Initialize accessibility features
    console.log('♿ Accessibility features initialized:')
    console.log('   - Skip navigation links added')
    console.log('   - ARIA live regions created')
    console.log('   - Keyboard navigation handlers active')
    console.log('   - Focus management utilities available')
    
    // Validate heading hierarchy
    HeadingHierarchy.validateAndFix()
    
    // Log performance stats
    setTimeout(() => {
      CachePerformanceMonitor.logStats()
    }, 2000)
    
    console.log('💡 Available test pages:')
    console.log('   - ?test=module (ModulePage test)')
    console.log('   - ?test=lesson (LessonPage with ContentRenderer test)')
    console.log('   - ?test=content (ContentRenderer component tests)')
    console.log('   - ?test=progress (Progress Tracking and Navigation test)')
    console.log('   - ?test=accessibility (Accessibility Features test)')
    console.log('   - ?test=performance (Performance Optimization tests)')
    console.log('   - ?test=errors (Error Handling and Fallback Content tests)')
    console.log('   - ?test=search (Search and Filtering functionality tests)')
    console.log('   - ?test=ux (UX Enhancements: animations, micro-interactions, visual polish)')
  }
  
  } catch (error) {
    console.error('Failed to initialize application:', error)
    skeleton.hide()
    // Error boundary will handle displaying the error UI
  }
})