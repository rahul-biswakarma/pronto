import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import {
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Theme } from "../types";

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
> = ({ themes, selectedThemeName, onSelectTheme }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
        <div>
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-medium text-muted-foreground px-3">
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
            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="relative flex space-x-3 overflow-x-auto -mx-4 p-7 pb-2 pt-2 scrollbar-hide"
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
                                    "border rounded-lg p-1.5 w-36 flex-shrink-0 text-left transition-all duration-150 focus:outline-none",
                                    isSelected
                                        ? "border-blue-700/90 ring-2 ring-blue-700/90 ring-offset-2 ring-offset-background"
                                        : "border-border hover:border-blue-400 hover:bg-blue-300/10",
                                )}
                            >
                                {/* Theme preview */}
                                <div
                                    className="h-20 rounded-lg bg-muted/50 border border-border/50 mb-2 p-1.5 flex flex-col justify-between relative overflow-hidden"
                                    style={{
                                        background: `linear-gradient(143deg, ${accentColors[0] || "#f0f0f0"} 0%, ${accentColors[1] || "#e0e0e0"} 50%, ${accentColors[2] || "#d0d0d0"} 100%)`,
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
                                                key={`${theme.name}-accent-${idx}`}
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

                {/* Gradient fades for scrolling indication */}
                {canScrollLeft && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-white" />
                )}
                {canScrollRight && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-white" />
                )}
            </div>
        </div>
    );
};
