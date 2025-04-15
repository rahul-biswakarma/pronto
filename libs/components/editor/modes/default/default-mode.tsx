"use client";

import { Button } from "@/libs/ui/button";
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/libs/ui/prompt-input";
import { ArrowUp, Code, Palette, Paperclip, Square, X } from "lucide-react";
import { useRef, useState } from "react";
import { EDITOR_MODES } from "../../constants";
import { useEditorContext } from "../../editor.context";

export const DefaultMode: React.FC = () => {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const { availableModes, setActiveMode } = useEditorContext();

    const handleSubmit = () => {
        if (input.trim() || files.length > 0) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                setInput("");
                setFiles([]);
            }, 2000);
        }
    };

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
        <div className="w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/30 backdrop-blur-sm p-1 rounded-2xl">
            <PromptInput
                value={input}
                onValueChange={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                className="w-full rounded-xl"
            >
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                        {files.map((file, index) => (
                            <div
                                key={file.name}
                                className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                            >
                                <Paperclip className="size-4" />
                                <span className="max-w-[120px] truncate">
                                    {file.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="hover:bg-secondary/50 rounded-full p-1"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <PromptInputTextarea placeholder="Ask me anything..." />
                <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-1">
                        <PromptInputAction tooltip="Attach files">
                            <label
                                htmlFor="file-upload"
                                className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl"
                            >
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <Paperclip className="text-primary size-5" />
                            </label>
                        </PromptInputAction>

                        {availableModes.includes(EDITOR_MODES.THEME_EDITOR) && (
                            <PromptInputAction tooltip="Theme Editor">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveMode(EDITOR_MODES.THEME_EDITOR)
                                    }
                                    className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl"
                                >
                                    <Palette className="text-primary size-5" />
                                </button>
                            </PromptInputAction>
                        )}

                        {availableModes.includes(EDITOR_MODES.DEVELOPER) && (
                            <PromptInputAction tooltip="Developer Mode">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveMode(EDITOR_MODES.DEVELOPER)
                                    }
                                    className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl"
                                >
                                    <Code className="text-primary size-5" />
                                </button>
                            </PromptInputAction>
                        )}

                        {/* CMS Text Editor mode is activated automatically when clicking on text elements */}
                    </div>

                    <PromptInputAction
                        tooltip={isLoading ? "Stop generation" : "Send message"}
                    >
                        <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleSubmit}
                        >
                            {isLoading ? (
                                <Square className="size-5 fill-current" />
                            ) : (
                                <ArrowUp className="size-5" />
                            )}
                        </Button>
                    </PromptInputAction>
                </PromptInputActions>
            </PromptInput>
        </div>
    );
};
