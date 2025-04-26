import { generatePortfolioAction } from "@/app/actions/portfolio-actions";
import { useEffect, useRef, useState } from "react";

export interface UseLLMGenerationResult {
    html: string;
    isStreaming: boolean;
    error: string | null;
    startGeneration: (input: {
        pdfContent: string;
        templateId: string;
    }) => void;
}

export function useLLMGeneration(): UseLLMGenerationResult {
    const [html, setHtml] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<NodeJS.Timeout | null>(null);

    const startGeneration = async ({
        pdfContent,
        templateId,
    }: { pdfContent: string; templateId: string }) => {
        setHtml("");
        setError(null);
        setIsStreaming(true);

        try {
            const result = await generatePortfolioAction({
                content: pdfContent,
                templateId,
                pageType: "portfolio",
            });

            if (!result.success || !result.htmlTemplate) {
                setError(result.error || "Failed to generate HTML");
                setIsStreaming(false);
                return;
            }

            // Simulate streaming by revealing the HTML progressively
            const htmlString = result.htmlTemplate;
            let idx = 0;
            const revealSpeed = 8; // chars per tick
            const interval = 18; // ms per tick

            function streamStep() {
                idx = Math.min(idx + revealSpeed, htmlString.length);
                setHtml(htmlString.slice(0, idx));
                if (idx < htmlString.length) {
                    streamRef.current = setTimeout(streamStep, interval);
                } else {
                    setIsStreaming(false);
                }
            }
            streamStep();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setIsStreaming(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) clearTimeout(streamRef.current);
        };
    }, []);

    return { html, isStreaming, error, startGeneration };
}
