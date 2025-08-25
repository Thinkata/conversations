import { defineEventHandler, getRequestHeader, createError } from 'h3'

// Simple in-memory rate limiting (for production, consider Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30 // 30 requests per minute

export default defineEventHandler(async (event) => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Get client IP from headers (fallback to 'unknown' if not available)
  const clientIP = getRequestHeader(event, 'x-forwarded-for') || 
                   getRequestHeader(event, 'x-real-ip') || 
                   getRequestHeader(event, 'cf-connecting-ip') || 
                   'unknown'
  
  // Extract first IP if multiple are present (e.g., "ip1, ip2, ip3")
  const cleanIP = clientIP.split(',')[0].trim()
  const now = Date.now()

  // Get current rate limit data for this IP
  const rateLimitData = rateLimitStore.get(cleanIP)

  if (rateLimitData && now < rateLimitData.resetTime) {
    // Within the current window
    if (rateLimitData.count >= MAX_REQUESTS_PER_WINDOW) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        data: {
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
        }
      })
    }
    // Increment count
    rateLimitData.count++
  } else {
    // New window or first request
    rateLimitStore.set(cleanIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
  }

  // Clean up old entries (prevent memory leaks)
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(ip)
      }
    }
  }
})
