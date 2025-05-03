"use client";

import { useOnboarding } from "./context";

export function ErrorDisplay() {
    const { state } = useOnboarding();

    if (!state.error) return null;

    return (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
            {state.error}
        </div>
    );
}
