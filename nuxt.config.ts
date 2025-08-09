// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  nitro: {
    compatibilityDate: '2025-08-09'
  },
  colorMode: {
    preference: 'light'
  },
  runtimeConfig: {
    // Server-side environment variables
    LAMBDA_API_KEY: process.env.LAMBDA_API_KEY || '',
    LAMBDA_BASE_URL: process.env.LAMBDA_BASE_URL || 'https://api.lambda.ai/v1',
    public: {
      // Public variables accessible on client-side
    }
  }
})
