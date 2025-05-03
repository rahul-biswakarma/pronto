// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { htmlGenPromptGemini } from "../../../libs/utils/ai/html-gen-prompt-gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { content, templateId, userId, pageType = "portfolio" } = await req
      .json();

    // Set up SSE response
    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    // Create a stream for the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Generate website IDs
    const websiteIds = [
      crypto.randomUUID(),
      crypto.randomUUID(),
      crypto.randomUUID(),
    ];

    // Send initial message with website IDs
    const encoder = new TextEncoder();
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({ type: "init", websiteIds })}\n\n`,
      ),
    );

    // Start generation in the background
    (async () => {
      try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Create three different prompts with variations
        const styles = ["minimal", "standard", "premium"];
        const prompts = await Promise.all(styles.map(async (style) => {
          return await generatePromptWithStyle(
            content,
            templateId,
            style,
            pageType,
          );
        }));

        // Generate websites concurrently
        await Promise.all(
          prompts.map(async (prompt, index) => {
            try {
              // In production, replace this with actual LLM call
              // For now, using the simulation function
              const htmlParts = await simulateGeneration(prompt, styles[index]);
              let htmlSoFar = "";

              // Stream each part
              for (const part of htmlParts) {
                htmlSoFar += part;
                await writer.write(
                  encoder.encode(
                    `data: ${
                      JSON.stringify({
                        type: "chunk",
                        variantIndex: index,
                        websiteId: websiteIds[index],
                        chunk: part,
                        html: autoCloseHtml(htmlSoFar),
                      })
                    }\n\n`,
                  ),
                );

                // Add a small delay to simulate streaming
                await new Promise((resolve) => setTimeout(resolve, 100));
              }

              // Save the completed HTML
              const { data, error } = await supabase.storage
                .from("website_pages")
                .upload(
                  `${userId}/${websiteIds[index]}/index.html`,
                  new Blob([htmlSoFar], {
                    type: "text/html",
                  }),
                  { upsert: true },
                );

              if (error) {
                throw new Error(`Storage error: ${error.message}`);
              }

              // Send completion message for this variant
              await writer.write(
                encoder.encode(
                  `data: ${
                    JSON.stringify({
                      type: "complete",
                      variantIndex: index,
                      websiteId: websiteIds[index],
                      filePath: data?.path || null,
                    })
                  }\n\n`,
                ),
              );
            } catch (error) {
              // Send error for this variant
              await writer.write(
                encoder.encode(
                  `data: ${
                    JSON.stringify({
                      type: "error",
                      variantIndex: index,
                      websiteId: websiteIds[index],
                      error: error instanceof Error
                        ? error.message
                        : String(error),
                    })
                  }\n\n`,
                ),
              );
            }
          }),
        );

        // Send final completion message
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: "allComplete" })}\n\n`,
          ),
        );
      } catch (error) {
        // Send error message
        await writer.write(
          encoder.encode(
            `data: ${
              JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : String(error),
              })
            }\n\n`,
          ),
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

// Helper function to generate prompts with variations and integrate with your existing code
async function generatePromptWithStyle(
  content: string,
  templateId: string,
  style: string,
  pageType: string,
): Promise<string> {
  // Use your existing htmlGenPromptGemini function with style variations
  const basePrompt = await htmlGenPromptGemini({
    content,
    templateId,
    pageType,
  });

  // Add style-specific instructions
  let styleInstructions = "";
  switch (style) {
    case "minimal":
      styleInstructions =
        "Create a minimalist design with clean typography and ample white space.";
      break;
    case "standard":
      styleInstructions =
        "Create a balanced design with moderate visual elements and standard layout.";
      break;
    case "premium":
      styleInstructions =
        "Create a sophisticated design with rich visuals, animations, and premium features.";
      break;
  }

  return `${basePrompt}\n\nStyle Instructions: ${styleInstructions}`;
}

// Helper function to auto-close HTML tags
function autoCloseHtml(html: string): string {
  const stack: string[] = [];
  const openTagRegex = /<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)>/g;

  // Find all opening tags
  let match: RegExpExecArray | null;
  match = openTagRegex.exec(html);
  while (match !== null) {
    const [fullMatch, tagName] = match;
    // Skip self-closing tags
    if (
      !fullMatch.endsWith("/>") &&
      !fullMatch.endsWith(" />") &&
      tagName !== "br" &&
      tagName !== "hr" &&
      tagName !== "img" &&
      tagName !== "input" &&
      tagName !== "meta" &&
      tagName !== "link"
    ) {
      stack.push(tagName);
    }
  }

  // Find all closing tags
  match = closeTagRegex.exec(html);
  while (match !== null) {
    const [_, tagName] = match;
    // Remove the last matching tag from stack
    const index = stack.lastIndexOf(tagName);
    if (index !== -1) {
      stack.splice(index, 1);
    }
  }

  // Close all remaining tags in reverse order
  let completedHtml = html;
  for (let i = stack.length - 1; i >= 0; i--) {
    completedHtml += `</${stack[i]}>`;
  }

  return completedHtml;
}
