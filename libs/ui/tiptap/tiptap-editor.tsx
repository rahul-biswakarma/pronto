import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import {
    IconBlockquote,
    IconBold,
    IconCode,
    IconItalic,
    IconLink,
    IconList,
    IconListCheck,
    IconListNumbers,
    IconStrikethrough,
} from "@tabler/icons-react";
import "./tiptap.css";
import { Link } from "@tiptap/extension-link";
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
    initialContent: string;
    onChange: (html: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
    initialContent,
    onChange,
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
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-2 border rounded min-h-[100px] w-full bg-white text-black",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
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
        <div className="p-2 rounded-lg flex flex-col gap-1 min-w-[600px]">
            <MenuBar editor={editor} setLink={setLink} />
            <EditorContent editor={editor} />
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
                size="sm"
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
                size="sm"
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
                size="sm"
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
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={cn(
                    "p-1",
                    editor.isActive("code") ? "is-active bg-neutral-200" : "",
                )}
            >
                <IconCode size={16} />
            </Button>
            <div className="w-[1px] h-4 bg-neutral-200 mx-1" />
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={
                    !editor.can().chain().focus().toggleBlockquote().run()
                }
                className={cn(
                    "p-1",
                    editor.isActive("blockquote")
                        ? "is-active bg-neutral-200"
                        : "",
                )}
            >
                <IconBlockquote size={16} />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={setLink}
                className={cn(
                    "p-1",
                    editor.isActive("link") ? "is-active bg-neutral-200" : "",
                )}
            >
                <IconLink size={16} />
            </Button>
            <div className="w-[1px] h-4 bg-neutral-200 mx-1" />
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={
                    !editor.can().chain().focus().toggleBulletList().run()
                }
                className={cn(
                    "p-1",
                    editor.isActive("bulletList")
                        ? "is-active bg-neutral-200"
                        : "",
                )}
            >
                <IconList size={16} />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={
                    !editor.can().chain().focus().toggleOrderedList().run()
                }
                className={cn(
                    "p-1",
                    editor.isActive("orderedList")
                        ? "is-active bg-neutral-200"
                        : "",
                )}
            >
                <IconListNumbers size={16} />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                disabled={!editor.can().chain().focus().toggleTaskList().run()}
                className={cn(
                    "p-1",
                    editor.isActive("taskList")
                        ? "is-active bg-neutral-200"
                        : "",
                )}
            >
                <IconListCheck size={16} />
            </Button>
        </div>
    );
};
