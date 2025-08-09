<template>
  <div class="grid gap-8 lg:grid-cols-12">
    <!-- Main Form Card -->
    <div class="lg:col-span-7">
      <div class="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-white">Configure Request</h2>
              <p class="mt-1 text-blue-100">Set up your prompt parameters</p>
            </div>
            <button 
              @click="resetAll"
              class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <!-- Model Selection -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <label class="text-lg font-semibold text-gray-800">AI Model</label>
            </div>
            <p class="text-sm text-gray-600 ml-6">Choose your AI model</p>
            <select 
              v-model="selectedModel"
              class="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ml-6"
            >
              <option v-for="model in modelOptions" :key="model.id" :value="model.id">{{ model.name }}</option>
            </select>
          </div>

          <!-- Prompt -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
              <label class="text-lg font-semibold text-gray-800">Prompt</label>
            </div>
            <p class="text-sm text-gray-600 ml-6">Enter your question or instructions</p>
            <textarea 
              v-model="prompt" 
              :rows="8" 
              placeholder="Ask a question or paste a prompt..."
              class="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-200 ml-6"
            ></textarea>
          </div>

          <!-- Optional Image Input -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
              <label class="text-lg font-semibold text-gray-800">Image (Optional)</label>
            </div>
            <p class="text-sm text-gray-600 ml-6">Add an image for vision-capable models</p>
            <div class="ml-6 space-y-3">
              <input 
                v-model="imageUrl" 
                placeholder="Image URL (https://...)" 
                class="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
              <div class="flex items-center gap-3">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
                <button 
                  type="button"
                  @click="$refs.fileInput && ($refs.fileInput as HTMLInputElement).click()"
                  class="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-all duration-200"
                >
                  📁 Upload File
                </button>
                <span v-if="fileName" class="text-sm text-gray-600">{{ fileName }}</span>
                <button 
                  v-if="imageUrl" 
                  type="button"
                  @click="clearImage"
                  class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-all duration-200"
                >
                  ✕ Clear
                </button>
              </div>
            </div>
          </div>

          <!-- Send Button -->
          <div class="pt-8 border-t border-gray-200">
            <div class="flex flex-col space-y-4">
              <button 
                :disabled="!prompt.trim() || loading" 
                @click="send"
                class="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span class="flex items-center justify-center space-x-3">
                  <span v-if="loading" class="animate-spin">⏳</span>
                  <span v-else>🚀</span>
                  <span>{{ loading ? 'Generating Response...' : 'Generate Response' }}</span>
                </span>
              </button>
              <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-center">
                <strong>Error:</strong> {{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Output Card -->
    <div class="lg:col-span-5">
      <div v-if="responseText || loading" class="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden sticky top-32">
        <div class="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white">Response</h3>
              <p class="text-green-100 mt-1">Generated AI output</p>
            </div>
            <button
              @click="copy"
              :disabled="!responseText"
              class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              📋 Copy
            </button>
          </div>
        </div>
        
        <div class="p-8">
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-[500px] overflow-y-auto">
            <div v-if="loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600">⏳ Generating your response...</p>
              <p class="text-sm text-gray-500 mt-2">Please wait while the AI processes your request.</p>
            </div>
            <div v-else-if="responseText" class="prose prose-sm max-w-none" v-html="renderedMarkdown"></div>
          </div>
        </div>
      </div>
      
      <!-- Placeholder when no response -->
      <div v-else class="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden sticky top-32">
        <div class="p-8">
          <div class="text-center py-12">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span class="text-3xl">🤖</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Ready to Generate</h3>
            <p class="text-gray-600 text-lg">Enter your prompt and click "Send Request" to get started.</p>
            <div class="mt-8 flex justify-center">
              <div class="flex space-x-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const modelOptions = [
  // Premium Models
  { id: 'deepseek-r1-671b', name: 'DeepSeek R1 671B (Most Powerful)' },
  { id: 'llama3.1-405b-instruct-fp8', name: 'Llama 3.1 405B (Large Scale)' },
  { id: 'hermes3-405b', name: 'Hermes 3 405B (Advanced)' },
  
  // High Performance Models
  { id: 'llama-4-maverick-17b-128e-instruct-fp8', name: 'Llama 4 Maverick 17B (Latest)' },
  { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B (Efficient)' },
  { id: 'deepseek-v3-0324', name: 'DeepSeek V3 (Balanced)' },
  { id: 'llama3.3-70b-instruct-fp8', name: 'Llama 3.3 70B (Newest)' },
  { id: 'llama3.1-nemotron-70b-instruct-fp8', name: 'Llama 3.1 Nemotron 70B' },
  { id: 'llama3.1-70b-instruct-fp8', name: 'Llama 3.1 70B (Standard)' },
  { id: 'hermes3-70b', name: 'Hermes 3 70B' },
  { id: 'deepseek-llama3.3-70b', name: 'DeepSeek Llama 3.3 70B' },
  
  // Specialized Models
  { id: 'qwen25-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B (Coding)' },
  { id: 'qwen3-32b-fp8', name: 'Qwen 3 32B' },
  { id: 'lfm-40b', name: 'LFM 40B' },
  { id: 'deepseek-r1-0528', name: 'DeepSeek R1 (Reasoning)' },
  
  // Vision Models
  { id: 'llama3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision (Multimodal)' },
  
  // Fast & Efficient Models
  { id: 'llama3.1-8b-instruct', name: 'Llama 3.1 8B (Fast)' },
  { id: 'hermes3-8b', name: 'Hermes 3 8B (Quick)' },
  { id: 'lfm-7b', name: 'LFM 7B (Lightweight)' },
  { id: 'llama3.2-3b-instruct', name: 'Llama 3.2 3B (Ultra Fast)' }
]

const selectedModel = ref<string>(modelOptions[0].id)
const prompt = ref<string>('')
const imageUrl = ref<string>('')
const fileName = ref<string>('')
const loading = ref(false)
const error = ref<string>('')
const responseText = ref<string>('')
const renderedMarkdown = ref<string>('')

// Configure marked options for better rendering
marked.setOptions({
  breaks: true,
  gfm: true
})

// Watch for changes in responseText to parse markdown
watch(responseText, async (newText) => {
  if (newText) {
    try {
      renderedMarkdown.value = await marked(newText)
    } catch (e) {
      // If markdown parsing fails, escape HTML and wrap in paragraph
      renderedMarkdown.value = `<p>${newText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
    }
  } else {
    renderedMarkdown.value = ''
  }
})

function resetAll() {
  prompt.value = ''
  imageUrl.value = ''
  fileName.value = ''
  responseText.value = ''
  error.value = ''
  renderedMarkdown.value = ''
  selectedModel.value = modelOptions[0].id
}

function clearImage() {
  imageUrl.value = ''
  fileName.value = ''
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  fileName.value = file.name
  
  // Convert file to base64 data URI
  const dataUrl = await readAsDataURL(file)
  imageUrl.value = dataUrl
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function send() {
  if (!prompt.value.trim()) return
  
  loading.value = true
  error.value = ''
  responseText.value = ''
  renderedMarkdown.value = ''

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        prompt: prompt.value,
        model: selectedModel.value,
        imageUrl: imageUrl.value?.trim() || null
      }
    })

    // Handle successful response
    if (response.success && response.content) {
      responseText.value = response.content
    } else {
      throw new Error('No content received from AI model')
    }
    
  } catch (e: any) {
    // Handle different error types
    if (e.statusCode === 400) {
      error.value = e.statusMessage || 'Invalid request parameters'
    } else if (e.statusCode === 500) {
      error.value = e.statusMessage || 'Server error - please check API configuration'
    } else if (e.statusCode === 503) {
      error.value = 'AI service temporarily unavailable - please try again later'
    } else {
      error.value = e.message || e.statusMessage || 'Request failed - please try again'
    }
  } finally {
    loading.value = false
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(responseText.value || '')
  } catch {}
}
</script>