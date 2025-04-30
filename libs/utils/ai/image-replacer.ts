interface ImageReplacement {
    original: string;
    keywords: string;
}

/**
 * Extract images with data-keyword attributes from HTML content
 */
export function extractImages(htmlContent: string): ImageReplacement[] {
    const imgRegex = /<img[^>]*data-keyword="([^"]*)"[^>]*>/g;
    const imgReplacements: ImageReplacement[] = [];
    let match: RegExpExecArray | null;

    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((match = imgRegex.exec(htmlContent)) !== null) {
        const [fullMatch, keywords] = match;
        imgReplacements.push({
            original: fullMatch,
            keywords: keywords,
        });
    }

    return imgReplacements;
}

/**
 * Replace image sources with Unsplash images based on keywords
 */
export async function replaceImagesWithUnsplash(
    htmlContent: string,
): Promise<string> {
    const imgReplacements = extractImages(htmlContent);
    let updatedContent = htmlContent;

    // Process images in smaller batches to avoid memory issues
    const batchSize = 5;
    for (let i = 0; i < imgReplacements.length; i += batchSize) {
        const batch = imgReplacements.slice(i, i + batchSize);
        await Promise.all(
            batch.map(async (img) => {
                try {
                    const response = await fetch(
                        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
                            img.keywords,
                        )}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
                        {
                            headers: {
                                Accept: "application/json",
                                "Accept-Version": "v1",
                            },
                        },
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch Unsplash image: ${response.statusText}`,
                        );
                    }

                    const data = await response.json();
                    const unsplashUrl = data.urls.regular;

                    // Replace the original img tag with Unsplash URL
                    updatedContent = updatedContent.replace(
                        img.original,
                        img.original.replace(
                            /src="[^"]*"/,
                            `src="${unsplashUrl}"`,
                        ),
                    );
                } catch (error) {
                    console.error("Error fetching Unsplash image:", error);
                    // Keep the original picsum image if Unsplash fails
                }
            }),
        );

        // Add a small delay between batches to prevent rate limiting
        if (i + batchSize < imgReplacements.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    return updatedContent;
}
