# Getting Started with CV Tutorial Website

This guide will help you get up and running with the CV Tutorial Website project quickly.

## Quick Setup

### 1. Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd cv-tutorial-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the website.

## What You Can Do

### For Developers
- **Develop Features**: Add new components and functionality
- **Run Tests**: `npm run test` for unit tests, `npm run test:e2e` for end-to-end
- **Build for Production**: `npm run build:production`

### For Content Creators
- **Add Content**: Create new modules and lessons in `content/modules/`
- **Validate Content**: `npm run validate:content`
- **Preview Changes**: Content updates automatically in development mode

### For Contributors
- **Report Issues**: Use GitHub Issues for bugs and feature requests
- **Submit Changes**: Fork, create branch, make changes, submit PR
- **Follow Guidelines**: See [CONTRIBUTING.md](CONTRIBUTING.md)

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build:production` | Build for deployment |
| `npm run test` | Run all tests |
| `npm run validate:content` | Check content structure |
| `npm run preview` | Preview production build |

## Project Structure

```
cv-tutorial-website/
├── content/          # Course content (modules & lessons)
├── src/             # Source code
│   ├── components/  # UI components
│   ├── pages/       # Page components
│   ├── styles/      # CSS files
│   └── utils/       # Utility functions
├── docs/            # Documentation
├── tests/           # Test files
└── dist/            # Built files (generated)
```

## Next Steps

1. **Explore the Code**: Look at existing components in `src/components/`
2. **Read Documentation**: Check out guides in the `docs/` folder
3. **Try Making Changes**: Edit content or code and see live updates
4. **Run Tests**: Ensure everything works with `npm run test`
5. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md) to publish your changes

## Need Help?

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Search existing issues or create a new one
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- **Content Creation**: Read [CONTENT_CREATORS_GUIDE.md](CONTENT_CREATORS_GUIDE.md)

## Common Tasks

### Adding New Content
1. Copy a template from `content/templates/`
2. Edit the frontmatter and content
3. Run `npm run validate:content` to check
4. Preview with `npm run dev`

### Making Code Changes
1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test: `npm run test`
4. Commit and push
5. Create a pull request

### Deploying Changes
1. Ensure tests pass: `npm run test`
2. Build: `npm run build:production`
3. Deploy using platform-specific commands or push to main branch

Happy coding! 🚀