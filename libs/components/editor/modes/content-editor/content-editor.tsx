"use client";
import { Button } from "@/libs/ui/button";
import { TiptapEditor } from "@/libs/ui/tiptap/tiptap-editor";
import { cn } from "@/libs/utils/misc";
import { IconEdit } from "@tabler/icons-react";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useEditor } from "../../editor.context";

// Constants for element class names
const CONTENT_EDITOR_HOVER_ELEMENT_CLASS = "content-editor-hover-element";
const CONTENT_EDITOR_SELECTED_ELEMENT_CLASS = "content-editor-selected-element";

const ContentEditor = () => {
    const { iframeDocument, onHtmlChange } = useEditor();
    const [selectedNode, setSelectedNode] = useState<HTMLElement | null>(null);
    const [selectedHtml, setSelectedHtml] = useState<string>("");

    // Add event listeners and styles to iframe document
    useEffect(() => {
        if (!iframeDocument) return;

        // Function to check if an element has direct text content
        const hasDirectTextContent = (element: HTMLElement): boolean => {
            // Check if element has text nodes as direct children
            let hasText = false;
            let hasOnlyTextAndElements = true;

            for (const node of Array.from(element.childNodes)) {
                if (node.nodeType === Node.TEXT_NODE) {
                    // Check if the text node has non-whitespace content
                    if (node.textContent?.trim()) {
                        hasText = true;
                    }
                } else if (node.nodeType === Node.COMMENT_NODE) {
                    // If it has comment nodes, we're not interested
                    hasOnlyTextAndElements = false;
                    break;
                }
            }

            return hasText && hasOnlyTextAndElements;
        };

        // Keep reference to currently selected element
        let currentSelectedElement: HTMLElement | null = null;

        // Apply styles to selected element
        const applySelectedStyles = (element: HTMLElement) => {
            // Reset previous selection if exists
            if (currentSelectedElement && currentSelectedElement !== element) {
                currentSelectedElement.classList.remove(
                    CONTENT_EDITOR_SELECTED_ELEMENT_CLASS,
                );
            }

            // Add class for selected element
            element.classList.remove(CONTENT_EDITOR_HOVER_ELEMENT_CLASS);
            element.classList.add(CONTENT_EDITOR_SELECTED_ELEMENT_CLASS);

            // Update reference
            currentSelectedElement = element;

            // Extract content for editing
            const htmlContent = element.innerHTML;

            setSelectedNode(element);
            setSelectedHtml(htmlContent);
        };

        // Event handler for mouse over elements
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Only highlight elements with direct text content
            if (
                hasDirectTextContent(target) &&
                target !== currentSelectedElement
            ) {
                target.classList.add(CONTENT_EDITOR_HOVER_ELEMENT_CLASS);
            }
        };

        // Event handler for mouse out
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (target !== currentSelectedElement) {
                target.classList.remove(CONTENT_EDITOR_HOVER_ELEMENT_CLASS);
            }
        };

        // Event handler for clicking elements
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Only select elements with direct text content
            if (hasDirectTextContent(target)) {
                e.preventDefault();
                e.stopPropagation();
                applySelectedStyles(target);
            }
        };

        // Add CSS for hover and selection effects
        const style = iframeDocument.createElement("style");
        style.textContent = `
            /* Styles for hover and selected elements */
            .${CONTENT_EDITOR_HOVER_ELEMENT_CLASS} {
                outline: 1px dashed #FACC15 !important;
                outline-offset: 1px !important;
                cursor: pointer !important;
            }

            .${CONTENT_EDITOR_SELECTED_ELEMENT_CLASS} {
                outline: 2px solid #FACC15 !important;
                outline-offset: 2px !important;
            }
        `;
        iframeDocument.head.appendChild(style);

        // Add event listeners with capture phase
        if (iframeDocument.body) {
            iframeDocument.body.addEventListener(
                "mouseover",
                handleMouseOver,
                true,
            );
            iframeDocument.body.addEventListener(
                "mouseout",
                handleMouseOut,
                true,
            );
            iframeDocument.body.addEventListener("click", handleClick, true);
        }

        return () => {
            // Clean up event listeners and styles
            if (iframeDocument.body) {
                iframeDocument.body.removeEventListener(
                    "mouseover",
                    handleMouseOver,
                    true,
                );
                iframeDocument.body.removeEventListener(
                    "mouseout",
                    handleMouseOut,
                    true,
                );
                iframeDocument.body.removeEventListener(
                    "click",
                    handleClick,
                    true,
                );
            }

            // Remove styles and classes from all elements
            if (currentSelectedElement) {
                currentSelectedElement.classList.remove(
                    CONTENT_EDITOR_SELECTED_ELEMENT_CLASS,
                );
            }

            if (iframeDocument) {
                const hoveredElements = iframeDocument.querySelectorAll(
                    `.${CONTENT_EDITOR_HOVER_ELEMENT_CLASS}`,
                );
                for (const el of hoveredElements) {
                    el.classList.remove(CONTENT_EDITOR_HOVER_ELEMENT_CLASS);
                }

                // Remove style element
                style.remove();
            }
        };
    }, [iframeDocument]);

    // Handle content replacement with live update
    const handleContentUpdate = (html: string) => {
        if (!selectedNode || !iframeDocument) return;

        // Sanitize the HTML to prevent XSS
        const sanitizedHtml = DOMPurify.sanitize(html);

        // Update the selected HTML in state
        setSelectedHtml(sanitizedHtml);

        // Immediately apply changes to the DOM
        selectedNode.innerHTML = sanitizedHtml;

        // Update the document HTML
        onHtmlChange({
            html: iframeDocument.documentElement.outerHTML,
            modeId: "content-editor",
            modeLabel: "Content Editor",
        });
    };

    // Reset selection
    const clearSelection = () => {
        if (selectedNode) {
            selectedNode.classList.remove(
                CONTENT_EDITOR_SELECTED_ELEMENT_CLASS,
            );
        }
        setSelectedNode(null);
        setSelectedHtml("");
    };

    return (
        <div className="min-w-[500px] max-w-[500px] feno-mod-container overflow-hidden">
            {selectedNode ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <TiptapEditor
                        onClose={clearSelection}
                        initialContent={selectedHtml}
                        onChange={handleContentUpdate}
                        liveChange={true}
                        placeholder="Edit the selected content..."
                    />
                </motion.div>
            ) : (
                <div className="text-center p-6 text-[var(--feno-text-2)]">
                    <p className="text-sm">
                        Hover over text elements and click to edit their
                        content.
                    </p>
                </div>
            )}
        </div>
    );
};

export const ContentEditorMode = () => {
    return {
        id: "content-editor",
        label: "Content Editor",
        actionRenderer: (isActive: boolean) => (
            <Button
                variant="custom"
                size="icon"
                className={cn("feno-mode-button", {
                    "feno-mode-active-button": isActive,
                })}
            >
                <IconEdit size={16} />
            </Button>
        ),
        editorRenderer: () => <ContentEditor />,
    };
};
