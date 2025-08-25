# Conversations - AI Chat Application

A sophisticated, responsive chat application built with **Nuxt 4** for seamless interaction with AI models through OpenAI-compatible APIs. Features an advanced chat management system with support for text and multimodal conversations, persistent chat history, and a modern conversational interface with enterprise-grade security.

![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.0-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-14.5-17202C?style=flat&logo=cypress&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Cypress%20Tests-2088FF?style=flat&logo=github-actions&logoColor=white)

## ✨ Features

- 🤖 **20+ AI Models** - Works with any OpenAI-compatible API (Lambda AI, OpenAI, Anthropic, local models, etc.)
- 💬 **Advanced Chat Management** - Create, organize, search, and manage multiple conversations
- 🖼️ **Multimodal Support** - Text + image + audio conversations with unified interface
- 📱 **Responsive Design** - Beautiful interface that works seamlessly on desktop and mobile
- 🔒 **Secure API Handling** - Server-side API key management for enhanced security
- 📝 **Rich Markdown Rendering** - Full markdown support with syntax highlighting via highlight.js
- 📤 **File Upload Support** - Handle both image URLs and local file uploads (up to 10MB)
- 💾 **Persistent Chat History** - Local storage-based chat persistence with export functionality
- 🎨 **Modern UI** - Built with Nuxt UI and Tailwind CSS with dark/light mode support
- 🔍 **Chat Search & Filter** - Find conversations quickly with built-in search functionality
- ✅ **Comprehensive Testing** - Full E2E test suite with Cypress for reliability (46+ tests)
- 🛡️ **Enterprise Security** - XSS protection, rate limiting, security headers, input validation
- 🧠 **Intelligent Model Selection** - Automatic capability detection and model recommendations
- 🔄 **Provider Agnostic** - Switch between AI providers without code changes
- 📊 **Smart Context Management** - Adaptive context windows based on model capabilities
- 💾 **Advanced Export/Import** - Complete conversation portability with metadata preservation

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19.0+ (required for Nuxt 4 compatibility)
- npm 10.0.0+ or yarn
- API key for any OpenAI-compatible service (Lambda AI, OpenAI, Anthropic, local models, etc.)

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API credentials:
   ```env
   API_KEY=your_api_key_here
   BASE_URL=https://api.openai.com/v1
   DEFAULT_MODEL=gpt-4o-mini
   ```
   
   **OpenAI-Compatible Services:**
   ```env
   # OpenAI (Default)
   BASE_URL=https://api.openai.com/v1
   
   # Lambda AI
   BASE_URL=https://api.lambda.ai/v1
   
   # Local/Self-hosted (e.g., Ollama, LM Studio)
   BASE_URL=http://localhost:11434/v1
   
   # Other providers (Anthropic, Groq, etc.)
   BASE_URL=https://your-provider-endpoint/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## ⚙️ Configuration

Conversations supports extensive configuration through environment variables stored in your `.env` file.

### Configuration Examples

**Set Default Model for New Chats:**
```bash
DEFAULT_MODEL=gpt-4o-mini
```

**Add Default System Prompt:**
```bash
DEFAULT_SYSTEM_PROMPT=You are a helpful coding assistant. Always provide code examples.
```

**Customize App Name:**
```bash
APP_NAME=My AI Chat
```

**Disable Image Upload:**
```bash
ENABLE_IMAGE_UPLOAD=false
```

**Set Maximum Image Size:**
```bash
MAX_IMAGE_SIZE_MB=5
```

## 🛠️ Available Scripts

```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run postinstall        # Prepare Nuxt
npm run test               # Run all Cypress tests
npm run test:open          # Open Cypress test runner
npm run test:e2e           # Run all E2E tests
npm run test:security      # Run security tests
npm run test:functionality # Run functionality tests
npm run test:regression    # Run regression tests
```

## 🎯 Usage

### Chat Management
- **Create New Chat**: Click the "+" button to start a new conversation
- **Search Chats**: Use the search bar to find specific conversations
- **Rename Chats**: Double-click on any chat name to edit it
- **Delete Chats**: Use the delete button to remove unwanted conversations
- **Export Chats**: Export individual conversations or your entire chat history

### Basic Text Chat
1. Select or create a new chat from the sidebar
2. Choose an AI model from the dropdown
3. Enter your prompt in the text area
4. Click "Generate Response" or press Ctrl+Enter
5. View the beautifully rendered markdown response with syntax highlighting

### Multimodal Chat (Text + Image)
1. Choose a vision-capable model (e.g., "Llama 3.2 11B Vision")
2. Add an image via URL or drag-and-drop file upload (max 10MB)
3. Enter your prompt asking about the image
4. Generate and view the AI's analysis of your image

### Available Models

**Premium Models (Most Powerful)**
- DeepSeek R1 671B - Most powerful reasoning
- Llama 3.1 405B - Large scale processing
- Hermes 3 405B - Advanced capabilities

**High Performance Models**
- Llama 4 Maverick 17B - Latest technology
- DeepSeek V3 - Balanced performance
- Various 70B models for different use cases

**Specialized Models**
- Qwen 2.5 Coder 32B - Optimized for coding
- Llama 3.2 11B Vision - Multimodal capabilities

**Fast & Efficient Models**
- Llama 3.1 8B - Quick responses
- Llama 3.2 3B - Ultra fast processing

## 🏗️ Architecture

### **System Overview**
This application follows a **modern, composable architecture** that sets it apart from traditional chat tools:

- **Frontend**: Vue 3 + Nuxt 3 with Composition API for reactive state management
- **Backend**: Server-side API routes for secure AI model communication
- **Storage**: Client-side localStorage with automatic migration and export capabilities
- **Testing**: Comprehensive E2E testing with Cypress and GitHub Actions integration

### **Key Architectural Decisions**

#### **1. Multi-Modal First Design**
```typescript
// Unified content handling for text, images, and audio
const content: any[] = [{ type: 'text', text: prompt }]
if (images?.length > 0) {
  content.push({ type: 'image_url', image_url: { url: imageData } })
}
if (audios?.length > 0) {
  content.push({ type: 'input_audio', input_audio: { data: base64, format } })
}
```

#### **2. Provider-Agnostic API Layer**
```typescript
// Easy switching between AI providers via environment variables
BASE_URL: process.env.BASE_URL || 'https://api.lambda.ai/v1'
// Supports: OpenAI, Lambda AI, Anthropic, Ollama, local models, etc.
```

#### **3. Intelligent Context Management**
```typescript
// Adaptive context windows based on model capabilities
const MAX_CONTEXT_MESSAGES = 10
const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES)
```

### **Directory Structure**
```
chat/
├── components/
│   ├── ChatForm.vue          # Main chat interface & management
│   ├── MarkdownRenderer.vue  # Rich text rendering component
│   └── ErrorBoundary.vue     # Error handling and recovery
├── composables/
│   ├── useDefaultModel.ts    # Default model configuration
│   └── useModels.ts          # Model management composable
├── pages/
│   └── index.vue             # Application entry point
├── server/
│   ├── api/
│   │   ├── chat.post.ts      # Multi-modal AI API integration
│   │   └── models.get.ts     # Dynamic model capability detection
│   └── middleware/
│       ├── rate-limit.ts     # Rate limiting protection
│       └── validate-request.ts # Request validation middleware
├── utils/
│   └── dateUtils.ts          # Date formatting utilities
├── assets/
│   └── css/
│       └── tailwind.css      # Global styling
├── cypress/
│   ├── e2e/                  # End-to-end test suites
│   └── TESTING_STRATEGY.md   # Testing approach documentation
├── nuxt.config.ts            # Nuxt configuration with security headers
└── package.json              # Dependencies & scripts
```

## 🔧 Advanced Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | Your API key for OpenAI-compatible service | *Required* |
| `BASE_URL` | OpenAI-compatible API endpoint | `https://api.openai.com/v1` |
| `DEFAULT_MODEL` | Default model for new chats | `gpt-4o-mini` |
| `APP_NAME` | Application display name | `Conversations` |
| `DEFAULT_SYSTEM_PROMPT` | Default system prompt | *(empty)* |
| `ENABLE_IMAGE_UPLOAD` | Enable/disable image uploads | `true` |
| `MAX_IMAGE_SIZE_MB` | Maximum image upload size | `10` |

