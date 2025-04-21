import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { withCSRFProtection } from "@/libs/utils/csrf";

/**
 * POST /api/portfolios - Updates the user's portfolio
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

            // Get the HTML from the request body
            const body = await validatedReq.json();

            const res = await supabase
                .from("portfolio")
                .insert({
                    ...(body.content && { content: body.content }),
                    user_id: userId,
                })
                .select();

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
                    portfolioId: res.data[0].id,
                },
                requestId,
            );
        };

        const protectedHandler = await withCSRFProtection(handler);
        return protectedHandler(req);
    },
);
