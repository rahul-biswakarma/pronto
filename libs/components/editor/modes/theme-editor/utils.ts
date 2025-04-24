import { commonColorVariablePrefix } from "./components/utils";

export const THEMES_STORAGE_KEY = "feno-predefined-themes";

export const extractCssVariables = (html: string) => {
    const colorVariables: Array<{ name: string; value: string }> = [];

    try {
        // Find all style blocks in the HTML
        const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
        let styleMatch: RegExpExecArray | null;
        let allCssContent = "";

        // Extract all CSS content from style blocks
        styleMatch = styleBlockRegex.exec(html);
        while (styleMatch !== null) {
            allCssContent += `${styleMatch[1]}\n`;
            styleMatch = styleBlockRegex.exec(html);
        }

        // Also check for inline styles in the root element
        const inlineStyleRegex = /<html[^>]*style="([^"]*)"[^>]*>/;
        const inlineMatch = html.match(inlineStyleRegex);
        if (inlineMatch?.[1]) {
            allCssContent += `${inlineMatch[1]}\n`;
        }

        // Find all --feno-color- variables
        const varRegex = new RegExp(
            `(${commonColorVariablePrefix}[^:\\s]+)\\s*:\\s*([^;]+)`,
            "g",
        );
        const cssColorVariables = allCssContent.match(varRegex) || [];

        // Also search for variables directly in the HTML (might be inline styles)
        const htmlVarMatches = html.match(varRegex) || [];
        const allMatches = [...cssColorVariables, ...htmlVarMatches];

        // Use a Map to deduplicate variables by name
        const uniqueVars = new Map<string, string>();

        // Extract name-value pairs
        for (const variable of allMatches) {
            const match = variable.match(
                new RegExp(
                    `(${commonColorVariablePrefix}[^:\\s]+)\\s*:\\s*([^;]+)`,
                ),
            );
            if (match && match.length >= 3) {
                const name = match[1].trim();
                const value = match[2].trim();
                if (name && value) {
                    uniqueVars.set(name, value);
                }
            }
        }

        // Convert Map to the expected array format
        colorVariables.push(
            ...Array.from(uniqueVars.entries()).map(([name, value]) => ({
                name,
                value,
                label: formatColorVariable(name),
            })),
        );
    } catch (error) {
        console.error("Error extracting CSS variables:", error);
    }

    return colorVariables;
};

export const extractColorVariables = (doc: Document) => {
    try {
        const htmlString = doc.documentElement.outerHTML;
        if (!htmlString) {
            console.error("Could not access document content");
            return [];
        }
        return extractCssVariables(htmlString);
    } catch (error) {
        console.error("Error accessing document content:", error);
        return [];
    }
};

export const updateColorVariable = (
    document: Document,
    name: string,
    value: string,
) => {
    document.documentElement.style.setProperty(name, value);
};

