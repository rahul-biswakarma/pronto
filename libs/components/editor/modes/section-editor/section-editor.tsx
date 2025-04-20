import { Button } from "@/libs/ui/button";
import { TiptapEditor } from "@/libs/ui/tiptap";
import dataLayer from "@/libs/utils/data-layer";
import { IconCashEdit, IconX } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ModerActionRenderer } from "../../_components/moder-action-renderer";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import { SectionEditorInput } from "./section-editor-input";
import {
    baseStyle,
    contentHoveredStyle,
    contentSelectedStyle,
    findSectionElement,
    sectionHoveredStyle,
    sectionSelectedStyle,
} from "./utils";

const SECTION_HIGHLIGHT_CLASS = "feno-section-editor-highlight";
const SECTION_SELECTED_CLASS = "feno-section-editor-selected";
const CONTENT_HIGHLIGHT_CLASS = "feno-content-highlight";
const CONTENT_SELECTED_CLASS = "feno-content-selected";

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
    const [elementType, setElementType] = useState<"section" | "text" | null>(
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
                if (sectionElement.type === "section") {
                    sectionElement.element.classList.add(
                        SECTION_HIGHLIGHT_CLASS,
                    );
                } else if (sectionElement.type === "text") {
                    sectionElement.element.classList.add(
                        CONTENT_HIGHLIGHT_CLASS,
                    );
                }
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const sectionElement = findSectionElement(target);
            if (sectionElement) {
                if (sectionElement.type === "section") {
                    sectionElement.element.classList.remove(
                        SECTION_HIGHLIGHT_CLASS,
                    );
                } else if (sectionElement.type === "text") {
                    sectionElement.element.classList.remove(
                        CONTENT_HIGHLIGHT_CLASS,
                    );
                }
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
                        SECTION_SELECTED_CLASS,
                    );
                    selectedElementRef.current.classList.remove(
                        CONTENT_SELECTED_CLASS,
                    );
                }
                if (sectionElement.type === "section") {
                    setSectionId(sectionElement.element.id);
                    setSectionHtml(sectionElement.element.outerHTML);
                    sectionElement.element.classList.add(
                        SECTION_SELECTED_CLASS,
                    );
                    setSelectedElement(sectionElement.element);
                    setElementType("section");
                } else if (sectionElement.type === "text") {
                    sectionElement.element.classList.add(
                        CONTENT_SELECTED_CLASS,
                    );
                    setSelectedElement(sectionElement.element);
                    setElementType("text");
                }
                setPrompt("");
            } else {
                selectedElementRef.current?.classList.remove(
                    SECTION_SELECTED_CLASS,
                );
                selectedElementRef.current?.classList.remove(
                    CONTENT_SELECTED_CLASS,
                );
                setSelectedElement(null);
                setElementType(null);
            }
        };

        // Add CSS for highlight effect
        const style = iframeDocument.createElement("style");
        style.textContent = `
            .${SECTION_HIGHLIGHT_CLASS} .${CONTENT_HIGHLIGHT_CLASS} .${SECTION_SELECTED_CLASS} .${CONTENT_SELECTED_CLASS} {
				${baseStyle}
            }
            .${SECTION_SELECTED_CLASS} {
                ${sectionSelectedStyle}
                position: relative; /* Needed for pseudo-element positioning */
                overflow: hidden; /* Contain the pseudo-element */
            }
            .${CONTENT_SELECTED_CLASS} {
                ${contentSelectedStyle}
            }
			.${SECTION_HIGHLIGHT_CLASS}:not(.${SECTION_SELECTED_CLASS}):hover {
				${sectionHoveredStyle}
            }
			.${CONTENT_HIGHLIGHT_CLASS}:not(.${CONTENT_SELECTED_CLASS}):hover {
				${contentHoveredStyle}
            }

			/* Animated Gradient Overlay */
			@keyframes pulse-gradient {
				0% { background-position: 0% 50%; }
				50% { background-position: 100% 50%; }
				100% { background-position: 0% 50%; }
			}

			/* Apply animation only when loading class is present */
			.${SECTION_SELECTED_CLASS}.feno-section-loading::before {
				content: '';
				position: absolute;
				top: 0; left: 0; right: 0; bottom: 0;
				background: linear-gradient(90deg, rgba(0, 123, 255, 0), rgba(0, 123, 255, 0.2), rgba(0, 123, 255, 0));
				background-size: 200% 100%;
				animation: pulse-gradient 3s ease-in-out infinite;
				pointer-events: none; /* Allow clicks to pass through */
				z-index: 1; /* Ensure it's above the section content slightly */
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
                `.${SECTION_HIGHLIGHT_CLASS}, .${SECTION_SELECTED_CLASS}, .${CONTENT_SELECTED_CLASS} ${CONTENT_HIGHLIGHT_CLASS}`,
            );

            for (const el of highlightedElements) {
                el.classList.remove(SECTION_HIGHLIGHT_CLASS);
                el.classList.remove(SECTION_SELECTED_CLASS);
                el.classList.remove(CONTENT_SELECTED_CLASS);
                el.classList.remove(CONTENT_HIGHLIGHT_CLASS);
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

        // Add loading class to start animation
        selectedElementRef.current?.classList.add("feno-section-loading");
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
            // Remove loading class to stop animation
            selectedElementRef.current?.classList.remove(
                "feno-section-loading",
            );
            // Clear the prompt input
            setPrompt("");
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

    const handleEditorChange = (html: string) => {
        const newHtml = html.replace(/^<p>|<\/p>$/g, "");

        if (selectedElement && iframeDocument) {
            selectedElement.innerHTML = newHtml;
        }
    };

    return (
        <div className="flex w-[700px]">
            {selectedElement && elementType === "section" && (
                <div className="w-full flex flex-col gap-1">
                    <div className="flex items-center justify-between bg-blue-400/10 border border-blue-400/20 text-blue-500 p-1 px-3 rounded-xl">
                        <p className="text-sm">
                            Currently editing{" "}
                            {selectedElement.id
                                .replace("feno-sec-", "")
                                .replace("-", " ")
                                .replace(/^\w/, (c) => c.toUpperCase())}{" "}
                            section
                        </p>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSelectedElement(null);
                                setElementType(null);
                                selectedElement.classList.remove(
                                    SECTION_SELECTED_CLASS,
                                );
                                selectedElement.classList.remove(
                                    CONTENT_SELECTED_CLASS,
                                );
                                // Ensure loading class is removed if selection changes mid-load (edge case)
                                selectedElement.classList.remove(
                                    "feno-section-loading",
                                );
                            }}
                            size="icon"
                            className="!dark:hover:bg-blue-300 !hover:bg-blue-300 hover:text-blue-700"
                        >
                            <IconX className="size-4" />
                        </Button>
                    </div>
                    <SectionEditorInput
                        input={prompt}
                        loading={loading}
                        onSubmit={handleApplyChanges}
                        onInputChange={handlePromptChange}
                    />
                </div>
            )}
            {selectedElement && elementType === "text" && (
                <TiptapEditor
                    liveChange={true}
                    placeholder="Select a text element to edit content"
                    initialContent={selectedElement?.innerHTML || ""}
                    onChange={handleEditorChange}
                />
            )}
            {!selectedElement && (
                <SectionEditorInput
                    input={prompt}
                    loading={loading}
                    onSubmit={handleApplyChanges}
                    onInputChange={handlePromptChange}
                />
            )}
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
            <ModerActionRenderer
                icon={IconCashEdit}
                label="Section Editor"
                active={isActive}
            />
        ),
    };
};
