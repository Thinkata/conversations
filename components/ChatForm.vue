<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Chat List Sidebar -->
    <div class="flex h-[calc(100vh-5rem)]">
      <div 
        :class="[
          'transition-all duration-300 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900',
          sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
        ]"
      >
        <div class="p-6 space-y-4 h-full overflow-y-auto" data-testid="chat-list">
          <UCard
            v-for="chat in filteredChats" 
            :key="chat.id"
            @click="selectChat(chat.id)"
            :class="[
              'card cursor-pointer transition-all duration-200 group',
              selectedChatId === chat.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
            ]"
            :ui="{
              background: selectedChatId === chat.id 
                ? 'bg-primary-50 dark:bg-primary-950/50' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
              border: selectedChatId === chat.id 
                ? 'border-primary-200 dark:border-primary-800' 
                : 'border-gray-200 dark:border-gray-700'
            }"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <UInput
                    v-if="editingChatId === chat.id"
                    v-model="editingChatName"
                    @blur="saveChatName(chat.id)"
                    @keyup.enter="saveChatName(chat.id)"
                    @keyup.esc="cancelEditChatName"
                    size="sm"
                    ref="editChatNameInput"
                    class="flex-1"
                  />
                  <span 
                    v-else
                    @dblclick="startEditChatName(chat.id, chat.name)"
                    class="text-base font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors cursor-text"
                  >
                    {{ chat.name }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-2 truncate font-medium">
                  {{ formatDate(chat.updatedAt) }} • {{ chat.messageCount }} messages
                </p>
                <div class="flex items-center space-x-2 mt-3">
                  <UBadge 
                    :label="getModelDisplayName(chat.model)"
                    color="blue"
                    variant="soft"
                    size="xs"
                  />
                  <UBadge 
                    v-if="chat.systemPrompt" 
                    label="📝"
                    color="purple"
                    variant="soft"
                    size="xs"
                  />
                </div>
              </div>
              <UButton 
                @click.stop="deleteChat(chat.id)"
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                size="sm"
                class="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
                data-testid="delete-chat-button"
              />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 relative">
        <!-- Sidebar Toggle Button -->
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Shrink sidebar'"
        >
          <UIcon 
            :name="sidebarCollapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'" 
            class="h-5 w-5 text-gray-600 dark:text-gray-400"
          />
        </button>
        
        <!-- Chat Messages Container -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 min-w-0 chat-messages-container" :style="chatContainerStyle" data-testid="message-list">
                  <!-- Empty State -->
        <div v-if="!selectedChat?.messages?.length" class="empty-state">
          <div class="empty-state-icon">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="text-3xl text-blue-600" />
          </div>
          <h3 class="empty-state-title">Start a new conversation</h3>
          <p class="empty-state-description">Type your message below to begin chatting with the AI.</p>
          
          <!-- Debug info in development -->
          <div v-if="isDevelopment" class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Chats loaded: {{ chats?.length || 0 }}</p>
            <p>Selected chat ID: {{ selectedChatId || 'none' }}</p>
            <p>Selected chat: {{ selectedChat?.name || 'none' }}</p>
          </div>
        </div>

          <div v-else class="space-y-6 max-w-none min-w-0">
            <div 
              v-for="message in selectedChat?.messages" 
              :key="message.id"
              :class="[
                'flex w-full min-w-0',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div 
                :class="[
                  'relative p-4 rounded-2xl shadow-sm max-w-[85%] min-w-0 transition-all duration-200 break-words',
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white ml-12' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-12'
                ]"
              >
                <div class="w-full overflow-hidden chat-message-container min-w-0">
                  <MarkdownRenderer :content="message.content" />
                </div>
                <div 
                  :class="[
                    'text-xs mt-3 pt-2 border-t flex items-center justify-between',
                    message.role === 'user' 
                      ? 'text-blue-200 border-blue-500' 
                      : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                  ]"
                >
                  <span>{{ formatTime(message.timestamp) }}</span>
                  <div class="flex items-center space-x-2">
                    <button 
                      type="button"
                      title="Delete message"
                      @click="deleteMessage(message.id)"
                      class="delete-message-button"
                    >
                      🗑️
                    </button>
                    <div v-if="message.role === 'assistant'" class="flex items-center space-x-2">
                      <button 
                        v-if="copiedMessageId !== message.id"
                        type="button"
                        title="Copy response"
                        @click="copyAssistantMessage(message.id)"
                        class="copy-message-button"
                      >
                        📋
                      </button>
                      <span v-else class="copy-message-button copied">✅</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="loading" class="loading-container" data-testid="loading-indicator">
            <div class="loading-content">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6" />
              <span>AI is thinking...</span>
            </div>
          </div>
        </div>

        <!-- Fixed Input Area - ChatGPT Style -->
        <div class="fixed-input-area">
          <div class="input-area-content">
            <!-- Image Previews -->
            <div v-if="attachedImages.length > 0" class="image-preview-container mb-3" data-testid="image-preview-container">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300" data-testid="image-count">
                  📷 Attached Images ({{ attachedImages.length }})
                </span>
                <UButton
                  @click="attachedImages = []"
                  color="gray"
                  variant="ghost"
                  size="xs"
                  class="text-xs"
                  data-testid="clear-all-images"
                >
                  Clear All
                </UButton>
              </div>
              <div class="grid grid-cols-4 gap-3">
                <div
                  v-for="image in attachedImages"
                  :key="image.id"
                  class="image-preview-item group relative"
                  :data-testid="`image-preview-item-${image.id}`"
                >
                  <img 
                    :src="image.preview" 
                    :alt="image.name" 
                    class="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-200 group-hover:scale-105"
                    data-testid="image-preview"
                  />
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <button
                      @click="removeImage(image.id)"
                      class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                  <div class="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate" :title="image.name">
                    {{ image.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Display -->
            <UAlert
              v-if="error"
              color="red"
              variant="soft"
              :description="error"
              class="rounded-xl mb-3"
              data-testid="error-message"
            />

            <!-- Main Input Container -->
            <div 
              class="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200"
              :class="{ 'border-blue-400 ring-2 ring-blue-400/20': isDragOver }"
            >
              <!-- Toolbar -->
              <div class="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
                <UButton
                  @click="openSystemPromptModal"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-cog-6-tooth"
                  size="sm"
                  title="System Prompt"
                  class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                />
                <UButton
                  @click="openModelModal"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-cpu-chip"
                  size="sm"
                  title="AI Model"
                  class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                />
                <UButton
                  @click="openSearchModal"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-magnifying-glass"
                  size="sm"
                  title="Search"
                  class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                />
                <UButton
                  @click="() => fileInput?.click()"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-photo"
                  size="sm"
                  title="Attach"
                  class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                />
                <div class="flex-1"></div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getModelDisplayName(selectedChat?.model || selectedModel) }}
                </span>
              </div>

              <!-- Message Input -->
              <div class="w-full relative">
                <UTextarea
                  v-model="prompt"
                  placeholder="Message AI... (Ctrl+V/Cmd+V to paste images)"
                  :rows="1"
                  variant="none"
                  size="xl"
                  class="w-full resize-none border-0 focus:ring-0 focus:outline-none bg-transparent min-h-[48px] max-h-[200px] py-3 px-4 text-base leading-6"
                  :disabled="!selectedChat"
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact="prompt += '\n'"
                  @paste="onPaste"
                  @drop="onDrop"
                  @dragover="onDragOver"
                  @dragleave="onDragLeave"
                  data-testid="message-input"
                />
                
                <!-- Debug info for input state -->
                <div v-if="isDevelopment && !selectedChat" class="text-xs text-red-500 mt-1 px-4">
                  Input disabled: No chat selected
                </div>
                
                <!-- Drag and Drop Overlay -->
                <div 
                  v-if="isDragOver"
                  class="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center pointer-events-none"
                >
                  <div class="text-center text-blue-600 dark:text-blue-400">
                    <UIcon name="i-heroicons-photo" class="h-8 w-8 mx-auto mb-2" />
                    <p class="font-medium">Drop images here</p>
                  </div>
                </div>
                
                <div class="absolute bottom-2 right-2">
                  <UButton
                    @click="sendMessage"
                    :disabled="!selectedChat || !prompt.trim() || loading"
                    color="primary"
                    variant="solid"
                    size="sm"
                    class="rounded-xl px-3 py-2 transition-all duration-200"
                    :class="prompt.trim() && selectedChat && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'"
                    data-testid="send-button"
                    :title="!selectedChat ? 'No chat selected' : !prompt.trim() ? 'Enter a message' : loading ? 'AI is thinking...' : 'Send message'"
                  >
                    <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin h-4 w-4" />
                    <UIcon v-else name="i-heroicons-arrow-up" class="h-4 w-4" />
                  </UButton>
                </div>
              </div>
            </div>

            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFile" data-testid="file-input" />
            
            <!-- Image Processing Loading Indicator -->
            <div v-if="imageProcessingLoading" class="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin h-3 w-3 inline mr-1" />
              Processing image...
            </div>
            
            <!-- Image Upload Instructions -->
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              💡 <strong>Paste screenshots:</strong> Ctrl+V/Cmd+V • <strong>Drag & drop:</strong> Anywhere in the input area • <strong>Upload:</strong> Click the 📷 button
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Prompt Modal -->
    <UModal 
      v-model:open="showSystemPromptModal"
      title="System Prompt (Instructions)"
      description="Set custom instructions for this chat. These will guide the AI's behavior and responses."
    >
      <template #body>
        <div class="space-y-4">
          <UTextarea
            v-model="systemPrompt"
            :rows="6"
            placeholder="Enter system instructions here... (e.g., 'You are a helpful coding assistant. Always provide code examples and explain your reasoning.')"
            variant="outline"
            size="lg"
          />
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton 
            @click="showSystemPromptModal = false"
            color="gray"
            variant="ghost"
          >
            Cancel
          </UButton>
          <UButton 
            @click="saveSystemPrompt"
            color="primary"
            variant="solid"
          >
            Save
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Model Selection Modal -->
    <UModal 
      v-model:open="showModelModal"
      title="Select AI Model"
      description="Choose the AI model for this chat. Different models have different capabilities and performance characteristics."
    >
      <template #body>
        <div class="space-y-4">
          <!-- Model Selection Dropdown -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose AI Model:
            </label>
            
            <!-- Loading State -->
            <div v-if="modelsLoading" class="flex items-center space-x-2 text-sm text-gray-500">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin h-4 w-4" />
              <span>Loading available models...</span>
            </div>
            
            <!-- Error State -->
            <div v-else-if="modelsError" class="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              <div class="flex items-center justify-between">
                <span>{{ modelsError }}</span>
                <UButton
                  @click="fetchModels"
                  color="red"
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-arrow-path"
                  title="Retry loading models"
                >
                  Retry
                </UButton>
              </div>
            </div>
            
            <!-- Model Selection -->
            <select 
              v-else
              v-model="selectedModel"
              :disabled="modelsLoading || safeModelOptions.length === 0"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {{ modelsLoading ? 'Loading models...' : safeModelOptions.length === 0 ? 'No models available' : 'Select AI Model' }}
              </option>
              <option 
                v-for="model in safeModelOptions" 
                :key="model.id" 
                :value="model.id"
              >
                {{ getModelDisplayName(model.id) }}
              </option>
            </select>
          </div>
          
          <!-- Current Selection Display -->
          <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 class="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">Current Selection:</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ getModelDisplayName(selectedModel) || 'None selected' }}
            </p>
            
            <!-- Model Capabilities -->
            <div v-if="selectedModel" class="mt-3 space-y-2">
              <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Capabilities:</h5>
              <div class="flex flex-wrap gap-2">
                <UBadge 
                  v-if="modelSupports(selectedModel, 'vision')"
                  label="Vision"
                  color="blue"
                  variant="soft"
                  size="xs"
                />
                <UBadge 
                  v-if="modelSupports(selectedModel, 'audio')"
                  label="Audio"
                  color="green"
                  variant="soft"
                  size="xs"
                />
                <UBadge 
                  v-if="modelSupports(selectedModel, 'function_calling')"
                  label="Function Calling"
                  color="purple"
                  variant="soft"
                  size="xs"
                />
                <UBadge 
                  v-if="modelSupports(selectedModel, 'json_output')"
                  label="JSON Output"
                  color="orange"
                  variant="soft"
                  size="xs"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton 
            @click="showModelModal = false"
            color="gray"
            variant="ghost"
          >
            Cancel
          </UButton>
          <UButton 
            @click="saveModel"
            color="primary"
            variant="solid"
          >
            Save
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Search Modal -->
    <UModal 
      v-model:open="showSearchModal"
      title="Search Chats"
      description="Search through your chat history by title or content."
    >
      <template #body>
        <div class="space-y-4">
          <UInput
            v-model="searchQuery"
            placeholder="Search chats..."
            variant="outline"
            size="lg"
            icon="i-heroicons-magnifying-glass"
          />
          <div class="max-h-64 overflow-y-auto space-y-2">
            <UCard 
              v-for="chat in filteredChats" 
              :key="chat.id"
              @click="selectChat(chat.id); showSearchModal = false"
              class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              variant="outline"
            >
              <div class="font-medium">{{ chat.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(chat.updatedAt) }} • {{ chat.messageCount }} messages</div>
              <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ chat.messages.slice(-1)[0]?.content?.substring(0, 100) || 'No messages' }}...
              </div>
            </UCard>
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end">
          <UButton 
            @click="showSearchModal = false"
            color="primary"
            variant="solid"
          >
            Close
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import DOMPurify from 'dompurify'

