import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../../../context/editor.context";
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
    const { portfolioId } = useEditor();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [themes, setThemes] = useState<Theme[]>(propThemes);

    // Load themes from localStorage on mount
    useEffect(() => {
        const savedThemes = getThemesFromStorage(portfolioId);
        if (savedThemes.length > 0) {
            setThemes(savedThemes);
        } else {
            setThemes(propThemes);
        }
    }, [propThemes, portfolioId]);

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

    return (
        <div className="w-full">
            <div
                className={cn(
                    "flex justify-between items-center p-3 px-4 pb-0",
                    themes.length === 0 && "pt-0",
                )}
            >
                <p className="text-xs font-medium text-[var(--feno-text-1)]">
                    Themes
                </p>
                <div
                    className={cn(
                        "flex space-x-1",
                        themes.length === 0 && "hidden",
                    )}
                >
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
            <div className={cn("relative", themes.length === 0 && "hidden")}>
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
                        const lineLightness = "0.75"; // Border color - more subtle

                        // Generate color variants for the boxes
                        const colorVariants = [
                            { l: "0.85", c: chroma * 1.2 }, // Lighter variant
                            { l: "0.75", c: chroma * 1.5 }, // Medium-light variant
                            { l: "0.65", c: chroma * 1.8 }, // Medium-dark variant
                            { l: "0.55", c: chroma * 2.0 }, // Darker variant
                        ];

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
                                    {/* Phone/App preview mockup with gradient */}
                                    <div
                                        className="relative rounded-lg w-full h-24 p-2 mb-1 border overflow-hidden flex flex-col gap-1"
                                        style={{
                                            background: `linear-gradient(135deg, oklch(${contentLightness} ${chroma * 0.8} ${hue}) 0%, oklch(${
                                                Number(contentLightness) - 0.03
                                            } ${chroma * 1.2} ${
                                                Number(hue) + 5
                                            }) 100%)`,
                                            borderColor: `oklch(${lineLightness} ${chroma} ${hue})`,
                                        }}
                                    >
                                        {/* Color variant boxes - bottom right */}
                                        <div className="absolute bottom-2 right-2 flex gap-1">
                                            {colorVariants.map((variant) => (
                                                <div
                                                    key={variant.l + variant.c}
                                                    className="w-5 h-2.5 rounded-sm shadow-sm"
                                                    style={{
                                                        backgroundColor: `oklch(${variant.l} ${variant.c} ${hue})`,
                                                    }}
                                                />
                                            ))}
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
