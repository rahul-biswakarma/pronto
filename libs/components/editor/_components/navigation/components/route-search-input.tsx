"use client";

import { IconSearch } from "@tabler/icons-react";
import type { RouteSearchInputProps } from "../types";

export const RouteSearchInput = ({
    value,
    onChange,
}: RouteSearchInputProps) => (
    <div className="flex items-center gap-2 w-full text-xs border-b border-[var(--feno-border-1)] px-1 py-1 pb-2">
        <IconSearch
            strokeWidth={2}
            className="text-[var(--feno-text-2)] w-5 h-5"
        />
        <input
            type="text"
            placeholder="Search"
            className="w-full outline-none text-xs"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
        />
    </div>
);
