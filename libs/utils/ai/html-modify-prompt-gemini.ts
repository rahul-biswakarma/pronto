/**
 * Generates the proper message format for Gemini API to modify HTML content
 */
export const htmlModifyPromptGemini = ({
    prompt,
    htmlContent,
    isFullPage = false,
}: {
    prompt: string;
    htmlContent: string;
    isFullPage?: boolean;
}) => {
    const promptPrefix = isFullPage
        ? "I want you to modify this entire HTML page"
        : "I want you to modify this HTML section";

    return [
        {
            role: "user",
            parts: [
                {
                    text: `You are an expert web developer assistant specializing in semantic HTML, CSS, and modern web standards. ${promptPrefix} according to the following instructions, with absolute precision:

INSTRUCTIONS: ${prompt}

ORIGINAL HTML ${isFullPage ? "PAGE" : "SECTION"}:
\`\`\`html
${htmlContent}
\`\`\`

STRICT REQUIREMENTS:
1. HTML Structure & Attributes:
   - PRESERVE ALL existing HTML attributes including: id, class, data-* attributes, aria-* attributes, and event handlers
   - MAINTAIN the exact same DOM structure and element hierarchy wherever possible
   - DO NOT remove or modify any script tags, React hooks, or custom components
   - PRESERVE all existing functionality including forms, buttons, and interactive elements

2. CSS & Styling:
   - MAINTAIN all existing CSS classes especially those with tailwind prefixes or utility classes
   - Use Tailwind CSS bracket notation [var(--*)] when working with CSS variables
   - Preserve all CSS variables beginning with "--feno-" as they define critical theme properties
   - If adding new styling, follow existing patterns and use Tailwind classes over inline styles

3. Layout & Visual Consistency:
   - Ensure responsive behavior is maintained across all breakpoints (mobile, tablet, desktop)
   - Preserve all flex/grid layouts and their respective properties
   - Maintain consistent spacing, padding, and margins using existing Tailwind utilities (p-*, m-*, gap-*)

4. Content Implementation:
   - Only modify content explicitly mentioned in the instructions
   - Be selective about what you change - when in doubt, preserve the original
   - Do not invent or import additional content beyond what's requested

5. Icon Usage:
   - Use ONLY Tabler Icons with this exact stylesheet reference:
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css" />
   - Icon format: <i class="ti ti-[icon-name]"></i>

OUTPUT REQUIREMENTS:
- Return ONLY the modified HTML with NO explanations, comments, or markdown
- DO NOT wrap the HTML in code blocks, backticks, or any other formatting
- DO NOT include any non-standard or invalid HTML tags
- ENSURE the HTML is complete, valid, and properly formatted
- DO NOT add ANY comments to the HTML, not even HTML comments <!-- like this -->
- If you cannot implement a requested change while maintaining these requirements, prioritize HTML integrity

${isFullPage ? "RETURN THE ENTIRE HTML PAGE STARTING WITH <!DOCTYPE html>" : "RETURN ONLY THE MODIFIED SECTION"} EXACTLY AS IT SHOULD APPEAR.`,
                },
            ],
        },
    ];
};
