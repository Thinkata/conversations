<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <NuxtRouteAnnouncer />
    
    <!-- Header with Chat Management -->
    <UCard class="border-b rounded-none shadow-sm sticky top-0 z-50 h-20"
           :ui="{ background: 'bg-white dark:bg-gray-900', border: 'border-gray-200 dark:border-gray-800' }">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Conversations
            </h1>
            <p class="text-sm text-gray-600 mt-1">Model Conversations and Management</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div class="text-lg font-semibold text-gray-800">
              {{ selectedChat?.name || 'Select a chat' }}
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <UButton 
            @click="createNewChat"
            color="primary"
            variant="solid"
            icon="i-heroicons-plus"
            size="lg"
            class="shadow-md hover:shadow-lg transition-all duration-200"
            data-testid="new-chat-button"
          >
            New Chat
          </UButton>
          <UButton 
            @click="exportChats"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-down-tray"
            title="Save chats to local disk"
            size="md"
            class="hover:bg-gray-100 transition-colors"
            data-testid="export-button"
          />
          <UButton 
            @click="importChats"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-up-tray"
            title="Load chats from .json file"
            size="md"
            class="hover:bg-gray-100 transition-colors"
            data-testid="import-button"
          />
          <input 
            ref="importInput" 
            type="file" 
            accept=".json" 
            class="hidden" 
            @change="handleImportFile" 
            data-testid="import-file-input"
          />
        </div>
      </div>
    </UCard>

    <!-- Main Content -->
    <main>
      <NuxtPage />
    </main>

    <!-- Footer Info -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl z-40">
      <div class="max-w-4xl mx-auto p-2">
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          AI can make mistakes. Press Shift+Enter for new line, Enter to send.
        </p>
      </div>
    </div>

    <!-- Export Modal -->
    <UModal 
      v-model:open="showExportModal"
      title="Export Chats"
      description="Choose what you'd like to export from your conversations."
    >
      <template #body>
        <div class="space-y-6">
          <!-- Export Options -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                 @click="exportCurrentChat">
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="h-6 w-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-gray-100">Current Chat Only</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Export only the currently selected conversation
                </p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="h-5 w-5 text-gray-400" />
            </div>

            <div class="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                 @click="exportAllChats"
                 data-testid="export-all-chats">
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-archive-box" class="h-6 w-6 text-green-600" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-gray-100">All Chats</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Export all your conversations and settings
                </p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <!-- Current Chat Info (if available) -->
          <div v-if="selectedChat" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Chat:</h4>
            <p class="text-sm text-blue-700 dark:text-blue-300">{{ selectedChat.name }}</p>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {{ selectedChat.messageCount }} messages • Last updated {{ formatDate(selectedChat.updatedAt) }}
            </p>
          </div>

          <!-- Export Summary -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">What's included:</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>All messages and timestamps</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Chat settings and model preferences</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>System prompts and configurations</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-heroicons-check" class="h-4 w-4 text-green-500" />
                <span>Export metadata and timestamps</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end">
          <UButton 
            @click="showExportModal = false"
            color="gray"
            variant="ghost"
          >
            Cancel
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// Vue imports
import { ref, computed, onMounted, provide, readonly, watch, nextTick } from 'vue'

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

// Chat management state
const chats = ref<Chat[]>([])
const selectedChatId = ref<string | null>(null)
const isInitialLoad = ref(true)

// Modal states
const showExportModal = ref(false)

// Refs
const importInput = ref<HTMLInputElement | null>(null)

// Computed
const selectedChat = computed(() => 
  chats.value.find(chat => chat.id === selectedChatId.value)
)

// Initialize
onMounted(async () => {
  // Ensure we're on the client side
  if (process.client) {
    console.log('[App] onMounted - starting to load chats')
    await loadChatsFromStorage()
  } else {
    console.log('[App] onMounted - server side, skipping localStorage operations')
  }
})

// Watch for changes in chats and auto-save, plus handle selected chat cleanup
watch(chats, (newChats, oldChats) => {
  // Only save if this is not the initial load
  if (!isInitialLoad.value) {
    saveChatsToStorage()
  }
  
  // If the currently selected chat was deleted, select the first available chat
  if (selectedChatId.value && !newChats.find(chat => chat.id === selectedChatId.value)) {
    if (newChats.length > 0) {
      selectedChatId.value = newChats[0].id
    } else {
      selectedChatId.value = null
    }
  }
}, { deep: true })

