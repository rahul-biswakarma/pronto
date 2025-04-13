import type { CoreMessage } from "ai";
import { z } from "zod";
import { getImageTemplatePrompt } from "../utils/image-prompts";

// Define a flexible schema that enforces structure but not specific fields
export const CONTENT_PROMPT_OUTPUT_SCHEMA = z.object({
    content: z
        .record(
            z.string(),
            z.union([
                z.string(),
                z.number(),
                z.boolean(),
                z.array(z.any()),
                z.record(z.string(), z.any()),
            ]),
        )
        .describe(
            "JSON object containing structured content for ALL text and data in the portfolio",
        ),
});

export const contentGenPrompt = ({
    content,
    templateId,
}: {
    content: string;
    templateId: string;
}): CoreMessage[] => {
    // Create a prompt for the AI to generate portfolio content as JSON
    return [
        {
            role: "system",
            content:
                "You are a professional content structuring assistant that creates clean, structured JSON content for portfolio websites based on resume data. Your goal is to extract ALL content that will appear in the UI and organize it into a logical JSON structure. This includes navigation labels, button text, section titles, and any other textual or data elements.",
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `
Here is the user's resume data:

${content}

Please extract and structure ALL content into a JSON object for a personal portfolio website. Follow these guidelines:

1. ALL text in the UI must come from the JSON - including navigation labels, buttons, section headers, etc.
2. Create a logical hierarchy that reflects the structure of a portfolio website
3. Use descriptive key names that indicate the purpose of each content piece
4. Organize content by sections (e.g., hero, about, experience, projects, etc.)
5. For repeated elements like projects or experience items, use arrays of objects
6. Include all necessary metadata (dates, links, descriptions, etc.)
7. Add any additional content needed for a complete portfolio (e.g., CTAs, contact form labels)
8. Make sure your JSON structure is consistent and well-organized
9. Do not omit any content that would appear in the UI

Output ONLY a valid JSON object with no additional explanation. The portfolio UI will be built entirely using this JSON as its content source.`,
                },
                getImageTemplatePrompt(templateId), // This includes image reference or description
            ],
        },
    ];
};
