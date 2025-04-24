"use client";

import { Button } from "@/libs/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/libs/ui/popover";
import { Plus } from "lucide-react";
import { useState } from "react";
import { NavigationActionRoute } from "./navigation/navigation-action-route";

export const Navigation = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center gap-2 fixed top-4 left-1/2 -translate-x-1/2 mx-auto text-base">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-[400px] p-0 bg-transparent outline-none shadow-none border-none"
                >
                    <NavigationActionRoute className="rounded-lg" />
                </PopoverContent>
            </Popover>
        </div>
    );
};
