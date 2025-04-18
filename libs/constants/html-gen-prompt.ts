import type Anthropic from "@anthropic-ai/sdk";
import { getImageTemplateUrl } from "../utils/image-prompts";

export const htmlGenPrompt = ({
    content,
    templateId,
}: {
    content: string;
    templateId: string;
}): Anthropic.Messages.MessageParam[] => {
    return [
        {
            role: "user",
            content: [
                {
                    type: "image",
                    source: {
                        url: getImageTemplateUrl(templateId),
                        type: "url",
                    },
                },

                {
                    type: "text",
                    text: `Here is the content of the portfolio: ${content}

I'm showing you a screenshot of a portfolio website design as a visual reference only.
Your task is to generate a COMPLETE, polished, and highly detailed HTML document (with
embedded CSS) that closely matches the layout and styling of the screenshot, but uses
ONLY the provided content.

REQUIREMENTS:
1. Structure & Modules:
   - Break the HTML into multiple modules (sections), each with a unique id (e.g., "feno-sec-intro",
     "feno-sec-about", etc.).
   - Make sure sections are always rows and never columns.
   - Also include a data-section-type attribute (e.g., data-section-type="about").
   - Omit any sections from the screenshot that are not used by the content.

2. CSS & Styling:
   - Place ALL CSS within a single <style> block in the <head>. Do not use external stylesheets.
   - Define all colors as CSS variables with the prefix "--feno-color-", and then reference
     these variables throughout the CSS (e.g., "color: var(--feno-color-primary);").
   - Minimize inline styles: only use them if absolutely necessary for small dynamic tweaks.
   - For theme consistency, define key font families, font sizes, and spacing as CSS variables when
     appropriate (e.g., --feno-font-primary, --feno-spacing-base).
   - Always define the following font family variables, and also define any other font family variables as required:
     - --feno-font-primary
     - --feno-font-italic
     - --feno-font-code

3. Layout & Visual Consistency:
   - Replicate the screenshot’s layout, structure, and visual design details. Strive to be
     pixel perfect for included modules.
   - Make the layout responsive across major breakpoints (desktop, tablet, mobile).
   - Implement any relevant hover transitions for interactive elements in your CSS.

4. Content Usage:
   - Only include data provided in "${content}". Do not invent or import extraneous text.
   - If a design element in the screenshot (e.g., a testimonial section) has no corresponding
     data, omit it gracefully from the final HTML.

5. Final Output:
   - Return the complete HTML document, starting with <!DOCTYPE html>, including a properly
     formatted <head> (with <style> block) and <body>.
   - Do not include placeholder text or screenshot text. Reference the screenshot design ONLY
     for layout/style.

Ensure the final rendered page is aesthetically accurate to the screenshot for included sections,
and that the content arrangement, styling, and responsiveness all adhere to these requirements. REMEMBER: you are a professional designer with minimum 10 years of experience in design websites. SO make sure to design and build this portfolio website with the highest possible quality. Otherwise, I will lose my job and no one will ever know about your existence.`,
                },
            ],
        },
    ];
};
