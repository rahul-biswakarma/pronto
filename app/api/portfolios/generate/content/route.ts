import {
    CONTENT_PROMPT_OUTPUT_SCHEMA,
    contentGenPrompt,
} from "@/libs/constants/content-gen-prompt";
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
 * POST /api/portfolios/generate - Generate a new portfolio
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        const { portfolioId, templateId } = await req.json();

        if (!portfolioId) {
            return createErrorResponse("User ID is required", requestId, 400);
        }

        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const llmClient = getAIClient();
        const supabase = auth.supabase;

        // Get the user's resume summary
        const { data: resumeData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("content, user_id, id")
            .eq("id", portfolioId)
            .single();

        if (fetchError || !resumeData) {
            return createErrorResponse(
                "Portfolio not found. Please generate a portfolio first.",
                requestId,
                404,
            );
        }

        // Verify the requested userId matches the authenticated user
        if (resumeData?.user_id !== auth.userId) {
            return createErrorResponse(
                "Unauthorized: Cannot access another user's data",
                requestId,
                403,
            );
        }

        try {
            // Generate the portfolio content as JSON using the Vercel AI SDK
            const { partialObjectStream } = await streamObject({
                model: llmClient,
                messages: contentGenPrompt({
                    content: resumeData.content,
                    templateId,
                }),
                schema: CONTENT_PROMPT_OUTPUT_SCHEMA,
            });

            // Consume the stream to get the full object
            let portfolioResponse: { content?: object } | null = null;

            for await (const partial of partialObjectStream) {
                portfolioResponse = partial;
            }

            if (!portfolioResponse || !portfolioResponse.content) {
                throw new Error("No valid content in response");
            }

            // Success path - we have valid JSON content
            const portfolioContent = portfolioResponse.content;

            // Convert to string for storage
            const contentString = JSON.stringify(portfolioContent, null, 2);

            // Upload the portfolio content
            const uploadResult = await uploadPortfolioFileInBucket({
                portfolioId,
                content: contentString,
                filename: `content-${portfolioId}.json`,
                contentType: "application/json",
                dbColKeyPrefix: "content",
            });

            return createSuccessResponse(
                {
                    content: portfolioContent,
                    deployUrl: uploadResult.publicUrl,
                    success: uploadResult.success,
                    message:
                        uploadResult.error ||
                        "Portfolio content generated successfully",
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
    },
);
