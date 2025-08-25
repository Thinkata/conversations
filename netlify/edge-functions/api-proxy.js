// API Proxy Edge Function
// This function handles API routing and can be used for rate limiting, authentication, etc.

export default async (request, context) => {
  // Get the request path
  const url = new URL(request.url)
  const path = url.pathname
  
  // Log the request for debugging
  console.log(`API Proxy: ${request.method} ${path}`)
  
  // Add security headers
  const response = await context.next()
  
  // Set security headers
  response.headers.set('X-API-Proxy', 'true')
  response.headers.set('X-Request-ID', context.requestId)
  
  return response
}
