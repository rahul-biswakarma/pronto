import { getImageMimeType, getImageTemplateUrl } from "./image-prompts";

// Define interface for the uploaded file
interface FileUploadResult {
    uri: string;
    mimeType: string;
}

/**
 * Generates the proper message format for Gemini API using Vercel AI SDK
 */
export const htmlGenPromptGeminiDynamic = async ({
    templateId,
    cssVariables,
}: {
    templateId: string;
    cssVariables: string;
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
    const promptText = `
        Your task is to generate a modern, responsive article HTML & CSS template that follows the layout structure shown in the screenshot while using the theme's CSS variables for styling.

        REQUIREMENTS:
        1. CSS, Tailwind & Styling:
        - Include Tailwind CSS in the head:
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        - Use Tailwind CSS classes as much as possible for styling.
        - STRICTLY use the following CSS variables for styling without modification: ${JSON.stringify(cssVariables)}.
        - Place additional CSS within a single <style> block in the <head>.
        - Do NOT use tailwind.config or attempt to override default Tailwind values - always use the CSS variable approach with square bracket notation instead.
        - Do NOT use any other CSS variables apart from the ones provided.

        1. Layout Structure:
        - Follow the exact layout and spacing shown in the screenshot
        - Maintain the same component hierarchy and positioning
        - Preserve all interactive elements and their placement

        5. Final Output:
        - Return the complete HTML document, starting with <!DOCTYPE html>, including a properly
            formatted <head> (with <style> block, Tailwind script, and icon stylesheet) and <body>.
        - Make sure output is visually accurate to the screenshot provided.
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
