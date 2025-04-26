import { getGeminiClient } from "./ai-client";

export const formatPdfData = async (pdfData: string) => {
    const geminiClient = getGeminiClient();
    const prompt =
        "You are given the raw text extracted from a PDF document. Your task is to generate a clean, concise summary of the document, suitable for use as input to another language model.\n\n- Remove any redundant, repeated, or irrelevant information.\n- Exclude headers, footers, page numbers, and formatting artifacts.\n- Focus on the main ideas, key points, and essential information.\n- Return only the summary text, with no additional commentary or instructions.";
    const response = await geminiClient({
        content: `${prompt}\n\nPDF Content:\n${pdfData}`,
    });
    const summary = response.text;
    return summary;
};
