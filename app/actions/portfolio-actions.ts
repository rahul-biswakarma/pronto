"use server";
import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import { htmlGenPromptGemini } from "@/libs/utils/ai/html-gen-prompt-gemini";
import { checkAuthentication } from "@/libs/utils/auth";
import { uploadPortfolioFileInBucket } from "@/libs/utils/supabase-storage";

type PortfolioActionResult = {
  success: boolean;
  portfolioId?: string;
  error?: string;
};

function emailToUsername(email: string) {
  const localPart = email.split("@")[0];
  return localPart
    .toLowerCase()
    .replace(/[._+]/g, "-") // Replace . _ + with hyphen
    .replace(/[^a-z0-9-]/g, "") // Remove other non-alphanumerics
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Trim hyphens at start/end
}

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
  const domain = emailToUsername(auth.user?.email ?? "");

  let portfolioId: string | undefined;

  try {
    const { data: createData, error: createError } = await supabase
      .from("portfolio")
      .insert({
        user_id: userId,
        content,
        domain,
      })
      .select("id")
      .single();

    if (createError || !createData?.id) {
      throw new Error(
        `Failed to create portfolio record: ${
          createError?.message || "Unknown error"
        }`
      );
    }
    portfolioId = createData.id;

    if (!portfolioId) {
      throw new Error("Failed to create portfolio record");
    }

    return await generateWithGemini({
      domain,
      content,
      templateId,
      portfolioId,
    });
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

/**
 * Generate portfolio HTML using Gemini via Vercel AI SDK
 */
async function generateWithGemini({
  domain,
  content,
  templateId,
  portfolioId,
}: {
  domain: string;
  content: string;
  templateId: string;
  portfolioId: string;
}): Promise<PortfolioActionResult> {
  try {
    const geminiClient = getGeminiClient();
    const prompt = await htmlGenPromptGemini({ content, templateId });

    const responseText = (await geminiClient({ content: prompt })).text ?? "";

    // Parse the response content
    let htmlTemplate: string | null;
    try {
      // Look for HTML content (either directly or in a code block)
      const htmlMatch = responseText.match(/<html[^>]*>([\s\S]*)<\/html>/i);

      if (htmlMatch?.[1]) {
        htmlTemplate = `<html>${htmlMatch[1]}</html>`;
      } else {
        // If no HTML found, use the full response
        htmlTemplate = responseText;
      }

      if (!htmlTemplate) {
        throw new Error("No valid HTML content in response");
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      throw new Error("Failed to generate valid HTML content");
    }

    await uploadPortfolioFileInBucket({
      portfolioId,
      content: htmlTemplate,
      filename: `portfolio-${portfolioId}.html`,
      contentType: "text/html",
      route: "home",
      domain,
    });

    return { success: true, portfolioId };
  } catch (error: unknown) {
    console.error("Gemini generation error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown Gemini generation error";
    return {
      success: false,
      portfolioId,
      error: errorMessage,
    };
  }
}
