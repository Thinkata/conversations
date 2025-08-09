import { OpenAI } from 'openai'

type RequestBody = {
  prompt: string
  model: string
  imageUrl?: string | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event)
  const { prompt, model, imageUrl } = body || {}

  // Validate required fields
  if (!prompt || !prompt.trim()) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing prompt' 
    })
  }

  if (!model || !model.trim()) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing model' 
    })
  }

  // Get configuration
  const runtimeConfig = useRuntimeConfig()
  const apiKey = runtimeConfig.LAMBDA_API_KEY
  const baseURL = runtimeConfig.LAMBDA_BASE_URL || 'https://api.lambda.ai/v1'

  if (!apiKey) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Lambda API key not configured. Please set LAMBDA_API_KEY environment variable.' 
    })
  }

  // Initialize OpenAI client with Lambda AI endpoint
  const client = new OpenAI({
    apiKey,
    baseURL
  })

  try {
    // Build message content - support both text-only and multimodal
    const content: any[] = [
      { type: 'text', text: prompt }
    ]

    // Add image if provided
    if (imageUrl && imageUrl.trim()) {
      content.push({
        type: 'image_url',
        image_url: { url: imageUrl.trim() }
      })
    }

    // Create message
    const message = {
      role: 'user' as const,
      content
    }

    // Call Lambda AI API
    const chatResponse = await client.chat.completions.create({
      model: model.trim(),
      messages: [message],
      max_tokens: 4000, // Reasonable limit
      temperature: 0.7  // Balanced creativity
    })

    // Extract response content
    const responseContent = chatResponse.choices?.[0]?.message?.content || ''
    
    if (!responseContent) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No response content received from AI model'
      })
    }

    return {
      success: true,
      content: responseContent,
      model: model,
      usage: chatResponse.usage
    }

  } catch (error: any) {
    console.error('Lambda AI API Error:', error)
    
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
        statusMessage: error.message || 'Internal server error'
      })
    }
  }
})
