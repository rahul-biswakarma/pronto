import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: corsHeaders,
        });
    }

    try {
        const { content, templateId, userId } = await req.json();

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
                const supabaseKey =
                    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
                const supabase = createClient(supabaseUrl, supabaseKey);

                // Create three different prompts with variations
                const prompts = [
                    generatePrompt(templateId, content, "minimal"),
                    generatePrompt(templateId, content, "standard"),
                    generatePrompt(templateId, content, "premium"),
                ];

                // Generate websites concurrently
                await Promise.all(
                    prompts.map(async (prompt, index) => {
                        try {
                            // Simulate streaming generation (replace with actual LLM call)
                            const htmlParts = await simulateGeneration(prompt);
                            let htmlSoFar = "";

                            // Stream each part
                            for (const part of htmlParts) {
                                htmlSoFar += part;
                                await writer.write(
                                    encoder.encode(
                                        `data: ${JSON.stringify({
                                            type: "chunk",
                                            variantIndex: index,
                                            websiteId: websiteIds[index],
                                            chunk: part,
                                            html: autoCloseHtml(htmlSoFar),
                                        })}\n\n`,
                                    ),
                                );

                                // Add a small delay to simulate streaming
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 100),
                                );
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

                            // Send completion message for this variant
                            await writer.write(
                                encoder.encode(
                                    `data: ${JSON.stringify({
                                        type: "complete",
                                        variantIndex: index,
                                        websiteId: websiteIds[index],
                                        filePath: data?.path || null,
                                    })}\n\n`,
                                ),
                            );
                        } catch (error) {
                            // Send error for this variant
                            await writer.write(
                                encoder.encode(
                                    `data: ${JSON.stringify({
                                        type: "error",
                                        variantIndex: index,
                                        websiteId: websiteIds[index],
                                        error: error.message,
                                    })}\n\n`,
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
                        `data: ${JSON.stringify({
                            type: "error",
                            error: error.message,
                        })}\n\n`,
                    ),
                );
            } finally {
                await writer.close();
            }
        })();

        return new Response(stream.readable, { headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

// Helper function to generate prompts with variations
function generatePrompt(
    templateId: string,
    content: string,
    style: string,
): string {
    // Base prompt with content and template
    let prompt = `Generate a ${style} website using template ${templateId} with the following content:\n${content}\n`;

    // Add style-specific instructions
    switch (style) {
        case "minimal":
            prompt +=
                "\nCreate a minimalist design with clean typography and ample white space.";
            break;
        case "standard":
            prompt +=
                "\nCreate a balanced design with moderate visual elements and standard layout.";
            break;
        case "premium":
            prompt +=
                "\nCreate a sophisticated design with rich visuals, animations, and premium features.";
            break;
    }

    return prompt;
}

// Helper function to auto-close HTML tags
function autoCloseHtml(html: string): string {
    const stack: string[] = [];
    const openTagRegex = /<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
    const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)>/g;

    // Find all opening tags
    let match;
    while ((match = openTagRegex.exec(html)) !== null) {
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
    while ((match = closeTagRegex.exec(html)) !== null) {
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

// Helper function to simulate streaming generation (for development)
async function simulateGeneration(prompt: string): Promise<string[]> {
    // This would be replaced with actual LLM generation
    const style = prompt.includes("minimal")
        ? "minimal"
        : prompt.includes("premium")
          ? "premium"
          : "standard";

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${style.charAt(0).toUpperCase() + style.slice(1)} Website</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    header { padding: 2rem 0; }
    main { padding: 2rem 0; }
    footer { padding: 2rem 0; text-align: center; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>My ${style.charAt(0).toUpperCase() + style.slice(1)} Website</h1>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main>
    <div class="container">
      <section>
        <h2>Welcome to our site</h2>
        <p>This is a ${style} design template.</p>
      </section>
    </div>
  </main>
  <footer>
    <div class="container">
      <p>&copy; 2023 ${style.charAt(0).toUpperCase() + style.slice(1)} Website. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;

    // Split the template into chunks to simulate streaming
    const chunkSize = 20;
    const chunks: string[] = [];

    for (let i = 0; i < template.length; i += chunkSize) {
        chunks.push(template.slice(i, i + chunkSize));
    }

    return chunks;
}
