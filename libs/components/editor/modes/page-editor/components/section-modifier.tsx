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
export async function modifySection({
    selectedElement,
    prompt,
    setLoading,
    setPrompt,
}: {
    selectedElement: HTMLElement;
    prompt: string;
    setLoading: (loading: boolean) => void;
    setPrompt: (prompt: string) => void;
}) {
    if (!selectedElement || !prompt.trim()) return;

    // Add loading class to start animation
    selectedElement.classList.add(PAGE_EDITOR_SECTION_LOADING_CLASS);
    setLoading(true);

    try {
        // Make LLM call to modify section
        const response = await dataLayer.post<ModifySectionResponse>(
            "/api/portfolios/modify-section",
            {
                sectionHtml: selectedElement.innerHTML,
                prompt,
            },
        );

        const modifiedHtml = response.data?.modifiedHtml;

        // Replace the section in the iframe document
        if (modifiedHtml) {
            // Update selected element reference
            selectedElement.innerHTML = modifiedHtml;
            setPrompt("");
        }
    } catch (error) {
        console.error("Error modifying section:", error);
    } finally {
        setLoading(false);
        selectedElement.classList.remove(PAGE_EDITOR_SECTION_LOADING_CLASS);
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
