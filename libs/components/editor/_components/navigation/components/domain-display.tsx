"use client";

import { useRouteContext } from "../../../context/route.context";

export const DomainDisplay = () => {
    const { domain, activeRoute } = useRouteContext();
    return (
        <code className="flex items-center text-[var(--feno-text-2)] font-medium bg-[var(--feno-surface-0)] rounded-lg p-2 !py-0 pl-4 shadow-[var(--feno-minimal-shadow)]">
            {domain}.feno.app{activeRoute}
        </code>
    );
};
