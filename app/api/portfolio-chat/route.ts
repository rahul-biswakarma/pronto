import { checkAuthentication } from "@/utils/auth";
import logger from "@/utils/logger";
import { deepseek } from "@ai-sdk/deepseek";
import { type Message, StreamingTextResponse } from "ai";
import { ollama } from "ollama-ai-provider";

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === "production";

// Initialize the appropriate client based on environment
const getAIClient = () => {
    if (isProduction) {
        // Use DeepSeek in production via OpenAI compatible API
        logger.debug("Using DeepSeek AI in production");
        return deepseek("deepseek-chat");
    }

    // Use Ollama in development (default)
    logger.debug("Using Ollama AI in development");
    return ollama("deepseek-r1:8b");
};

export const runtime = "edge";

export async function POST(req: Request) {
    const requestId = crypto.randomUUID();
    logger.info({ requestId, path: "portfolio-chat" }, "Chat request received");

    try {
        // Check authentication
        logger.debug({ requestId }, "Checking authentication");
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            logger.warn({ requestId }, "Unauthenticated request");
            return auth.errorResponse;
        }

        const userId = auth.userId;
        logger.debug({ requestId, userId }, "User authenticated");

        const client = getAIClient();

        // Get the messages sent by the client
        const { messages } = await req.json();
        logger.debug(
            { requestId, messageCount: messages.length },
            "Processing chat messages",
        );

        // Create a system prompt if one doesn't exist
        if (!messages.find((m: Message) => m.role === "system")) {
            logger.debug(
                { requestId },
                "No system message found, fetching portfolio HTML",
            );
            // Fetch current portfolio HTML
            const supabase = auth.supabase;
            const { data } = await supabase
                .from("resume_summaries")
                .select("portfolio_html")
                .eq("user_id", userId)
                .single();

            if (data?.portfolio_html) {
                logger.debug(
                    { requestId },
                    "Creating system message with portfolio HTML",
                );
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
            } else {
                logger.warn(
                    { requestId, userId },
                    "No portfolio HTML found for user",
                );
            }
        }

        // Generate a stream of tokens from the AI model
        logger.debug({ requestId }, "Generating AI response stream");
        const stream = await client.streamText({
            messages: messages as Message[],
        });

        logger.info({ requestId }, "Streaming response to client");
        // Return a streaming response
        return new StreamingTextResponse(stream);
    } catch (error) {
        logger.error(
            {
                requestId,
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
            },
            "Error in portfolio chat API",
        );

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