### Model Configuration

Models are dynamically loaded from the `/api/models` endpoint. To add or modify models, update the models configuration in `server/api/models.get.ts` or the model management in `composables/useModels.ts`.

## 🚀 **Key Differentiators & Competitive Advantages**

### **🏗️ Modern, Composable Architecture**
- **Nuxt 3 + Vue 3 Composition API**: Latest web technologies for performance and maintainability
- **Server-side API routes**: Secure AI model communication with client-side state management
- **Modular component design**: Reusable composables and components for easy customization

### **🤖 Multi-Modal AI Support with Unified Interface**
- **Native multimodal conversations**: Text, images, and audio in a single conversation thread
- **Vision-capable models**: Automatic model selection for image analysis tasks
- **Audio processing**: Support for voice input and audio file analysis
- **Unified content handling**: Single interface for all conversation types

### **🔌 Flexible AI Provider Architecture**
- **Provider agnostic**: Built-in support for OpenAI, Lambda AI, Anthropic, and local models
- **Zero-code switching**: Change AI providers through environment variables
- **OpenAI-compatible API**: Works with any service following OpenAI's API specification
- **Dynamic model loading**: Automatic detection of model capabilities and features

### **🧠 Intelligent Model Capability Detection**
- **Automatic model selection**: Smart recommendations based on conversation needs
- **Capability filtering**: Vision, audio, and context length-based model categorization
- **Performance optimization**: Fast vs. powerful model selection for different use cases
- **Context-aware routing**: Automatic model switching for specialized tasks

