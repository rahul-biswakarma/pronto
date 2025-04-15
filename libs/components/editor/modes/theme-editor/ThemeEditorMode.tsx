"use client";

import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { Palette } from "lucide-react";
import { EDITOR_MODES } from "../../constants";
import { useEditorContext } from "../../editor.context";

export const ThemeEditorMode: React.FC = () => {
    const { themeVariables, updateThemeVariable, setActiveMode } =
        useEditorContext();

    // Handle color variable change
    const handleColorChange = (name: string, value: string) => {
        updateThemeVariable(name, value);
    };

    return (
        <div
            className={cn(
                "w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-accent p-4 rounded-2xl",
            )}
        >
            <div className="flex flex-col gap-4 bg-background rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Palette className="mr-2 size-5" />
                        Theme Editor
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveMode(EDITOR_MODES.DEFAULT)}
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
                        No theme variables found. Make sure your HTML includes
                        CSS variables with the prefix "feno-color".
                    </div>
                )}
            </div>
        </div>
    );
};
