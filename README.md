# 🚀 AI Model Playground Frontend

A modern, responsive Next.js frontend for comparing responses from multiple AI models (OpenAI, Anthropic, xAI) in real-time. Built with Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui, and Jotai for state management.

![AI Model Playground](https://img.shields.io/badge/AI-Model%20Playground-blue?style=flat-square&logo=openai)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3+-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🔥 Real-Time Streaming
- **Character-by-character streaming** like ChatGPT
- **Multiple models streaming simultaneously**
- **Live typing indicators** and completion notifications
- **Performance metrics** (chars/sec, response time, cost tracking)
- **WebSocket-powered** real-time updates

### 🎯 Model Comparison
- **15 AI models** from OpenAI, Anthropic, and xAI
- **Side-by-side comparison** with multiple view modes
- **Advanced filtering** by provider, capability, cost, and context window
- **Session management** for organized comparisons
- **Markdown rendering** with syntax highlighting

### 📊 Analytics & History
- **Comprehensive history** with search and favorites
- **Usage analytics** and cost tracking
- **Performance insights** across models and providers
- **Export functionality** (JSON, CSV formats)
- **Detailed response metrics**

### 🎨 Modern UI/UX
- **Responsive design** (mobile-first)
- **Dark/Light mode** with system preference
- **Accessible components** with keyboard navigation
- **Real-time notifications** with toast system
- **Loading states** and error handling

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Jotai
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client
- **Markdown**: react-markdown + rehype plugins
- **Icons**: Lucide React
- **Theme**: next-themes

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **Backend API** running (configure URL in environment variables)
- **Modern browser** with WebSocket support

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-modal-playground-frontend
npm install
```

### 2. Environment Setup

Create `.env.local` file (use `.env.example` as template):

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000

# Application Configuration  
NEXT_PUBLIC_APP_NAME=AI Model Playground
NEXT_PUBLIC_APP_VERSION=1.0.0

# Note: Update API_URL and WS_URL to match your backend server address
# For production, use your actual domain (e.g., https://api.yourdomain.com)
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Backend Setup

Ensure your NestJS backend is running (URL configured in environment variables) with:
- ✅ **Model discovery endpoints** (`/models`, `/models/grouped`, etc.)
- ✅ **Session management** (`/sessions`)
- ✅ **Prompt submission** (`/prompts/:sessionId`)
- ✅ **WebSocket support** for real-time streaming
- ✅ **History endpoints** (`/prompts/history`)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page
│   └── providers.tsx       # Jotai & Theme providers
├── components/             # React components
│   ├── layout/             # Navigation & layout
│   ├── models/             # Model selection
│   ├── playground/         # Real-time comparison
│   ├── history/            # History management
│   ├── pages/              # Page components
│   └── ui/                 # shadcn/ui components
├── services/               # API service layer
│   ├── api.ts              # Base Axios config
│   ├── models.service.ts   # Model discovery
│   ├── sessions.service.ts # Session management
│   ├── prompts.service.ts  # Prompt submission
│   └── websocket.service.ts # WebSocket handling
├── stores/                 # Jotai state management
│   ├── models.store.ts     # Model data & selection
│   ├── session.store.ts    # Session & streaming state
│   ├── history.store.ts    # Comparison history
│   └── ui.store.ts         # UI state & notifications
├── hooks/                  # Custom React hooks
│   ├── use-model-data.ts   # Model data fetching
│   ├── use-session-management.ts # Session operations
│   └── use-history-data.ts # History management
├── types/                  # TypeScript interfaces
│   └── api.ts              # API response types
└── lib/                    # Utilities
    └── utils.ts            # Common utilities
```

## 🔄 API Integration

### Backend Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/models` | GET | Get all available models |
| `/models/grouped` | GET | Get models grouped by provider |
| `/models/capabilities` | GET | Get model capabilities mapping |
| `/models/stats` | GET | Get model statistics |
| `/sessions` | POST | Create new comparison session |
| `/sessions/:id` | GET | Get session details |
| `/sessions/:id` | DELETE | End session |
| `/prompts/:sessionId` | POST | Submit prompt for comparison |
| `/prompts/history` | GET | Get comparison history |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_session` | Emit | Join session room |
| `submit_prompt` | Emit | Submit prompt for streaming |
| `prompt_received` | Listen | Prompt acknowledgment |
| `model_typing` | Listen | Model typing indicators |
| `model_stream` | Listen | Real-time character streaming |
| `model_complete` | Listen | Individual model completion |
| `comparison_complete` | Listen | All models completed |
| `prompt_error` | Listen | Error handling |

## 🎮 Usage Guide

### 1. Model Selection
1. Browse available AI models (15 total)
2. Filter by provider, capability, or cost
3. Select up to 4 models for comparison
4. Click "Start Comparison" to create session

### 2. Real-Time Comparison
1. Enter your prompt in the text area
2. Watch models stream responses in real-time
3. View typing indicators and progress
4. See performance metrics as models complete

### 3. View Modes
- **Side-by-Side**: Grid layout for easy comparison
- **Stacked**: Vertical layout for detailed reading
- **Tabs**: Switch between model responses

### 4. History & Analytics
- View past comparisons with search/filter
- Add favorites for important results
- Analyze usage patterns and costs
- Export data in multiple formats

## ⚡ Performance Features

### Real-Time Streaming
- **Character-by-character** text streaming
- **Parallel processing** across multiple models
- **Live performance metrics** (210-410 chars/sec)
- **Progress tracking** with completion order

### Optimization
- **Code splitting** and lazy loading
- **Optimized re-renders** with Jotai
- **Efficient WebSocket** connection management
- **Debounced API calls** for search

### Error Handling
- **Global error boundary**
- **API error handling** in services
- **User-friendly error messages**
- **Automatic retry mechanisms**

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting (via editor)
- **Conventional commits** for git history

### Testing

```bash
npm run test         # Run tests (to be implemented)
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🌟 Key Components

### State Management (Jotai)
- **models.store.ts**: Model data, selection, and filtering
- **session.store.ts**: Session management and streaming state
- **history.store.ts**: Comparison history and favorites
- **ui.store.ts**: UI state, notifications, and theme

### Service Layer
- **Separation of concerns** between UI and API
- **Type-safe** API calls with TypeScript
- **Error handling** and retry logic
- **WebSocket management** for real-time features

### Real-Time Features
- **WebSocket service** with reconnection logic
- **Streaming state management** with Jotai
- **Character-by-character** text updates
- **Performance tracking** and metrics

## 🎯 Features in Detail

### Model Selection
- 15 AI models from 3 providers (OpenAI, Anthropic, xAI)
- Advanced filtering by capabilities, cost, context window
- Smart search across model names and descriptions
- Visual selection with provider color coding

### Real-Time Streaming
- ChatGPT-like character streaming experience
- Multiple models streaming simultaneously
- Live typing indicators and completion status
- Real-time performance metrics (chars/sec, cost, tokens)

### History Management
- Searchable comparison history
- Favorites system for important results
- Advanced filtering by date, provider, content
- Export functionality (JSON format)

### Analytics Dashboard
- Usage statistics across models and providers
- Cost tracking and token consumption
- Response time analysis
- Provider performance comparison

## 🚀 Deployment

### Build Production

```bash
npm run build
npm start
```

### Environment Variables

Ensure these are properly configured for your environment:

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000

# Production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=https://your-api-domain.com
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🛟 Support

- **Backend API Required**: Ensure the NestJS backend is running and properly configured
- **WebSocket Connection**: Required for real-time streaming
- **Modern Browser**: Chrome, Firefox, Safari, Edge latest versions
- **Environment Variables**: Check `.env.local` configuration matches your backend URL

## 🔮 Future Enhancements

- [ ] **Batch testing** with multiple prompts
- [ ] **Prompt templates** library
- [ ] **Response comparison** tools
- [ ] **Advanced analytics** with charts
- [ ] **User authentication** and profiles
- [ ] **Team collaboration** features
- [ ] **API rate limiting** visualization
- [ ] **Custom model configurations**

---

**Built with ❤️ for the AI community**

*Real-time AI model comparison made simple and powerful.*