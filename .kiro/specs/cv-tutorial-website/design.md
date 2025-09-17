# Design Document

## Overview

The CV Tutorial Website is a modern, educational platform designed to guide absolute beginners through creating their own CV websites. The design emphasizes a clean, mature aesthetic with muted colors, intuitive navigation, and a modular learning structure. The platform supports rich content including text, videos, GIFs, and images while maintaining accessibility and responsive design principles.

## Architecture

### High-Level Architecture

The website follows a static site architecture with client-side routing for optimal performance and SEO:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Landing Page  │    │  Module Pages   │    │  Lesson Pages   │
│                 │    │                 │    │                 │
│ - Hero Section  │───▶│ - Module Intro  │───▶│ - Lesson Content│
│ - Module Cards  │    │ - Lesson Cards  │    │ - Media Content │
│ - Navigation    │    │ - Progress      │    │ - Navigation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend Framework**: Modern vanilla JavaScript with ES6+ modules or lightweight framework (React/Vue)
- **Styling**: CSS3 with CSS Grid and Flexbox for layout, CSS custom properties for theming
- **Build Tool**: Vite or Webpack for bundling and optimization
- **Content Management**: Markdown files with frontmatter for lesson content
- **Media Handling**: Optimized images (WebP/AVIF), lazy loading for performance
- **Deployment**: Static hosting (Netlify, Vercel, or GitHub Pages)

## Components and Interfaces

### Core Components

#### 1. Navigation Component
```typescript
interface NavigationProps {
  currentModule?: number;
  currentLesson?: number;
  modules: Module[];
}
```

**Features:**
- Sticky header with site branding
- Module dropdown/sidebar navigation
- Breadcrumb navigation for current location
- Progress indicator for current module
- Mobile-responsive hamburger menu

#### 2. Module Card Component
```typescript
interface ModuleCardProps {
  module: {
    id: number;
    title: string;
    description: string;
    estimatedTime: string;
    lessonCount: number;
    complexity: 'Beginner' | 'Intermediate' | 'Advanced';
    prerequisites?: string[];
  };
}
```

**Features:**
- Visual card layout with hover effects
- Module metadata display (time, lessons, complexity)
- Progress indicator if partially completed
- Clear call-to-action button

#### 3. Lesson Card Component
```typescript
interface LessonCardProps {
  lesson: {
    id: number;
    title: string;
    description: string;
    estimatedTime: string;
    tools: string[];
    complexity: string;
    prerequisites?: string[];
  };
}
```

**Features:**
- Compact card design within modules
- Tool requirements and time estimates
- Visual complexity indicators
- Direct link to lesson content

#### 4. Content Renderer Component
```typescript
interface ContentRendererProps {
  content: {
    type: 'text' | 'image' | 'video' | 'gif' | 'code';
    data: string;
    caption?: string;
    alt?: string;
  }[];
}
```

**Features:**
- Rich text rendering with syntax highlighting
- Responsive image display with lazy loading
- Video/GIF embedding with controls
- Code block formatting with copy functionality

#### 5. Progress Tracker Component
```typescript
interface ProgressTrackerProps {
  moduleId: number;
  totalLessons: number;
  currentLesson: number;
}
```

**Features:**
- Visual progress bar for current module
- Lesson completion indicators
- Next/previous navigation
- Module completion celebration

### Layout Structure

#### Landing Page Layout
```
┌─────────────────────────────────────────┐
│              Header/Navigation           │
├─────────────────────────────────────────┤
│                Hero Section             │
│         - Welcome message               │
│         - Course overview               │
│         - Getting started CTA           │
├─────────────────────────────────────────┤
│              Module Grid                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Module 1 │ │Module 2 │ │Module 3 │   │
│  │Card     │ │Card     │ │Card     │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Module 4 │ │Module 5 │ │Module 6 │   │
│  └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│                Footer                   │
└─────────────────────────────────────────┘
```

