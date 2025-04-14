import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { ollama } from "ollama-ai-provider";

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === "production";
const useOllama = process.env.USE_OLLAMA === "true";

/**
 * Get an instance of the appropriate AI client based on the current environment
 * @param modelName Optional model name override
 * @returns AI client instance ready to use
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

    // Use OpenAI in development by default
    const model = modelName || "gpt-4o";
    return openai(model);
}
