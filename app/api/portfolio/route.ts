import { createSupabaseServerClient } from "@/libs/supabase/client/server";
import { supabaseOption } from "@/libs/supabase/config";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { withCSRFProtection } from "@/libs/utils/csrf";
import { getFileUrlFromBucket } from "@/libs/utils/supabase-storage";

/**
 * GET /api/portfolios - Retrieves the user's portfolio
 */
export const GET = withErrorHandling(
    async (req: Request, requestId: string) => {
        // Check authentication
        const supabase = await createSupabaseServerClient(supabaseOption);

        // Get the URL object from the request
        const url = new URL(req.url);

        // Get the 'domain' query parameter from the URL's search parameters
        const domain = url.searchParams.get("domain");

        // Get only the portfolio URL from the database, not HTML
        const { data, error } = await supabase
            .from("portfolio")
            .select("html_s3_path")
            .eq("domain", domain)
            .single();

        const htmlUrl = await getFileUrlFromBucket(data?.html_s3_path);

        if (error) {
            return createErrorResponse(
                "Failed to fetch portfolio data",
                requestId,
                500,
            );
        }

        return createSuccessResponse(
            {
                htmlUrl,
            },
            requestId,
        );
    },
);

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
                .upsert({
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
        };

        const protectedHandler = await withCSRFProtection(handler);
        return protectedHandler(req);
    },
);
