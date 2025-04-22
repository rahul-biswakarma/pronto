import dataLayer from "@/libs/utils/data-layer";
import { PAGE_EDITOR_SECTION_LOADING_CLASS } from "../utils";

interface ModifySectionResponse {
    modifiedHtml: string;
}

/**
 * Functions for modifying sections and handling editor changes
 */

/**
 * Modifies a section based on a prompt using AI
 */
export async function modifySection(
    selectedElement: HTMLElement,
    selectedElementRef: React.RefObject<HTMLElement | null>,
    sectionHtml: string,
    prompt: string,
    sectionId: string,
    setLoading: (loading: boolean) => void,
    setHasChanges: (hasChanges: boolean) => void,
    setSelectedElement: (element: HTMLElement | null) => void,
) {
    if (!selectedElement || !prompt.trim()) return;

    // Add loading class to start animation
    selectedElementRef.current?.classList.add(
        PAGE_EDITOR_SECTION_LOADING_CLASS,
    );
    setLoading(true);

    try {
        // Make LLM call to modify section
        const response = await dataLayer.post<ModifySectionResponse>(
            "/api/portfolios/modify-section",
            {
                sectionHtml,
                prompt,
                sectionId,
            },
        );

        const modifiedHtml = response.data?.modifiedHtml;

        // Replace the section in the iframe document
        if (modifiedHtml && selectedElementRef.current) {
            // Create a temporary container for the new HTML
            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = modifiedHtml;
            const newElement = tempContainer.firstElementChild as HTMLElement;

            if (newElement) {
                // Ensure the new element has the same ID
                newElement.id = selectedElementRef.current.id;

                // Replace the old element with the new one
                selectedElementRef.current.replaceWith(newElement);

                // Update selected element reference
                setSelectedElement(newElement);

                // Mark that changes were made
                setHasChanges(true);
            }
        }
    } catch (error) {
        console.error("Error modifying section:", error);
    } finally {
        setLoading(false);
        // Remove loading class to stop animation
        selectedElementRef.current?.classList.remove("feno-section-loading");
    }
}

/**
 * Handles changes from the text editor
 */
export function handleEditorChange(
    html: string,
    selectedElement: HTMLElement,
    setHasChanges: (hasChanges: boolean) => void,
) {
    // Remove wrapping p tags if present
    const newHtml = html.replace(/^<p>|<\/p>$/g, "");

    if (selectedElement) {
        selectedElement.innerHTML = newHtml;
        setHasChanges(true);
    }
}
