import { createWebsite } from "@/libs/actions/create-website";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api/api-response";

export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        try {
            const { name, domain, collaboratorEmails } = await req.json();

            if (!name || !domain) {
                return createErrorResponse(
                    "Name and domain are required",
                    requestId,
                    400,
                );
            }

            const result = await createWebsite({
                name,
                domain,
                collaboratorEmails: collaboratorEmails || [],
            });

            if (!result.success) {
                return createErrorResponse(result.message, requestId, 400);
            }

            return createSuccessResponse(
                {
                    message: result.message,
                    websiteId: result.websiteId,
                },
                requestId,
                201,
            );
        } catch (error) {
            return createErrorResponse(
                `Failed to create website. ${error}`,
                requestId,
                500,
            );
        }
    },
);
