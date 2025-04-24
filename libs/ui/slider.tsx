"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../utils/misc";

interface SliderProps
    extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    thumbColor?: string;
}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({ className, thumbColor, ...props }, ref) => {
    // Determine whether to show the thumb based on either value or defaultValue
    const hasValue = Array.isArray(props.value) && props.value.length > 0;
    const hasDefaultValue =
        Array.isArray(props.defaultValue) && props.defaultValue.length > 0;
    const showThumb = hasValue || hasDefaultValue;

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                "relative flex w-full touch-none select-none items-center h-7",
                className,
            )}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-transparent">
                <SliderPrimitive.Range className="absolute h-full" />
            </SliderPrimitive.Track>
            {showThumb && (
                <SliderPrimitive.Thumb
                    className="block h-10 w-10 rounded-full border-3 border-[var(--feno-border-1)] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    style={{
                        backgroundColor: thumbColor || "white",
                    }}
                />
            )}
        </SliderPrimitive.Root>
    );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
