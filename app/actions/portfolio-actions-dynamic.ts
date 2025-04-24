"use server";
import { templates } from "@/libs/constants/templates";
import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { htmlGenPromptGeminiDynamic } from "@/libs/utils/ai/html-gen-prompt-gemini-dynamic";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage-pages";
import type { SupabaseClient } from "@supabase/supabase-js";

type PageGeneratorResult = {
    success: boolean;
    pageId?: string;
    error?: string;
};

type GeneratePageParams = {
    cssVariables: string;
    templateId: string;
    url: string;
    domain: string;
    portfolioId: string;
};

function emailToUsername(email: string) {
    const localPart = email.split("@")[0];
    return localPart
        .toLowerCase()
        .replace(/[._+]/g, "-") // Replace . _ + with hyphen
        .replace(/[^a-z0-9-]/g, "") // Remove other non-alphanumerics
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, ""); // Trim hyphens at start/end
}

export async function generateDynamicPage({
    url,
    domain,
    portfolioId,
    templateId,
    cssVariables,
}: GeneratePageParams): Promise<PageGeneratorResult> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const supabase = auth.supabase;

    let pageId: string | undefined;

    try {
        // Find the template
        const template = templates.find((t) => t.id === templateId);
        if (!template) {
            throw new Error(`Template with ID ${templateId} not found`);
        }

        return await generatePageWithGemini({
            cssVariables,
            template,
            supabase,
            domain,
            url,
            portfolioId,
        });
    } catch (error: unknown) {
        console.error("Server-side page generation error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown generation error";
        return {
            success: false,
            pageId,
            error: errorMessage,
        };
    }
}

/**
 * Generate page HTML using Gemini via Vercel AI SDK
 */
async function generatePageWithGemini({
    cssVariables,
    template,
    supabase,
    domain,
    url,
    portfolioId,
}: {
    cssVariables: string;
    template: (typeof templates)[0];
    supabase: SupabaseClient;
    domain: string;
    url: string;
    portfolioId: string;
}): Promise<PageGeneratorResult> {
    try {
        const pageId = `${portfolioId}-${url}`;

        const geminiClient = getGeminiClient();

        const generationPrompt = await htmlGenPromptGeminiDynamic({
            templateId: template.id,
            cssVariables: cssVariables,
        });

        const responseText =
            (await geminiClient({ content: generationPrompt })).text ?? "";
        // // Parse the response content
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

            // Inject CSS variables into the HTML
            const styleTag = `<style>:root { ${cssVariables} }</style>`;
            htmlTemplate = htmlTemplate.replace(
                "</head>",
                `${styleTag}</head>`,
            );
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            throw new Error("Failed to generate valid HTML content");
        }
        // Upload the generated HTML
        await uploadPortfolioFileInBucket({
            portfolioId: pageId,
            content: htmlTemplate,
            filename: `page-${pageId}.html`,
            contentType: "text/html",
            dbColKeyPrefix: "html",
            pageId: pageId,
            domain,
        });

        return { success: true, pageId };
    } catch (error: unknown) {
        const pageId = `${portfolioId}-${url}`;
        console.error("Gemini generation error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown Gemini generation error";

        // Update the page status to failed
        try {
            await supabase
                .from("pages")
                .update({ status: "failed", error: errorMessage })
                .eq("id", pageId);
        } catch (updateError) {
            console.error("Failed to update page status:", updateError);
        }

        return {
            success: false,
            pageId,
            error: errorMessage,
        };
    }
}
