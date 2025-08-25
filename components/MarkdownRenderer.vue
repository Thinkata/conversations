<template>
  <div class="markdown-content" v-html="sanitizedContent"></div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import DOMPurify from 'dompurify'
import { computed, onMounted, onUnmounted } from 'vue'

interface Props {
  content: string
}

const props = defineProps<Props>()

// Configure marked with custom renderer for better code block handling
// For marked v12, we need to use the new renderer API
let renderer: marked.Renderer

// Initialize marked renderer
const initializeMarked = () => {
  // Create a new renderer instance
  renderer = new marked.Renderer()
  
  // Custom code block renderer with language detection and syntax highlighting
  renderer.code = (code: string, language: string | undefined) => {
    console.log('Rendering code block:', { code: code.substring(0, 100), language })
    const lang = language || 'text'
    let highlightedCode = code
    
    // Map common language aliases
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'r': 'r',
      'sql': 'sql',
      'html': 'xml',
      'xml': 'xml',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile',
      'makefile': 'makefile',
      'gitignore': 'gitignore',
      'markdown': 'markdown',
      'md': 'markdown'
    }
    
    const mappedLang = languageMap[lang.toLowerCase()] || lang
    console.log('Mapped language:', mappedLang)
    
    try {
      if (hljs.getLanguage(mappedLang)) {
        highlightedCode = hljs.highlight(code, { language: mappedLang }).value
      } else {
        highlightedCode = hljs.highlightAuto(code).value
      }
    } catch (e) {
      console.warn('Highlight.js error:', e)
      highlightedCode = hljs.escape(code)
    }
    
    const renderedHTML = `
      <div class="code-block-wrapper">
        <div class="code-header">
          <span class="language-tag">${mappedLang}</span>
                  <button class="code-copy-button" title="Copy code" data-testid="copy-button">
          📋
        </button>
        </div>
        <pre class="code-content language-${mappedLang}"><code class="hljs language-${mappedLang}">${highlightedCode}</code></pre>
      </div>
    `
    
    console.log('Rendered HTML:', renderedHTML)
    return renderedHTML
  }

  // Custom inline code renderer
  renderer.codespan = (code: string) => {
    // Escape HTML characters manually since hljs.escape is not available
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }
    return `<code class="inline-code">${escapeHtml(code)}</code>`
  }

  // Configure marked options for v12
  marked.use({ renderer })

  // Set basic options
  marked.setOptions({
    breaks: true,
    gfm: true
  })

  console.log('Marked renderer initialized:', renderer)
  console.log('Custom code renderer:', renderer.code)
}

// Initialize marked when component is created
initializeMarked()

// Computed property for rendered content with sanitization
const renderedContent = computed(() => {
  try {
    console.log('Rendering markdown content:', props.content.substring(0, 200) + (props.content.length > 200 ? '...' : ''))
    const result = marked(props.content)
    console.log('Marked result:', result.substring(0, 500) + (result.length > 500 ? '...' : ''))
    return result
  } catch (e) {
    console.error('Markdown rendering error:', e)
    return props.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
})

// Sanitized content to prevent XSS
const sanitizedContent = computed(() => {
  if (process.client) {
    console.log('Before sanitization:', renderedContent.value.substring(0, 500))
    
    const sanitized = DOMPurify.sanitize(renderedContent.value, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'blockquote', 'pre', 'code', 'kbd', 'samp', 'var',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
        'a', 'img', 'hr', 'div', 'span', 'button',
        'mark', 'small', 'sub', 'sup', 'cite', 'q', 'abbr', 'acronym'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'target',
        'rel', 'width', 'height', 'style', 'data-testid'
      ],
      ALLOW_DATA_ATTR: true,
      KEEP_CONTENT: true
    })
    
    console.log('After sanitization:', sanitized.substring(0, 500))
    console.log('Copy button present:', sanitized.includes('copy-button'))
    
    return sanitized
  }
  return renderedContent.value
})

