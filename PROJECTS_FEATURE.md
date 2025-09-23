# Projects Feature Documentation

## Overview

The Projects feature adds a powerful system for managing AI project instructions and creating automated workflows, similar to ChatGPT's projects or Claude's projects functionality. This feature allows users to:

1. **Create and manage projects** with custom system prompts/instructions
2. **Chain projects together** to form automated workflows
3. **Execute workflows** where output from one project becomes input to the next
4. **Use project templates** for quick project creation
5. **Integrate projects with chats** for seamless AI interactions

## Features

### 1. Project Management

- **Create Projects**: Define custom AI instructions for specific tasks
- **Edit Projects**: Modify project details, instructions, and settings
- **Delete Projects**: Remove projects you no longer need
- **Duplicate Projects**: Create copies of existing projects
- **Project Categories**: Organize projects by type (coding, writing, analysis, etc.)
- **Tags**: Add custom tags for better organization and filtering
- **Status Management**: Activate/deactivate projects

### 2. Workflow System

- **Create Workflows**: Chain multiple projects together in sequence
- **Input Mapping**: Configure how output from one project becomes input to the next
- **Step Configuration**: Customize individual workflow steps
- **Execution Engine**: Run workflows with real-time progress tracking
- **Results Management**: View detailed execution results and outputs

### 3. Project Templates

- **Built-in Templates**: Pre-configured projects for common tasks
- **Template Categories**: Templates organized by use case
- **Quick Creation**: Start new projects from proven templates
- **Customizable**: Modify templates to fit your specific needs

### 4. Chat Integration

- **Project-based Chats**: Create chats that automatically use project instructions
- **Seamless Switching**: Switch between projects and chats easily
- **Visual Indicators**: See which chats are associated with projects
- **Context Preservation**: Maintain project context throughout conversations

## File Structure

```
types/
  project.ts                 # Type definitions for projects and workflows

composables/
  useProjects.ts            # Project management composable
  useProjectTemplates.ts    # Template management composable

components/
  ProjectList.vue           # Main projects listing component
  ProjectForm.vue           # Project creation/editing form
  WorkflowManager.vue       # Workflow management interface
  WorkflowForm.vue          # Workflow creation/editing form
  WorkflowExecution.vue     # Workflow execution results viewer
  ProjectTemplates.vue      # Template selection interface
  UTagsInput.vue           # Custom tags input component
```

## Usage

### Creating a Project

1. Click the "Projects" tab in the main interface
2. Click "New Project" button
3. Fill in project details:
   - **Name**: Descriptive project name
   - **Description**: What the project does
   - **Instructions**: System prompt for the AI
   - **Category**: Project type (coding, writing, etc.)
   - **Tags**: Custom tags for organization
   - **Model**: AI model to use
4. Click "Create Project"

### Using Project Templates

1. In the Projects view, click "Templates"
2. Browse available templates by category
3. Click "Use Template" to create a project from the template
4. Customize the project as needed

### Creating a Workflow

1. In the Projects view, click "Workflows"
2. Click "New Workflow"
3. Add workflow steps:
   - Select projects for each step
   - Configure input mapping between steps
   - Set step-specific configurations
4. Click "Create Workflow"

### Executing a Workflow

1. In the Workflows view, click the "Play" button on a workflow
2. Provide input for the first step
3. Monitor execution progress in real-time
4. View detailed results and outputs

### Using Projects in Chats

1. Select a project from the Projects view
2. The system automatically creates a new chat with the project's instructions
3. Start chatting with the AI using the project's context

## Data Models

### Project
```typescript
interface Project {
  id: string
  name: string
  description: string
  instructions: string  // System prompt
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
```

### Workflow
```typescript
interface Workflow {
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
```

### WorkflowStep
```typescript
interface WorkflowStep {
  id: string
  projectId: string
  order: number
  inputMapping?: {
    fromStepId: string
    outputKey: string
    inputKey: string
  }
  config?: {
    [key: string]: any
  }
}
```

## Storage

Projects and workflows are stored in browser localStorage with the following keys:
- `project-data`: Projects and selected project ID
- `workflow-data`: Workflows and selected workflow ID
- `execution-data`: Recent workflow executions

## Built-in Templates

The system includes several built-in project templates:

1. **Code Reviewer**: Analyze code for bugs and best practices
2. **Technical Writer**: Create clear technical documentation
3. **Data Analyst**: Analyze data and provide insights
4. **Creative Writer**: Generate creative content and stories
5. **Research Assistant**: Conduct research and synthesize information

## Integration with Existing Chat System

The projects feature integrates seamlessly with the existing chat system:

- Projects can be selected to create new chats with specific instructions
- Chats created from projects are visually marked
- Project instructions become the system prompt for the chat
- The chat interface shows project context and status

## Future Enhancements

Potential future improvements could include:

- **Project Sharing**: Export/import projects between users
- **Version Control**: Track changes to project instructions
- **Collaboration**: Multiple users working on the same project
- **Advanced Workflows**: Conditional logic, loops, and branching
- **API Integration**: Connect workflows to external services
- **Analytics**: Track project usage and effectiveness
- **Templates Marketplace**: Community-shared project templates

## Technical Notes

- All project data is stored locally in the browser
- The system uses Vue 3 Composition API with TypeScript
- Components are built with Nuxt UI for consistent styling
- The workflow execution engine is designed to be extensible
- Error handling and validation are implemented throughout
- The system is fully responsive and works on mobile devices

