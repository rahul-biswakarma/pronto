"use client";

import { cn } from "@/libs/utils/misc";
import type * as React from "react";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
    /**
     * Content to be visually hidden but still accessible to screen readers
     */
    children: React.ReactNode;
}

export function VisuallyHidden({
    children,
    className,
    ...props
}: VisuallyHiddenProps) {
    return (
        <span
            className={cn(
                "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0",
                "clip-[rect(0px,0px,0px,0px)]",
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
