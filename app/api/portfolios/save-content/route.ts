import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { withCSRFProtection } from "@/libs/utils/csrf";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";

/**
 * POST /api/portfolios/save-content - Saves client-generated content to the portfolio
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

            // Get data from the request body
            const body = await validatedReq.json();
            const { portfolioId, content, html } = body;

            if (!portfolioId) {
                return createErrorResponse(
                    "Portfolio ID is required",
                    requestId,
                    400,
                );
            }

            // Verify the portfolio belongs to the user
            const { data: portfolioData, error: fetchError } = await supabase
                .from("portfolio")
                .select("id, user_id")
                .eq("id", portfolioId)
                .single();

            if (fetchError || !portfolioData) {
                return createErrorResponse(
                    fetchError?.message || "Portfolio not found",
                    requestId,
                    404,
                );
            }

            if (portfolioData.user_id !== userId) {
                return createErrorResponse(
                    "Unauthorized access to portfolio",
                    requestId,
                    403,
                );
            }

            try {
                // Upload the portfolio content JSON
                if (content) {
                    await uploadPortfolioFileInBucket({
                        portfolioId,
                        content,
                        filename: `content-${portfolioId}.json`,
                        contentType: "application/json",
                        dbColKeyPrefix: "content",
                    });
                }

                // Upload the HTML template
                if (html) {
                    await uploadPortfolioFileInBucket({
                        portfolioId,
                        content: html,
                        filename: `template-${portfolioId}.html`,
                        contentType: "text/html",
                        dbColKeyPrefix: "html",
                    });
                }

                return createSuccessResponse(
                    {
                        portfolioId,
                        success: true,
                        message: "Portfolio content saved successfully",
                    },
                    requestId,
                );
            } catch (error) {
                console.error("Error saving portfolio content:", error);
                return createErrorResponse(
                    `Failed to save portfolio content. ${error}`,
                    requestId,
                    500,
                );
            }
        };

        const protectedHandler = await withCSRFProtection(handler);

        return protectedHandler(req);
    },
);
