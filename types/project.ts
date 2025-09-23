// Project and workflow types for the chat application

export interface Project {
  id: string
  name: string
  description: string
  instructions: string // System prompt/instructions for this project
  model: string
  createdAt: number
  updatedAt: number
  tags: string[]
  isActive: boolean
  metadata: {
    messageCount: number
    lastUsed: number
    category: 'general' | 'coding' | 'writing' | 'analysis' | 'creative' | 'workflow'
  }
}

export interface WorkflowStep {
  id: string
  projectId: string
  order: number
  model?: string // Override model for this step
  inputMapping?: {
    // Maps output from previous step to input for this step
    fromStepId: string
    outputKey: string
    inputKey: string
  }
  config?: {
    // Step-specific configuration
    [key: string]: any
  }
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  createdAt: number
  updatedAt: number
  isActive: boolean
  metadata: {
    executionCount: number
    lastExecuted: number
    averageExecutionTime: number
  }
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  currentStepIndex: number
  results: WorkflowStepResult[]
  startedAt: number
  completedAt?: number
  error?: string
  input: any
  output?: any
}

export interface WorkflowStepResult {
  stepId: string
  projectId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: any
  output?: any
  error?: string
  startedAt: number
  completedAt?: number
  executionTime?: number
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  instructions: string
  category: Project['metadata']['category']
  tags: string[]
  isBuiltIn: boolean
}

// Default project templates
export const DEFAULT_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Review and analyze code for bugs, performance issues, and best practices',
    instructions: 'You are an expert code reviewer. Analyze the provided code for:\n- Bugs and potential issues\n- Performance optimizations\n- Code quality and best practices\n- Security vulnerabilities\n- Maintainability concerns\n\nProvide specific, actionable feedback with code examples when possible.',
    category: 'coding',
    tags: ['code', 'review', 'analysis', 'quality'],
    isBuiltIn: true
  },
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    description: 'Create clear, comprehensive technical documentation',
    instructions: 'You are a professional technical writer. Create clear, well-structured documentation that is:\n- Easy to understand for both technical and non-technical audiences\n- Comprehensive and accurate\n- Well-organized with proper headings and structure\n- Includes examples and use cases when appropriate\n- Follows technical writing best practices',
    category: 'writing',
    tags: ['documentation', 'writing', 'technical', 'clarity'],
    isBuiltIn: true
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyze data and provide insights and recommendations',
    instructions: 'You are a skilled data analyst. When provided with data or analysis requests:\n- Examine the data thoroughly\n- Identify patterns, trends, and anomalies\n- Provide clear insights and interpretations\n- Suggest actionable recommendations\n- Use appropriate statistical methods when relevant\n- Present findings in a clear, visual manner when possible',
    category: 'analysis',
    tags: ['data', 'analysis', 'insights', 'statistics'],
    isBuiltIn: true
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Generate creative content including stories, poems, and creative writing',
    instructions: 'You are a creative writing assistant. Help with:\n- Story development and narrative structure\n- Character development and dialogue\n- Creative writing techniques and styles\n- Poetry and prose\n- Brainstorming and ideation\n- Editing and revision suggestions\n\nBe imaginative, engaging, and supportive of the creative process.',
    category: 'creative',
    tags: ['creative', 'writing', 'stories', 'poetry', 'imagination'],
    isBuiltIn: true
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Conduct research and synthesize information from multiple sources',
    instructions: 'You are a thorough research assistant. When given research tasks:\n- Gather information from multiple reliable sources\n- Synthesize findings into coherent insights\n- Identify knowledge gaps and suggest further research\n- Present information in a well-organized, objective manner\n- Cite sources appropriately\n- Distinguish between facts, opinions, and speculation',
    category: 'analysis',
    tags: ['research', 'analysis', 'synthesis', 'information'],
    isBuiltIn: true
  }
]

// Workflow execution status
export type WorkflowStatus = WorkflowExecution['status']
export type StepStatus = WorkflowStepResult['status']

// Project categories for filtering and organization
export type ProjectCategory = Project['metadata']['category']

// Utility types
export interface ProjectFilter {
  category?: ProjectCategory
  tags?: string[]
  isActive?: boolean
  search?: string
}

export interface WorkflowFilter {
  isActive?: boolean
  search?: string
}

// API response types
export interface ProjectListResponse {
  projects: Project[]
  total: number
  page: number
  limit: number
}

export interface WorkflowListResponse {
  workflows: Workflow[]
  total: number
  page: number
  limit: number
}

export interface WorkflowExecutionResponse {
  execution: WorkflowExecution
  results: WorkflowStepResult[]
}

