import { Tooltip, TooltipContent, TooltipTrigger } from "@/libs/ui/tooltip";
import { cn } from "@/libs/utils/misc";
import {
    IconChevronDown,
    IconChevronUp,
    IconCornerLeftUp,
    IconX,
} from "@tabler/icons-react";
import { PAGE_EDITOR_SELECTED_ELEMENT_CLASS } from "../../utils";

interface StyleElementSelectorProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedElement: HTMLElement;
    iframeDocument: Document | null;
    setSelectedElement: (element: HTMLElement | null) => void;
    isGenerating: boolean;
}

/**
 * Component for displaying and managing the selected element
 */
export const StyleElementSelector: React.FC<StyleElementSelectorProps> = ({
    isOpen,
    setIsOpen,
    selectedElement,
    iframeDocument,
    setSelectedElement,
    isGenerating,
}) => {
    const tagName = selectedElement.tagName.toLowerCase();
    const parentElement = selectedElement.parentElement;
    const canSelectParent =
        parentElement &&
        parentElement !== iframeDocument?.body &&
        parentElement !== iframeDocument?.documentElement;

    return (
        <div
            className={cn(
                "flex items-center justify-between border-b border-[var(--feno-border-1)] p-3",
                !isOpen && "!border-b-0",
            )}
        >
            <div className="flex items-center gap-1">
                <p className="text-sm font-medium">
                    <code className="rounded text">{tagName}</code>
                </p>
            </div>
            <div className={cn("flex items-center gap-3")}>
                <Tooltip delayDuration={500}>
                    <TooltipTrigger disabled={!canSelectParent || isGenerating}>
                        <div
                            className={cn(
                                "size-6 flex items-center justify-center hover:bg-[var(--feno-interactive-hovered-bg)] hover:border-[var(--feno-interactive-hovered-border)] rounded-lg",
                                (!canSelectParent || isGenerating) &&
                                    "cursor-not-allowed text-[var(--feno-text-3)]",
                            )}
                            onClick={() => {
                                if (canSelectParent && parentElement) {
                                    // First clear styles from current selection
                                    if (selectedElement) {
                                        selectedElement.style.outline = "";
                                        selectedElement.style.outlineOffset =
                                            "";
                                        selectedElement.classList.remove(
                                            PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                                        );
                                    }

                                    // Apply styles to parent directly
                                    parentElement.style.outline =
                                        "2px solid #0ea5e9";
                                    parentElement.style.outlineOffset = "2px";
                                    parentElement.classList.add(
                                        PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                                    );

                                    // Update selected element state
                                    setSelectedElement(parentElement);
                                }
                            }}
                            title="Select parent element"
                        >
                            <IconCornerLeftUp className="size-4" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>Select parent element</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={500}>
                    <TooltipTrigger>
                        <div
                            className="size-6 flex items-center justify-center hover:bg-[var(--feno-interactive-hovered-bg)] hover:border-[var(--feno-interactive-hovered-border)] rounded-lg"
                            onClick={() => {
                                setIsOpen(!isOpen);
                            }}
                        >
                            {!isOpen ? (
                                <IconChevronUp className="size-4" />
                            ) : (
                                <IconChevronDown className="size-4" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        {isOpen
                            ? "Collapse Style Editor"
                            : "Expand Style Editor"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={500}>
                    <TooltipTrigger disabled={isGenerating}>
                        <div
                            className={cn(
                                "size-6 flex items-center justify-center hover:bg-[var(--feno-interactive-hovered-bg)] hover:border-[var(--feno-interactive-hovered-border)] rounded-lg",
                                isGenerating &&
                                    "cursor-not-allowed !text-[var(--feno-text-3)]",
                            )}
                            onClick={() => {
                                if (isGenerating) return;
                                selectedElement.classList.remove(
                                    PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                                );
                                setSelectedElement(null);
                            }}
                        >
                            <IconX
                                className={cn(
                                    "size-4",
                                    isGenerating && "text-[var(--feno-text-3)]",
                                )}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                        Deselect element
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
};
