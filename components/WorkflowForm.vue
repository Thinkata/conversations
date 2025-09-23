<template>
  <div class="workflow-form">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Basic Information</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Workflow Name" required>
            <UInput
              v-model="formData.name"
              placeholder="Enter workflow name"
              :error="errors.name"
            />
          </UFormGroup>
          
          <UFormGroup label="Status">
            <UToggle
              v-model="formData.isActive"
              :label="formData.isActive ? 'Active' : 'Inactive'"
            />
          </UFormGroup>
        </div>

        <UFormGroup label="Description">
          <UTextarea
            v-model="formData.description"
            placeholder="Describe what this workflow does..."
            :rows="3"
          />
        </UFormGroup>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">How to Create a Workflow</h4>
            <ol class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. <strong>Select projects</strong> for each step - these will execute in sequence</li>
              <li>2. <strong>Configure input sources</strong> - how each step gets its input data</li>
              <li>3. <strong>Add more steps</strong> if needed to chain multiple projects together</li>
              <li>4. <strong>Preview your workflow</strong> to see the execution order</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Workflow Steps -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Workflow Steps</h3>
          <UButton
            @click="addStep"
            color="primary"
            variant="outline"
            icon="i-heroicons-plus"
            size="sm"
          >
            Add Step
          </UButton>
        </div>

        <div v-if="formData.steps.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 mx-auto mb-2" />
          <p>No steps added yet. Add your first step to get started.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(step, index) in formData.steps"
            :key="step.id"
            class="workflow-step"
          >
            <UCard>
              <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center space-x-2">
                      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium">
                        {{ index + 1 }}
                      </div>
                      <div>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Step {{ index + 1 }}: {{ step.projectId ? getProjectName(step.projectId) : 'Select Project' }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ step.projectId ? 'Project selected' : 'Choose a project to execute in this step' }}
                        </p>
                      </div>
                    </div>
                    <UBadge
                      v-if="step.inputMapping"
                      label="Chained"
                      color="blue"
                      variant="soft"
                      size="xs"
                    />
                  </div>
                  <div class="flex items-center space-x-1">
                    <UButton
                      @click="moveStepUp(index)"
                      :disabled="index === 0"
                      color="gray"
                      variant="ghost"
                      icon="i-heroicons-arrow-up"
                      size="xs"
                      title="Move up"
                    />
                    <UButton
                      @click="moveStepDown(index)"
                      :disabled="index === formData.steps.length - 1"
                      color="gray"
                      variant="ghost"
                      icon="i-heroicons-arrow-down"
                      size="xs"
                      title="Move down"
                    />
                    <UButton
                      @click="removeStep(index)"
                      color="red"
                      variant="ghost"
                      icon="i-heroicons-trash"
                      size="xs"
                      title="Remove step"
                    />
                  </div>
                </div>

                <!-- Project Selection - Most Important -->
                <div class="mb-4">
                  <UFormGroup label="Select Project for This Step" required>
                    <USelect
                      v-if="projectOptions.length > 0"
                      v-model="step.projectId"
                      :options="projectOptions"
                      placeholder="Choose which project to execute in this step..."
                      :error="errors[`step_${index}_project`]"
                      size="lg"
                    />
                    <div v-else class="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div class="flex items-center space-x-2">
                        <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">No projects available</p>
                          <p class="text-xs text-yellow-700 dark:text-yellow-300">Create a project first before adding it to a workflow.</p>
                        </div>
                      </div>
                    </div>
                    <template #help>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This project will be executed with its custom instructions when the workflow runs.
                      </p>
                    </template>
                  </UFormGroup>
                </div>

                <!-- Input Configuration -->
                <div class="mt-4">
                  <UFormGroup label="Input Source">
                    <USelect
                      v-model="step.inputMappingType"
                      :options="inputMappingOptions"
                      placeholder="Select input source"
                      @change="handleInputMappingChange(index, $event)"
                    />
                    <template #help>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Choose how this step gets its input data. "Workflow Input" uses the initial input, "Previous Step Output" uses the result from the previous step.
                      </p>
                    </template>
                  </UFormGroup>
                </div>

                <!-- Input Mapping Configuration -->
                <div v-if="step.inputMappingType === 'previous' && index > 0" class="mt-4 space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Input Mapping</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormGroup label="From Step">
                      <USelect
                        v-model="step.inputMapping.fromStepId"
                        :options="previousStepOptions(index)"
                        placeholder="Select previous step"
                      />
                    </UFormGroup>
                    <UFormGroup label="Output Key">
                      <UInput
                        v-model="step.inputMapping.outputKey"
                        placeholder="e.g., 'content', 'result'"
                      />
                    </UFormGroup>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormGroup label="Input Key">
                      <UInput
                        v-model="step.inputMapping.inputKey"
                        placeholder="e.g., 'message', 'prompt'"
                      />
                    </UFormGroup>
                    <UFormGroup label="Transform">
                      <UInput
                        v-model="step.inputMapping.transform"
                        placeholder="Optional transformation (e.g., 'uppercase')"
                      />
                    </UFormGroup>
                  </div>
                </div>

              </div>
            </UCard>
          </div>
        </div>
      </div>

      <!-- Workflow Preview -->
      <div v-if="formData.steps.length > 0" class="space-y-4">
        <div class="flex items-center space-x-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Workflow Preview</h3>
          <UBadge :label="`${formData.steps.length} step${formData.steps.length === 1 ? '' : 's'}`" color="blue" variant="soft" size="sm" />
        </div>
        <div class="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-center space-x-2 overflow-x-auto">
            <div
              v-for="(step, index) in formData.steps"
              :key="step.id"
              class="flex items-center space-x-2 flex-shrink-0"
            >
              <div class="flex items-center space-x-3 bg-white dark:bg-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium">
                  {{ index + 1 }}
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ step.projectId ? getProjectName(step.projectId) : 'No Project Selected' }}
                  </span>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ step.projectId ? 'Ready to execute' : 'Please select a project' }}
                  </p>
                </div>
              </div>
              <UIcon
                v-if="index < formData.steps.length - 1"
                name="i-heroicons-arrow-right"
                class="h-5 w-5 text-gray-400"
              />
            </div>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
            This workflow will execute {{ formData.steps.length }} project{{ formData.steps.length === 1 ? '' : 's' }} in sequence, passing output from one to the next.
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <UButton
          @click="$emit('cancel')"
          color="gray"
          variant="ghost"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          color="primary"
          variant="solid"
          :loading="isSubmitting"
        >
          {{ workflow ? 'Update Workflow' : 'Create Workflow' }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Workflow, WorkflowStep } from '~/types/project'

