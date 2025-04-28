export function extractThemeVariables(
    htmlTemplate: string,
): Record<string, string> {
    const themeVariables: Record<string, string> = {};

    // Find all style tags in case there are multiple
    const styleMatches = htmlTemplate.matchAll(
        /<style[^>]*>([\s\S]*?)<\/style>/g,
    );

    for (const match of styleMatches) {
        const cssContent = match[1];

        // Find all :root and html selectors that might contain variables
        const rootMatches = cssContent.matchAll(/(?::root|html)\s*{([^}]*)}/g);

        for (const rootMatch of rootMatches) {
            const rootContent = rootMatch[1];
            // More precise regex to catch variable declarations
            const variableRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+)\s*;/g;

            let varMatch: RegExpExecArray | null;
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            while ((varMatch = variableRegex.exec(rootContent)) !== null) {
                const [, name, value] = varMatch;
                themeVariables[name.trim()] = value.trim();
            }
        }
    }

    return themeVariables;
}
