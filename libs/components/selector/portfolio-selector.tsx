"use client";

import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const PortfolioSelector = ({
    domains,
}: {
    domains: string[];
}) => {
    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-4 gap-4">
                {domains.map((domain) => (
                    <div key={domain}>{domain}</div>
                ))}
            </div>
        </div>
    );
};

function IframeCard({
    html,
    domain,
    route,
}: { html: string; domain: string; route: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        setContainerWidth(containerRef.current.offsetWidth);

        // Optional: Listen for resize
        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const responsiveStyle = `
        <style>
            html, body { width: 100vw !important; max-width: 100vw !important; overflow-x: hidden !important; }
            body { box-sizing: border-box; }
            * { max-width: 100vw !important; box-sizing: border-box; }
        </style>
    `;

    const injectedHtml =
        containerWidth != null
            ? html.replace(
                  /<head>/i,
                  `<head>${responsiveStyle}<meta name="viewport" content="width=${containerWidth}">`,
              )
            : html;

    return (
        <div
            ref={containerRef}
            className="relative cursor-pointer px-4 py-8 bg-surface-1 rounded-lg"
            style={{ height: 300 }}
            onClick={() => {
                redirect(`/${domain}`);
            }}
            key={route}
        >
            {containerWidth && (
                <iframe
                    title="pronto"
                    srcDoc={injectedHtml}
                    className="absolute inset-0 w-full h-full overflow-hidden rounded-lg"
                    style={{ border: "none" }}
                />
            )}
        </div>
    );
}
