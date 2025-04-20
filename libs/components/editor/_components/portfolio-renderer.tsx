import type React from "react";
import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { Moder } from "./moder";

export const PortfolioRenderer: React.FC<{
    portfolioHtml: string;
}> = ({ portfolioHtml }) => {
    const { setIframeDocument, iframeRef } = useEditor();

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleLoad = () => {
            if (iframe.contentDocument) {
                setIframeDocument(iframe.contentDocument);
            }
        };

        iframe.addEventListener("load", handleLoad);

        // If already loaded
        if (iframe.contentDocument) {
            setIframeDocument(iframe.contentDocument);
        }

        return () => {
            iframe.removeEventListener("load", handleLoad);
        };
    }, [setIframeDocument, iframeRef]);

    return (
        <div>
            {/* <Navigation /> */}
            <iframe
                ref={iframeRef}
                className="w-screen h-screen"
                srcDoc={portfolioHtml}
                title="Portfolio"
                allow="cross-origin-isolated"
                sandbox="allow-same-origin allow-scripts"
            />
            <Moder />
        </div>
    );
};
