# Contributing to CV Tutorial Website

Thank you for your interest in contributing to the CV Tutorial Website! This document provides guidelines for different types of contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Types of Contributions](#types-of-contributions)
- [Content Contributions](#content-contributions)
- [Code Contributions](#code-contributions)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Review Process](#review-process)

## Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors:

- **Be respectful**: Treat all community members with respect and kindness
- **Be inclusive**: Welcome contributors of all backgrounds and experience levels
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone is learning
- **Be collaborative**: Work together to improve the project

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js (v18 or higher)
- Git for version control
- A GitHub account
- Basic understanding of web development (for code contributions)
- Familiarity with Markdown (for content contributions)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cv-tutorial-website.git
   cd cv-tutorial-website
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your contribution:
   ```bash
   git checkout -b your-contribution-name
   ```

## Types of Contributions

We welcome several types of contributions:

### 🎓 Educational Content
- New tutorial modules and lessons
- Improvements to existing content
- Additional examples and exercises
- Translations (future feature)

### 💻 Code Improvements
- Bug fixes and performance improvements
- New features and components
- Accessibility enhancements
- Test coverage improvements

### 📚 Documentation
- Setup and usage guides
- API documentation
- Code comments and examples
- Troubleshooting guides

### 🐛 Issue Reports
- Bug reports with reproduction steps
- Feature requests with use cases
- Accessibility issues
- Performance problems

## Content Contributions

### Content Guidelines

#### Educational Standards
- **Beginner-Friendly**: Assume no prior web development knowledge
- **Progressive**: Build concepts step-by-step
- **Practical**: Include hands-on exercises and examples
- **Clear**: Use simple, direct language
- **Visual**: Include screenshots, diagrams, and demos where helpful

#### Content Structure
Follow the established content hierarchy:
```
Module → Lessons → Content Blocks
```

#### Writing Style
- Use active voice and present tense
- Write in second person ("you will create...")
- Keep sentences concise and clear
- Use bullet points and numbered lists for steps
- Include code examples that are tested and working

### Content Creation Process

#### 1. Planning
- Review existing content to avoid duplication
- Identify the target audience and prerequisites
- Outline the learning objectives
- Plan the lesson structure and flow

#### 2. Content Development
- Use the provided templates in `content/templates/`
- Follow the frontmatter requirements
- Include all required metadata fields
- Test all code examples before including them

#### 3. Media Creation
- Create screenshots at 1920x1080 resolution
- Use consistent browser and OS appearance
- Optimize images for web (WebP preferred)
- Keep GIF file sizes under 5MB
- Provide descriptive alt text for all images

#### 4. Content Review
- Proofread for grammar and spelling
- Verify all links and references work
- Test content on different screen sizes
- Run content validation: `npm run validate:content`

### Content Submission

1. **Create content** following the guidelines above
2. **Test locally**:
   ```bash
   npm run dev
   npm run validate:content
   ```
3. **Commit changes** with descriptive messages:
   ```bash
   git add .
   git commit -m "Add lesson: HTML form basics"
   ```
4. **Push to your fork**:
   ```bash
   git push origin your-branch-name
   ```
5. **Create a Pull Request** with:
   - Clear title describing the content
   - Description of what the content covers
   - Target audience and prerequisites
   - Any special setup or testing instructions

## Code Contributions

### Development Standards

#### Code Quality
- **TypeScript**: Use TypeScript for all new code
- **Type Safety**: Provide proper type definitions
- **Error Handling**: Include appropriate error handling
- **Performance**: Consider performance implications
- **Accessibility**: Ensure WCAG 2.1 AA compliance

#### Code Style
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Write self-documenting code with clear logic
- Add comments for complex algorithms or business logic
- Keep functions small and focused on single responsibilities

#### Testing Requirements
- **Unit Tests**: Write tests for new functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Add tests for new user workflows
- **Accessibility Tests**: Verify accessibility compliance

### Code Submission Process

#### 1. Development
```bash
# Start development server
npm run dev

# Run tests during development
npm run test:watch
```

#### 2. Quality Checks
```bash
# Run all tests
npm run test

# Check accessibility
npm run test:accessibility

# Validate content (if applicable)
npm run validate:content

# Build for production
npm run build:production
```

#### 3. Commit Guidelines
Use conventional commit messages:
```
type(scope): description

feat(components): add new lesson card component
fix(navigation): resolve mobile menu accessibility issue
docs(readme): update installation instructions
test(utils): add tests for content parser
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

#### 4. Pull Request
Include in your PR description:
- **What**: What changes were made
- **Why**: Why the changes were necessary
- **How**: How the changes work
- **Testing**: How to test the changes
- **Screenshots**: For UI changes

## Bug Reports

### Before Reporting
1. **Search existing issues** to avoid duplicates
2. **Test with latest version** to ensure bug still exists
3. **Try to reproduce** the issue consistently
4. **Check browser compatibility** if it's a frontend issue

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 96.0]
- Node.js: [e.g., 18.12.0]
- Device: [e.g., iPhone 12, Desktop]

## Screenshots/Videos
If applicable, add screenshots or screen recordings

## Additional Context
Any other relevant information
```

## Feature Requests

### Before Requesting
1. **Check existing issues** for similar requests
2. **Consider the scope** - does it fit the project goals?
3. **Think about implementation** - is it technically feasible?
4. **Consider alternatives** - are there existing solutions?

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Problem/Use Case
What problem does this solve or what use case does it address?

## Proposed Solution
How should this feature work?

## Alternative Solutions
What other approaches have you considered?

## Additional Context
Any other relevant information, mockups, or examples
```

## Review Process

### Content Review Criteria
- **Educational Value**: Does it help beginners learn effectively?
- **Accuracy**: Is the technical content correct and up-to-date?
- **Clarity**: Is the content easy to understand and follow?
- **Completeness**: Are all necessary steps and explanations included?
- **Consistency**: Does it follow established patterns and style?

### Code Review Criteria
- **Functionality**: Does the code work as intended?
- **Quality**: Is the code well-written and maintainable?
- **Testing**: Are there adequate tests with good coverage?
- **Performance**: Does it meet performance requirements?
- **Accessibility**: Does it maintain accessibility standards?
- **Security**: Are there any security concerns?

### Review Timeline
- **Initial Response**: Within 48 hours
- **Content Review**: 3-5 business days
- **Code Review**: 2-3 business days
- **Complex Features**: May require additional time

### Feedback and Iteration
- Reviews may request changes before approval
- Address feedback promptly and thoroughly
- Ask questions if feedback is unclear
- Be open to suggestions and alternative approaches

## Recognition

### Contributors
All contributors are recognized in:
- Project README
- Release notes for significant contributions
- Special recognition for major features or improvements

### Types of Recognition
- **Code Contributors**: Listed in GitHub contributors
- **Content Contributors**: Credited in lesson metadata
- **Documentation Contributors**: Acknowledged in documentation
- **Community Contributors**: Recognized for helping others

## Getting Help

### Where to Get Help
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check existing guides and documentation
- **Code Comments**: Review inline documentation in code

### What to Include When Asking for Help
- Clear description of what you're trying to do
- What you've already tried
- Relevant error messages or screenshots
- Your environment details (OS, browser, Node.js version)

## Resources

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/) - Web development reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript documentation
- [Vite Guide](https://vitejs.dev/guide/) - Build tool documentation
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - WCAG 2.1 reference

### Project-Specific Resources
- [Content Creators Guide](CONTENT_CREATORS_GUIDE.md) - Detailed content creation instructions
- [Development Setup](../README.md#development-setup) - Getting started with development
- [Project Structure](../README.md#project-structure) - Understanding the codebase

Thank you for contributing to the CV Tutorial Website! Your contributions help make web development education more accessible to beginners worldwide.