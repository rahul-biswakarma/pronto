import { Button } from "@/libs/ui/button";
import { IconCashEdit } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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

            // Mark changes
            setHasChanges(true);
        },
        [],
    );

    return (
        <div className="flex h-full w-full flex-col feno-mod-container min-w-[600px] max-w-[600px]">
            <SectionHighlighting
                modeId={modeId}
                iframeDocument={iframeDocument}
                selectedElementRef={selectedElementRef}
                setSectionHtml={setSectionHtml}
                setSelectedElement={setSelectedElement}
                setPrompt={setPrompt}
            />

            {selectedElement && (
                <StyleControls
                    selectedElement={selectedElement}
                    iframeDocument={iframeDocument}
                    setSelectedElement={setSelectedElement}
                    onStyleChange={handleDirectStyleChange}
                />
            )}

            <SectionEditorInput
                input={prompt}
                loading={loading}
                placeholder="Edit section content..."
                onSubmit={() =>
                    selectedElement &&
                    prompt.trim() &&
                    !loading &&
                    modifySection(
                        selectedElement,
                        selectedElementRef,
                        sectionHtml,
                        prompt,
                        sectionId,
                        setLoading,
                        setHasChanges,
                        setSelectedElement,
                    )
                }
                onInputChange={handlePromptChange}
            />
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