#### Module Page Layout
```
┌─────────────────────────────────────────┐
│              Header/Navigation           │
├─────────────────────────────────────────┤
│              Module Header              │
│         - Module title & description    │
│         - Progress indicator            │
│         - Module metadata               │
├─────────────────────────────────────────┤
│              Lesson Grid                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Lesson 1 │ │Lesson 2 │ │Lesson 3 │   │
│  │Card     │ │Card     │ │Card     │   │
│  └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│           Navigation Controls           │
│      ← Previous Module | Next Module →  │
└─────────────────────────────────────────┘
```

#### Lesson Page Layout
```
┌─────────────────────────────────────────┐
│              Header/Navigation           │
├─────────────────────────────────────────┤
│              Lesson Header              │
│         - Lesson title                  │
│         - Breadcrumb navigation         │
│         - Lesson metadata               │
├─────────────────────────────────────────┤
│                                         │
│              Content Area               │
│                                         │
│  - Rich text content                    │
│  - Images with captions                 │
│  - Videos/GIFs                          │
│  - Code examples                        │
│  - Interactive elements                 │
│                                         │
├─────────────────────────────────────────┤
│           Navigation Controls           │
│      ← Previous Lesson | Next Lesson →  │
└─────────────────────────────────────────┘
```

## Data Models

### Module Data Structure
```typescript
interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  estimatedTime: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  lessons: Lesson[];
  order: number;
}
```

### Lesson Data Structure
```typescript
interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  slug: string;
  description: string;
  estimatedTime: string;
  tools: string[];
  complexity: string;
  prerequisites: string[];
  content: ContentBlock[];
  order: number;
}
```

### Content Block Structure
```typescript
interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'gif' | 'code' | 'callout';
  content: string;
  metadata?: {
    caption?: string;
    alt?: string;
    language?: string; // for code blocks
    autoplay?: boolean; // for videos
    loop?: boolean; // for GIFs
  };
}
```

## Visual Design System

### Color Palette
```css
:root {
  /* Primary Colors - Muted Blues */
  --primary-50: #f0f4f8;
  --primary-100: #d9e2ec;
  --primary-500: #627d98;
  --primary-700: #334e68;
  --primary-900: #102a43;
  
  /* Accent Colors - Warm Neutrals */
  --accent-50: #f7f5f3;
  --accent-100: #e8e6e1;
  --accent-500: #a0958d;
  --accent-700: #68615b;
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  
  /* Neutral Grays */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-300: #d1d5db;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
}
```

### Typography Scale
```css
:root {
  /* Font Families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing System
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### Component Styling Guidelines

#### Cards
- Subtle shadows with soft edges
- Rounded corners (8px border-radius)
- Hover states with gentle elevation increase
- Consistent padding and spacing

#### Buttons
- Primary: Solid background with primary color
- Secondary: Outlined with primary color
- Subtle hover animations (transform: translateY(-1px))
- Focus states for accessibility

#### Navigation
- Clean, minimal design
- Sticky positioning for main navigation
- Breadcrumbs with subtle separators
- Active state indicators

## Error Handling

### Content Loading Errors
- Graceful fallbacks for missing images/videos
- Skeleton loading states during content fetch
- Clear error messages with retry options
- Offline content caching where possible

### Navigation Errors
- 404 pages with helpful navigation back to main content
- Broken link detection and reporting
- Fallback routes for missing modules/lessons

### Media Errors
- Alt text for all images
- Fallback content for failed video loads
- Progressive enhancement for interactive elements

## Testing Strategy

### Unit Testing
- Component rendering and props handling
- Content parsing and rendering logic
- Navigation state management
- Responsive design breakpoints

### Integration Testing
- Module and lesson navigation flows
- Content loading and display
- Search and filtering functionality
- Cross-browser compatibility

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios
- Focus management

### Performance Testing
- Page load times and Core Web Vitals
- Image optimization and lazy loading
- Bundle size optimization
- Mobile performance metrics

### User Experience Testing
- Navigation intuitiveness
- Content readability and comprehension
- Mobile usability
- Learning progression effectiveness