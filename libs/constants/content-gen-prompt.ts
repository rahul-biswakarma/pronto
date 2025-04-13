import type { CoreMessage } from "ai";
import * as z from "zod";
import { getImageTemplatePrompt } from "../utils/image-prompts";

// Define a simple but flexible schema for JSON content
export const CONTENT_PROMPT_OUTPUT_SCHEMA = z
    .object({
        content: z.record(z.string(), z.string()),
    })
    .describe(
        "Flat JSON object containing string key-value pairs for ALL text in the portfolio",
    );

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
                "You are a professional content writer and structuring assistant that creates clean, structured JSON content for portfolio websites based on resume data. Your goal is to extract ALL information  from user resume data, refer the attached screenshot, our goal is to generate a portfolio website using html that looks like the screenshot. Your first step is to generate a list of all the content that will appear in the UI and organize it into a flat key-value JSON structure. This includes navigation labels, button text, section titles, and any other textual elements.",
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `
Here is the user's resume data:

${content}

NOTE: all keys should be in snake_case

Please extract and structure ALL content into a FLAT key-value JSON object for a personal portfolio website. Follow these guidelines:

1. ALL text in the UI must come from the JSON - including navigation labels, buttons, section headers, etc.
2. Create a FLAT structure with NO nesting, NO arrays, and only string values
3. Include all necessary content (dates, links, descriptions, etc.) as separate flat key-value pairs
4. Add any additional content needed for a complete portfolio (e.g., CTAs, contact form labels)
5. Do not omit any content that would appear in the UI
6. All key should be in snake_case

Example format:
{
  "nav_home": "Home",
  "nav_about": "About Me",
  "hero_title": "John Doe",
  "hero_subtitle": "Full Stack Developer",
  "about_title": "About Me",
  "about_description": "I am a passionate developer...",
  "experience_0_title": "Senior Developer",
  "experience_0_company": "Tech Corp",
  "experience_0_dates": "2020-Present",
  "experience_1_title": "Junior Developer",
  "experience_1_company": "Startup Inc",
  "experience_1_dates": "2018-2020"
}

Output ONLY a valid flat JSON object with no additional explanation. The portfolio UI will be built using simple regex replacement of keys with these values.`,
                },
                getImageTemplatePrompt(templateId), // This includes image reference or description
            ],
        },
    ];
};
