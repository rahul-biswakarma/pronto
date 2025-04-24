import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Theme } from "../types";
import { getThemesFromStorage } from "../utils";

interface PredefinedThemesSectionProps {
    themes: Theme[];
    selectedThemeName: string | null;
    onSelectTheme: (theme: Theme) => void;
}

/**
 * Component for displaying and selecting from predefined themes
 */
export const PredefinedThemesSection: React.FC<
    PredefinedThemesSectionProps
> = ({ themes: propThemes, selectedThemeName, onSelectTheme }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [themes, setThemes] = useState<Theme[]>(propThemes);

    // Load themes from localStorage on mount
    useEffect(() => {
        const savedThemes = getThemesFromStorage();
        if (savedThemes.length > 0) {
            setThemes(savedThemes);
        } else {
            setThemes(propThemes);
        }
    }, [propThemes]);

    // Check if we can scroll in either direction
    const checkScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for potential rounding issues
        }
    }, []);

    // Set up scroll detection
    // biome-ignore lint/correctness/useExhaustiveDependencies: themes required to re-run
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

    // Function to scroll the container
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
        <div className="w-full">
            <div className="flex justify-between items-center p-3 px-4 pb-0">
                <p className="text-xs font-medium text-[var(--feno-text-1)]">
                    Themes
                </p>
                <div className="flex space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className="h-6 w-6 p-0 disabled:opacity-30"
                    >
                        <IconChevronLeft size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className="h-6 w-6 p-0 disabled:opacity-30"
                    >
                        <IconChevronRight size={14} />
                    </Button>
                </div>
            </div>
            {/* Horizontal scroll container */}
            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto p-4 scrollbar-hide"
                    style={{
                        scrollbarWidth: "none" /* Firefox */,
                        msOverflowStyle: "none" /* IE and Edge */,
                    }}
                >
                    <style>
                        {
                            ".scrollbar-hide::-webkit-scrollbar { display: none; }"
                        }
                    </style>

                    {themes.map((theme) => {
                        const isSelected = selectedThemeName === theme.name;
                        const hue = theme.colors["--feno-color-hue"] || "210";
                        const chroma =
                            Number.parseFloat(
                                theme.colors["--feno-color-chroma"] || "0.05",
                            ) * 0.7; // Reduce chroma for softer colors

                        // Use consistent values for all themes instead of light/dark distinction
                        const contentLightness = "0.97"; // Background of the preview
                        const textLightness = "0.55"; // Text and UI elements - softer appearance
                        const lineLightness = "0.75"; // Border color - more subtle

                        return (
                            <button
                                type="button"
                                key={theme.name}
                                onClick={() => onSelectTheme(theme)}
                                className={cn(
                                    "border rounded-xl w-36 flex-shrink-0 overflow-hidden transition-all focus:outline-none",
                                    isSelected
                                        ? "ring-2 ring-blue-500"
                                        : "border-border hover:border-blue-400",
                                )}
                            >
                                {/* Theme card preview */}
                                <div className="relative p-1 pb-2 w-full flex flex-col">
                                    {/* Phone/App preview mockup */}
                                    <div
                                        className="rounded-lg w-full h-24 p-2 mb-1 border overflow-hidden flex flex-col gap-1"
                                        style={{
                                            backgroundColor: `oklch(${contentLightness} ${chroma} ${hue})`,
                                            borderColor: `oklch(${lineLightness} ${chroma} ${hue})`,
                                        }}
                                    >
                                        {/* Status bar */}
                                        <div className="flex justify-between items-center w-full">
                                            <div
                                                className="w-8 h-1 rounded-sm"
                                                style={{
                                                    backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                }}
                                            />
                                            <div className="flex gap-1">
                                                <div
                                                    className="w-1 h-1 rounded-full"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-1 h-1 rounded-full"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-1 h-1 rounded-full"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Content area */}
                                        <div className="flex gap-2 items-start">
                                            <div
                                                className="w-8 h-8 rounded"
                                                style={{
                                                    backgroundColor: `oklch(0.6 ${chroma} ${hue})`,
                                                }}
                                            />
                                            <div className="flex-1 flex flex-col gap-1">
                                                <div
                                                    className="w-full h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-full h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-3/4 h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* List area */}
                                        <div className="mt-auto flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <div
                                                    className="w-10 h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-2 h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between">
                                                <div
                                                    className="w-8 h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-2 h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between">
                                                <div
                                                    className="w-12 h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-2 h-1 rounded-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${textLightness} ${chroma} ${hue})`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Theme name */}
                                    <span className="text-xs">
                                        {theme.name}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
