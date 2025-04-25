"use client";

import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import type { AddRouteInputProps } from "../types";

export const AddRouteInput = ({
    onAdd,
    value,
    onChange,
    isLoading = false,
}: AddRouteInputProps) => {
    const [error, setError] = useState<string | null>(null);

    const handleAddClick = () => {
        if (value.trim() === "") {
            setError("Route name cannot be empty");
            return;
        }
        setError(null);
        onAdd();
    };

    const handleChange = (newValue: string) => {
        setError(null);
        onChange(newValue);
    };

    return (
        <div className="flex flex-col w-full">
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
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !isLoading) {
                                handleAddClick();
                            }
                        }}
                        disabled={isLoading}
                    />
                    <div onClick={onAdd} className="px-2 bg-blue-400 py-2">
                        {isLoading ? (
                            <IconLoader2
                                className="w-4 h-4 animate-spin"
                                strokeWidth={2}
                            />
                        ) : (
                            <IconPlus className="w-4 h-4" strokeWidth={2} />
                        )}
                    </div>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
