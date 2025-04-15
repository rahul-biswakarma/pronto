import { CSS_CLASSES, HIGHLIGHT_STYLES } from "../constants";

/**
 * Adds the highlight style block to the document
 */
export const setupHighlightStyles = (doc: Document): void => {
    const styleEl = doc.createElement("style");
    styleEl.textContent = HIGHLIGHT_STYLES;
    doc.head.appendChild(styleEl);
};

/**
 * Clears all highlight classes from elements
 */
export const clearAllHighlights = (
    doc: Document,
    setHoverHighlight?: (id: string | null) => void,
    setHoverCmsElement?: (element: HTMLElement | null) => void,
): void => {
    const highlightedElements = doc.querySelectorAll(
        `.${CSS_CLASSES.SECTION_HOVER}, .${CSS_CLASSES.CMS_HOVER}`,
    );

    for (const el of highlightedElements) {
        el.classList.remove(CSS_CLASSES.SECTION_HOVER, CSS_CLASSES.CMS_HOVER);
    }

    // Update state if provided
    if (setHoverHighlight) setHoverHighlight(null);
    if (setHoverCmsElement) setHoverCmsElement(null);
};

/**
 * Adds section highlight to an element
 */
export const addSectionHighlight = (
    element: HTMLElement,
    isSelected = false,
): void => {
    element.classList.add(
        isSelected ? CSS_CLASSES.SECTION_SELECTED : CSS_CLASSES.SECTION_HOVER,
    );
};

/**
 * Removes section highlight from an element
 */
export const removeSectionHighlight = (
    element: HTMLElement,
    isSelected = false,
): void => {
    element.classList.remove(
        isSelected ? CSS_CLASSES.SECTION_SELECTED : CSS_CLASSES.SECTION_HOVER,
    );
};

/**
 * Adds CMS highlight to an element
 */
export const addCmsHighlight = (
    element: HTMLElement,
    isSelected = false,
): void => {
    element.classList.add(
        isSelected ? CSS_CLASSES.CMS_SELECTED : CSS_CLASSES.CMS_HOVER,
    );
};

/**
 * Removes CMS highlight from an element
 */
export const removeCmsHighlight = (
    element: HTMLElement,
    isSelected = false,
): void => {
    element.classList.remove(
        isSelected ? CSS_CLASSES.CMS_SELECTED : CSS_CLASSES.CMS_HOVER,
    );
};
