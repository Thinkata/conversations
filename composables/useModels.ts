export interface Model {
  id: string
  object: string
  created: number
  owned_by: string
  capabilities: {
    vision: boolean
    function_calling: boolean
    json_output: boolean
    audio: boolean
  }
  permissions: any[]
  context_length: number
  deprecation: any
}

export interface ModelsResponse {
  object: string
  data: Model[]
}

export const useModels = () => {
  const models = ref<Model[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch available models from the API
  const fetchModels = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<ModelsResponse>('/api/models')
      models.value = response.data
    } catch (err: any) {
      console.error('Failed to fetch models:', err)
      error.value = err.message || 'Failed to fetch models'
      
      // No fallback - just log the error
      console.error('Models fetch failed, no fallback available')
    } finally {
      loading.value = false
    }
  }

  // Get models by capability
  const getVisionModels = computed(() => 
    models.value.filter(model => model.capabilities.vision)
  )
  
  const getAudioModels = computed(() => 
    models.value.filter(model => model.capabilities.audio)
  )
  
  const getFastModels = computed(() => 
    models.value.filter(model => model.context_length <= 16384)
  )
  
  const getPowerfulModels = computed(() => 
    models.value.filter(model => model.context_length >= 64000)
  )

  // Get model by ID
  const getModelById = (id: string) => 
    models.value.find(model => model.id === id)

  // Check if model supports specific capability
  const modelSupports = (modelId: string, capability: keyof Model['capabilities']) => {
    const model = getModelById(modelId)
    return model?.capabilities[capability] || false
  }

  // Get model display name with capabilities
  const getModelDisplayName = (modelId: string) => {
    const model = getModelById(modelId)
    if (!model) return modelId

    const capabilities = []
    if (model.capabilities.vision) capabilities.push('Vision')
    if (model.capabilities.audio) capabilities.push('Audio')
    if (model.context_length >= 64000) capabilities.push('High Context')
    if (model.context_length <= 16384) capabilities.push('Fast')

    const capabilityText = capabilities.length > 0 ? ` (${capabilities.join(', ')})` : ''
    return `${modelId}${capabilityText}`
  }

  // Initialize models on mount
  onMounted(() => {
    fetchModels()
  })

  return {
    models: readonly(models),
    loading: readonly(loading),
    error: readonly(error),
    fetchModels,
    getVisionModels,
    getAudioModels,
    getFastModels,
    getPowerfulModels,
    getModelById,
    modelSupports,
    getModelDisplayName
  }
}
