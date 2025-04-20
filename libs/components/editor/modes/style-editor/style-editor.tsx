import { IconPaint } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { ModerActionRenderer } from "../../_components/moder-action-renderer";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import { StyleControls } from "./style-controls";
import { useStyleSelection } from "./utils";

// Style Editor component
const StyleEditor: React.FC = () => {
    const { iframeDocument, onHtmlChange, modeId } = useEditor();
    const [hasChanges, setHasChanges] = useState(false);
    const { selectedElement, setSelectedElement } = useStyleSelection(
        iframeDocument,
        modeId,
    );

    // Handler to apply style changes directly and mark changes
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

    // Save changes when exiting the style editor
    useEffect(() => {
        // If we're leaving the style editor and have changes
        if (modeId !== "style-editor" && hasChanges && iframeDocument) {
            onHtmlChange({
                html: iframeDocument.documentElement.outerHTML,
                modeId: "style-editor",
                modeLabel: "Style Editor",
            });
            setHasChanges(false);
        }
    }, [modeId, hasChanges, iframeDocument, onHtmlChange]);

    return (
        <div className="flex w-[350px]">
            {/* Adjusted width */}
            <StyleControls
                selectedElement={selectedElement}
                iframeDocument={iframeDocument}
                setSelectedElement={setSelectedElement}
                onStyleChange={handleDirectStyleChange}
            />
        </div>
    );
};

// Register the style editor mode
export const StyleEditorMode = (): EditorMode => {
    return {
        id: "style-editor",
        label: "Style Editor",
        editorRenderer: () => <StyleEditor />,
        actionRenderer: (isActive: boolean) => (
            <ModerActionRenderer
                icon={IconPaint}
                label="Style Editor"
                active={isActive}
            />
        ),
    };
};
