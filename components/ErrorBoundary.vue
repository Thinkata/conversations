<template>
  <div v-if="error" class="error-boundary">
    <UCard class="max-w-md mx-auto mt-8">
      <template #header>
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-500" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h3>
        </div>
      </template>
      
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
        </p>
        
        <div v-if="showDetails" class="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <p class="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
            {{ error.message }}
          </p>
        </div>
        
        <div class="flex space-x-3">
          <UButton
            @click="retry"
            color="primary"
            variant="solid"
            icon="i-heroicons-arrow-path"
          >
            Try Again
          </UButton>
          
          <UButton
            @click="toggleDetails"
            color="gray"
            variant="ghost"
            :icon="showDetails ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
          >
            {{ showDetails ? 'Hide' : 'Show' }} Details
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  error?: Error | null
}

interface Emits {
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  error: null
})

const emit = defineEmits<Emits>()

const showDetails = ref(false)

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const retry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-boundary {
  @apply min-h-screen flex items-center justify-center p-4;
}
</style>
