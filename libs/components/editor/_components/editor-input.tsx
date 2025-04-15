"use client";

import { Button } from "@/libs/ui/button";
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/libs/ui/prompt-input";
import { cn } from "@/libs/utils/misc";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../editor.context";

// Define the possible input modes
type EditorInputMode = "default" | "section-edit";

// Context type for different modes
type EditorInputContext = {
    sectionEdit?: {
        id: string;
        html: string;
        name: string;
    };
    // Add other mode contexts here as needed
};

export function EditorInput() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const { selectedSection } = useEditorContext();

    // Input mode state
    const [inputMode, setInputMode] = useState<EditorInputMode>("default");
    const [inputContext, setInputContext] = useState<EditorInputContext>({});

    // Update input mode and context when selectedSection changes
    useEffect(() => {
        if (selectedSection) {
            // Derive section name from the ID
            const sectionId = selectedSection.id;
            let sectionName = "this section";

            // Extract name from ID format like "feno-sec-name-name2"
            if (sectionId.startsWith("feno-sec-")) {
                // Remove the "feno-sec-" prefix
                const nameWithDashes = sectionId.substring(9);
                // Convert dashes to spaces and capitalize words
                sectionName = nameWithDashes
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
            }

            // Update mode and context
            setInputMode("section-edit");
            setInputContext({
                sectionEdit: {
                    id: selectedSection.id,
                    html: selectedSection.html,
                    name: sectionName,
                },
            });
        } else {
            // Reset to default mode when no section is selected
            setInputMode("default");
            setInputContext({});
        }
    }, [selectedSection]);

    const handleSubmit = () => {
        if (input.trim() || files.length > 0) {
            // Here you can use inputMode and inputContext to handle the submission differently
            // based on the current mode
            console.log(
                "Submitting in mode:",
                inputMode,
                "with context:",
                inputContext,
            );

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

    // Determine the placeholder text based on the current mode
    const getPlaceholderText = () => {
        switch (inputMode) {
            case "section-edit":
                if (inputContext.sectionEdit) {
                    return `You are now editing the ${inputContext.sectionEdit.name} section. What changes would you like to make?`;
                }
                return "Editing selected section...";
            default:
                return "Ask me anything...";
        }
    };

    return (
        <div
            className={cn(
                "w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-accent p-1 rounded-2xl backdrop-blur-sm",
                inputMode === "section-edit" && "bg-blue-500/30",
            )}
        >
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
                <PromptInputTextarea placeholder={getPlaceholderText()} />
                <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
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
}
