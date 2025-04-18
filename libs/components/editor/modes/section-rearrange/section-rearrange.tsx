import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconArrowsExchange2 } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import {
    SECTION_DRAGGABLE_CLASS,
    SECTION_DRAGOVER_CLASS,
    SECTION_HANDLE_CLASS,
    SECTION_ID_PREFIX,
    SECTION_PLACEHOLDER_CLASS,
    SECTION_REARRANGE_CLASS,
    baseStyle,
    createDragHandle,
    draggableStyle,
    draggingStyle,
    dragoverStyle,
    getAllSections,
    handleStyle,
    placeholderStyle,
} from "./utils";

// Section Rearrange component
const SectionRearrange: React.FC = () => {
    const { iframeDocument, onHtmlChange } = useEditor();

    const [hasChanges, setHasChanges] = useState(false);

    // Enable rearrange mode when component mounts
    useEffect(() => {
        if (iframeDocument) {
            enableRearrangeMode();
        }
    }, [iframeDocument]);

    useEffect(() => {
        return () => {
            if (hasChanges && iframeDocument) {
                onHtmlChange({
                    html: iframeDocument.documentElement.outerHTML,
                    modeId: "section-rearrange",
                    modeLabel: "Section Rearrange",
                });
            }
        };
    }, [hasChanges, iframeDocument, onHtmlChange]);

    // Function to enable rearrange mode
    const enableRearrangeMode = useCallback(() => {
        if (!iframeDocument) return;

        // Apply draggable mode to all sections
        const sections = getAllSections(iframeDocument);

        // Add drag handles and make sections draggable
        for (const section of sections) {
            // Add drag handle
            const handle = createDragHandle();
            section.appendChild(handle);

            // Make section draggable
            section.setAttribute("draggable", "true");
            section.classList.add(SECTION_DRAGGABLE_CLASS);
            section.classList.add(SECTION_REARRANGE_CLASS);
        }

        setHasChanges(false);
    }, [iframeDocument]);

    // Function to disable rearrange mode
    const disableRearrangeMode = useCallback(() => {
        if (!iframeDocument) return;

        // Remove all drag handles and draggable attributes
        const sections = getAllSections(iframeDocument);
        for (const section of sections) {
            // Remove drag handles
            const handles = section.querySelectorAll(
                `.${SECTION_HANDLE_CLASS}`,
            );
            for (const handle of handles) {
                handle.remove();
            }

            // Remove draggable attribute and classes
            section.removeAttribute("draggable");
            section.classList.remove(SECTION_DRAGGABLE_CLASS);
            section.classList.remove(SECTION_REARRANGE_CLASS);
            section.classList.remove(SECTION_DRAGOVER_CLASS);
        }

        // Remove any placeholders
        const placeholders = iframeDocument.querySelectorAll(
            `.${SECTION_PLACEHOLDER_CLASS}`,
        );
        for (const placeholder of placeholders) {
            placeholder.remove();
        }
    }, [iframeDocument]);

    // Set up drag and drop handlers
    useEffect(() => {
        if (!iframeDocument) return;

        let draggedElement: HTMLElement | null = null;

        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (!target.id?.startsWith(SECTION_ID_PREFIX)) return;

            draggedElement = target;

            // Set a half-transparent drag image
            target.classList.add("dragging");
            setTimeout(() => {
                target.style.cssText += draggingStyle;
            }, 0);

            // Set data transfer
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", target.id);
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            if (!draggedElement) return;

            const target = e.target as HTMLElement;
            const section = target.closest(
                `[id^="${SECTION_ID_PREFIX}"]`,
            ) as HTMLElement;

            if (section && section !== draggedElement) {
                section.classList.add(SECTION_DRAGOVER_CLASS);
            }
        };

        const handleDragLeave = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            const section = target.closest(
                `[id^="${SECTION_ID_PREFIX}"]`,
            ) as HTMLElement;

            if (section) {
                section.classList.remove(SECTION_DRAGOVER_CLASS);
            }
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            if (!draggedElement) return;

            const target = e.target as HTMLElement;
            const dropTarget = target.closest(
                `[id^="${SECTION_ID_PREFIX}"]`,
            ) as HTMLElement;

            if (dropTarget && dropTarget !== draggedElement) {
                // Determine if we should insert before or after
                const rect = dropTarget.getBoundingClientRect();
                const middleY = rect.top + rect.height / 2;
                const isBefore = e.clientY < middleY;

                // Insert the dragged element
                if (isBefore) {
                    dropTarget.parentNode?.insertBefore(
                        draggedElement,
                        dropTarget,
                    );
                } else {
                    dropTarget.parentNode?.insertBefore(
                        draggedElement,
                        dropTarget.nextSibling,
                    );
                }

                // Mark that changes have been made
                setHasChanges(true);
            }

            // Clean up all sections more thoroughly
            const sections = getAllSections(iframeDocument);
            for (const section of sections) {
                // Remove drag-related classes
                section.classList.remove(SECTION_DRAGOVER_CLASS);
                section.classList.remove("dragging");

                // Reset any inline styles from dragging
                section.style.opacity = "";
                section.style.transform = "";
                section.style.outline = "";
                section.style.outlineOffset = "";
                section.style.zIndex = "";
            }

            draggedElement = null;
        };

        const handleDragEnd = (e: DragEvent) => {
            // Clean up
            if (!draggedElement) return;

            // Reset styles on the dragged element
            draggedElement.classList.remove("dragging");
            draggedElement.style.opacity = "";
            draggedElement.style.transform = "";
            draggedElement.style.outline = "";
            draggedElement.style.outlineOffset = "";
            draggedElement.style.zIndex = "";

            draggedElement = null;

            // Clean up all sections
            const sections = getAllSections(iframeDocument);
            for (const section of sections) {
                section.classList.remove(SECTION_DRAGOVER_CLASS);
            }
        };

        // Add style for drag elements
        const style = iframeDocument.createElement("style");
        style.textContent = `
            .${SECTION_REARRANGE_CLASS} {
                ${baseStyle}
            }
            .${SECTION_DRAGGABLE_CLASS} {
                ${draggableStyle}
            }
            .${SECTION_HANDLE_CLASS} {
                ${handleStyle}
            }
            .${SECTION_DRAGOVER_CLASS} {
                ${dragoverStyle}
            }
            .${SECTION_PLACEHOLDER_CLASS} {
                ${placeholderStyle}
            }
        `;
        iframeDocument.head.appendChild(style);

        // Add event listeners for drag and drop
        iframeDocument.addEventListener("dragstart", handleDragStart);
        iframeDocument.addEventListener("dragover", handleDragOver);
        iframeDocument.addEventListener("dragleave", handleDragLeave);
        iframeDocument.addEventListener("drop", handleDrop);
        iframeDocument.addEventListener("dragend", handleDragEnd);

        return () => {
            // Clean up event listeners and styles
            iframeDocument.removeEventListener("dragstart", handleDragStart);
            iframeDocument.removeEventListener("dragover", handleDragOver);
            iframeDocument.removeEventListener("dragleave", handleDragLeave);
            iframeDocument.removeEventListener("drop", handleDrop);
            iframeDocument.removeEventListener("dragend", handleDragEnd);

            // Remove the style element
            style.remove();

            // Clean up any drag-related elements
            disableRearrangeMode();
        };
    }, [iframeDocument, disableRearrangeMode]);

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-medium">Section Rearrange</h3>
            <p className="text-sm text-gray-600">
                Drag and drop sections to rearrange them. Use the handles to
                move sections.
            </p>
        </div>
    );
};

// Register the section rearrange mode
export const SectionRearrangeMode = (): EditorMode => {
    return {
        id: "section-rearrange",
        label: "Section Rearrange",
        editorRenderer: () => <SectionRearrange />,
        actionRenderer: (isActive: boolean) => (
            <Button
                size="icon"
                variant="ghost"
                className={cn(isActive && "bg-black text-primary-foreground")}
                title="Rearrange Sections"
            >
                <IconArrowsExchange2 size={28} />
            </Button>
        ),
    };
};
