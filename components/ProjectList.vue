<template>
  <div class="project-list-container">
    <!-- Header -->
    <div class="project-list-header">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Manage your AI project instructions</p>
        </div>
        <div class="flex items-center space-x-2">
          <UButton
            @click="showCreateModal = true"
            color="primary"
            variant="solid"
            icon="i-heroicons-plus"
            size="sm"
          >
            New Project
          </UButton>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex items-center space-x-4 mb-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search projects..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          class="flex-1 max-w-md"
        />
        <USelect
          v-model="selectedCategory"
          :options="categoryOptions"
          placeholder="All Categories"
          size="sm"
        />
        <UButton
          @click="showTemplates = true"
          color="gray"
          variant="ghost"
          icon="i-heroicons-document-text"
          size="sm"
        >
          Templates
        </UButton>
      </div>
    </div>

    <!-- Project Grid -->
    <div class="project-grid">
      <UCard
        v-for="project in filteredProjects"
        :key="project.id"
        @click="selectProject(project.id)"
        :class="[
          'project-card cursor-pointer transition-all duration-200 group',
          selectedProjectId === project.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
        ]"
        :ui="{
          background: selectedProjectId === project.id 
            ? 'bg-primary-50 dark:bg-primary-950/50' 
            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
          border: selectedProjectId === project.id 
            ? 'border-primary-200 dark:border-primary-800' 
            : 'border-gray-200 dark:border-gray-700'
        }"
      >
        <div class="project-card-content">
          <!-- Project Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {{ project.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {{ project.description }}
              </p>
            </div>
            <div class="flex items-center space-x-1 ml-2">
              <UButton
                @click.stop="duplicateProject(project.id)"
                color="gray"
                variant="ghost"
                icon="i-heroicons-document-duplicate"
                size="xs"
                title="Duplicate project"
              />
              <UButton
                @click.stop="editProject(project.id)"
                color="gray"
                variant="ghost"
                icon="i-heroicons-pencil"
                size="xs"
                title="Edit project"
              />
              <UButton
                @click.stop="deleteProject(project.id)"
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                size="xs"
                title="Delete project"
              />
            </div>
          </div>

          <!-- Project Metadata -->
          <div class="space-y-2">
            <!-- Tags and Workflow Indicator -->
            <div class="flex flex-wrap gap-1 items-center">
              <UBadge
                label="Workflow Ready"
                color="green"
                variant="soft"
                size="xs"
                icon="i-heroicons-arrow-path"
                class="mb-1"
              />
              <div v-if="project.tags.length > 0" class="flex flex-wrap gap-1">
                <UBadge
                  v-for="tag in project.tags.slice(0, 2)"
                  :key="tag"
                  :label="tag"
                  color="blue"
                  variant="soft"
                  size="xs"
                />
                <UBadge
                  v-if="project.tags.length > 2"
                  :label="`+${project.tags.length - 2}`"
                  color="gray"
                  variant="soft"
                  size="xs"
                />
              </div>
            </div>

            <!-- Category and Status -->
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-2">
                <UBadge
                  :label="project.metadata.category"
                  :color="getCategoryColor(project.metadata.category)"
                  variant="soft"
                  size="xs"
                />
                <span v-if="project.isActive" class="text-green-600 dark:text-green-400">●</span>
                <span v-else class="text-gray-400">○</span>
              </div>
              <span>{{ formatDate(project.updatedAt) }}</span>
            </div>

            <!-- Instructions Preview -->
            <div class="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded line-clamp-3">
              {{ project.instructions.substring(0, 150) }}{{ project.instructions.length > 150 ? '...' : '' }}
            </div>

            <!-- Stats -->
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ project.metadata.messageCount }} messages</span>
              <span>{{ project.model }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Empty State -->
      <div v-if="filteredProjects.length === 0" class="col-span-full text-center py-12">
        <UIcon name="i-heroicons-document-text" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ searchQuery || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Create your first project to get started' }}
        </p>
        <UButton
          @click="showCreateModal = true"
          color="primary"
          variant="solid"
          icon="i-heroicons-plus"
        >
          Create Project
        </UButton>
      </div>
    </div>


    <!-- Create/Edit Project Modal -->
    <UModal
      v-model:open="showCreateModal"
      :title="editingProject ? 'Edit Project' : 'Create New Project'"
      size="lg"
    >
      <template #body>
        <ProjectForm
          :project="editingProject"
          @save="handleProjectSave"
          @cancel="showCreateModal = false"
        />
      </template>
    </UModal>


    <!-- Templates Modal -->
    <UModal
      v-model:open="showTemplates"
      title="Project Templates"
      size="lg"
    >
      <template #body>
        <ProjectTemplates @create="handleTemplateCreate" @close="showTemplates = false" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Project, ProjectCategory } from '~/types/project'
import ProjectForm from './ProjectForm.vue'
import ProjectTemplates from './ProjectTemplates.vue'

// Composables
const { 
  projects, 
  selectedProjectId, 
  createProject, 
  updateProject, 
  deleteProject, 
  duplicateProject: duplicateProjectAction,
  filterProjects,
  initialize
} = useProjects()

// State
const searchQuery = ref('')
const selectedCategory = ref<ProjectCategory | 'all'>('all')
const showCreateModal = ref(false)
const showTemplates = ref(false)
const editingProject = ref<Project | null>(null)

// Category options
const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'General', value: 'general' },
  { label: 'Coding', value: 'coding' },
  { label: 'Writing', value: 'writing' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Creative', value: 'creative' },
  { label: 'Workflow', value: 'workflow' }
]

// Computed
const filteredProjects = computed(() => {
  const filter: any = {}
  
  if (searchQuery.value) {
    filter.search = searchQuery.value
  }
  
  if (selectedCategory.value !== 'all') {
    filter.category = selectedCategory.value
  }
  
  return filterProjects(filter)
})

// Methods
const selectProject = (projectId: string) => {
  // This would be handled by the parent component
  // For now, we'll just emit an event
  emit('select', projectId)
}

const editProject = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    editingProject.value = project
    showCreateModal.value = true
  }
}

const handleProjectSave = (projectData: any) => {
  if (editingProject.value) {
    updateProject(editingProject.value.id, projectData)
  } else {
    createProject(projectData)
  }
  
  editingProject.value = null
  showCreateModal.value = false
}

const handleTemplateCreate = (templateId: string) => {
  const { createProjectFromTemplate } = useProjectTemplates()
  createProjectFromTemplate(templateId)
  showTemplates.value = false
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

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Emits
const emit = defineEmits<{
  select: [projectId: string]
}>()

// Initialize
onMounted(async () => {
  await initialize()
})
</script>

<style scoped>
.project-list-container {
  padding: 1.5rem;
}

.project-list-header {
  margin-bottom: 1.5rem;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .project-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.project-card {
  transition: all 0.2s ease;
}

.project-card:hover {
  transform: scale(1.02);
}

.project-card-content {
  padding: 1rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
