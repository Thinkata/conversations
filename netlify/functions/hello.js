// Basic Hello Function for Netlify Functions
// This demonstrates how to create serverless functions

exports.handler = async (event, context) => {
  // Log the event for debugging
  console.log('Hello function called:', {
    method: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters,
    headers: event.headers
  })

  // Return a simple response
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Function-Name': 'hello',
      'X-Request-ID': context.awsRequestId
    },
    body: JSON.stringify({
      message: 'Hello from Netlify Functions!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      userAgent: event.headers['User-Agent'] || 'Unknown'
    })
  }
}
