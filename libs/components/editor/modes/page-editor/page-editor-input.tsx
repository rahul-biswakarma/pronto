"use client";

import { Button } from "@/libs/ui/button";
import { IconLoader, IconSend2 } from "@tabler/icons-react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";

type SectionEditorInputProps = {
    placeholder: string;
    input: string;
    loading: boolean;
    onSubmit: () => void;
    onInputChange: (value: string) => void;
};

export function SectionEditorInput({
    placeholder,
    input,
    loading,
    onSubmit: onFormSubmit,
    onInputChange,
}: SectionEditorInputProps) {
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: input || "<p></p>",
        autofocus: true,
        editable: true,
        injectCSS: false,
        onUpdate: ({ editor }) => {
            onInputChange(editor.getText());
        },
    });

    useEffect(() => {
        if (editor && input !== editor.getText()) {
            editor.commands.setContent(input || "<p></p>");
        }
    }, [input, editor]);

    return (
        <div
            className="page-editor-input p-3 pr-2 pb-2 flex flex-col gap-2"
            ref={editorContainerRef}
        >
            <EditorContent className="w-full text-[14px]" editor={editor} />
            <div className="flex items-center justify-end">
                <Button
                    size="icon"
                    disabled={loading}
                    variant="custom"
                    className={clsx(
                        "border bg-[var(--feno-interactive-resting-bg)] hover:bg-[var(--feno-interactive-hovered-bg)] border-[var(--feno-interactive-resting-border)] hover:border-[var(--feno-interactive-hovered-border)] text-[var(--feno-text-2)]",
                        loading &&
                            "text-[var(--feno-text-3)] cursor-not-allowed",
                    )}
                >
                    {loading ? (
                        <IconLoader className="animate-spin" size={16} />
                    ) : (
                        <IconSend2 />
                    )}
                </Button>
            </div>
        </div>
    );
}
