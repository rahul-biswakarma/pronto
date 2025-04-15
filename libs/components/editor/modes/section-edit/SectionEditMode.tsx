"use client";

import { Button } from "@/libs/ui/button";
import {
    PromptInput,
    PromptInputActions,
    PromptInputTextarea,
} from "@/libs/ui/prompt-input";
import { cn } from "@/libs/utils/misc";
import { ArrowUp, Square } from "lucide-react";
import { useState } from "react";
import { EDITOR_MODES } from "../../constants";
import { useEditorContext } from "../../editor.context";
import { getSectionNameFromId } from "../../utils/dom";

export const SectionEditMode: React.FC = () => {
    const { selectedSection, setActiveMode } = useEditorContext();

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Extract section name from ID
    const sectionName = selectedSection
        ? getSectionNameFromId(selectedSection.id)
        : "this section";

    const handleSubmit = () => {
        if (input.trim()) {
            // Process section edit request
            setIsLoading(true);
            // TODO: Implement section editing logic
            setTimeout(() => {
                setIsLoading(false);
                setInput("");
            }, 2000);
        }
    };

    return (
        <div
            className={cn(
                "w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-accent p-1 rounded-2xl",
                "bg-blue-500/30",
            )}
        >
            <PromptInput
                value={input}
                onValueChange={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                className="w-full rounded-xl"
            >
                <PromptInputTextarea
                    placeholder={`You are now editing the ${sectionName} section. What changes would you like to make?`}
                />
                <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                    <div className="text-xs text-muted-foreground">
                        Section Edit Mode
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveMode(EDITOR_MODES.DEFAULT)}
                        >
                            Exit
                        </Button>

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
                    </div>
                </PromptInputActions>
            </PromptInput>
        </div>
    );
};
