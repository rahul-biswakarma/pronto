import { IconPuzzle } from "@tabler/icons-react";
import { ModerActionRenderer } from "../../_components/moder-action-renderer";
import type { EditorMode } from "../../types/editor.types";
import { BlockEditor } from "./block-editor";

export const BlockEditorMode = (): EditorMode => {
    return {
        id: "block-editor",
        label: "Block Editor",
        actionRenderer: (isActive) => (
            <ModerActionRenderer
                icon={IconPuzzle}
                label="Add Blocks"
                active={isActive}
            />
        ),
        editorRenderer: () => <BlockEditor />,
    };
};
