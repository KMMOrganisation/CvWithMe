// Core data type definitions for the CV Tutorial Website

export interface Module {
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

export interface Lesson {
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

export interface ContentBlock {
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

// Component prop interfaces
export interface NavigationProps {
  currentModule?: number;
  currentLesson?: number;
  modules: Module[];
}

export interface ModuleCardProps {
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

export interface LessonCardProps {
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

export interface ContentRendererProps {
  content: ContentBlock[];
}

export interface ProgressTrackerProps {
  moduleId: number;
  totalLessons: number;
  currentLesson: number;
}