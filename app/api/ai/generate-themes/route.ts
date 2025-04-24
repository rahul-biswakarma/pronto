import { getGeminiClient } from "@/libs/utils/ai/ai-client";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";

/**
 * POST /api/ai/generate-themes - Generate theme suggestions using Gemini AI
 */
export const POST = withErrorHandling(
    async (req: Request, requestId: string) => {
        try {
            // Get the request body
            const body = await req.json();

            if (!body.prompt || !body.currentTheme) {
                return createErrorResponse(
                    "Missing required fields: prompt and currentTheme",
                    requestId,
                    400,
                );
            }

            // Initialize Gemini client
            const geminiClient = getGeminiClient();

            // Call Gemini with the prompt
            const geminiResponse = await geminiClient({
                content: [
                    {
                        role: "user",
                        parts: [{ text: body.prompt }],
                    },
                ],
            });

            const responseText = geminiResponse.text || "";

            // Try to parse the response as JSON
            let themes: Array<{
                name: string;
                colors: Record<string, string>;
            }> = [];

            try {
                // Extract JSON from the response (handling potential code blocks or extra text)
                const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    themes = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error("No valid JSON found in the response");
                }

                // Validate the themes structure
                if (!Array.isArray(themes) || themes.length === 0) {
                    throw new Error("Invalid themes structure");
                }

                // Ensure each theme has a name and colors
                themes = themes.map((theme) => {
                    if (!theme.name || !theme.colors) {
                        throw new Error("Invalid theme structure");
                    }

                    // Ensure all original variables exist in the theme
                    const originalVariables = Object.keys(body.currentTheme);
                    for (const variable of originalVariables) {
                        if (!theme.colors[variable]) {
                            // Use original value if missing
                            theme.colors[variable] =
                                body.currentTheme[variable];
                        }
                    }

                    return {
                        name: theme.name,
                        colors: theme.colors,
                    };
                });

                // Limit to 6 themes maximum
                themes = themes.slice(0, 6);
            } catch (error) {
                console.error("Error parsing Gemini response:", error);
                // Return fallback themes if parsing fails
                themes = generateFallbackThemes(body.currentTheme);
            }

            return createSuccessResponse(
                {
                    themes,
                    message: "Generated themes using Gemini AI",
                },
                requestId,
            );
        } catch (error) {
            console.error("Error generating themes:", error);
            return createErrorResponse(
                `Failed to generate themes: ${error instanceof Error ? error.message : "Unknown error"}`,
                requestId,
                500,
            );
        }
    },
);

// Generate fallback themes when Gemini is not available
function generateFallbackThemes(currentTheme: Record<string, string>) {
    // Extract base hue and chroma from current theme
    const baseHue = Number.parseFloat(
        currentTheme["--feno-color-hue"] || "210",
    );
    const baseChroma = Number.parseFloat(
        currentTheme["--feno-color-chroma"] || "0.03",
    );

    // Create basic transformations for fallback themes
    const transformations = [
        {
            name: "Modern Blue",
            hue: 210,
            chroma: baseChroma,
        },
        {
            name: "Forest Green",
            hue: 120,
            chroma: baseChroma,
        },
        {
            name: "Sunset Orange",
            hue: 30,
            chroma: baseChroma,
        },
        {
            name: "Dark Mode",
            hue: baseHue,
            chroma: baseChroma,
            transform: (value: string) => {
                if (value.startsWith("oklch(")) {
                    const lightnessParts = value.match(/oklch\(([\d\.]+)/);
                    if (lightnessParts?.[1]) {
                        const lightness = Number.parseFloat(lightnessParts[1]);
                        // Invert lightness
                        const invertedLightness = Math.max(
                            0,
                            Math.min(1, 1 - lightness),
                        );
                        return value.replace(
                            /oklch\(([\d\.]+)/,
                            `oklch(${invertedLightness.toFixed(2)}`,
                        );
                    }
                }
                return value;
            },
        },
        {
            name: "Pastel",
            hue: baseHue,
            chroma: Math.max(0.01, baseChroma * 0.7),
            transform: (value: string) => {
                if (value.startsWith("oklch(")) {
                    const lightnessParts = value.match(/oklch\(([\d\.]+)/);
                    if (lightnessParts?.[1]) {
                        const lightness = Number.parseFloat(lightnessParts[1]);
                        // Increase lightness for pastel effect
                        const pastelLightness = Math.min(0.95, lightness + 0.2);
                        return value.replace(
                            /oklch\(([\d\.]+)/,
                            `oklch(${pastelLightness.toFixed(2)}`,
                        );
                    }
                }
                return value;
            },
        },
        {
            name: "Vibrant",
            hue: baseHue,
            chroma: Math.min(0.15, baseChroma * 2.5),
        },
    ];

    // Generate themes using the transformations
    return transformations.map((transformation) => {
        const colors = { ...currentTheme };

        // Set the base hue and chroma values
        colors["--feno-color-hue"] = transformation.hue.toString();
        colors["--feno-color-chroma"] = transformation.chroma.toString();

        // Apply special transformations if needed
        if (transformation.transform) {
            for (const [name, value] of Object.entries(colors)) {
                if (
                    name !== "--feno-color-hue" &&
                    name !== "--feno-color-chroma"
                ) {
                    colors[name] = transformation.transform(value);
                }
            }
        }

        return {
            name: transformation.name,
            colors,
        };
    });
}
