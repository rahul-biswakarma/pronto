import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { withCSRFProtection } from "@/libs/utils/csrf";

/**
 * POST /api/portfolios/check-domain - Checks if a domain is available
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
            const { domain } = body;

            if (!domain) {
                return createErrorResponse(
                    "Missing required field: domain",
                    requestId,
                    400,
                );
            }

            // Sanitize domain
            const sanitizedDomain = domain
                .toLowerCase()
                .replace(/[^a-z0-9\-]/g, "");

            if (sanitizedDomain !== domain) {
                return createErrorResponse(
                    "Domain must only contain lowercase letters, numbers, and hyphens",
                    requestId,
                    400,
                );
            }

            const supabase = auth.supabase;

            try {
                // Check if domain exists in portfolio table
                const { data, error } = await supabase
                    .from("portfolio")
                    .select("id")
                    .eq("domain", domain);

                if (error) {
                    return createErrorResponse(error.message, requestId, 500);
                }

                // Domain is available if no matching records found
                const isAvailable = data.length === 0;

                return createSuccessResponse(
                    {
                        success: true,
                        available: isAvailable,
                        message: isAvailable
                            ? "Domain is available"
                            : "Domain is already taken",
                    },
                    requestId,
                );
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
