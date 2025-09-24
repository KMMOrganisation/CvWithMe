# Documentation

Welcome to the CV Tutorial Website documentation. This directory contains comprehensive guides for developers, content creators, and contributors.

## Quick Links

- **🚀 [Getting Started](../README.md#development-setup)** - Set up your development environment
- **📝 [Content Creation](CONTENT_CREATORS_GUIDE.md)** - Create and manage tutorial content
- **🤝 [Contributing](CONTRIBUTING.md)** - Contribute code or content to the project
- **🌐 [Deployment](DEPLOYMENT.md)** - Deploy the website to various platforms

## Documentation Overview

### For Developers

| Document | Description | Audience |
|----------|-------------|----------|
| [README.md](../README.md) | Project overview and development setup | All developers |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Code contribution guidelines | Contributors |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions and configuration | DevOps/Maintainers |

### For Content Creators

| Document | Description | Audience |
|----------|-------------|----------|
| [CONTENT_CREATORS_GUIDE.md](CONTENT_CREATORS_GUIDE.md) | Complete guide to creating educational content | Content creators |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Content contribution process | Content contributors |

### For Users

| Document | Description | Audience |
|----------|-------------|----------|
| [README.md](../README.md) | Project overview and features | End users |

## Project Architecture

### Technology Stack

- **Frontend**: TypeScript, Vite, CSS3
- **Testing**: Vitest, Playwright, Axe
- **Content**: Markdown with frontmatter
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel)
- **CI/CD**: GitHub Actions

### Key Concepts

#### Content Structure
```
Course
├── Modules (Learning sections)
│   ├── Module metadata
│   └── Lessons (Tutorial steps)
│       ├── Lesson metadata
│       └── Content blocks (Text, images, code, etc.)
```

#### Component Architecture
```
Pages (Route handlers)
├── Components (Reusable UI)
├── Utils (Business logic)
└── Styles (Design system)
```

#### Build Process
```
Content Processing → TypeScript Compilation → Vite Build → Static Assets
```

## Development Workflow

### 1. Setup
```bash
git clone <repository>
npm install
npm run dev
```

### 2. Development
- Make changes to code or content
- Test locally with `npm run dev`
- Run tests with `npm run test`
- Validate content with `npm run validate:content`

### 3. Quality Assurance
- Run full test suite: `npm run test`
- Check accessibility: `npm run test:accessibility`
- Test performance: `npm run test:performance`
- Build for production: `npm run build:production`

### 4. Deployment
- Push to main branch for automatic deployment
- Or use platform-specific deploy commands
- Monitor deployment status and performance

## Content Management

### Content Types

#### Modules
High-level learning sections that group related lessons together.

**Required metadata:**
- `id`: Unique identifier
- `title`: Display name
- `description`: Learning objectives
- `estimatedTime`: Time to complete
- `complexity`: Difficulty level
- `prerequisites`: Required prior knowledge

#### Lessons
Individual tutorial steps within modules.

**Required metadata:**
- `id`: Unique identifier (e.g., "2.1")
- `moduleId`: Parent module ID
- `title`: Lesson name
- `description`: What students will learn
- `estimatedTime`: Time to complete
- `tools`: Required software/tools
- `complexity`: Difficulty level

#### Content Blocks
Rich content within lessons including:
- **Text**: Markdown-formatted explanations
- **Images**: Screenshots, diagrams, illustrations
- **Videos/GIFs**: Demonstrations and walkthroughs
- **Code**: Syntax-highlighted code examples
- **Callouts**: Tips, warnings, and notes

### Content Guidelines

#### Educational Standards
- **Progressive**: Build knowledge step-by-step
- **Practical**: Include hands-on exercises
- **Clear**: Use simple, direct language
- **Visual**: Include helpful screenshots and demos
- **Accessible**: Follow accessibility best practices

