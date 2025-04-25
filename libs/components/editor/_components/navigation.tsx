"use client";
import { Button } from "@/libs/ui/button";
import {} from "@/libs/ui/popover";
import { cn } from "@/libs/utils/misc";
import {
    IconArrowBackUp,
    IconArrowForwardUp,
    IconPlus,
    IconSettings,
} from "@tabler/icons-react";
import { useState } from "react";
import { useEditor } from "../editor.context";

export const Navigation = () => {
    const { domain, activeRoute } = useEditor();

    const [open, setOpen] = useState(false);

    return (
        <div
            className={cn(
                "flex flex-col items-center gap-2 fixed top-6 left-1/2 -translate-x-1/2 mx-auto text-base feno-mod-container",
                open && "min-w-[500px] border-b border-[var(--feno-border-1)]",
            )}
        >
            <div
                className={cn(
                    "flex w-full justify-center items-center p-2 px-3",
                    open && "border-b border-[var(--feno-border-1)]",
                )}
            >
                <div className="flex gap-1.5 items-center mr-7">
                    <Button
                        variant="custom"
                        size="icon"
                        className="flex gap-1 items-center"
                    >
                        <IconArrowBackUp strokeWidth={2} />
                        <IconArrowForwardUp strokeWidth={2} />
                    </Button>
                </div>
                {/* <code className="text-blue-600 font-medium border border-dashed border-[var(--feno-border-2)] rounded-md px-1">
                    {domain}
                </code> */}
                <code className="text-[var(--feno-text-2)] font-medium">
                    {domain}.feno.app{activeRoute}
                </code>
                {/* <code className="text-blue-600 font-medium border border-dashed border-[var(--feno-border-2)] rounded-md px-1">
                    {activeRoute}
                </code> */}
                <Button variant="custom" size="icon" className="-ml-1">
                    <IconPlus strokeWidth={2} />
                </Button>
                <Button
                    onClick={() => setOpen(!open)}
                    variant="custom"
                    size="icon"
                    className="ml-3"
                >
                    <IconSettings strokeWidth={2} />
                </Button>
            </div>

            <div className={cn("flex-1", !open && "hidden")}>hello</div>
        </div>
    );
};
