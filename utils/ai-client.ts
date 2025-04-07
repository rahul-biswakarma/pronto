import { deepseek } from "@ai-sdk/deepseek";
import { ollama } from "ollama-ai-provider";
import logger from "./logger";

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === "production";

/**
 * Get an instance of the appropriate AI client based on the current environment
 * @param modelName Optional model name override
 * @param context Optional context for logging
 * @returns AI client instance ready to use
 */
export function getAIClient(
    modelName?: string,
    context: Record<string, unknown> = {},
) {
    const logContext = {
        ...context,
        environment: isProduction ? "production" : "development",
    };

    if (isProduction) {
        // Use DeepSeek in production via OpenAI compatible API
        const model = modelName || "deepseek-chat";
        logger.debug(logContext, `Using DeepSeek AI (${model}) in production`);
        return deepseek(model);
    }

    // Use Ollama in development (default)
    const model = modelName || "deepseek-r1:8b";
    logger.debug(logContext, `Using Ollama AI (${model}) in development`);
    return ollama(model);
}
