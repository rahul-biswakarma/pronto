import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconEdit } from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import { TiptapEditor } from "../../../../ui/tiptap/tiptap-editor";
import {
    baseStyle,
    hoveredStyle,
    isOnlyTextElement,
    selectedStyle,
} from "./utils";

const CONTENT_EDITOR_HIGHLIGHT_CLASS = "feno-content-editor-highlight";
const CONTENT_EDITOR_SELECTED_CLASS = "feno-content-editor-selected";

// Content Editor component
const ContentEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId } = useEditor();
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
            if (isOnlyTextElement(target)) {
                target.classList.add(CONTENT_EDITOR_HIGHLIGHT_CLASS);
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isOnlyTextElement(target)) {
                target.classList.remove(CONTENT_EDITOR_HIGHLIGHT_CLASS);
            }
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            if (isOnlyTextElement(target)) {
                // Use the ref to access the current selected element
                if (selectedElementRef.current) {
                    selectedElementRef.current.classList.remove(
                        CONTENT_EDITOR_SELECTED_CLASS,
                    );
                }
                target.classList.add(CONTENT_EDITOR_SELECTED_CLASS);
                setSelectedElement(target);
                // The TiptapEditor component will handle setting its own initial content via props
            }
        };

        // Add CSS for highlight effect
        const style = iframeDocument.createElement("style");
        style.textContent = `
			.${CONTENT_EDITOR_HIGHLIGHT_CLASS} {
				${baseStyle}
			}
			.${CONTENT_EDITOR_HIGHLIGHT_CLASS}:hover {
				${hoveredStyle}
			}
			.${CONTENT_EDITOR_SELECTED_CLASS},
			.${CONTENT_EDITOR_SELECTED_CLASS}:hover {
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
                `.${CONTENT_EDITOR_HIGHLIGHT_CLASS}, .${CONTENT_EDITOR_SELECTED_CLASS}`,
            );
            for (const el of highlightedElements) {
                el.classList.remove(CONTENT_EDITOR_HIGHLIGHT_CLASS);
                el.classList.remove(CONTENT_EDITOR_SELECTED_CLASS);
            }

            // Remove style element
            style.remove();
        };
    }, [iframeDocument, modeId]);

    const handleEditorChange = (html: string) => {
        if (selectedElement && iframeDocument) {
            selectedElement.innerHTML = html;
            onHtmlChange({
                html: iframeDocument.documentElement.outerHTML,
                modeId: "content-editor",
                modeLabel: "Content Editor",
            });
        }
    };

    return selectedElement ? (
        <TiptapEditor
            initialContent={selectedElement.innerHTML || ""}
            onChange={handleEditorChange}
        />
    ) : null;
};

// Register the content editor mode
export const ContentEditorMode = (): EditorMode => {
    return {
        id: "content-editor",
        label: "Content Editor",
        editorRenderer: () => <ContentEditor />,
        actionRenderer: (isActive: boolean) => (
            <Button
                size="icon"
                variant="ghost"
                className={cn(
                    "!hover:bg-yellow-500/10",
                    isActive &&
                        "text-yellow-600 bg-yellow-500/10 hover:text-yellow-600",
                )}
            >
                <IconEdit size={28} />
            </Button>
        ),
    };
};
