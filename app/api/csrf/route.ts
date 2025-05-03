import { withErrorHandling } from "@/libs/utils/api/api-response";
import { generateCSRFToken } from "@/libs/utils/csrf";
import logger from "@/libs/utils/logger";
import { NextResponse } from "next/server";

/**
 * GET /api/csrf - Generates a new CSRF token for the session
 * This endpoint is called by the CSRF provider component
 */
export const GET = withErrorHandling(
    async (_req: Request, requestId: string) => {
        logger.debug({ requestId }, "Generating new CSRF token");

        try {
            // Generate a new CSRF token
            const token = await generateCSRFToken();

            // Return the token in the response
            return NextResponse.json(
                { csrfToken: token },
                {
                    status: 200,
                    headers: {
                        "Cache-Control":
                            "no-store, no-cache, must-revalidate, proxy-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                },
            );
        } catch (error) {
            logger.error({ error, requestId }, "Failed to generate CSRF token");
            return NextResponse.json(
                { error: "Failed to generate CSRF token" },
                { status: 500 },
            );
        }
    },
);
