import { Button } from "@/libs/ui/button";
import { IconCornerLeftUp, IconX } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { STYLE_SELECTED_CLASS, parsePixelValue, rgbToHex } from "./utils";

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
    iframeDocument,
    setSelectedElement,
    onStyleChange,
}) => {
    const [styles, setStyles] = useState<React.CSSProperties>({});

    // Update styles state when selected element changes
    useEffect(() => {
        if (selectedElement) {
            const computedStyle = window.getComputedStyle(selectedElement);
            setStyles({
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                fontSize: computedStyle.fontSize,
                fontWeight: computedStyle.fontWeight,
                // Add other properties as needed
            });
        } else {
            setStyles({}); // Clear styles when no element is selected
        }
    }, [selectedElement]);

    // Handler for style changes from inputs
    const handleStyleChange = useCallback(
        (property: keyof React.CSSProperties, value: string) => {
            if (selectedElement) {
                // Update local state for immediate feedback in controls
                setStyles((prevStyles) => ({
                    ...prevStyles,
                    [property]: value,
                }));
                // Call the prop function to apply style and mark changes
                onStyleChange(selectedElement, property, value);
            }
        },
        [selectedElement, onStyleChange],
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
            <div className="flex flex-col gap-3 border border-gray-200 rounded-xl shadow-sm bg-white  p-3">
                {/* Background Color */}
                <div className="flex items-center justify-between">
                    <label htmlFor="bgColor" className="text-xs text-gray-600">
                        Background
                    </label>
                    <input
                        id="bgColor"
                        type="color"
                        value={rgbToHex(
                            styles.backgroundColor || "rgba(0, 0, 0, 0)",
                        )}
                        onChange={(e) =>
                            handleStyleChange("backgroundColor", e.target.value)
                        }
                        className="w-16 h-6 border border-gray-300 rounded cursor-pointer"
                    />
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="textColor"
                        className="text-xs text-gray-600"
                    >
                        Text
                    </label>
                    <input
                        id="textColor"
                        type="color"
                        value={rgbToHex(styles.color || "rgb(0, 0, 0)")}
                        onChange={(e) =>
                            handleStyleChange("color", e.target.value)
                        }
                        className="w-16 h-6 border border-gray-300 rounded cursor-pointer"
                    />
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between">
                    <label htmlFor="fontSize" className="text-xs text-gray-600">
                        Font Size
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            id="fontSize"
                            type="number"
                            // Fix: Ensure value passed to parsePixelValue is a string
                            value={parsePixelValue(
                                String(styles.fontSize || "16px"),
                            )}
                            onChange={(e) =>
                                handleStyleChange(
                                    "fontSize",
                                    `${e.target.value}px`,
                                )
                            }
                            className="w-16 h-6 border border-gray-300 rounded px-1 text-xs"
                            min="1"
                        />
                        <span className="text-xs text-gray-500">px</span>
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
                        className="w-20 h-6 border border-gray-300 rounded px-1 text-xs bg-white"
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

                {/* TODO: Add more controls */}
            </div>
            {/* --- End Style Controls --- */}
        </div>
    );
};
