"use client";

import { Button } from "@/libs/ui/button";
import { IconPlus, IconWorld, IconX } from "@tabler/icons-react";
import type { RouteMenuHeaderProps } from "../types";

export const RouteMenuHeader = ({
    showAddRouteInput,
    onToggleAddRoute,
}: RouteMenuHeaderProps) => (
    <div className="flex items-center justify-between w-full text-xs px-1">
        <div className="flex items-center gap-2">
            <IconWorld
                className="text-[var(--feno-text-1)] w-5 h-5"
                strokeWidth={2}
            />
            Routes
        </div>
        <Button variant="custom" size="icon" onClick={onToggleAddRoute}>
            {showAddRouteInput ? (
                <IconX strokeWidth={2} />
            ) : (
                <IconPlus strokeWidth={2} />
            )}
        </Button>
    </div>
);
