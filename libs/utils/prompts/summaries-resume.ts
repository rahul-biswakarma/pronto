import { getGeminiClient } from "../ai/ai-client";

export const formatPdfData = async (pdfData: string) => {
    const geminiClient = getGeminiClient();
    const prompt =
        "You are a creative narrative analyst working with portfolio materials. You've been given raw text extracted from a PDF document that contains personal or professional information. Your task is to transform this information into a compelling narrative structure that highlights the user's journey, achievements, and unique qualities.\n\n- Extract key narrative elements: background story, challenges overcome, achievements, skills developed, and future aspirations.\n- Identify unique personal or professional qualities that make the user stand out.\n- Organize information into a coherent storyline with clear progression.\n- Preserve specific accomplishments, metrics, and concrete examples that demonstrate impact.\n- Format the information in a way that enables creative storytelling in a portfolio context.\n- Include emotional elements or personal motivations when present.\n- Exclude headers, footers, page numbers, and formatting artifacts.\n- Structure the output as a narrative outline with clear sections.\n\nYour output should provide a rich foundation for creative portfolio generation while maintaining factual accuracy.";
    const response = await geminiClient({
        content: `${prompt}\n\nPDF Content:\n${pdfData}`,
    });
    const summary = response.text;
    return summary;
};
