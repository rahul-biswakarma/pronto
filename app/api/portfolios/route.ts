import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { withCSRFProtection } from "@/libs/utils/csrf";

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

        // Get only the portfolio URL from the database, not HTML
        const { data, error } = await supabase
            .from("portfolio")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            return createErrorResponse(
                "Failed to fetch portfolio data",
                requestId,
                500,
            );
        }

        return createSuccessResponse(data[0], requestId);
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

        const res = await supabase
            .from("portfolio")
            .update({
                ...(body.content && { content: body.content }),
            })
            .eq("user_id", userId);

        if (res.error) {
            return createErrorResponse(
                res.error || "Failed to update portfolio",
                requestId,
                500,
            );
        }

        return createSuccessResponse(
            {
                success: true,
            },
            requestId,
        );
    }),
);
