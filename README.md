# Pronto

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# PDF Text Extractor & Summarizer

This application allows you to:
- Upload PDF files
- Extract text content from PDFs
- Generate AI summaries of the extracted text using LLMs

## Features

- Client-side PDF parsing using PDF.js
- AI text summarization via Vercel AI SDK
- Uses Ollama locally and DeepSeek in production
- Streaming AI responses
- Modern UI with Tailwind CSS
- Comprehensive rate limiting with Upstash Redis
- Structured logging with Pino
- RESTful API with standardized responses

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) for package management
- [Ollama](https://ollama.com/download) for local LLM usage

### Setup Ollama (Local Development)

Run the setup script to install the required model:

```bash
./setup-ollama.sh
```

Make sure the Ollama service is running in the background.

### Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:
- Supabase credentials
- Upstash Redis credentials (for rate limiting)
- Ollama host (for local development)
- DeepSeek API key (for production)

### Installation

```bash
# Install dependencies
bun install
```

### Running the Development Server

```bash
# Run the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Component Structure

The application follows a feature-based component architecture:

```
components/
├── features/       # Feature-specific components
│   ├── auth/       # Authentication components
│   ├── portfolio/  # Portfolio-related components
│   └── pdf-processor/ # PDF processing components
├── layouts/        # Layout components
├── providers/      # Context providers
```

### Component Naming Conventions

- PascalCase for component names
- Clear, descriptive names that indicate functionality
- One component per file
- Named exports for all components

## API Structure

The application uses a RESTful API structure:

### Portfolio Management
- `GET /api/portfolios` - Retrieve the user's portfolio
- `POST /api/portfolios` - Update the user's portfolio

### AI Interaction
- `POST /api/portfolios/chat` - Chat with AI about portfolio modifications
- `POST /api/portfolios/generate` - Generate a new portfolio

### Authentication
- `GET /api/auth/callback` - OAuth callback handler

All API endpoints include:
- Authentication via Supabase
- Rate limiting with Upstash Redis
- Structured error handling
- Comprehensive logging

## System Components

### Rate Limiting

This application implements rate limiting using Upstash Redis:

- Regular routes are limited to 10 requests per 10 seconds per IP and route
- API routes are limited to 5 requests per 10 seconds per IP and route

### Logging System

The application uses Pino for structured logging:

- Different log levels based on environment (debug in development, info in production)
- Request ID tracking for traceability
- Contextual logging with user IDs and operation details
- Configurable log level via environment variables

## Deployment

When deploying to Vercel, add all environment variables from `.env.example`.

The application will automatically use DeepSeek for AI in production and set appropriate log levels.

## How It Works

1. Upload a PDF file using the drag-and-drop interface
2. The application extracts text from the PDF using PDF.js
3. The extracted text is sent to an LLM for summarization
4. The summary and extracted text are displayed in the UI

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Upstash Redis](https://upstash.com/docs/redis)
- [Pino Logger](https://getpino.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Ollama](https://ollama.com/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
