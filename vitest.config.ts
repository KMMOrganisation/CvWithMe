import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts'
      ]
    },
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/', 'dist/', 'e2e/']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});