import { useClickOutside } from "@/libs/hooks/use-outside-click";
import { Button } from "@/libs/ui/button";
import { useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { rgbToHex } from "./style-utils";

interface ColorPickersProps {
    styles: React.CSSProperties;
    onStyleChange: (property: keyof React.CSSProperties, value: string) => void;
    showBgColorPicker: boolean;
    setShowBgColorPicker: (show: boolean) => void;
    showTextColorPicker: boolean;
    setShowTextColorPicker: (show: boolean) => void;
}

/**
 * Component containing text and background color pickers
 */
export const ColorPickers: React.FC<ColorPickersProps> = ({
    styles,
    onStyleChange,
    showBgColorPicker,
    setShowBgColorPicker,
    showTextColorPicker,
    setShowTextColorPicker,
}) => {
    const bgColorPickerRef = useRef<HTMLDivElement>(null);
    const textColorPickerRef = useRef<HTMLDivElement>(null);

    useClickOutside(bgColorPickerRef, () => setShowBgColorPicker(false));
    useClickOutside(textColorPickerRef, () => setShowTextColorPicker(false));

    return (
        <div className="flex flex-col gap-2">
            <div className="text-lg font-medium text-[var(--feno-text-1)]">
                Color
            </div>

            <div className="flex flex-col gap-1">
                {/* Text Color Row */}
                <div className="flex justify-between items-center">
                    <div className="text-base text-[var(--feno-text-1)]">
                        Text color
                    </div>
                    <div className="relative">
                        <Button
                            id="textColor"
                            variant="outline"
                            className="h-8 w-32 border border-[var(--feno-border-1)] rounded-lg hover:border-[var(--feno-border-2)] transition-colors"
                            style={{ backgroundColor: styles.color }}
                            onClick={() =>
                                setShowTextColorPicker(!showTextColorPicker)
                            }
                            aria-label="Select text color"
                        />
                        {showTextColorPicker && (
                            <div
                                ref={textColorPickerRef}
                                className="absolute right-0 top-full mt-1.5 z-10 bg-white p-1 rounded-lg shadow-lg border border-[var(--feno-border-1)]"
                            >
                                <HexColorPicker
                                    color={rgbToHex(
                                        styles.color || "rgb(0, 0, 0)",
                                    )}
                                    onChange={(color) =>
                                        onStyleChange("color", color)
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Background Color Row */}
                <div className="flex justify-between items-center">
                    <div className="text-base text-[var(--feno-text-1)]">
                        Background
                    </div>
                    <div className="relative">
                        <Button
                            id="bgColor"
                            variant="outline"
                            className="h-8 w-32 border border-[var(--feno-border-1)] rounded-lg hover:border-[var(--feno-border-2)] transition-colors"
                            style={{ backgroundColor: styles.backgroundColor }}
                            onClick={() =>
                                setShowBgColorPicker(!showBgColorPicker)
                            }
                            aria-label="Select background color"
                        />
                        {showBgColorPicker && (
                            <div
                                ref={bgColorPickerRef}
                                className="absolute right-0 top-full mt-1.5 z-10 bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                            >
                                <HexColorPicker
                                    color={rgbToHex(
                                        styles.backgroundColor ||
                                            "rgba(0, 0, 0, 0)",
                                    )}
                                    onChange={(color) =>
                                        onStyleChange("backgroundColor", color)
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
