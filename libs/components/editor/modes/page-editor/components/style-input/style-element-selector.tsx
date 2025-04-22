import { Button } from "@/libs/ui/button";
import { IconCornerLeftUp, IconX } from "@tabler/icons-react";
import { PAGE_EDITOR_SELECTED_ELEMENT_CLASS } from "../../utils";

interface StyleElementSelectorProps {
    selectedElement: HTMLElement;
    iframeDocument: Document | null;
    setSelectedElement: (element: HTMLElement | null) => void;
}

/**
 * Component for displaying and managing the selected element
 */
export const StyleElementSelector: React.FC<StyleElementSelectorProps> = ({
    selectedElement,
    iframeDocument,
    setSelectedElement,
}) => {
    const tagName = selectedElement.tagName.toLowerCase();
    const parentElement = selectedElement.parentElement;
    const canSelectParent =
        parentElement &&
        parentElement !== iframeDocument?.body &&
        parentElement !== iframeDocument?.documentElement;

    return (
        <div className="flex items-center justify-between bg-pink-300/20 p-2 px-3 rounded-xl border border-pink-300/70">
            <div className="flex items-center gap-1">
                <p className="text-sm font-medium">
                    <code className="rounded">{tagName}</code>
                </p>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 hover:bg-gray-200 disabled:opacity-50"
                    disabled={!canSelectParent}
                    onClick={() => {
                        if (canSelectParent && parentElement) {
                            selectedElement.classList.remove(
                                PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                            );
                            parentElement.classList.add(
                                PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                            );
                            setSelectedElement(parentElement);
                        }
                    }}
                    title="Select parent element"
                >
                    <IconCornerLeftUp className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => {
                        selectedElement.classList.remove(
                            PAGE_EDITOR_SELECTED_ELEMENT_CLASS,
                        );
                        setSelectedElement(null);
                    }}
                    size="icon"
                    className="size-7 hover:bg-gray-200"
                    title="Close style editor"
                >
                    <IconX className="size-4" />
                </Button>
            </div>
        </div>
    );
};