// Watch for when initial load is complete to handle empty state
watch(isInitialLoad, (isLoading, wasLoading) => {
  if (!isLoading && wasLoading) {
    console.log('[App] Initial load complete, checking if we need to create a default chat')
    // If no chats exist after loading is complete, create a default chat
    if (chats.value.length === 0) {
      console.log('[App] No chats found, creating default chat')
      createNewChat()
    }
  }
})

// Watch for changes in selectedChatId to save it immediately
watch(selectedChatId, (newId, oldId) => {
  if (process.client && newId && !isInitialLoad.value) {
    // Save using the unified format
    saveChatsToStorage()
  }
})

// Chat management functions
function createNewChat() {
  console.log('[App] createNewChat called')
  
  // Mark initial load as complete when creating a new chat
  isInitialLoad.value = false
  
  // Get the configured default model and system prompt
  const { getDefaultModel, defaultSystemPrompt } = useDefaultModel()
  
  const newChat: Chat = {
    id: crypto.randomUUID(),
    name: `New Chat ${chats.value.length + 1}`,
    messages: [],
    model: getDefaultModel(),
    systemPrompt: defaultSystemPrompt.value,
    updatedAt: Date.now(),
    messageCount: 0
  }
  
  console.log('[App] Creating new chat:', {
    id: newChat.id,
    name: newChat.name,
    model: newChat.model,
    currentChatsCount: chats.value.length
  })
  
  chats.value.unshift(newChat)
  selectedChatId.value = newChat.id
  
  console.log('[App] New chat created and selected. Current state:', {
    chatsCount: chats.value.length,
    selectedChatId: selectedChatId.value,
    selectedChatName: newChat.name
  })
  
  // Force save to localStorage immediately
  saveChatsToStorage()
  
  // Notify ChatForm component through provide/inject
  // The ChatForm component will automatically detect the new chat
}

// Storage functions - use the same format as export/import
function saveChatsToStorage() {
  if (process.client && typeof window !== 'undefined' && window.localStorage) {
    // Use the same format as export - unified storage system
    const storageData = {
      chats: chats.value,
      selectedChatId: selectedChatId.value,
      exportDate: new Date().toISOString()
    }
    
    console.log('[Save] Saving to localStorage:', {
      chatsCount: chats.value.length,
      selectedChatId: selectedChatId.value,
      exportDate: storageData.exportDate
    })
    
    // Save the complete data structure to localStorage
    localStorage.setItem('chat-data', JSON.stringify(storageData))
    
    console.log('[Save] Successfully saved to localStorage')
  }
}



