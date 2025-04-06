import { checkAuthentication } from "@/utils/auth";
import { deepseek } from "@ai-sdk/deepseek";
import { type Message, generateText } from "ai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ollama } from "ollama-ai-provider";
import { z } from "zod";

// Define the output schema using Zod
const portfolioOutputSchema = z.object({
    html: z
        .string()
        .describe(
            "Complete, valid HTML+CSS code for a professional portfolio website",
        ),
});

// Create LangChain output parser
const outputParser = StructuredOutputParser.fromZodSchema(
    portfolioOutputSchema,
);

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

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: "User ID is required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        // Verify the requested userId matches the authenticated user
        if (userId !== auth.userId) {
            return new Response(
                JSON.stringify({
                    error: "Unauthorized: Cannot access another user's data",
                }),
                {
                    status: 403,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const client = getAIClient();
        const supabase = auth.supabase;

        // Get the user's resume summary
        const { data: resumeData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (fetchError || !resumeData) {
            return new Response(
                JSON.stringify({
                    error: "Resume summary not found. Please generate a summary first.",
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        // Create a prompt for the AI to generate a portfolio
        const promptMessages: Message[] = [
            {
                id: "system-1",
                role: "system",
                content: `You are a professional web developer specializing in creating personal portfolios.
                Create a clean, professional portfolio webpage using HTML and CSS only (no JavaScript).
                The HTML should be in a single file with embedded CSS in the <style> tag.
                Include responsive design that works well on mobile and desktop.
                Use a modern, professional design with a cohesive color scheme.
                The portfolio should include:
                - Header with the person's name as title
                - Professional summary section
                - Skills section with visually appealing representation
                - A professional photo placeholder (use a div with background-color)
                - Contact information section
                - Clean, readable typography
                - Sufficient whitespace and visual hierarchy

                ${outputParser.getFormatInstructions()}`,
            },
            {
                id: "user-1",
                role: "user",
                content: `Create a portfolio webpage for a professional with the following details:
                Name: ${resumeData.name || "Professional"}
                Professional Summary: ${resumeData.summary}
                Skills: ${Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : resumeData.skills}
                Professional Identity: ${resumeData.persona}
                Key Traits: ${Array.isArray(resumeData.personality) ? resumeData.personality.join(", ") : resumeData.personality}

                Please create a complete, ready-to-use HTML file with embedded CSS for a professional portfolio website.`,
            },
        ];

        // Generate the portfolio HTML
        const { text } = await generateText({
            model: client,
            messages: promptMessages,
        });

        // Parse the output to get structured HTML
        let portfolioHTML: string;
        try {
            const parsedOutput = await outputParser.parse(text);
            portfolioHTML = parsedOutput.html;
        } catch (parseError: unknown) {
            console.warn(
                "Failed to parse structured output, using raw text:",
                parseError,
            );
            // Fallback to using the raw response if parsing fails
            portfolioHTML = text;
        }

        // Save the generated HTML to the database
        const { error: updateError } = await supabase
            .from("resume_summaries")
            .update({ portfolio_html: portfolioHTML })
            .eq("user_id", userId);

        if (updateError) {
            console.error("Error saving portfolio HTML:", updateError);
            // Still return the HTML even if saving failed
        }

        return new Response(
            JSON.stringify({
                html: portfolioHTML,
            }),
            {
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (error: unknown) {
        console.error("Portfolio generation error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to generate portfolio";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
