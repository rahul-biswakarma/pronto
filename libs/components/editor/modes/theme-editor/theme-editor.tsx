"use client";

import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import {
    IconChevronDown,
    IconChevronUp,
    IconPalette,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import { GenerateThemeButton } from "./components/generate-theme-button";
import { HueSaturationControls } from "./components/hue-chorma-controls";
import { PredefinedThemesSection } from "./components/predefined-themes-section";
import { chromaVariableName, hueVariableName } from "./components/utils";
import type { ColorVariable, Theme } from "./types";
import {
    applyTheme,
    extractColorVariables,
    getThemesFromStorage,
    updateColorVariable,
} from "./utils";

const ThemeEditor: React.FC = () => {
    const { iframeDocument } = useEditor();

    const [showAdvancedControls, setShowAdvancedControls] = useState(false);
    const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedThemeName, setSelectedThemeName] = useState<string | null>(
        null,
    );
    const [initialColorVariables, setInitialColorVariables] = useState<
        ColorVariable[]
    >([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasStoredThemes, setHasStoredThemes] = useState(false);

    // Check for stored themes on mount
    useEffect(() => {
        const savedThemes = getThemesFromStorage();
        if (savedThemes.length > 0) {
            setThemes(savedThemes);
            setHasStoredThemes(true);
        }
    }, []);

    // Extract color variables from iframe document on first load
    useEffect(() => {
        if (!iframeDocument) return;

        const extractedVars = extractColorVariables(iframeDocument);
        setColorVariables(extractedVars);
        setInitialColorVariables(extractedVars);
    }, [iframeDocument]);

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
                chromaVariableName,
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
        setHasStoredThemes(true); // Set to true when themes are generated
    };

    return (
        <AnimatePresence>
            <div className="flex h-full w-full flex-col gap-1.5 min-w-[500px] max-w-[500px]">
                <div
                    className={cn(
                        "feno-mod-container flex flex-col gap-2",
                        !hasStoredThemes && "flex-row items-center",
                    )}
                >
                    <PredefinedThemesSection
                        themes={themes}
                        selectedThemeName={selectedThemeName}
                        onSelectTheme={handleSelectTheme}
                    />

                    {!hasStoredThemes && (
                        <div className="pb-3 px-4">
                            <GenerateThemeButton
                                initialColorVariables={initialColorVariables}
                                isGenerating={isGenerating}
                                onGenerateStarted={handleGenerateThemesStarted}
                                onGenerateComplete={
                                    handleGenerateThemesComplete
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="feno-mod-container flex flex-col gap-1">
                    <div
                        onClick={() =>
                            setShowAdvancedControls(!showAdvancedControls)
                        }
                        className={cn(
                            "flex justify-between items-center p-3 px-4 text-xs font-medium text-[var(--feno-text-1)]  border-[var(--feno-border-1)]",
                            showAdvancedControls && "border-b",
                        )}
                    >
                        Advanced Controls
                        <div className="size-6 flex items-center justify-center hover:bg-[var(--feno-interactive-hovered-bg)] hover:border-[var(--feno-interactive-hovered-border)] rounded-lg">
                            {!showAdvancedControls ? (
                                <IconChevronUp className="size-4" />
                            ) : (
                                <IconChevronDown className="size-4" />
                            )}
                        </div>
                    </div>
                    <AnimatePresence>
                        {showAdvancedControls && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="overflow-hidden"
                            >
                                <div className="p-3 px-4">
                                    <HueSaturationControls
                                        onHueChange={handleHueChange}
                                        onSaturationChange={
                                            handleSaturationChange
                                        }
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AnimatePresence>
    );
};

// Export theme editor mode
export const ThemeEditorMode = (): EditorMode => {
    return {
        id: "theme-editor",
        label: "Theme Editor",
        actionRenderer: (isActive) => (
            <Button
                variant="custom"
                size="icon"
                className={cn("feno-mode-button", {
                    "feno-mode-active-button": isActive,
                })}
            >
                <IconPalette className="size-[17px] stroke-[1.8]" />
            </Button>
        ),
        editorRenderer: () => <ThemeEditor />,
    };
};
