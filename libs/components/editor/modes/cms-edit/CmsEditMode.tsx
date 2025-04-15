"use client";

import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { EDITOR_MODES } from "../../constants";
import { useEditorContext } from "../../editor.context";

export const CmsEditMode: React.FC = () => {
    const { selectedCmsElement, setActiveMode, updateCmsElementText } =
        useEditorContext();

    const [content, setContent] = useState("");

    // Update content when selected element changes
    useEffect(() => {
        if (selectedCmsElement) {
            setContent(selectedCmsElement.originalText);
        } else {
            setContent("");
        }
    }, [selectedCmsElement]);

    // Handle content change
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        updateCmsElementText(newContent);
    };

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
                        onClick={() => setActiveMode(EDITOR_MODES.DEFAULT)}
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
                                value={content}
                                onChange={handleContentChange}
                                className="flex w-full rounded-md border px-3 py-2 text-sm min-h-[100px]"
                                placeholder="Enter your text here..."
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Click on any text element in the preview to edit its
                            content.
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
};
