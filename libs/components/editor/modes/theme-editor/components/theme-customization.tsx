import { Button } from "@/libs/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/libs/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { rgbToHex } from "../../page-editor/components/style-input/style-utils";
import type { ColorVariable } from "../types";
import { chromaVariableName, hueVariableName } from "./utils";

interface ThemeCustomizationProps {
    colorVariables: ColorVariable[];
    onColorChange: (name: string, value: string) => void;
}

/**
 * Component for customizing individual color variables in a theme
 */
export const ThemeCustomization: React.FC<ThemeCustomizationProps> = ({
    colorVariables,
    onColorChange,
}) => {
    const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the color picker to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                colorPickerRef.current &&
                !colorPickerRef.current.contains(event.target as Node)
            ) {
                setOpenColorPicker(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Early return after hooks are declared
    if (colorVariables.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 flex-1/3">
            {colorVariables
                .filter(
                    (variable) =>
                        variable.name !== hueVariableName &&
                        variable.name !== chromaVariableName,
                )
                .map((variable) => (
                    <div key={variable.name} className="relative">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id={`color-button-${variable.name}`}
                                    variant="outline"
                                    className="h-8 w-32 border border-[var(--feno-border-1)] rounded-lg hover:border-[var(--feno-border-2)] transition-colors"
                                    style={{ backgroundColor: variable.value }}
                                    onClick={() =>
                                        setOpenColorPicker(
                                            openColorPicker === variable.name
                                                ? null
                                                : variable.name,
                                        )
                                    }
                                    aria-label={`Select ${variable.name} color`}
                                />
                            </TooltipTrigger>
                            <TooltipContent>{variable.label}</TooltipContent>
                        </Tooltip>
                        {openColorPicker === variable.name && (
                            <div
                                ref={colorPickerRef}
                                className="absolute right-0 top-full mt-1.5 z-10 bg-white p-1 rounded-lg shadow-lg border border-[var(--feno-border-1)]"
                            >
                                <HexColorPicker
                                    color={rgbToHex(
                                        variable.value || "rgb(0, 0, 0)",
                                    )}
                                    onChange={(color) =>
                                        onColorChange(variable.name, color)
                                    }
                                />
                            </div>
                        )}
                    </div>
                ))}
        </div>
    );
};
