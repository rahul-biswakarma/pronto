import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconBrandGoogle, IconPalette } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import {
    applyTheme,
    extractColorVariables,
    formatColorVariable,
    generateThemesWithGemini,
    updateColorVariable,
} from "./utils";

interface ColorVariable {
    name: string;
    value: string;
    displayName: string;
}

interface Theme {
    name: string;
    colors: Record<string, string>;
}

// Theme Editor component
const ThemeEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId, iframeRef } = useEditor();
    const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);
    const [originalColors, setOriginalColors] = useState<
        Record<string, string>
    >({});
    const [hasChanges, setHasChanges] = useState(false);
    const [predefinedThemes, setPredefinedThemes] = useState<Theme[]>([]);
    const [isGeneratingThemes, setIsGeneratingThemes] = useState(false);

    // Load color variables from the document
    useEffect(() => {
        if (!iframeRef.current) return;
        const variables = extractColorVariables(iframeRef.current);

        // Store original colors for comparison
        const originalColorsMap: Record<string, string> = {};
        for (const variable of variables) {
            originalColorsMap[variable.name] = variable.value;
        }
        setOriginalColors(originalColorsMap);

        setColorVariables(
            variables.map((variable) => ({
                ...variable,
                displayName: formatColorVariable(variable.name),
            })),
        );

        // Load saved themes from localStorage
        try {
            const savedThemes = localStorage.getItem("feno-predefined-themes");
            if (savedThemes) {
                setPredefinedThemes(JSON.parse(savedThemes));
            }
        } catch (error) {
            console.error("Error loading themes from localStorage:", error);
        }
    }, [iframeRef]);

    // Handle color change
    const handleColorChange = useCallback(
        (name: string, value: string) => {
            if (!iframeDocument) return;

            // Update in the iframe
            updateColorVariable(iframeDocument, name, value);

            // Update in our state
            setColorVariables((prev) =>
                prev.map((variable) =>
                    variable.name === name ? { ...variable, value } : variable,
                ),
            );

            // Mark that we have changes
            if (originalColors[name] !== value) {
                setHasChanges(true);
            } else {
                // Check if we still have other changes
                const stillHasChanges = colorVariables.some(
                    (variable) =>
                        originalColors[variable.name] !== variable.value &&
                        variable.name !== name,
                );
                setHasChanges(stillHasChanges);
            }
        },
        [iframeDocument, originalColors, colorVariables],
    );

    // Generate themes using Gemini
    const handleGenerateThemes = async () => {
        if (!colorVariables.length || !iframeDocument) return;

        setIsGeneratingThemes(true);

        try {
            // Prepare current theme colors
            const currentTheme = colorVariables.reduce(
                (acc, variable) => {
                    acc[variable.name] = variable.value;
                    return acc;
                },
                {} as Record<string, string>,
            );

            // Generate themes
            const themes = await generateThemesWithGemini(currentTheme);

            // Save to localStorage
            localStorage.setItem(
                "feno-predefined-themes",
                JSON.stringify(themes),
            );

            // Update state
            setPredefinedThemes(themes);
        } catch (error) {
            console.error("Error generating themes:", error);
            alert("Failed to generate themes. Please try again later.");
        } finally {
            setIsGeneratingThemes(false);
        }
    };

    // Apply a predefined theme
    const handleApplyTheme = (theme: Theme) => {
        if (!iframeDocument) return;

        // Apply the theme to the document
        applyTheme(iframeDocument, theme.colors);

        // Update our state
        setColorVariables((prev) =>
            prev.map((variable) => ({
                ...variable,
                value: theme.colors[variable.name] || variable.value,
            })),
        );

        // Mark that we have changes
        setHasChanges(true);
    };

    // Save changes when exiting the theme editor
    useEffect(() => {
        // If we're leaving the theme editor and have changes
        if (modeId !== "theme-editor" && hasChanges && iframeDocument) {
            onHtmlChange({
                html: iframeDocument.documentElement.outerHTML,
                modeId: "theme-editor",
                modeLabel: "Theme Editor",
            });
            setHasChanges(false);
        }
    }, [modeId, hasChanges, iframeDocument, onHtmlChange]);

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Theme Colors</h3>
                <Button
                    onClick={handleGenerateThemes}
                    disabled={isGeneratingThemes}
                    className="flex items-center gap-2"
                    size="sm"
                >
                    <IconBrandGoogle size={16} />
                    {isGeneratingThemes
                        ? "Generating..."
                        : "Generate AI Themes"}
                </Button>
            </div>

            {predefinedThemes.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">AI Generated Themes</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {predefinedThemes.map((theme, idx) => (
                            <Button
                                key={theme.name}
                                variant="outline"
                                size="sm"
                                onClick={() => handleApplyTheme(theme)}
                                className="h-auto py-2 flex flex-col items-center gap-1"
                            >
                                <div className="flex gap-1">
                                    {Object.values(theme.colors)
                                        .slice(0, 4)
                                        .map((color, colorIdx) => (
                                            <div
                                                key={`${theme.name}-${colorIdx}`}
                                                className="w-3 h-3 rounded-full border"
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                            />
                                        ))}
                                </div>
                                <span className="text-xs">{theme.name}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {colorVariables.map((variable) => (
                    <div
                        key={variable.name}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-5 h-5 rounded border"
                                style={{ backgroundColor: variable.value }}
                            />
                            <span>{variable.displayName}</span>
                        </div>
                        <input
                            type="color"
                            value={variable.value}
                            onChange={(e) =>
                                handleColorChange(variable.name, e.target.value)
                            }
                            className="h-8 w-12 cursor-pointer"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Register the theme editor mode
export const ThemeEditorMode = (): EditorMode => {
    return {
        id: "theme-editor",
        label: "Theme Editor",
        editorRenderer: () => <ThemeEditor />,
        actionRenderer: (isActive: boolean) => (
            <Button
                size="icon"
                variant="ghost"
                className={cn(isActive && "bg-black text-primary-foreground")}
            >
                <IconPalette size={28} />
            </Button>
        ),
    };
};
