import { AVAILABLE_FONTS, parsePixelValue } from "../utils";

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
        <div className="flex flex-col gap-3 border border-gray-200 rounded-xl shadow-sm bg-white p-3 relative">
            <h3 className="text-sm font-medium mb-1">Typography</h3>

            {/* Font Size */}
            <div className="flex items-center justify-between">
                <label htmlFor="fontSize" className="text-xs text-gray-600">
                    Font Size
                </label>
                <div className="relative">
                    <input
                        id="fontSize"
                        type="number"
                        value={parsePixelValue(
                            String(styles.fontSize || "16px"),
                        )}
                        onChange={(e) =>
                            onStyleChange("fontSize", e.target.value)
                        }
                        className="w-24 h-6 border border-gray-300 rounded px-1 pr-5 text-xs"
                        min="1"
                    />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        px
                    </span>
                </div>
            </div>

            {/* Font Weight */}
            <div className="flex items-center justify-between">
                <label htmlFor="fontWeight" className="text-xs text-gray-600">
                    Weight
                </label>
                <select
                    id="fontWeight"
                    value={styles.fontWeight || "400"}
                    onChange={(e) =>
                        onStyleChange("fontWeight", e.target.value)
                    }
                    className="w-24 h-6 border border-gray-300 rounded px-1 text-xs bg-white"
                >
                    <option value="100">Thin</option>
                    <option value="200">Extra Light</option>
                    <option value="300">Light</option>
                    <option value="400">Normal</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi Bold</option>
                    <option value="700">Bold</option>
                    <option value="800">Extra Bold</option>
                    <option value="900">Black</option>
                </select>
            </div>

            {/* Font Family */}
            <div className="flex items-center justify-between">
                <label htmlFor="fontFamily" className="text-xs text-gray-600">
                    Font
                </label>
                <select
                    id="fontFamily"
                    value={styles.fontFamily || "System UI"}
                    onChange={(e) =>
                        onStyleChange("fontFamily", e.target.value)
                    }
                    className="w-24 h-6 border border-gray-300 rounded px-1 text-xs bg-white"
                >
                    {AVAILABLE_FONTS.map((font) => (
                        <option key={font} value={font}>
                            {font}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
