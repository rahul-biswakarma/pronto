"use client";

import { useEditorContext } from "../../editor.context";

export function VersionHistoryButton() {
    const { setActiveMode } = useEditorContext();

    return (
        <button
            type="button"
            onClick={() => setActiveMode("version-history")}
            className="hover:bg-secondary-foreground/10 flex h-8 cursor-pointer items-center justify-center rounded-xl px-2 text-sm"
            title="Version History"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
            History
        </button>
    );
}