async function loadChatsFromStorage() {
  if (process.client && typeof window !== 'undefined' && window.localStorage) {
    try {
      console.log('[Load] Starting to load chats from storage...')
      
      // Check for new unified format first
      let stored = localStorage.getItem('chat-data')
      
      // If not found, try to migrate from old format
      if (!stored) {
        console.log('[Load] No unified format found, checking for old format...')
        const oldChats = localStorage.getItem('nuxt-responder-chats')
        const oldSelectedChatId = localStorage.getItem('nuxt-responder-selected-chat')
        
        if (oldChats && typeof window !== 'undefined' && window.localStorage) {
          try {
            console.log('[Load] Migrating from old format...')
            const parsedChats = JSON.parse(oldChats)
            const migrationData = {
              chats: parsedChats,
              selectedChatId: oldSelectedChatId,
              exportDate: new Date().toISOString()
            }
            
            // Save in new format
            localStorage.setItem('chat-data', JSON.stringify(migrationData))
            
            // Clean up old keys
            localStorage.removeItem('nuxt-responder-chats')
            localStorage.removeItem('nuxt-responder-selected-chat')
            
            stored = localStorage.getItem('chat-data')
            console.log('[Load] Migration completed successfully')
          } catch (e) {
            console.error('[Load] Migration failed:', e)
          }
        }
      }
      
      if (stored) {
        try {
          console.log('[Load] Parsing stored data...')
          const importedData = JSON.parse(stored)
          
          // Handle both old format (just chats array) and new format (with metadata)
          let importedChats: Chat[]
          let importedSelectedChatId: string | null = null
          
          if (Array.isArray(importedData)) {
            // Old format - just chats array
            importedChats = importedData
            importedSelectedChatId = null
            console.log('[Load] Using old format data')
          } else if (importedData.chats && Array.isArray(importedData.chats)) {
            // New format - with metadata
            importedChats = importedData.chats
            importedSelectedChatId = importedData.selectedChatId || null
            console.log('[Load] Using new format data')
          } else {
            throw new Error('Invalid stored data format')
          }
          
          console.log('[Load] Loaded chats:', importedChats.length, 'Selected chat ID:', importedSelectedChatId)
          
          // Set chats first
          chats.value = importedChats
          
          // Wait for Vue to process the chats change
          await nextTick()
          
          if (chats.value.length > 0) {
            // Use the EXACT SAME logic as import - this is proven to work!
            let chatToSelect: string | null = null
            
            // First priority: stored selected chat ID
            if (importedSelectedChatId && chats.value.find(chat => chat.id === importedSelectedChatId)) {
              chatToSelect = importedSelectedChatId
              console.log('[Load] Restoring previously selected chat:', chatToSelect)
            }
            // Second priority: first chat
            if (!chatToSelect) {
              chatToSelect = chats.value[0].id
              console.log('[Load] Selecting first chat as fallback:', chatToSelect)
            }
            
            // Set the selected chat
            selectedChatId.value = chatToSelect
            
            // Wait for Vue to process the selection change
            await nextTick()
          }
          
          console.log('[Load] Successfully loaded chats. Final state:', {
            chatsCount: chats.value.length,
            selectedChatId: selectedChatId.value,
            selectedChatName: chats.value.find(c => c.id === selectedChatId.value)?.name
          })
          
        } catch (e) {
          console.error('[Load] Failed to parse stored data:', e)
          // Reset to empty state on error
          chats.value = []
          selectedChatId.value = null
        }
      } else {
        console.log('[Load] No stored data found, starting with empty state')
      }
    } catch (e) {
      console.error('[Load] Unexpected error during loading:', e)
      // Reset to empty state on error
      chats.value = []
      selectedChatId.value = null
    } finally {
      // Always mark initial load as complete
      console.log('[Load] Marking initial load as complete')
      isInitialLoad.value = false
    }
  }
}

// Export/Import functions
function exportChats() {
  showExportModal.value = true
}

function exportCurrentChat() {
  if (!selectedChatId.value) {
    console.warn('[Export] No chat selected')
    return
  }
  
  const selectedChat = chats.value.find(chat => chat.id === selectedChatId.value)
  if (!selectedChat) {
    console.warn('[Export] Selected chat not found')
    return
  }
  
  performExport([selectedChat], true)
  showExportModal.value = false
}

function exportAllChats() {
  performExport(chats.value, false)
  showExportModal.value = false
}

function performExport(chatsToExport: Chat[], isSingleChat: boolean) {
  // Export data with metadata
  const exportData = {
    chats: chatsToExport,
    selectedChatId: isSingleChat ? selectedChatId.value : null, // Only include if single chat
    exportDate: new Date().toISOString(),
    exportType: isSingleChat ? 'single-chat' : 'all-chats'
  }
  

  
  // Generate filename with chat name prefix and timestamp suffix
  let filename = 'chats'
  
  // If there's a selected chat, use its name as prefix
  if (selectedChatId.value && isSingleChat) {
    const selectedChat = chats.value.find(chat => chat.id === selectedChatId.value)
    if (selectedChat) {
      // Clean the chat name for use in filename (remove special characters, limit length)
      const cleanChatName = selectedChat.name
        .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters except spaces, hyphens, underscores
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50) // Limit length
        .trim()
      
      if (cleanChatName) {
        filename = cleanChatName
      }
    }
  }
  
  // Add timestamp suffix using local time HHMMSS
  const now = new Date()
  const date = now.toISOString().split('T')[0] // YYYY-MM-DD
  const time = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  }).replace(/:/g, '') // HHMMSS
  
  const timestamp = `${date}-${time}`
  
  const fullFilename = `${filename}-${timestamp}.json`
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = fullFilename
  link.click()
  URL.revokeObjectURL(url)
  

}

// Utility functions
import { formatRelativeDate } from '~/utils/dateUtils'

function formatDate(timestamp: number): string {
  return formatRelativeDate(timestamp)
}

function importChats() {
  if (importInput.value) {
    importInput.value.click()
  }
}