// Types
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  images?: string[]
}

interface Chat {
  id: string
  name: string
  messages: ChatMessage[]
  model: string
  systemPrompt?: string
  updatedAt: number
  messageCount: number
}

// Get runtime config for default model
const { defaultModel, defaultSystemPrompt } = useDefaultModel()

// Get dynamic models from API
const { models: modelOptions, loading: modelsLoading, error: modelsError, fetchModels } = useModels()

// Get chat data from parent component
const chats = inject('chats') as Ref<Chat[]>
const selectedChatId = inject('selectedChatId') as Ref<string | null>
const setSelectedChatId = inject('setSelectedChatId') as (id: string) => void
const createNewChat = inject('createNewChat') as () => void
const deleteChatFromParent = inject('deleteChat') as (chatId: string) => void

// Ensure chats is reactive
if (!chats) {
  throw new Error('Chats not provided by parent component')
}

// Ensure deleteChat function is provided
if (!deleteChatFromParent) {
  throw new Error('Delete chat function not provided by parent component')
}

// State
const selectedModel = ref<string>(defaultModel.value)
const systemPrompt = ref<string>(defaultSystemPrompt.value)

// Watch for models to be loaded and set default model if needed
watch(modelOptions, (newModels) => {
  if (newModels && newModels.length > 0 && !selectedModel.value) {
    // Set default model once models are loaded
    selectedModel.value = defaultModel.value
  }
}, { immediate: true })

