<template>
  <div class="workflow-manager">
    <!-- Three-Pane Layout -->
    <div class="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
      
      <!-- Left Pane: Workflow List -->
      <div class="col-span-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Workflows</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Selected: {{ selectedWorkflowId || 'None' }} | Clicks: {{ clickCounter }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <UButton
              @click="createNewWorkflow"
              color="primary"
              variant="solid"
              icon="i-heroicons-plus"
              size="sm"
            >
              New
            </UButton>
            <UButton
              @click="() => { console.log('Test click'); selectedWorkflowId = workflows.value[0]?.id || null; }"
              color="gray"
              variant="outline"
              size="sm"
            >
              Test
            </UButton>
          </div>
        </div>
        
        <div class="space-y-2 overflow-y-auto h-[calc(100%-60px)]">
          <div
            v-for="workflow in workflows"
            :key="workflow.id"
            @click="() => { clickCounter++; console.log('Clicked workflow:', workflow.id, workflow.name, 'Click count:', clickCounter.value); selectWorkflow(workflow.id); }"
            :class="[
              'p-3 rounded-lg border cursor-pointer transition-all duration-200',
              selectedWorkflowId === workflow.id
                ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-200 dark:border-primary-800'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ workflow.name }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ workflow.description }}</p>
                <div class="flex items-center space-x-2 mt-2">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ workflow.steps.length }} steps</span>
                  <span v-if="workflow.isActive" class="text-xs text-green-600 dark:text-green-400">●</span>
                  <span v-else class="text-xs text-gray-400">○</span>
                </div>
              </div>
              <div class="flex items-center space-x-1 ml-2" @click.stop>
                <UButton
                  @click="startChatWithWorkflow(workflow.id)"
                  color="green"
                  variant="ghost"
                  icon="i-heroicons-chat-bubble-left-right"
                  size="xs"
                  title="Start chat with this workflow"
                />
                <UButton
                  @click="editWorkflow(workflow.id)"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-pencil"
                  size="xs"
                  title="Edit workflow"
                />
                <UButton
                  @click="deleteWorkflow(workflow.id)"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  size="xs"
                  title="Delete workflow"
                />
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="workflows.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 mx-auto mb-2" />
            <p class="text-sm">No workflows yet</p>
          </div>
        </div>
      </div>

      <!-- Middle Pane: Available Projects -->
      <div class="col-span-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
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
        
        <div class="space-y-2 overflow-y-auto h-[calc(100%-60px)]">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            :draggable="selectedWorkflowId ? true : false"
            @dragstart="handleDragStart($event, project)"
            @dragend="handleDragEnd"
            class="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
            :class="{ 'opacity-50': isDragging || !selectedWorkflowId }"
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
            <p class="text-sm">No projects found</p>
          </div>
          
          <!-- No Workflow Selected State -->
          <div v-if="!selectedWorkflowId" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 mx-auto mb-2" />
            <p class="text-sm">Select a workflow to add projects</p>
          </div>
        </div>
      </div>

      <!-- Right Pane: Workflow Details/Builder -->
      <div class="col-span-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div v-if="selectedWorkflowId && selectedWorkflow">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ selectedWorkflow.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedWorkflow.description }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <UButton
                @click="executeWorkflow(selectedWorkflow.id)"
                color="green"
                variant="solid"
                icon="i-heroicons-play"
                size="sm"
                :loading="executingWorkflowId === selectedWorkflow.id"
              >
                Execute
              </UButton>
              <UButton
                @click="saveWorkflow"
                color="primary"
                variant="outline"
                icon="i-heroicons-check"
                size="sm"
              >
                Save
              </UButton>
            </div>
          </div>
          
          <!-- Workflow Steps -->
          <div
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            class="space-y-3 overflow-y-auto h-[calc(100%-100px)] p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200"
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
              class="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
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
                      <USelect
                        v-model="step.model"
                        :options="modelOptions"
                        placeholder="Select model"
                        size="xs"
                        class="w-32"
                      />
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
              <p class="text-sm">Drag projects from the middle panel to build your workflow</p>
            </div>
          </div>
        </div>
        
        <!-- No Workflow Selected State -->
        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-arrow-path" class="h-12 w-12 mx-auto mb-4" />
          <p class="text-lg font-medium mb-2">No workflow selected</p>
          <p class="text-sm">Select a workflow from the left panel to view and edit its steps</p>
        </div>
      </div>
    </div>

    <!-- Edit Workflow Modal -->
    <UModal
      v-model:open="showEditModal"
      title="Edit Workflow"
      size="md"
    >
      <template #body>
        <div class="space-y-4">
          <UFormGroup label="Workflow Name" required>
            <UInput
              v-model="editingWorkflowName"
              placeholder="Enter workflow name"
            />
          </UFormGroup>
          
          <UFormGroup label="Description">
            <UTextarea
              v-model="editingWorkflowDescription"
              placeholder="Describe what this workflow does..."
              :rows="3"
            />
          </UFormGroup>
          
          <div class="flex items-center justify-end space-x-3 pt-4">
            <UButton
              @click="showEditModal = false"
              color="gray"
              variant="ghost"
            >
              Cancel
            </UButton>
            <UButton
              @click="saveWorkflowEdit"
              color="primary"
              variant="solid"
              :disabled="!editingWorkflowName.trim()"
            >
              Save Changes
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Execution Results Modal -->
    <UModal
      v-model:open="showExecutionModal"
      title="Workflow Execution"
      size="lg"
    >
      <template #body>
        <WorkflowExecutionComponent
          v-if="currentExecution"
          :execution="currentExecution"
          @close="showExecutionModal = false"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Workflow, WorkflowExecution, Project } from '~/types/project'
