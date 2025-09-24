module.exports = {
  ci: {
    collect: {
      // Use environment variable for URL, fallback to local
      url: [
        process.env.LHCI_BUILD_CONTEXT__EXTERNAL_BUILD_URL || 
        process.env.DEPLOY_URL || 
        'http://localhost:4173/'
      ],
      startServerCommand: process.env.CI ? undefined : 'npm run preview',
      startServerReadyPattern: process.env.CI ? undefined : 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: process.env.CI ? 1 : 3, // Fewer runs in CI for speed
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-dev-shm-usage',
        // Additional settings for CI environments
        ...(process.env.CI && {
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          skipAudits: ['uses-https'], // Skip HTTPS check in CI
        }),
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': 'off', // PWA not required for this project
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'button-name': 'error',
        'link-name': 'error',
        
        // Best practices
        'uses-https': 'off', // Not applicable for local testing
        'no-vulnerable-libraries': 'error',
        'charset': 'error',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'warn',
        'hreflang': 'off',
        'canonical': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};