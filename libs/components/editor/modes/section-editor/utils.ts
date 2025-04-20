export const SECTION_ID_PREFIX = "feno-sec";

export const findSectionElement = (
    element: HTMLElement,
): { type: "section" | "text"; element: HTMLElement } | null => {
    if (!element) return null;

    // Check if current element has an ID starting with the prefix
    if (element.id?.startsWith(SECTION_ID_PREFIX)) {
        return {
            type: "section",
            element,
        };
    }

    if (isOnlyTextElement(element)) {
        return {
            type: "text",
            element,
        };
    }

    // Check parent elements
    let parent = element.parentElement;
    while (parent) {
        if (parent.id?.startsWith(SECTION_ID_PREFIX)) {
            return {
                type: "section",
                element: parent,
            };
        }
        parent = parent.parentElement;
    }

    return null;
};

export const isOnlyTextElement = (element: HTMLElement): boolean => {
    if (!element) return false;

    const hasVisibleText = !!element.textContent?.trim();

    const isOnlyTextOrComments = Array.from(element.childNodes).every(
        (node) =>
            node.nodeType === Node.TEXT_NODE ||
            node.nodeType === Node.COMMENT_NODE,
    );

    return hasVisibleText && isOnlyTextOrComments;
};

export const isSectionElement = (element: HTMLElement): boolean => {
    return element?.id?.startsWith(SECTION_ID_PREFIX) || false;
};

export const baseStyle = `transition: outline 0.1s ease, background-color 0.1s ease !important;
     position: relative !important;
      z-index: 20 !important;
      outline-width: 1px !important;
      outline-offset: 1px !important;
      `;

export const sectionHoveredStyle = "outline: 2px dashed #3b82f6 !important;";

export const sectionSelectedStyle = "outline: 2px dashed #3b82f6 !important;";

export const contentHoveredStyle = "outline: 2px dashed #eab308 !important;";

export const contentSelectedStyle = "outline: 2px solid #eab308 !important;";
