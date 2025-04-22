import { getGeminiClient } from "@/libs/utils/ai/ai-client";
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

            // Get the HTML from the request body
            const body = await validatedReq.json();

            if (!body.sectionHtml || !body.prompt || !body.sectionId) {
                return createErrorResponse(
                    "Missing required fields",
                    requestId,
                    400,
                );
            }

            // Use Gemini for HTML modification
            const geminiClient = getGeminiClient();

            const content = [
                {
                    role: "user",
                    parts: [
                        {
                            text: `You are an expert web developer assistant. I want you to modify this HTML section based on the following instructions:

INSTRUCTIONS: ${body.prompt}

THIS IS THE ORIGINAL HTML SECTION:
\`\`\`html
${body.sectionHtml}
\`\`\`

Please implement the requested changes while maintaining:
1. The same HTML structure whenever possible
2. The original section ID: "${body.sectionId}"
3. Any important classes or data attributes
4. The overall style and formatting

For any icons, please use Tabler Icons with this stylesheet:
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css" />

Example of using Tabler icons: <i class="ti ti-home"></i> for a home icon.

Return only the modified HTML for the section WITHOUT any explanation or code blocks. Do not include any markdown formatting, just the raw HTML.`,
                        },
                    ],
                },
            ];

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