// Props
interface Props {
  workflow?: Workflow | null
  selectedProjectId?: string | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  save: [workflowData: any]
  cancel: []
}>()

// Composables
const { projects } = useProjects()

// State
const formData = ref({
  name: '',
  description: '',
  isActive: true,
  steps: [] as Array<WorkflowStep & { inputMappingType: string }>
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// Computed
const projectOptions = computed(() => 
  projects.value.map(project => ({
    label: project.name,
    value: project.id
  }))
)

const inputMappingOptions = [
  { label: 'Workflow Input', value: 'input' },
  { label: 'Previous Step Output', value: 'previous' },
  { label: 'Manual Input', value: 'manual' }
]

// Methods
const initializeForm = () => {
  if (props.workflow) {
    formData.value = {
      name: props.workflow.name,
      description: props.workflow.description,
      isActive: props.workflow.isActive,
      steps: props.workflow.steps.map(step => ({
        ...step,
        inputMappingType: step.inputMapping ? 'previous' : 'input'
      }))
    }
  } else if (props.selectedProjectId) {
    // If we have a selected project but no workflow, create a new step with that project
    formData.value = {
      name: '',
      description: '',
      isActive: true,
      steps: [{
        id: crypto.randomUUID(),
        projectId: props.selectedProjectId,
        order: 0,
        inputMappingType: 'input',
        inputMapping: undefined as any,
        config: undefined as any
      }]
    }
  }
}

const addStep = () => {
  const newStep = {
    id: crypto.randomUUID(),
    projectId: '',
    order: formData.value.steps.length,
    inputMappingType: 'input',
    inputMapping: undefined as any,
    config: undefined as any
  }
  
  formData.value.steps.push(newStep)
}

const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
  // Update order for remaining steps
  formData.value.steps.forEach((step, i) => {
    step.order = i
  })
}

const moveStepUp = (index: number) => {
  if (index > 0) {
    const steps = formData.value.steps
    const temp = steps[index]
    steps[index] = steps[index - 1]
    steps[index - 1] = temp
    
    // Update order
    steps.forEach((step, i) => {
      step.order = i
    })
  }
}

const moveStepDown = (index: number) => {
  if (index < formData.value.steps.length - 1) {
    const steps = formData.value.steps
    const temp = steps[index]
    steps[index] = steps[index + 1]
    steps[index + 1] = temp
    
    // Update order
    steps.forEach((step, i) => {
      step.order = i
    })
  }
}

const handleInputMappingChange = (index: number, mappingType: string) => {
  const step = formData.value.steps[index]
  
  if (mappingType === 'previous') {
    step.inputMapping = {
      fromStepId: '',
      outputKey: '',
      inputKey: '',
      transform: ''
    }
  } else {
    step.inputMapping = undefined
  }
}

const previousStepOptions = (currentIndex: number) => {
  return formData.value.steps
    .slice(0, currentIndex)
    .map((step, index) => ({
      label: `Step ${index + 1}: ${getProjectName(step.projectId)}`,
      value: step.id
    }))
}

const getProjectName = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId)
  return project?.name || 'Unknown Project'
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Workflow name is required'
  }
  
  if (formData.value.steps.length === 0) {
    errors.value.steps = 'At least one step is required'
  }
  
  formData.value.steps.forEach((step, index) => {
    if (!step.projectId) {
      errors.value[`step_${index}_project`] = 'Project is required'
    }
  })
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const workflowData = {
      ...formData.value,
      steps: formData.value.steps.map(step => {
        const { inputMappingType, configJson, ...stepData } = step
        
        // Parse config JSON
        let config = undefined
        if (configJson.trim()) {
          try {
            config = JSON.parse(configJson)
          } catch (e) {
            console.warn('Invalid JSON in step config:', e)
          }
        }
        
        return {
          ...stepData,
          config
        }
      })
    }
    
    emit('save', workflowData)
  } catch (error) {
    console.error('Error saving workflow:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for changes in workflow prop
watch(() => props.workflow, initializeForm, { immediate: true })

// Watch for projects to load
watch(() => projects.value, () => {
  if (projects.value.length > 0) {
    initializeForm()
  }
}, { immediate: true })

// Initialize on mount
onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.workflow-form {
  max-width: 72rem; /* equivalent to max-w-6xl */
  margin-left: auto;
  margin-right: auto;
}

.workflow-step {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
