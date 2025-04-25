import { Popover, PopoverContent, PopoverTrigger } from "@/libs/ui/popover";
import { HexColorPicker } from "react-colorful";
import { rgbToHex } from "./style-utils";

interface ColorPickerPopoverProps {
    color: string | undefined;
    onChange: (color: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    triggerClassName?: string;
    contentClassName?: string;
    sideOffset?: number;
}

/**
 * A reusable color picker popover component
 */
export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
    color,
    onChange,
    open,
    onOpenChange,
    triggerClassName = "h-8 w-32 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors",
    contentClassName = "p-1.5 w-auto rounded-xl",
    sideOffset = 5,
}) => {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={triggerClassName}
                    style={{
                        backgroundColor: color || "transparent",
                    }}
                    aria-label="Select color"
                />
            </PopoverTrigger>
            <PopoverContent
                className={contentClassName}
                sideOffset={sideOffset}
            >
                <HexColorPicker
                    color={rgbToHex(color || "rgba(0, 0, 0, 0)")}
                    onChange={onChange}
                />
            </PopoverContent>
        </Popover>
    );
};