// Computed property for safe access to models
const safeModelOptions = computed(() => {
  return modelOptions.value && Array.isArray(modelOptions.value) ? modelOptions.value : []
})
const searchQuery = ref<string>('')
const prompt = ref<string>('')
const loading = ref(false)
const error = ref<string>('')
const isDragOver = ref(false)
const imageProcessingLoading = ref(false)
const copiedMessageId = ref<string | null>(null)

// Refs
const fileInput = ref<HTMLInputElement | null>(null)

// Modal states
const showSystemPromptModal = ref(false)
const showModelModal = ref(false)
const showSearchModal = ref(false)

// Sidebar state
const sidebarCollapsed = ref(false)

// Chat management
const editingChatId = ref<string | null>(null)
const editingChatName = ref<string>('')

// Images
const attachedImages = ref<Array<{
  id: string
  name: string
  type: string
  size: number
  preview: string
  dataUrl: string
}>>([])

// Computed
const selectedChat = computed(() => 
  chats.value?.find(chat => chat.id === selectedChatId.value)
)

const filteredChats = computed(() => {
  if (!chats.value) return []
  if (!searchQuery.value) return chats.value
  return chats.value.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// Development mode flag - set to true for debugging, false for production
const isDevelopment = ref(true)

// Watch for changes in attached images to update layout
watch([attachedImages, error], () => {
  // Force a re-render to update the dynamic padding
  nextTick(() => {
    // This will trigger the computed property to recalculate
  })
}, { deep: true })

// Computed properties
const hasAttachedImages = computed(() => attachedImages.value.length > 0)
const inputAreaHeight = computed(() => {
  // Base height for input area
  let height = 120 // Base height in pixels (increased from 80)
  
  // Add height for image previews if present
  if (hasAttachedImages.value) {
    height += 140 // Additional height for image previews (increased from 100)
  }
  
  // Add height for error message if present
  if (error.value) {
    height += 60 // Height for error message
  }
  
  return height
})

const chatContainerStyle = computed(() => ({
  paddingBottom: `${inputAreaHeight.value + 80}px` // Add extra padding to prevent content cutoff
}))

// Initialize
onMounted(() => {
  console.log('[ChatForm] onMounted - chats:', chats.value?.length, 'selectedChatId:', selectedChatId.value, 'loading:', loading.value)
  
  // Add global paste event listener for images
  document.addEventListener('paste', onGlobalPaste)
  
  // Add global keyboard shortcut for Ctrl+V/Cmd+V
  document.addEventListener('keydown', onGlobalKeydown)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('paste', onGlobalPaste)
  document.removeEventListener('keydown', onGlobalKeydown)
})

// Watch for changes in chats to handle initialization
watch(chats, (newChats, oldChats) => {
  console.log('[ChatForm] Chats changed:', {
    newCount: newChats?.length,
    oldCount: oldChats?.length,
    selectedChatId: selectedChatId.value,
    hasOldChats: oldChats !== undefined
  })
  
  // Only run this logic if we actually need to set a selection
  // Don't override if the parent has already set a selection
  if (newChats && newChats.length > 0 && !selectedChatId.value && oldChats !== undefined) {
    console.log('[ChatForm] No chat selected, selecting first chat')
    // If chats are loaded but no chat is selected, select the first one
    const firstChat = newChats[0]
    setSelectedChatId(firstChat.id)
    selectedModel.value = firstChat.model
    systemPrompt.value = firstChat.systemPrompt || ''
  }
}, { immediate: true })

// Watch for changes in selected chat to update local state
watch(selectedChatId, (newChatId, oldChatId) => {
  if (newChatId) {
    const chat = chats.value?.find(c => c.id === newChatId)
    if (chat) {
      selectedModel.value = chat.model
      systemPrompt.value = chat.systemPrompt || ''
    }
  }
})

// Chat management functions
// Note: createNewChat is now injected from parent component

function selectChat(chatId: string) {
  setSelectedChatId(chatId)
  const chat = chats.value?.find(c => c.id === chatId)
  if (chat) {
    selectedModel.value = chat.model
    systemPrompt.value = chat.systemPrompt || ''
  }
}

function startEditChatName(chatId: string, currentName: string) {
  editingChatId.value = chatId
  editingChatName.value = currentName
  nextTick(() => {
    const input = document.querySelector('[ref="editChatNameInput"]') as HTMLInputElement
    if (input) input.focus()
  })
}

function saveChatName(chatId: string) {
  const chat = chats.value?.find(c => c.id === chatId)
      if (chat && editingChatName.value.trim()) {
      chat.name = editingChatName.value.trim()
    }
  editingChatId.value = null
}

function cancelEditChatName() {
  editingChatId.value = null
}

function deleteChat(chatId: string) {
  if (confirm('Are you sure you want to delete this chat?')) {
    // Use the injected function from parent component
    deleteChatFromParent(chatId)
  }
}

// Configuration functions
function saveSystemPrompt() {
  if (selectedChat.value) {
    selectedChat.value.systemPrompt = systemPrompt.value
    selectedChat.value.updatedAt = Date.now()
  }
  showSystemPromptModal.value = false
}

function saveModel() {
  if (selectedChat.value) {
    selectedChat.value.model = selectedModel.value
    selectedChat.value.updatedAt = Date.now()
  }
  showModelModal.value = false
}

// Modal functions
function openSystemPromptModal() {
  showSystemPromptModal.value = true
}

function openModelModal() {
  showModelModal.value = true
}

function openSearchModal() {
  showSearchModal.value = true
}

// Utility functions
function sanitizeContent(content: string): string {
  if (process.client) {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    })
  }
  return content
}

