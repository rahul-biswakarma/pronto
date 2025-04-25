"use server";
import { extractCssVariables } from "@/libs/components/editor/modes/theme-editor/utils";
import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { htmlGenPromptGemini } from "@/libs/utils/ai/html-gen-prompt-gemini";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
import ShortUniqueId from "short-unique-id";

type PortfolioActionResult = {
    success: boolean;
    portfolioId?: string;
    error?: string;
    htmlPath?: string | null;
    domain?: string;
    htmlTemplate?: string | null;
    cssVariables?: { name: string; value: string }[];
};

export async function extractThemeVariables(
    htmlTemplate: string,
): Promise<Record<string, string>> {
    const themeVariables: Record<string, string> = {};

    // Find all style tags in case there are multiple
    const styleMatches = htmlTemplate.matchAll(
        /<style[^>]*>([\s\S]*?)<\/style>/g,
    );

    for (const match of styleMatches) {
        const cssContent = match[1];

        // Find all :root and html selectors that might contain variables
        const rootMatches = cssContent.matchAll(/(?::root|html)\s*{([^}]*)}/g);

        for (const rootMatch of rootMatches) {
            const rootContent = rootMatch[1];
            // More precise regex to catch variable declarations
            const variableRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+)\s*;/g;

            let varMatch: RegExpExecArray | null;
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            while ((varMatch = variableRegex.exec(rootContent)) !== null) {
                const [, name, value] = varMatch;
                themeVariables[name.trim()] = value.trim();
            }
        }
    }

    return themeVariables;
}

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
    const domain = new ShortUniqueId({ length: 6 }).rnd().toLowerCase();

    let portfolioId: string | undefined;

    try {
        const { data: createData, error: createError } = await supabase
            .from("portfolio")
            .insert({
                user_id: userId,
                content,
                domain,
                theme_variables: "{}",
            })
            .select("id")
            .single();

        if (createError || !createData?.id) {
            throw new Error(
                `Failed to create portfolio record: ${
                    createError?.message || "Unknown error"
                }`,
            );
        }

        await supabase.from("portfolio_route_map").insert({
            portfolio_id: createData?.id,
            route: "/",
            domain: domain,
        });

        const { success, htmlPath, error, cssVariables, htmlTemplate } =
            await generateWithGemini({
                content,
                templateId,
                portfolioId: createData?.id,
            });

        if (!success || error) {
            throw new Error("Failed to generate portfolio");
        }

        const themeVariables = await extractThemeVariables(htmlTemplate ?? "");

        const { error: themeVariablesError } = await supabase
            .from("portfolio")
            .update({
                theme_variables: themeVariables,
            })
            .eq("id", createData?.id);

        if (themeVariablesError) {
            throw new Error("Failed to update theme variables");
        }

        const { error: updateError } = await supabase
            .from("portfolio_route_map")
            .update({
                html_s3_path: htmlPath,
            })
            .eq("portfolio_id", createData?.id)
            .eq("domain", domain)
            .eq("route", "/");

        await supabase
            .from("portfolio")
            .update({
                theme_variables: cssVariables,
            })
            .eq("id", createData?.id);

        if (updateError) {
            throw new Error("Failed to update portfolio route map");
        }

        return { success, portfolioId: createData?.id, htmlPath, domain };
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

        const cssVariables = extractCssVariables(htmlTemplate);

        const { error: uploadError, htmlPath } =
            await uploadPortfolioFileInBucket({
                portfolioId,
                content: htmlTemplate,
                filename: `portfolio-${portfolioId}.html`,
                contentType: "text/html",
            });

        if (uploadError) {
            throw new Error("Failed to upload portfolio file");
        }

        return {
            success: true,
            portfolioId,
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
            portfolioId,
            error: errorMessage,
        };
    }
}
