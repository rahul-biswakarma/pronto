export const SECTION_ID_PREFIX = "feno-sec";
export const SECTION_REARRANGE_CLASS = "feno-section-rearrange";
export const SECTION_DRAGGABLE_CLASS = "feno-section-draggable";
export const SECTION_DRAGOVER_CLASS = "feno-section-dragover";
export const SECTION_HANDLE_CLASS = "feno-section-handle";
export const SECTION_PLACEHOLDER_CLASS = "feno-section-placeholder";

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

export const getAllSections = (doc: Document): HTMLElement[] => {
    const sections: HTMLElement[] = [];
    const elements = doc.querySelectorAll(`[id^="${SECTION_ID_PREFIX}"]`);
    for (const el of elements) {
        sections.push(el as HTMLElement);
    }
    return sections;
};

export const createDragHandle = (): HTMLElement => {
    const handle = document.createElement("div");
    handle.className = SECTION_HANDLE_CLASS;
    handle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 9h14M5 15h14"></path>
        </svg>
    `;
    handle.setAttribute("title", "Drag to rearrange section");
    return handle;
};

export const createPlaceholder = (): HTMLElement => {
    const placeholder = document.createElement("div");
    placeholder.className = SECTION_PLACEHOLDER_CLASS;
    return placeholder;
};

export const baseStyle =
    "transition: all 0.2s ease !important; position: relative !important;";

export const draggableStyle = `
    cursor: grab !important;
    position: relative !important;
    user-select: none !important;
    border: 1px solid #ccc !important;
`;

export const handleStyle = `
    position: absolute !important;
    top: 8px !important;
    left: 8px !important;
    width: 32px !important;
    height: 32px !important;
    background-color: #3b82f6 !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: white !important;
    cursor: grab !important;
    z-index: 1000 !important;
    opacity: 0.85 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
`;

export const dragoverStyle = `
    outline: 3px solid #3b82f6 !important;
    outline-offset: 2px !important;
    background-color: rgba(59, 130, 246, 0.05) !important;
`;

export const placeholderStyle = `
    height: 20px !important;
    background-color: #3b82f6 !important;
    margin: 8px 0 !important;
    border-radius: 4px !important;
    opacity: 0.5 !important;
`;

export const draggingStyle = `
    opacity: 0.6 !important;
    transform: scale(0.98) !important;
    outline: 2px solid #3b82f6 !important;
    outline-offset: 2px !important;
    z-index: 1000 !important;
`;
