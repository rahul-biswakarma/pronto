import { type ContentListUnion, GoogleGenAI } from "@google/genai";

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
