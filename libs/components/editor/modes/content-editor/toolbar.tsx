"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, Link, Strikethrough } from "lucide-react";

interface ToolbarProps {
    editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center p-2 gap-0.5">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded-sm ${
                    editor.isActive("bold")
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                }`}
                title="Bold"
            >
                <Bold className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded-sm ${
                    editor.isActive("italic")
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                }`}
                title="Italic"
            >
                <Italic className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1 rounded-sm ${
                    editor.isActive("strike")
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                }`}
                title="Strikethrough"
            >
                <Strikethrough className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                onClick={() => {
                    const url = window.prompt("URL");
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                className={`p-1 rounded-sm ${
                    editor.isActive("link")
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                }`}
                title="Link"
            >
                <Link className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
