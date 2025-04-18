"use server";
import { htmlGenPrompt } from "@/libs/constants/html-gen-prompt";
import { htmlGenPromptGemini } from "@/libs/constants/html-gen-prompt-gemini";
import { getClaudeClient, getGeminiClient } from "@/libs/utils/ai-client";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
import { APIError } from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream.mjs";

type PortfolioActionResult = {
    success: boolean;
    portfolioId?: string;
    error?: string;
};

export async function generatePortfolioAction({
    content,
    templateId,
}: {
    content: string;
    templateId: string;
}): Promise<PortfolioActionResult> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const supabase = auth.supabase;
    const userId = auth.userId;

    let portfolioId: string | undefined;

    try {
        const { data: createData, error: createError } = await supabase
            .from("portfolio")
            .insert({
                user_id: userId,
                content,
            })
            .select("id")
            .single();

        if (createError || !createData?.id) {
            throw new Error(
                `Failed to create portfolio record: ${createError?.message || "Unknown error"}`,
            );
        }
        portfolioId = createData.id;

        if (!portfolioId) {
            throw new Error("Failed to create portfolio record");
        }

        return await generateWithGemini({
            content,
            templateId,
            portfolioId,
        });
    } catch (error: unknown) {
        console.error("Server-side portfolio generation error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown generation error";
        return {
            success: false,
            portfolioId,
            error: errorMessage,
        };
    }
}

/**
 * Generate portfolio HTML using Gemini via Vercel AI SDK
 */
async function generateWithGemini({
    content,
    templateId,
    portfolioId,
}: {
    content: string;
    templateId: string;
    portfolioId: string;
}): Promise<PortfolioActionResult> {
    try {
        const geminiClient = getGeminiClient();
        const prompt = await htmlGenPromptGemini({ content, templateId });

        const responseText =
            (await geminiClient({ content: prompt })).text ?? "";

        // Parse the response content
        let htmlTemplate: string | null;
        try {
            // Look for HTML content (either directly or in a code block)
            const htmlMatch = responseText.match(
                /<html[^>]*>([\s\S]*)<\/html>/i,
            );

            if (htmlMatch?.[1]) {
                htmlTemplate = `<html>${htmlMatch[1]}</html>`;
            } else {
                // If no HTML found, use the full response
                htmlTemplate = responseText;
            }

            if (!htmlTemplate) {
                throw new Error("No valid HTML content in response");
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            throw new Error("Failed to generate valid HTML content");
        }

        await uploadPortfolioFileInBucket({
            portfolioId,
            content: htmlTemplate,
            filename: `portfolio-${portfolioId}.html`,
            contentType: "text/html",
            dbColKeyPrefix: "html",
        });

        return { success: true, portfolioId };
    } catch (error: unknown) {
        console.error("Gemini generation error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown Gemini generation error";
        return {
            success: false,
            portfolioId,
            error: errorMessage,
        };
    }
}

/**
 * Generate portfolio HTML using Claude (original implementation)
 */
async function generateWithClaude({
    content,
    templateId,
    portfolioId,
}: {
    content: string;
    templateId: string;
    portfolioId: string;
}): Promise<PortfolioActionResult> {
    try {
        // 4. Generate HTML template using AI SDK
        const claudeClient = getClaudeClient("claude-3-5-sonnet-latest");

        // Initialize variables for managing potential continuation
        let responseText = "";
        let isComplete = false;
        let attemptCount = 0;
        const MAX_ATTEMPTS = 3;
        const BASE_RETRY_DELAY_MS = 1000; // Start with 1 second

        // Initial request
        let messages = htmlGenPrompt({ content: content, templateId });

        while (!isComplete && attemptCount < MAX_ATTEMPTS) {
            try {
                const textStream: MessageStream = claudeClient({
                    messages: messages,
                });

                // Wait for the full response text
                const response = await textStream.withResponse();
                const currentText = await response.data.finalText();
                responseText += currentText;

                // Check if response was cut off due to token limit or needs continuation
                const isHtmlComplete = responseText.trim().endsWith("</html>");

                if (!isHtmlComplete) {
                    attemptCount++;
                    if (attemptCount >= MAX_ATTEMPTS) {
                        throw new Error(
                            "Failed to generate complete HTML after maximum continuation attempts.",
                        );
                    }
                    // Prepare continuation request
                    messages = [
                        ...messages,
                        {
                            role: "assistant" as const,
                            content: [
                                { type: "text" as const, text: currentText },
                            ],
                        },
                        {
                            role: "user" as const,
                            content: [
                                {
                                    type: "text" as const,
                                    text: "The HTML document seems incomplete. Please continue generating the rest of the HTML, ensuring you end with the </html> tag.",
                                },
                            ],
                        },
                    ];
                } else {
                    isComplete = true; // Successfully completed
                }
            } catch (error) {
                attemptCount++;
                console.error(
                    `Attempt ${attemptCount}/${MAX_ATTEMPTS} failed:`,
                    error,
                );

                // Check for overloaded error specifically
                const isOverloaded =
                    error instanceof APIError && error.status === 429; // 429 Too Many Requests indicates rate limiting/overload

                if (attemptCount >= MAX_ATTEMPTS) {
                    // If max attempts reached, throw the last error
                    throw error;
                }

                if (isOverloaded) {
                    // Implement exponential backoff with jitter
                    const delay =
                        BASE_RETRY_DELAY_MS * 2 ** (attemptCount - 1) +
                        Math.random() * 1000;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    // For any other error, throw immediately
                    throw error;
                }
            }
        }

        if (!isComplete) {
            throw new Error(
                "Failed to generate portfolio HTML after multiple attempts.",
            );
        }

        // Parse the response content
        let htmlTemplate: string | null;
        try {
            // Look for HTML content (either directly or in a code block)
            const htmlMatch = responseText.match(
                /<html[^>]*>([\s\S]*)<\/html>/i,
            );

            if (htmlMatch?.[1]) {
                htmlTemplate = `<html>${htmlMatch[1]}</html>`;
            } else {
                // If no HTML found, use the full response
                htmlTemplate = null;
            }

            if (!htmlTemplate) {
                throw new Error("No valid HTML content in response");
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            throw new Error("Failed to generate valid HTML content");
        }

        await uploadPortfolioFileInBucket({
            portfolioId,
            content: htmlTemplate,
            filename: `portfolio-${portfolioId}.html`,
            contentType: "text/html",
            dbColKeyPrefix: "html",
        });

        return { success: true, portfolioId };
    } catch (error: unknown) {
        console.error("Claude generation error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown Claude generation error";
        return {
            success: false,
            portfolioId,
            error: errorMessage,
        };
    }
}