// Copy function for code blocks
const copyCodeBlock = (button: HTMLElement) => {
  console.log('copyCodeBlock called with button:', button)
  const codeBlock = button.closest('.code-block-wrapper')?.querySelector('code')
  console.log('Found code block:', codeBlock)
  
  if (codeBlock) {
    const text = codeBlock.textContent || ''
    console.log('Code text to copy:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))
    
    // Show copying state
    button.innerHTML = '⏳'
    button.classList.add('copying')
    
    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      console.log('Using modern clipboard API')
      navigator.clipboard.writeText(text).then(() => {
        console.log('Clipboard API success')
        // Show success state
        button.innerHTML = '✅'
        button.classList.remove('copying')
        button.classList.add('copied')
        
        // Return to copy state after 1.5 seconds
        setTimeout(() => {
          button.innerHTML = '📋'
          button.classList.remove('copied')
        }, 1500)
      }).catch(err => {
        console.error('Clipboard API failed:', err)
        fallbackCopy(text, button)
      })
    } else {
      console.log('Clipboard API not available, using fallback')
      fallbackCopy(text, button)
    }
  } else {
    console.error('No code block found')
  }
}

// Fallback copy function
const fallbackCopy = (text: string, button: HTMLElement) => {
  console.log('Using fallback copy method')
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    const successful = document.execCommand('copy')
    if (successful) {
      console.log('Fallback copy successful')
      // Show success state
      button.innerHTML = '✅'
      button.classList.remove('copying')
      button.classList.add('copied')
      
      setTimeout(() => {
        button.innerHTML = '📋'
        button.classList.remove('copied')
      }, 1500)
    } else {
      throw new Error('execCommand failed')
    }
  } catch (e) {
    console.error('Fallback copy failed:', e)
    // Show error state
    button.innerHTML = '❌'
    button.classList.remove('copying')
    button.classList.add('error')
    
    setTimeout(() => {
      button.innerHTML = '📋'
      button.classList.remove('error')
    }, 1500)
  } finally {
    document.body.removeChild(textArea)
  }
}

// Use event delegation instead of global function exposure
let handleClick: ((event: Event) => void) | null = null

onMounted(() => {
  console.log('MarkdownRenderer mounted, setting up event listener')
  
  handleClick = (event: Event) => {
    const target = event.target as HTMLElement
    console.log('Click event on:', target)
    
    // Check if the target is the button or contains the button
    const copyButton = target.closest('.code-copy-button')
    if (copyButton) {
      console.log('Copy button clicked:', copyButton)
      event.preventDefault()
      event.stopPropagation()
      copyCodeBlock(copyButton as HTMLElement)
    }
  }
  
  document.addEventListener('click', handleClick)
  console.log('Click event listener added to document')
})

onUnmounted(() => {
  if (handleClick) {
    document.removeEventListener('click', handleClick)
    console.log('Click event listener removed from document')
  }
})
</script>

<style scoped>
.markdown-content {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-wrap: break-word;
  word-break: break-word;
}

.markdown-content :deep(.code-block-wrapper) {
  margin: 1rem 0;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #1e1e1e;
  max-width: 100%;
}

.markdown-content :deep(.code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #1f2937;
  color: #e5e7eb;
  font-size: 0.875rem;
  border-bottom: 1px solid #374151;
}

.markdown-content :deep(.language-tag) {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: #374151;
  border-radius: 0.25rem;
  color: #d1d5db;
}

.markdown-content :deep(.code-copy-button) {
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

.markdown-content :deep(.code-copy-button:hover) {
  color: #ffffff;
  background-color: #374151;
}

.markdown-content :deep(.code-copy-button.copied) {
  color: #34d399;
}

.markdown-content :deep(.code-copy-button.copying) {
  color: #60a5fa;
}

.markdown-content :deep(.code-copy-button.error) {
  color: #ef4444;
}



.markdown-content :deep(.code-content) {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  background: #1e1e1e;
  max-height: 500px;
  overflow-y: auto;
  max-width: 100%;
  box-sizing: border-box;
}

.markdown-content :deep(.code-content code) {
  font-size: 0.875rem;
  line-height: 1.5;
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: anywhere;
  max-width: 100%;
  display: block;
}

.markdown-content :deep(.inline-code) {
  padding: 0.125rem 0.375rem;
  background-color: #f3f4f6;
  color: #1f2937;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: anywhere;
  max-width: 100%;
}

/* Syntax highlighting overrides */
.markdown-content :deep(.hljs) {
  background: transparent !important;
  color: #d4d4d4 !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  word-break: break-all !important;
  overflow-wrap: anywhere !important;
  max-width: 100% !important;
}

.markdown-content :deep(.hljs-keyword) {
  color: #569cd6 !important;
}

.markdown-content :deep(.hljs-string) {
  color: #ce9178 !important;
}

.markdown-content :deep(.hljs-comment) {
  color: #6a9955 !important;
  font-style: italic;
}

.markdown-content :deep(.hljs-number) {
  color: #b5cea8 !important;
}

.markdown-content :deep(.hljs-function) {
  color: #dcdcaa !important;
}

.markdown-content :deep(.hljs-class) {
  color: #4ec9b0 !important;
}

.markdown-content :deep(.hljs-variable) {
  color: #9cdcfe !important;
}

.markdown-content :deep(.hljs-operator) {
  color: #d4d4d4 !important;
}

.markdown-content :deep(.hljs-punctuation) {
  color: #d4d4d4 !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .markdown-content :deep(.code-content) {
    font-size: 0.75rem;
    max-height: 300px;
  }
  
  .markdown-content :deep(.code-header) {
    padding: 0.375rem 0.75rem;
  }
  
  .markdown-content :deep(.code-content) {
    padding: 0.75rem;
  }
}

