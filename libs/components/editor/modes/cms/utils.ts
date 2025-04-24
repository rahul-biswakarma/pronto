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
