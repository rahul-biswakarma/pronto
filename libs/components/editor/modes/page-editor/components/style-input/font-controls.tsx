import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/libs/ui/dropdown";
import { IconChevronDown } from "@tabler/icons-react";
import {
    AVAILABLE_FONTS,
    AVAILABLE_FONT_WEIGHTS,
    parsePixelValue,
} from "./style-utils";

interface FontControlsProps {
    styles: React.CSSProperties;
    onStyleChange: (property: keyof React.CSSProperties, value: string) => void;
}

/**
 * Component for font-related controls (size, weight, family)
 */
export const FontControls: React.FC<FontControlsProps> = ({
    styles,
    onStyleChange,
}) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-lg font-medium text-[var(--feno-text-1)]">
                Typography
            </div>

            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex-1 outline-none">
                        <div className="flex items-center justify-between h-8 px-3 rounded-lg border border-[var(--feno-border-1)] transition-colors">
                            <span className="text-base">
                                {styles.fontFamily || "Inter"}
                            </span>
                            <IconChevronDown className="h-4 w-4 opacity-70" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[180px] max-h-[260px] overflow-y-auto">
                        {AVAILABLE_FONTS.map((font) => (
                            <DropdownMenuItem
                                onClick={() =>
                                    onStyleChange("fontFamily", font)
                                }
                                key={font}
                            >
                                {font}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center h-8 border border-[var(--feno-border-1)] rounded-lg overflow-hidden">
                    <input
                        id="fontSize"
                        type="number"
                        value={parsePixelValue(
                            String(styles.fontSize || "16px"),
                        )}
                        onChange={(e) =>
                            onStyleChange("fontSize", e.target.value)
                        }
                        className="w-16 h-full px-3 text-base outline-none"
                        min="1"
                    />
                    <div className="flex px-2 h-full items-center justify-center">
                        <span className="text-[var(--feno-text-2)]">px</span>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger className="w-30 outline-none">
                        <div className="flex items-center justify-between h-8 px-3 rounded-lg border border-[var(--feno-border-1)] transition-colors">
                            <span className="text-base">
                                {AVAILABLE_FONT_WEIGHTS.find(
                                    (weight) =>
                                        weight.value === styles.fontWeight,
                                )?.label || "Regular"}
                            </span>
                            <IconChevronDown className="h-4 w-4 opacity-70" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[180px] max-h-[260px] overflow-y-auto">
                        {AVAILABLE_FONT_WEIGHTS.map((font) => (
                            <DropdownMenuItem
                                onClick={() =>
                                    onStyleChange("fontWeight", font.value)
                                }
                                key={font.value}
                            >
                                {font.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
