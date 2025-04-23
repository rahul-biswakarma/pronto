import { Button } from "@/libs/ui/button";
import { IconPalette } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import { GenerateThemeButton } from "./components/generate-theme-button";
import { HueSaturationControls } from "./components/hue-saturation-controls";
import { PredefinedThemesSection } from "./components/predefined-themes-section";
import { ThemeCustomization } from "./components/theme-customization";
import { hueVariableName, saturationVariableName } from "./components/utils";
import type { ColorVariable, Theme } from "./types";
import {
    applyTheme,
    extractColorVariables,
    updateColorVariable,
} from "./utils";

const ThemeEditor: React.FC = () => {
    const { iframeDocument } = useEditor();
    const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedThemeName, setSelectedThemeName] = useState<string | null>(
        null,
    );
    const [initialColorVariables, setInitialColorVariables] = useState<
        ColorVariable[]
    >([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Extract color variables from iframe document on first load
    useEffect(() => {
        if (!iframeDocument) return;

        const extractedVars = extractColorVariables(iframeDocument);
        setColorVariables(extractedVars);
        setInitialColorVariables(extractedVars);
    }, [iframeDocument]);

    // Handle color variable change
    const handleColorChange = (name: string, value: string) => {
        const updatedVariables = colorVariables.map((variable) =>
            variable.name === name ? { ...variable, value } : variable,
        );
        setColorVariables(updatedVariables);

        if (iframeDocument) {
            // Apply the color change to the iframe
            updateColorVariable(iframeDocument, name, value);
        }
    };

    // Handle hue and saturation changes
    const handleHueChange = (value: number) => {
        if (iframeDocument) {
            updateColorVariable(
                iframeDocument,
                hueVariableName,
                value.toString(),
            );
            // Re-extract variables to update the UI
            const variables = extractColorVariables(iframeDocument);
            setColorVariables(variables);
        }
    };

    const handleSaturationChange = (value: number) => {
        if (iframeDocument) {
            updateColorVariable(
                iframeDocument,
                saturationVariableName,
                value.toString(),
            );
            // Re-extract variables to update the UI
            const variables = extractColorVariables(iframeDocument);
            setColorVariables(variables);
        }
    };

    // Handle theme selection
    const handleSelectTheme = (theme: Theme) => {
        if (iframeDocument) {
            setSelectedThemeName(theme.name);
            // Update color variables state with theme colors
            const updatedVariables = colorVariables.map((variable) => {
                const themeValue = theme.colors[variable.name];
                return themeValue
                    ? { ...variable, value: themeValue }
                    : variable;
            });
            setColorVariables(updatedVariables);

            // Apply theme to iframe
            applyTheme(iframeDocument, theme.colors);
        }
    };

    // Handle theme generation
    const handleGenerateThemesStarted = () => {
        setIsGenerating(true);
    };

    const handleGenerateThemesComplete = (newThemes: Theme[]) => {
        setThemes(newThemes);
        setIsGenerating(false);
    };

    return (
        <div className="flex flex-col h-full gap-2 feno-mod-container overflow-hidden min-w-[500px] max-w-[500px] p-3">
            <h3 className="text-sm font-medium leading-none">Theme Editor</h3>

            <HueSaturationControls
                onHueChange={handleHueChange}
                onSaturationChange={handleSaturationChange}
            />

            <ThemeCustomization
                colorVariables={colorVariables}
                onColorChange={handleColorChange}
            />

            <PredefinedThemesSection
                themes={themes}
                selectedThemeName={selectedThemeName}
                onSelectTheme={handleSelectTheme}
            />

            <GenerateThemeButton
                initialColorVariables={initialColorVariables}
                isGenerating={isGenerating}
                onGenerateStarted={handleGenerateThemesStarted}
                onGenerateComplete={handleGenerateThemesComplete}
            />
        </div>
    );
};

// Export theme editor mode
export const ThemeEditorMode = (): EditorMode => {
    return {
        id: "theme-editor",
        label: "Theme Editor",
        actionRenderer: (isActive) => (
            <Button
                variant="ghost"
                size="icon"
                className={isActive ? "bg-blue-500/10 text-blue-700" : ""}
            >
                <IconPalette className="size-[17px] stroke-[1.8]" />
            </Button>
        ),
        editorRenderer: () => <ThemeEditor />,
    };
};
