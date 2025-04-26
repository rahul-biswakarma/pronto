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
    pageType,
}: {
    content: string;
    templateId: string;
    pageType: string;
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
    const promptText = `Your goal is to generate a complete ${pageType} website.

Here is the data using which we have to build this page:
${content}

I'm showing you a screenshot of a ${pageType} design. Use this screenshot ONLY as a visual reference for layout and styling.

REQUIREMENTS:
1. Generate a COMPLETE HTML document with no comments.
3. Only refer to the attached screenshot for design inspiration and layout.
4. Only use relevant data from the provided content—ignore any styling info or extraneous text.
5. CSS, Tailwind & Styling:
   - Include Tailwind CSS: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
   - Use Tailwind CSS classes extensively.
   - Place additional CSS in a single <style> block in <head>.
   - Define two base color variables: "--feno-color-hue" and "--feno-color-chroma", derive all other colors using the OKLCH color model.
   - Define font families as CSS variables with "--feno-font-family-" prefix.
   - Use CSS variables in Tailwind classes with square bracket notation.
   - DO NOT use HTML-like tags for configuration or attempt to override Tailwind defaults.
6. Layout & Visual Consistency:
   - Match the screenshot's layout and structure using Tailwind classes.
   - Make the layout responsive.
   - Implement hover transitions for interactive elements.
7. Icons:
   - Use Tabler Icons: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css" />
   - Format: <i class="ti ti-[icon-name]"></i>
8. Final Output:
   - Return complete HTML starting with <!DOCTYPE html>
   - Include properly formatted <head> and <body>
   - Ensure visual accuracy to the screenshot

Do not include any content not found in the provided data.`;

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