export const formatColorVariable = (variable: string) => {
    // Extract meaningful names from --feno-color- variables
    return variable
        .replace(new RegExp(`^${commonColorVariablePrefix}`), "") // Remove the prefix
        .replace(/-/g, " ") // Replace dashes with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

interface Theme {
    name: string;
    colors: Record<string, string>;
}

// Function to apply a theme to the document
export const applyTheme = (
    document: Document,
    colors: Record<string, string>,
) => {
    // Apply each color variable to the document
    for (const [name, value] of Object.entries(colors)) {
        updateColorVariable(document, name, value);
    }
};

// Function to generate themes using Gemini AI
export const generateThemesWithGemini = async (
    currentTheme: Record<string, string>,
): Promise<Theme[]> => {
    try {
        // First check localStorage for already generated themes
        const savedThemes = getThemesFromStorage();
        if (savedThemes.length > 0) {
            return savedThemes;
        }

        // Format variables to a list for the prompt
        const colorVariables = Object.entries(currentTheme)
            .map(([name, value]) => `${formatColorVariable(name)}: ${value}`)
            .join("\n");

        // Create a system prompt for theme generation
        const prompt = `You are a professional UI designer specializing in color schemes and themes.
Based on the current theme colors provided below, generate 6 distinct, aesthetically pleasing theme alternatives.

Current theme colors:
${colorVariables}

For each theme, provide a name and the CSS variable values. Make the themes diverse in style while still being cohesive and professional.
Theme styles could include: Modern, Professional, Playful, Elegant, Minimalist, Bold, etc.

IMPORTANT REQUIREMENTS:
1. All color values MUST be provided in OKLCH format, NOT hex format.
2. Each theme MUST use the same base variables: --feno-color-hue and --feno-color-chroma.
3. All color definitions should REFERENCE these variables using var() syntax like:
   oklch(0.9 var(--feno-color-chroma) var(--feno-color-hue))
4. Only modify the actual numerical values of --feno-color-hue (0-360) and --feno-color-chroma (0-0.4) to create theme variations.
5. For other color variables, modify their lightness values but continue to reference the same hue and chroma variables.

Return the result as a JSON array of theme objects with this exact structure:
[
  {
    "name": "Theme Name",
    "colors": {
      "--feno-color-hue": "210",
      "--feno-color-chroma": "0.05",
      "--feno-color-variable-name": "oklch(0.9 var(--feno-color-chroma) var(--feno-color-hue))",
      // Include ALL color variables from the original theme
    }
  },
  // 5 more themes with the same structure
]

Each theme should include ALL the original color variables, just with new values.
Maintain the same variable names exactly as provided. Don't add or remove any variables.
Return only valid JSON, no additional text.`;

        // Using a client-side fetch to a proxy endpoint that will call Gemini
        // We'll assume there's an API endpoint at /api/ai/generate-themes
        const response = await fetch("/api/ai/generate-themes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                currentTheme,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to generate themes: ${response.statusText}`,
            );
        }

        const data = await response.json();

        // If the API is not available (for development/testing), return dummy themes
        if (!data.themes && !data.error) {
            const dummyThemes = generateDummyThemes(currentTheme);
            saveThemesToStorage(dummyThemes);
            return dummyThemes;
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // Save the generated themes to localStorage for future use
        saveThemesToStorage(data.themes);
        return data.themes;
    } catch (error) {
        console.error("Error generating themes with Gemini:", error);

        // Fallback to dummy themes if there's an error
        const dummyThemes = generateDummyThemes(currentTheme);
        saveThemesToStorage(dummyThemes);
        return dummyThemes;
    }
};

// Function to generate dummy themes for testing or when API is unavailable
const generateDummyThemes = (currentTheme: Record<string, string>): Theme[] => {
    // Extract the base hue and chroma from the current theme
    const baseChroma = Number.parseFloat(
        currentTheme["--feno-color-chroma"] || "0.03",
    );

    // OKLCH color transformations to create dummy themes
    const themes = [
        {
            name: "Modern Blue",
            colorShift: (oklchValue: string) => {
                // Shift hue towards blue (210-230)
                return oklchValue.replace(
                    /var\(--feno-color-hue\)/g,
                    String(210),
                );
            },
        },
        {
            name: "Forest Green",
            colorShift: (oklchValue: string) => {
                // Shift hue towards green (140-150)
                return oklchValue.replace(
                    /var\(--feno-color-hue\)/g,
                    String(145),
                );
            },
        },
        {
            name: "Sunset Orange",
            colorShift: (oklchValue: string) => {
                // Shift hue towards orange (25-30)
                return oklchValue.replace(
                    /var\(--feno-color-hue\)/g,
                    String(30),
                );
            },
        },
        {
            name: "Lavender Dreams",
            colorShift: (oklchValue: string) => {
                // Shift hue towards purple (280-300)
                return oklchValue.replace(
                    /var\(--feno-color-hue\)/g,
                    String(290),
                );
            },
        },
        {
            name: "Vibrant",
            colorShift: (oklchValue: string) => {
                // Increase chroma for more vibrant colors
                return oklchValue.replace(
                    /var\(--feno-color-chroma\)/g,
                    String(Math.min(0.15, baseChroma * 3)),
                );
            },
        },
        {
            name: "Dark Mode",
            colorShift: (oklchValue: string) => {
                // Invert lightness while preserving hue and chroma
                if (oklchValue.startsWith("oklch(")) {
                    const parts = oklchValue.match(
                        /oklch\((.*?)\s+var\(--feno-color-chroma\)\s+var\(--feno-color-hue\)\)/,
                    );
                    if (parts?.[1]) {
                        const lightness = Number.parseFloat(parts[1]);
                        // Invert the lightness (1 - lightness)
                        const invertedLightness = Math.max(
                            0,
                            Math.min(1, 1 - lightness),
                        );
                        return `oklch(${invertedLightness.toFixed(2)} var(--feno-color-chroma) var(--feno-color-hue))`;
                    }
                }
                return oklchValue;
            },
        },
        {
            name: "Pastel",
            colorShift: (oklchValue: string) => {
                // Increase lightness and reduce chroma for pastel look
                if (oklchValue.startsWith("oklch(")) {
                    const parts = oklchValue.match(
                        /oklch\((.*?)\s+var\(--feno-color-chroma\)\s+var\(--feno-color-hue\)\)/,
                    );
                    if (parts?.[1]) {
                        const lightness = Number.parseFloat(parts[1]);
                        // Increase lightness for pastel effect
                        const pastelLightness = Math.min(0.95, lightness + 0.2);
                        return oklchValue
                            .replace(
                                /var\(--feno-color-chroma\)/g,
                                String(Math.max(0.01, baseChroma * 0.5)),
                            )
                            .replace(
                                /oklch\((.*?)\s+/,
                                `oklch(${pastelLightness.toFixed(2)} `,
                            );
                    }
                }
                return oklchValue;
            },
        },
    ];

    // Apply the transformations to create themes
    return themes.map((theme) => {
        const colors = Object.entries(currentTheme).reduce(
            (acc, [name, value]) => {
                acc[name] = theme.colorShift(value);
                return acc;
            },
            {} as Record<string, string>,
        );

        return {
            name: theme.name,
            colors,
        };
    });
};

// Save themes to localStorage for future use
export const saveThemesToStorage = (themes: Theme[]) => {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
    } catch (error) {
        console.error("Error saving themes to localStorage:", error);
    }
};

// Get saved themes from localStorage
export const getThemesFromStorage = (): Theme[] => {
    if (typeof window === "undefined") return [];

    try {
        const savedThemes = localStorage.getItem(THEMES_STORAGE_KEY);
        if (savedThemes) {
            const parsedThemes = JSON.parse(savedThemes) as Theme[];
            if (Array.isArray(parsedThemes) && parsedThemes.length > 0) {
                return parsedThemes;
            }
        }
    } catch (error) {
        console.error("Error loading themes from localStorage:", error);
    }

    return [];
};
