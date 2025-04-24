import { Button } from "@/libs/ui/button";
import { IconBrandGoogle } from "@tabler/icons-react";
import type { ColorVariable, Theme } from "../types";
import { generateThemesWithGemini } from "../utils";

interface GenerateThemeButtonProps {
    initialColorVariables: ColorVariable[];
    isGenerating: boolean;
    onGenerateStarted: () => void;
    onGenerateComplete: (themes: Theme[]) => void;
}

/**
 * Button to generate themes using Gemini AI
 */
export const GenerateThemeButton: React.FC<GenerateThemeButtonProps> = ({
    initialColorVariables,
    isGenerating,
    onGenerateStarted,
    onGenerateComplete,
}) => {
    const handleGenerateThemes = async () => {
        if (initialColorVariables.length === 0) return;

        onGenerateStarted();

        try {
            // Prepare current theme colors
            const currentTheme = initialColorVariables.reduce(
                (acc, variable) => {
                    acc[variable.name] = variable.value;
                    return acc;
                },
                {} as Record<string, string>,
            );

            console.log(currentTheme);

            // Generate themes
            const themes = await generateThemesWithGemini(currentTheme);

            // Themes are already saved by generateThemesWithGemini function,
            // so no need to manually save here

            // Update state through callback
            onGenerateComplete(themes);
        } catch (error) {
            console.error("Error generating themes:", error);
            alert("Failed to generate themes. Please try again later.");
            onGenerateComplete([]);
        }
    };

    return (
        <Button
            onClick={handleGenerateThemes}
            disabled={isGenerating || initialColorVariables.length === 0}
            className="w-full mt-3 flex items-center justify-center gap-1 text-xs"
            size="sm"
            variant="outline"
        >
            <IconBrandGoogle size={14} />
            {isGenerating ? "Generating..." : "Generate with AI"}
        </Button>
    );
};
