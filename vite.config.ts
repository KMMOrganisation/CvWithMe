import { defineConfig } from 'vite'
import { execSync } from 'child_process'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize bundle size and performance
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          // Vendor libraries
          'vendor': ['./src/utils/contentParser.ts', './src/utils/contentValidator.ts'],
          // Components
          'components': [
            './src/components/Navigation.ts',
            './src/components/ModuleCard.ts',
            './src/components/LessonCard.ts'
          ],
          // Content rendering
          'content': [
            './src/components/ContentRenderer.ts',
            './src/components/SkeletonLoader.ts'
          ],
          // Pages
          'pages': [
            './src/pages/LandingPage.ts',
            './src/pages/ModulePage.ts',
            './src/pages/LessonPage.ts'
          ],
          // Utilities
          'utils': [
            './src/utils/progressTracker.ts',
            './src/utils/navigationState.ts',
            './src/utils/accessibility.ts',
            './src/utils/errorBoundary.ts'
          ]
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.ts', '') : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    cssCodeSplit: true, // Split CSS into separate files
    // Performance budgets
    chunkSizeWarningLimit: 1000 // Warn for chunks larger than 1MB
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      // Pre-bundle these dependencies
    ],
    exclude: [
      // Don't pre-bundle these
    ]
  },
  // CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add any CSS preprocessor options here
    }
  },
  plugins: [
    {
      name: 'process-course-content',
      buildStart() {
        // Process Course.md during build
        try {
          console.log('🔄 Processing Course.md content...');
          execSync('node scripts/processCourse.js', { stdio: 'inherit' });
          console.log('✅ Course.md processing completed');
        } catch (error) {
          console.warn('⚠️ Course.md processing failed, using fallback');
        }
      }
    },
    {
      name: 'performance-monitor',
      generateBundle(options, bundle) {
        // Log bundle analysis
        const chunks = Object.values(bundle).filter(chunk => chunk.type === 'chunk');
        const assets = Object.values(bundle).filter(asset => asset.type === 'asset');
        
        console.log('\n📊 Bundle Analysis:');
        console.log(`Chunks: ${chunks.length}`);
        console.log(`Assets: ${assets.length}`);
        
        // Log largest chunks
        const sortedChunks = chunks
          .map(chunk => ({
            name: chunk.fileName,
            size: chunk.code?.length || 0
          }))
          .sort((a, b) => b.size - a.size)
          .slice(0, 5);
        
        console.log('\n🔍 Largest Chunks:');
        sortedChunks.forEach(chunk => {
          const sizeKB = (chunk.size / 1024).toFixed(2);
          console.log(`  ${chunk.name}: ${sizeKB} KB`);
        });
      }
    }
  ]
})