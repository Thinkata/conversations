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
}

const MAX_CONTEXT_MESSAGES = 10

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
  const { prompt, model, images, audios, conversationId, systemPrompt, messages } = body || {}

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
  if (sanitizedPrompt.length > 10000) {
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
    const content: any[] = [{ type: 'text', text: sanitizedPrompt }]

    if (images && images.length > 0) {
      for (const imageData of images) {
        if (imageData && imageData.trim()) {
          content.push({ type: 'image_url', image_url: { url: imageData.trim() } })
        }
      }
    }

    if (audios && audios.length > 0) {
      for (const audioDataUrl of audios) {
        if (!audioDataUrl?.trim()) continue
        const { base64, format } = parseDataUrl(audioDataUrl.trim())
        content.push({ type: 'input_audio', input_audio: { data: base64, format } })
      }
    }

    // Prepare context window using frontend's message history
    const historyForContext: { role: 'system' | 'user' | 'assistant'; content: any }[] = []

    // Add per-chat system prompt if provided
    if (systemPrompt && systemPrompt.trim().length > 0) {
      historyForContext.push({
        role: 'system',
        content: [{ type: 'text', text: systemPrompt.trim() }]
      })
    }
    
    // Add frontend's message history (excluding the current prompt)
    if (messages && messages.length > 0) {
      // Use the last MAX_CONTEXT_MESSAGES from the frontend history
      const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES)
      
      for (const msg of recentMessages) {
        // Handle messages with images
        if (msg.images && msg.images.length > 0) {
          const content: any[] = [{ type: 'text', text: msg.content }]
          for (const imageData of msg.images) {
            if (imageData && imageData.trim()) {
              content.push({ type: 'image_url', image_url: { url: imageData.trim() } })
            }
          }
          historyForContext.push({ 
            role: msg.role, 
            content: content
          })
        } else {
          // Text-only messages
          historyForContext.push({ 
            role: msg.role, 
            content: [{ type: 'text', text: msg.content }]
          })
        }
      }
    }

    // Append current user message
    historyForContext.push({ role: 'user', content })

    // Call AI API
    const chatResponse = await client.chat.completions.create({
      model: model.trim(),
      messages: historyForContext,
      //max_tokens: 2048,
      //temperature: 0.7
    })

    // Basic token usage logging (SDK returns usage for many providers)
    const usage = (chatResponse as any)?.usage
    const promptTokens = usage?.prompt_tokens ?? usage?.input_tokens
    const completionTokens = usage?.completion_tokens ?? usage?.output_tokens

    // Extract response content
    const responseContent = chatResponse.choices?.[0]?.message?.content || ''
    
    if (!responseContent) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No response content received from AI model'
      })
    }

    // No need to persist conversation on backend - frontend handles storage

    return { success: true, content: responseContent, model: model, usage: chatResponse.usage, conversationId: existingId }

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

