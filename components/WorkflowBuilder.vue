<template>
  <div class="workflow-builder">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Workflow Builder</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Drag projects from the left to build your workflow sequence</p>
      </div>
      <div class="flex items-center space-x-2">
        <UButton
          @click="clearWorkflow"
          color="gray"
          variant="outline"
          icon="i-heroicons-trash"
          size="sm"
          :disabled="workflowSteps.length === 0"
        >
          Clear
        </UButton>
        <UButton
          @click="saveWorkflow"
          color="primary"
          variant="solid"
          icon="i-heroicons-check"
          size="sm"
          :disabled="workflowSteps.length === 0"
        >
          Save Workflow
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      <!-- Left Panel: Project List -->
      <div class="project-panel">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Available Projects</h3>
          <UInput
            v-model="searchQuery"
            placeholder="Search projects..."
            icon="i-heroicons-magnifying-glass"
            size="sm"
            class="w-48"
          />
        </div>
        
        <div class="project-list space-y-2 overflow-y-auto h-full">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            :draggable="true"
            @dragstart="handleDragStart($event, project)"
            @dragend="handleDragEnd"
            class="project-item cursor-move p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
            :class="{ 'opacity-50': isDragging }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ project.name }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ project.description }}</p>
                <div class="flex items-center space-x-2 mt-2">
                  <UBadge
                    :label="project.metadata.category"
                    :color="getCategoryColor(project.metadata.category)"
                    variant="soft"
                    size="xs"
                  />
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ project.model }}</span>
                </div>
              </div>
              <UIcon name="i-heroicons-bars-3" class="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredProjects.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-document-text" class="h-8 w-8 mx-auto mb-2" />
            <p>No projects found</p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Workflow Sequence -->
      <div class="workflow-panel">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Workflow Sequence</h3>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ workflowSteps.length }} step{{ workflowSteps.length === 1 ? '' : 's' }}</span>
        </div>
        
        <div
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          class="workflow-sequence space-y-3 overflow-y-auto h-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200"
          :class="{
            'border-primary-400 bg-primary-50 dark:bg-primary-950/20': isDragOver,
            'border-gray-300 dark:border-gray-600': !isDragOver && workflowSteps.length === 0,
            'border-gray-200 dark:border-gray-700': !isDragOver && workflowSteps.length > 0
          }"
        >
          <!-- Workflow Steps -->
          <div
            v-for="(step, index) in workflowSteps"
            :key="step.id"
            class="workflow-step p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-sm font-medium">
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 dark:text-gray-100">{{ step.project.name }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{{ step.project.description }}</p>
                  <div class="flex items-center space-x-2 mt-1">
                    <UBadge
                      :label="step.project.metadata.category"
                      :color="getCategoryColor(step.project.metadata.category)"
                      variant="soft"
                      size="xs"
                    />
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ step.project.model }}</span>
                  </div>
                </div>
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
                  :disabled="index === workflowSteps.length - 1"
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
            
            <!-- Connection Arrow -->
            <div v-if="index < workflowSteps.length - 1" class="flex justify-center mt-3">
              <UIcon name="i-heroicons-arrow-down" class="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <!-- Drop Zone -->
          <div
            v-if="workflowSteps.length === 0"
            class="text-center py-12 text-gray-500 dark:text-gray-400"
          >
            <UIcon name="i-heroicons-arrow-path" class="h-12 w-12 mx-auto mb-4" />
            <p class="text-lg font-medium mb-2">No workflow steps yet</p>
            <p class="text-sm">Drag projects from the left panel to build your workflow</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Workflow Modal -->
    <UModal
      v-model:open="showSaveModal"
      title="Save Workflow"
      size="md"
    >
      <template #body>
        <div class="space-y-4">
          <UFormGroup label="Workflow Name" required>
            <UInput
              v-model="workflowName"
              placeholder="Enter workflow name"
            />
          </UFormGroup>
          
          <UFormGroup label="Description">
            <UTextarea
              v-model="workflowDescription"
              placeholder="Describe what this workflow does..."
              :rows="3"
            />
          </UFormGroup>
          
          <div class="flex items-center justify-end space-x-3 pt-4">
            <UButton
              @click="showSaveModal = false"
              color="gray"
              variant="ghost"
            >
              Cancel
            </UButton>
            <UButton
              @click="confirmSaveWorkflow"
              color="primary"
              variant="solid"
              :disabled="!workflowName.trim()"
            >
              Save Workflow
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Project, Workflow, WorkflowStep } from '~/types/project'

