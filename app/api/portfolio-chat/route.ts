import { checkAuthentication } from "@/utils/auth";
import { deepseek } from "@ai-sdk/deepseek";
import { type Message, StreamingTextResponse } from "ai";
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
        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const userId = auth.userId;
        const client = getAIClient();

        // Get the messages sent by the client
        const { messages } = await req.json();

        // Create a system prompt if one doesn't exist
        if (!messages.find((m: Message) => m.role === "system")) {
            // Fetch current portfolio HTML
            const supabase = auth.supabase;
            const { data } = await supabase
                .from("resume_summaries")
                .select("portfolio_html")
                .eq("user_id", userId)
                .single();

            if (data?.portfolio_html) {
                const systemMessage: Message = {
                    id: "system-1",
                    role: "system",
                    content: `You are a helpful assistant that helps users modify their portfolio website.
          The user already has a portfolio website with the following HTML. When they ask for changes,
          provide the complete updated HTML inside a code block with \`\`\`html and \`\`\` markers.

          Current portfolio HTML:
          \`\`\`html
          ${data.portfolio_html}
          \`\`\``,
                };

                // Insert system message at the beginning
                messages.unshift(systemMessage);
            }
        }

        // Generate a stream of tokens from the AI model
        const stream = await client.streamText({
            messages: messages as Message[],
        });

        // Return a streaming response
        return new StreamingTextResponse(stream);
    } catch (error) {
        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
            }),
            { status: 500 },
        );
    }
}
