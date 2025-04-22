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
        <div className="flex items-center justify-between gap-2 rounded-md py-1.5">
            <label
                htmlFor="borderWidth"
                className="text-sm text-gray-600 font-medium"
            >
                Border
            </label>
            <div className="flex items-center gap-2">
                {/* Width */}
                <div className="relative flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <input
                        id="borderWidth"
                        type="number"
                        value={parsePixelValue(
                            String(styles.borderWidth || "0px"),
                        )}
                        onChange={(e) =>
                            onStyleChange("borderWidth", e.target.value)
                        }
                        className="w-14 h-7 px-2 text-[14px] outline-none focus:ring-1 focus:ring-gray-300"
                        min="0"
                    />
                    <span className="text-gray-400 pr-2 pointer-events-none">
                        px
                    </span>
                </div>

                {/* Style */}
                <select
                    id="borderStyle"
                    value={styles.borderStyle || "none"}
                    onChange={(e) =>
                        onStyleChange("borderStyle", e.target.value)
                    }
                    className="h-7 border border-gray-200 rounded-md px-2 text-[14px] outline-none hover:border-gray-300 transition-colors"
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

                {/* Color */}
                {showBorderColorPicker !== undefined &&
                    setShowBorderColorPicker !== undefined && (
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="h-7 w-8 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
                                style={{
                                    backgroundColor:
                                        styles.borderColor || "transparent",
                                }}
                                onClick={() =>
                                    setShowBorderColorPicker(
                                        !showBorderColorPicker,
                                    )
                                }
                                aria-label="Select border color"
                            />
                        </div>
                    )}
            </div>
        </div>
    );
};
