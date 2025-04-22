import { parsePixelValue } from "./style-utils";

interface BorderControlsProps {
    styles: React.CSSProperties;
    onStyleChange: (property: keyof React.CSSProperties, value: string) => void;
}

/**
 * Component for border-related controls (width, style)
 */
export const BorderControls: React.FC<BorderControlsProps> = ({
    styles,
    onStyleChange,
}) => {
    return (
        <div className="flex flex-col gap-3 border border-gray-200 rounded-xl shadow-sm bg-white p-3 relative">
            <h3 className="text-sm font-medium mb-1">Border</h3>

            {/* Border Width */}
            <div className="flex items-center justify-between">
                <label htmlFor="borderWidth" className="text-xs text-gray-600">
                    Width
                </label>
                <div className="relative">
                    <input
                        id="borderWidth"
                        type="number"
                        value={parsePixelValue(
                            String(styles.borderWidth || "0px"),
                        )}
                        onChange={(e) =>
                            onStyleChange("borderWidth", e.target.value)
                        }
                        className="w-24 h-6 border border-gray-300 rounded px-1 pr-5 text-xs"
                        min="0"
                    />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        px
                    </span>
                </div>
            </div>

            {/* Border Style */}
            <div className="flex items-center justify-between">
                <label htmlFor="borderStyle" className="text-xs text-gray-600">
                    Style
                </label>
                <select
                    id="borderStyle"
                    value={styles.borderStyle || "none"}
                    onChange={(e) =>
                        onStyleChange("borderStyle", e.target.value)
                    }
                    className="w-24 h-6 border border-gray-300 rounded px-1 text-xs bg-white"
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
            </div>
        </div>
    );
};
