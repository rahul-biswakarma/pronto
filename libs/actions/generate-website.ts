"use server";

import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { initialWebsiteGenerator } from "@/libs/utils/prompts/initial-prompt";

export async function generateWebsiteHtml({
	content,
	templateId,
	pageType,
}: {
	content: string;
	templateId: string;
	pageType: string;
}) {
	try {
		// Prepare prompt for Gemini
		const messages = await initialWebsiteGenerator({
			content,
			templateId,
			pageType,
		});

		// Initialize Gemini client
		const geminiClient = getGeminiClient();

		// Get the response text
		const html = (await geminiClient({ content: messages })).text ??
			"";

		// Return the generated HTML
		return {
			success: true,
			html,
			pageType,
		};
	} catch (error) {
		console.error(`Error generating ${pageType} website:`, error);
		return {
			success: false,
			error: `Failed to generate ${pageType} website: ${error}`,
			pageType,
		};
	}
}
