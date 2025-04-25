import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { withCSRFProtection } from "@/libs/utils/csrf";

/**
 * POST /api/portfolios/create-route - Creates a new route for a portfolio
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

            // Get data from the request body
            const body = await validatedReq.json();
            const { url, domain, portfolioId } = body;

            if (!url || !domain || !portfolioId) {
                return createErrorResponse(
                    "Missing required fields: url, domain, or portfolioId",
                    requestId,
                    400,
                );
            }

            // Sanitize URL
            const sanitizedUrl = url
                .toLowerCase()
                .replace(/[^a-z0-9\-\/]/g, "")
                .replace(/^\/+/, "");

            if (sanitizedUrl !== url) {
                return createErrorResponse(
                    "URL must only contain lowercase letters, numbers, hyphens, and forward slashes, and must not start with a slash",
                    requestId,
                    400,
                );
            }

            const supabase = auth.supabase;

            try {
                const { error } = await supabase
                    .from("portfolio_route_map")
                    .insert({
                        portfolio_id: portfolioId,
                        domain: domain,
                        route: url,
                    });

                if (error) {
                    return createErrorResponse(error.message, requestId, 500);
                }

                return createSuccessResponse({ success: true }, requestId);
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                return createErrorResponse(errorMessage, requestId, 500);
            }
        };

        const protectedHandler = await withCSRFProtection(handler);
        return protectedHandler(req);
    },
);
