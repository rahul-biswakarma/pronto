import { CONTENT_PROMPT_OUTPUT_SCHEMA } from "@/libs/constants/content-gen-prompt";
import { contentGenPrompt } from "@/libs/constants/content-gen-prompt";
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
import { withCSRFProtection } from "@/libs/utils/csrf";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
import { streamObject } from "ai";

/**
 * POST /api/portfolios - Creates the user's portfolio and generates content
 * Protected by CSRF token verification
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        const handler = async (validatedReq: Request) => {
            // Check authentication
            const auth = await checkAuthentication();
            if (!auth.authenticated) {
                return auth.errorResponse;
            }

            const userId = auth.userId;
            const supabase = auth.supabase;
            const llmClient = getAIClient();

            // Get data from the request body
            const body = await validatedReq.json();
            const { content, templateId } = body;

            // First, create a row in the portfolio table
            const { data: portfolioData, error: insertError } = await supabase
                .from("portfolio")
                .insert({
                    content: content || null,
                    user_id: userId,
                    first_view: true,
                })
                .select()
                .single();

            if (insertError || !portfolioData) {
                return createErrorResponse(
                    insertError?.message || "Failed to create portfolio",
                    requestId,
                    500,
                );
            }

            const portfolioId = portfolioData.id;

            try {
                // Generate the portfolio content as JSON using the Vercel AI SDK
                const { partialObjectStream } = await streamObject({
                    model: llmClient,
                    messages: contentGenPrompt({
                        content: content,
                        templateId,
                    }),
                    schema: CONTENT_PROMPT_OUTPUT_SCHEMA,
                });

                // Consume the stream to get the full object
                let portfolioResponse: { content?: object } | null = null;

                for await (const partial of partialObjectStream) {
                    portfolioResponse = partial as { content?: object } | null;
                }

                if (!portfolioResponse || !portfolioResponse.content) {
                    throw new Error("No valid content in response");
                }

                // Success path - we have valid JSON content
                const portfolioContent = portfolioResponse.content;

                // Convert to string for storage
                const contentString = JSON.stringify(portfolioContent, null, 2);

                // Upload the portfolio content
                await uploadPortfolioFileInBucket({
                    portfolioId,
                    content: contentString,
                    filename: `content-${portfolioId}.json`,
                    contentType: "application/json",
                    dbColKeyPrefix: "content",
                });

                // Generate the HTML using the Vercel AI SDK
                const { partialObjectStream: htmlStream } = await streamObject({
                    model: llmClient,
                    messages: htmlGenPrompt({
                        content: contentString,
                        templateId,
                    }),
                    schema: HTML_PROMPT_OUTPUT_SCHEMA,
                });

                // Consume the stream to get the full object
                let htmlResponse: { html?: string } | null = null;

                for await (const partial of htmlStream) {
                    htmlResponse = partial as { html?: string } | null;
                }

                if (!htmlResponse || !htmlResponse.html) {
                    throw new Error("No valid HTML content in response");
                }

                // Success path - we have valid HTML template
                const htmlTemplate = htmlResponse.html;

                // Upload the HTML template
                await uploadPortfolioFileInBucket({
                    portfolioId,
                    content: htmlTemplate,
                    filename: `template-${portfolioId}.html`,
                    contentType: "text/html",
                    dbColKeyPrefix: "html",
                });

                return createSuccessResponse(
                    {
                        portfolioId,
                        html: htmlTemplate,
                        success: true,
                        message:
                            "Portfolio created and HTML template generated successfully",
                    },
                    requestId,
                );
            } catch (error) {
                return createErrorResponse(
                    `Failed to generate portfolio. Please try again. ${error}`,
                    requestId,
                    500,
                );
            }
        };

        const protectedHandler = await withCSRFProtection(handler);
        return protectedHandler(req);
    },
);
