import { Button } from "@/libs/ui/button";
import { TiptapEditor } from "@/libs/ui/tiptap";
import { IconCashEdit, IconX } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import { SectionActionPanel } from "./components/section-action-panel";
import { SectionHighlighting } from "./components/section-highlighting";
import {
    handleEditorChange,
    modifySection,
} from "./components/section-modifier";
import { SectionEditorInput } from "./section-editor-input";
import {} from "./utils";

// Section Editor component
const SectionEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId } = useEditor();
    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [sectionId, setSectionId] = useState<string>("");
    const [sectionHtml, setSectionHtml] = useState<string>("");
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
        null,
    );
    const [elementType, setElementType] = useState<"section" | "text" | null>(
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

    // Reset selection
    const handleReset = useCallback(() => {
        if (selectedElementRef.current) {
            // Clean up selection
            selectedElementRef.current.classList.remove(
                "feno-section-editor-selected",
            );
            selectedElementRef.current.classList.remove(
                "feno-content-selected",
            );
            selectedElementRef.current.classList.remove("feno-section-loading");
        }
        setSelectedElement(null);
        setElementType(null);
        setPrompt("");
    }, []);

    // Handle HTML change and save
    const handleSaveChanges = useCallback(() => {
        if (hasChanges && iframeDocument) {
            onHtmlChange({
                html: iframeDocument.documentElement.outerHTML,
                modeId: "section-editor",
                modeLabel: "Edit Sections",
            });
            setHasChanges(false);
        }
    }, [hasChanges, iframeDocument, onHtmlChange]);

    return (
        <div className="flex h-full w-full flex-col feno-mod-container">
            <div className="flex flex-col space-y-4 p-4">
                <h2 className="text-xl font-semibold">Section Editor</h2>
                <p className="text-sm text-gray-500">
                    Click on any section or text to edit it with AI.
                </p>

                {/* Apply highlighting and event handlers to iframe */}
                <SectionHighlighting
                    iframeDocument={iframeDocument}
                    modeId={modeId}
                    selectedElementRef={selectedElementRef}
                    setSectionId={setSectionId}
                    setSectionHtml={setSectionHtml}
                    setSelectedElement={setSelectedElement}
                    setElementType={setElementType}
                    setPrompt={setPrompt}
                />

                {selectedElement && (
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">
                                {elementType === "section"
                                    ? "Section Selected"
                                    : "Text Selected"}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                            >
                                <IconX className="mr-1 size-4" /> Cancel
                            </Button>
                        </div>

                        <SectionEditorInput
                            input={prompt}
                            loading={loading}
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

                        {elementType === "text" && (
                            <TiptapEditor
                                initialContent={selectedElement.innerHTML}
                                onChange={(html) =>
                                    handleEditorChange(
                                        html,
                                        selectedElement,
                                        setHasChanges,
                                    )
                                }
                            />
                        )}
                    </div>
                )}

                <SectionActionPanel
                    hasChanges={hasChanges}
                    onSave={handleSaveChanges}
                />
            </div>
        </div>
    );
};

// Export the editor mode
export const SectionEditorMode = (): EditorMode => {
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
        editorRenderer: () => <SectionEditor />,
    };
};
