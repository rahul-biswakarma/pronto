import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { renderTemplate } from "@/libs/utils/render-template";

/**
 * POST /api/portfolios/preview - Generate a portfolio preview by combining HTML template with JSON data
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        const { portfolioId } = await req.json();

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

        const supabase = auth.supabase;

        // Get the portfolio details with template and content URLs
        const { data: portfolioData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("content_url, html_url, user_id, id")
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

        try {
            // Check if both template and content exist
            if (!portfolioData.html_url) {
                return createErrorResponse(
                    "No HTML template found. Please generate HTML template first.",
                    requestId,
                    404,
                );
            }

            if (!portfolioData.content_url) {
                return createErrorResponse(
                    "No content data found. Please generate content first.",
                    requestId,
                    404,
                );
            }

            // Fetch the HTML template
            const htmlResponse = await fetch(portfolioData.html_url);
            if (!htmlResponse.ok) {
                throw new Error(
                    `Failed to fetch HTML template: ${htmlResponse.statusText}`,
                );
            }
            const htmlTemplate = await htmlResponse.text();

            // Fetch the JSON data
            const jsonResponse = await fetch(portfolioData.content_url);
            if (!jsonResponse.ok) {
                throw new Error(
                    `Failed to fetch JSON data: ${jsonResponse.statusText}`,
                );
            }
            const jsonData = await jsonResponse.json();

            // Render the template with the data
            const renderedHtml = renderTemplate(htmlTemplate, jsonData);

            return createSuccessResponse(
                {
                    html: renderedHtml,
                    previewType: "combined",
                },
                requestId,
            );
        } catch (error) {
            return createErrorResponse(
                `Failed to generate portfolio preview: ${error}`,
                requestId,
                500,
            );
        }
    },
);
