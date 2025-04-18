import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconSection } from "@tabler/icons-react";
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

// Section Editor component
const SectionEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId } = useEditor();
    const [content, setContent] = useState<string>("");
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
                setContent(sectionElement.textContent || "");
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
                `.${SECTION_EDITOR_HIGHLIGHT_CLASS}, .${SECTION_EDITOR_SELECTED_CLASS}`,
            );

            for (const el of highlightedElements) {
                el.classList.remove(SECTION_EDITOR_HIGHLIGHT_CLASS);
                el.classList.remove(SECTION_EDITOR_SELECTED_CLASS);
            }

            // Remove style element
            style.remove();
        };
    }, [iframeDocument, modeId]);

    // Handle content change
    const handleContentChange = useCallback((value: string) => {
        setContent(value);
        setHasChanges(true);
    }, []);

    // Save changes when exiting the content editor
    useEffect(() => {
        // If we're leaving the content editor and have changes
        if (modeId !== "content-editor" && hasChanges && iframeDocument) {
            onHtmlChange({
                html: iframeDocument.documentElement.outerHTML,
                modeId: "content-editor",
                modeLabel: "Content Editor",
            });
            setHasChanges(false);
        }
    }, [modeId, hasChanges, iframeDocument, onHtmlChange]);

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-medium">Section Editor</h3>

            {selectedElement && (
                <div className="space-y-3">
                    <input
                        value=""
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full p-2 border rounded min-h-[100px]"
                    />
                </div>
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
            <Button
                size="icon"
                variant="ghost"
                className={cn(isActive && "bg-black text-primary-foreground")}
            >
                <IconSection size={28} />
            </Button>
        ),
    };
};
