<template>
  <div class="tags-input">
    <div class="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 min-h-[40px]">
      <UBadge
        v-for="(tag, index) in tags"
        :key="index"
        :label="tag"
        color="blue"
        variant="soft"
        size="sm"
        class="cursor-pointer"
        @click="removeTag(index)"
      >
        <template #trailing>
          <UIcon name="i-heroicons-x-mark" class="h-3 w-3" />
        </template>
      </UBadge>
      <input
        v-model="inputValue"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleBackspace"
        @blur="addTag"
        :placeholder="placeholder"
        class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Props
interface Props {
  modelValue: string[]
  placeholder?: string
  allowDuplicates?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add tags...',
  allowDuplicates: true
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// State
const inputValue = ref('')
const tags = ref<string[]>([...props.modelValue])

// Methods
const addTag = () => {
  const tag = inputValue.value.trim()
  if (tag && (props.allowDuplicates || !tags.value.includes(tag))) {
    tags.value.push(tag)
    inputValue.value = ''
    emit('update:modelValue', [...tags.value])
  }
}

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
  emit('update:modelValue', [...tags.value])
}

const handleBackspace = () => {
  if (inputValue.value === '' && tags.value.length > 0) {
    tags.value.pop()
    emit('update:modelValue', [...tags.value])
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  tags.value = [...newValue]
}, { deep: true })
</script>

<style scoped>
.tags-input {
  width: 100%;
}
</style>
