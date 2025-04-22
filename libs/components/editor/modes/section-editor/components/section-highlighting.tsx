import { useEffect } from "react";
import {
    baseStyle,
    contentHoveredStyle,
    contentSelectedStyle,
    findSectionElement,
    sectionHoveredStyle,
    sectionSelectedStyle,
} from "../utils";

// CSS class constants
const SECTION_HIGHLIGHT_CLASS = "feno-section-editor-highlight";
const SECTION_SELECTED_CLASS = "feno-section-editor-selected";
const CONTENT_HIGHLIGHT_CLASS = "feno-content-highlight";
const CONTENT_SELECTED_CLASS = "feno-content-selected";

interface SectionHighlightingProps {
    iframeDocument: Document | null;
    modeId: string;
    selectedElementRef: React.RefObject<HTMLElement | null>;
    setSectionId: (id: string) => void;
    setSectionHtml: (html: string) => void;
    setSelectedElement: (element: HTMLElement | null) => void;
    setElementType: (type: "section" | "text" | null) => void;
    setPrompt: (prompt: string) => void;
}

export const SectionHighlighting: React.FC<SectionHighlightingProps> = ({
    iframeDocument,
    modeId,
    selectedElementRef,
    setSectionId,
    setSectionHtml,
    setSelectedElement,
    setElementType,
    setPrompt,
}) => {
    // Set up hover and click handlers in the iframe
    // biome-ignore lint/correctness/useExhaustiveDependencies: we need modeId for cleanup when different mode is selected
    useEffect(() => {
        if (!iframeDocument) return;

        // Event handler for mouse over elements
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const sectionElement = findSectionElement(target);
            if (sectionElement) {
                if (sectionElement.type === "section") {
                    sectionElement.element.classList.add(
                        SECTION_HIGHLIGHT_CLASS,
                    );
                } else if (sectionElement.type === "text") {
                    sectionElement.element.classList.add(
                        CONTENT_HIGHLIGHT_CLASS,
                    );
                }
            }
        };

        // Event handler for mouse out
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const sectionElement = findSectionElement(target);
            if (sectionElement) {
                if (sectionElement.type === "section") {
                    sectionElement.element.classList.remove(
                        SECTION_HIGHLIGHT_CLASS,
                    );
                } else if (sectionElement.type === "text") {
                    sectionElement.element.classList.remove(
                        CONTENT_HIGHLIGHT_CLASS,
                    );
                }
            }
        };

        // Event handler for clicking elements
        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            const sectionElement = findSectionElement(target);
            if (sectionElement) {
                // Use the ref to access the current selected element
                if (selectedElementRef.current) {
                    selectedElementRef.current.classList.remove(
                        SECTION_SELECTED_CLASS,
                    );
                    selectedElementRef.current.classList.remove(
                        CONTENT_SELECTED_CLASS,
                    );
                }
                if (sectionElement.type === "section") {
                    setSectionId(sectionElement.element.id);
                    setSectionHtml(sectionElement.element.outerHTML);
                    sectionElement.element.classList.add(
                        SECTION_SELECTED_CLASS,
                    );
                    setSelectedElement(sectionElement.element);
                    setElementType("section");
                } else if (sectionElement.type === "text") {
                    sectionElement.element.classList.add(
                        CONTENT_SELECTED_CLASS,
                    );
                    setSelectedElement(sectionElement.element);
                    setElementType("text");
                }
                setPrompt("");
            } else {
                selectedElementRef.current?.classList.remove(
                    SECTION_SELECTED_CLASS,
                );
                selectedElementRef.current?.classList.remove(
                    CONTENT_SELECTED_CLASS,
                );
                setSelectedElement(null);
                setElementType(null);
            }
        };

        // Add CSS for highlight effect
        const style = iframeDocument.createElement("style");
        style.textContent = `
            .${SECTION_HIGHLIGHT_CLASS}, .${CONTENT_HIGHLIGHT_CLASS}, .${SECTION_SELECTED_CLASS}, .${CONTENT_SELECTED_CLASS} {
                ${baseStyle}
            }
            .${SECTION_SELECTED_CLASS} {
                ${sectionSelectedStyle}
                position: relative; /* Needed for pseudo-element positioning */
                overflow: hidden; /* Contain the pseudo-element */
            }
            .${CONTENT_SELECTED_CLASS} {
                ${contentSelectedStyle}
            }
            .${SECTION_HIGHLIGHT_CLASS}:not(.${SECTION_SELECTED_CLASS}):hover {
                ${sectionHoveredStyle}
            }
            .${CONTENT_HIGHLIGHT_CLASS}:not(.${CONTENT_SELECTED_CLASS}):hover {
                ${contentHoveredStyle}
            }

            /* Animated Gradient Overlay */
            @keyframes pulse-gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Apply animation only when loading class is present */
            .${SECTION_SELECTED_CLASS}.feno-section-loading::before {
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
                `.${SECTION_HIGHLIGHT_CLASS}, .${SECTION_SELECTED_CLASS}, .${CONTENT_SELECTED_CLASS}, .${CONTENT_HIGHLIGHT_CLASS}`,
            );

            for (const el of highlightedElements) {
                el.classList.remove(SECTION_HIGHLIGHT_CLASS);
                el.classList.remove(SECTION_SELECTED_CLASS);
                el.classList.remove(CONTENT_SELECTED_CLASS);
                el.classList.remove(CONTENT_HIGHLIGHT_CLASS);
            }

            // Remove style element
            style.remove();
        };
    }, [
        iframeDocument,
        modeId,
        selectedElementRef,
        setSectionId,
        setSectionHtml,
        setSelectedElement,
        setElementType,
        setPrompt,
    ]);

    return null; // This component doesn't render anything, it just adds event handlers
};
