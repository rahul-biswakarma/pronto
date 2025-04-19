import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/libs/ui/accordion";
import { Button } from "@/libs/ui/button";
import { Separator } from "@/libs/ui/separator";
import { cn } from "@/libs/utils/misc";
import {
    IconBrandGoogle,
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
    IconPalette,
} from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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

// Separate component for theme customization section
const ThemeCustomization: React.FC<{
    colorVariables: ColorVariable[];
    onColorChange: (name: string, value: string) => void;
}> = ({ colorVariables, onColorChange }) => {
    if (colorVariables.length === 0) return null;

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="customize-colors" className="border-b-0">
                <AccordionTrigger className="py-2 text-[14px] hover:no-underline rounded-md hover:bg-muted/50 transition-colors text-sm font-medium text-muted-foreground [&[data-state=open]>svg]:rotate-180">
                    Customize Colors
                    {/* Keep the chevron, remove default rotation if needed */}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-1 px-1 space-y-1">
                    {colorVariables.map((variable) => (
                        <div
                            key={variable.name}
                            className="flex items-center justify-between gap-4 py-1.5 rounded-md hover:bg-muted/30"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-sm truncate">
                                    {variable.displayName}
                                </span>
                            </div>
                            {/* Keep the color input separate */}
                            <div className="relative h-7 w-9 border rounded overflow-hidden flex-shrink-0">
                                <input
                                    type="color"
                                    value={variable.value}
                                    onChange={(e) =>
                                        onColorChange(
                                            variable.name,
                                            e.target.value,
                                        )
                                    }
                                    className="absolute inset-0 w-full h-full cursor-pointer border-none p-0 appearance-none bg-transparent"
                                    title={`Select color for ${variable.displayName}`}
                                />
                            </div>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

// Extracted component for Predefined Themes section
const PredefinedThemesSection: React.FC<{
    themes: Theme[];
    selectedThemeName: string | null;
    onSelectTheme: (theme: Theme) => void;
}> = ({ themes, selectedThemeName, onSelectTheme }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for potential rounding issues
        }
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        checkScroll(); // Initial check

        container?.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        // Use ResizeObserver for more robust content change detection
        let resizeObserver: ResizeObserver | null = null;
        if (container && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(checkScroll);
            resizeObserver.observe(container);
        }

        return () => {
            container?.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
            if (resizeObserver && container) {
                resizeObserver.unobserve(container);
            }
        };
    }, [checkScroll, themes]); // Re-run if themes change

    const scroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = container.clientWidth * 0.8; // Scroll by 80% of visible width
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (themes.length === 0) return null;

    return (
        <div className="pt-2">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-muted-foreground">
                    Predefined Themes
                </h4>
                <div className="flex space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className="h-6 w-6 disabled:opacity-30"
                    >
                        <IconChevronLeft size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className="h-6 w-6 disabled:opacity-30"
                    >
                        <IconChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {/* Horizontal scroll container */}
            <div
                ref={scrollContainerRef}
                className="flex space-x-3 overflow-x-auto pb-0 -mx-4 p-4 pt-2 scrollbar-hide"
                style={{
                    scrollbarWidth: "none" /* Firefox */,
                    msOverflowStyle: "none" /* IE and Edge */,
                }}
            >
                <style>
                    {".scrollbar-hide::-webkit-scrollbar { display: none; }"}
                </style>
                {/* Webkit */}
                {themes.map((theme) => {
                    const isSelected = selectedThemeName === theme.name;
                    const primaryColor =
                        theme.colors["--primary"] ||
                        Object.values(theme.colors)[0] ||
                        "#000000"; // Fallback color
                    const accentColors = Object.values(theme.colors)
                        .filter((c) => c !== primaryColor)
                        .slice(0, 3);

                    return (
                        <button
                            type="button"
                            key={theme.name}
                            onClick={() => onSelectTheme(theme)}
                            className={cn(
                                "border rounded-lg p-2.5 w-36 flex-shrink-0 text-left transition-all duration-150 focus:outline-none",
                                isSelected
                                    ? "border-blue-500/90 ring-2 ring-blue-500/90 ring-offset-2 ring-offset-background"
                                    : "border-border hover:border-muted-foreground",
                            )}
                        >
                            {/* Simplified Preview Area */}
                            <div
                                className="h-20 rounded bg-muted/50 border border-border/50 mb-2 p-1.5 flex flex-col justify-between relative overflow-hidden"
                                style={{
                                    backgroundColor: primaryColor,
                                }}
                            >
                                <div className="flex space-x-1">
                                    {/* Dots representing window controls */}
                                    <div className="w-2 h-2 rounded-full bg-red-500/70" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/70" />
                                </div>
                                <div className="flex justify-end space-x-1.5">
                                    {accentColors.map((color, idx) => (
                                        <div
                                            key={`${theme.name}-accent-${color}-${idx}`}
                                            className="w-4 h-4 rounded border border-background/50"
                                            style={{
                                                backgroundColor: color,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-medium truncate">
                                    {theme.name}
                                </span>
                                {isSelected && (
                                    <IconCheck
                                        size={16}
                                        className="text-primary flex-shrink-0"
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Theme Editor component
const ThemeEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId, iframeRef } = useEditor();
    const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);
    const [originalColors, setOriginalColors] = useState<
        Record<string, string>
    >({});
    const [hasChanges, setHasChanges] = useState(false);
    const [predefinedThemes, setPredefinedThemes] = useState<Theme[]>([]);
    const [selectedThemeName, setSelectedThemeName] = useState<string | null>(
        null,
    );
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

        // Set as selected
        setSelectedThemeName(theme.name);

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
        <div className="p-4 space-y-4 w-[600px] min-h-0">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Theme Colors</h3>
                {predefinedThemes.length === 0 && (
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
                )}
            </div>

            <PredefinedThemesSection
                themes={predefinedThemes}
                selectedThemeName={selectedThemeName}
                onSelectTheme={handleApplyTheme}
            />

            <Separator className="my-4" />

            <div className="space-y-3">
                <ThemeCustomization
                    colorVariables={colorVariables}
                    onColorChange={handleColorChange}
                />
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
                className={cn(
                    "hover:bg-pink-500/10 hover:text-pink-500",
                    isActive && " bg-pink-500/10 !text-pink-500",
                )}
            >
                <IconPalette size={28} />
            </Button>
        ),
    };
};
