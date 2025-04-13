import type { CoreMessage } from "ai";
import { z } from "zod";
import { getImageTemplatePrompt } from "../utils/image-prompts";

// Define the output schema using Zod
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
                "You are a professional web developer that creates clean, responsive HTML+CSS websites. Your task is to create an HTML template that uses placeholders instead of actual content. EVERY text element must use a placeholder that will be replaced with content from a JSON structure. No hardcoded text should appear in the final HTML.",
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `
Here is the JSON structure for a portfolio website:

${content}

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
                getImageTemplatePrompt(templateId), // This includes image reference or description
            ],
        },
    ];
};
