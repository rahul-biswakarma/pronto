"use server";

import { extractCssVariables } from "@/libs/components/editor/modes/theme-editor/utils";
import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { htmlGenPromptGemini } from "@/libs/utils/ai/html-gen-prompt-gemini";
import { checkAuthentication } from "@/libs/utils/auth";
import {
    getFileFromBucket,
    updateWebsitePublicStatus,
    uploadWebsitePage,
} from "@/libs/utils/supabase-storage";
import ShortUniqueId from "short-unique-id";
import { formatPdfData } from "../utils/ai/format-pdf-prompt";

export type Website = {
    id: string;
    domain: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    is_first_visit: boolean;
    routes?: WebsiteRoute[];
};

export type WebsiteRoute = {
    id: string;
    path: string;
    html_file_path: string;
    website_id: string;
    created_at: string;
    html_content?: string | null;
};

export type GenerateHomePageActionResult = {
    success: boolean;
    websiteId?: string;
    error?: string;
    htmlPath?: string | null;
    domain?: string;
    htmlTemplate?: string | null;
    cssVariables?: { name: string; value: string }[];
};

/**
 * Get all websites owned by the current user
 */
export async function getUserWebsites(): Promise<{
    success: boolean;
    websites?: Website[];
    error?: string;
}> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const supabase = auth.supabase;

    try {
        // Get all websites for the user
        const { data: websites, error } = await supabase
            .from("websites")
            .select("*, routes(*)")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch websites: ${error.message}`);
        }

        return {
            success: true,
            websites: websites as Website[],
        };
    } catch (error) {
        console.error("Error fetching user websites:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Get website HTML content for rendering in selectors
 */
export async function getWebsitePreviewHTML(htmlPath: string): Promise<{
    success: boolean;
    html?: string;
    error?: string;
}> {
    try {
        const { data, error } = await getFileFromBucket(htmlPath);

        if (error || !data) {
            throw error || new Error("Failed to get HTML content");
        }

        return {
            success: true,
            html: data,
        };
    } catch (error) {
        console.error("Error fetching website HTML:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Update website published status
 */
export async function setWebsitePublishStatus(
    websiteId: string,
    isPublished: boolean,
): Promise<{ success: boolean; error?: string }> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const userId = auth.userId;

    try {
        const { success, error } = await updateWebsitePublicStatus(
            userId,
            websiteId,
            isPublished,
        );

        if (!success || error) {
            throw new Error(error || "Failed to update website status");
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating website status:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Create a new route for a website
 */
export async function createWebsiteRoute(
    websiteId: string,
    path: string,
    html: string,
): Promise<{
    success: boolean;
    routeId?: string;
    htmlPath?: string;
    error?: string;
}> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const supabase = auth.supabase;
    const userId = auth.userId;

    try {
        // Normalize path to always start with /
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;

        // Normalize filename
        const filename =
            normalizedPath === "/"
                ? "index.html"
                : `${normalizedPath.substring(1).replace(/\//g, "-") || "index"}.html`;

        // Upload the HTML file
        const { success, error, filePath } = await uploadWebsitePage({
            content: html,
            filename,
            websiteId,
            userId,
        });

        if (!success || error || !filePath) {
            throw new Error(error || "Failed to upload page HTML");
        }

        // Create the route entry
        const { data: route, error: routeError } = await supabase
            .from("routes")
            .insert({
                website_id: websiteId,
                path: normalizedPath,
                html_file_path: filePath,
            })
            .select("id")
            .single();

        if (routeError || !route) {
            throw new Error(
                `Failed to create route: ${routeError?.message || "Unknown error"}`,
            );
        }

        return {
            success: true,
            routeId: route.id,
            htmlPath: filePath,
        };
    } catch (error) {
        console.error("Error creating website route:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Generate a new website homepage with AI
 */
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
                userId,
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
    userId,
}: {
    content: string;
    websiteId: string;
    templateId: string;
    pageType: string;
    userId: string;
}): Promise<GenerateHomePageActionResult> {
    try {
        const geminiClient = getGeminiClient();

        const betterContent = await formatPdfData(content);

        const prompt = await htmlGenPromptGemini({
            content: betterContent ?? content,
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

        // Upload the HTML file
        const {
            success,
            error,
            filePath: htmlPath,
        } = await uploadWebsitePage({
            content: htmlTemplate,
            filename: "index.html",
            websiteId,
            userId,
        });

        if (!success || error) {
            throw new Error(error || "Failed to upload website file");
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
