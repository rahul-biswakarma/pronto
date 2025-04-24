import { Separator } from "@/libs/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { BorderControls } from "./style-input/border-controls";
import { ColorPickers } from "./style-input/color-pickers";
import { FontControls } from "./style-input/font-controls";
import { SpacingControls } from "./style-input/spacing-controls";
import { StyleElementSelector } from "./style-input/style-element-selector";
import { loadGoogleFont } from "./style-input/style-utils";

interface StyleControlsProps {
    selectedElement: HTMLElement | null;
    iframeDocument: Document | null; // Needed for checking parent boundaries
    setSelectedElement: (element: HTMLElement | null) => void;
    onStyleChange: (
        element: HTMLElement,
        property: keyof React.CSSProperties,
        value: string,
    ) => void;
    isGenerating: boolean;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
    selectedElement,
    iframeDocument,
    setSelectedElement,
    onStyleChange,
    isGenerating,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [styles, setStyles] = useState<React.CSSProperties>({});
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);

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
                // Add margin properties
                marginTop: computedStyle.marginTop,
                marginRight: computedStyle.marginRight,
                marginBottom: computedStyle.marginBottom,
                marginLeft: computedStyle.marginLeft,
                // Add padding properties
                paddingTop: computedStyle.paddingTop,
                paddingRight: computedStyle.paddingRight,
                paddingBottom: computedStyle.paddingBottom,
                paddingLeft: computedStyle.paddingLeft,
            });
            // Preload the initial font if it's a Google Font
            loadGoogleFont(initialFontFamily, iframeDocument);
        } else {
            setStyles({});
        }
        setShowBgColorPicker(false);
        setShowTextColorPicker(false);
        setShowBorderColorPicker(false);
    }, [selectedElement, iframeDocument]);

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

    return (
        <div className="w-full flex flex-col gap-4 feno-mod-container overflow-hidden">
            <StyleElementSelector
                isGenerating={isGenerating}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                selectedElement={selectedElement}
                iframeDocument={iframeDocument}
                setSelectedElement={setSelectedElement}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-4 p-3 pt-0 pb-3.5">
                            <ColorPickers
                                styles={styles}
                                onStyleChange={handleStyleChange}
                                showBgColorPicker={showBgColorPicker}
                                setShowBgColorPicker={setShowBgColorPicker}
                                showTextColorPicker={showTextColorPicker}
                                setShowTextColorPicker={setShowTextColorPicker}
                            />

                            <Separator />

                            <SpacingControls
                                styles={styles}
                                onStyleChange={handleStyleChange}
                            />

                            <Separator />

                            <FontControls
                                styles={styles}
                                onStyleChange={handleStyleChange}
                            />

                            <Separator />

                            <BorderControls
                                styles={styles}
                                onStyleChange={handleStyleChange}
                                showBorderColorPicker={showBorderColorPicker}
                                setShowBorderColorPicker={
                                    setShowBorderColorPicker
                                }
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
