"use server";
import { htmlGenPrompt } from "@/libs/constants/html-gen-prompt";
import { getClaudeClient } from "@/libs/utils/ai-client";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
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

        // 4. Generate HTML template using AI SDK
        const claudeClient = getClaudeClient();

        // Initialize variables for managing potential continuation
        let responseText = "";
        let isComplete = false;
        let attemptCount = 0;
        const MAX_ATTEMPTS = 3;

        // Initial request
        let messages = htmlGenPrompt({ content: content, templateId });

        while (!isComplete && attemptCount < MAX_ATTEMPTS) {
            const textStream: MessageStream = claudeClient({
                messages: messages,
            });

            // Wait for the full response text
            const response = await textStream.withResponse();
            const currentText = await response.data.finalText();
            responseText += currentText;

            // Check if response was cut off due to token limit
            // This is an approximation - check if HTML is incomplete
            const isHtmlComplete = responseText.includes("</html>");

            if (!isHtmlComplete) {
                attemptCount++;
                // Prepare continuation request with the appropriate type
                const continuationMessages = [
                    ...messages,
                    {
                        role: "assistant" as const,
                        content: [{ type: "text" as const, text: currentText }],
                    },
                    {
                        role: "user" as const,
                        content: [
                            {
                                type: "text" as const,
                                text: "please continue the HTML",
                            },
                        ],
                    },
                ];
                messages = continuationMessages;
            } else {
                isComplete = true;
            }
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