/* Scrollbar styling for code blocks */
.markdown-content :deep(.code-content::-webkit-scrollbar) {
  height: 8px;
}

.markdown-content :deep(.code-content::-webkit-scrollbar-track) {
  background: #2d2d2d;
}

.markdown-content :deep(.code-content::-webkit-scrollbar-thumb) {
  background: #555;
  border-radius: 4px;
}

.markdown-content :deep(.code-content::-webkit-scrollbar-thumb:hover) {
  background: #777;
}

/* Enhanced overflow handling for all markdown elements */
.markdown-content :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  word-wrap: break-word;
  word-break: break-word;
}

.markdown-content :deep(pre) {
  margin: 0;
  padding: 0;
  background: transparent;
  overflow: visible;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.markdown-content :deep(code) {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: anywhere;
  max-width: 100%;
}

.markdown-content :deep(table) {
  width: 100%;
  overflow-x: auto;
  display: block;
  max-width: 100%;
  border-collapse: collapse;
}

.markdown-content :deep(table th),
.markdown-content :deep(table td) {
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  text-align: left;
  white-space: normal;
  min-width: 100px;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}

.markdown-content :deep(table th) {
  background-color: #f9fafb;
  font-weight: 600;
}

.markdown-content :deep(table tr:nth-child(even)) {
  background-color: #f9fafb;
}

.markdown-content :deep(table tr:hover) {
  background-color: #f3f4f6;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Enhanced image container for better overflow handling */
.markdown-content :deep(p:has(img)) {
  max-width: 100%;
  overflow: hidden;
  margin: 1rem 0;
}

/* Responsive image handling */
@media (max-width: 768px) {
  .markdown-content :deep(img) {
    max-width: 100%;
    margin: 0.75rem auto;
  }
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  background-color: #f9fafb;
  font-style: italic;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-wrap: break-word;
}

.markdown-content :deep(hr) {
  border-color: #d1d5db;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.markdown-content :deep(ul), .markdown-content :deep(ol) {
  padding-left: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  max-width: 100%;
}

.markdown-content :deep(li) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-wrap: break-word;
}

.markdown-content :deep(h1), .markdown-content :deep(h2), 
.markdown-content :deep(h3), .markdown-content :deep(h4),
.markdown-content :deep(h5), .markdown-content :deep(h6) {
  font-weight: 700;
  color: #111827;
  margin-top: 1rem;
  margin-bottom: 1rem;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-wrap: break-word;
}

.markdown-content :deep(h1) { font-size: 1.875rem; line-height: 2.25rem; }
.markdown-content :deep(h2) { font-size: 1.5rem; line-height: 2rem; }
.markdown-content :deep(h3) { font-size: 1.25rem; line-height: 1.75rem; }
.markdown-content :deep(h4) { font-size: 1.125rem; line-height: 1.75rem; }
.markdown-content :deep(h5) { font-size: 1rem; line-height: 1.5rem; }
.markdown-content :deep(h6) { font-size: 0.875rem; line-height: 1.25rem; }

.markdown-content :deep(p) {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.625;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-wrap: break-word;
}

.markdown-content :deep(strong) {
  font-weight: 700;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-wrap: break-word;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}

/* Special handling for markdown code blocks */
.markdown-content :deep(.markdown) {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: anywhere;
  max-width: 100%;
}

/* Ensure code blocks with long lines wrap properly */
.markdown-content :deep(pre code),
.markdown-content :deep(.code-content code),
.markdown-content :deep(.hljs) {
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  word-break: break-all !important;
  overflow-wrap: anywhere !important;
  max-width: 100% !important;
  display: block !important;
}
</style>