#### Technical Standards
- **Validated**: All content must pass validation
- **Tested**: Code examples must be working
- **Optimized**: Media files optimized for web
- **Responsive**: Content works on all devices

## Testing Strategy

### Test Types

#### Unit Tests
- Component functionality
- Utility functions
- Content parsing logic
- Data validation

#### Integration Tests
- Component interactions
- Navigation flows
- Content rendering
- State management

#### End-to-End Tests
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Performance benchmarks

#### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios
- ARIA implementation

### Test Commands

```bash
# Run all tests
npm run test

# Specific test types
npm run test:e2e
npm run test:accessibility
npm run test:performance

# Test with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Performance Optimization

### Build Optimizations
- **Code Splitting**: Separate chunks for better caching
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Asset Optimization**: Optimize images and fonts

### Runtime Optimizations
- **Lazy Loading**: Load content as needed
- **Caching**: Browser and CDN caching strategies
- **Compression**: Gzip/Brotli compression
- **Critical Path**: Optimize initial page load

### Monitoring
- **Lighthouse CI**: Automated performance testing
- **Core Web Vitals**: Loading, interactivity, visual stability
- **Bundle Analysis**: Track bundle size changes
- **Real User Monitoring**: Production performance data

## Security Considerations

### Content Security
- **Input Validation**: Validate all content inputs
- **XSS Prevention**: Sanitize user-generated content
- **Content Integrity**: Verify content hasn't been tampered with

### Application Security
- **CSP Headers**: Content Security Policy implementation
- **HTTPS**: Secure transport layer
- **Security Headers**: XSS protection, frame options, etc.
- **Dependency Scanning**: Regular vulnerability checks

## Accessibility

### Standards Compliance
- **WCAG 2.1 AA**: Web Content Accessibility Guidelines
- **Section 508**: US federal accessibility requirements
- **ARIA**: Accessible Rich Internet Applications

### Implementation
- **Semantic HTML**: Proper element usage
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Compatible with assistive technology
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Clear focus indicators

### Testing
- **Automated Testing**: Axe accessibility engine
- **Manual Testing**: Screen reader testing
- **User Testing**: Testing with disabled users

## Troubleshooting

### Common Issues

#### Development Issues
- **Port conflicts**: Use different port with `--port` flag
- **Node version**: Ensure Node.js v18+ is installed
- **Dependencies**: Clear `node_modules` and reinstall
- **Cache issues**: Clear Vite cache with `npm run clean`

#### Content Issues
- **Validation errors**: Run `npm run validate:content`
- **Missing images**: Check file paths and existence
- **Broken links**: Verify internal and external links
- **Metadata errors**: Check frontmatter syntax

#### Build Issues
- **TypeScript errors**: Fix type issues before building
- **Missing files**: Ensure all referenced files exist
- **Memory issues**: Increase Node.js memory limit
- **Plugin conflicts**: Check Vite plugin compatibility

### Getting Help

1. **Check documentation** for relevant guides
2. **Search existing issues** for similar problems
3. **Run diagnostics** with test and validation commands
4. **Create detailed issue** with reproduction steps
5. **Contact maintainers** for complex technical issues

## Contributing

We welcome contributions of all types:

- **Code**: Bug fixes, features, performance improvements
- **Content**: New lessons, improvements to existing content
- **Documentation**: Guides, examples, clarifications
- **Testing**: Additional test coverage, test improvements
- **Design**: UI/UX improvements, accessibility enhancements

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Resources

### External Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Project Resources
- [GitHub Repository](https://github.com/your-org/cv-tutorial-website)
- [Live Demo](https://your-org.github.io/cv-tutorial-website)
- [Issue Tracker](https://github.com/your-org/cv-tutorial-website/issues)
- [Discussions](https://github.com/your-org/cv-tutorial-website/discussions)

---

**Need help?** Check the relevant guide above or [create an issue](https://github.com/your-org/cv-tutorial-website/issues) for assistance.