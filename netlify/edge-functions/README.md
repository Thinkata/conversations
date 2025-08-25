# Netlify Edge Functions

This directory contains edge functions for Netlify deployment. Edge functions run on Netlify's edge network for improved performance and global distribution.

## Available Edge Functions

Currently, this directory is set up for future edge function development. You can add custom edge functions here for:

- Request/response modification
- Authentication
- Rate limiting
- A/B testing
- Geolocation-based routing

## Adding Edge Functions

To add a new edge function:

1. Create a new file in this directory (e.g., `auth.js`)
2. Export a handler function:

```javascript
export default async (request, context) => {
  // Modify request/response here
  return new Response('Hello from Edge Function!', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

## Edge Function Examples

### Basic Edge Function
```javascript
// netlify/edge-functions/hello.js
export default async (request, context) => {
  return new Response('Hello from Edge Function!', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

### Authentication Edge Function
```javascript
// netlify/edge-functions/auth.js
export default async (request, context) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Continue with authenticated request
  return context.next()
}
```

### Geolocation Edge Function
```javascript
// netlify/edge-functions/geo.js
export default async (request, context) => {
  const country = context.geo?.country || 'Unknown'
  
  return new Response(`Hello from ${country}!`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

## Testing Edge Functions Locally

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev

# Test edge functions
curl http://localhost:8888/.netlify/edge-functions/hello
```

## Deployment

Edge functions are automatically deployed when you push to your connected Git repository or run `netlify deploy`.

## Performance Benefits

- **Global Distribution**: Functions run close to your users
- **Low Latency**: Faster response times
- **Scalability**: Automatic scaling based on demand
- **Cost Effective**: Pay only for what you use
