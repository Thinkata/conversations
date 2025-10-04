import { OpenAI } from 'openai'
import crypto from 'node:crypto'

type RequestBody = {
  prompt: string
  model: string
  images?: string[] | null
  audios?: string[] | null
  conversationId?: string | null
  systemPrompt?: string | null
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
    images?: string[]
  }> | null
  isContinuation?: boolean
  previousContent?: string
  workflowId?: string
  workflowData?: any
}

const MAX_CONTEXT_MESSAGES = 10

// Function to check if content ends with CONTINUE signal
function hasContinueSignal(content: string): boolean {
  return content.trim().endsWith('<<CONTINUE>>')
}

// Function to remove CONTINUE signal from content
function removeContinueSignal(content: string): string {
  return content.replace(/<<CONTINUE>>\s*$/, '').trim()
}

// Compute a single fenced markdown wrapper that won't conflict with internal backticks
function wrapWithSingleMarkdownFence(content: string): string {
  // Find the longest run of backticks in the content
  let maxRun = 3
  const matches = content.match(/`+/g)
  if (matches) {
    for (const m of matches) {
      if (m.length > maxRun) maxRun = m.length
    }
  }
  const fence = '`'.repeat(maxRun + 1)
  // Do not strip internal fences; outer longer fence will encapsulate them safely
  return `${fence}markdown\n${content}\n${fence}`
}

function parseDataUrl(dataUrl: string) {
  const m = dataUrl.match(/^data:(.+?);base64,(.*)$/)
  if (!m) throw new Error('Invalid data URL')
  const mime = m[1]
  const base64 = m[2]
  let format = mime.split('/')[1] || 'wav'
  if (format === 'mpeg') format = 'mp3'
  return { base64, format }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event)
  const { prompt, model, images, audios, conversationId, systemPrompt, messages, isContinuation, previousContent, workflowId, workflowData } = body || {}

  // Enhanced input validation and sanitization
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing or invalid prompt' 
    })
  }

  // Sanitize prompt (remove potential XSS)
  const sanitizedPrompt = prompt.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  if (!model || typeof model !== 'string' || !model.trim()) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing or invalid model' 
    })
  }

  // Validate prompt length
  if (sanitizedPrompt.length > 1000000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt too long (max 10,000 characters)'
    })
  }

  // Validate model name format
  if (!/^[a-zA-Z0-9\-_\.\/]+$/.test(model.trim())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid model name format'
    })
  }

  // Handle workflow execution if workflowId is provided
  if (workflowId) {
    return await handleWorkflowExecution(workflowId, prompt, workflowData, event)
  }

  // Get configuration
  const runtimeConfig = useRuntimeConfig()
  const apiKey = runtimeConfig.API_KEY
  const baseURL = runtimeConfig.BASE_URL

  if (!apiKey) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'API key not configured. Please set API_KEY environment variable.' 
    })
  }

  // Initialize OpenAI client with AI endpoint
  const client = new OpenAI({ apiKey, baseURL })

  try {
    // Use frontend's message history instead of backend storage
    const existingId = conversationId && conversationId.trim().length > 0 ? conversationId.trim() : crypto.randomUUID()

    // Build user message content - support text + multimodal
    let promptText = sanitizedPrompt
    
    // If this is a continuation request, modify the prompt to ask for continuation
    if (isContinuation && previousContent) {
      promptText = `Continue from <<CONTINUE>>`
    }
    
    // For Azure AI, use simple string content format
    let content: any = promptText

    // Note: Azure AI has limited multimodal support, so we'll use text-only for now
    if (images && images.length > 0) {
      console.warn('Image support limited for Azure AI endpoints')
    }
    if (audios && audios.length > 0) {
      console.warn('Audio support limited for Azure AI endpoints')
    }

    // Prepare context window using frontend's message history
    const historyForContext: { role: 'system' | 'user' | 'assistant'; content: any }[] = []

    // Add truncation instruction system prompt
    const truncationInstruction = {
      role: 'system' as const,
      content: 'If your response must be truncated due to length, at the very end of the content you are able to send, output exactly `<<CONTINUE>>`. When I later send `Continue from <<CONTINUE>>`, resume from where you left off without repeating prior content.'
    }
    historyForContext.push(truncationInstruction)

    // Add per-chat system prompt if provided
    if (systemPrompt && systemPrompt.trim().length > 0) {
      historyForContext.push({
        role: 'system',
        content: systemPrompt.trim()
      })
    }
    
    // Add frontend's message history (excluding the current prompt)
    if (messages && messages.length > 0) {
      // Use the last MAX_CONTEXT_MESSAGES from the frontend history
      const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES)
      
      for (const msg of recentMessages) {
        // Azure AI uses simple string content format
        historyForContext.push({ 
          role: msg.role, 
          content: msg.content
        })
      }
    }

    // Append current user message
    historyForContext.push({ role: 'user', content })

    // Set up streaming response
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    setHeader(event, 'Cache-Control', 'no-cache')
    setHeader(event, 'Connection', 'keep-alive')

    // Implement loop-based truncation management
    let fullContent = ''
    let needsContinuation = false
    let continueLoop = true
    let currentMessages = [...historyForContext]
    let finishReason: string | null = null

    while (continueLoop) {
      // Call AI API with streaming
      const stream = await client.chat.completions.create({
        model: model.trim(),
        messages: currentMessages,
        stream: true,
        max_tokens: 2048
      })

      let chunkedContent = ''
      let currentFinishReason: string | null = null

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          chunkedContent += content
          fullContent += content
          
          // Send chunk to client
          event.node.res.write(`data: ${JSON.stringify({
            type: 'content',
            content: content
          })}\n\n`)
        }
        
        // Check finish reason
        if (chunk.choices[0]?.finish_reason) {
          currentFinishReason = chunk.choices[0].finish_reason
          finishReason = currentFinishReason
        }
      }

      // Check if we need to continue
      if (currentFinishReason === 'length' || hasContinueSignal(chunkedContent)) {
        // Remove CONTINUE signal if present
        if (hasContinueSignal(chunkedContent)) {
          chunkedContent = removeContinueSignal(chunkedContent)
          fullContent = fullContent.replace(/<<CONTINUE>>\s*$/, '').trim()
        }
        
        // Add the assistant's response to message history
        currentMessages.push({ 
          role: 'assistant', 
          content: chunkedContent 
        })
        
        // Add continuation request
        currentMessages.push({
          role: 'user',
          content: 'Continue from <<CONTINUE>>'
        })
        
        // Continue the loop
        needsContinuation = true
        console.log('Continuing due to truncation, finish_reason:', currentFinishReason)
      } else {
        // No truncation, finished normally
        continueLoop = false
        needsContinuation = false
        console.log('Finished normally, finish_reason:', currentFinishReason)
      }
    }

    // Prepare normalized final content wrapped in a single markdown fence
    const finalContent = wrapWithSingleMarkdownFence(fullContent)

    // Send final message with continuation status and normalized content
    event.node.res.write(`data: ${JSON.stringify({
      type: 'complete',
      needsContinuation: isContinuation ? false : needsContinuation,
      isContinuation: isContinuation || false,
      conversationId: existingId,
      model: model.trim(),
      finishReason: finishReason,
      finalContent: finalContent
    })}\n\n`)

    // End the stream
    event.node.res.end()

  } catch (error: any) {
    // Sanitize error logging to prevent sensitive information exposure
    const sanitizedError = {
      status: error.status,
      code: error.code,
      message: error.message,
      type: error.type
    }
    console.error('AI API Error:', sanitizedError)
    
    // Handle different types of errors
    if (error.status) {
      // OpenAI SDK errors
      throw createError({
        statusCode: error.status,
        statusMessage: error.message || 'AI API request failed'
      })
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      // Network errors
      throw createError({
        statusCode: 503,
        statusMessage: 'Unable to connect to AI service'
      })
    } else {
      // Other errors
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error'
      })
    }
  }
})

