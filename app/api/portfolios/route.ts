import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/utils/api-response";
import { checkAuthentication } from "@/utils/auth";
import { withCSRFProtection } from "@/utils/csrf";
import logger from "@/utils/logger";
import { uploadPortfolio } from "@/utils/supabase-storage";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a DOMPurify instance for server-side sanitization
const window = new JSDOM("").window;
const purify = DOMPurify(window);

// Set maximum allowed size for portfolio HTML
const MAX_HTML_SIZE = 500 * 1024; // 500KB

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
 * Protected by CSRF token verification
 */
export const POST = withCSRFProtection(
    withErrorHandling(async (req: Request, requestId: string) => {
        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const userId = auth.userId;
        const supabase = auth.supabase;

        // Get the HTML from the request body
        const body = await req.json();
        const { html } = body;

        if (!html) {
            return createErrorResponse(
                "HTML content is required",
                requestId,
                400,
            );
        }

        // Validate content length
        if (html.length > MAX_HTML_SIZE) {
            return createErrorResponse(
                `HTML content exceeds maximum allowed size of ${MAX_HTML_SIZE / 1024}KB`,
                requestId,
                413, // Payload Too Large
            );
        }

        // Sanitize HTML content server-side before storage
        const sanitizedHtml = purify.sanitize(html, {
            USE_PROFILES: { html: true },
            FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
            ADD_URI_SAFE_ATTR: ["target"],
        });

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
        const uploadResult = await uploadPortfolio(
            userId,
            sanitizedHtml,
            isPublic,
        );

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
    }),
);
