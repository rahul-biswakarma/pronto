"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../editor.context";
import { EditorInput } from "./editor-input";

export const EditorMain = () => {
    const { portfolioHtml, portfolioContent } = useEditorContext();
    const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (portfolioHtml && portfolioContent) {
            try {
                setRenderedHtml(portfolioHtml);

                // Update iframe content if iframe is ready
                if (iframeRef.current) {
                    const doc = iframeRef.current.contentDocument;
                    if (doc) {
                        doc.open();
                        doc.write(portfolioHtml);
                        doc.close();
                    }
                }
            } catch (error) {
                console.error("Error rendering template:", error);
            }
        }
    }, [portfolioHtml, portfolioContent]);

    // Handle iframe load event to update content
    const handleIframeLoad = () => {
        if (iframeRef.current && renderedHtml) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(renderedHtml);
                doc.close();
            }
        }
    };

    return (
        <>
            <iframe
                ref={iframeRef}
                title="Portfolio Preview"
                onLoad={handleIframeLoad}
                style={{
                    backgroundColor: "transparent",
                    width: "100vw",
                    height: "100vh",
                    border: "none",
                }}
            />
            <EditorInput />
        </>
    );
};
