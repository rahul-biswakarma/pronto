# Gemini AI Integration

This project now supports Google's Gemini AI model through the Vercel AI SDK.

## Setup

1. Get a Google API key from the [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Add the following environment variables to your `.env` file:
```
USE_GEMINI=true
GOOGLE_API_KEY=your_google_api_key_here
```

3. Run the development server with Bun:
```bash
bun run dev
```

## How It Works

The application will now use Gemini for portfolio HTML generation when the `USE_GEMINI` flag is set to `true` in your environment variables. If set to `false` or not set, the application will fall back to using Claude.

The implementation uses the Vercel AI SDK to handle streaming responses from Gemini, making it compatible with the existing code structure.

## Troubleshooting

If you encounter issues with Gemini:

1. Make sure your Google API key is valid and has access to the Gemini models
2. Check the console logs for specific error messages
3. Try setting `USE_GEMINI=false` to fall back to Claude for debugging purposes

## Available Models

By default, the application uses `gemini-1.5-pro-latest`, but you can modify the `getGeminiClient` function in `libs/utils/ai-client.ts` to use different models.
