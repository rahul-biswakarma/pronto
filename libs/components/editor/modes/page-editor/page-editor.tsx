import { Button } from "@/libs/ui/button";
import { IconCashEdit } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import { SectionHighlighting } from "./components/section-highlighting";
import { modifySection } from "./components/section-modifier";
import { StyleControls } from "./components/style-controls";
import { SectionEditorInput } from "./page-editor-input";

// Section Editor component
const PageEditor: React.FC = () => {
    const { iframeDocument, modeId } = useEditor();

    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
        null,
    );

    // Handle prompt change
    const handlePromptChange = useCallback((value: string) => {
        setPrompt(value);
    }, []);

    const handleDirectStyleChange = useCallback(
        (
            element: HTMLElement,
            property: keyof React.CSSProperties,
            value: string,
        ) => {
            // Apply style directly to the element
            // biome-ignore lint/suspicious/noExplicitAny: Need to access style properties dynamically
            (element.style as any)[property] = value;
        },
        [],
    );

    return (
        <div className="flex h-full w-full flex-col gap-2 min-w-[500px] max-w-[500px]">
            <SectionHighlighting
                modeId={modeId}
                selectedElement={selectedElement}
                iframeDocument={iframeDocument}
                setSelectedElement={setSelectedElement}
                setPrompt={setPrompt}
                isGenerating={loading}
            />

            {selectedElement && (
                <StyleControls
                    isGenerating={loading}
                    selectedElement={selectedElement}
                    iframeDocument={iframeDocument}
                    setSelectedElement={setSelectedElement}
                    onStyleChange={handleDirectStyleChange}
                />
            )}

            <div className="feno-mod-container">
                <SectionEditorInput
                    input={prompt}
                    loading={loading}
                    placeholder="Edit section content..."
                    submitHandler={() =>
                        selectedElement &&
                        prompt.trim() &&
                        !loading &&
                        modifySection({
                            selectedElement,
                            prompt,
                            setLoading,
                            setPrompt,
                        })
                    }
                    inputChangeHandler={handlePromptChange}
                />
            </div>
        </div>
    );
};

// Export the editor mode
export const PageEditorMode = (): EditorMode => {
    return {
        id: "section-editor",
        label: "Edit Sections",
        actionRenderer: (isActive) => (
            <Button
                variant="ghost"
                size="icon"
                className={isActive ? "bg-blue-500/10 text-blue-700" : ""}
            >
                <IconCashEdit className="size-[17px] stroke-[1.8]" />
            </Button>
        ),
        editorRenderer: () => <PageEditor />,
    };
};
