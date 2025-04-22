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
        <div className="flex items-center justify-between gap-2 rounded-md py-1.5">
            <label
                htmlFor="fontSize"
                className="text-sm text-gray-600 font-medium"
            >
                Font
            </label>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="flex items-center gap-1 h-7 px-2 rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
                            <span className="text-[14px]">
                                {styles.fontFamily || "System UI"}
                            </span>
                            <IconChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
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

                <div className="relative flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <input
                        id="fontSize"
                        type="number"
                        value={parsePixelValue(
                            String(styles.fontSize || "16px"),
                        )}
                        onChange={(e) =>
                            onStyleChange("fontSize", e.target.value)
                        }
                        className="w-14 h-7 px-2 text-[14px] outline-none focus:ring-1 focus:ring-gray-300"
                        min="1"
                    />
                    <span className="text-gray-400 pr-2 pointer-events-none">
                        px
                    </span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="flex items-center gap-1 h-7 px-2 rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
                            <span className="text-[14px]">
                                {AVAILABLE_FONT_WEIGHTS.find(
                                    (font) => font.value === styles.fontWeight,
                                )?.label || "Regular"}
                            </span>
                            <IconChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[120px]">
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
