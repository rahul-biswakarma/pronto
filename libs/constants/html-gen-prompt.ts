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
            content:
                "You are a professional web developer that creates clean, responsive HTML+CSS websites. Your task is to create an HTML and CSS website that looks exactly like the screenshot, Color and font should be exactly same as the screenshot, Use google fonts for the fonts. Also you will be given a JSON structure that contains all the content for the website. You will use the JSON for content, you can only use the keys from the JSON for content, you can't use any other text in the HTML. While rendering the HTML, we will replace all the JSON keys with the actual content.",
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `
Here is the JSON structure for a portfolio website:

${content}

Create a complete, responsive, and professional portfolio website HTML+CSS that uses JSON for ALL text content. JSON keys should be in the format: {{key_1}}

IMPORTANT: Every single piece of visible text that appears in the UI must use a JSON key - this includes:
- All navigation items and labels
- All button text
- All section headers and titles
- All form labels and placeholders
- Copyright notices and footer text
- ALL static text, no matter how small or seemingly fixed

IMPORTANT: DO NOT convert CSS values or properties to placeholders. CSS should remain as regular CSS with actual values:
- Keep all colors, sizes, margins, paddings as actual CSS values (not placeholders)
- Keep all CSS properties and values intact
- Only visible text content should use placeholders, not styling values

SECTION ORGANIZATION:
The HTML should be organized into clearly defined sections, each with a unique identifier:
- Each major section of the website MUST have a container element with a custom attribute: data-pronto-sec-id="pronto-sec-[section-name]"
- Example: <section data-pronto-sec-id="pronto-sec-hero">...</section>
- Use descriptive section names like: hero, about, experience, projects, skills, education, contact, footer
- Each section should be self-contained with its own styles and structure
- This organization allows for targeted updates to individual sections

<!-- BEGIN experience -->
<div class="experience-item">
  <h3>{{experience_position}}</h3> or <h3>{{item_position}}</h3>
  <p>{{experience_company}}</p> or <p>{{item_company}}</p>
  <span>Index: {{index}}</span>
</div>
<!-- END experience -->

You can also use conditional sections that only display if data exists:

<!-- IF contact_email -->
<div class="contact-email">{{contact_email_label}} {{contact_email}}</div>
<!-- ENDIF contact_email -->



Guidelines:
1. Website should look exactly like the screenshot
2. Color and font should be exactly same as the screenshot
3. Use google fonts for the fonts
4. Include all sections from the JSON
5. Include CSS directly in the HTML
6. Use semantic HTML5 elements
7. Make it mobile-friendly with media queries
13. EVERY major section must have the data-pronto-sec-id attribute

REMINDER: The ONLY hardcoded text allowed is non-visible text like comments, alt attributes for decorative images, or ARIA labels. ALL visible text must use placeholders. CSS values and properties should NOT use placeholders.

REMINDER 2: Don't use key that is not present in the JSON, if you do, it will break the website. And I know you don't do it as your are a responsible and professional developer.

The final HTML should be a complete, self-contained file that we can directly render in a browser after replacing the placeholders with actual content.
`,
                },
                getImageTemplatePrompt(templateId), // This includes image reference or description
            ],
        },
    ];
};
