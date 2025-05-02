// supabase/functions/generate-websites/index.ts
export async function generateWebsites(req, res) {
    // Parse request data
    const { templateId, content, userId } = await req.json();

    // Set up SSE response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Create three different website IDs
    const websiteIds = [
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID(),
    ];

    // Send initial message with website IDs
    res.write(
        `data: ${JSON.stringify({
            type: "init",
            websiteIds,
        })}\n\n`,
    );

    // Create three different prompts with variations
    const prompts = [
        generatePrompt(templateId, content, "minimal"),
        generatePrompt(templateId, content, "standard"),
        generatePrompt(templateId, content, "premium"),
    ];

    // Initialize LLM client
    const llm = getLLMClient();

    // Start three concurrent generations
    const streams = await Promise.all(
        prompts.map((prompt) =>
            llm
                .generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 },
                })
                .stream(),
        ),
    );

    // Track HTML content for each variant
    const htmlContents = ["", "", ""];

    // Process all streams concurrently
    await Promise.all(
        streams.map(async (stream, index) => {
            try {
                for await (const chunk of stream) {
                    const textChunk = chunk.text();
                    htmlContents[index] += textChunk;

                    // Send chunk with variant identifier
                    res.write(
                        `data: ${JSON.stringify({
                            type: "chunk",
                            variantIndex: index,
                            websiteId: websiteIds[index],
                            chunk: textChunk,
                            html: autoCloseHtml(htmlContents[index]), // Helper to close tags for preview
                        })}\n\n`,
                    );
                }

                // Upload the completed HTML
                const { filePath } = await uploadWebsitePage({
                    content: htmlContents[index],
                    filename: "index.html",
                    userId,
                    websiteId: websiteIds[index],
                });

                // Send completion message for this variant
                res.write(
                    `data: ${JSON.stringify({
                        type: "complete",
                        variantIndex: index,
                        websiteId: websiteIds[index],
                        filePath,
                    })}\n\n`,
                );
            } catch (error) {
                // Send error for this variant
                res.write(
                    `data: ${JSON.stringify({
                        type: "error",
                        variantIndex: index,
                        websiteId: websiteIds[index],
                        error: error.message,
                    })}\n\n`,
                );
            }
        }),
    );

    // Send final completion message
    res.write(`data: ${JSON.stringify({ type: "allComplete" })}\n\n`);
    res.end();
}
