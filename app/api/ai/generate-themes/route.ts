import { getGeminiClient } from "@/libs/utils/ai-client";
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
            let themes;
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
    // Create basic transformations for fallback themes
    const transformations = [
        {
            name: "Modern Blue",
            transform: (color: string) => shiftHue(color, 210), // Shift towards blue
        },
        {
            name: "Forest Green",
            transform: (color: string) => shiftHue(color, 120), // Shift towards green
        },
        {
            name: "Sunset Orange",
            transform: (color: string) => shiftHue(color, 30), // Shift towards orange
        },
        {
            name: "Dark Mode",
            transform: (color: string) => invertColor(color),
        },
        {
            name: "Pastel",
            transform: (color: string) => {
                const hsl = hexToHSL(color);
                return hslToHex(
                    hsl.h,
                    Math.min(hsl.s, 70),
                    Math.max(hsl.l, 70),
                );
            },
        },
        {
            name: "Monochrome",
            transform: (color: string) => {
                const hsl = hexToHSL(color);
                return hslToHex(hsl.h, 10, hsl.l);
            },
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

// Helper color functions
function hexToRGB(hex: string) {
    hex = hex.replace(/^#/, "");
    const bigint = Number.parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function rgbToHex(r: number, g: number, b: number) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function hexToHSL(hex: string) {
    const { r, g, b } = hexToRGB(hex);
    const r1 = r / 255;
    const g1 = g / 255;
    const b1 = b / 255;

    const max = Math.max(r1, g1, b1);
    const min = Math.min(r1, g1, b1);
    let h = 0,
        s = 0,
        l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r1:
                h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
                break;
            case g1:
                h = (b1 - r1) / d + 2;
                break;
            case b1:
                h = (r1 - g1) / d + 4;
                break;
        }

        h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return rgbToHex(
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255),
    );
}

function shiftHue(hex: string, targetHue: number) {
    const hsl = hexToHSL(hex);
    return hslToHex(targetHue, hsl.s, hsl.l);
}

function invertColor(hex: string) {
    const { r, g, b } = hexToRGB(hex);
    return rgbToHex(255 - r, 255 - g, 255 - b);
}