function getModelDisplayName(modelId: string): string {
  // Use the safe computed property
  const models = safeModelOptions.value
  if (!models || models.length === 0) {
    return modelId
  }
  
  const model = models.find(m => m.id === modelId)
  if (!model) return modelId

  // Build display name with capabilities
  let displayName = modelId
  
  // Add capability indicators
  const capabilities = []
  if (model.capabilities.vision) capabilities.push('Vision')
  if (model.capabilities.audio) capabilities.push('Audio')
  if (model.context_length >= 64000) capabilities.push('High Context')
  if (model.context_length <= 16384) capabilities.push('Fast')
  
  if (capabilities.length > 0) {
    displayName += ` (${capabilities.join(', ')})`
  }
  
  return displayName
}

function modelSupports(modelId: string, capability: 'vision' | 'audio' | 'function_calling' | 'json_output'): boolean {
  // Use the safe computed property
  const models = safeModelOptions.value
  if (!models || models.length === 0) {
    return false
  }
  
  const model = models.find(m => m.id === modelId)
  if (!model) return false
  return model.capabilities[capability] || false
}

// Message functions
async function copyAssistantMessage(messageId: string) {
  const chat = selectedChat.value
  if (!chat) return
  const msg = chat.messages?.find(m => m.id === messageId && m.role === 'assistant')
  if (!msg) return
  try {
    await navigator.clipboard.writeText(msg.content)
    copiedMessageId.value = messageId
    setTimeout(() => {
      if (copiedMessageId.value === messageId) copiedMessageId.value = null
    }, 1500)
  } catch (e) {
    // fallback: create temporary textarea
    const ta = document.createElement('textarea')
    ta.value = msg.content
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch {}
    document.body.removeChild(ta)
    copiedMessageId.value = messageId
    setTimeout(() => {
      if (copiedMessageId.value === messageId) copiedMessageId.value = null
    }, 1500)
  }
}

