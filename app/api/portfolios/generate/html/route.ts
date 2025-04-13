import {
    HTML_PROMPT_OUTPUT_SCHEMA,
    htmlGenPrompt,
} from "@/libs/constants/html-gen-prompt";
import { getAIClient } from "@/libs/utils/ai-client";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
import { streamObject } from "ai";

/**
 * POST /api/portfolios/generate/html - Generate HTML with placeholders based on JSON content
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        const { portfolioId, templateId } = await req.json();

        if (!portfolioId) {
            return createErrorResponse(
                "Portfolio ID is required",
                requestId,
                400,
            );
        }

        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const llmClient = getAIClient();
        const supabase = auth.supabase;

        // Get the portfolio details and user info
        const { data: portfolioData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("content_url, user_id, id")
            .eq("id", portfolioId)
            .single();

        if (fetchError || !portfolioData) {
            return createErrorResponse(
                "Portfolio not found. Please generate a portfolio first.",
                requestId,
                404,
            );
        }

        // Verify the requested portfolioId matches the authenticated user
        if (portfolioData?.user_id !== auth.userId) {
            return createErrorResponse(
                "Unauthorized: Cannot access another user's data",
                requestId,
                403,
            );
        }

        // Fetch the JSON content from the URL
        let jsonContent: Record<string, unknown>;
        try {
            if (!portfolioData.content_url) {
                return createErrorResponse(
                    "No content URL found. Please generate content first.",
                    requestId,
                    404,
                );
            }

            const response = await fetch(portfolioData.content_url);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch content: ${response.statusText}`,
                );
            }
            jsonContent = await response.json();
        } catch (error) {
            return createErrorResponse(
                `Failed to fetch JSON content: ${error}`,
                requestId,
                500,
            );
        }

        // Create a prompt for the AI to generate HTML with placeholders

        try {
            // Generate the HTML using the Vercel AI SDK
            const { partialObjectStream } = await streamObject({
                model: llmClient,
                messages: htmlGenPrompt({
                    content: JSON.stringify(jsonContent, null, 2),
                    templateId,
                }),
                schema: HTML_PROMPT_OUTPUT_SCHEMA,
            });

            // Consume the stream to get the full object
            let htmlResponse: { html?: string } | null = null;

            for await (const partial of partialObjectStream) {
                htmlResponse = partial;
            }

            if (!htmlResponse || !htmlResponse.html) {
                throw new Error("No valid HTML content in response");
            }

            // Success path - we have valid HTML template
            const htmlTemplate = htmlResponse.html;

            // Upload the HTML template
            const uploadResult = await uploadPortfolioFileInBucket({
                portfolioId,
                content: htmlTemplate,
                filename: `template-${portfolioId}.html`,
                contentType: "text/html",
                dbColKeyPrefix: "html",
            });

            return createSuccessResponse(
                {
                    html: htmlTemplate,
                    deployUrl: uploadResult.publicUrl,
                    success: uploadResult.success,
                    message:
                        uploadResult.error ||
                        "Portfolio HTML template generated successfully",
                },
                requestId,
            );
        } catch (error) {
            return createErrorResponse(
                `Failed to generate HTML template. Please try again. ${error}`,
                requestId,
                500,
            );
        }
    },
);
