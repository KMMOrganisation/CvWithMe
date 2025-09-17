import { defineConfig } from 'vite'
import { execSync } from 'child_process'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
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
    }
  ]
})