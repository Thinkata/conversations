import { OpenAI } from 'openai'

export default defineEventHandler(async (event) => {
  try {
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

    // Initialize OpenAI client with Lambda AI endpoint
    const client = new OpenAI({ apiKey, baseURL })

    // Query available models from Lambda AI
    const models = await client.models.list()

    // Return in OpenAI-compatible format
    return {
      object: 'list',
      data: models.data.map(model => ({
        id: model.id,
        object: 'model',
        created: model.created,
        owned_by: model.owned_by || 'lambda-ai',
        capabilities: {
          vision: model.id.includes('vision') || model.id.includes('multimodal'),
          function_calling: true, // Most modern models support this
          json_output: true, // Most modern models support this
          audio: model.id.includes('audio') || model.id.includes('speech')
        },
        permissions: [],
        context_length: getContextLength(model.id),
        deprecation: null
      }))
    }
  } catch (error: any) {
    console.error('Error fetching models:', error)
    
    // No fallback - just log the error and return empty
    console.error('Models API failed, no fallback available')
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Failed to fetch models from external API' 
    })
  }
})

// Helper function to determine context length based on model ID
function getContextLength(modelId: string): number {
  if (modelId.includes('671b') || modelId.includes('405b')) {
    return 128000 // Large models typically have longer context
  } else if (modelId.includes('70b') || modelId.includes('32b')) {
    return 64000 // Medium models
  } else if (modelId.includes('17b') || modelId.includes('11b')) {
    return 32000 // Smaller models
  } else if (modelId.includes('8b') || modelId.includes('7b')) {
    return 16384 // Fast models
  } else if (modelId.includes('3b')) {
    return 8192 // Ultra fast models
  }
  return 16384 // Default fallback
}


