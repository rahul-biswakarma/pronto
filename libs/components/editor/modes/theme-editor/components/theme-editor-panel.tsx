"use client";

import { useEffect, useState } from "react";
import type { ColorVariable } from "../types";
import { extractColorVariables, updateColorVariable } from "../utils";
import { HueSaturationControls } from "./hue-saturation-controls";
import { ThemeCustomization } from "./theme-customization";
import { hueVariableName, saturationVariableName } from "./utils";

interface ThemeEditorPanelProps {
    initialTheme?: Record<string, string>;
}

export const ThemeEditorPanel: React.FC<ThemeEditorPanelProps> = ({
    initialTheme = {},
}) => {
    const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);

    useEffect(() => {
        // Extract color variables from the document
        if (typeof document !== "undefined") {
            const variables = extractColorVariables(document);
            setColorVariables(variables);
        }
    }, []);

    const handleHueChange = (value: number) => {
        if (typeof document !== "undefined") {
            updateColorVariable(document, hueVariableName, value.toString());
            // Re-extract variables to update the UI
            const variables = extractColorVariables(document);
            setColorVariables(variables);
        }
    };

    const handleSaturationChange = (value: number) => {
        if (typeof document !== "undefined") {
            updateColorVariable(
                document,
                saturationVariableName,
                value.toString(),
            );
            // Re-extract variables to update the UI
            const variables = extractColorVariables(document);
            setColorVariables(variables);
        }
    };

    const handleIndividualColorChange = (name: string, value: string) => {
        if (typeof document !== "undefined") {
            updateColorVariable(document, name, value);
            // Re-extract variables to update the UI
            const variables = extractColorVariables(document);
            setColorVariables(variables);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
            <div className="flex flex-col gap-8">
                <h2 className="text-lg font-medium">Theme Editor</h2>

                <HueSaturationControls
                    onHueChange={handleHueChange}
                    onSaturationChange={handleSaturationChange}
                />

                <div className="space-y-4">
                    <h3 className="text-base font-medium">Individual Colors</h3>
                    <ThemeCustomization
                        colorVariables={colorVariables}
                        onColorChange={handleIndividualColorChange}
                    />
                </div>
            </div>
        </div>
    );
};
