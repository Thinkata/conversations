<template>
  <div class="project-form">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Basic Information</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <UFormGroup label="Project Name" required>
              <UInput
                v-model="formData.name"
                placeholder="Enter project name"
                :error="errors.name"
              />
            </UFormGroup>
          </div>
          
          <div>
            <UFormGroup label="Category">
              <USelect
                v-model="formData.category"
                :options="categoryOptions"
                placeholder="Select category"
              />
            </UFormGroup>
          </div>
        </div>

        <UFormGroup label="Description">
          <UTextarea
            v-model="formData.description"
            placeholder="Describe what this project does..."
            :rows="3"
          />
        </UFormGroup>

        <UFormGroup label="Tags">
          <UTagsInput
            v-model="formData.tags"
            placeholder="Add tags (press Enter to add)"
            :allow-duplicates="false"
          />
        </UFormGroup>
      </div>

      <!-- AI Configuration -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">AI Configuration</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="AI Model" required>
            <USelect
              v-model="formData.model"
              :options="modelOptions"
              placeholder="Select AI model"
            />
          </UFormGroup>
          
          <UFormGroup label="Status">
            <UToggle
              v-model="formData.isActive"
              :label="formData.isActive ? 'Active' : 'Inactive'"
            />
          </UFormGroup>
        </div>
      </div>

      <!-- Instructions -->
      <div class="space-y-4">
        <UFormGroup 
          label="Instructions (System Prompt)" 
          required
          description="Define how the AI should behave for this project. These instructions will be used as the system prompt."
        >
          <UTextarea
            v-model="formData.instructions"
            placeholder="Enter detailed instructions for the AI..."
            :rows="8"
            :error="errors.instructions"
            class="font-mono text-sm"
          />
        </UFormGroup>

        <!-- Instructions Preview -->
        <div v-if="formData.instructions" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h4>
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {{ formData.instructions }}
          </div>
        </div>
      </div>

      <!-- Template Selection (only for new projects) -->
      <div v-if="!project && showTemplates" class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Start from Template</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UCard
            v-for="template in templates"
            :key="template.id"
            @click="selectTemplate(template)"
            :class="[
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              selectedTemplate?.id === template.id ? 'ring-2 ring-primary-500' : ''
            ]"
          >
            <div class="p-3">
              <h4 class="font-medium text-gray-900 dark:text-gray-100">{{ template.name }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ template.description }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <UBadge
                  v-for="tag in template.tags.slice(0, 3)"
                  :key="tag"
                  :label="tag"
                  color="blue"
                  variant="soft"
                  size="xs"
                />
              </div>
            </div>
          </UCard>
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
          {{ project ? 'Update Project' : 'Create Project' }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Project, ProjectCategory } from '~/types/project'

// Props
interface Props {
  project?: Project | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  save: [projectData: any]
  cancel: []
}>()

// Composables
const { models: modelOptions } = useModels()
const { templates } = useProjectTemplates()

// State
const formData = ref({
  name: '',
  description: '',
  instructions: '',
  model: 'gpt-4',
  category: 'general' as ProjectCategory,
  tags: [] as string[],
  isActive: true
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const showTemplates = ref(false)
const selectedTemplate = ref<any>(null)

// Category options
const categoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Coding', value: 'coding' },
  { label: 'Writing', value: 'writing' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Creative', value: 'creative' },
  { label: 'Workflow', value: 'workflow' }
]

// Initialize form data
const initializeForm = () => {
  if (props.project) {
    formData.value = {
      name: props.project.name,
      description: props.project.description,
      instructions: props.project.instructions,
      model: props.project.model,
      category: props.project.metadata.category,
      tags: [...props.project.tags],
      isActive: props.project.isActive
    }
  } else {
    // Show templates for new projects
    showTemplates.value = true
  }
}

// Template selection
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
  formData.value = {
    ...formData.value,
    name: template.name,
    description: template.description,
    instructions: template.instructions,
    category: template.category,
    tags: [...template.tags]
  }
}

// Validation
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Project name is required'
  }
  
  if (!formData.value.instructions.trim()) {
    errors.value.instructions = 'Instructions are required'
  }
  
  if (formData.value.instructions.length < 10) {
    errors.value.instructions = 'Instructions must be at least 10 characters long'
  }
  
  return Object.keys(errors.value).length === 0
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const projectData = {
      ...formData.value,
      metadata: {
        category: formData.value.category,
        messageCount: props.project?.metadata.messageCount || 0,
        lastUsed: props.project?.metadata.lastUsed || 0
      }
    }
    
    emit('save', projectData)
  } catch (error) {
    console.error('Error saving project:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for changes in project prop
watch(() => props.project, initializeForm, { immediate: true })

// Initialize on mount
onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.project-form {
  max-width: 56rem; /* equivalent to max-w-4xl */
  margin-left: auto;
  margin-right: auto;
}
</style>
