import { defineEventHandler, getRequestHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // Only apply to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Validate Content-Type for POST requests
  if (event.method === 'POST') {
    const contentType = getRequestHeader(event, 'content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          message: 'Content-Type must be application/json'
        }
      })
    }
  }

  // Validate request size (additional check)
  const contentLength = getRequestHeader(event, 'content-length')
  if (contentLength) {
    const size = parseInt(contentLength)
    if (size > 10 * 1024 * 1024) { // 10MB limit
      throw createError({
        statusCode: 413,
        statusMessage: 'Payload Too Large',
        data: {
          message: 'Request body too large (max 10MB)'
        }
      })
    }
  }

  // Add request timestamp for logging
  event.context.requestTimestamp = Date.now()
})
