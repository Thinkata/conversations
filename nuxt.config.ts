// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  css: ['~/assets/css/tailwind.css'],
  
  // Enable SSR for API routes
  ssr: true,
  
  nitro: {
    preset: 'netlify',
    compatibilityDate: '2025-08-09',
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      failOnError: false
    },
    // Security: Limit request size to prevent abuse
    experimental: {
      wasm: true
    },
    // Request size limits (increased for video support)
    maxRequestBodySize: '100mb',
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
        }
      },
      '/api/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  },
  
  colorMode: {
    preference: 'light'
  },

  // Performance optimizations
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true
  },

  // Bundle optimization
  build: {
    transpile: ['@nuxt/ui']
  },

  runtimeConfig: {
    // Server-side environment variables (not exposed to client)
    API_KEY: process.env.API_KEY || '',
    BASE_URL: process.env.BASE_URL || 'https://api.openai.com/v1',
    public: {
      // Public variables accessible on client-side (safe to expose)
      DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
      APP_NAME: process.env.APP_NAME || 'RawChat',
      DEFAULT_SYSTEM_PROMPT: process.env.DEFAULT_SYSTEM_PROMPT || '',
      ENABLE_IMAGE_UPLOAD: process.env.ENABLE_IMAGE_UPLOAD !== 'false', // true by default
      MAX_IMAGE_SIZE_MB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10'),
      ENABLE_VIDEO_UPLOAD: process.env.ENABLE_VIDEO_UPLOAD !== 'false', // true by default
      MAX_VIDEO_SIZE_MB: parseInt(process.env.MAX_VIDEO_SIZE_MB || '50')
    }
  }
})
