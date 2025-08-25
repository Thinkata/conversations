# Netlify Functions

This directory contains serverless functions for Netlify deployment.

## Available Functions

Currently, this directory is set up for future serverless function development. The main application uses Nuxt 3's built-in API routes, but you can add custom Netlify functions here if needed.

## Adding Functions

To add a new function:

1. Create a new file in this directory (e.g., `hello.js`)
2. Export a handler function:

```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify!" })
  }
}
```

## Function Examples

### Basic Function
```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Hello from Netlify Functions!',
      timestamp: new Date().toISOString()
    })
  }
}
```

### Function with Environment Variables
```javascript
// netlify/functions/config.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apiUrl: process.env.BASE_URL,
      defaultModel: process.env.DEFAULT_MODEL,
      appName: process.env.APP_NAME
    })
  }
}
```

## Testing Functions Locally

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev

# Test functions
curl http://localhost:8888/.netlify/functions/hello
```

## Deployment

Functions are automatically deployed when you push to your connected Git repository or run `netlify deploy`.
