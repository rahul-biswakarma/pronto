import { Button } from "@/libs/ui/button";
import { Separator } from "@/libs/ui/separator";
import { IconCornerLeftUp, IconX } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { STYLE_SELECTED_CLASS, parsePixelValue, rgbToHex } from "./utils";

// Curated list of Google Fonts + System Fonts
const AVAILABLE_FONTS = [
    // System Fonts
    "System UI",
    "Arial",
    "Helvetica",
    "Verdana",
    "Georgia",
    "Times New Roman",
    "Courier New",
    // Google Fonts (add more as needed)
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Source Sans Pro",
    "Oswald",
    "Raleway",
    "Nunito",
    "Playfair Display",
    "Merriweather",
    "Inter",
];

// Helper hook to detect clicks outside an element
const useClickOutside = (
    ref: React.RefObject<HTMLElement | null>,
    handler: () => void,
) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
};

// Function to load Google Font stylesheet into iframe
function loadGoogleFont(fontFamily: string, document: Document | null) {
    if (!document || !fontFamily || AVAILABLE_FONTS.indexOf(fontFamily) < 7) {
        // Only load Google Fonts (index 7 onwards)
        return;
    }

    const fontId = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(fontId)) {
        return; // Already loaded
    }

    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css?family=${fontFamily.replace(/\s+/g, "+")}:wght@400;700&display=swap`; // Load regular and bold weights
    document.head.appendChild(link);
}

interface StyleControlsProps {
    selectedElement: HTMLElement | null;
    iframeDocument: Document | null; // Needed for checking parent boundaries
    setSelectedElement: (element: HTMLElement | null) => void;
    onStyleChange: (
        element: HTMLElement,
        property: keyof React.CSSProperties,
        value: string,
    ) => void;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
    selectedElement,
    iframeDocument, // Pass iframeDocument down
    setSelectedElement,
    onStyleChange,
}) => {
    const [styles, setStyles] = useState<React.CSSProperties>({});
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);

    const bgColorPickerRef = useRef<HTMLDivElement>(null);
    const textColorPickerRef = useRef<HTMLDivElement>(null);
    const borderColorPickerRef = useRef<HTMLDivElement>(null);

    useClickOutside(bgColorPickerRef, () => setShowBgColorPicker(false));
    useClickOutside(textColorPickerRef, () => setShowTextColorPicker(false));
    useClickOutside(borderColorPickerRef, () =>
        setShowBorderColorPicker(false),
    );

    // Update styles state when selected element changes
    useEffect(() => {
        if (selectedElement) {
            const computedStyle = window.getComputedStyle(selectedElement);
            const initialFontFamily = computedStyle.fontFamily
                .split(",")[0]
                .replace(/["']/g, "")
                .trim(); // Get the primary font
            setStyles({
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                fontSize: computedStyle.fontSize,
                fontWeight: computedStyle.fontWeight,
                fontFamily: initialFontFamily, // Use primary font
                // Add border properties
                borderWidth: computedStyle.borderWidth,
                borderStyle: computedStyle.borderStyle,
                borderColor: computedStyle.borderColor,
            });
            // Preload the initial font if it's a Google Font
            loadGoogleFont(initialFontFamily, iframeDocument);
        } else {
            setStyles({});
        }
        setShowBgColorPicker(false);
        setShowTextColorPicker(false);
        setShowBorderColorPicker(false);
    }, [selectedElement, iframeDocument]); // Added iframeDocument dependency

    // Handler for style changes from inputs
    const handleStyleChange = useCallback(
        (property: keyof React.CSSProperties, value: string) => {
            if (selectedElement) {
                let finalValue = value;
                let updateStateValue = value; // Value to store in local state

                if (property === "fontFamily") {
                    loadGoogleFont(value, iframeDocument);
                    const fallback = value.includes(" ") ? `"${value}"` : value;
                    const genericFallback = styles.fontFamily?.includes("serif")
                        ? "serif"
                        : "sans-serif";
                    finalValue = `${fallback}, ${genericFallback}`;
                    // updateStateValue remains the primary font name (value)
                } else if (
                    property === "borderWidth" ||
                    property === "fontSize"
                ) {
                    // Handle both pixel values
                    finalValue = `${value}px`; // Add px unit
                    updateStateValue = finalValue; // Store with px
                } else {
                    // Update local state for other properties
                    updateStateValue = value;
                }

                // Update local state
                setStyles((prevStyles) => ({
                    ...prevStyles,
                    [property]: updateStateValue,
                }));

                // Call the prop function to apply style and mark changes
                onStyleChange(selectedElement, property, finalValue);
            }
        },
        [selectedElement, onStyleChange, iframeDocument, styles.fontFamily],
    );

    if (!selectedElement) {
        return (
            <p className="text-sm text-gray-500 p-4 border border-gray-200 rounded-xl bg-white w-full">
                Select an element to edit its styles.
            </p>
        );
    }

    const tagName = selectedElement.tagName.toLowerCase();
    const parentElement = selectedElement.parentElement;
    const canSelectParent =
        parentElement &&
        parentElement !== iframeDocument?.body &&
        parentElement !== iframeDocument?.documentElement;

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between bg-pink-300/20 p-2 px-3 rounded-xl border border-pink-300/70">
                <div className="flex items-center gap-1">
                    <p className="text-sm font-medium">
                        <code className="rounded">{tagName}</code>
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:bg-gray-200 disabled:opacity-50"
                        disabled={!canSelectParent}
                        onClick={() => {
                            if (canSelectParent && parentElement) {
                                selectedElement.classList.remove(
                                    STYLE_SELECTED_CLASS,
                                );
                                parentElement.classList.add(
                                    STYLE_SELECTED_CLASS,
                                );
                                setSelectedElement(parentElement);
                            }
                        }}
                    >
                        <IconCornerLeftUp className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            selectedElement.classList.remove(
                                STYLE_SELECTED_CLASS,
                            );
                            setSelectedElement(null);
                        }}
                        size="icon"
                        className="size-7 hover:bg-gray-200"
                    >
                        <IconX className="size-4" />
                    </Button>
                </div>
            </div>

            {/* --- Style Controls --- */}
            <div className="flex flex-col gap-3 border border-gray-200 rounded-xl shadow-sm bg-white p-3 relative">
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
                                    styles.backgroundColor ||
                                        "rgba(0, 0, 0, 0)",
                                )}
                                onChange={(color) =>
                                    handleStyleChange("backgroundColor", color)
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
                        onClick={() =>
                            setShowTextColorPicker(!showTextColorPicker)
                        }
                        aria-label="Select text color"
                    />
                    {showTextColorPicker && (
                        <div
                            ref={textColorPickerRef}
                            className="absolute right-0 bottom-full mb-1 z-10 bg-white p-2 rounded shadow-lg border border-gray-200"
                        >
                            <HexColorPicker
                                color={rgbToHex(styles.color || "rgb(0, 0, 0)")}
                                onChange={(color) =>
                                    handleStyleChange("color", color)
                                }
                            />
                        </div>
                    )}
                </div>

                <Separator />

                {/* Border Width */}
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="borderWidth"
                        className="text-xs text-gray-600"
                    >
                        Border Width
                    </label>
                    <div className="relative">
                        <input
                            id="borderWidth"
                            type="number"
                            value={parsePixelValue(
                                String(styles.borderWidth || "0px"),
                            )}
                            onChange={(e) =>
                                handleStyleChange("borderWidth", e.target.value)
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
                    <label
                        htmlFor="borderStyle"
                        className="text-xs text-gray-600"
                    >
                        Border Style
                    </label>
                    <select
                        id="borderStyle"
                        value={styles.borderStyle || "none"}
                        onChange={(e) =>
                            handleStyleChange("borderStyle", e.target.value)
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
                                    handleStyleChange("borderColor", color)
                                }
                            />
                        </div>
                    )}
                </div>

                <Separator />

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
                                handleStyleChange("fontSize", e.target.value)
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
                    <label
                        htmlFor="fontWeight"
                        className="text-xs text-gray-600"
                    >
                        Weight
                    </label>
                    <select
                        id="fontWeight"
                        value={styles.fontWeight || "400"}
                        onChange={(e) =>
                            handleStyleChange("fontWeight", e.target.value)
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
                    <label
                        htmlFor="fontFamily"
                        className="text-xs text-gray-600"
                    >
                        Font
                    </label>
                    <select
                        id="fontFamily"
                        value={styles.fontFamily || "System UI"}
                        onChange={(e) =>
                            handleStyleChange("fontFamily", e.target.value)
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

                {/* TODO: Add more controls */}
            </div>
            {/* --- End Style Controls --- */}
        </div>
    );
};
