import logger from "@/libs/utils/logger";
import { SECTION_ID_PREFIX, TEXT_ELEMENT_TAGS } from "../constants";

/**
 * Checks if an element is a text element
 */
export const isTextElement = (element: HTMLElement): boolean => {
    return (
        (element.childNodes.length === 0 ||
            (element.childNodes.length === 1 &&
                element.firstChild?.nodeType === Node.TEXT_NODE) ||
            TEXT_ELEMENT_TAGS.includes(element.tagName)) &&
        !!element.textContent?.trim()
    );
};

/**
 * Checks if an element is a section element
 */
export const isSectionElement = (element: HTMLElement): boolean => {
    return !!element.id && element.id.startsWith(SECTION_ID_PREFIX);
};

/**
 * Finds the closest section element
 */
export const findClosestSection = (
    element: HTMLElement,
): HTMLElement | null => {
    return (
        (element.closest(`[id^="${SECTION_ID_PREFIX}"]`) as HTMLElement) || null
    );
};

/**
 * Generates an XPath for an element
 */
export const getXPath = (element: HTMLElement): string => {
    if (!element) return "";
    if (element.id) return `//*[@id="${element.id}"]`;

    // Use a more reliable approach
    const path = [];
    let currentElement: HTMLElement | null = element;

    while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
        let name = currentElement.nodeName.toLowerCase();
        let sibling = currentElement.previousSibling;
        let siblingCount = 1;

        // Count previous siblings with same node name
        while (sibling) {
            if (
                sibling.nodeType === Node.ELEMENT_NODE &&
                sibling.nodeName.toLowerCase() === name
            ) {
                siblingCount++;
            }
            sibling = sibling.previousSibling;
        }

        // If element has siblings of the same type, add index
        if (currentElement.nextSibling || siblingCount > 1) {
            name += `[${siblingCount}]`;
        }

        path.unshift(name);
        currentElement = currentElement.parentElement;
    }

    return path.length > 0 ? `/${path.join("/")}` : "";
};

/**
 * Finds an element by XPath
 */
export const findElementByXPath = (
    doc: Document,
    xpath: string,
): HTMLElement | null => {
    try {
        // Try to use XPath
        const result = doc.evaluate(
            xpath,
            doc,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        );

        return (result.singleNodeValue as HTMLElement) || null;
    } catch (error) {
        logger.error({ error, xpath }, "XPath evaluation error");
        // Fallback to ID-based selection if possible
        if (xpath.includes("id=")) {
            const idMatch = xpath.match(/id="([^"]+)"/);
            if (idMatch?.[1]) {
                return doc.getElementById(idMatch[1]);
            }
        }
        return null;
    }
};

/**
 * Extracts section name from section ID
 */
export const getSectionNameFromId = (sectionId: string): string => {
    if (!sectionId.startsWith(SECTION_ID_PREFIX)) {
        return "this section";
    }

    // Remove the prefix
    const nameWithDashes = sectionId.substring(SECTION_ID_PREFIX.length + 1); // +1 for the dash

    // Convert dashes to spaces and capitalize words
    return nameWithDashes
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
