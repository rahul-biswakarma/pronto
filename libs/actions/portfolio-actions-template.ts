"use server";

import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { htmlGenPromptGeminiDynamic } from "@/libs/utils/ai/html-gen-prompt-gemini-dynamic";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";

type PortfolioActionResult = {
    success: boolean;
    portfolioId?: string;
    error?: string;
    htmlPath?: string | null;
    domain?: string;
};

export async function generatePortfolioTemplateAction({
    templateId,
    cssVariables,
    portfolioId: portfolioIdFromParams,
    route: routeFromParams,
}: {
    templateId: string;
    cssVariables: Record<string, string>;
    portfolioId: string;
    route: string;
}): Promise<PortfolioActionResult> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const supabase = auth.supabase;
    const portfolioId = portfolioIdFromParams;

    try {
        const { success, htmlPath, error } = await generateWithGeminiTemplate({
            templateId,
            portfolioId,
            cssVariables,
            route: routeFromParams,
        });

        if (!success || error) {
            throw new Error("Failed to generate portfolio");
        }

        const { error: updateError } = await supabase
            .from("portfolio_route_map")
            .update({
                html_s3_path: htmlPath,
            })
            .eq("portfolio_id", portfolioId)
            .eq("route", routeFromParams);

        if (updateError) {
            throw new Error("Failed to update portfolio route map");
        }

        return { success, portfolioId, htmlPath };
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
async function generateWithGeminiTemplate({
    templateId,
    portfolioId,
    cssVariables,
    route,
}: {
    templateId: string;
    portfolioId: string;
    cssVariables: Record<string, string>;
    route: string;
}): Promise<PortfolioActionResult> {
    try {
        const geminiClient = getGeminiClient();

        const prompt = await htmlGenPromptGeminiDynamic({
            cssVariables: JSON.stringify(cssVariables),
            templateId,
        });

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
        const { error: uploadError, htmlPath } =
            await uploadPortfolioFileInBucket({
                portfolioId,
                content: htmlTemplate,
                filename: `portfolio-${portfolioId}-${route.split("/").join("-")}.html`,
                contentType: "text/html",
            });

        if (uploadError) {
            throw new Error("Failed to upload portfolio file");
        }
        return { success: true, portfolioId, htmlPath: htmlPath ?? null };
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