function deleteMessage(messageId: string) {
  const chat = selectedChat.value
  if (!chat) return
  
  const messageIndex = chat.messages.findIndex(m => m.id === messageId)
  if (messageIndex === -1) return
  
  const message = chat.messages[messageIndex]
  const messageType = message.role === 'user' ? 'request' : 'response'
  
  if (confirm(`Are you sure you want to delete this ${messageType}?`)) {
    // Remove the message
    chat.messages.splice(messageIndex, 1)
    
    // Update chat metadata
    chat.updatedAt = Date.now()
    chat.messageCount = chat.messages.length
    
    // If this was the last message, update the chat name to default
    if (chat.messages.length === 0) {
      chat.name = 'New Chat'
    }
    
    // Clear copied message state if the deleted message was copied
    if (copiedMessageId.value === messageId) {
      copiedMessageId.value = null
    }
  }
}

async function sendMessage() {
  if (!prompt.value.trim() || !selectedChat.value) return

  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: sanitizeContent(prompt.value), // Sanitize content before storage
    timestamp: Date.now(),
    images: attachedImages.value.map(img => img.dataUrl)
  }

  // Add user message to chat
  if (selectedChat.value) {
    selectedChat.value.messages.push(userMessage)
    selectedChat.value.updatedAt = Date.now()
    selectedChat.value.messageCount = selectedChat.value.messages.length
  }

  // Clear input
  const currentPrompt = prompt.value
  const currentImages = [...attachedImages.value]
  prompt.value = ''
  attachedImages.value = []

  console.log('[ChatForm] Setting loading to true')
  loading.value = true
  error.value = ''

  try {
    // Ensure we have a selected chat
    if (!selectedChat.value) {
      throw new Error('No chat selected')
    }

    console.log('[ChatForm] Sending API request with:', {
      prompt: currentPrompt,
      model: selectedChat.value.model,
      conversationId: selectedChat.value.id,
      messageCount: selectedChat.value.messages.length
    })
    
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        prompt: currentPrompt,
        model: selectedChat.value.model,
        images: currentImages.map(img => img.dataUrl),
        conversationId: selectedChat.value.id,
        systemPrompt: selectedChat.value.systemPrompt || '',
        messages: selectedChat.value.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          images: msg.images || []
        }))
      }
    })
    
    console.log('[ChatForm] API response received:', response)

    // Check if response indicates success
    if (response && response.success && response.content) {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now()
      }

      if (selectedChat.value) {
        selectedChat.value.messages.push(assistantMessage)
        selectedChat.value.updatedAt = Date.now()
        selectedChat.value.messageCount = selectedChat.value.messages.length
        
        // Update the chat name based on the first exchange if it's still the default
        if (selectedChat.value.messages.length === 2 && selectedChat.value.name.startsWith('New Chat')) {
          // Generate a meaningful name from the first user message
          const firstUserMessage = selectedChat.value.messages[0].content
          const truncatedName = firstUserMessage.length > 50 
            ? firstUserMessage.substring(0, 50) + '...' 
            : firstUserMessage
          selectedChat.value.name = sanitizeContent(truncatedName) // Sanitize chat name
        }
      }
    } else if (response && response.error) {
      // Handle API error response
      throw new Error(response.error || 'API request failed')
    } else {
      throw new Error('No content received from AI model')
    }
  } catch (e: any) {
    console.error('Send message error:', e)
    // Handle different types of errors
    if (e.status === 500) {
      error.value = 'Internal server error'
    } else if (e.status === 400) {
      error.value = 'Bad request'
    } else if (e.status === 401) {
      error.value = 'Unauthorized'
    } else if (e.status === 403) {
      error.value = 'Forbidden'
    } else if (e.status === 429) {
      error.value = 'Rate limit exceeded'
    } else if (e.status >= 500) {
      error.value = 'Server error'
    } else if (e.message) {
      error.value = e.message
    } else {
      error.value = 'Request failed'
    }
  } finally {
    // Always ensure loading is false, even if there's an error
    console.log('[ChatForm] Setting loading to false in finally block')
    loading.value = false
  }
}

