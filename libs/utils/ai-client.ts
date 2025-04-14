import { anthropic } from "@ai-sdk/anthropic";
import Anthropic from "@anthropic-ai/sdk";
import { ollama } from "ollama-ai-provider";

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === "production";
const useOllama = process.env.USE_OLLAMA === "true";

// For direct Claude SDK usage (not through Vercel AI SDK)
export function getClaudeClient() {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY is required for Claude client");
    }
    const anthropicClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    return ({
        messages,
    }: {
        messages: Anthropic.Messages.MessageParam[];
    }) => {
        return anthropicClient.messages.stream({
            model: "claude-3-7-sonnet-latest",
            max_tokens: 4096,
            messages: messages,
        });
    };
}

/**
 * Get an instance of the appropriate AI client based on the current environment
 * For use with Vercel AI SDK's streamText and similar functions
 * @param modelName Optional model name override
 * @returns AI client instance ready to use with Vercel AI SDK
 */
export function getAIClient(modelName?: string) {
    if (isProduction) {
        // Use Claude in production
        const model = modelName || "claude-3-7-sonnet-20250219";
        return anthropic(model);
    }

    if (useOllama) {
        // Use Ollama only when explicitly configured
        const model = modelName || "deepseek-r1:8b";
        return ollama(model);
    }

    // Use Claude in development by default
    const model = modelName || "claude-3-7-sonnet-20250219";
    return anthropic(model);
}
