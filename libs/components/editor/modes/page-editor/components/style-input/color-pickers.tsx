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
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                {/* Text Color */}
                <div className="flex items-center gap-1.5 relative">
                    <label
                        htmlFor="textColor"
                        className="text-[var(--feno-text-2)]"
                    >
                        Text
                    </label>
                    <Button
                        id="textColor"
                        variant="outline"
                        className="h-7 w-12 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
                        style={{ backgroundColor: styles.color }}
                        onClick={() => setShowTextColorPicker(true)}
                        aria-label="Select text color"
                    />
                    {showTextColorPicker && (
                        <div
                            ref={textColorPickerRef}
                            className="absolute right-0 top-full mt-1.5 z-10 bg-white p-1 rounded-xl shadow-lg border border-[var(--feno-interactive-resting-border)]"
                        >
                            <HexColorPicker
                                color={rgbToHex(styles.color || "rgb(0, 0, 0)")}
                                onChange={(color) =>
                                    onStyleChange("color", color)
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Background Color */}
                <div className="flex items-center gap-1.5 relative">
                    <label htmlFor="bgColor" className="text-xs text-gray-600">
                        Background
                    </label>
                    <Button
                        id="bgColor"
                        variant="outline"
                        className="h-7 w-12 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
                        style={{ backgroundColor: styles.backgroundColor }}
                        onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                        aria-label="Select background color"
                    />
                    {showBgColorPicker && (
                        <div
                            ref={bgColorPickerRef}
                            className="absolute right-0 top-full mt-1.5 z-10 bg-white p-2.5 rounded-md shadow-lg border border-gray-200"
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
    );
};
