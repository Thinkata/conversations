import { OpenAI } from 'openai'

export default defineEventHandler(async (event) => {
  try {
    // Get configuration
    const runtimeConfig = useRuntimeConfig()
    const apiKey = runtimeConfig.API_KEY
    const baseURL = runtimeConfig.BASE_URL
    
    console.log('API Key exists:', !!apiKey)
    console.log('Base URL:', baseURL)

    // Validate configuration
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'API key not configured. Please set API_KEY environment variable.' 
      })
    }

    if (!baseURL || typeof baseURL !== 'string' || !baseURL.trim()) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Base URL not configured. Please set BASE_URL environment variable.' 
      })
    }

    // Make direct HTTP request to Together.ai to avoid client library transformations
    console.log('Making direct HTTP request to Together.ai...')
    const httpResponse = await fetch(`${baseURL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!httpResponse.ok) {
      throw new Error(`Together.ai API error: ${httpResponse.status} ${httpResponse.statusText}`)
    }
    
    const models = await httpResponse.json()
    console.log('Direct API call completed successfully')

    console.log('Raw models response type:', typeof models)
    console.log('Raw models response is array:', Array.isArray(models))

    // Handle different response formats from different providers
    let modelsList: any[] = []
    
    // Check for direct array format first (Together.ai format)
    if (Array.isArray(models)) {
      console.log('Using Together.ai direct array format, count:', models.length)
      modelsList = models
    } 
    // Check for OpenAI-compatible format (wrapped in data property)
    else if (models && typeof models === 'object' && Array.isArray((models as any).data)) {
      console.log('Using OpenAI format, count:', (models as any).data.length)
      modelsList = (models as any).data
    }
    // Check for Together.ai format with models at root level
    else if (models && typeof models === 'object') {
      // Look for array properties that might contain models
      const rootKeys = Object.keys(models)
      for (const key of rootKeys) {
        if (Array.isArray((models as any)[key]) && (models as any)[key].length > 0) {
          console.log(`Found models in key '${key}', count:`, (models as any)[key].length)
          modelsList = (models as any)[key]
          break
        }
      }
      
      // If no array found, check if the response itself contains model-like objects
      if (modelsList.length === 0) {
        const modelLikeObjects = rootKeys.filter(key => {
          const obj = (models as any)[key]
          return obj && typeof obj === 'object' && obj.id && obj.object === 'model'
        })
        
        if (modelLikeObjects.length > 0) {
          console.log(`Found ${modelLikeObjects.length} model-like objects at root level`)
          modelsList = modelLikeObjects.map(key => (models as any)[key])
        }
      }
    } 
    // Check for other providers that use 'models' key
    else if (models && typeof models === 'object' && Array.isArray((models as any).models)) {
      console.log('Using models key format, count:', (models as any).models.length)
      modelsList = (models as any).models
    } 
    else {
      console.error('Unexpected models response format:', models)
      console.error('Models type:', typeof models)
      console.error('Is array:', Array.isArray(models))
      if (models && typeof models === 'object') {
        console.error('Models keys:', Object.keys(models))
      }
      throw new Error('Unexpected models response format')
    }


    // Return in OpenAI-compatible format
    const apiResponse = {
      object: 'list',
      data: modelsList.map((model: any) => ({
        id: model.id,
        object: 'model',
        created: model.created,
        owned_by: model.owned_by || model.organization || 'together-ai',
        capabilities: {
          vision: model.id.includes('vision') || model.id.includes('multimodal') || model.id.includes('vl'),
          function_calling: true, // Most modern models support this
          json_output: true, // Most modern models support this
          audio: model.id.includes('audio') || model.id.includes('speech') || model.id.includes('whisper')
        },
        permissions: [],
        context_length: model.context_length || getContextLength(model.id),
        deprecation: null
      }))
    }
    
    console.log('Final response with', apiResponse.data.length, 'models')
    return apiResponse
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