// Image handling functions
function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
}

async function onDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  for (const imageFile of imageFiles) {
    await processImageFile(imageFile)
  }
}

async function onPaste(e: ClipboardEvent) {
  console.log('Paste event triggered:', e.clipboardData?.types)
  
  // Check for different types of clipboard data
  const clipboardData = e.clipboardData
  if (!clipboardData) return
  
  // Method 1: Check items array (most reliable for images)
  const items = Array.from(clipboardData.items || [])
  console.log('Paste items:', items.map(item => ({ type: item.type, kind: item.kind })))
  
  // Look for image items
  const imageItems = items.filter(item => item.type.startsWith('image/'))
  
  if (imageItems.length > 0) {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Processing pasted images from items:', imageItems.length)
    
    for (const imageItem of imageItems) {
      const file = imageItem.getAsFile()
      if (file) {
        console.log('Processing pasted image file:', file.name, file.type, file.size)
        await processImageFile(file)
      }
    }
    return
  }
  
  // Method 2: Check for image data in different formats
  const imageFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
  
  for (const format of imageFormats) {
    if (clipboardData.types.includes(format)) {
      console.log('Found image in clipboard format:', format)
      
      try {
        // Try to get the image data
        const imageData = clipboardData.getData(format)
        if (imageData) {
          console.log('Got image data from clipboard')
          // Convert to file-like object
          const blob = new Blob([imageData], { type: format })
          const file = new File([blob], `pasted-image-${Date.now()}.${format.split('/')[1]}`, { type: format })
          await processImageFile(file)
          e.preventDefault()
          e.stopPropagation()
          return
        }
      } catch (err) {
        console.log('Failed to get image data from clipboard format:', format, err)
      }
    }
  }
  
  // Method 3: Check for HTML content that might contain images
  if (clipboardData.types.includes('text/html')) {
    const htmlContent = clipboardData.getData('text/html')
    console.log('HTML content in clipboard:', htmlContent?.substring(0, 200))
    
    // Look for img tags or base64 encoded images
    if (htmlContent) {
      const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"[^>]*>/i)
      if (imgMatch && imgMatch[1]) {
        const src = imgMatch[1]
        console.log('Found image src in HTML:', src)
        
        if (src.startsWith('data:image/')) {
          try {
            // Convert base64 data URL to file
            const response = await fetch(src)
            const blob = await response.blob()
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type })
            await processImageFile(file)
            e.preventDefault()
            e.stopPropagation()
            return
          } catch (err) {
            console.log('Failed to process HTML image:', err)
          }
        }
      }
    }
  }
  
  console.log('No images found in clipboard data')
}

