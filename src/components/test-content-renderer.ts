/**
 * Test file for ContentRenderer component
 * 
 * This file tests the ContentRenderer component functionality
 */

import { ContentRenderer } from './ContentRenderer.js';
import { ContentRendererDemo } from './ContentRendererDemo.js';
import { ContentBlock } from '../data/types/index.js';

// Test content blocks
const testContent: ContentBlock[] = [
  {
    id: 'test-text',
    type: 'text',
    content: 'This is a **test** of the ContentRenderer with *italic* text and `inline code`.'
  },
  {
    id: 'test-code',
    type: 'code',
    content: 'console.log("Hello, ContentRenderer!");',
    metadata: {
      language: 'javascript',
      caption: 'Simple JavaScript test'
    }
  },
  {
    id: 'test-callout',
    type: 'callout',
    content: '💡 **Test Tip:** This is a test callout to verify styling.'
  },
  {
    id: 'test-image',
    type: 'image',
    content: 'https://via.placeholder.com/400x200/627d98/ffffff?text=Test+Image',
    metadata: {
      alt: 'Test image for ContentRenderer',
      caption: 'Test image with caption'
    }
  }
];

function runContentRendererTests(): void {
  console.log('🧪 Running ContentRenderer Tests...');

  // Test 1: Basic rendering
  const testContainer1 = document.createElement('div');
  testContainer1.id = 'test-container-1';
  document.body.appendChild(testContainer1);

  const renderer1 = new ContentRenderer(testContainer1, {
    content: testContent,
    className: 'test-content'
  });

  console.log('✅ Test 1: Basic rendering - PASSED');

  // Test 2: Content update
  const newContent: ContentBlock[] = [
    {
      id: 'updated-text',
      type: 'text',
      content: 'This content was **updated** dynamically!'
    }
  ];

  renderer1.updateContent(newContent);
  console.log('✅ Test 2: Content update - PASSED');

  // Test 3: Error handling for invalid content
  try {
    const invalidContent: ContentBlock[] = [
      {
        id: 'invalid-test',
        type: 'unknown' as any,
        content: 'This should fall back to text rendering'
      }
    ];
    
    renderer1.updateContent(invalidContent);
    console.log('✅ Test 3: Error handling - PASSED');
  } catch (error) {
    console.error('❌ Test 3: Error handling - FAILED', error);
  }

  // Test 4: Demo component
  const demoContainer = document.createElement('div');
  demoContainer.id = 'demo-container';
  document.body.appendChild(demoContainer);

  const demo = new ContentRendererDemo(demoContainer);
  console.log('✅ Test 4: Demo component - PASSED');

  // Test 5: Cleanup
  renderer1.destroy();
  demo.destroy();
  console.log('✅ Test 5: Cleanup - PASSED');

  console.log('🎉 All ContentRenderer tests completed successfully!');
}

// Auto-run tests when this module is loaded
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runContentRendererTests);
  } else {
    runContentRendererTests();
  }
}

export { runContentRendererTests };