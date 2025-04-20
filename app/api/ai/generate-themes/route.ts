import { getGeminiClient } from "@/libs/utils/ai-client";
import {
    createErrorResponse,
    createSuccessResponse,
    withErrorHandling,
} from "@/libs/utils/api-response";
import Color from "color";

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

            // Check if Gemini is enabled
            if (!process.env.USE_GEMINI || process.env.USE_GEMINI !== "true") {
                return createSuccessResponse(
                    {
                        themes: generateFallbackThemes(body.currentTheme),
                        message:
                            "Generated themes using fallback method (Gemini not enabled)",
                    },
                    requestId,
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
    // Helper function using the 'color' library
    const transformColor = (
        hex: string,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        transformation: (c: any) => any,
    ): string => {
        try {
            const originalColor = Color(hex);
            const transformedColor = transformation(originalColor);
            return transformedColor.hex();
        } catch (error) {
            console.error(`Error transforming color ${hex}:`, error);
            return hex; // Return original color on error
        }
    };

    // Create basic transformations for fallback themes
    const transformations = [
        {
            name: "Modern Blue",
            transform: (hex: string) => transformColor(hex, (c) => c.hue(210)),
        },
        {
            name: "Forest Green",
            transform: (hex: string) => transformColor(hex, (c) => c.hue(120)),
        },
        {
            name: "Sunset Orange",
            transform: (hex: string) => transformColor(hex, (c) => c.hue(30)),
        },
        {
            name: "Dark Mode",
            transform: (hex: string) => transformColor(hex, (c) => c.negate()),
        },
        {
            name: "Pastel",
            transform: (hex: string) =>
                transformColor(hex, (c) =>
                    c
                        .saturationl(Math.min(c.saturationl(), 70))
                        .lightness(Math.max(c.lightness(), 70)),
                ),
        },
        {
            name: "Monochrome",
            transform: (hex: string) =>
                transformColor(hex, (c) => c.saturationl(10)),
        },
    ];

    // Generate themes using the transformations
    return transformations.map((transformation) => {
        const colors = Object.entries(currentTheme).reduce(
            (acc, [name, value]) => {
                acc[name] = transformation.transform(value);
                return acc;
            },
            {} as Record<string, string>,
        );

        return {
            name: transformation.name,
            colors,
        };
    });
}
