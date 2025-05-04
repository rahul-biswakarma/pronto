"use client";

import { useState } from "react";

type TextEntityProps = {
    content: string | null;
};

export default function TextEntity({ content }: TextEntityProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(content || "Text");

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    if (isEditing) {
        return (
            <textarea
                className="w-full h-full p-2 border-0 resize-none focus:outline-none"
                value={text}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        );
    }

    return (
        <div
            className="w-full h-full p-2 overflow-auto"
            onDoubleClick={handleDoubleClick}
        >
            {text}
        </div>
    );
}