import WorkflowExecutionComponent from './WorkflowExecution.vue'

// Props
interface Props {
  prefillData?: any
  selectedProjectId?: string | null
}

const props = defineProps<Props>()

// Composables
const { 
  workflows, 
  projects,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow: deleteWorkflowAction,
  executeWorkflow: executeWorkflowAction,
  initialize
} = useProjects()

const { models } = useModels()

// Local state for workflow selection (not managed by composable)
const selectedWorkflowId = ref<string | null>(null)
const clickCounter = ref(0)

// State
const showExecutionModal = ref(false)
const showEditModal = ref(false)
const currentExecution = ref<WorkflowExecution | null>(null)
const executingWorkflowId = ref<string | null>(null)
const searchQuery = ref('')
const isDragging = ref(false)
const isDragOver = ref(false)
const draggedProject = ref<Project | null>(null)
const workflowSteps = ref<Array<{ id: string; project: Project; order: number; model: string }>>([])
const editingWorkflowId = ref<string | null>(null)
const editingWorkflowName = ref('')
const editingWorkflowDescription = ref('')

// Computed
const selectedWorkflow = computed(() => 
  workflows.value.find(w => w.id === selectedWorkflowId.value)
)

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  
  const query = searchQuery.value.toLowerCase()
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(query) ||
    project.description.toLowerCase().includes(query) ||
    project.tags.some(tag => tag.toLowerCase().includes(query))
  )
})

const modelOptions = computed(() => 
  models.value.map(model => ({
    label: model.name,
    value: model.id
  }))
)

// Watch for prefill data
watch(() => props.prefillData, (newData) => {
  if (newData) {
    // Handle prefill data if needed
  }
}, { immediate: true })

// Watch for selected project ID
watch(() => props.selectedProjectId, (projectId) => {
  if (projectId && !props.prefillData) {
    // Handle selected project if needed
  }
}, { immediate: true })

// Watch for selected workflow changes
watch(selectedWorkflowId, (workflowId) => {
  console.log('selectedWorkflowId changed to:', workflowId)
  if (workflowId && selectedWorkflow.value) {
    // Load workflow steps
    loadWorkflowSteps()
  } else {
    // Clear workflow steps
    workflowSteps.value = []
  }
})

// Debug: Watch workflows
watch(workflows, (newWorkflows) => {
  console.log('Workflows updated:', newWorkflows.length, 'workflows')
}, { immediate: true })

// Methods
const selectWorkflow = (workflowId: string) => {
  console.log('selectWorkflow called with:', workflowId)
  console.log('Current selectedWorkflowId before:', selectedWorkflowId.value)
  selectedWorkflowId.value = workflowId
  console.log('Current selectedWorkflowId after:', selectedWorkflowId.value)
  emit('select', workflowId)
}

