import { ref, computed, watch } from 'vue'
import type { 
  Project, 
  Workflow, 
  WorkflowExecution, 
  ProjectFilter, 
  WorkflowFilter,
  ProjectTemplate,
  WorkflowStep,
  WorkflowStepResult
} from '~/types/project'

// Default project templates
const DEFAULT_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'A versatile AI assistant for general tasks and conversations',
    instructions: 'You are a helpful AI assistant. Provide accurate, helpful, and engaging responses to user queries. Be concise but thorough, and always aim to be useful.',
    category: 'general',
    tags: ['assistant', 'general', 'helpful'],
    isBuiltIn: true
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Specialized assistant for reviewing and improving code quality',
    instructions: 'You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices. Provide specific, actionable feedback with examples of improvements.',
    category: 'coding',
    tags: ['coding', 'review', 'quality', 'security'],
    isBuiltIn: true
  },
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    description: 'Expert in creating clear, comprehensive technical documentation',
    instructions: 'You are a technical writing expert. Create clear, well-structured documentation that explains complex concepts in an accessible way. Use proper formatting, examples, and maintain consistency throughout.',
    category: 'writing',
    tags: ['writing', 'documentation', 'technical', 'clarity'],
    isBuiltIn: true
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Specialized in data analysis, visualization, and insights',
    instructions: 'You are a data analysis expert. Help users analyze data, create visualizations, identify patterns, and draw meaningful insights. Provide statistical analysis and recommendations based on data.',
    category: 'analysis',
    tags: ['data', 'analysis', 'statistics', 'insights'],
    isBuiltIn: true
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Expert in creative writing, storytelling, and content creation',
    instructions: 'You are a creative writing expert. Help with storytelling, character development, plot structure, dialogue, and creative content. Be imaginative, engaging, and help bring ideas to life.',
    category: 'creative',
    tags: ['creative', 'writing', 'storytelling', 'content'],
    isBuiltIn: true
  },
  {
    id: 'workflow-optimizer',
    name: 'Workflow Optimizer',
    description: 'Specialized in analyzing and optimizing business processes and workflows',
    instructions: 'You are a workflow optimization expert. Analyze business processes, identify bottlenecks, suggest improvements, and help design efficient workflows. Focus on productivity and efficiency gains.',
    category: 'workflow',
    tags: ['workflow', 'optimization', 'process', 'efficiency'],
    isBuiltIn: true
  }
]

// Project management state
const projects = ref<Project[]>([])
const workflows = ref<Workflow[]>([])
const executions = ref<WorkflowExecution[]>([])
const selectedProjectId = ref<string | null>(null)
const selectedWorkflowId = ref<string | null>(null)
const isInitialLoad = ref(true)

