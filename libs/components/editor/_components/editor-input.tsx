"use client";

import { Button } from "@/libs/ui/button";
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/libs/ui/prompt-input";
import { cn } from "@/libs/utils/misc";
import {
    ArrowUp,
    Palette,
    Paperclip,
    PencilLine,
    Square,
    X,
} from "lucide-react";
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
    const {
        selectedSection,
        activeMode,
        setActiveMode,
        availableModes,
        themeVariables,
        updateThemeVariable,
        selectedCmsElement,
        updateCmsElementText,
    } = useEditorContext();

    // Track content for CMS editing
    const [cmsContent, setCmsContent] = useState("");

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

    // Update CMS content when selected element changes
    useEffect(() => {
        if (selectedCmsElement) {
            setCmsContent(selectedCmsElement.originalText);
        } else {
            setCmsContent("");
        }
    }, [selectedCmsElement]);

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

    // Handle CMS content change
    const handleCmsContentChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const newContent = e.target.value;
        setCmsContent(newContent);
        updateCmsElementText(newContent);
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

    // Handle color variable change
    const handleColorChange = (name: string, value: string) => {
        updateThemeVariable(name, value);
    };

    // Render the CMS editor UI
    if (activeMode === "cms-edit") {
        return (
            <div
                className={cn(
                    "w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-accent p-4 rounded-2xl",
                    "border-2 border-yellow-500/30",
                )}
            >
                <div className="flex flex-col gap-4 bg-background rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold flex items-center">
                            <PencilLine className="mr-2 size-5" />
                            Text Editor
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveMode("default")}
                        >
                            Exit
                        </Button>
                    </div>

                    {selectedCmsElement ? (
                        <div className="space-y-3">
                            <div className="flex flex-col space-y-1.5">
                                <label
                                    htmlFor="cms-text-editor"
                                    className="text-sm font-medium"
                                >
                                    Edit Text Content
                                </label>
                                <textarea
                                    id="cms-text-editor"
                                    value={cmsContent}
                                    onChange={handleCmsContentChange}
                                    className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[100px]"
                                    placeholder="Enter your text here..."
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Click on any text element in the preview to edit
                                its content.
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No text element selected. Click on any text in the
                            preview to edit it.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Render the theme editor UI
    if (activeMode === "theme-editor") {
        return (
            <div
                className={cn(
                    "w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-accent p-4 rounded-2xl",
                    inputMode === "section-edit" && "bg-pink-500/30",
                )}
            >
                <div className="flex flex-col gap-4 bg-background">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Palette className="mr-2 size-5" />
                            Theme Editor
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveMode("default")}
                        >
                            Exit
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                        {themeVariables.map((variable) => (
                            <div
                                key={variable.name}
                                className="flex flex-col space-y-1"
                            >
                                <label
                                    htmlFor={variable.name}
                                    className="text-sm font-medium"
                                >
                                    {variable.displayName}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        id={`color-${variable.name}`}
                                        value={variable.value}
                                        onChange={(e) =>
                                            handleColorChange(
                                                variable.name,
                                                e.target.value,
                                            )
                                        }
                                        className="w-10 h-10 rounded-md border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        id={variable.name}
                                        value={variable.value}
                                        onChange={(e) =>
                                            handleColorChange(
                                                variable.name,
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {themeVariables.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No theme variables found. Make sure your HTML
                            includes CSS variables with the prefix "feno-color".
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Regular prompt input UI
    return (
        <div
            className={cn(
                "w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-accent p-1 rounded-2xl",
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

                        {availableModes.includes("theme-editor") && (
                            <PromptInputAction tooltip="Theme Editor">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveMode("theme-editor")
                                    }
                                    className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl"
                                >
                                    <Palette className="text-primary size-5" />
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
}
