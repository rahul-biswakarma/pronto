"use client";

import { DropdownMenuItem } from "@/libs/ui/dropdown";
import { IconFile } from "@tabler/icons-react";
import type { RouteListItemProps } from "../types";

export const RouteListItem = ({ route }: RouteListItemProps) => (
    <DropdownMenuItem>
        <code className="flex items-center gap-2">
            <IconFile strokeWidth={2} className="w-4 h-4" />
            {route !== "/" ? `${route}` : "home"}
        </code>
    </DropdownMenuItem>
);
