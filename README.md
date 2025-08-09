# AI Response Generator

A modern, responsive web application built with Nuxt 4 for interacting with Lambda AI models. Features a clean interface with support for both text and multimodal (text + image) conversations.

![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.0-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## ✨ Features

- 🤖 **20+ Lambda AI Models** - Choose from premium models like DeepSeek R1 671B to fast options like Llama 3.2 3B
- 🖼️ **Multimodal Support** - Text + image conversations with vision-capable models
- 📱 **Responsive Design** - Beautiful interface that works on desktop and mobile
- 🔒 **Secure API Handling** - Server-side API key management for security
- 📝 **Markdown Rendering** - Rich text responses with code syntax highlighting
- 📤 **File Upload** - Support for both image URLs and local file uploads
- ⚡ **Real-time Responses** - Fast, streaming-like experience
- 🎨 **Modern UI** - Built with Nuxt UI and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Lambda AI API key

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd nuxt-responder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Lambda AI credentials:
   ```env
   LAMBDA_API_KEY=your_lambda_api_key_here
   LAMBDA_BASE_URL=https://api.lambda.ai/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run postinstall  # Prepare Nuxt
```

## 🎯 Usage

### Basic Text Chat
1. Select an AI model from the dropdown
2. Enter your prompt in the text area
3. Click "Generate Response"
4. View the markdown-rendered response

### Multimodal Chat (Text + Image)
1. Choose a vision-capable model (e.g., "Llama 3.2 11B Vision")
2. Add an image via URL or file upload
3. Enter your prompt asking about the image
4. Generate and view the response

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
nuxt-responder/
├── components/
│   └── ChatForm.vue          # Main chat interface
├── pages/
│   └── index.vue             # Home page
├── server/
│   └── api/
│       └── chat.post.ts      # Lambda AI API integration
├── assets/
│   └── css/
│       └── tailwind.css      # Styling
├── nuxt.config.ts            # Nuxt configuration
└── package.json              # Dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LAMBDA_API_KEY` | Your Lambda AI API key | *Required* |
| `LAMBDA_BASE_URL` | Lambda AI API endpoint | `https://api.lambda.ai/v1` |

### Model Configuration

Models are configured in `components/ChatForm.vue`. To add or modify models, update the `modelOptions` array:

```typescript
const modelOptions = [
  { id: 'model-id', name: 'Display Name (Description)' }
]
```

## 🛡️ Security

- API keys are stored server-side only
- No client-side exposure of sensitive credentials
- Environment-based configuration
- Secure file upload handling with base64 encoding

## 🎨 Customization

### Styling
The app uses Tailwind CSS for styling. Modify `assets/css/tailwind.css` or component classes to customize the appearance.

### Models
Add or remove models by editing the `modelOptions` array in `ChatForm.vue`.

### API Integration
The Lambda AI integration is in `server/api/chat.post.ts`. Modify this file to:
- Add custom parameters
- Implement streaming responses
- Add additional error handling

## 📚 Technologies Used

- **[Nuxt 4](https://nuxt.com/)** - Full-stack Vue framework
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Nuxt UI](https://ui.nuxt.com/)** - UI component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Marked](https://marked.js.org/)** - Markdown parser and renderer
- **[OpenAI SDK](https://github.com/openai/openai-node)** - API client for Lambda AI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify your `.env` configuration
3. Ensure your Lambda AI API key is valid
4. Check the server logs for detailed error information

For API-related issues, refer to the [Lambda AI Documentation](https://docs.lambda.ai/).

## 🔮 Roadmap

- [ ] Response streaming for real-time output
- [ ] Conversation history and management
- [ ] Response export functionality
- [ ] Custom system prompts
- [ ] Model comparison interface
- [ ] Usage analytics dashboard

---

Made with ❤️ using Nuxt 4 and Lambda AI