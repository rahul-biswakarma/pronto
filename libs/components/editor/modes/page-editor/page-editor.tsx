import { Layout } from "lucide-react";
import { ModerActionRenderer } from "../../_components/moder-action-renderer";
import type { EditorMode } from "../../types/editor.types";
import { PageEditorInput } from "./page-editor-input";
export const PageEditor = () => {
    return (
        <div className="w-[600px]">
            <PageEditorInput
                input={""}
                loading={false}
                onSubmit={(): void => {
                    throw new Error("Function not implemented.");
                }}
                onInputChange={(): void => {
                    throw new Error("Function not implemented.");
                }}
            />
        </div>
    );
};

export const PageEditorMode = (): EditorMode => {
    return {
        id: "page-editor",
        label: "Page Editor",
        editorRenderer: () => <PageEditor />,
        actionRenderer: (isActive: boolean) => (
            <ModerActionRenderer
                icon={Layout}
                active={isActive}
                label="Page Editor"
            />
        ),
    };
};
