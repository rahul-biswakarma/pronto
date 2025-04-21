"use client";

import { Button } from "@/libs/ui/button";
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/libs/ui/prompt-input";
import {
    IconArrowUp,
    IconPaperclip,
    IconSquare,
    IconX,
} from "@tabler/icons-react";
import { useRef } from "react";
import { useState } from "react";

export function SectionEditorInput({
    input,
    loading,
    onSubmit: onFormSubmit,
    onInputChange,
}: {
    input: string;
    loading: boolean;
    onSubmit: () => void;
    onInputChange: (value: string) => void;
}) {
    const [files, setFiles] = useState<File[]>([]);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        if (uploadInputRef?.current) {
            uploadInputRef.current.value = "";
        }
    };

    return (
        <PromptInput
            value={input}
            onValueChange={onInputChange}
            isLoading={loading}
            onSubmit={onFormSubmit}
            className="w-full max-w-(--breakpoint-md) rounded-xl"
        >
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                    {files.map((file, index) => (
                        <div
                            key={file.name}
                            className="bg-secondary flex items-center gap-2 rounded-lg pl-3 text-sm"
                        >
                            <span className="max-w-[120px] truncate">
                                {file.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFile(index)}
                                className="hover:bg-secondary/50 rounded-full p-1"
                            >
                                <IconX className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <PromptInputTextarea placeholder="Ask me anything..." />

            <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                <PromptInputAction tooltip="Attach files">
                    <label
                        htmlFor="file-upload"
                        className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl"
                    >
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <IconPaperclip className="size-5 !text-black/70" />
                    </label>
                </PromptInputAction>

                <PromptInputAction
                    tooltip={loading ? "Stop generation" : "Send message"}
                >
                    <Button
                        variant="default"
                        size="icon"
                        className="h-8 w-8 rounded-lg "
                        onClick={onFormSubmit}
                    >
                        {loading ? (
                            <IconSquare className="size-5 fill-current animate-pulse" />
                        ) : (
                            <IconArrowUp className="size-5 rotate-45 !text-white" />
                        )}
                    </Button>
                </PromptInputAction>
            </PromptInputActions>
        </PromptInput>
    );
}
