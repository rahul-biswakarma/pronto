import { deepseek } from "@ai-sdk/deepseek";
import { type Message, generateText } from "ai";
import { ollama } from "ollama-ai-provider";

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === "production";

// Initialize the appropriate client based on environment
const getAIClient = () => {
    if (isProduction) {
        // Use DeepSeek in production via OpenAI compatible API
        return deepseek("deepseek-chat");
    }

    // Use Ollama in development (default)
    return ollama("deepseek-r1:8b");
};

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, content } = await req.json();

        const client = getAIClient();

        // If content is provided (PDF text), create a prompt for summarization
        const promptMessages: Message[] = content
            ? [
                  {
                      role: "system",
                      content:
                          "You are a helpful assistant that summarizes PDF content. Be concise and capture the key points.",
                  },
                  {
                      role: "user",
                      content: `Please summarize the following PDF content in a clear and structured way:\n\n${content}`,
                  },
              ]
            : messages;

        // Use the AI SDK for streaming responses

        const { text } = await generateText({
            model: client,
            messages: promptMessages,
        });

        // Return the streaming response
        return new Response(text);
    } catch (error: unknown) {
        console.error("AI processing error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to process AI request";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
