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

## Usage

Components are implemented as TypeScript classes that can be easily imported and instantiated:

```typescript
import { Navigation } from './components/Navigation.js';
import { sampleModules } from './data/sampleData.js';

// Create navigation instance
const navigation = new Navigation(document.body, {
  modules: sampleModules,
  currentModule: 1,
  currentLesson: 2
});
```

## Component Guidelines

- Each component should be self-contained with clear interfaces
- Use TypeScript interfaces for component props
- Follow the established design system variables
- Ensure components are accessible and responsive
- Include proper ARIA labels and keyboard navigation support