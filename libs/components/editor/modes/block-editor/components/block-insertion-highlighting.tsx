import { useEffect } from "react";

const BLOCK_INSERTION_POINT_CLASS = "feno-block-insertion-point";
const BLOCK_INSERTION_POINT_ACTIVE_CLASS = "feno-block-insertion-point-active";
const BLOCK_INSERTION_POINT_HOVER_CLASS = "feno-block-insertion-point-hover";

interface BlockInsertionHighlightingProps {
    iframeDocument: Document | null;
    isSelectingInsertionPoint: boolean;
    onInsertionPointSelected: (
        element: HTMLElement,
        position: "before" | "after" | "append",
    ) => void;
}

export const BlockInsertionHighlighting: React.FC<
    BlockInsertionHighlightingProps
> = ({
    iframeDocument,
    isSelectingInsertionPoint,
    onInsertionPointSelected,
}) => {
    useEffect(() => {
        if (!iframeDocument || !isSelectingInsertionPoint) return;

        // Add styles for insertion points
        const style = iframeDocument.createElement("style");
        style.textContent = `
      .${BLOCK_INSERTION_POINT_CLASS} {
        position: relative;
        cursor: pointer;
      }

      .${BLOCK_INSERTION_POINT_CLASS}::before,
      .${BLOCK_INSERTION_POINT_CLASS}::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 4px;
        background-color: transparent;
        transition: background-color 0.2s ease;
        z-index: 9999;
        pointer-events: none;
      }

      .${BLOCK_INSERTION_POINT_CLASS}::before {
        top: 0;
      }

      .${BLOCK_INSERTION_POINT_CLASS}::after {
        bottom: 0;
      }

      .${BLOCK_INSERTION_POINT_HOVER_CLASS}::before,
      .${BLOCK_INSERTION_POINT_HOVER_CLASS}::after {
        background-color: rgba(14, 165, 233, 0.5);
        height: 6px;
      }

      .${BLOCK_INSERTION_POINT_ACTIVE_CLASS}::before,
      .${BLOCK_INSERTION_POINT_ACTIVE_CLASS}::after {
        background-color: rgb(14, 165, 233);
        height: 8px;
      }
    `;
        iframeDocument.head.appendChild(style);

        // Find potential insertion points (direct children of body or sections/divs)
        const insertionPoints: HTMLElement[] = [];

        // Add body for appending at the end
        if (iframeDocument.body) {
            insertionPoints.push(iframeDocument.body);
        }

        // Add semantic sections and major containers
        const containers = iframeDocument.querySelectorAll(
            "section, main, header, footer, article, aside, div[class*='container'], div[class*='section']",
        );
        for (const container of containers) {
            insertionPoints.push(container as HTMLElement);
        }

        // Add classes to insertion points
        for (const element of insertionPoints) {
            element.classList.add(BLOCK_INSERTION_POINT_CLASS);
        }

        // Handle mouse over insertion points
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains(BLOCK_INSERTION_POINT_CLASS)) {
                target.classList.add(BLOCK_INSERTION_POINT_HOVER_CLASS);
            }
        };

        // Handle mouse out of insertion points
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains(BLOCK_INSERTION_POINT_CLASS)) {
                target.classList.remove(BLOCK_INSERTION_POINT_HOVER_CLASS);
            }
        };

        // Handle clicks on insertion points to show insertion options
        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;

            // Only process clicks on valid insertion points
            if (!target.classList.contains(BLOCK_INSERTION_POINT_CLASS)) return;

            // Remove active class from all elements
            for (const el of insertionPoints) {
                el.classList.remove(BLOCK_INSERTION_POINT_ACTIVE_CLASS);
            }

            // Add active class to the clicked element
            target.classList.add(BLOCK_INSERTION_POINT_ACTIVE_CLASS);

            // Determine insertion position based on mouse Y position relative to the element
            const rect = target.getBoundingClientRect();
            const mouseY = e.clientY;
            const relativeY = mouseY - rect.top;
            const position =
                relativeY < rect.height / 3
                    ? "before"
                    : relativeY > (rect.height * 2) / 3
                      ? "after"
                      : "append";

            // Call the insertion handler
            onInsertionPointSelected(target, position);
        };

        // Add event listeners to document
        iframeDocument.addEventListener("mouseover", handleMouseOver, true);
        iframeDocument.addEventListener("mouseout", handleMouseOut, true);
        iframeDocument.addEventListener("click", handleClick, true);

        // Update cursor to indicate insertion mode
        iframeDocument.body.style.cursor = "cell";

        return () => {
            // Clean up styles and event listeners
            style.remove();

            // Remove classes from insertion points
            for (const element of insertionPoints) {
                element.classList.remove(
                    BLOCK_INSERTION_POINT_CLASS,
                    BLOCK_INSERTION_POINT_HOVER_CLASS,
                    BLOCK_INSERTION_POINT_ACTIVE_CLASS,
                );
            }

            // Remove event listeners
            iframeDocument.removeEventListener(
                "mouseover",
                handleMouseOver,
                true,
            );
            iframeDocument.removeEventListener(
                "mouseout",
                handleMouseOut,
                true,
            );
            iframeDocument.removeEventListener("click", handleClick, true);

            // Restore cursor
            iframeDocument.body.style.cursor = "";
        };
    }, [iframeDocument, isSelectingInsertionPoint, onInsertionPointSelected]);

    return null; // This component doesn't render anything
};
