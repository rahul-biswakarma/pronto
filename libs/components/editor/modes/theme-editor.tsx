import type React from "react";
import { useEffect, useState } from "react";
import { useEditor } from "../editor.context";
import type { EditorMode } from "../types/editor.types";

// Prefix for color variables we want to extract
const COLOR_VAR_PREFIX = "--color-";

interface ColorVariable {
    name: string;
    value: string;
    displayName: string;
}

const extractColorVariables = (doc: Document | null): ColorVariable[] => {
    if (!doc) return [];

    const colors: ColorVariable[] = [];

    try {
        // Extract from inline styles
        const styles = doc.querySelectorAll("style");
        styles.forEach((style) => {
            const cssText = style.textContent || "";
            const rootRules = cssText.match(/:root\s*{([^}]*)}/g);

            if (rootRules) {
                rootRules.forEach((rule) => {
                    const varDeclarations = rule.match(
                        new RegExp(`${COLOR_VAR_PREFIX}[^:]+:\\s*[^;]+;`, "g"),
                    );

                    if (varDeclarations) {
                        varDeclarations.forEach((declaration) => {
                            const [name, value] = declaration
                                .replace(";", "")
                                .split(":")
                                .map((part) => part.trim());
                            if (name.startsWith(COLOR_VAR_PREFIX)) {
                                colors.push({
                                    name,
                                    value,
                                    displayName: formatDisplayName(
                                        name.substring(COLOR_VAR_PREFIX.length),
                                    ),
                                });
                            }
                        });
                    }
                });
            }
        });

        // Extract from computed styles
        const computedStyle = window.getComputedStyle(doc.documentElement);

        // Check all properties for color variables
        for (let i = 0; i < computedStyle.length; i++) {
            const prop = computedStyle[i];
            if (prop.startsWith(COLOR_VAR_PREFIX)) {
                const value = computedStyle.getPropertyValue(prop);
                if (!colors.some((color) => color.name === prop)) {
                    colors.push({
                        name: prop,
                        value,
                        displayName: formatDisplayName(
                            prop.substring(COLOR_VAR_PREFIX.length),
                        ),
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error extracting color variables:", error);
    }

    return colors;
};

// Format the variable name for display
const formatDisplayName = (name: string): string => {
    return name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Color picker component
const ColorPicker: React.FC<{
    color: ColorVariable;
    onChange: (value: string) => void;
}> = ({ color, onChange }) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
            }}
        >
            <label style={{ flex: 1, marginRight: "10px" }}>
                {color.displayName}
            </label>
            <input
                type="color"
                value={color.value}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: "40px", height: "40px" }}
            />
            <input
                type="text"
                value={color.value}
                onChange={(e) => onChange(e.target.value)}
                style={{ marginLeft: "10px", width: "80px" }}
            />
        </div>
    );
};

// Theme Editor component
const ThemeEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange } = useEditor();
    const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);

    useEffect(() => {
        if (iframeDocument) {
            const colors = extractColorVariables(iframeDocument);
            setColorVariables(colors);
        }
    }, [iframeDocument]);

    const handleColorChange = (index: number, newValue: string) => {
        if (!iframeDocument) return;

        const updatedColors = [...colorVariables];
        updatedColors[index] = { ...updatedColors[index], value: newValue };
        setColorVariables(updatedColors);

        try {
            // Update the CSS variable in the iframe
            const style = iframeDocument.documentElement.style;
            style.setProperty(updatedColors[index].name, newValue);

            // Generate updated HTML
            const updatedHtml = iframeDocument.documentElement.outerHTML;
            onHtmlChange({
                html: updatedHtml,
                modeId: "theme-editor",
                modeLabel: "Theme Editor",
            });
        } catch (error) {
            console.error("Error updating color variable:", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Theme Editor</h2>
            <div>
                {colorVariables.length > 0 ? (
                    colorVariables.map((color, index) => (
                        <ColorPicker
                            key={color.name}
                            color={color}
                            onChange={(value) =>
                                handleColorChange(index, value)
                            }
                        />
                    ))
                ) : (
                    <p>
                        No color variables found. Make sure your CSS uses
                        variables with the "{COLOR_VAR_PREFIX}" prefix.
                    </p>
                )}
            </div>
        </div>
    );
};

// Register the theme editor mode
export const registerThemeEditorMode = (): EditorMode => {
    return {
        id: "theme-editor",
        label: "Theme Editor",
        editorRenderer: () => <ThemeEditor />,
        actionRenderer: () => <div>Theme Editor</div>,
    };
};
