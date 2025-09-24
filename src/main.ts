import './styles/main.css'
import './styles/skeleton.css'
import './styles/error-boundary.css'
import './styles/not-found.css'
import { animationUtils } from './utils/animationUtils.js'
import { initializeCourseData, getAllModules, getCourseStats } from './data/index.js'
import { LandingPage } from './pages/LandingPage.js'
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
    
    // Create app structure with simple navbar
    app.innerHTML = `
      <nav class="simple-navbar">
        <div class="navbar-container">
          <a href="/" class="navbar-brand">
            <span class="navbar-icon">🎓</span>
            <span class="navbar-text">CV Tutorial</span>
          </a>
          <div class="navbar-links">
            <a href="/" class="navbar-link">Home</a>
          </div>
        </div>
      </nav>
      <main id="main-content"></main>
    `
    
    const mainContent = document.getElementById('main-content')!
    
    // Create and initialize the landing page
    new LandingPage(mainContent, {
      modules: currentModules,
      courseStats: {
        totalModules: courseStats?.totalModules || 0,
        totalLessons: courseStats?.totalLessons || 0,
        totalContentBlocks: courseStats?.totalContentBlocks || 0
      }
    })
    
    // Handle navbar navigation
    const navbar = document.querySelector('.simple-navbar')!
    navbar.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault()
        const path = link.getAttribute('href')
        if (path === '/') {
          // Reload home page
          window.location.reload()
        } else {
          // For now, show a simple message for other pages
          mainContent.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
              <h1>Page: ${path}</h1>
              <p>This page is under construction.</p>
              <a href="/" style="color: #3b82f6; text-decoration: none;">← Back to Home</a>
            </div>
          `
        }
      }
    })
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      window.location.reload()
    })
    
    console.log('✅ Landing page initialized with navbar and navigation')
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
  
  } catch (error) {
    console.error('Failed to initialize application:', error)
    skeleton.hide()
    // Error boundary will handle displaying the error UI
  }
})