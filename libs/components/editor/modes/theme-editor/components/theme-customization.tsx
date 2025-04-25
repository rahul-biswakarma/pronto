import { Tooltip, TooltipContent, TooltipTrigger } from "@/libs/ui/tooltip";
import { useState } from "react";
import { ColorPickerPopover } from "../../page-editor/components/style-input/color-picker-popover";
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
                                <ColorPickerPopover
                                    color={variable.value}
                                    onChange={(color) =>
                                        onColorChange(variable.name, color)
                                    }
                                    open={openColorPicker === variable.name}
                                    onOpenChange={(open) =>
                                        setOpenColorPicker(
                                            open ? variable.name : null,
                                        )
                                    }
                                    triggerClassName="h-8 w-32 border border-[var(--feno-border-1)] rounded-lg hover:border-[var(--feno-border-2)] transition-colors"
                                />
                            </TooltipTrigger>
                            <TooltipContent>{variable.label}</TooltipContent>
                        </Tooltip>
                    </div>
                ))}
        </div>
    );
};
