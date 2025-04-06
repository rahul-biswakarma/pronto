"use client";

import { useEffect, useRef, useState } from "react";

interface PortfolioPreviewProps {
    html: string;
}

export const PortfolioPreview = ({ html }: PortfolioPreviewProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState<number>(500);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Set HTML content when it changes
    useEffect(() => {
        if (iframeRef.current && html) {
            const iframe = iframeRef.current;
            const document = iframe.contentDocument;

            if (document) {
                document.open();
                document.write(html);
                document.close();

                // Adjust iframe height to content
                const adjustHeight = () => {
                    if (iframe.contentWindow?.document.body) {
                        const newHeight =
                            iframe.contentWindow.document.body.scrollHeight;
                        setHeight(newHeight < 500 ? 500 : newHeight);
                    }
                };

                // Listen for load events to adjust height
                iframe.onload = adjustHeight;

                // Also try to adjust after a short delay
                setTimeout(adjustHeight, 500);
            }
        }
    }, [html]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Handle the "Open in New Tab" button
    const openInNewTab = () => {
        const newWindow = window.open("", "_blank");
        if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
        }
    };

    // Handle the "Download HTML" button
    const downloadHTML = () => {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "portfolio.html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!html) {
        return null;
    }

    return (
        <div
            className={`portfolio-preview ${isFullscreen ? "fixed inset-0 z-50 bg-black" : "relative"}`}
        >
            <div className="toolbar bg-gray-800 p-2 flex justify-between items-center rounded-t">
                <h3 className="text-white font-semibold">Portfolio Preview</h3>
                <div className="controls flex space-x-2">
                    <button
                        type="button"
                        onClick={openInNewTab}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        Open in New Tab
                    </button>
                    <button
                        type="button"
                        onClick={downloadHTML}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                        Download HTML
                    </button>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </button>
                </div>
            </div>
            <iframe
                ref={iframeRef}
                className="w-full bg-white rounded-b h-[80vh]"
                style={{
                    height: isFullscreen ? "calc(100vh - 40px)" : `${height}px`,
                }}
                title="Portfolio Preview"
                sandbox="allow-same-origin"
            />
        </div>
    );
};