// Composables
const { projects, createWorkflow, initialize } = useProjects()

// Emits
const emit = defineEmits<{
  'workflow-created': []
}>()

// State
const searchQuery = ref('')
const workflowSteps = ref<Array<{ id: string; project: Project; order: number }>>([])
const isDragging = ref(false)
const isDragOver = ref(false)
const draggedProject = ref<Project | null>(null)
const showSaveModal = ref(false)
const workflowName = ref('')
const workflowDescription = ref('')

// Computed
const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  
  const query = searchQuery.value.toLowerCase()
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(query) ||
    project.description.toLowerCase().includes(query) ||
    project.tags.some(tag => tag.toLowerCase().includes(query))
  )
})

// Methods
const handleDragStart = (event: DragEvent, project: Project) => {
  isDragging.value = true
  draggedProject.value = project
  event.dataTransfer!.effectAllowed = 'copy'
  event.dataTransfer!.setData('text/plain', project.id)
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedProject.value = null
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'copy'
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  // Only set isDragOver to false if we're leaving the drop zone entirely
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const projectId = event.dataTransfer!.getData('text/plain')
  const project = projects.value.find(p => p.id === projectId)
  
  if (project) {
    addProjectToWorkflow(project)
  }
}

const addProjectToWorkflow = (project: Project) => {
  // Check if project is already in workflow
  if (workflowSteps.value.some(step => step.project.id === project.id)) {
    return // Don't add duplicates
  }
  
  const newStep = {
    id: crypto.randomUUID(),
    project: { ...project }, // Retain all project attributes
    order: workflowSteps.value.length
  }
  
  workflowSteps.value.push(newStep)
}

const removeStep = (index: number) => {
  workflowSteps.value.splice(index, 1)
  // Update order for remaining steps
  workflowSteps.value.forEach((step, i) => {
    step.order = i
  })
}

const moveStepUp = (index: number) => {
  if (index > 0) {
    const steps = workflowSteps.value
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
  if (index < workflowSteps.value.length - 1) {
    const steps = workflowSteps.value
    const temp = steps[index]
    steps[index] = steps[index + 1]
    steps[index + 1] = temp
    
    // Update order
    steps.forEach((step, i) => {
      step.order = i
    })
  }
}

const clearWorkflow = () => {
  workflowSteps.value = []
}

const saveWorkflow = () => {
  if (workflowSteps.value.length === 0) return
  
  // Pre-fill with a default name if empty
  if (!workflowName.value) {
    workflowName.value = `Workflow with ${workflowSteps.value.length} step${workflowSteps.value.length === 1 ? '' : 's'}`
  }
  
  showSaveModal.value = true
}

const confirmSaveWorkflow = async () => {
  if (!workflowName.value.trim() || workflowSteps.value.length === 0) return
  
  try {
    const workflowData = {
      name: workflowName.value,
      description: workflowDescription.value || `A workflow with ${workflowSteps.value.length} steps`,
      steps: workflowSteps.value.map(step => ({
        id: step.id,
        projectId: step.project.id,
        order: step.order,
        // Simple input mapping: output of previous step becomes input of next step
        inputMapping: step.order > 0 ? {
          fromStepId: workflowSteps.value[step.order - 1].id,
          outputKey: 'content', // Default output key
          inputKey: 'message'   // Default input key
        } : undefined
      })),
      isActive: true
    }
    
    await createWorkflow(workflowData)
    
    // Reset form
    showSaveModal.value = false
    workflowName.value = ''
    workflowDescription.value = ''
    workflowSteps.value = []
    
    // Emit event to parent
    emit('workflow-created')
    
    // Show success message
    // You could add a toast notification here
  } catch (error) {
    console.error('Error saving workflow:', error)
  }
}

const getCategoryColor = (category: string) => {
  const colors = {
    general: 'gray',
    coding: 'blue',
    writing: 'green',
    analysis: 'purple',
    creative: 'pink',
    workflow: 'orange'
  }
  return colors[category as keyof typeof colors] || 'gray'
}

// Initialize
onMounted(async () => {
  await initialize()
})
</script>

<style scoped>
.workflow-builder {
  padding: 1.5rem;
  height: 100vh;
  overflow: hidden;
}

.project-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-list {
  flex: 1;
  overflow-y: auto;
}

.project-item {
  transition: all 0.2s ease;
}

.project-item:hover {
  transform: translateY(-1px);
}

.workflow-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.workflow-sequence {
  flex: 1;
  overflow-y: auto;
}

.workflow-step {
  transition: all 0.2s ease;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
