export const useDefaultModel = () => {
  const config = useRuntimeConfig()
  
  const defaultModel = computed(() => 
    config.public.DEFAULT_MODEL || 'deepseek-r1-671b'
  )
  
  const appName = computed(() => 
    config.public.APP_NAME || 'RawChat'
  )
  
  const defaultSystemPrompt = computed(() => 
    config.public.DEFAULT_SYSTEM_PROMPT || ''
  )
  
  const enableImageUpload = computed(() => 
    config.public.ENABLE_IMAGE_UPLOAD !== false
  )
  
  const maxImageSizeMB = computed(() => 
    config.public.MAX_IMAGE_SIZE_MB || 10
  )
  
  const enableVideoUpload = computed(() => 
    config.public.ENABLE_VIDEO_UPLOAD !== false
  )
  
  const maxVideoSizeMB = computed(() => 
    config.public.MAX_VIDEO_SIZE_MB || 50
  )
  
  const getDefaultModel = () => defaultModel.value
  
  const isDefaultModel = (modelId: string) => modelId === defaultModel.value
  
  return {
    defaultModel,
    appName,
    defaultSystemPrompt,
    enableImageUpload,
    maxImageSizeMB,
    enableVideoUpload,
    maxVideoSizeMB,
    getDefaultModel,
    isDefaultModel
  }
}
