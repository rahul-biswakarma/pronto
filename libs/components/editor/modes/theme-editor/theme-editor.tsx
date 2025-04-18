import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconPalette } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import {
    extractColorVariables,
    formatColorVariable,
    updateColorVariable,
} from "./utils";

interface ColorVariable {
    name: string;
    value: string;
    displayName: string;
}

// Theme Editor component
const ThemeEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId, iframeRef } = useEditor();
    const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);
    const [originalColors, setOriginalColors] = useState<
        Record<string, string>
    >({});
    const [hasChanges, setHasChanges] = useState(false);

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
            <h3 className="text-lg font-medium">Theme Colors</h3>
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
