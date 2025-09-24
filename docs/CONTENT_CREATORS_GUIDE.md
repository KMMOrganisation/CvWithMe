# Content Creators Guide

This guide explains how to create and manage content for the CV Tutorial Website.

## Content Structure Overview

The website organizes content into a hierarchical structure:

```
Course Content
├── Modules (High-level learning sections)
│   ├── Module 1: Getting Started
│   ├── Module 2: Your First Web Page
│   └── ...
└── Lessons (Individual tutorial steps within modules)
    ├── Lesson 1.1: Setting up your workspace
    ├── Lesson 1.2: Understanding HTML basics
    └── ...
```

## Content File Structure

Content is managed through markdown files in the `content/` directory:

```
content/
├── README.md                    # Content overview
├── modules/                     # Module definitions
│   └── module-1-setup/
│       ├── module.md           # Module metadata and description
│       └── lessons/            # Individual lessons
│           ├── 01-digital-workshop.md
│           ├── 02-first-webpage.md
│           └── 03-adding-content.md
└── templates/                  # Content templates
    ├── lesson-template.md      # Template for new lessons
    └── module-template.md      # Template for new modules
```

## Creating New Modules

### 1. Module Directory Structure

Create a new directory under `content/modules/` with the naming convention:
```
module-{number}-{slug}/
```

Example: `module-2-html-basics/`

### 2. Module Metadata File

Create a `module.md` file with the following frontmatter:

```markdown
---
id: 2
title: "HTML Basics"
slug: "html-basics"
description: "Learn the fundamental building blocks of web pages"
estimatedTime: "2-3 hours"
complexity: "Beginner"
prerequisites: ["Module 1: Getting Started"]
order: 2
---

# HTML Basics

Detailed module description goes here...

## What You'll Learn

- HTML document structure
- Common HTML elements
- Semantic markup
- Best practices

## Prerequisites

Before starting this module, you should have completed:
- Module 1: Getting Started
- Basic understanding of text editors

## Tools Required

- Text editor (VS Code recommended)
- Web browser (Chrome, Firefox, or Safari)
```

### 3. Module Lessons

Create lesson files in the `lessons/` subdirectory with the naming convention:
```
{number}-{slug}.md
```

Example: `01-html-structure.md`

## Creating New Lessons

### Lesson Frontmatter

Each lesson must include frontmatter with metadata:

```markdown
---
id: "2.1"
title: "Understanding HTML Structure"
slug: "html-structure"
moduleId: 2
description: "Learn how HTML documents are structured"
estimatedTime: "30-45 minutes"
complexity: "Beginner"
tools: ["Text editor", "Web browser"]
prerequisites: ["Basic computer skills"]
order: 1
---
```

### Content Blocks

Lessons support various content types through structured markdown:

#### Text Content
```markdown
## Introduction

Regular markdown text for explanations and instructions.

Use **bold** for emphasis and `code` for inline code references.
```

#### Code Blocks
```markdown
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Web Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```
```

#### Images
```markdown
![Alt text for accessibility](../../../public/images/html-structure.png)
*Caption: Basic HTML document structure*
```

#### Callout Boxes
```markdown
> **💡 Tip:** Always include the `lang` attribute in your HTML tag for better accessibility.

> **⚠️ Warning:** Don't forget to close your HTML tags properly.

> **📝 Note:** This is additional information that might be helpful.
```

#### Video/GIF Content
```markdown
![Demo of creating HTML file](../../../public/videos/create-html-demo.gif)
*Demo: Creating your first HTML file*
```

### Interactive Elements

#### Step-by-Step Instructions
```markdown
### Step 1: Create the HTML File

1. Open your text editor
2. Create a new file
3. Save it as `index.html`

### Step 2: Add Basic Structure

1. Type `<!DOCTYPE html>` at the top
2. Add the opening `<html>` tag
3. Include the `<head>` section
```

#### Checkboxes for Progress
```markdown
## Checklist

- [ ] Created HTML file
- [ ] Added DOCTYPE declaration
- [ ] Included head section
- [ ] Added body content
- [ ] Tested in browser
```

## Content Validation

### Automatic Validation

The system automatically validates:
- Frontmatter completeness
- Required fields presence
- File naming conventions
- Image references
- Internal links

### Manual Validation

Run content validation before publishing:

```bash
npm run validate:content
```

This will check:
- All required metadata fields
- Image file existence
- Link validity
- Content structure

## Content Guidelines

### Writing Style

1. **Beginner-Friendly**: Assume no prior knowledge
2. **Clear and Concise**: Use simple, direct language
3. **Step-by-Step**: Break complex tasks into small steps
4. **Visual**: Include screenshots and demos where helpful

### Accessibility

1. **Alt Text**: Always provide descriptive alt text for images
2. **Headings**: Use proper heading hierarchy (H1 → H2 → H3)
3. **Links**: Use descriptive link text, avoid "click here"
4. **Code**: Provide context for code examples

### Technical Standards

1. **Code Examples**: Test all code before publishing
2. **File Paths**: Use relative paths for internal resources
3. **Images**: Optimize images for web (WebP preferred)
4. **Videos/GIFs**: Keep file sizes reasonable (<5MB)

## Publishing Workflow

### 1. Content Creation
1. Create content using templates
2. Add all required metadata
3. Include appropriate media files

### 2. Local Testing
```bash
# Start development server
npm run dev

# Build content
npm run build:content

# Validate content
npm run validate:content
```

### 3. Content Review
1. Check content renders correctly
2. Test all links and media
3. Verify mobile responsiveness
4. Run accessibility checks

### 4. Publishing
1. Commit changes to version control
2. Push to main branch
3. Automated deployment will handle the rest

## Troubleshooting

### Common Issues

#### Images Not Loading
- Check file path is correct
- Ensure image exists in `public/images/`
- Verify image format is supported (PNG, JPG, WebP, SVG)

#### Content Not Appearing
- Check frontmatter syntax
- Verify required fields are present
- Run `npm run validate:content` for detailed errors

#### Build Failures
- Check for syntax errors in markdown
- Verify all referenced files exist
- Review console output for specific errors

### Getting Help

1. Check the console output for specific error messages
2. Review existing content for examples
3. Run validation tools to identify issues
4. Contact the development team for technical issues

## Content Templates

Use the provided templates in `content/templates/` as starting points:

- `lesson-template.md`: Template for new lessons
- `module-template.md`: Template for new modules

Copy these templates and customize them for your content needs.

## Best Practices

### Content Organization
- Keep modules focused on specific topics
- Limit lessons to 30-60 minutes of content
- Provide clear learning objectives
- Include practical exercises

### Media Usage
- Use screenshots to clarify instructions
- Create short GIFs for demonstrations
- Optimize all media files for web
- Provide captions and alt text

### User Experience
- Test content on different devices
- Ensure logical progression between lessons
- Provide clear next steps
- Include summary sections

### Maintenance
- Review content regularly for accuracy
- Update screenshots when UI changes
- Check external links periodically
- Gather user feedback for improvements