import { ColorPickerPopover } from "./color-picker-popover";

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
                    <div>
                        <ColorPickerPopover
                            color={styles.color}
                            onChange={(color) => onStyleChange("color", color)}
                            open={showTextColorPicker}
                            onOpenChange={setShowTextColorPicker}
                            triggerClassName="h-8 w-32 border border-[var(--feno-border-1)] rounded-lg hover:border-[var(--feno-border-2)] transition-colors"
                        />
                    </div>
                </div>

                {/* Background Color Row */}
                <div className="flex justify-between items-center">
                    <div className="text-base text-[var(--feno-text-1)]">
                        Background
                    </div>
                    <div>
                        <ColorPickerPopover
                            color={styles.backgroundColor}
                            onChange={(color) =>
                                onStyleChange("backgroundColor", color)
                            }
                            open={showBgColorPicker}
                            onOpenChange={setShowBgColorPicker}
                            triggerClassName="h-8 w-32 border border-[var(--feno-border-1)] rounded-lg hover:border-[var(--feno-border-2)] transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
