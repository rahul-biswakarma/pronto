"use client";

import { useEffect, useRef, useState } from "react";
import { useCanvas } from "../contexts/canvas.context";

type IframeEntityProps = {
    htmlVariantId: string | null;
};

export default function IframeEntity({ htmlVariantId }: IframeEntityProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { entities } = useCanvas();
    const [html, setHtml] = useState<string>("");

    useEffect(() => {
        if (!htmlVariantId) return;

        // Find the entity with this htmlVariantId
        const entity = entities.find(
            (e) => e.html_variant_id === htmlVariantId,
        );
        if (entity?.content) {
            setHtml(entity.content);
        }
    }, [htmlVariantId, entities]);

    useEffect(() => {
        if (!iframeRef.current || !html) return;

        // Update iframe content
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;

        if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
        }
    }, [html]);

    return (
        <div className="w-full h-full overflow-hidden bg-white">
            <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts"
            />
        </div>
    );
}
