import { useEffect } from "react";
import {
    PAGE_EDITOR_HOVER_ELEMENT_CLASS,
    PAGE_EDITOR_SECTION_LOADING_CLASS,
    PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
} from "../utils";

interface SectionHighlightingProps {
    iframeDocument: Document | null;
    modeId: string;
    selectedElement: HTMLElement | null;
    setSelectedElement: (element: HTMLElement | null) => void;
    setPrompt: (prompt: string) => void;
    isGenerating: boolean;
}

export const SectionHighlighting: React.FC<SectionHighlightingProps> = ({
    iframeDocument,
    setSelectedElement,
    isGenerating,
}) => {
    useEffect(() => {
        if (!iframeDocument) return;

        // Keep a direct reference to the currently selected element
        let currentSelectedElement: HTMLElement | null = null;

        // Apply both styles and classes to the element
        const applySelectedStyles = (element: HTMLElement) => {
            // Reset previous selection if exists
            if (currentSelectedElement && currentSelectedElement !== element) {
                currentSelectedElement.style.outline = "";
                currentSelectedElement.style.outlineOffset = "";
                currentSelectedElement.classList.remove(
                    PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                );
            }

            // Apply styles directly (for immediate visual feedback)
            element.style.outline = "2px solid #0ea5e9";
            element.style.outlineOffset = "2px";

            // Also add class (for compatibility with other components)
            element.classList.add(PAGE_EDITOR_SELECTED_ELEMENT_CLASS);

            // Update our direct reference
            currentSelectedElement = element;

            // Defer React state update to avoid interference
            setTimeout(() => {
                setSelectedElement(element);
            }, 50);
        };

        // Event handler for mouse over elements
        const handleMouseOver = (e: MouseEvent) => {
            if (isGenerating) return;
            const target = e.target as HTMLElement;
            if (target !== currentSelectedElement) {
                target.style.outline = "1px dashed #0ea5e9";
                target.style.outlineOffset = "1px";
                target.classList.add(PAGE_EDITOR_HOVER_ELEMENT_CLASS);
            }
        };

        // Event handler for mouse out
        const handleMouseOut = (e: MouseEvent) => {
            if (isGenerating) return;
            const target = e.target as HTMLElement;
            if (target !== currentSelectedElement) {
                target.style.outline = "";
                target.style.outlineOffset = "";
                target.classList.remove(PAGE_EDITOR_HOVER_ELEMENT_CLASS);
            }
        };

        // Event handler for clicking elements
        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target as HTMLElement;
            applySelectedStyles(target);
        };

        // Add CSS for hover effect and loading animation
        const style = iframeDocument.createElement("style");
        style.textContent = `
            /* Fallback styles for class-based approach */
            .${PAGE_EDITOR_HOVER_ELEMENT_CLASS} {
                outline: 1px dashed #0ea5e9 !important;
                outline-offset: 1px !important;
            }

            .${PAGE_EDITOR_SELECTED_ELEMENT_CLASS} {
                outline: 2px solid #0ea5e9 !important;
                outline-offset: 2px !important;
            }

            /* Animated Gradient Overlay */
            @keyframes pulse-gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Apply animation only when loading class is present */
            .${PAGE_EDITOR_SECTION_LOADING_CLASS}::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: linear-gradient(90deg, rgba(0, 123, 255, 0), rgba(0, 123, 255, 0.2), rgba(0, 123, 255, 0));
                background-size: 200% 100%;
                animation: pulse-gradient 3s ease-in-out infinite;
                pointer-events: none; /* Allow clicks to pass through */
                z-index: 1; /* Ensure it's above the section content slightly */
            }
        `;
        iframeDocument.head.appendChild(style);

        // Add event listeners with capture phase
        if (iframeDocument?.body) {
            iframeDocument.body.addEventListener(
                "mouseover",
                handleMouseOver,
                true,
            );
            iframeDocument.body.addEventListener(
                "mouseout",
                handleMouseOut,
                true,
            );
            iframeDocument.body.addEventListener("click", handleClick, true);
        }

        return () => {
            // Clean up event listeners and styles
            if (iframeDocument?.body) {
                iframeDocument.body.removeEventListener(
                    "mouseover",
                    handleMouseOver,
                    true,
                );
                iframeDocument.body.removeEventListener(
                    "mouseout",
                    handleMouseOut,
                    true,
                );
                iframeDocument.body.removeEventListener(
                    "click",
                    handleClick,
                    true,
                );
            }

            // Remove styles and classes from all elements
            if (currentSelectedElement) {
                currentSelectedElement.style.outline = "";
                currentSelectedElement.style.outlineOffset = "";
                currentSelectedElement.classList.remove(
                    PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                );
            }

            if (iframeDocument) {
                const hoveredElements = iframeDocument.querySelectorAll(
                    `.${PAGE_EDITOR_HOVER_ELEMENT_CLASS}`,
                );
                for (const el of hoveredElements) {
                    (el as HTMLElement).style.outline = "";
                    (el as HTMLElement).style.outlineOffset = "";
                    el.classList.remove(PAGE_EDITOR_HOVER_ELEMENT_CLASS);
                }

                // Remove style element
                style.remove();
            }
        };
    }, [iframeDocument, setSelectedElement, isGenerating]);

    return null; // This component doesn't render anything, it just adds event handlers
};
