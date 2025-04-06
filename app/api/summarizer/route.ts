import { deepseek } from "@ai-sdk/deepseek";
import { type Message, generateText } from "ai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ollama } from "ollama-ai-provider";
import { z } from "zod";

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === "production";

// Initialize the appropriate client based on environment
const getAIClient = () => {
    if (isProduction) {
        // Use DeepSeek in production via OpenAI compatible API
        return deepseek("deepseek-chat");
    }

    // Use Ollama in development (default)
    return ollama("deepseek-r1:8b");
};

// Define the output schema using zod
const resumeOutputSchema = z.object({
    summary: z
        .string()
        .describe(
            "A concise overview of the person's background and qualifications",
        ),
    skills: z
        .array(z.string())
        .describe("List of technical skills and competencies from the resume"),
    persona: z
        .string()
        .describe(
            "The professional persona or identity that best describes this individual based on their resume (e.g., 'Experienced Full-stack Developer with DevOps expertise')",
        ),
    personality: z
        .array(z.string())
        .describe(
            "List of personality traits or soft skills that can be inferred from the resume content and writing style",
        ),
});

// Create LangChain output parser
const outputParser = StructuredOutputParser.fromZodSchema(resumeOutputSchema);

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, content } = await req.json();

        const client = getAIClient();

        // If content is provided (PDF text), create a prompt for structured output
        const promptMessages: Message[] = content
            ? [
                  {
                      role: "system",
                      content: `You are a resume analyzer that extracts key information. ${outputParser.getFormatInstructions()}`,
                  },
                  {
                      role: "user",
                      content: `Analyze the following resume content and extract a summary, skills list, professional persona, and personality traits/soft skills that can be inferred from the content:\n\n${content}`,
                  },
              ]
            : messages;

        // Use the AI SDK for streaming responses
        const { text } = await generateText({
            model: client,
            messages: promptMessages,
        });

        // If content is provided, ensure we return proper structured JSON
        if (content) {
            try {
                // Use LangChain parser to parse the AI response
                const structuredOutput = await outputParser.parse(text);
                return new Response(JSON.stringify(structuredOutput), {
                    headers: { "Content-Type": "application/json" },
                });
            } catch (e) {
                console.error("Parsing error:", e);
                // Fallback to best-effort parsing
                return new Response(
                    JSON.stringify({
                        summary: text,
                        skills: [],
                    }),
                    {
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
        }

        // Return the streaming text response for non-content requests
        return new Response(text);
    } catch (error: unknown) {
        console.error("AI processing error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to process AI request";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
