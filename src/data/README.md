# Data Structure

This directory contains the complete data layer implementation for the CV Tutorial Website.

## Overview

The data structure supports a modular learning system with the following hierarchy:
- **Modules**: Top-level learning units (e.g., "Getting Started with Web Development")
- **Lessons**: Individual learning sessions within modules
- **Content Blocks**: Rich content elements within lessons (text, images, videos, code, etc.)

## Files

### Core Types (`types/index.ts`)
- `Module`: Defines module structure with metadata and lessons
- `Lesson`: Defines lesson structure with content blocks and metadata  
- `ContentBlock`: Defines individual content elements with type-specific metadata
- Component prop interfaces for UI components

### Sample Data (`sampleData.ts`)
- Complete sample dataset with 3 modules and multiple lessons
- Helper functions for data retrieval and navigation
- Realistic content examples for development and testing

### Content Management (`index.ts`)
- Main exports for the data layer
- Unified access to all data utilities and types

## Content System Features

### ✅ Data Models
- TypeScript interfaces for type safety
- Hierarchical structure (Module → Lesson → ContentBlock)
- Rich metadata support (time estimates, complexity, tools, prerequisites)

### ✅ Sample Data
- 3 complete sample modules with realistic content
- Multiple lesson types and content blocks
- Proper ordering and relationships

### ✅ Content Parsing
- Markdown-to-ContentBlock conversion
- Frontmatter parsing for lesson metadata
- Support for multiple content types (text, images, videos, code, callouts)

### ✅ Validation & Error Handling
- Comprehensive validation for all data structures
- Error reporting with detailed messages
- Content integrity checks and warnings

### ✅ Content Management
- ContentManager class for data operations
- Navigation helpers (next/previous lesson)
- Progress calculation utilities
- Safe content loading with error handling

## Usage Examples

```typescript
import { defaultContentManager, sampleModules } from './data/index.js';

// Get all modules
const modules = defaultContentManager.getModules();

// Get specific module
const module = defaultContentManager.getModule(1);

// Get lesson with navigation context
const lesson = defaultContentManager.getLesson(1);
const nextLesson = defaultContentManager.getNextLesson(1);

// Calculate progress
const progress = defaultContentManager.calculateModuleProgress(1, [1, 2]);
```

## Content Types Supported

- **Text**: Rich text content with markdown support
- **Images**: With alt text and captions for accessibility
- **Videos**: With autoplay and caption options
- **GIFs**: With loop controls
- **Code**: With syntax highlighting support
- **Callouts**: Special highlighted content blocks

## Validation

All content is validated for:
- Required fields and proper types
- URL and file path validation for media
- Accessibility requirements (alt text for images)
- Content structure integrity
- Duplicate ID prevention
- Proper ordering sequences