### **📊 Advanced Context Management**
- **Smart context windows**: Adaptive context management based on model capabilities
- **Frontend-driven history**: Client-side message history with intelligent truncation
- **Conversation continuity**: Seamless context preservation across sessions
- **Memory optimization**: Efficient handling of long conversations

### **💾 Comprehensive Export/Import System**
- **Full conversation portability**: Export individual chats or entire conversation history
- **Metadata preservation**: Chat settings, model preferences, and timestamps included
- **Migration support**: Automatic backward compatibility with old storage formats
- **Cross-platform compatibility**: JSON-based format for easy data portability

### **🎨 Enhanced User Experience**
- **Real-time chat management**: Intelligent chat organization with automatic fallbacks
- **Advanced markdown rendering**: Code syntax highlighting with copy functionality
- **Responsive design**: Modern, accessible UI with dark/light mode support
- **Performance optimization**: CI/CD-friendly testing and deployment optimizations

### **🔒 Enterprise-Grade Security & Reliability**
- **Comprehensive security headers**: XSS protection, clickjacking prevention, CSP enforcement
- **Rate limiting & abuse prevention**: 30 requests/minute per IP with automatic cleanup
- **Input validation & sanitization**: Server-side validation with XSS protection via DOMPurify
- **Secure file handling**: Safe base64 encoding with size limits and signature validation
- **Comprehensive testing**: 46+ E2E tests covering functionality, security, and performance
- **CI/CD optimization**: Built-in GitHub Actions for reliable deployment and security validation

## 🛡️ Enterprise Security Features

### **Security Headers & Protection**
- **Comprehensive Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Content Security Policy**: Strict CSP with frame-ancestors 'none' for clickjacking protection
- **Permissions Policy**: Restricts camera, microphone, and geolocation access
- **Referrer Policy**: Strict origin control for privacy protection

### **API Security & Rate Limiting**
- **Server-side API Keys**: API keys stored server-side only with no client exposure
- **Rate Limiting**: 30 requests per minute per IP to prevent abuse
- **Request Validation**: Content-Type and size validation (10MB max)
- **Input Sanitization**: XSS protection with DOMPurify and server-side validation

### **File Upload Security**
- **Safe File Handling**: Secure base64 encoding with size limits and validation
- **Type Validation**: Strict image file type checking
- **Size Limits**: Configurable maximum file size (default: 10MB)
- **Signature Validation**: File signature verification for security

### **Testing & Validation**
- **Security Testing**: 16 comprehensive security tests covering all protection mechanisms
- **Automated Validation**: GitHub Actions integration for continuous security verification
- **Environment Isolation**: Different security configurations for dev/prod environments

## 🎨 Customization

### Styling
The app uses Tailwind CSS for styling. Modify `assets/css/tailwind.css` or component classes to customize the appearance.

### Models
Add or remove models by editing the `modelOptions` array in `ChatForm.vue`.

### API Integration
The OpenAI-compatible API integration spans multiple files:
- `server/api/chat.post.ts` - Main chat endpoint with request handling
- `server/api/models.get.ts` - Available models endpoint
- `composables/useModels.ts` - Client-side model management

Modify these files to:
- Add custom parameters or streaming responses
- Implement additional error handling
- Extend model configurations
- Support different API providers

## 📚 Technologies Used

