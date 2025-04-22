import { getImageMimeType, getImageTemplateUrl } from "./image-prompts";

// Define interface for the uploaded file
interface FileUploadResult {
    uri: string;
    mimeType: string;
}

/**
 * Generates the proper message format for Gemini API using Vercel AI SDK
 */
export const htmlGenPromptGemini = async ({
    content,
    templateId,
}: {
    content: string;
    templateId: string;
}) => {
    // Get image template URL
    const url = getImageTemplateUrl(templateId);

    // Fetch the remote image first
    let imageFile: FileUploadResult | null = null;
    try {
        const imageResponse = await fetch(url);
        if (!imageResponse.ok)
            throw new Error(
                `Failed to fetch image: ${imageResponse.statusText}`,
            );

        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        // Store image data for inline usage
        imageFile = {
            uri: base64Data,
            mimeType: getImageMimeType(templateId),
        };
    } catch (error) {
        console.error("Error fetching template image:", error);
        // Continue without image if there's an error
    }

    // Create prompt text
    const promptText = `Here is the content of the portfolio: ${content}

I'm showing you a screenshot of a portfolio website design as a visual reference only.
Your task is to generate a COMPLETE, polished, and highly detailed HTML document (with
embedded CSS) that closely matches the layout and styling of the screenshot, but uses
ONLY the provided content.

REQUIREMENTS:
1. Structure & Modules:
   - Break the HTML into multiple modules (sections), each with a unique id (e.g., "feno-sec-intro",
     "feno-sec-about", etc.).
   - Also include a data-section-type attribute (e.g., data-section-type="about").
   - Omit any sections from the screenshot that are not used by the content.

2. CSS & Styling:
   - Place ALL CSS within a single <style> block in the <head>. Do not use external stylesheets.
   - Define all colors as CSS variables with the prefix "--feno-color-", and then reference
     these variables throughout the CSS (e.g., "color: var(--feno-color-primary);").
   - Minimize inline styles: only use them if absolutely necessary for small dynamic tweaks.
   - For theme consistency, define key font families, font sizes, and spacing as CSS variables when
     appropriate (e.g., --feno-font-primary, --feno-spacing-base).

3. Layout & Visual Consistency:
   - Replicate the screenshot's layout, structure, and visual design details. Strive to be
     pixel perfect for included modules.
   - Make the layout responsive across major breakpoints (desktop, tablet, mobile).
   - Implement any relevant hover transitions for interactive elements in your CSS.

4. Content Usage:
   - Only include data provided in "${content}". Do not invent or import extraneous text.
   - If a design element in the screenshot (e.g., a testimonial section) has no corresponding
     data, omit it gracefully from the final HTML.

5. Icons:
   - For any icons, use Tabler Icons by including this stylesheet in the <head> section:
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css" />
   - Use icons with the format: <i class="ti ti-[icon-name]"></i>, for example <i class="ti ti-home"></i>

6. Final Output:
   - Return the complete HTML document, starting with <!DOCTYPE html>, including a properly
     formatted <head> (with <style> block) and <body>.
   - Do not include placeholder text or screenshot text. Reference the screenshot design ONLY
     for layout/style.

Ensure the final rendered page is aesthetically accurate to the screenshot for included sections,
and that the content arrangement, styling, and responsiveness all adhere to these requirements.`;

    // Create parts array
    const parts = [];

    // Add text part
    parts.push({ text: promptText });

    // Add image part if available
    if (imageFile) {
        parts.push({
            inlineData: {
                mimeType: imageFile.mimeType,
                data: imageFile.uri,
            },
        });
    }

    // Return properly formatted request
    return [
        {
            role: "user",
            parts: parts,
        },
    ];
};