// Project management composable
export const useProjects = () => {
  // Computed properties
  const selectedProject = computed(() => 
    projects.value.find(p => p.id === selectedProjectId.value)
  )

  const selectedWorkflow = computed(() => 
    workflows.value.find(w => w.id === selectedWorkflowId.value)
  )

  const activeProjects = computed(() => 
    projects.value.filter(p => p.isActive)
  )

  const activeWorkflows = computed(() => 
    workflows.value.filter(w => w.isActive)
  )

  // Project CRUD operations
  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        messageCount: 0,
        lastUsed: 0,
        category: 'general'
      }
    }
    
    projects.value.unshift(newProject)
    selectedProjectId.value = newProject.id
    saveProjectsToStorage()
    return newProject
  }

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        ...updates,
        updatedAt: Date.now()
      }
      saveProjectsToStorage()
      return projects.value[index]
    }
    return null
  }

  const deleteProject = (projectId: string) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
      
      // If this was the selected project, select another one
      if (selectedProjectId.value === projectId) {
        selectedProjectId.value = projects.value.length > 0 ? projects.value[0].id : null
      }
      
      saveProjectsToStorage()
      return true
    }
    return false
  }

  const duplicateProject = (projectId: string) => {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return null

    const duplicatedProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        ...project.metadata,
        messageCount: 0,
        lastUsed: 0
      }
    }

    projects.value.unshift(duplicatedProject)
    selectedProjectId.value = duplicatedProject.id
    saveProjectsToStorage()
    return duplicatedProject
  }

  // Workflow CRUD operations
  const createWorkflow = (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>) => {
    const newWorkflow: Workflow = {
      ...workflowData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        executionCount: 0,
        lastExecuted: 0,
        averageExecutionTime: 0
      }
    }
    
    workflows.value.unshift(newWorkflow)
    selectedWorkflowId.value = newWorkflow.id
    saveWorkflowsToStorage()
    return newWorkflow
  }

  const updateWorkflow = (workflowId: string, updates: Partial<Workflow>) => {
    const index = workflows.value.findIndex(w => w.id === workflowId)
    if (index !== -1) {
      workflows.value[index] = {
        ...workflows.value[index],
        ...updates,
        updatedAt: Date.now()
      }
      saveWorkflowsToStorage()
      return workflows.value[index]
    }
    return null
  }

  const deleteWorkflow = (workflowId: string) => {
    const index = workflows.value.findIndex(w => w.id === workflowId)
    if (index !== -1) {
      workflows.value.splice(index, 1)
      
      // If this was the selected workflow, select another one
      if (selectedWorkflowId.value === workflowId) {
        selectedWorkflowId.value = workflows.value.length > 0 ? workflows.value[0].id : null
      }
      
      saveWorkflowsToStorage()
      return true
    }
    return false
  }

  // Workflow execution
  const executeWorkflow = async (workflowId: string, input: any) => {
    const workflow = workflows.value.find(w => w.id === workflowId)
    if (!workflow) throw new Error('Workflow not found')

    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflowId,
      status: 'pending',
      currentStepIndex: 0,
      results: [],
      startedAt: Date.now(),
      input
    }

    executions.value.unshift(execution)
    saveExecutionsToStorage()

    try {
      execution.status = 'running'
      
      // Execute each step in sequence
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        execution.currentStepIndex = i
        
        const stepResult: WorkflowStepResult = {
          stepId: step.id,
          projectId: step.projectId,
          status: 'running',
          input: step.inputMapping ? 
            getStepInput(execution, step.inputMapping) : 
            (i === 0 ? input : execution.results[i - 1]?.output),
          startedAt: Date.now()
        }

        execution.results.push(stepResult)

        try {
          // Execute the project step
          const project = projects.value.find(p => p.id === step.projectId)
          if (!project) {
            throw new Error(`Project ${step.projectId} not found`)
          }

          // Here we would call the actual project execution
          // For now, we'll simulate it
          const output = await executeProjectStep(project, stepResult.input)
          
          stepResult.status = 'completed'
          stepResult.output = output
          stepResult.completedAt = Date.now()
          stepResult.executionTime = stepResult.completedAt - stepResult.startedAt

        } catch (error) {
          stepResult.status = 'failed'
          stepResult.error = error instanceof Error ? error.message : 'Unknown error'
          stepResult.completedAt = Date.now()
          stepResult.executionTime = stepResult.completedAt - stepResult.startedAt
          
          execution.status = 'failed'
          execution.error = stepResult.error
          break
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed'
        execution.completedAt = Date.now()
        execution.output = execution.results[execution.results.length - 1]?.output
      }

    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.completedAt = Date.now()
    }

    // Update workflow metadata
    const workflowIndex = workflows.value.findIndex(w => w.id === workflowId)
    if (workflowIndex !== -1) {
      workflows.value[workflowIndex].metadata.executionCount++
      workflows.value[workflowIndex].metadata.lastExecuted = Date.now()
      
      if (execution.completedAt) {
        const executionTime = execution.completedAt - execution.startedAt
        const currentAvg = workflows.value[workflowIndex].metadata.averageExecutionTime
        const count = workflows.value[workflowIndex].metadata.executionCount
        workflows.value[workflowIndex].metadata.averageExecutionTime = 
          (currentAvg * (count - 1) + executionTime) / count
      }
    }

    saveExecutionsToStorage()
    saveWorkflowsToStorage()
    
    return execution
  }

  // Helper functions
  const getStepInput = (execution: WorkflowExecution, inputMapping: WorkflowStep['inputMapping']) => {
    if (!inputMapping) return execution.input

    const sourceResult = execution.results.find(r => r.stepId === inputMapping.fromStepId)
    if (!sourceResult?.output) return execution.input

    // Simple key mapping - could be enhanced for more complex mappings
    return sourceResult.output[inputMapping.outputKey] || execution.input
  }

  const executeProjectStep = async (project: Project, input: any) => {
    try {
      console.log(`[Workflow] Executing project step: ${project.name} (${project.id})`)
      
      // Use the project's instructions as the system prompt
      const systemPrompt = project.instructions
      
      // Prepare the input message
      const userMessage = typeof input === 'string' ? input : JSON.stringify(input, null, 2)
      
      console.log(`[Workflow] Input for ${project.name}:`, userMessage)
      console.log(`[Workflow] System prompt for ${project.name}:`, systemPrompt.substring(0, 100) + '...')
      
      // Call the chat API with the project's instructions
      const response = await $fetch('/api/chat', {
        method: 'POST',
        body: {
          message: userMessage,
          model: project.model || 'gpt-4',
          systemPrompt: systemPrompt,
          projectId: project.id
        }
      })
      
      const result = {
        content: response.content || response.message || 'No response generated',
        projectId: project.id,
        projectName: project.name,
        timestamp: Date.now(),
        model: project.model || 'gpt-4'
      }
      
      console.log(`[Workflow] Completed project step: ${project.name}`)
      return result
    } catch (error) {
      console.error(`[Workflow] Error executing project step ${project.name}:`, error)
      throw new Error(`Failed to execute project "${project.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Filtering functions
  const filterProjects = (filter: ProjectFilter) => {
    return projects.value.filter(project => {
      if (filter.category && project.metadata.category !== filter.category) return false
      if (filter.isActive !== undefined && project.isActive !== filter.isActive) return false
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => project.tags.includes(tag))
        if (!hasMatchingTag) return false
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const matchesName = project.name.toLowerCase().includes(searchLower)
        const matchesDescription = project.description.toLowerCase().includes(searchLower)
        const matchesInstructions = project.instructions.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription && !matchesInstructions) return false
      }
      return true
    })
  }

  const filterWorkflows = (filter: WorkflowFilter) => {
    return workflows.value.filter(workflow => {
      if (filter.isActive !== undefined && workflow.isActive !== filter.isActive) return false
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const matchesName = workflow.name.toLowerCase().includes(searchLower)
        const matchesDescription = workflow.description.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription) return false
      }
      return true
    })
  }

  // Storage functions
  const saveProjectsToStorage = () => {
    if (process.client && typeof window !== 'undefined' && window.localStorage) {
      try {
        const data = {
          projects: projects.value,
          selectedProjectId: selectedProjectId.value,
          timestamp: Date.now()
        }
        localStorage.setItem('project-data', JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save projects to storage:', error)
      }
    }
  }

  const saveWorkflowsToStorage = () => {
    if (process.client && typeof window !== 'undefined' && window.localStorage) {
      try {
        const data = {
          workflows: workflows.value,
          selectedWorkflowId: selectedWorkflowId.value,
          timestamp: Date.now()
        }
        localStorage.setItem('workflow-data', JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save workflows to storage:', error)
      }
    }
  }

  const saveExecutionsToStorage = () => {
    if (process.client && typeof window !== 'undefined' && window.localStorage) {
      try {
        // Only keep recent executions to avoid storage bloat
        const recentExecutions = executions.value.slice(0, 50)
        localStorage.setItem('execution-data', JSON.stringify(recentExecutions))
      } catch (error) {
        console.error('Failed to save executions to storage:', error)
      }
    }
  }

  const loadProjectsFromStorage = async () => {
    if (process.client && typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('project-data')
        if (stored) {
          const data = JSON.parse(stored)
          projects.value = data.projects || []
          selectedProjectId.value = data.selectedProjectId || null
        }
      } catch (error) {
        console.error('Failed to load projects from storage:', error)
      }
    }
  }

  const loadWorkflowsFromStorage = async () => {
    if (process.client && typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('workflow-data')
        if (stored) {
          const data = JSON.parse(stored)
          workflows.value = data.workflows || []
          selectedWorkflowId.value = data.selectedWorkflowId || null
        }
      } catch (error) {
        console.error('Failed to load workflows from storage:', error)
      }
    }
  }

  const loadExecutionsFromStorage = async () => {
    if (process.client && typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('execution-data')
        if (stored) {
          executions.value = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Failed to load executions from storage:', error)
      }
    }
  }

  // Initialize
  const initialize = async () => {
    if (process.client) {
      await Promise.all([
        loadProjectsFromStorage(),
        loadWorkflowsFromStorage(),
        loadExecutionsFromStorage()
      ])
      isInitialLoad.value = false
    }
  }

  // Watch for changes and auto-save
  watch(projects, () => {
    if (!isInitialLoad.value) {
      saveProjectsToStorage()
    }
  }, { deep: true })

  watch(workflows, () => {
    if (!isInitialLoad.value) {
      saveWorkflowsToStorage()
    }
  }, { deep: true })

  watch(executions, () => {
    if (!isInitialLoad.value) {
      saveExecutionsToStorage()
    }
  }, { deep: true })

  return {
    // State
    projects: readonly(projects),
    workflows: readonly(workflows),
    executions: readonly(executions),
    selectedProjectId: readonly(selectedProjectId),
    selectedWorkflowId: readonly(selectedWorkflowId),
    isInitialLoad: readonly(isInitialLoad),

    // Computed
    selectedProject,
    selectedWorkflow,
    activeProjects,
    activeWorkflows,

    // Project operations
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,

    // Workflow operations
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,

    // Filtering
    filterProjects,
    filterWorkflows,

    // Storage
    initialize,
    saveProjectsToStorage,
    saveWorkflowsToStorage,
    saveExecutionsToStorage
  }
}

// Project templates composable
export const useProjectTemplates = () => {
  const templates = ref<ProjectTemplate[]>(DEFAULT_PROJECT_TEMPLATES)

  const createProjectFromTemplate = (templateId: string, customizations?: Partial<Project>) => {
    const template = templates.value.find(t => t.id === templateId)
    if (!template) throw new Error('Template not found')

    return createProject({
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      instructions: customizations?.instructions || template.instructions,
      model: customizations?.model || 'gpt-4',
      tags: customizations?.tags || [...template.tags],
      isActive: customizations?.isActive ?? true
    })
  }

  const getTemplatesByCategory = (category: Project['metadata']['category']) => {
    return templates.value.filter(t => t.category === category)
  }

  return {
    templates: readonly(templates),
    createProjectFromTemplate,
    getTemplatesByCategory
  }
}
