import { useEffect, useRef, useState } from "react";

// Define pink color styles
export const baseStyle = `
    outline-offset: 2px !important;
    cursor: pointer !important;
    transition: outline-color 0s ease-in-out !important;
`;

export const elementHoveredStyle = `
    outline: 2px dashed hotpink !important; // Define full outline on hover
`;

export const elementSelectedStyle = `
	outline: 2px solid hotpink !important; // Define full outline on select
`;

export const STYLE_HIGHLIGHT_CLASS = "feno-style-editor-highlight";
export const STYLE_SELECTED_CLASS = "feno-style-editor-selected";

// Custom Hook for managing element selection in the iframe
export function useStyleSelection(
    iframeDocument: Document | null,
    modeId: string,
) {
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
        null,
    );
    const selectedElementRef = useRef<HTMLElement | null>(null);

    // Update ref when selectedElement changes
    useEffect(() => {
        selectedElementRef.current = selectedElement;
    }, [selectedElement]);

    // Set up hover and click handlers in the iframe
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!iframeDocument) return;

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target === iframeDocument.body ||
                target === iframeDocument.documentElement
            )
                return;
            target.classList.add(STYLE_HIGHLIGHT_CLASS);
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            target.classList.remove(STYLE_HIGHLIGHT_CLASS);
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;
            if (
                target === iframeDocument.body ||
                target === iframeDocument.documentElement
            )
                return;

            if (selectedElementRef.current) {
                selectedElementRef.current.classList.remove(
                    STYLE_SELECTED_CLASS,
                );
            }

            target.classList.add(STYLE_SELECTED_CLASS);
            target.classList.remove(STYLE_HIGHLIGHT_CLASS);
            setSelectedElement(target);
        };

        const style = iframeDocument.createElement("style");
        style.textContent = `
            .${STYLE_HIGHLIGHT_CLASS}, .${STYLE_SELECTED_CLASS} {
				${baseStyle}
            }
            .${STYLE_SELECTED_CLASS} {
                ${elementSelectedStyle}
            }
			.${STYLE_HIGHLIGHT_CLASS}:not(.${STYLE_SELECTED_CLASS}):hover {
				${elementHoveredStyle}
            }
        `;
        iframeDocument.head.appendChild(style);

        iframeDocument.body.addEventListener("mouseover", handleMouseOver);
        iframeDocument.body.addEventListener("mouseout", handleMouseOut);
        iframeDocument.body.addEventListener("click", handleClick, true);

        return () => {
            iframeDocument.body.removeEventListener(
                "mouseover",
                handleMouseOver,
            );
            iframeDocument.body.removeEventListener("mouseout", handleMouseOut);
            iframeDocument.body.removeEventListener("click", handleClick, true);

            const highlightedElements = iframeDocument.querySelectorAll(
                `.${STYLE_HIGHLIGHT_CLASS}, .${STYLE_SELECTED_CLASS}`,
            );

            for (const el of highlightedElements) {
                el.classList.remove(STYLE_HIGHLIGHT_CLASS);
                el.classList.remove(STYLE_SELECTED_CLASS);
            }

            if (selectedElementRef.current) {
                selectedElementRef.current.classList.remove(
                    STYLE_SELECTED_CLASS,
                );
            }

            style.remove();
        };
    }, [iframeDocument, modeId]);

    return { selectedElement, setSelectedElement };
}

// Helper function to convert rgb/rgba to hex
export function rgbToHex(rgb: string): string {
    if (!rgb || typeof rgb !== "string") return "#000000";
    if (rgb.startsWith("#")) return rgb; // Already hex

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return "#000000"; // Invalid RGB

    const r = Number.parseInt(result[0], 10);
    const g = Number.parseInt(result[1], 10);
    const b = Number.parseInt(result[2], 10);

    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `#${hex}`;
}

// Helper function to parse pixel values
export function parsePixelValue(value: string): number {
    if (!value || typeof value !== "string") return 16; // Default font size
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 16 : parsed;
}
