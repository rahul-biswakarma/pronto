import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/utils/api-response";
import { checkAuthentication } from "@/utils/auth";
import logger from "@/utils/logger";
import { uploadPortfolio } from "@/utils/supabase-storage";

/**
 * GET /api/portfolios - Retrieves the user's portfolio
 */
export const GET = withErrorHandling(
    async (_req: Request, requestId: string) => {
        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const userId = auth.userId;
        const supabase = auth.supabase;

        logger.debug({ requestId, userId }, "Fetching portfolio data");

        // Get the portfolio HTML from the database
        const { data, error } = await supabase
            .from("resume_summaries")
            .select("portfolio_html, portfolio_url, portfolio_public")
            .eq("user_id", userId)
            .single();

        if (error) {
            return createErrorResponse(
                "Failed to fetch portfolio data",
                requestId,
                500,
            );
        }

        return createSuccessResponse(
            {
                html: data.portfolio_html || "",
                url: data.portfolio_url || null,
                isPublic: data.portfolio_public || false,
            },
            requestId,
        );
    },
);

/**
 * POST /api/portfolios - Updates the user's portfolio
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const userId = auth.userId;
        const supabase = auth.supabase;

        // Get the HTML from the request body
        const { html } = await req.json();

        if (!html) {
            return createErrorResponse(
                "HTML content is required",
                requestId,
                400,
            );
        }

        logger.debug({ requestId, userId }, "Updating portfolio");

        // Get the current portfolio settings
        const { data: portfolioData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("portfolio_public")
            .eq("user_id", userId)
            .single();

        if (fetchError) {
            return createErrorResponse(
                "Failed to fetch portfolio settings",
                requestId,
                500,
            );
        }

        // Preserve the public/private status
        const isPublic = portfolioData?.portfolio_public || false;

        // Update the portfolio HTML in storage and the database
        const uploadResult = await uploadPortfolio(userId, html, isPublic);

        if (!uploadResult.success) {
            return createErrorResponse(
                uploadResult.error || "Failed to update portfolio",
                requestId,
                500,
            );
        }

        return createSuccessResponse(
            {
                success: true,
                url: uploadResult.publicUrl || uploadResult.url,
                isPublic,
            },
            requestId,
        );
    },
);
