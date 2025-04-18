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
