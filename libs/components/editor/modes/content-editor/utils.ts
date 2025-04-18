export const COLOR_VAR_PREFIX = "feno-color";

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

export const baseStyle =
    "transition: outline 0.1s ease, background-color 0.1s ease !important;";

export const hoveredStyle = `outline: 2px dashed #eab308 !important;
      outline-offset: 1px !important;
      background-color: rgba(234, 179, 8, 0.05) !important;
      transition: none !important;
      position: relative !important;
      z-index: 10 !important;
      box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.1) !important;`;

export const selectedStyle = `outline: 3px solid #eab308 !important;
      outline-offset: 1px !important;
      background-color: rgba(234, 179, 8, 0.1) !important;
      transition: none !important;
      position: relative !important;
      z-index: 20 !important;
      box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.2) !important;`;