- **[Nuxt 4](https://nuxt.com/)** - Full-stack Vue framework with SSR
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Nuxt UI](https://ui.nuxt.com/)** - Beautiful, accessible UI component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Marked](https://marked.js.org/)** - Markdown parser and renderer
- **[Highlight.js](https://highlightjs.org/)** - Syntax highlighting for code blocks
- **[DOMPurify](https://github.com/cure53/DOMPurify)** - XSS sanitizer for safe HTML rendering
- **[OpenAI SDK](https://github.com/openai/openai-node)** - Universal API client for OpenAI-compatible services
- **[Cypress](https://cypress.io/)** - End-to-end testing framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support & Testing

### Troubleshooting
If you encounter any issues:

1. **Check Browser Console** - Look for JavaScript errors or network issues
2. **Verify Configuration** - Ensure your `.env` file has all required variables
3. **Validate API Key** - Test your API key is active and has credits/access
4. **Review Server Logs** - Check Nuxt console output for detailed error information
5. **Run Tests** - Execute `npm run test:functionality` to verify core features

### Testing
Run the comprehensive test suite to verify functionality:
```bash
npm run test:functionality  # Core feature tests
npm run test:security      # Security validation tests
npm run test:e2e           # Full end-to-end tests
```

**Testing Strategy**: See `cypress/TESTING_STRATEGY.md` for detailed information about how security tests work across different environments (development, static build, and production deployment).

### 🚀 **Automated Testing with GitHub Actions**

The project includes automated testing via GitHub Actions that run on every push and pull request.

#### **Workflow Features**
- **Automatic Execution**: Runs on every push to `main`/`develop` and all PRs
- **Complete Test Coverage**: All 46+ tests (30+ functionality + 16 security)
- **Build Verification**: Ensures the application builds successfully
- **Failure Artifacts**: Captures screenshots and videos on test failures
- **Detailed Reporting**: Provides comprehensive test result summaries

#### **Setup Requirements**
1. **Repository Secrets** (optional):
   - `API_KEY`: Your API key for testing (if needed)
   - `BASE_URL`: Your API endpoint for testing

2. **Branch Protection** (recommended):
   - Require status checks to pass before merging
   - Enable "Require branches to be up to date"

#### **Test Coverage Areas**
- **Chat Management**: Creation, deletion, selection, search
- **File Upload**: Image processing, validation, security
- **Export/Import**: Data persistence and migration
- **Markdown Rendering**: Content display and syntax highlighting
- **Error Handling**: API failures and edge cases
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Large messages and rapid interactions
- **Security**: XSS protection, input validation, file security, rate limiting

#### **Workflow File Location**
```
.github/workflows/cypress-tests.yml
```

For API-related issues, refer to your provider's documentation:
- [Lambda AI](https://docs.lambda.ai/)
- [OpenAI](https://platform.openai.com/docs)
- [Anthropic](https://docs.anthropic.com/)
- [Ollama](https://github.com/ollama/ollama)

## 🔮 Roadmap

### ✅ **Completed Features & Competitive Advantages**
- ✅ **Multi-modal conversations** - Text, images, and audio in unified interface
- ✅ **Provider-agnostic architecture** - Support for any OpenAI-compatible API
- ✅ **Intelligent model selection** - Automatic capability detection and recommendations
- ✅ **Advanced context management** - Smart context windows and memory optimization
- ✅ **Comprehensive export/import** - Full conversation portability with metadata
- ✅ **Modern tech stack** - Nuxt 4 + Vue 3 + TypeScript for performance
- ✅ **Enterprise security** - Comprehensive security headers, rate limiting, input validation
- ✅ **Real-time chat management** - Intelligent organization with automatic fallbacks
- ✅ **Security middleware** - Rate limiting, request validation, and abuse prevention
- ✅ **Error handling** - Graceful error recovery with user-friendly messages

### 🚀 **Upcoming Features & Market Expansion**
- [ ] **Response Streaming** - Real-time token streaming for faster perceived response times
- [ ] **Model Comparison** - Side-by-side comparison interface for different AI models
- [ ] **Usage Analytics** - Dashboard tracking chat metrics, model usage, and costs
- [ ] **Chat Templates** - Pre-defined prompts and conversation starters
- [ ] **Conversation Threading** - Branching conversations and alternative responses
- [ ] **API Rate Limiting** - Built-in rate limiting and quota management
- [ ] **Plugin System** - Extensible architecture for custom integrations
- [ ] **Mobile App** - Native mobile applications for iOS and Android
- [ ] **Multi-agent conversations** - Different AI models collaborating in single threads
- [ ] **Real-time collaboration** - Team-based conversation sharing and editing
- [ ] **Advanced analytics** - Conversation insights and AI model performance metrics
- [ ] **Enterprise integrations** - SSO, team management, and compliance features

---

Made with ❤️ using Nuxt 4 and OpenAI-compatible APIs