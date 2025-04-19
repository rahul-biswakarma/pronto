import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import {
    IconBold,
    IconItalic,
    IconLink,
    IconSend,
    IconStrikethrough,
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
    onChange: (html: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
    initialContent,
    onChange,
    placeholder = "Send a message...",
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
        <div className="p-2 rounded-lg flex flex-col gap-1 min-w-[600px] relative border border-neutral-200 bg-white">
            <MenuBar editor={editor} setLink={setLink} />
            <EditorContent editor={editor} />
            <div className="flex justify-end mt-1 absolute bottom-2 right-2">
                <Button
                    size="icon"
                    onClick={() => editor && onChange(editor.getHTML())}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2"
                    disabled={!editor?.getText().trim()}
                >
                    <IconSend size={18} />
                </Button>
            </div>
        </div>
    );
};

interface MenuBarProps {
    editor: Editor | null;
    setLink: () => void;
}

const MenuBar = ({ editor, setLink }: MenuBarProps) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex items-center gap-0.5 flex-wrap">
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "p-1",
                    editor.isActive("bold") ? "is-active bg-neutral-200" : "",
                )}
            >
                <IconBold size={16} />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(
                    "p-1",
                    editor.isActive("italic") ? "is-active bg-neutral-200" : "",
                )}
            >
                <IconItalic size={16} />
            </Button>
            <div className="w-[1px] h-4 bg-neutral-200 mx-1" />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={cn(
                    "p-1",
                    editor.isActive("strike") ? "is-active bg-neutral-200" : "",
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
                    editor.isActive("link") ? "is-active bg-neutral-200" : "",
                )}
            >
                <IconLink size={16} />
            </Button>
        </div>
    );
};
