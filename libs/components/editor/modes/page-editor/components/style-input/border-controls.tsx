import { IconChevronDown } from "@tabler/icons-react";
import { ColorPickerPopover } from "./color-picker-popover";
import { parsePixelValue } from "./style-utils";

interface BorderControlsProps {
    styles: React.CSSProperties;
    onStyleChange: (property: keyof React.CSSProperties, value: string) => void;
    showBorderColorPicker?: boolean;
    setShowBorderColorPicker?: (show: boolean) => void;
}

/**
 * Component for border-related controls (width, style, color) in a single row
 */
export const BorderControls: React.FC<BorderControlsProps> = ({
    styles,
    onStyleChange,
    showBorderColorPicker,
    setShowBorderColorPicker,
}) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-lg font-medium text-[var(--feno-text-1)]">
                Border
            </div>

            <div className="flex flex-col gap-3">
                {/* Border Style Dropdown */}

                {/* Border Width and Color */}
                <div className="flex gap-2">
                    <div className="relative w-full">
                        <select
                            id="borderStyle"
                            value={styles.borderStyle || "none"}
                            onChange={(e) =>
                                onStyleChange("borderStyle", e.target.value)
                            }
                            className="w-full h-8 px-3 border border-[var(--feno-border-1)] rounded-lg text-base outline-none hover:border-gray-300 transition-colors appearance-none"
                        >
                            <option value="none">None</option>
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="groove">Groove</option>
                            <option value="ridge">Ridge</option>
                            <option value="inset">Inset</option>
                            <option value="outset">Outset</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <IconChevronDown className="h-4 w-4 opacity-70" />
                        </div>
                    </div>
                    {/* Width */}
                    <div className="flex-1 relative">
                        <div className="flex items-center h-8 border border-[var(--feno-border-1)] rounded-lg overflow-hidden">
                            <input
                                id="fontSize"
                                type="number"
                                value={parsePixelValue(
                                    String(styles.borderWidth || "0px"),
                                )}
                                onChange={(e) =>
                                    onStyleChange("borderWidth", e.target.value)
                                }
                                className="w-16 h-full px-3 text-base outline-none"
                                min="0"
                            />
                            <div className="flex px-2 h-full items-center justify-center">
                                <span className="text-[var(--feno-text-2)]">
                                    px
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Color */}
                    {showBorderColorPicker !== undefined &&
                        setShowBorderColorPicker !== undefined && (
                            <div className="flex items-center">
                                <ColorPickerPopover
                                    color={styles.borderColor}
                                    onChange={(color) =>
                                        onStyleChange("borderColor", color)
                                    }
                                    open={showBorderColorPicker}
                                    onOpenChange={setShowBorderColorPicker}
                                />
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};
