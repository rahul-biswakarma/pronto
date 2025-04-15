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

I'm showing you a screenshot of a portfolio website design. Your task has two parts:

PART 1 - VISUAL DESIGN (from the screenshot):
- Copy the EXACT layout, structure, and visual styling from the screenshot
- Match the exact typography styles (font families, sizes, weights, line heights)
- Use the same color palette (backgrounds, text colors, accent colors)
- Replicate the exact spacing, margins, and paddings
- Copy all design elements (headers, navigation, cards, sections, etc.)
- Use Google Fonts that match the typography in the screenshot

PART 2 - CONTENT (from the provided data):
- Use ONLY the content I've provided above - DO NOT use any text content from the screenshot
- The screenshot is ONLY for visual design inspiration, not for content
- Organize the provided resume data to fit the layout structure of the template
- Make sure all of the user's resume sections and information are included
- Do not invent or make up any content not present in the provided data

Technical requirements:
1. Use semantic HTML5 and modern CSS (flexbox/grid)
2. Add appropriate meta tags and SEO optimization
3. Make the design responsive while maintaining the exact visual appearance
4. Add subtle hover effects and transitions matching the design's aesthetic
5. Use embedded CSS in <style> tags within the HTML file
6. Use Google Fonts that perfectly match the typography in the image
7. Build HTML in sections and give each section a unique ID starting with \`feno-sec\` (e.g., feno-sec-nav, feno-sec-about, feno-sec-skills)
8. Create global CSS variables with \`feno-color\` prefix for all colors used in the design (e.g., --feno-color-primary, --feno-color-background), and ensure all color references in the CSS use these variables

IMPORTANT:
- Your HTML/CSS must render visually identical to the screenshot
- The content must be 100% from the provided resume data, not from the screenshot
- Do not copy any text, headings, or content from the screenshot
- The screenshot is ONLY for layout and design reference
- The portfolio content should be organized to fit the design template's structure

Return ONLY the complete HTML document without any markdown, code blocks, or explanations.`,
                },
            ],
        },
    ];
};