// Global paste handler for images pasted anywhere on the page
async function onGlobalPaste(e: ClipboardEvent) {
  // Don't handle if the target is an input/textarea to avoid conflicts
  if (e.target && (e.target as HTMLElement).tagName?.toLowerCase().match(/^(input|textarea)$/)) {
    return
  }
  
  const items = Array.from(e.clipboardData?.items || [])
  const imageItems = items.filter(item => item.type.startsWith('image/'))
  
  if (imageItems.length > 0) {
    console.log('Global paste detected with images:', imageItems.length)
    
    for (const imageItem of imageItems) {
      const file = imageItem.getAsFile()
      if (file) {
        console.log('Processing globally pasted image:', file.name)
        await processImageFile(file)
      }
    }
  }
}

// Global keyboard shortcut handler for Ctrl+V/Cmd+V
function onGlobalKeydown(e: KeyboardEvent) {
  // Check for Ctrl+V (Windows/Linux) or Cmd+V (Mac)
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    // Only trigger if not in an input/textarea
    if (e.target && (e.target as HTMLElement).tagName?.toLowerCase().match(/^(input|textarea)$/)) {
      return
    }
    
    console.log('Global Ctrl+V/Cmd+V detected, opening file picker')
    // Trigger file input click
    if (fileInput.value) {
      fileInput.value.click()
    }
  }
}

async function onFile(e: Event) {
  console.log('onFile function called with event:', e)
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  console.log('Files to process:', files.length, files.map(f => ({ name: f.name, type: f.type, size: f.size })))
  
  for (const file of files) {
    console.log('Processing file:', file.name)
    await processImageFile(file)
  }
  
  input.value = ''
}

