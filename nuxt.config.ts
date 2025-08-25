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
    API_KEY: process.env.API_KEY || '',
    BASE_URL: process.env.BASE_URL || 'https://api.lambda.ai/v1',
    public: {
      // Public variables accessible on client-side
      DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'deepseek-r1-671b',
      APP_NAME: process.env.APP_NAME || 'RawChat',
      DEFAULT_SYSTEM_PROMPT: process.env.DEFAULT_SYSTEM_PROMPT || '',
      ENABLE_IMAGE_UPLOAD: process.env.ENABLE_IMAGE_UPLOAD !== 'false', // true by default
      MAX_IMAGE_SIZE_MB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10')
    }
  }
})
