import { getAIClient } from "@/libs/utils/ai-client";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import { checkAuthentication } from "@/libs/utils/auth";
import { getImageTemplatePrompt } from "@/libs/utils/image-prompts";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
import { type CoreMessage, streamObject } from "ai";
import { z } from "zod";

// Define the output schema using Zod
const htmlOutputSchema = z.object({
    html: z
        .string()
        .describe(
            "Complete, valid HTML+CSS code for a professional portfolio website using placeholder keys",
        ),
});

/**
 * POST /api/portfolios/generate/html - Generate HTML with placeholders based on JSON content
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        const { portfolioId, publish = false } = await req.json();

        if (!portfolioId) {
            return createErrorResponse(
                "Portfolio ID is required",
                requestId,
                400,
            );
        }

        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const llmClient = getAIClient();
        const supabase = auth.supabase;

        // Get the portfolio details and user info
        const { data: portfolioData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("content_url, user_id, id")
            .eq("id", portfolioId)
            .single();

        if (fetchError || !portfolioData) {
            return createErrorResponse(
                "Portfolio not found. Please generate a portfolio first.",
                requestId,
                404,
            );
        }

        // Verify the requested portfolioId matches the authenticated user
        if (portfolioData?.user_id !== auth.userId) {
            return createErrorResponse(
                "Unauthorized: Cannot access another user's data",
                requestId,
                403,
            );
        }

        // Fetch the JSON content from the URL
        let jsonContent: Record<string, unknown>;
        try {
            if (!portfolioData.content_url) {
                return createErrorResponse(
                    "No content URL found. Please generate content first.",
                    requestId,
                    404,
                );
            }

            const response = await fetch(portfolioData.content_url);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch content: ${response.statusText}`,
                );
            }
            jsonContent = await response.json();
        } catch (error) {
            return createErrorResponse(
                `Failed to fetch JSON content: ${error}`,
                requestId,
                500,
            );
        }

        // Create a prompt for the AI to generate HTML with placeholders
        const promptMessages: CoreMessage[] = [
            {
                role: "system",
                content:
                    "You are a professional web developer that creates clean, responsive HTML+CSS websites. Your task is to create an HTML template that uses placeholders instead of actual content. EVERY text element must use a placeholder that will be replaced with content from a JSON structure. No hardcoded text should appear in the final HTML.",
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `
Here is the JSON structure for a portfolio website:

${JSON.stringify(jsonContent, null, 2)}

Create a complete, responsive, and professional portfolio website HTML+CSS that uses placeholders for ALL text content. Placeholders should be in the format: {{key.subkey}}

IMPORTANT: Every single piece of text that appears in the UI must use a placeholder - this includes:
- All navigation items and labels
- All button text
- All section headers and titles
- All form labels and placeholders
- Copyright notices and footer text
- ALL static text, no matter how small or seemingly fixed

SECTION ORGANIZATION:
The HTML should be organized into clearly defined sections, each with a unique identifier:
- Each major section of the website MUST have a container element with a custom attribute: data-pronto-sec-id="pronto-sec-[section-name]"
- Example: <section data-pronto-sec-id="pronto-sec-hero">...</section>
- Use descriptive section names like: hero, about, experience, projects, skills, education, contact, footer
- Each section should be self-contained with its own styles and structure
- This organization allows for targeted updates to individual sections

For array items, you can use bracket notation:
- {{experience[0].position}}

For arrays like experience, you can also create a template for one item that we can repeat using comments:

<!-- BEGIN experience -->
<div class="experience-item">
  <h3>{{experience.position}}</h3> or <h3>{{item.position}}</h3>
  <p>{{experience.company}}</p> or <p>{{item.company}}</p>
  <span>Index: {{index}}</span> <!-- Optional: Access the current array index -->
</div>
<!-- END experience -->

You can also use conditional sections that only display if data exists:

<!-- IF contact.email -->
<div class="contact-email">{{contact.email_label}} {{contact.email}}</div>
<!-- ENDIF contact.email -->

For nested arrays, you can specify the parent index:

<!-- BEGIN experience -->
  <div class="experience-item" data-pronto-sec-id="pronto-sec-experience-item-{{index}}">
    <h3>{{experience.position}}</h3>

    <!-- IF experience.projects -->
      <div class="projects-list">
        <!-- BEGIN experience.projects {{index}} -->
          <div class="project" data-pronto-sec-id="pronto-sec-project-{{parent_index}}-{{index}}">{{item.name}}</div>
        <!-- END experience.projects -->
      </div>
    <!-- ENDIF experience.projects -->
  </div>
<!-- END experience -->

Guidelines:
1. Use modern, responsive design with clean typography and layout
2. Include all sections from the JSON
3. For array items, use either the comment-based looping mechanism shown above or individual placeholders
4. Include CSS directly in the HTML (no external files)
5. Use semantic HTML5 elements
6. Make it mobile-friendly with media queries
7. Use a clean, professional color scheme
8. Include smooth scrolling and subtle animations
9. Add appropriate icons for contact methods (no text in icons)
10. Include a navigation bar that links to each section
11. Use conditional sections for optional content
12. EVERY major section must have the data-pronto-sec-id attribute

REMINDER: The ONLY hardcoded text allowed is non-visible text like comments, alt attributes for decorative images, or ARIA labels. ALL visible text must use placeholders.

The final HTML should be a complete, self-contained file that we can directly render in a browser after replacing the placeholders with actual content.
`,
                    },
                    getImageTemplatePrompt(), // This includes image reference or description
                ],
            },
        ];

        try {
            // Generate the HTML using the Vercel AI SDK
            const { partialObjectStream } = await streamObject({
                model: llmClient,
                messages: promptMessages,
                schema: htmlOutputSchema,
            });

            // Consume the stream to get the full object
            let htmlResponse: { html?: string } | null = null;

            for await (const partial of partialObjectStream) {
                htmlResponse = partial;
            }

            if (!htmlResponse || !htmlResponse.html) {
                throw new Error("No valid HTML content in response");
            }

            // Success path - we have valid HTML template
            const htmlTemplate = htmlResponse.html;

            // Upload the HTML template
            const uploadResult = await uploadPortfolioFileInBucket({
                portfolioId,
                content: htmlTemplate,
                filename: `template-${portfolioId}.html`,
                contentType: "text/html",
                dbColKeyPrefix: "html",
            });

            return createSuccessResponse(
                {
                    html: htmlTemplate,
                    deployUrl: uploadResult.publicUrl || uploadResult.url,
                    isPublic: publish,
                    success: uploadResult.success,
                    message:
                        uploadResult.error ||
                        "Portfolio HTML template generated successfully",
                },
                requestId,
            );
        } catch (error) {
            return createErrorResponse(
                `Failed to generate HTML template. Please try again. ${error}`,
                requestId,
                500,
            );
        }
    },
);
