import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconEdit } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
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
    const [content, setContent] = useState<string>("");
    const [hasChanges, setHasChanges] = useState(false);
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
                setContent(target.textContent || "");
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

    // Handle content change
    const handleContentChange = useCallback((value: string) => {
        setContent(value);
        setHasChanges(true);
    }, []);

    // Apply content change
    const applyContentChange = useCallback(() => {
        if (!selectedElement || !iframeDocument) return;

        selectedElement.textContent = content;
        setHasChanges(true);
        setSelectedElement(null);
    }, [selectedElement, content, iframeDocument]);

    // Save changes when exiting the content editor
    useEffect(() => {
        return () => {
            if (modeId !== "content-editor" && hasChanges && iframeDocument) {
                onHtmlChange({
                    html: iframeDocument.documentElement.outerHTML,
                    modeId: "content-editor",
                    modeLabel: "Content Editor",
                });
                setHasChanges(false);
            }
        };
    }, [modeId, hasChanges, iframeDocument, onHtmlChange]);

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-medium">Content Editor</h3>
            <p className="text-sm text-muted-foreground">
                Hover over text elements to highlight them, click to edit their
                content.
            </p>

            {selectedElement && (
                <div className="space-y-3">
                    <textarea
                        value={content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full p-2 border rounded min-h-[100px]"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                selectedElement.classList.remove(
                                    "feno-content-editor-selected",
                                );
                                selectedElementRef.current = null;
                                setSelectedElement(null);
                                setContent("");
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button onClick={applyContentChange}>Apply</Button>
                    </div>
                </div>
            )}
        </div>
    );
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
