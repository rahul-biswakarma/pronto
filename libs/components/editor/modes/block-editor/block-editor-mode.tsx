import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconPuzzle } from "@tabler/icons-react";
import type { EditorMode } from "../../types/editor.types";
import { BlockEditor } from "./block-editor";

export const BlockEditorMode = (): EditorMode => {
    return {
        id: "block-editor",
        label: "Block Editor",
        actionRenderer: (isActive) => (
            <Button
                variant="custom"
                size="icon"
                className={cn("feno-mode-button", {
                    "feno-mode-active-button": isActive,
                })}
            >
                <IconPuzzle size={16} />
            </Button>
        ),
        editorRenderer: () => <BlockEditor />,
    };
};
