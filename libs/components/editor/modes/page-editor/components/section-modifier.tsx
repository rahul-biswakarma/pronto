import dataLayer from "@/libs/utils/data-layer";
import { PAGE_EDITOR_SECTION_LOADING_CLASS } from "../utils";

interface ModifyHtmlResponse {
    modifiedHtml: string;
}

/**
 * Functions for modifying sections and handling editor changes
 */

/**
 * Modifies a section or the full page based on a prompt using AI
 */
export async function modifySection({
    selectedElement,
    fullPageElement,
    prompt,
    setLoading,
    setPrompt,
}: {
    selectedElement?: HTMLElement | null;
    fullPageElement?: HTMLElement | null;
    prompt: string;
    setLoading: (loading: boolean) => void;
    setPrompt: (prompt: string) => void;
}) {
    if (!prompt.trim()) return;

    const isFullPage = !selectedElement && !!fullPageElement;
    const targetElement = selectedElement || fullPageElement;

    if (!targetElement) return;

    // Add loading class to start animation
    targetElement.classList.add(PAGE_EDITOR_SECTION_LOADING_CLASS);
    setLoading(true);

    try {
        // For full page edits, get the complete HTML document
        let htmlContent: string;
        if (isFullPage && fullPageElement) {
            // Get the full HTML document if we're editing the entire page
            const iframeDocument = fullPageElement.ownerDocument;
            htmlContent = iframeDocument.documentElement.outerHTML;
        } else {
            // For section edits, just get the section's inner HTML
            htmlContent = targetElement.innerHTML;
        }

        // Make LLM call to modify section or full page
        const payload = isFullPage
            ? { fullPageHtml: htmlContent, prompt }
            : { sectionHtml: htmlContent, prompt };

        const response = await dataLayer.post<ModifyHtmlResponse>(
            "/api/portfolios/modify-html",
            payload,
        );

        const modifiedHtml = response.data?.modifiedHtml;

        // Replace the content in the iframe document
        if (modifiedHtml) {
            if (isFullPage && fullPageElement) {
                // For full page edits, we need to handle differently
                // Just updating the body content to maintain the document structure
                const parser = new DOMParser();
                const parsedDoc = parser.parseFromString(
                    modifiedHtml,
                    "text/html",
                );

                // Replace only the body content to preserve the document structure
                fullPageElement.innerHTML = parsedDoc.body.innerHTML;
            } else {
                // For section edits, directly update the innerHTML
                targetElement.innerHTML = modifiedHtml;
            }
            setPrompt("");
        }
    } catch (error) {
        console.error(
            `Error modifying ${isFullPage ? "page" : "section"}:`,
            error,
        );
    } finally {
        setLoading(false);
        targetElement.classList.remove(PAGE_EDITOR_SECTION_LOADING_CLASS);
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
