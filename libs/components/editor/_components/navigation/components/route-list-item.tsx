"use client";

import { DropdownMenuItem } from "@/libs/ui/dropdown";
import { cn } from "@/libs/utils/misc";
import { IconCheck, IconFile } from "@tabler/icons-react";
import { useRouteContext } from "../../../context/route.context";
import type { RouteListItemProps } from "../types";

export const RouteListItem = ({ route, isActive }: RouteListItemProps) => {
    const { setActiveRoute } = useRouteContext();

    return (
        <DropdownMenuItem
            onClick={() => setActiveRoute(route)}
            className={cn(isActive && "bg-blue-500/10")}
        >
            <code
                className={cn(
                    "flex items-center justify-between gap-2 w-full",
                    isActive && "text-blue-500 ",
                )}
            >
                <div className="flex gap-2 items-center flex-1">
                    <IconFile strokeWidth={2} className="w-4 h-4" />
                    {route !== "/" ? `${route}` : "home"}
                </div>
                {isActive && <IconCheck strokeWidth={2} className="w-4 h-4" />}
            </code>
        </DropdownMenuItem>
    );
};
