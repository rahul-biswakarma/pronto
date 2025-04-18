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
        const varRegex = /--feno-color-[^:\s]+\s*:\s*[^;]+/g;
        const cssColorVariables = allCssContent.match(varRegex) || [];

        // Also search for variables directly in the HTML (might be inline styles)
        const htmlVarMatches = html.match(varRegex) || [];
        const allMatches = [...cssColorVariables, ...htmlVarMatches];

        // Use a Map to deduplicate variables by name
        const uniqueVars = new Map<string, string>();

        // Extract name-value pairs
        for (const variable of allMatches) {
            const parts = variable.split(":");
            if (parts.length === 2) {
                const name = parts[0].trim();
                const value = parts[1].trim();
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
            })),
        );
    } catch (error) {
        console.error("Error extracting CSS variables:", error);
    }

    return colorVariables;
};

export const extractColorVariables = (iframeRef: HTMLIFrameElement) => {
    try {
        const htmlString = iframeRef.contentDocument?.documentElement.outerHTML;
        if (!htmlString) {
            console.error("Could not access iframe content");
            return [];
        }
        return extractCssVariables(htmlString);
    } catch (error) {
        console.error("Error accessing iframe content:", error);
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
        .replace(/^--feno-color-/, "") // Remove the prefix
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
    Object.entries(colors).forEach(([name, value]) => {
        updateColorVariable(document, name, value);
    });
};

// Function to generate themes using Gemini AI
export const generateThemesWithGemini = async (
    currentTheme: Record<string, string>,
): Promise<Theme[]> => {
    try {
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

Return the result as a JSON array of theme objects with this exact structure:
[
  {
    "name": "Theme Name",
    "colors": {
      "--feno-color-variable-name": "hex-color-value",
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
            return generateDummyThemes(currentTheme);
        }

        if (data.error) {
            throw new Error(data.error);
        }

        return data.themes;
    } catch (error) {
        console.error("Error generating themes with Gemini:", error);

        // Fallback to dummy themes if there's an error
        return generateDummyThemes(currentTheme);
    }
};

// Function to generate dummy themes for testing or when API is unavailable
const generateDummyThemes = (currentTheme: Record<string, string>): Theme[] => {
    // Basic color transformations to create dummy themes
    const themes = [
        {
            name: "Modern Blue",
            colorShift: (hex: string) => shiftTowardsColor(hex, "#0066cc"),
        },
        {
            name: "Forest Green",
            colorShift: (hex: string) => shiftTowardsColor(hex, "#116633"),
        },
        {
            name: "Sunset Orange",
            colorShift: (hex: string) => shiftTowardsColor(hex, "#ff7700"),
        },
        {
            name: "Lavender Dreams",
            colorShift: (hex: string) => shiftTowardsColor(hex, "#9966cc"),
        },
        {
            name: "Dark Mode",
            colorShift: (hex: string) => invertColor(hex),
        },
        {
            name: "Pastel",
            colorShift: (hex: string) => lightenColor(hex, 0.3),
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

// Helper function to shift a color towards another color
const shiftTowardsColor = (hex: string, targetHex: string, amount = 0.5) => {
    const r1 = Number.parseInt(hex.slice(1, 3), 16);
    const g1 = Number.parseInt(hex.slice(3, 5), 16);
    const b1 = Number.parseInt(hex.slice(5, 7), 16);

    const r2 = Number.parseInt(targetHex.slice(1, 3), 16);
    const g2 = Number.parseInt(targetHex.slice(3, 5), 16);
    const b2 = Number.parseInt(targetHex.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * amount);
    const g = Math.round(g1 + (g2 - g1) * amount);
    const b = Math.round(b1 + (b2 - b1) * amount);

    return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Helper function to invert a color
const invertColor = (hex: string) => {
    const r = 255 - Number.parseInt(hex.slice(1, 3), 16);
    const g = 255 - Number.parseInt(hex.slice(3, 5), 16);
    const b = 255 - Number.parseInt(hex.slice(5, 7), 16);

    return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Helper function to lighten a color
const lightenColor = (hex: string, amount = 0.2) => {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);

    const lightenChannel = (channel: number) => {
        return Math.round(channel + (255 - channel) * amount);
    };

    const rLightened = lightenChannel(r);
    const gLightened = lightenChannel(g);
    const bLightened = lightenChannel(b);

    return `#${rLightened.toString(16).padStart(2, "0")}${gLightened
        .toString(16)
        .padStart(2, "0")}${bLightened.toString(16).padStart(2, "0")}`;
};
