# Components Directory

This directory contains all reusable UI components for the CV Tutorial Website.

## Available Components

### Navigation
- **File**: `Navigation.ts`
- **Purpose**: Core navigation component with responsive header, module navigation, breadcrumbs, and mobile menu
- **Features**:
  - Responsive header with site branding
  - Module navigation dropdown/sidebar
  - Breadcrumb navigation system
  - Mobile hamburger menu with smooth animations
  - Keyboard navigation support for accessibility
  - ARIA labels and proper focus management

### ModuleCard
- **File**: `ModuleCard.ts`
- **Purpose**: Displays module information in a card format for the landing page
- **Features**:
  - Module metadata display (title, description, time, lesson count)
  - Progress indicators for partially completed modules
  - Complexity level badges
  - Prerequisites display
  - Hover effects and accessibility support
  - Click handlers for navigation

### LessonCard
- **File**: `LessonCard.ts`
- **Purpose**: Displays lesson information in a card format within module pages
- **Features**:
  - Lesson metadata display (title, description, time, tools, complexity)
  - Progress indicators with completion states
  - Tool requirements display
  - Prerequisites display for dependent lessons
  - Visual complexity indicators
  - Keyboard navigation and accessibility support
  - Responsive design for all screen sizes

## Usage

Components are implemented as TypeScript classes that can be easily imported and instantiated:

```typescript
import { Navigation } from './components/Navigation.js';
import { ModuleCard } from './components/ModuleCard.js';
import { LessonCard } from './components/LessonCard.js';
import { sampleModules } from './data/sampleData.js';

// Create navigation instance
const navigation = new Navigation(document.body, {
  modules: sampleModules,
  currentModule: 1,
  currentLesson: 2
});

// Create module card
const moduleCard = new ModuleCard({
  module: sampleModules[0],
  progress: 25,
  onClick: (module) => {
    console.log('Module clicked:', module.title);
  }
});

// Create lesson card
const lessonCard = new LessonCard({
  lesson: sampleModules[0].lessons[0],
  progress: 50,
  onClick: (lesson) => {
    console.log('Lesson clicked:', lesson.title);
  }
});

// Add to DOM
document.body.appendChild(moduleCard.getElement());
document.body.appendChild(lessonCard.getElement());
```

## Component Guidelines

- Each component should be self-contained with clear interfaces
- Use TypeScript interfaces for component props
- Follow the established design system variables
- Ensure components are accessible and responsive
- Include proper ARIA labels and keyboard navigation support