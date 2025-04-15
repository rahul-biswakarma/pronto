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

        const textStream: MessageStream = claudeClient({
            messages: htmlGenPrompt({ content: content, templateId }),
        }).on("text", () => {
            // TODO
        });

        // Wait for the full response text
        const responseText = await (
            await textStream.withResponse()
        ).data.finalText();

        // Parse the response content
        let htmlTemplate: string | null;
        try {
            console.log("responseText", responseText);
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
