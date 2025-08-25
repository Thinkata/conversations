# 🚀 Netlify Deployment Guide

This guide covers deploying your AI Chat application to Netlify with proper configuration and optimization.

## 📋 Prerequisites

- [Netlify account](https://netlify.com) (free tier available)
- [GitHub repository](https://github.com) with your code
- [Node.js 20.19.0+](https://nodejs.org/) installed locally
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (optional, for local testing)

## 🔧 Quick Deployment

### Option 1: Deploy from Git (Recommended)

1. **Connect your repository**
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your repository

2. **Configure build settings**
   ```
   Build command: npm run build
   Publish directory: .output/public
   ```

3. **Set environment variables**
   - Go to Site settings > Environment variables
   - Add your configuration:
   ```
   API_KEY=your_api_key_here
   BASE_URL=https://api.lambda.ai/v1
   DEFAULT_MODEL=deepseek-r1-671b
   APP_NAME=RawChat
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site is live! 🎉

### Option 2: Manual Deployment

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy with Netlify CLI**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=.output/public
   ```

## ⚙️ Configuration

### Environment Variables

Set these in Netlify's dashboard under Site settings > Environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_KEY` | Your AI API key | ✅ Yes | - |
| `BASE_URL` | AI API endpoint | ❌ No | `https://api.lambda.ai/v1` |
| `DEFAULT_MODEL` | Default AI model | ❌ No | `deepseek-r1-671b` |
| `APP_NAME` | Application name | ❌ No | `RawChat` |
| `DEFAULT_SYSTEM_PROMPT` | Default system prompt | ❌ No | - |
| `ENABLE_IMAGE_UPLOAD` | Enable image uploads | ❌ No | `true` |
| `MAX_IMAGE_SIZE_MB` | Max image size | ❌ No | `10` |

### Build Settings

The `netlify.toml` file automatically configures:

- **Build command**: `npm run build`
- **Publish directory**: `.output/public`
- **Node version**: 20.19.0
- **NPM version**: 10.0.0

### Redirects & Headers

Netlify automatically handles:

- **SPA routing**: All routes redirect to `index.html`
- **Security headers**: XSS protection, content type validation
- **Caching**: Static assets cached for 1 year
- **API routes**: No caching for dynamic content

## 🔒 Security Features

### Built-in Protection

- **XSS Prevention**: DOMPurify integration
- **Content Security**: Secure file handling
- **Headers**: Security-focused HTTP headers
- **Environment isolation**: API keys never exposed to client

### Custom Security

Add custom security rules in `netlify.toml`:

```toml
[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

## 📱 Performance Optimization

### Automatic Optimizations

- **Image optimization**: Automatic compression and formats
- **CSS/JS minification**: Reduced file sizes
- **HTML optimization**: Clean, efficient markup
- **CDN distribution**: Global edge network

### Custom Performance

Configure in `netlify.toml`:

```toml
[build.processing]
  image = true
  css = true
  js = true
  html = true
```

## 🧪 Testing & Development

### Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local server
netlify dev

# Test functions
curl http://localhost:8888/.netlify/functions/hello
```

### Preview Deployments

- **Automatic**: Every PR gets a preview URL
- **Branch deploys**: Deploy feature branches
- **Testing**: Test changes before merging

## 🚨 Troubleshooting

### Common Issues

#### Build Failures

1. **Check Node version**
   ```bash
   node --version  # Should be 20.19.0+
   ```

2. **Verify dependencies**
   ```bash
   npm install
   npm run build
   ```

3. **Check environment variables**
   - Ensure `API_KEY` is set
   - Verify `BASE_URL` is correct

#### Runtime Errors

1. **Check browser console**
   - Look for JavaScript errors
   - Verify API calls are working

2. **Check Netlify logs**
   - Go to Site settings > Functions
   - View function execution logs

3. **Test API endpoints**
   ```bash
   curl https://your-site.netlify.app/api/models
   ```

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
export DEBUG=netlify:*

# Run with verbose output
netlify deploy --prod --dir=.output/public --debug
```

## 🔄 Continuous Deployment

### Automatic Deploys

- **Push to main**: Automatic production deployment
- **Pull requests**: Preview deployments
- **Branch pushes**: Branch-specific deployments

### Manual Deploys

```bash
# Deploy specific branch
netlify deploy --prod --dir=.output/public --branch=feature/new-feature

# Deploy with custom context
netlify deploy --prod --dir=.output/public --context=staging
```

## 📊 Monitoring & Analytics

### Built-in Metrics

- **Build times**: Track deployment performance
- **Function execution**: Monitor serverless performance
- **Error rates**: Track application errors
- **Performance**: Core Web Vitals monitoring

### Custom Analytics

Add your own analytics:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>

<!-- Custom tracking -->
<script>
  // Track custom events
  window.trackEvent = (event, data) => {
    // Your tracking logic
  }
</script>
```

## 🎯 Best Practices

### Development Workflow

1. **Local testing**: Always test locally first
2. **Environment variables**: Use different values for dev/staging/prod
3. **Branch strategy**: Use feature branches for new features
4. **Testing**: Run tests before deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] API keys valid and active
- [ ] Build succeeds locally
- [ ] Tests pass
- [ ] Security headers configured
- [ ] Performance optimized
- [ ] Monitoring enabled

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Nuxt 3 Deployment](https://nuxt.com/docs/getting-started/deployment)
- [Vue 3 Best Practices](https://vuejs.org/guide/best-practices/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)

---

**Need help?** Check the [troubleshooting section](#-troubleshooting) or [open an issue](https://github.com/your-repo/issues) on GitHub.
