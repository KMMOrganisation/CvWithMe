# CV Tutorial Website

A modern, educational platform that guides absolute beginners through creating their own CV websites.

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── data/          # Content data and type definitions
├── pages/         # Page-level components
├── styles/        # CSS architecture and design system
└── utils/         # Utility functions and helpers

public/            # Static assets
```

## Features

- Modern TypeScript + Vite development environment
- Comprehensive CSS design system with custom properties
- Modular component architecture
- Responsive design with mobile-first approach
- Accessibility-focused implementation
- No user registration required
- Static site deployment ready

## Design System

The project uses a comprehensive design system with:
- Muted, professional color palette
- Consistent spacing and typography scales
- Reusable component patterns
- Responsive breakpoints
- Accessibility considerations

## Content Structure

Content is organized into modules and lessons:
- **Modules**: High-level learning sections (e.g., "Getting Started")
- **Lessons**: Individual tutorial steps within modules
- **Content Blocks**: Rich content including text, images, videos, and code

## Development Guidelines

- Use TypeScript for type safety
- Follow the established design system
- Ensure components are accessible and responsive
- Write clean, maintainable code
- Test across different devices and browsers