const createNewWorkflow = async () => {
  try {
    const newWorkflow = {
      name: `New Workflow ${workflows.value.length + 1}`,
      description: 'A new workflow',
      steps: [],
      isActive: true
    }
    
    const createdWorkflow = await createWorkflow(newWorkflow)
    // Select the newly created workflow
    selectedWorkflowId.value = createdWorkflow.id
  } catch (error) {
    console.error('Error creating workflow:', error)
  }
}

const loadWorkflowSteps = () => {
  if (!selectedWorkflow.value) return
  
  workflowSteps.value = selectedWorkflow.value.steps.map(step => {
    const project = projects.value.find(p => p.id === step.projectId)
    return {
      id: step.id,
      project: project || { name: 'Unknown Project', description: '', metadata: { category: 'general' }, model: 'unknown' } as Project,
      order: step.order,
      model: step.model || project?.model || 'gpt-4'
    }
  })
}

const editWorkflow = (workflowId: string) => {
  const workflow = workflows.value.find(w => w.id === workflowId)
  if (workflow) {
    editingWorkflowId.value = workflowId
    editingWorkflowName.value = workflow.name
    editingWorkflowDescription.value = workflow.description
    showEditModal.value = true
  }
}

const saveWorkflowEdit = async () => {
  if (!editingWorkflowId.value || !editingWorkflowName.value.trim()) return
  
  try {
    const workflow = workflows.value.find(w => w.id === editingWorkflowId.value)
    if (workflow) {
      const updatedWorkflow = {
        ...workflow,
        name: editingWorkflowName.value.trim(),
        description: editingWorkflowDescription.value.trim()
      }
      
      await updateWorkflow(editingWorkflowId.value, updatedWorkflow)
      showEditModal.value = false
      editingWorkflowId.value = null
      editingWorkflowName.value = ''
      editingWorkflowDescription.value = ''
    }
  } catch (error) {
    console.error('Error updating workflow:', error)
  }
}

const deleteWorkflow = async (workflowId: string) => {
  if (confirm('Are you sure you want to delete this workflow?')) {
    await deleteWorkflowAction(workflowId)
    if (selectedWorkflowId.value === workflowId) {
      selectedWorkflowId.value = null
    }
  }
}

const executeWorkflow = async (workflowId: string) => {
  try {
    executingWorkflowId.value = workflowId
    
    // For now, we'll use a mock input
    const input = { message: 'Execute workflow' }
    
    const execution = await executeWorkflowAction(workflowId, input)
    currentExecution.value = execution
    showExecutionModal.value = true
  } catch (error) {
    console.error('Error executing workflow:', error)
  } finally {
    executingWorkflowId.value = null
  }
}

const saveWorkflow = async () => {
  if (!selectedWorkflow.value || workflowSteps.value.length === 0) return
  
  try {
    const updatedWorkflow = {
      ...selectedWorkflow.value,
      steps: workflowSteps.value.map(step => ({
        id: step.id,
        projectId: step.project.id,
        order: step.order,
        model: step.model,
        inputMapping: step.order > 0 ? {
          fromStepId: workflowSteps.value[step.order - 1].id,
          outputKey: 'content',
          inputKey: 'message'
        } : undefined
      }))
    }
    
    await updateWorkflow(selectedWorkflow.value.id, updatedWorkflow)
  } catch (error) {
    console.error('Error saving workflow:', error)
  }
}

// Drag and drop methods
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
    order: workflowSteps.value.length,
    model: project.model // Use project's default model initially
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

const startChatWithWorkflow = (workflowId: string) => {
  emit('start-chat', workflowId)
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

// Emits
const emit = defineEmits<{
  select: [workflowId: string]
  'start-chat': [workflowId: string]
  close: []
}>()

// Initialize
onMounted(async () => {
  await initialize()
})
</script>

<style scoped>
.workflow-manager {
  padding: 1.5rem;
}

.workflow-card {
  transition: all 0.2s ease;
}

.workflow-card:hover {
  transform: scale(1.01);
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