function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target?.result as string)
      
      // Handle both old format (just chats array) and new format (with metadata)
      let importedChats: Chat[]
      let importedSelectedChatId: string | null = null
      let importType: string | null = null
      
      if (Array.isArray(importedData)) {
        // Old format - just chats array
        importedChats = importedData
        importedSelectedChatId = null
        importType = 'legacy'
      } else if (importedData.chats && Array.isArray(importedData.chats)) {
        // New format - with metadata
        importedChats = importedData.chats
        importedSelectedChatId = importedData.selectedChatId || null
        importType = importedData.exportType || 'unknown'
      } else {
        throw new Error('Invalid file format')
      }
      
      // Determine if this is a single chat import or full import
      const isSingleChatImport = importType === 'single-chat' || importedChats.length === 1
      
      if (isSingleChatImport) {
        // Single chat import - merge with existing chats
        
        // Check if chat already exists (by name and content similarity)
        const existingChatIndex = chats.value.findIndex(existingChat => {
          // Check if names match
          if (existingChat.name === importedChats[0].name) {
            // Check if content is similar (first few messages)
            const existingFirstMsg = existingChat.messages[0]?.content || ''
            const importedFirstMsg = importedChats[0].messages[0]?.content || ''
            return existingFirstMsg.substring(0, 50) === importedFirstMsg.substring(0, 50)
          }
          return false
        })
        
        if (existingChatIndex >= 0) {
          // Replace existing chat
          chats.value[existingChatIndex] = importedChats[0]
        } else {
          // Add new chat
          chats.value.unshift(importedChats[0])
        }
        
        // Select the imported chat
        selectedChatId.value = importedChats[0].id
        
      } else {
        // Full import - replace all chats
        chats.value = importedChats
        
        if (chats.value.length > 0) {
        // Try to restore the selected chat from imported data first, then fallback to localStorage, then to first chat
        let chatToSelect: string | null = null
        
        // First priority: imported selected chat ID
        if (importedSelectedChatId && chats.value.find(chat => chat.id === importedSelectedChatId)) {
          chatToSelect = importedSelectedChatId
        }
        // Second priority: last selected chat from localStorage (unified format)
        else if (!chatToSelect && typeof window !== 'undefined' && window.localStorage) {
          const storedData = localStorage.getItem('chat-data')
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData)
              const lastSelectedChatId = parsedData.selectedChatId
              if (lastSelectedChatId && chats.value.find(chat => chat.id === lastSelectedChatId)) {
                chatToSelect = lastSelectedChatId
              }
            } catch (e) {
              console.error('[Import] Failed to parse unified localStorage data:', e)
            }
          }
        }
        // Third priority: first chat
        if (!chatToSelect) {
          chatToSelect = chats.value[0].id
        }
        
        selectedChatId.value = chatToSelect
      }
      }
    } catch (e) {
      alert('Failed to parse chat file')
      console.error('Import error:', e)
    }
  }
  reader.readAsText(file)
  input.value = '' // Reset input
}

// Provide chat data to child components
provide('chats', readonly(chats))
provide('selectedChatId', readonly(selectedChatId))
provide('setSelectedChatId', (id: string) => {
  selectedChatId.value = id
  // The watcher will handle saving to localStorage in the unified format
})
provide('createNewChat', createNewChat)

// Provide function to delete chats
provide('deleteChat', (chatId: string) => {
  const chatIndex = chats.value.findIndex(c => c.id === chatId)
  if (chatIndex !== -1) {
    // Remove the chat using splice to ensure reactivity
    chats.value.splice(chatIndex, 1)
    
    // If the deleted chat was selected, select a new one
    if (selectedChatId.value === chatId) {
      if (chats.value.length > 0) {
        selectedChatId.value = chats.value[0].id
      } else {
        selectedChatId.value = null
      }
    }
  }
})

// Debug function for troubleshooting (only in development and client-side)
onMounted(() => {
  if (process.dev && process.client && typeof window !== 'undefined') {
    // @ts-ignore - Expose debug function globally for development
    window.debugChatStorage = {
      getChats: () => chats.value,
      getSelectedChatId: () => selectedChatId.value,
      getLocalStorage: () => {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = localStorage.getItem('chat-data')
          return stored ? JSON.parse(stored) : null
        }
        return null
      },
      forceSave: () => saveChatsToStorage(),
      forceLoad: () => loadChatsFromStorage(),
      createTestChat: () => createNewChat()
    }
    
    console.log('[App] Debug functions exposed to window.debugChatStorage')
  }
})

</script>