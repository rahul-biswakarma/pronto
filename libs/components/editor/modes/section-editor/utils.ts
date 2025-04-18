export const SECTION_ID_PREFIX = "feno-sec";

export const findSectionElement = (
    element: HTMLElement,
): HTMLElement | null => {
    if (!element) return null;

    // Check if current element has an ID starting with the prefix
    if (element.id?.startsWith(SECTION_ID_PREFIX)) {
        return element;
    }

    // Check parent elements
    let parent = element.parentElement;
    while (parent) {
        if (parent.id?.startsWith(SECTION_ID_PREFIX)) {
            return parent;
        }
        parent = parent.parentElement;
    }

    return null;
};

export const isSectionElement = (element: HTMLElement): boolean => {
    return element?.id?.startsWith(SECTION_ID_PREFIX) || false;
};

export const baseStyle =
    "transition: outline 0.1s ease, background-color 0.1s ease !important;";

export const hoveredStyle = `outline: 2px dashed #3b82f6 !important;
      outline-offset: 1px !important;
      background-color: rgba(59, 130, 246, 0.05) !important;
      transition: none !important;
      position: relative !important;
      z-index: 10 !important;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1) !important`;

export const selectedStyle = `outline: 3px solid #3b82f6 !important;
      outline-offset: 1px !important;
      background-color: rgba(59, 130, 246, 0.1) !important;
      transition: none !important;
      position: relative !important;
      z-index: 20 !important;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) !important;`;
