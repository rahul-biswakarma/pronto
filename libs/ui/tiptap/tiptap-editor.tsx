import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import {
    IconBold,
    IconItalic,
    IconLink,
    IconStrikethrough,
    IconX,
} from "@tabler/icons-react";
import "./tiptap.css";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import {
    type Editor,
    EditorContent,
    useEditor as useTiptapEditor,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import type React from "react";
import { useCallback, useEffect } from "react";

interface TiptapEditorProps {
    placeholder?: string;
    initialContent: string;
    liveChange?: boolean;
    onChange: (html: string) => void;
    onClose: () => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
    initialContent,
    onChange,
    liveChange = false,
    placeholder = "Send a message...",
    onClose,
}) => {
    const editor = useTiptapEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-2 border rounded min-h-[100px] w-full bg-white text-black",
            },
        },
        onUpdate: ({ editor }) => {
            if (liveChange) {
                onChange(editor.getHTML());
            }
        },
    });

    // Update content when initialContent prop changes
    useEffect(() => {
        if (editor && editor.getHTML() !== initialContent) {
            editor.commands.setContent(initialContent);
        }
    }, [initialContent, editor]);

    // Cleanup editor on unmount
    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();

            return;
        }

        // update link
        editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="rounded-xl flex flex-col gap-1 w-full relative">
            <MenuBar editor={editor} setLink={setLink} onClose={onClose} />
            <EditorContent className="px-2" editor={editor} />
        </div>
    );
};

interface MenuBarProps {
    editor: Editor | null;
    setLink: () => void;
    onClose: () => void;
}

const MenuBar = ({ editor, setLink, onClose }: MenuBarProps) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-0.5 flex-wrap border-b border-[var(--feno-border-1)] px-2 py-1">
            <div className="flex items-center gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={cn(
                        "p-1",
                        editor.isActive("bold")
                            ? "is-active bg-neutral-200"
                            : "",
                    )}
                >
                    <IconBold size={16} />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can().chain().focus().toggleItalic().run()
                    }
                    className={cn(
                        "p-1",
                        editor.isActive("italic")
                            ? "is-active bg-neutral-200"
                            : "",
                    )}
                >
                    <IconItalic size={16} />
                </Button>
                <div className="w-[1px] h-4 bg-neutral-200 mx-1" />
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can().chain().focus().toggleStrike().run()
                    }
                    className={cn(
                        "p-1",
                        editor.isActive("strike")
                            ? "is-active bg-neutral-200"
                            : "",
                    )}
                >
                    <IconStrikethrough size={16} />
                </Button>
                <div className="w-[1px] h-4 bg-neutral-200 mx-1" />
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={setLink}
                    className={cn(
                        "p-1",
                        editor.isActive("link")
                            ? "is-active bg-neutral-200"
                            : "",
                    )}
                >
                    <IconLink size={16} />
                </Button>
            </div>
            <div>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className={cn(
                        "p-1",
                        editor.isActive("bold")
                            ? "is-active bg-neutral-200"
                            : "",
                    )}
                >
                    <IconX size={16} />
                </Button>
            </div>
        </div>
    );
};
