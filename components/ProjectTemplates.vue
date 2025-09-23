<template>
  <div class="project-templates">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Project Templates</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Start with a pre-built project template</p>
      </div>
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

    <!-- Category Filter -->
    <div class="mb-6">
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by category:</span>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="category in categoryOptions"
            :key="category.value"
            @click="selectedCategory = category.value"
            :color="selectedCategory === category.value ? 'primary' : 'gray'"
            :variant="selectedCategory === category.value ? 'solid' : 'outline'"
            size="xs"
          >
            {{ category.label }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Templates Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="template in filteredTemplates"
        :key="template.id"
        @click="selectTemplate(template)"
        :class="[
          'template-card cursor-pointer transition-all duration-200 group hover:shadow-lg',
          selectedTemplate?.id === template.id ? 'ring-2 ring-primary-500' : ''
        ]"
      >
        <div class="p-4">
          <!-- Template Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ template.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {{ template.description }}
              </p>
            </div>
            <div class="flex items-center space-x-1 ml-2">
              <UBadge
                :label="template.category"
                :color="getCategoryColor(template.category)"
                variant="soft"
                size="xs"
              />
              <UBadge
                v-if="template.isBuiltIn"
                label="Built-in"
                color="green"
                variant="soft"
                size="xs"
              />
            </div>
          </div>

          <!-- Template Tags -->
          <div v-if="template.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
            <UBadge
              v-for="tag in template.tags.slice(0, 4)"
              :key="tag"
              :label="tag"
              color="blue"
              variant="soft"
              size="xs"
            />
            <UBadge
              v-if="template.tags.length > 4"
              :label="`+${template.tags.length - 4}`"
              color="gray"
              variant="soft"
              size="xs"
            />
          </div>

          <!-- Template Instructions Preview -->
          <div class="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded line-clamp-4 mb-4">
            {{ template.instructions.substring(0, 200) }}{{ template.instructions.length > 200 ? '...' : '' }}
          </div>

          <!-- Template Actions -->
          <div class="flex items-center justify-between">
            <UButton
              @click.stop="showTemplatePreview(template)"
              color="gray"
              variant="ghost"
              icon="i-heroicons-eye"
              size="xs"
            >
              Preview
            </UButton>
            <UButton
              @click.stop="createFromTemplate(template)"
              color="primary"
              variant="solid"
              icon="i-heroicons-plus"
              size="xs"
            >
              Use Template
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTemplates.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-document-text" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No templates found</h3>
      <p class="text-gray-600 dark:text-gray-400">
        Try selecting a different category
      </p>
    </div>

    <!-- Template Preview Modal -->
    <UModal
      v-model:open="showPreviewModal"
      title="Template Preview"
      size="lg"
    >
      <template #body>
        <div v-if="previewTemplate" class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ previewTemplate.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ previewTemplate.description }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge
              :label="previewTemplate.category"
              :color="getCategoryColor(previewTemplate.category)"
              variant="soft"
              size="sm"
            />
            <UBadge
              v-for="tag in previewTemplate.tags"
              :key="tag"
              :label="tag"
              color="blue"
              variant="soft"
              size="sm"
            />
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions</h4>
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ previewTemplate.instructions }}
            </div>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <UButton
              @click="showPreviewModal = false"
              color="gray"
              variant="ghost"
            >
              Close
            </UButton>
            <UButton
              @click="createFromTemplate(previewTemplate)"
              color="primary"
              variant="solid"
            >
              Use This Template
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ProjectTemplate, ProjectCategory } from '~/types/project'

// Props
interface Props {
  category?: ProjectCategory
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  create: [templateId: string]
  close: []
}>()

// Composables
const { templates, createProjectFromTemplate } = useProjectTemplates()

// State
const selectedCategory = ref<ProjectCategory | 'all'>(props.category || 'all')
const selectedTemplate = ref<ProjectTemplate | null>(null)
const showPreviewModal = ref(false)
const previewTemplate = ref<ProjectTemplate | null>(null)

// Category options
const categoryOptions = [
  { label: 'All', value: 'all' },
  { label: 'General', value: 'general' },
  { label: 'Coding', value: 'coding' },
  { label: 'Writing', value: 'writing' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Creative', value: 'creative' },
  { label: 'Workflow', value: 'workflow' }
]

// Computed
const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'all') {
    return templates.value
  }
  return templates.value.filter(template => template.category === selectedCategory.value)
})

// Methods
const selectTemplate = (template: ProjectTemplate) => {
  selectedTemplate.value = template
}

const showTemplatePreview = (template: ProjectTemplate) => {
  previewTemplate.value = template
  showPreviewModal.value = true
}

const createFromTemplate = (template: ProjectTemplate) => {
  try {
    createProjectFromTemplate(template.id)
    emit('create', template.id)
    showPreviewModal.value = false
  } catch (error) {
    console.error('Error creating project from template:', error)
  }
}

const getCategoryColor = (category: ProjectCategory) => {
  const colors = {
    general: 'gray',
    coding: 'blue',
    writing: 'green',
    analysis: 'purple',
    creative: 'pink',
    workflow: 'orange'
  }
  return colors[category] || 'gray'
}
</script>

<style scoped>
.project-templates {
  padding: 1.5rem;
}

.template-card {
  transition: all 0.2s ease;
}

.template-card:hover {
  transform: scale(1.02);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
