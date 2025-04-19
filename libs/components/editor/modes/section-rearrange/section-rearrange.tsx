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
    createPlaceholder,
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
    const [placeholder, setPlaceholder] = useState<HTMLElement | null>(null);

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
        setPlaceholder(null);
    }, [iframeDocument]);

    // Set up drag and drop handlers
    useEffect(() => {
        if (!iframeDocument) return;

        let draggedElement: HTMLElement | null = null;
        let currentPlaceholder: HTMLElement | null = null;

        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (!target.id?.startsWith(SECTION_ID_PREFIX)) return;

            draggedElement = target;

            // Create and store placeholder locally for this drag operation
            currentPlaceholder = createPlaceholder();

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
            if (!draggedElement || !currentPlaceholder) return;

            const target = e.target as HTMLElement;
            const section = target.closest(
                `[id^="${SECTION_ID_PREFIX}"]`,
            ) as HTMLElement;

            // Remove dragover class from all sections first
            const sections = getAllSections(iframeDocument);
            for (const sec of sections) {
                sec.classList.remove(SECTION_DRAGOVER_CLASS);
            }

            if (section && section !== draggedElement) {
                section.classList.add(SECTION_DRAGOVER_CLASS);

                // Determine position and insert placeholder
                const rect = section.getBoundingClientRect();
                const middleY = rect.top + rect.height / 2;
                const isBefore = e.clientY < middleY;

                if (isBefore) {
                    section.parentNode?.insertBefore(
                        currentPlaceholder,
                        section,
                    );
                } else {
                    section.parentNode?.insertBefore(
                        currentPlaceholder,
                        section.nextSibling,
                    );
                }
                setPlaceholder(currentPlaceholder);
            } else {
                if (currentPlaceholder.parentNode) {
                    currentPlaceholder.remove();
                    setPlaceholder(null);
                }
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

            const relatedTarget = e.relatedTarget as Node;
            if (
                currentPlaceholder?.parentNode &&
                !section?.contains(relatedTarget) &&
                relatedTarget !== currentPlaceholder
            ) {
                const isEnteringAnotherSection = getAllSections(
                    iframeDocument,
                ).some((s) => s.contains(relatedTarget));
                if (!isEnteringAnotherSection) {
                    currentPlaceholder.remove();
                    setPlaceholder(null);
                }
            }
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            if (!draggedElement || !currentPlaceholder?.parentNode) {
                handleDragEnd(e);
                return;
            }

            currentPlaceholder.parentNode.insertBefore(
                draggedElement,
                currentPlaceholder,
            );

            setHasChanges(true);

            currentPlaceholder.remove();
            setPlaceholder(null);
            currentPlaceholder = null;

            const sections = getAllSections(iframeDocument);
            for (const section of sections) {
                section.classList.remove(SECTION_DRAGOVER_CLASS);
            }

            draggedElement = null;
        };

        const handleDragEnd = (e: DragEvent) => {
            if (currentPlaceholder?.parentNode) {
                currentPlaceholder.remove();
                setPlaceholder(null);
            }
            currentPlaceholder = null;

            if (draggedElement) {
                draggedElement.classList.remove("dragging");
                draggedElement.style.opacity = "";
                draggedElement.style.transform = "";
                draggedElement.style.outline = "";
                draggedElement.style.outlineOffset = "";
                draggedElement.style.zIndex = "";
                draggedElement = null;
            }

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
            iframeDocument.removeEventListener("dragstart", handleDragStart);
            iframeDocument.removeEventListener("dragover", handleDragOver);
            iframeDocument.removeEventListener("dragleave", handleDragLeave);
            iframeDocument.removeEventListener("drop", handleDrop);
            iframeDocument.removeEventListener("dragend", handleDragEnd);

            style.remove();

            disableRearrangeMode();

            if (currentPlaceholder?.parentNode) {
                currentPlaceholder.remove();
                setPlaceholder(null);
            }
        };
    }, [iframeDocument, disableRearrangeMode, onHtmlChange]);

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
                className={cn(
                    "hover:bg-orange-400/20 hover:text-orange-500",
                    isActive && "text-orange-500 bg-orange-400/20",
                )}
                title="Rearrange Sections"
            >
                <IconArrowsExchange2 size={28} />
            </Button>
        ),
    };
};