async function processImageFile(file: File) {
  console.log('processImageFile called with:', { name: file.name, type: file.type, size: file.size })
  
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select image files only'
    console.log('File type check failed:', file.type)
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    error.value = `Image "${file.name}" is too large. Please choose files under 10MB.`
    console.log('File size check failed:', file.size)
    return
  }
  
  // Set loading state
  imageProcessingLoading.value = true
  error.value = ''
  
  try {
    console.log('Starting image processing for:', file.name)
    
    // Additional file signature validation for better security
    const validImageSignatures = [
      [0xFF, 0xD8, 0xFF], // JPEG
      [0x89, 0x50, 0x4E, 0x47], // PNG
      [0x47, 0x49, 0x46], // GIF
      [0x52, 0x49, 0x46, 0x46], // WebP
      [0x00, 0x00, 0x01, 0x00], // ICO
      [0x42, 0x4D], // BMP
    ]
    
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    const isValidSignature = validImageSignatures.some(signature => {
      return signature.every((byte, index) => uint8Array[index] === byte)
    })
    
    if (!isValidSignature) {
      error.value = `File "${file.name}" appears to be corrupted or not a valid image file.`
      console.log('File signature validation failed for:', file.name)
      return
    }
    
    console.log('File validation passed, starting processing...')
    
    let processedFile = file
    let dataUrl: string
    
    // In test environments or if compression fails, use the original file
    try {
      // Compress the image to reduce storage usage
      processedFile = await compressImage(file, 1280, 720, 0.7)
      console.log('Image compression completed:', { originalSize: file.size, compressedSize: processedFile.size })
    } catch (compressErr) {
      console.warn('Image compression failed, using original file:', compressErr)
      processedFile = file
    }
    
    dataUrl = await readAsDataURL(processedFile)
    console.log('Data URL created, length:', dataUrl.length)
    
    const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log('Generated image ID:', imageId)
    
    // Check if we already have too many images
    if (attachedImages.value.length >= 10) {
      error.value = 'Maximum 10 images allowed. Please remove some before adding more.'
      console.log('Too many images already attached:', attachedImages.value.length)
      return
    }
    
    console.log('Adding image to attachedImages array...')
    attachedImages.value.push({
      id: imageId,
      name: file.name,
      type: processedFile.type,
      size: processedFile.size,
      preview: dataUrl,
      dataUrl: dataUrl
    })
    
    console.log('Image added successfully. New count:', attachedImages.value.length)
    console.log('attachedImages array:', attachedImages.value)
    
    // Log compression results if compression was successful
    if (processedFile !== file) {
      const originalSize = (file.size / 1024).toFixed(1)
      const compressedSize = (processedFile.size / 1024).toFixed(1)
      const compressionRatio = ((1 - processedFile.size / file.size) * 100).toFixed(1)
      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${compressionRatio}% reduction)`)
    }
    
    // Show success feedback
    console.log(`Image "${file.name}" added successfully`)
    console.log('Current attached images count:', attachedImages.value.length)
    console.log('Image preview container should be visible:', attachedImages.value.length > 0)
    
    // Force a reactive update
    nextTick(() => {
      console.log('After nextTick - attachedImages count:', attachedImages.value.length)
      console.log('Image preview container visibility check:', attachedImages.value.length > 0)
    })
  } catch (err) {
    error.value = `Failed to process image "${file.name}"`
    console.error('Image processing error:', err)
  } finally {
    // Always clear loading state
    imageProcessingLoading.value = false
    console.log('Image processing completed, loading state cleared')
  }
}

function removeImage(imageId: string) {
  attachedImages.value = attachedImages.value.filter(img => img.id !== imageId)
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Image compression function for better performance
async function compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Sidebar functions
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// Utility functions
import { formatRelativeDate, formatTime as formatTimeUtil } from '~/utils/dateUtils'

function formatDate(timestamp: number): string {
  return formatRelativeDate(timestamp)
}

function formatTime(timestamp: number): string {
  return formatTimeUtil(timestamp)
}
</script>

<style scoped>
/* Styles moved to MarkdownRenderer component */

/* Ensure modals are properly positioned and visible */
:deep(.modal-overlay) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 99999 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(4px) !important;
}

:deep(.modal-content) {
  position: relative !important;
  z-index: 100000 !important;
  background-color: white !important;
  border-radius: 1rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

/* Copy message button styling - similar to code block copy button */
.copy-message-button {
  padding: 0.25rem;
  color: #9ca3af;
  transition: all 0.15s ease-in-out;
  border-radius: 0.25rem;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.copy-message-button:hover {
  color: #ffffff;
  background-color: #374151;
}

.copy-message-button.copied {
  color: #34d399;
}

/* Delete message button styling */
.delete-message-button {
  padding: 0.25rem;
  color: #9ca3af;
  transition: all 0.15s ease-in-out;
  border-radius: 0.25rem;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.delete-message-button:hover {
  color: #ef4444;
  background-color: #fef2f2;
}

/* Image preview styling */
.image-preview-container {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
}

.image-preview-item {
  position: relative;
}

.image-preview-item img {
  cursor: pointer;
}

.image-preview-item:hover img {
  transform: scale(1.05);
}

/* Drag and drop visual feedback */
.drag-over {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

/* Image preview hover effects */
.image-preview-item:hover .image-preview-overlay {
  opacity: 1;
}

.image-preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* File input button styling */
.file-input-button {
  transition: all 0.2s ease;
}

.file-input-button:hover {
  transform: scale(1.05);
  background-color: rgba(59, 130, 246, 0.1);
}

/* Fixed input area styling */
.fixed-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 1rem 0;
}

.dark .fixed-input-area {
  background: rgba(17, 24, 39, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.input-area-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Ensure image previews are properly positioned */
.image-preview-container {
  position: relative;
  z-index: 1;
}

/* Chat messages container styling */
.chat-messages-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.chat-messages-wrapper {
  width: 100%;
  max-width: 100%;
}

/* Ensure proper spacing and prevent cutoff */
.chat-messages-container {
  /* padding-bottom is handled by chatContainerStyle computed property */
}

/* Fix textarea width issues */
.input-area-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Ensure textarea spans full width */
.input-area-content .relative,
.input-area-content .w-full {
  width: 100% !important;
}

/* Responsive width adjustments */
@media (max-width: 1280px) {
  .input-area-content,
  .chat-messages-container {
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 768px) {
  .input-area-content,
  .chat-messages-container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>