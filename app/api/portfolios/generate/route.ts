import { getAIClient } from "@/utils/ai-client";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/utils/api-response";
import { checkAuthentication } from "@/utils/auth";
import { getImageTemplatePrompt } from "@/utils/image-prompts";
import { uploadPortfolio } from "@/utils/supabase-storage";
import { type CoreMessage, streamObject } from "ai";
import { z } from "zod";

// Define the output schema using Zod
const portfolioOutputSchema = z.object({
    html: z
        .string()
        .describe(
            "Complete, valid HTML+CSS code for a professional portfolio website",
        ),
});

/**
 * POST /api/portfolios/generate - Generate a new portfolio
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        const { userId, publish = false } = await req.json();

        if (!userId) {
            return createErrorResponse("User ID is required", requestId, 400);
        }

        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        // Verify the requested userId matches the authenticated user
        if (userId !== auth.userId) {
            return createErrorResponse(
                "Unauthorized: Cannot access another user's data",
                requestId,
                403,
            );
        }

        const llmClient = getAIClient();
        const supabase = auth.supabase;

        // Get the user's resume summary
        const { data: resumeData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (fetchError || !resumeData) {
            return createErrorResponse(
                "Resume summary not found. Please generate a summary first.",
                requestId,
                404,
            );
        }

        // Create a prompt for the AI to generate a portfolio
        const promptMessages: CoreMessage[] = [
            {
                role: "system",
                content: `You are a professional web developer specializing in creating personal portfolios.
        Create a clean, professional portfolio webpage using HTML and CSS.
        The HTML should be in a single file with embedded CSS in the <style> tag.
        Include responsive design that works well on mobile and desktop.

        IMPORTANT: Study the design screenshots provided as attachments carefully and create a portfolio that follows
        a similar design style, layout structure, and visual elements. Match the color schemes, typography choices,
        and overall aesthetic of the provided images.`,
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Create a portfolio webpage for a professional with the following details:
        Name: ${resumeData.name || "Professional"}
        Professional Summary: ${resumeData.summary}
        Skills: ${Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : resumeData.skills}
        Professional Identity: ${resumeData.persona}
        Key Traits: ${Array.isArray(resumeData.personality) ? resumeData.personality.join(", ") : resumeData.personality}`,
                    },
                    getImageTemplatePrompt(),
                ],
            },
        ];

        try {
            // Generate the portfolio HTML using the newer Vercel AI SDK
            const { partialObjectStream } = await streamObject({
                model: llmClient,
                messages: promptMessages,
                schema: portfolioOutputSchema,
            });

            // Consume the stream to get the full object
            let portfolioResponse: { html?: string } | null = null;

            for await (const partial of partialObjectStream) {
                portfolioResponse = partial;
            }

            if (!portfolioResponse || !portfolioResponse.html) {
                throw new Error("No valid HTML content in response");
            }

            // Success path - we have valid HTML
            const portfolioHTML = portfolioResponse.html;

            // Upload the portfolio
            const uploadResult = await uploadPortfolio(
                userId,
                portfolioHTML,
                publish,
            );

            return createSuccessResponse(
                {
                    html: portfolioHTML,
                    deployUrl: uploadResult.publicUrl || uploadResult.url,
                    isPublic: publish,
                    success: uploadResult.success,
                    message:
                        uploadResult.error ||
                        "Portfolio generated successfully",
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
