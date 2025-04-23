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
embedded CSS and Tailwind CSS) that closely matches the layout and styling of the screenshot, but uses
ONLY the provided content.

REQUIREMENTS:
1. CSS, Tailwind & Styling:
   - Include Tailwind CSS in the head:
     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
   - Use Tailwind CSS classes as much as possible for styling.
   - Place additional CSS within a single <style> block in the <head>.
   - Define two base color variables: "--feno-color-hue" and "--feno-color-chroma", then derive all other
     color variables from these using the OKLCH color model (e.g., "--feno-color-primary: oklch(0.7 var(--feno-color-chroma) var(--feno-color-hue));").
   - Define font families as CSS variables with the prefix "--feno-font-family-" (e.g., "--feno-font-family-primary",
     "--feno-font-family-heading") and reference these variables in the CSS / tailwindcss.
   - Use CSS variables in Tailwind classes with square bracket notation, like: bg-[var(--feno-color-bg)] or text-[var(--feno-text-primary)].
   - Do NOT use tailwind.config or attempt to override default Tailwind values - always use the CSS variable approach with square bracket notation instead.

2. Layout & Visual Consistency:
   - Replicate the screenshot's layout, structure, and visual design details using Tailwind classes.
   - Make the layout responsive across major breakpoints (desktop, tablet, mobile).
   - Implement any relevant hover transitions for interactive elements using Tailwind's hover classes.
   - Pay special attention to spacing and padding between elements to match the design shared; use Tailwind spacing utilities (p-*, m-*, gap-*) consistently.

3. Content Usage:
   - Only include data provided in "${content}". Do not invent or import extraneous text.
   - Be selective and only use the resume data that is strictly relevant to each section - the resume data is not curated and may contain unnecessary information or pdf styling info.
   - If a design element in the screenshot (e.g., a testimonial section) has no corresponding
     data, omit it gracefully from the final HTML.

4. Icons:
   - For any icons, use Tabler Icons by including this stylesheet in the <head> section:
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css" />
   - Use icons with the format: <i class="ti ti-[icon-name]"></i>, for example <i class="ti ti-home"></i>

5. Final Output:
   - Return the complete HTML document, starting with <!DOCTYPE html>, including a properly
     formatted <head> (with <style> block, Tailwind script, and icon stylesheet) and <body>.
   - Make sure output is visually accurate to the screenshot provided and logically make sense as a portfolio website that people would want to visit.
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
