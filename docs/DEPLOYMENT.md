# Deployment Guide

This guide covers deploying the CV Tutorial Website to various hosting platforms.

## Overview

The CV Tutorial Website is built as a static site that can be deployed to any static hosting service. The build process generates optimized HTML, CSS, and JavaScript files in the `dist/` directory.

## Supported Platforms

- [GitHub Pages](#github-pages) (Recommended for open source)
- [Netlify](#netlify) (Recommended for ease of use)
- [Vercel](#vercel) (Recommended for performance)
- [Other Static Hosts](#other-static-hosts)

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass: `npm run test`
- [ ] Content is validated: `npm run validate:content`
- [ ] Production build works: `npm run build:production`
- [ ] Performance is acceptable: `npm run test:performance`
- [ ] Accessibility standards met: `npm run test:accessibility`

## GitHub Pages

### Automatic Deployment

The repository includes a GitHub Actions workflow for automatic deployment:

1. **Enable GitHub Pages** in repository settings
2. **Set source** to "GitHub Actions"
3. **Push to main branch** - deployment happens automatically

### Manual Deployment

```bash
# Build for production
npm run build:production

# Deploy to GitHub Pages
npm run deploy:gh-pages
```

### Configuration

The deployment workflow is configured in `.github/workflows/deploy.yml`:

- Triggers on pushes to `main` branch
- Runs tests before deployment
- Includes Lighthouse performance monitoring
- Provides deployment status updates

### Custom Domain

To use a custom domain:

1. Add `CNAME` file to `public/` directory:
   ```
   your-domain.com
   ```
2. Configure DNS with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Netlify

### Automatic Deployment

1. **Connect repository** to Netlify
2. **Configure build settings**:
   - Build command: `npm run build:production`
   - Publish directory: `dist`
   - Node version: `20`

### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
npm run deploy:netlify
```

### Configuration

The `netlify.toml` file includes:
- Build settings and environment variables
- Redirect rules for SPA routing
- Security headers
- Caching policies
- Performance optimizations

### Environment Variables

Set in Netlify dashboard if needed:
- `NODE_VERSION`: `20`
- `NPM_FLAGS`: `--prefix=/opt/buildhome/.nodejs/node_modules`

### Custom Domain

1. **Add domain** in Netlify site settings
2. **Configure DNS** with Netlify nameservers or CNAME
3. **Enable HTTPS** (automatic with Netlify)

## Vercel

### Automatic Deployment

1. **Import project** to Vercel
2. **Configure settings**:
   - Framework Preset: Other
   - Build Command: `npm run build:production`
   - Output Directory: `dist`
   - Install Command: `npm ci`

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
npm run deploy:vercel
```

### Configuration

The `vercel.json` file includes:
- Build and output settings
- Rewrite rules for SPA routing
- Security headers
- Caching policies

### Environment Variables

Set in Vercel dashboard if needed:
- `NODE_VERSION`: `20`

### Custom Domain

1. **Add domain** in Vercel project settings
2. **Configure DNS** as instructed by Vercel
3. **HTTPS** is automatic

## Other Static Hosts

### AWS S3 + CloudFront

```bash
# Build for production
npm run build:production

# Upload to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
npm run build:production
firebase deploy
```

### Surge.sh

```bash
# Install Surge CLI
npm install -g surge

# Build and deploy
npm run build:production
cd dist
surge
```

## Performance Optimization

### Build Optimization

The build process includes:
- **Code splitting**: Separate chunks for better caching
- **Minification**: Compressed JavaScript and CSS
- **Tree shaking**: Unused code removal
- **Asset optimization**: Compressed images and fonts

### Caching Strategy

Configure caching headers:
- **Static assets**: 1 year cache (`max-age=31536000`)
- **HTML files**: 1 hour cache (`max-age=3600`)
- **API responses**: No cache for dynamic content

### CDN Configuration

For optimal performance:
- Enable gzip/brotli compression
- Configure proper cache headers
- Use HTTP/2 or HTTP/3
- Enable edge caching

## Security Configuration

### Content Security Policy

The deployment includes CSP headers:
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
```

### Security Headers

Additional security headers:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### HTTPS Configuration

- Always use HTTPS in production
- Configure HSTS headers
- Use secure cookies if applicable
- Redirect HTTP to HTTPS

## Monitoring and Analytics

### Performance Monitoring

- **Lighthouse CI**: Automated performance testing
- **Core Web Vitals**: Monitor loading, interactivity, and visual stability
- **Bundle analysis**: Track bundle size changes

### Error Monitoring

Consider integrating:
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging
- **Google Analytics**: User behavior tracking

### Uptime Monitoring

Set up monitoring for:
- Site availability
- Performance metrics
- SSL certificate expiration
- DNS resolution

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build:production
```

#### Missing Environment Variables
- Check platform-specific environment variable settings
- Verify Node.js version compatibility
- Ensure all required dependencies are installed

#### Routing Issues
- Verify SPA redirect rules are configured
- Check that all routes are properly defined
- Test navigation in production environment

#### Performance Issues
- Run Lighthouse audit: `npm run build:analyze`
- Check bundle size: `npm run build:analyze`
- Verify caching headers are set correctly

### Platform-Specific Issues

#### GitHub Pages
- Check Actions tab for build logs
- Verify Pages is enabled in repository settings
- Ensure `gh-pages` branch exists and is set as source

#### Netlify
- Check deploy logs in Netlify dashboard
- Verify build command and publish directory
- Check for plugin conflicts

#### Vercel
- Review build logs in Vercel dashboard
- Verify framework preset and build settings
- Check for function timeout issues

## Rollback Procedures

### GitHub Pages
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Netlify
1. Go to Netlify dashboard
2. Select "Deploys" tab
3. Click "Publish deploy" on previous version

### Vercel
1. Go to Vercel dashboard
2. Select "Deployments" tab
3. Click "Promote to Production" on previous deployment

## Maintenance

### Regular Tasks

- **Update dependencies**: Monthly security updates
- **Performance audits**: Weekly Lighthouse checks
- **Content validation**: Before each content update
- **Backup verification**: Ensure git history is preserved

### Monitoring Checklist

- [ ] Site is accessible and loading properly
- [ ] All pages and navigation work correctly
- [ ] Images and media are loading
- [ ] Performance metrics are within acceptable ranges
- [ ] No console errors or warnings
- [ ] SSL certificate is valid and not expiring soon

### Update Process

1. **Test changes locally**: `npm run build:production`
2. **Run full test suite**: `npm run test`
3. **Deploy to staging** (if available)
4. **Deploy to production**
5. **Verify deployment** works correctly
6. **Monitor** for any issues

## Support

For deployment issues:

1. **Check logs** on your hosting platform
2. **Review documentation** for platform-specific guidance
3. **Test locally** to isolate the issue
4. **Contact support** for your hosting platform
5. **Create an issue** in the project repository for code-related problems