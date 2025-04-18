import Anthropic from "@anthropic-ai/sdk";
import { type ContentListUnion, GoogleGenAI } from "@google/genai";

// For direct Claude SDK usage (not through Vercel AI SDK)
export function getClaudeClient(modelName?: string) {
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
            model: modelName || "claude-3-5-haiku-latest",
            max_tokens: 4096,
            messages: messages,
        });
    };
}

/**
 * Get an instance of the Gemini client
 * For use with Google's Gemini API directly
 * @param modelName Optional model name override
 * @returns Gemini client instance
 */
export function getGeminiClient(modelName?: string) {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY is required for Gemini client");
    }

    const client = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
    });

    return async ({ content }: { content: ContentListUnion }) => {
        return await client.models.generateContent({
            model: modelName || "gemini-2.5-pro-exp-03-25",
            contents: content,
        });
    };
}
