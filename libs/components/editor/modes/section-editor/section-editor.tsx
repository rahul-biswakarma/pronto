import { Button } from "@/libs/ui/button";
import dataLayer from "@/libs/utils/data-layer";
import { cn } from "@/libs/utils/misc";
import { IconCashEdit, IconSend } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import {
    baseStyle,
    findSectionElement,
    hoveredStyle,
    selectedStyle,
} from "./utils";

const SECTION_EDITOR_HIGHLIGHT_CLASS = "feno-section-editor-highlight";
const SECTION_EDITOR_SELECTED_CLASS = "feno-section-editor-selected";
const SECTION_EDITOR_MODIFIED_CLASS = "feno-section-editor-modified";

interface ModifySectionResponse {
    modifiedHtml: string;
}

// Section Editor component
const SectionEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId } = useEditor();
    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [sectionId, setSectionId] = useState<string>("");
    const [sectionHtml, setSectionHtml] = useState<string>("");
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
        null,
    );
    const selectedElementRef = useRef<HTMLElement | null>(null);

    // Update ref when selectedElement changes
    useEffect(() => {
        selectedElementRef.current = selectedElement;
    }, [selectedElement]);

    // Set up hover and click handlers in the iframe
    // biome-ignore lint/correctness/useExhaustiveDependencies: we need modeId for cleanup when different mode is selected
    useEffect(() => {
        if (!iframeDocument) return;

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const sectionElement = findSectionElement(target);
            if (sectionElement) {
                sectionElement.classList.add(SECTION_EDITOR_HIGHLIGHT_CLASS);
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const sectionElement = findSectionElement(target);
            if (sectionElement) {
                sectionElement.classList.remove(SECTION_EDITOR_HIGHLIGHT_CLASS);
            }
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            const sectionElement = findSectionElement(target);
            if (sectionElement) {
                // Use the ref to access the current selected element
                if (selectedElementRef.current) {
                    selectedElementRef.current.classList.remove(
                        SECTION_EDITOR_SELECTED_CLASS,
                    );
                }
                setSectionId(sectionElement.id);
                setSectionHtml(sectionElement.outerHTML);
                sectionElement.classList.add(SECTION_EDITOR_SELECTED_CLASS);
                setSelectedElement(sectionElement);
                setPrompt("");
            }
        };

        // Add CSS for highlight effect
        const style = iframeDocument.createElement("style");
        style.textContent = `
            .${SECTION_EDITOR_HIGHLIGHT_CLASS} {
				${baseStyle}
            }
			.${SECTION_EDITOR_HIGHLIGHT_CLASS}:hover {
				${hoveredStyle}
            }
			.${SECTION_EDITOR_SELECTED_CLASS},
			.${SECTION_EDITOR_SELECTED_CLASS}:hover {
				${selectedStyle}
            }
            .${SECTION_EDITOR_MODIFIED_CLASS} {
                animation: glow 1.5s ease-in-out infinite alternate;
                box-shadow: 0 0 10px rgba(72, 118, 255, 0.7);
                transition: box-shadow 0.3s ease;
            }
            @keyframes glow {
                from {
                    box-shadow: 0 0 5px rgba(72, 118, 255, 0.5),
                                0 0 10px rgba(72, 118, 255, 0.5),
                                0 0 15px rgba(72, 118, 255, 0.5);
                }
                to {
                    box-shadow: 0 0 10px rgba(72, 118, 255, 0.8),
                                0 0 20px rgba(72, 118, 255, 0.8),
                                0 0 30px rgba(72, 118, 255, 0.8);
                }
            }
        `;
        iframeDocument.head.appendChild(style);

        // Add event listeners
        iframeDocument.body.addEventListener("mouseover", handleMouseOver);
        iframeDocument.body.addEventListener("mouseout", handleMouseOut);
        iframeDocument.body.addEventListener("click", handleClick);

        return () => {
            // Clean up event listeners and styles
            iframeDocument.body.removeEventListener(
                "mouseover",
                handleMouseOver,
            );
            iframeDocument.body.removeEventListener("mouseout", handleMouseOut);
            iframeDocument.body.removeEventListener("click", handleClick);

            // Remove highlight styles from all elements
            const highlightedElements = iframeDocument.querySelectorAll(
                `.${SECTION_EDITOR_HIGHLIGHT_CLASS}, .${SECTION_EDITOR_SELECTED_CLASS}, .${SECTION_EDITOR_MODIFIED_CLASS}`,
            );

            for (const el of highlightedElements) {
                el.classList.remove(SECTION_EDITOR_HIGHLIGHT_CLASS);
                el.classList.remove(SECTION_EDITOR_SELECTED_CLASS);
                el.classList.remove(SECTION_EDITOR_MODIFIED_CLASS);
            }

            // Remove style element
            style.remove();
        };
    }, [iframeDocument, modeId]);

    // Handle prompt change
    const handlePromptChange = useCallback((value: string) => {
        setPrompt(value);
    }, []);

    // Handle apply button click
    const handleApplyChanges = async () => {
        if (!selectedElement || !iframeDocument || !prompt.trim()) return;

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
                const newElement =
                    tempContainer.firstElementChild as HTMLElement;

                if (newElement) {
                    // Ensure the new element has the same ID
                    newElement.id = selectedElementRef.current.id;

                    // Replace the old element with the new one
                    selectedElementRef.current.replaceWith(newElement);

                    // Update selected element reference
                    setSelectedElement(newElement);
                    selectedElementRef.current = newElement;

                    // Add glow effect to modified section
                    newElement.classList.add(SECTION_EDITOR_MODIFIED_CLASS);
                    newElement.classList.add(SECTION_EDITOR_SELECTED_CLASS);

                    // Mark that changes were made
                    setHasChanges(true);

                    // Update the section HTML for future modifications
                    setSectionHtml(newElement.outerHTML);
                }
            }
        } catch (error) {
            console.error("Error modifying section:", error);
        } finally {
            setLoading(false);
        }
    };

    // Save changes when exiting the content editor
    useEffect(() => {
        // If we're leaving the content editor and have changes
        if (modeId !== "section-editor" && hasChanges && iframeDocument) {
            onHtmlChange({
                html: iframeDocument.documentElement.outerHTML,
                modeId: "section-editor",
                modeLabel: "Section Editor",
            });
            setHasChanges(false);
        }
    }, [modeId, hasChanges, iframeDocument, onHtmlChange]);

    // Get section type for placeholder text
    const getSectionType = useCallback(() => {
        if (!selectedElement) return "section";

        // Try to get section type from data attribute
        const sectionType = selectedElement.getAttribute("data-section-type");
        if (sectionType) return sectionType;

        // Try to guess from ID
        const id = selectedElement.id;
        if (id?.includes("-")) {
            const parts = id.split("-");
            return parts[parts.length - 1];
        }

        return "section";
    }, [selectedElement]);

    return (
        <div className="flex gap-2 p-1">
            <input
                type="text"
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder={`Modify ${getSectionType()} section...`}
                className="flex-1 p-2 rounded min-w-[500px] border-none outline-none text-[14px]"
            />
            <Button
                size="icon"
                onClick={handleApplyChanges}
                disabled={loading || !prompt.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-700"
            >
                <IconSend size={18} stroke={2} />
            </Button>
        </div>
    );
};

// Register the content editor mode
export const SectionEditorMode = (): EditorMode => {
    return {
        id: "section-editor",
        label: "Section Editor",
        editorRenderer: () => <SectionEditor />,
        actionRenderer: (isActive: boolean) => (
            <Button
                size="icon"
                variant="ghost"
                className={cn(
                    "!hover:bg-blue-500/10 hover:text-blue-700 rounded-lg",
                    isActive &&
                        "text-blue-700 bg-blue-500/10 hover:text-blue-700",
                )}
            >
                <IconCashEdit size={28} />
            </Button>
        ),
    };
};
