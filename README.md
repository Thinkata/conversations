# Conversations - AI Chat Application

A sophisticated, responsive chat application built with Nuxt 4 for seamless interaction with AI models through OpenAI-compatible APIs. Features an advanced chat management system with support for text and multimodal conversations, persistent chat history, and a modern conversational interface.

![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.0-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-14.5-17202C?style=flat&logo=cypress&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Cypress%20Tests-2088FF?style=flat&logo=github-actions&logoColor=white)

## ✨ Features

- 🤖 **20+ AI Models** - Works with any OpenAI-compatible API (Lambda AI, OpenAI, Anthropic, local models, etc.)
- 💬 **Advanced Chat Management** - Create, organize, search, and manage multiple conversations
- 🖼️ **Multimodal Support** - Text + image conversations with vision-capable models
- 📱 **Responsive Design** - Beautiful interface that works seamlessly on desktop and mobile
- 🔒 **Secure API Handling** - Server-side API key management for enhanced security
- 📝 **Rich Markdown Rendering** - Full markdown support with syntax highlighting via highlight.js
- 📤 **File Upload Support** - Handle both image URLs and local file uploads (up to 10MB)
- 💾 **Persistent Chat History** - Local storage-based chat persistence with export functionality
- 🎨 **Modern UI** - Built with Nuxt UI and Tailwind CSS with dark/light mode support
- 🔍 **Chat Search & Filter** - Find conversations quickly with built-in search functionality
- ✅ **Comprehensive Testing** - Full E2E test suite with Cypress for reliability
- 🛡️ **Security Features** - XSS protection with DOMPurify and secure file handling

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
   BASE_URL=https://api.lambda.ai/v1
   DEFAULT_MODEL=deepseek-r1-671b
   ```
   
   **OpenAI-Compatible Services:**
   ```env
   # Lambda AI
   BASE_URL=https://api.lambda.ai/v1
   
   # OpenAI
   BASE_URL=https://api.openai.com/v1
   
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
DEFAULT_MODEL=llama3.1-8b-instruct
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

```
chat/
├── components/
│   ├── ChatForm.vue          # Main chat interface & management
│   └── MarkdownRenderer.vue  # Rich text rendering component
├── composables/
│   ├── useDefaultModel.ts    # Default model configuration
│   └── useModels.ts          # Model management composable
├── pages/
│   └── index.vue             # Application entry point
├── server/
│   └── api/
│       ├── chat.post.ts      # Lambda AI API integration
│       └── models.get.ts     # Available models endpoint
├── utils/
│   └── dateUtils.ts          # Date formatting utilities
├── assets/
│   └── css/
│       └── tailwind.css      # Global styling
├── cypress/
│   └── e2e/                  # End-to-end test suites
├── nuxt.config.ts            # Nuxt configuration
└── package.json              # Dependencies & scripts
```

## 🔧 Advanced Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | Your API key for OpenAI-compatible service | *Required* |
| `BASE_URL` | OpenAI-compatible API endpoint | `https://api.lambda.ai/v1` |
| `DEFAULT_MODEL` | Default model for new chats | `deepseek-r1-671b` |
| `APP_NAME` | Application display name | `Conversations` |
| `DEFAULT_SYSTEM_PROMPT` | Default system prompt | *(empty)* |
| `ENABLE_IMAGE_UPLOAD` | Enable/disable image uploads | `true` |
| `MAX_IMAGE_SIZE_MB` | Maximum image upload size | `10` |

### Model Configuration

Models are dynamically loaded from the `/api/models` endpoint. To add or modify models, update the models configuration in `server/api/models.get.ts` or the model management in `composables/useModels.ts`.

## 🛡️ Security

- **Server-side API Keys**: API keys are stored server-side only with no client exposure
- **XSS Protection**: DOMPurify integration prevents malicious HTML/script injection
- **Secure File Handling**: Safe base64 encoding for image uploads with size limits
- **Environment-based Config**: Sensitive configuration through environment variables
- **Comprehensive Testing**: Security-focused E2E tests validate protection mechanisms

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

### 🚀 **Automated Testing with GitHub Actions**

The project includes automated testing via GitHub Actions that run on every push and pull request.

#### **Workflow Features**
- **Automatic Execution**: Runs on every push to `main`/`develop` and all PRs
- **Complete Test Coverage**: All 47 tests (33 functionality + 14 security)
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
- **Security**: XSS protection, input validation, file security

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

### ✅ Completed Features
- ✅ Conversation history and management
- ✅ Chat export functionality  
- ✅ Custom system prompts support
- ✅ Advanced chat search and filtering
- ✅ Comprehensive E2E testing suite
- ✅ XSS protection and security hardening

### 🚀 Upcoming Features
- [ ] **Response Streaming** - Real-time token streaming for faster perceived response times
- [ ] **Model Comparison** - Side-by-side comparison interface for different AI models
- [ ] **Usage Analytics** - Dashboard tracking chat metrics, model usage, and costs
- [ ] **Chat Templates** - Pre-defined prompts and conversation starters
- [ ] **Conversation Threading** - Branching conversations and alternative responses
- [ ] **API Rate Limiting** - Built-in rate limiting and quota management
- [ ] **Plugin System** - Extensible architecture for custom integrations
- [ ] **Mobile App** - Native mobile applications for iOS and Android

---

Made with ❤️ using Nuxt 4 and OpenAI-compatible APIs