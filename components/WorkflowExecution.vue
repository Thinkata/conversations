<template>
  <div class="workflow-execution">
    <!-- Execution Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Workflow Execution</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ execution.workflowId }} • {{ formatDate(execution.startedAt) }}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <UBadge
          :label="execution.status"
          :color="getStatusColor(execution.status)"
          variant="soft"
          size="sm"
        />
        <UButton
          @click="$emit('close')"
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="sm"
        >
          Close
        </UButton>
      </div>
    </div>

    <!-- Execution Progress -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ execution.currentStepIndex + 1 }} / {{ execution.results.length }}
        </span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-primary-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${((execution.currentStepIndex + 1) / execution.results.length) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Execution Steps -->
    <div class="space-y-4">
      <div
        v-for="(result, index) in execution.results"
        :key="result.stepId"
        class="execution-step"
      >
        <UCard>
          <div class="p-4">
            <!-- Step Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-8 h-8 rounded-full"
                     :class="getStepStatusClasses(result.status)">
                  <UIcon
                    v-if="result.status === 'completed'"
                    name="i-heroicons-check"
                    class="h-4 w-4 text-white"
                  />
                  <UIcon
                    v-else-if="result.status === 'failed'"
                    name="i-heroicons-x-mark"
                    class="h-4 w-4 text-white"
                  />
                  <UIcon
                    v-else-if="result.status === 'running'"
                    name="i-heroicons-arrow-path"
                    class="h-4 w-4 text-white animate-spin"
                  />
                  <span v-else class="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {{ index + 1 }}
                  </span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-gray-100">
                    Step {{ index + 1 }}: {{ getProjectName(result.projectId) }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ getStepStatusText(result.status) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span v-if="result.executionTime" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDuration(result.executionTime) }}
                </span>
                <UButton
                  @click="toggleStepDetails(index)"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-chevron-down"
                  size="xs"
                  :class="{ 'rotate-180': expandedSteps.includes(index) }"
                />
              </div>
            </div>

            <!-- Step Details (Collapsible) -->
            <div v-if="expandedSteps.includes(index)" class="mt-4 space-y-4">
              <!-- Input -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input</h4>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <pre class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ JSON.stringify(result.input, null, 2) }}</pre>
                </div>
              </div>

              <!-- Output -->
              <div v-if="result.output">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output</h4>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <pre class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ JSON.stringify(result.output, null, 2) }}</pre>
                </div>
              </div>

              <!-- Error -->
              <div v-if="result.error">
                <h4 class="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Error</h4>
                <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p class="text-xs text-red-700 dark:text-red-300">{{ result.error }}</p>
                </div>
              </div>

              <!-- Timing -->
              <div class="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <span class="font-medium">Started:</span>
                  {{ formatTime(result.startedAt) }}
                </div>
                <div v-if="result.completedAt">
                  <span class="font-medium">Completed:</span>
                  {{ formatTime(result.completedAt) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Execution Summary -->
    <div v-if="execution.status === 'completed' || execution.status === 'failed'" class="mt-6">
      <UCard>
        <div class="p-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Execution Summary</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ execution.results.length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Total Steps</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ completedSteps }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                {{ failedSteps }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
          </div>

          <div v-if="execution.completedAt" class="text-center text-sm text-gray-600 dark:text-gray-400">
            Total execution time: {{ formatDuration(execution.completedAt - execution.startedAt) }}
          </div>

          <!-- Final Output -->
          <div v-if="execution.output" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Final Output</h4>
            <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <pre class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ JSON.stringify(execution.output, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WorkflowExecution } from '~/types/project'

// Props
interface Props {
  execution: WorkflowExecution
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Composables
const { projects } = useProjects()

// State
const expandedSteps = ref<number[]>([])

// Computed
const completedSteps = computed(() => 
  props.execution.results.filter(r => r.status === 'completed').length
)

const failedSteps = computed(() => 
  props.execution.results.filter(r => r.status === 'failed').length
)

// Methods
const getProjectName = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId)
  return project?.name || 'Unknown Project'
}

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'gray',
    running: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'yellow'
  }
  return colors[status as keyof typeof colors] || 'gray'
}

const getStepStatusClasses = (status: string) => {
  const baseClasses = 'flex items-center justify-center w-8 h-8 rounded-full'
  
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-500`
    case 'failed':
      return `${baseClasses} bg-red-500`
    case 'running':
      return `${baseClasses} bg-blue-500`
    default:
      return `${baseClasses} bg-gray-300 dark:bg-gray-600`
  }
}

const getStepStatusText = (status: string) => {
  const texts = {
    pending: 'Waiting to start',
    running: 'In progress',
    completed: 'Completed successfully',
    failed: 'Failed',
    cancelled: 'Cancelled'
  }
  return texts[status as keyof typeof texts] || status
}

const toggleStepDetails = (index: number) => {
  const expandedIndex = expandedSteps.value.indexOf(index)
  if (expandedIndex > -1) {
    expandedSteps.value.splice(expandedIndex, 1)
  } else {
    expandedSteps.value.push(index)
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatDuration = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
</script>

<style scoped>
.workflow-execution {
  padding: 1.5rem;
}

.execution-step {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
