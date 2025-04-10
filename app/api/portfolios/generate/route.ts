import { getAIClient } from "@/utils/ai-client";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/utils/api-response";
import { checkAuthentication } from "@/utils/auth";
import logger from "@/utils/logger";
import { uploadPortfolio } from "@/utils/supabase-storage";
import { type Message, generateText } from "ai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// Define the output schema using Zod
const portfolioOutputSchema = z.object({
    html: z
        .string()
        .describe(
            "Complete, valid HTML+CSS code for a professional portfolio website",
        ),
});

// Create LangChain output parser
const outputParser = StructuredOutputParser.fromZodSchema(
    portfolioOutputSchema,
);

export const runtime = "edge";

/**
 * POST /api/portfolios/generate - Generate a new portfolio
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        const { userId, publish = false } = await req.json();
        logger.debug(
            { requestId, userId, publish },
            "Portfolio generation parameters",
        );

        if (!userId) {
            logger.warn(
                { requestId },
                "Missing user ID in portfolio generation request",
            );
            return createErrorResponse("User ID is required", requestId, 400);
        }

        // Check authentication
        logger.debug({ requestId }, "Verifying authentication");
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            logger.warn(
                { requestId },
                "Unauthenticated portfolio generation request",
            );
            return auth.errorResponse;
        }

        // Verify the requested userId matches the authenticated user
        if (userId !== auth.userId) {
            logger.warn(
                {
                    requestId,
                    requestedUserId: userId,
                    authenticatedUserId: auth.userId,
                },
                "Unauthorized access attempt to another user's data",
            );

            return createErrorResponse(
                "Unauthorized: Cannot access another user's data",
                requestId,
                403,
            );
        }

        const client = getAIClient(undefined, { requestId });
        const supabase = auth.supabase;

        // Get the user's resume summary
        logger.debug(
            { requestId, userId },
            "Fetching resume data for portfolio generation",
        );
        const { data: resumeData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (fetchError || !resumeData) {
            logger.error(
                {
                    requestId,
                    userId,
                    error: fetchError?.message,
                },
                "Resume summary not found for portfolio generation",
            );

            return createErrorResponse(
                "Resume summary not found. Please generate a summary first.",
                requestId,
                404,
            );
        }

        // Create a prompt for the AI to generate a portfolio
        logger.debug({ requestId }, "Creating prompt for portfolio generation");
        const promptMessages: Message[] = [
            {
                id: "system-1",
                role: "system",
                content: `You are a professional web developer specializing in creating personal portfolios.
        Create a clean, professional portfolio webpage using HTML and CSS only (no JavaScript).
        The HTML should be in a single file with embedded CSS in the <style> tag.
        Include responsive design that works well on mobile and desktop.
        Use a modern, professional design with a cohesive color scheme.
        The portfolio should include:
        - Header with the person's name as title
        - Professional summary section
        - Skills section with visually appealing representation
        - A professional photo placeholder (use a div with background-color)
        - Contact information section
        - Clean, readable typography
        - Sufficient whitespace and visual hierarchy

        ${outputParser.getFormatInstructions()}`,
            },
            {
                id: "user-1",
                role: "user",
                content: `Create a portfolio webpage for a professional with the following details:
        Name: ${resumeData.name || "Professional"}
        Professional Summary: ${resumeData.summary}
        Skills: ${Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : resumeData.skills}
        Professional Identity: ${resumeData.persona}
        Key Traits: ${Array.isArray(resumeData.personality) ? resumeData.personality.join(", ") : resumeData.personality}

        Please create a complete, ready-to-use HTML file with embedded CSS for a professional portfolio website.`,
            },
        ];

        // Generate the portfolio HTML
        logger.info({ requestId }, "Generating portfolio HTML");
        const { text } = await generateText({
            model: client,
            messages: promptMessages,
        });

        // Parse the output to get structured HTML
        let portfolioHTML: string;
        try {
            logger.debug({ requestId }, "Parsing AI output for portfolio HTML");
            const parsedOutput = await outputParser.parse(text);
            portfolioHTML = parsedOutput.html;
        } catch (parseError: unknown) {
            // Fallback to using the raw response if parsing fails
            logger.warn(
                {
                    requestId,
                    error:
                        parseError instanceof Error
                            ? parseError.message
                            : "Unknown error",
                },
                "Failed to parse portfolio output, using raw text",
            );

            portfolioHTML = text;
        }

        // Save the generated HTML to S3 storage
        logger.debug(
            { requestId, userId, publish },
            "Uploading portfolio to storage",
        );
        const uploadResult = await uploadPortfolio(
            userId,
            portfolioHTML,
            publish,
        );

        // We no longer save HTML in the database, only store the URL
        logger.info(
            {
                requestId,
                success: uploadResult.success,
                isPublic: publish,
            },
            "Portfolio generation completed",
        );

        return createSuccessResponse(
            {
                html: portfolioHTML,
                deployUrl: uploadResult.publicUrl || uploadResult.url,
                isPublic: publish,
                success: uploadResult.success,
                message:
                    uploadResult.error || "Portfolio generated successfully",
            },
            requestId,
        );
    },
);
