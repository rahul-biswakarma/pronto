"use client";
import { updateColorVariable } from "../utils";
import { HueSaturationControls } from "./hue-chorma-controls";
import { chromaVariableName, hueVariableName } from "./utils";

interface ThemeEditorPanelProps {
    initialTheme?: Record<string, string>;
}

export const ThemeEditorPanel: React.FC<ThemeEditorPanelProps> = () => {
    const handleHueChange = (value: number) => {
        if (typeof document !== "undefined") {
            updateColorVariable(document, hueVariableName, value.toString());
        }
    };

    const handleSaturationChange = (value: number) => {
        if (typeof document !== "undefined") {
            updateColorVariable(document, chromaVariableName, value.toString());
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
            </div>
        </div>
    );
};
