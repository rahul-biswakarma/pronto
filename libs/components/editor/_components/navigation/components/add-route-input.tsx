"use client";

import { IconPlus } from "@tabler/icons-react";
import type { AddRouteInputProps } from "../types";

export const AddRouteInput = ({
    onAdd,
    value,
    onChange,
}: AddRouteInputProps) => (
    <div className="flex items-center gap-2 w-full">
        <div className="flex items-center gap-2 w-full bg-[var(--feno-surface-1)] rounded-md shadow-[var(--feno-minimal-shadow)] overflow-hidden">
            <code className="flex items-center justify-center bg-[var(--feno-surface-0)] px-3 h-8 text-[14px]">
                /
            </code>
            <input
                type="text"
                placeholder="new-route"
                className="w-full h-full outline-none p-2 py-1 bg-[var(--feno-surface-1)] font-mono font-[400] truncate"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onAdd();
                    }
                }}
            />
            <div onClick={onAdd} className="px-2 bg-blue-400 py-2">
                <IconPlus className="w-4 h-4" strokeWidth={2} />
            </div>
        </div>
    </div>
);
