# GitHub Actions - Cypress Testing

This directory contains the automated testing workflow for the Conversations application.

## 🚀 Quick Start

The GitHub Actions workflow is automatically configured and will run on:
- **Push** to `main` or `develop` branches
- **Pull Request** to `main` or `develop` branches

## 📋 Workflow Details

### **File**: `cypress-tests.yml`

**Purpose**: Automated end-to-end testing using Cypress

**What it does**:
1. **Setup**: Checkout code, install dependencies, setup Node.js 20
2. **Build**: Build the Nuxt application
3. **Test**: Start the app and run all Cypress tests
4. **Report**: Generate detailed test result summaries
5. **Artifacts**: Upload screenshots/videos on test failures

### **Test Coverage**
- **Functionality Tests**: 33 tests covering core features
- **Security Tests**: 14 tests covering security measures
- **Total**: 47 automated tests

## ⚙️ Configuration

### **Environment Variables**
The workflow uses these environment variables for testing:
```yaml
API_KEY: 'test-key'                    # Test API key
BASE_URL: 'https://api.example.com/v1' # Test API endpoint
DEFAULT_MODEL: 'test-model'            # Test model
```

### **Customization**
To customize the workflow:

1. **Add Repository Secrets** (optional):
   - Go to Settings → Secrets and variables → Actions
   - Add `API_KEY` with your actual API key
   - Add `BASE_URL` with your actual API endpoint

2. **Modify Test Specs**:
   - Edit the `spec` section in the workflow
   - Add/remove test files as needed

3. **Change Triggers**:
   - Modify the `on` section to change when tests run
   - Add/remove branches as needed

## 🔧 Troubleshooting

### **Common Issues**

1. **Build Failures**:
   - **Node.js Version**: Ensure using Node.js 20.19.0+ (Nuxt 4 requirement)
   - **Native Bindings**: Clear node_modules and package-lock.json if oxc-parser fails
   - **Dependencies**: Verify all dependencies are properly installed
   - **TypeScript**: Check for compilation errors

2. **Test Failures**:
   - Review test screenshots and videos in artifacts
   - Check Cypress configuration
   - Verify test environment setup

3. **Timeout Issues**:
   - Increase `wait-on-timeout` if app takes longer to start
   - Check for memory/performance issues

### **Debug Commands**

Add these to the workflow for debugging:
```yaml
- name: Debug Info
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    echo "Directory contents: $(ls -la)"
```

### **Native Binding Issues (oxc-parser)**

If you encounter `oxc-parser` native binding errors:

1. **Clear Dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm ci
   ```

2. **Verify Node.js Version**:
   ```bash
   node --version  # Must be >=20.19.0
   ```

3. **Platform Compatibility**:
   - Ensure the workflow runs on a compatible platform (Ubuntu recommended)
   - The workflow automatically handles this with `runs-on: ubuntu-latest`

## 📊 Monitoring

### **Workflow Status**
- **Green**: All tests passing ✅
- **Red**: Tests failing ❌
- **Yellow**: Tests running ⏳

### **Artifacts**
On test failure, the workflow uploads:
- **Screenshots**: Visual evidence of test failures
- **Videos**: Complete test execution recordings
- **Logs**: Detailed execution logs

## 🎯 Best Practices

1. **Keep Tests Fast**: Optimize test execution time
2. **Fail Fast**: Use `fail-fast: false` for parallel execution
3. **Meaningful Names**: Use descriptive test and step names
4. **Error Handling**: Always handle failures gracefully
5. **Documentation**: Keep this README updated

## 🔗 Related Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Cypress Testing Best Practices](https://docs.cypress.io/guides/references/best-practices)
