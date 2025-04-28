"use server";

import { extractCssVariables } from "@/libs/components/editor/modes/theme-editor/utils";
import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { htmlGenPromptGemini } from "@/libs/utils/ai/html-gen-prompt-gemini";
import { checkAuthentication } from "@/libs/utils/auth";
import ShortUniqueId from "short-unique-id";
import { uploadFileInBucket } from "../utils/supabase-storage";

type GenerateHomePageActionResult = {
    success: boolean;
    websiteId?: string;
    error?: string;
    htmlPath?: string | null;
    domain?: string;
    htmlTemplate?: string | null;
    cssVariables?: { name: string; value: string }[];
};

export async function generateHomePageAction({
    content,
    templateId,
    pageType,
}: {
    content: string;
    templateId: string;
    pageType: string;
}): Promise<GenerateHomePageActionResult> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const supabase = auth.supabase;
    const userId = auth.userId;
    const domain = new ShortUniqueId({ length: 6 }).rnd().toLowerCase();

    let websiteId: string | undefined;

    try {
        const { data: createData, error: createError } = await supabase
            .from("websites")
            .insert({
                user_id: userId,
                domain,
                is_first_visit: true,
                is_published: false,
            })
            .select("id")
            .single();

        if (createError || !createData?.id) {
            throw new Error(
                `Failed to create website record: ${
                    createError?.message || "Unknown error"
                }`,
            );
        }

        websiteId = createData.id;

        if (!websiteId) {
            throw new Error("Failed to create website record");
        }

        const { success, htmlPath, error, cssVariables, htmlTemplate } =
            await generateWithGemini({
                content,
                templateId,
                websiteId,
                pageType,
            });

        if (!success || error) {
            throw new Error("Failed to generate website");
        }

        // Insert the route for the homepage
        const { error: routeError } = await supabase.from("routes").insert({
            website_id: websiteId,
            path: "/",
            html_file_path: htmlPath || "",
        });

        if (routeError) {
            throw new Error(`Failed to create route: ${routeError.message}`);
        }

        // Create a custom domain entry
        const { error: domainError } = await supabase.from("domains").insert({
            website_id: websiteId,
            domain,
            user_id: userId,
            is_custom: false,
        });

        if (domainError) {
            throw new Error(`Failed to create domain: ${domainError.message}`);
        }

        return {
            success,
            websiteId,
            htmlPath,
            htmlTemplate,
            domain,
            cssVariables,
        };
    } catch (error: unknown) {
        console.error("Server-side website generation error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown generation error";
        return {
            success: false,
            websiteId,
            error: errorMessage,
        };
    }
}

/**
 * Generate website HTML using Gemini via Vercel AI SDK
 */
async function generateWithGemini({
    content,
    templateId,
    pageType,
    websiteId,
}: {
    content: string;
    websiteId: string;
    templateId: string;
    pageType: string;
}): Promise<GenerateHomePageActionResult> {
    try {
        const geminiClient = getGeminiClient();

        const prompt = await htmlGenPromptGemini({
            content: content,
            templateId,
            pageType: pageType,
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

        const cssVariables = extractCssVariables(htmlTemplate);

        const { error: uploadError, htmlPath } = await uploadFileInBucket({
            content: htmlTemplate,
            filename: `website-${websiteId}.html`,
            contentType: "text/html",
        });

        if (uploadError) {
            throw new Error("Failed to upload website file");
        }

        return {
            success: true,
            htmlPath,
            cssVariables,
            htmlTemplate,
        };
    } catch (error: unknown) {
        console.error("Gemini generation error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown Gemini generation error";
        return {
            success: false,
            websiteId,
            error: errorMessage,
        };
    }
}
