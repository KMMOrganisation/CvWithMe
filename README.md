# CV Tutorial Website

A modern, educational platform that guides absolute beginners through creating their own CV websites.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd cv-tutorial-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the website in development mode.

📚 **New to the project?** Check out our [Getting Started Guide](docs/GETTING_STARTED.md) for a quick overview.

## Development Setup

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**/**pnpm** as alternatives
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, or Edge)
- **Text editor** (VS Code recommended)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cv-tutorial-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run test
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:production` | Build with full validation and testing |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run validate:content` | Validate content structure |
| `npm run build:content` | Process and build content |
| `npm run clean` | Clean build artifacts |

### Environment Setup

#### VS Code Extensions (Recommended)
- **TypeScript and JavaScript Language Features** (built-in)
- **Vite** - For better Vite integration
- **Auto Rename Tag** - For HTML/JSX tag editing
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Live Server** - For testing static files

#### Browser Developer Tools
Enable developer tools in your browser for debugging:
- **Chrome**: F12 or Ctrl+Shift+I (Cmd+Opt+I on Mac)
- **Firefox**: F12 or Ctrl+Shift+I (Cmd+Opt+I on Mac)
- **Safari**: Cmd+Opt+I (enable in Preferences → Advanced)

### Project Structure

```
cv-tutorial-website/
├── .github/                 # GitHub workflows and templates
│   └── workflows/          # CI/CD automation
├── .kiro/                  # Kiro IDE configuration
│   └── specs/             # Feature specifications
├── content/               # Course content and lessons
│   ├── modules/          # Learning modules
│   └── templates/        # Content templates
├── docs/                 # Documentation
├── e2e/                  # End-to-end tests
├── public/               # Static assets
├── scripts/              # Build and utility scripts
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   ├── data/            # Content data and types
│   ├── pages/           # Page-level components
│   ├── styles/          # CSS architecture
│   └── utils/           # Utility functions
├── tests/               # Unit and integration tests
├── dist/                # Production build output
└── node_modules/        # Dependencies
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `vitest.config.ts` | Test configuration |
| `playwright.config.ts` | E2E test configuration |
| `netlify.toml` | Netlify deployment config |
| `vercel.json` | Vercel deployment config |

## Features

- **Modern Development Stack**: TypeScript + Vite for fast development
- **Comprehensive Design System**: CSS custom properties and consistent styling
- **Modular Architecture**: Reusable components and utilities
- **Responsive Design**: Mobile-first approach with accessibility focus
- **Content Management**: Markdown-based content with validation
- **Testing Suite**: Unit, integration, E2E, and accessibility tests
- **Performance Optimized**: Code splitting, lazy loading, and caching
- **Deployment Ready**: Multiple hosting platform configurations

## Content Management

### Content Structure
- **Modules**: High-level learning sections (e.g., "Getting Started")
- **Lessons**: Individual tutorial steps within modules
- **Content Blocks**: Rich content including text, images, videos, and code

### Adding Content
1. Use templates in `content/templates/`
2. Follow the content structure guidelines
3. Validate content with `npm run validate:content`
4. Test locally with `npm run dev`

📝 **Content Creation**: See [Content Creators Guide](docs/CONTENT_CREATORS_GUIDE.md) for detailed instructions.

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev

# Make changes and test
npm run test

# Validate content if applicable
npm run validate:content
```

### 2. Testing
```bash
# Run all tests
npm run test

# Run specific test types
npm run test:e2e
npm run test:accessibility
npm run test:performance

# Test production build
npm run build:production
npm run preview
```

### 3. Code Quality
```bash
# Check for issues
npm run lint

# Run full validation
npm run build:production
```

### 4. Deployment
```bash
# Build for production
npm run build:production

# Deploy to different platforms
npm run deploy:netlify
npm run deploy:vercel
npm run deploy:gh-pages
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

#### Node Version Issues
```bash
# Check Node version
node --version

# Use Node Version Manager (if installed)
nvm use 20
```

#### Build Failures
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

#### Content Not Loading
```bash
# Rebuild content
npm run build:content

# Validate content structure
npm run validate:content
```

### Getting Help

1. **Check Console Output**: Look for specific error messages
2. **Run Diagnostics**: Use `npm run test` and `npm run validate:content`
3. **Review Documentation**: Check relevant guides in `docs/`
4. **Check Issues**: Look for similar problems in project issues
5. **Contact Team**: Reach out to maintainers for technical support

## Contributing

### Code Style
- Use TypeScript for type safety
- Follow existing code patterns
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Ensure all tests pass
6. Submit pull request

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Accessibility considerations addressed
- [ ] Performance impact considered
- [ ] Mobile responsiveness verified

🤝 **Contributing**: See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed contribution guidelines.

## Deployment

The project supports multiple deployment platforms with automatic CI/CD:

- **GitHub Pages**: Automatic deployment via GitHub Actions
- **Netlify**: Deploy with `npm run deploy:netlify`
- **Vercel**: Deploy with `npm run deploy:vercel`

📖 **Deployment Guide**: See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions and configuration.

### Quick Deploy Commands
```bash
# Build for production
npm run build:production

# Deploy to specific platforms
npm run deploy:netlify
npm run deploy:vercel
npm run deploy:gh-pages
```

## Performance

### Optimization Features
- Code splitting and lazy loading
- Image optimization and responsive images
- CSS and JavaScript minification
- Caching strategies
- Bundle analysis and monitoring

### Performance Monitoring
- Lighthouse CI integration
- Core Web Vitals tracking
- Bundle size monitoring
- Performance test automation

## Security

### Security Features
- Content Security Policy headers
- XSS protection
- HTTPS enforcement (in production)
- Dependency vulnerability scanning
- Security audit automation

### Security Best Practices
- Regular dependency updates
- Input validation and sanitization
- Secure deployment configurations
- Access control for sensitive operations