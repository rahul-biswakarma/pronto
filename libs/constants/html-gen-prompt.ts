import type { CoreMessage } from "ai";
import { z } from "zod";
import { getImageTemplatePrompt } from "../utils/image-prompts";

// Define the output schema using Zod - simple string output schema
export const HTML_PROMPT_OUTPUT_SCHEMA = z.object({
    html: z
        .string()
        .describe(
            "Complete, valid HTML+CSS code for a professional portfolio website using placeholder keys",
        ),
});

export const htmlGenPrompt = ({
    content,
    templateId,
}: {
    content: string;
    templateId: string;
}): CoreMessage[] => {
    return [
        {
            role: "system",
            content: `You are an expert HTML and CSS developer specializing in creating professional portfolio websites. Your task is to generate complete, valid HTML+CSS code based on the provided resume content and design reference.

INSTRUCTIONS:
1. Create a pixel-perfect implementation of the design reference provided
2. Follow a one-to-one mapping for ALL design elements:
   - Colors (exact hex/rgb values from the design)
   - Typography (font families, sizes, weights, line heights)
   - Spacing (margins, paddings, gaps)
   - Layout structure (sections, containers, grid/flexbox)

3. Use Google Fonts for typography:
   - Select font families that best match the design reference
   - Include proper Google Font import links in the <head> section
   - Implement correct font-family, font-weight, and font-size properties

4. Integrate the provided resume content:
   - Use actual content from the resume for all text elements
   - Ensure proper semantic HTML5 structure (<header>, <main>, <section>, etc.)
   - Include appropriate accessibility attributes

5. Create responsive design:
   - Use modern CSS techniques (flexbox/grid)
   - Include media queries for different viewport sizes
   - Ensure mobile-friendly layout

6. Optimize for direct rendering in an iframe:
   - Self-contained HTML file with internal CSS
   - No external dependencies except Google Fonts
   - No JavaScript required (pure HTML/CSS solution)

The output should be complete, valid HTML that can be directly rendered in a browser with no additional processing.`,
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Generate a complete HTML/CSS portfolio website based on the following:

1. RESUME CONTENT:
Below is the resume/CV content to incorporate into the portfolio design. Use this information to fill all text sections of the portfolio:

${content}

2. DESIGN REFERENCE:
I'm providing a design template reference. Your implementation should precisely follow:
- Exact color palette used in the design
- Typography (match font styles, sizes, weights as closely as possible)
- Layout structure and proportions
- Visual hierarchy and spacing

3. OUTPUT REQUIREMENTS:
- Generate complete, valid HTML5 with internal CSS
- Include Google Fonts that best match the design
- Ensure the portfolio is responsive and works on all devices
- Your code should be directly renderable in an iframe without any external dependencies (except Google Fonts)
- Use semantic HTML markup for accessibility

Please provide the complete HTML file with all necessary CSS included (internal styles).
`,
                },
                getImageTemplatePrompt(templateId), // This includes image reference or description
            ],
        },
    ];
};
