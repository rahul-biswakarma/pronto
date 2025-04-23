import { useEffect } from "react";
import {
    PAGE_EDITOR_HOVER_ELEMENT_CLASS,
    PAGE_EDITOR_SECTION_LOADING_CLASS,
    PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
    baseStyle,
    elementHoveredStyle,
    elementSelectedStyle,
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
    modeId,
    selectedElement,
    setSelectedElement,
    setPrompt,
    isGenerating,
}) => {
    // Set up hover and click handlers in the iframe
    // biome-ignore lint/correctness/useExhaustiveDependencies: we need modeId for cleanup when different mode is selected
    useEffect(() => {
        if (!iframeDocument) return;

        // Event handler for mouse over elements
        const handleMouseOver = (e: MouseEvent) => {
            if (isGenerating) return;
            const target = e.target as HTMLElement;
            target.classList.add(PAGE_EDITOR_HOVER_ELEMENT_CLASS);
        };

        // Event handler for mouse out
        const handleMouseOut = (e: MouseEvent) => {
            if (isGenerating) return;
            const target = e.target as HTMLElement;
            target.classList.remove(PAGE_EDITOR_HOVER_ELEMENT_CLASS);
        };

        // Event handler for clicking elements
        const handleClick = (e: MouseEvent) => {
            if (isGenerating) return;
            e.preventDefault();
            const target = e.target as HTMLElement;
            selectedElement?.classList.remove(
                PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
            );
            target.classList.add(PAGE_EDITOR_SELECTED_ELEMENT_CLASS);
            setSelectedElement(target);
        };

        // Add CSS for highlight effect
        const style = iframeDocument.createElement("style");
        style.textContent = `
            .${PAGE_EDITOR_HOVER_ELEMENT_CLASS}, .${PAGE_EDITOR_SELECTED_ELEMENT_CLASS} {
                ${baseStyle}
            }
            .${PAGE_EDITOR_HOVER_ELEMENT_CLASS} {
                ${elementHoveredStyle}
            }
            .${PAGE_EDITOR_SELECTED_ELEMENT_CLASS} {
                ${elementSelectedStyle}
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

        // Add event listeners
        iframeDocument.body.addEventListener("mouseover", handleMouseOver);
        iframeDocument.body.addEventListener("mouseout", handleMouseOut);
        iframeDocument.body.addEventListener("click", handleClick);

        return () => {
            // Clean up event listeners and styles
            iframeDocument.body.removeEventListener(
                "mouseover",
                handleMouseOver,
            );
            iframeDocument.body.removeEventListener("mouseout", handleMouseOut);
            iframeDocument.body.removeEventListener("click", handleClick);

            // Remove highlight styles from all elements
            const highlightedElements = iframeDocument.querySelectorAll(
                `.${PAGE_EDITOR_HOVER_ELEMENT_CLASS}, .${PAGE_EDITOR_SELECTED_ELEMENT_CLASS}`,
            );

            for (const el of highlightedElements) {
                el.classList.remove(PAGE_EDITOR_SELECTED_ELEMENT_CLASS);
                el.classList.remove(PAGE_EDITOR_HOVER_ELEMENT_CLASS);
            }

            // Remove style element
            style.remove();
        };
    }, [
        iframeDocument,
        modeId,
        selectedElement,
        setSelectedElement,
        setPrompt,
        isGenerating,
    ]);

    return null; // This component doesn't render anything, it just adds event handlers
};
