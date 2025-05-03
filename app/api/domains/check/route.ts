import { checkDomainAvailability } from "@/libs/actions/check-domain";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api/api-response";

export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        try {
            const { domain } = await req.json();

            if (!domain) {
                return createErrorResponse(
                    "Domain is required",
                    requestId,
                    400,
                );
            }

            const result = await checkDomainAvailability(domain);

            return createSuccessResponse(result, requestId);
        } catch (_error) {
            return createErrorResponse(
                "Failed to check domain availability",
                requestId,
                500,
            );
        }
    },
);
