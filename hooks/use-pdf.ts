"use client";

import { useEffect, useState } from "react";

// Use a more direct type instead of importing from pdfjs-dist
interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
    getTextContent: () => Promise<PDFTextContent>;
}

interface PDFTextContent {
    items: Array<{ str?: string }>;
}

interface PDFJS {
    getDocument: (params: { data: Uint8Array }) => {
        promise: Promise<PDFDocumentProxy>;
    };
    GlobalWorkerOptions: {
        workerSrc: string;
    };
}

// Extend the window interface to include PDF.js
declare global {
    interface Window {
        "pdfjs-dist/build/pdf": PDFJS;
    }
}

export const usePDFJS = (
    onLoad?: (pdfjs: PDFJS) => Promise<void>,
    deps: (string | number | boolean | undefined | null)[] = [],
) => {
    const [pdfjs, setPDFJS] = useState<PDFJS | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Load PDF.js dynamically to avoid build issues with WebAssembly
    useEffect(() => {
        setIsLoading(true);
        // Use dynamic import with CDN version instead of local webpack import
        const scriptElement = document.createElement("script");
        scriptElement.src =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        scriptElement.onload = () => {
            const pdfjsLib = window["pdfjs-dist/build/pdf"];
            if (pdfjsLib) {
                // Configure the worker
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                setPDFJS(pdfjsLib);
                setIsLoading(false);
            } else {
                setError(new Error("Failed to load PDF.js library"));
                setIsLoading(false);
            }
        };
        scriptElement.onerror = () => {
            setError(new Error("Failed to load PDF.js script"));
            setIsLoading(false);
        };
        document.head.appendChild(scriptElement);

        return () => {
            // Clean up script tag on unmount
            if (document.head.contains(scriptElement)) {
                document.head.removeChild(scriptElement);
            }
        };
    }, []);

    // Execute the callback function whenever PDFJS loads
    useEffect(() => {
        if (!pdfjs || !onLoad) return;
        (async () => {
            try {
                await onLoad(pdfjs);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        })();
    }, [pdfjs, onLoad, ...deps]);

    // Extract text from a PDF file
    const extractTextFromPDF = async (file: File): Promise<string> => {
        if (!pdfjs) {
            throw new Error("PDF.js not loaded yet");
        }

        try {
            // Read the file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const typedArray = new Uint8Array(arrayBuffer);

            // Load the PDF document
            const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
            let fullText = "";

            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // Safe type checking and extraction
                const pageText = textContent.items
                    .map((item) => item.str || "")
                    .join(" ");
                fullText += `${pageText}\n`;
            }

            return fullText;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    };

    return {
        pdfjs,
        isLoading,
        error,
        extractTextFromPDF,
    };
};
