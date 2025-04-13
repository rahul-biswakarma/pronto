import { getAIClient } from "@/libs/utils/ai-client";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { getImageTemplatePrompt } from "@/libs/utils/image-prompts";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
import { type CoreMessage, streamObject } from "ai";
import { z } from "zod";

// Define a flexible schema that enforces structure but not specific fields
const portfolioOutputSchema = z.object({
    content: z
        .record(
            z.string(),
            z.union([
                z.string(),
                z.number(),
                z.boolean(),
                z.array(z.any()),
                z.record(z.string(), z.any()),
            ]),
        )
        .describe(
            "JSON object containing structured content for ALL text and data in the portfolio",
        ),
});

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

        // Create a prompt for the AI to generate portfolio content as JSON
        const promptMessages: CoreMessage[] = [
            {
                role: "system",
                content:
                    "You are a professional content structuring assistant that creates clean, structured JSON content for portfolio websites based on resume data. Your goal is to extract ALL content that will appear in the UI and organize it into a logical JSON structure. This includes navigation labels, button text, section titles, and any other textual or data elements.",
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `
Here is the user's resume data:

${resumeData.content}

Please extract and structure ALL content into a JSON object for a personal portfolio website. Follow these guidelines:

1. ALL text in the UI must come from the JSON - including navigation labels, buttons, section headers, etc.
2. Create a logical hierarchy that reflects the structure of a portfolio website
3. Use descriptive key names that indicate the purpose of each content piece
4. Organize content by sections (e.g., hero, about, experience, projects, etc.)
5. For repeated elements like projects or experience items, use arrays of objects
6. Include all necessary metadata (dates, links, descriptions, etc.)
7. Add any additional content needed for a complete portfolio (e.g., CTAs, contact form labels)
8. Make sure your JSON structure is consistent and well-organized
9. Do not omit any content that would appear in the UI

Output ONLY a valid JSON object with no additional explanation. The portfolio UI will be built entirely using this JSON as its content source.`,
                    },
                    getImageTemplatePrompt(templateId), // This includes image reference or description
                ],
            },
        ];

        try {
            // Generate the portfolio content as JSON using the Vercel AI SDK
            const { partialObjectStream } = await streamObject({
                model: llmClient,
                messages: promptMessages,
                schema: portfolioOutputSchema,
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
                    deployUrl: uploadResult.publicUrl || uploadResult.url,
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
