import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  // Simplified safelist - only keep classes that might be dynamically generated
  safelist: [
    // Dynamic chat selection states
    'bg-blue-100',
    'border-blue-300',
    'hover:bg-gray-100',
    // Dynamic message alignment
    'justify-end',
    'justify-start',
    // Dynamic message styling
    'bg-blue-600',
    'text-white',
    'border-blue-700',
    'bg-gray-100',
    'text-gray-900',
    'border-gray-200',
    // Dynamic drag states
    'border-blue-500',
    'bg-blue-50',
    'border-gray-200',
    'bg-white',
    // Dynamic opacity states
    'opacity-0',
    'opacity-100',
    // Dynamic spacing for chat items
    'space-y-2',
    'space-y-4',
    'space-y-6',
    'space-x-2',
    'space-x-3',
    'space-x-4',
    // Additional project component classes
    'line-clamp-2',
    'line-clamp-3',
    'line-clamp-4'
  ],
  theme: {
    extend: {
      // Custom colors that complement Nuxt UI
      colors: {
        // Keep any custom brand colors if needed
      },
      // Custom animations if needed
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
} as Config


