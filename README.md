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

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) for package management
- [Ollama](https://ollama.com/download) for local LLM usage

### Setup Ollama (Local Development)

Run the setup script to install the required Llama3 model:

```bash
./setup-ollama.sh
```

Make sure the Ollama service is running in the background.

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Local development with Ollama
OLLAMA_HOST=http://localhost:11434

# Production variables (will be configured in Vercel)
# DEEPSEEK_API_KEY=your-deepseek-api-key
# DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

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

## Deployment

When deploying to Vercel, add the following environment variables:

- `DEEPSEEK_API_KEY`: Your DeepSeek API key
- `DEEPSEEK_API_URL`: DeepSeek API URL (default: https://api.deepseek.com/v1)

The application will automatically use DeepSeek for AI summarization in production.

## How It Works

1. Upload a PDF file using the drag-and-drop interface
2. The application extracts text from the PDF using PDF.js
3. The extracted text is sent to an LLM for summarization
4. The summary and extracted text are displayed in the UI

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Ollama](https://ollama.com/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
