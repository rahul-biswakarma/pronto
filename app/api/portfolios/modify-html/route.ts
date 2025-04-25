import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { htmlModifyPromptGemini } from "@/libs/utils/ai/html-modify-prompt-gemini";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { withCSRFProtection } from "@/libs/utils/csrf";

/**
 * POST /api/portfolios/modify-html - Updates sections or full pages of the user's portfolio
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

            // Get the HTML from the request body
            const body = await validatedReq.json();

            if (!body.prompt) {
                return createErrorResponse(
                    "Missing required prompt field",
                    requestId,
                    400,
                );
            }

            // Check if we have section HTML or full page HTML
            if (!body.sectionHtml && !body.fullPageHtml) {
                return createErrorResponse(
                    "Missing required HTML content (either sectionHtml or fullPageHtml)",
                    requestId,
                    400,
                );
            }

            const isFullPage = !!body.fullPageHtml;
            const htmlContent = isFullPage
                ? body.fullPageHtml
                : body.sectionHtml;

            // Use Gemini for HTML modification
            const geminiClient = getGeminiClient();

            // Generate prompt using the dedicated function
            const content = htmlModifyPromptGemini({
                prompt: body.prompt,
                htmlContent,
                isFullPage,
            });

            const response = await geminiClient({ content });
            let modifiedHtml = response.text || "";

            // Clean up the response if needed (remove any markdown code blocks if present)
            modifiedHtml = modifiedHtml.replace(/^```html\n|```$/g, "");

            // Return the modified HTML
            return createSuccessResponse({ modifiedHtml }, requestId);
        };

        const protectedHandler = await withCSRFProtection(handler);
        return protectedHandler(req);
    },
);