// Handle workflow execution
async function handleWorkflowExecution(workflowId: string, prompt: string, workflowData: any, event: any) {
  console.log('[API] Starting workflow execution:', { workflowId, prompt: prompt.substring(0, 100), workflowData })
  
  try {
    // Get runtime config
    const runtimeConfig = useRuntimeConfig()
    const apiKey = runtimeConfig.API_KEY
    const baseURL = runtimeConfig.BASE_URL

    if (!apiKey) {
      throw new Error('API key not configured')
    }

    // Initialize OpenAI client
    const client = new OpenAI({ apiKey, baseURL })

    if (!workflowData || !workflowData.workflow || !workflowData.projects) {
      console.error('[API] Workflow data validation failed:', { workflowData })
      throw new Error('Workflow data not provided')
    }

    const { workflow, projects } = workflowData
    console.log('[API] Workflow data validated:', { 
      workflowName: workflow.name, 
      stepCount: workflow.steps.length, 
      projectCount: projects.length 
    })

    // Execute workflow steps in sequence
    let currentInput = prompt
    let stepResults = []

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]
      const project = projects.find((p: any) => p.id === step.projectId)
      
      console.log(`[API] Executing step ${i + 1}/${workflow.steps.length}:`, {
        stepId: step.id,
        projectId: step.projectId,
        projectName: project?.name || 'Unknown',
        model: step.model || project?.model
      })
      
      if (!project) {
        throw new Error(`Project not found: ${step.projectId}`)
      }

      // Execute project with current input
      const result = await executeProjectStep(client, project, currentInput, step.model)
      console.log(`[API] Step ${i + 1} completed. Output length:`, result.length)
      
      stepResults.push({
        stepIndex: i,
        projectId: step.projectId,
        projectName: project.name,
        input: currentInput,
        output: result,
        model: step.model || project.model
      })

      // Use this step's output as input for next step
      currentInput = result
    }

    console.log('[API] Workflow execution completed. Final result length:', currentInput.length)

    // Return final result
    const finalResult = {
      content: currentInput,
      conversationId: crypto.randomUUID(),
      messageId: crypto.randomUUID(),
      timestamp: Date.now(),
      workflowExecution: {
        workflowId,
        workflowName: workflow.name,
        steps: stepResults
      }
    }

    console.log('[API] Returning workflow result:', {
      contentLength: finalResult.content.length,
      stepCount: finalResult.workflowExecution.steps.length
    })

    return new Response(JSON.stringify(finalResult), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error: any) {
    console.error('[API] Workflow execution error:', error)
    return new Response(JSON.stringify({
      content: `Workflow execution failed: ${error.message}`,
      conversationId: crypto.randomUUID(),
      messageId: crypto.randomUUID(),
      timestamp: Date.now()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Execute a single project step
async function executeProjectStep(client: OpenAI, project: any, input: string, modelOverride?: string) {
  const model = modelOverride || project.model
  
  console.log(`[API] Executing project step:`, {
    projectName: project.name,
    model,
    inputLength: input.length,
    instructionsLength: project.instructions?.length || 0
  })
  
  const response = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: project.instructions
      },
      {
        role: 'user',
        content: input
      }
    ],
    max_tokens: 4000,
    temperature: 0.7
  })

  const result = response.choices[0]?.message?.content || ''
  console.log(`[API] Project step completed:`, {
    projectName: project.name,
    outputLength: result.length,
    finishReason: response.choices[0]?.finish_reason
  })

  return result
}


