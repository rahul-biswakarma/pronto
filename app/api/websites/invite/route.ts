import { inviteCollaborators } from "@/libs/actions/invite-collaborators";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api/api-response";

export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        try {
            const { websiteId, emails } = await req.json();

            if (
                !websiteId ||
                !emails ||
                !Array.isArray(emails) ||
                emails.length === 0
            ) {
                return createErrorResponse(
                    "Website ID and at least one email are required",
                    requestId,
                    400,
                );
            }

            const result = await inviteCollaborators({
                websiteId,
                emails,
            });

            if (!result.success) {
                return createErrorResponse(result.message, requestId, 400);
            }

            return createSuccessResponse(
                {
                    message: result.message,
                },
                requestId,
                201,
            );
        } catch (_error) {
            return createErrorResponse(
                "Failed to invite collaborators",
                requestId,
                500,
            );
        }
    },
);
