"use server";

import { contentGenPrompt } from "@/libs/constants/content-gen-prompt";
import {
    HTML_PROMPT_OUTPUT_SCHEMA,
    htmlGenPrompt,
} from "@/libs/constants/html-gen-prompt";
import { getAIClient } from "@/libs/utils/ai-client";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";
// Assuming you have a way to create a Supabase server client
// e.g., using cookies() or similar server-side helpers

import { generateObject, generateText } from "ai";
import { revalidatePath } from "next/cache";

type PortfolioActionResult = {
    success: boolean;
    portfolioId?: string;
    error?: string;
};

export async function generatePortfolioAction({
    content,
    templateId,
}: {
    content: string;
    templateId: string;
}): Promise<PortfolioActionResult> {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const supabase = auth.supabase;
    const userId = auth.userId;

    let portfolioId: string | undefined;

    try {
        const { data: createData, error: createError } = await supabase
            .from("portfolio")
            .insert({
                user_id: userId,
                content,
            })
            .select("id")
            .single();

        if (createError || !createData?.id) {
            throw new Error(
                `Failed to create portfolio record: ${createError?.message || "Unknown error"}`,
            );
        }
        portfolioId = createData.id;

        if (!portfolioId) {
            throw new Error("Failed to create portfolio record");
        }

        // 3. Generate content JSON using AI SDK
        const llmClient = getAIClient();
        const { text: portfolioContentJson } = await generateText({
            model: llmClient,
            messages: contentGenPrompt({ content, templateId }),
        });

        if (!portfolioContentJson) {
            throw new Error("No valid content in AI response");
        }
        const contentString = (() => {
            // remove all the ```json and ``` from the content
            const contentString = portfolioContentJson
                .replace(/```json|```/g, "")
                .replace(/```/g, "")
                .trim();

            // parse the content string as json
            try {
                const contentJson = JSON.parse(contentString);
                return contentJson;
            } catch (error) {
                throw new Error("Failed to parse content as JSON", {
                    cause: error,
                });
            }
        })();

        await uploadPortfolioFileInBucket({
            portfolioId,
            content: JSON.stringify(contentString),
            filename: `content-${portfolioId}.json`,
            contentType: "application/json",
            dbColKeyPrefix: "content",
        });

        // 4. Generate HTML template using AI SDK
        const { object: htmlResponse } = await generateObject({
            model: llmClient,
            messages: htmlGenPrompt({ content: contentString, templateId }),
            schema: HTML_PROMPT_OUTPUT_SCHEMA,
        });

        if (!htmlResponse?.html) {
            throw new Error("No valid HTML content in response");
        }
        const htmlTemplate = htmlResponse.html;

        await uploadPortfolioFileInBucket({
            portfolioId,
            content: htmlTemplate,
            filename: `template-${portfolioId}.html`,
            contentType: "text/html",
            dbColKeyPrefix: "html",
        });

        // Revalidate relevant paths if needed
        revalidatePath("/editor"); // Adjust path as needed
        return { success: true, portfolioId };
    } catch (error: unknown) {
        console.error("Server-side portfolio generation error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown generation error";
        return {
            success: false,
            portfolioId,
            error: errorMessage,
        };
    }
}
