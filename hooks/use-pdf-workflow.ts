"use client";

import type { ExtFile } from "@dropzone-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useAISummary } from "./use-ai-summary";
import { usePDFJS } from "./use-pdf";

export type WorkflowStage =
    | "idle"
    | "upload"
    | "extraction"
    | "summarizing"
    | "completed"
    | "error";

export interface PDFWorkflowState {
    files: ExtFile[];
    extractedText: string;
    summary: string;
    stage: WorkflowStage;
    error: Error | string | null;
}

export const usePDFWorkflow = () => {
    // Files state
    const [files, setFiles] = useState<ExtFile[]>([]);
    const [extractedText, setExtractedText] = useState<string>("");

    // Stage tracking
    const [stage, setStage] = useState<WorkflowStage>("idle");

    // Combined error handling
    const [error, setError] = useState<Error | string | null>(null);

    // Integrate existing hooks
    const {
        extractTextFromPDF,
        isLoading: isPDFJSLoading,
        error: pdfError,
    } = usePDFJS();
    const {
        summary,
        isSummarizing,
        summaryError,
        generateSummary,
        resetSummary,
    } = useAISummary();

    // Update stage when loading states change
    useEffect(() => {
        if (isPDFJSLoading) {
            setStage("upload");
            return;
        }

        if (files.length > 0 && !extractedText && !pdfError) {
            setStage("extraction");
            return;
        }

        if (extractedText && isSummarizing) {
            setStage("summarizing");
            return;
        }

        if (summary && !isSummarizing) {
            setStage("completed");
            return;
        }

        if (pdfError || summaryError) {
            setStage("error");
            return;
        }

        setStage("idle");
    }, [
        files,
        extractedText,
        isPDFJSLoading,
        isSummarizing,
        summary,
        pdfError,
        summaryError,
    ]);

    // Update error state when any errors change
    useEffect(() => {
        if (pdfError) {
            setError(pdfError);
        } else if (summaryError) {
            setError(summaryError);
        } else {
            setError(null);
        }
    }, [pdfError, summaryError]);

    // Auto-generate summary when text is extracted
    useEffect(() => {
        if (
            extractedText &&
            !isSummarizing &&
            !summary &&
            stage === "extraction"
        ) {
            generateSummary(extractedText);
        }
    }, [extractedText, isSummarizing, summary, generateSummary, stage]);

    // Handle file updates and text extraction
    const handleFileUpload = useCallback(
        async (incomingFiles: ExtFile[]) => {
            try {
                setStage("upload");
                setFiles(incomingFiles);
                setExtractedText(""); // Clear previous text
                resetSummary(); // Reset summary
                setError(null);

                if (incomingFiles.length > 0 && incomingFiles[0].file) {
                    try {
                        setStage("extraction");
                        const text = await extractTextFromPDF(
                            incomingFiles[0].file,
                        );
                        setExtractedText(text);
                        // Summary will be auto-generated via useEffect
                    } catch (err) {
                        console.error("Failed to extract text from PDF:", err);
                        setError(
                            err instanceof Error ? err.message : String(err),
                        );
                        setStage("error");
                    }
                } else {
                    setStage("idle");
                }
            } catch (err) {
                console.error("File upload error:", err);
                setError(err instanceof Error ? err.message : String(err));
                setStage("error");
            }
        },
        [extractTextFromPDF, resetSummary],
    );

    // Reset the entire workflow
    const reset = useCallback(() => {
        setFiles([]);
        setExtractedText("");
        resetSummary();
        setError(null);
        setStage("idle");
    }, [resetSummary]);

    // Export state and methods
    return {
        // State
        files,
        extractedText,
        summary,
        stage,
        error,

        // Loading states for individual components
        isLoading: {
            pdfjs: isPDFJSLoading,
            summarizing: isSummarizing,
            processing: stage === "extraction" || stage === "summarizing",
        },

        // Actions
        handleFileUpload,
        generateSummary, // Allow manual summary generation if needed
        reset,

        // Get full state object for easier consumption
        getState: (): PDFWorkflowState => ({
            files,
            extractedText,
            summary,
            stage,
            error,
        }),
    };
};
