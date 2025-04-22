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
    showBorderColorPicker: boolean;
    setShowBorderColorPicker: (show: boolean) => void;
}

/**
 * Component containing all color picker controls
 */
export const ColorPickers: React.FC<ColorPickersProps> = ({
    styles,
    onStyleChange,
    showBgColorPicker,
    setShowBgColorPicker,
    showTextColorPicker,
    setShowTextColorPicker,
    showBorderColorPicker,
    setShowBorderColorPicker,
}) => {
    const bgColorPickerRef = useRef<HTMLDivElement>(null);
    const textColorPickerRef = useRef<HTMLDivElement>(null);
    const borderColorPickerRef = useRef<HTMLDivElement>(null);

    useClickOutside(bgColorPickerRef, () => setShowBgColorPicker(false));
    useClickOutside(textColorPickerRef, () => setShowTextColorPicker(false));
    useClickOutside(borderColorPickerRef, () =>
        setShowBorderColorPicker(false),
    );

    return (
        <div className="flex flex-col gap-3 border border-gray-200 rounded-xl shadow-sm bg-white p-3 relative">
            <h3 className="text-sm font-medium mb-1">Colors</h3>

            {/* Background Color */}
            <div className="flex items-center justify-between relative">
                <span className="text-xs text-gray-600">Background</span>
                <Button
                    variant="outline"
                    className="h-6 w-24 border border-gray-300 rounded"
                    style={{ backgroundColor: styles.backgroundColor }}
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    aria-label="Select background color"
                />
                {showBgColorPicker && (
                    <div
                        ref={bgColorPickerRef}
                        className="absolute right-0 bottom-full mb-1 z-10 bg-white p-2 rounded shadow-lg border border-gray-200"
                    >
                        <HexColorPicker
                            color={rgbToHex(
                                styles.backgroundColor || "rgba(0, 0, 0, 0)",
                            )}
                            onChange={(color) =>
                                onStyleChange("backgroundColor", color)
                            }
                        />
                    </div>
                )}
            </div>

            {/* Text Color */}
            <div className="flex items-center justify-between relative">
                <span className="text-xs text-gray-600">Text</span>
                <Button
                    variant="outline"
                    className="h-6 w-24 border border-gray-300 rounded"
                    style={{ backgroundColor: styles.color }}
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    aria-label="Select text color"
                />
                {showTextColorPicker && (
                    <div
                        ref={textColorPickerRef}
                        className="absolute right-0 bottom-full mb-1 z-10 bg-white p-2 rounded shadow-lg border border-gray-200"
                    >
                        <HexColorPicker
                            color={rgbToHex(styles.color || "rgb(0, 0, 0)")}
                            onChange={(color) => onStyleChange("color", color)}
                        />
                    </div>
                )}
            </div>

            {/* Border Color */}
            <div className="flex items-center justify-between relative">
                <span className="text-xs text-gray-600">Border Color</span>
                <Button
                    variant="outline"
                    className="h-6 w-24 border border-gray-300 rounded"
                    style={{ backgroundColor: styles.borderColor }}
                    onClick={() =>
                        setShowBorderColorPicker(!showBorderColorPicker)
                    }
                    aria-label="Select border color"
                />
                {showBorderColorPicker && (
                    <div
                        ref={borderColorPickerRef}
                        className="absolute right-0 bottom-full mb-1 z-10 bg-white p-2 rounded shadow-lg border border-gray-200"
                    >
                        <HexColorPicker
                            color={rgbToHex(
                                styles.borderColor || "rgb(0, 0, 0)",
                            )}
                            onChange={(color) =>
                                onStyleChange("borderColor", color)
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
