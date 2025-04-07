"use client";
import { useData } from "@/components/context/data.context";
import { createSupabaseBrowserClient } from "@/supabase/client/browser";
import { supabaseOption } from "@/supabase/config";
import type { ExtFile } from "@dropzone-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useAISummary } from "./use-ai-summary";
import { usePDFJS } from "./use-pdf";

export type WorkflowStage =
    | "idle"
    | "upload"
    | "extraction"
    | "summarizing"
    | "portfolio_generating"
    | "completed"
    | "error";

export interface PDFWorkflowState {
    files: ExtFile[];
    extractedText: string;
    summary: string;
    stage: WorkflowStage;
    error: Error | string | null;
    userId: string | null;
}

export const usePDFWorkflow = () => {
    // Files state
    const [files, setFiles] = useState<ExtFile[]>([]);
    const [extractedText, setExtractedText] = useState<string>("");

    const { setPortfolioHtml, portfolioHtml } = useData();

    // Portfolio state
    const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);

    // Stage tracking
    const [stage, setStage] = useState<WorkflowStage>("idle");

    // Combined error handling
    const [error, setError] = useState<Error | string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

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

    // Attempt to get user ID from session
    useEffect(() => {
        const getUserId = async () => {
            try {
                const supabase = createSupabaseBrowserClient(supabaseOption);
                const { data, error } = await supabase.auth.getUser();

                if (error) {
                    throw error;
                }

                if (data?.user?.id) {
                    setUserId(data.user.id);
                } else {
                    // If no authenticated user, create a temp ID that is not stored in localStorage
                    const tempId = `temp-${Math.random().toString(36).substring(2, 15)}`;
                    setUserId(tempId);
                }
            } catch (err) {
                console.error("Error fetching user session:", err);
                // Create a temporary user ID if authentication fails
                const tempId = `temp-${Math.random().toString(36).substring(2, 15)}`;
                setUserId(tempId);
            }
        };

        getUserId();
    }, []);

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

        if (summary && isGeneratingPortfolio) {
            setStage("portfolio_generating");
            return;
        }

        if (summary && portfolioHtml && !isGeneratingPortfolio) {
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
        portfolioHtml,
        isGeneratingPortfolio,
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
            userId &&
            !userId.startsWith("temp-") &&
            extractedText &&
            !isSummarizing &&
            !summary &&
            stage === "extraction"
        ) {
            generateSummary(extractedText).catch((err) => {
                if (
                    err.message?.includes("Authentication required") ||
                    err.status === 401
                ) {
                    setError("Authentication required to generate summary");
                }
            });
        }
    }, [extractedText, isSummarizing, summary, generateSummary, stage, userId]);

    // Auto-generate portfolio when summary is done
    useEffect(() => {
        if (
            userId &&
            !userId.startsWith("temp-") &&
            summary &&
            !isGeneratingPortfolio &&
            !portfolioHtml &&
            stage === "summarizing"
        ) {
            generatePortfolio();
        }
    }, [summary, isGeneratingPortfolio, portfolioHtml, userId, stage]);

    // Handle file updates and text extraction
    const handleFileUpload = useCallback(
        async (incomingFiles: ExtFile[]) => {
            try {
                setStage("upload");
                setFiles(incomingFiles);
                setExtractedText(""); // Clear previous text
                resetSummary(); // Reset summary
                setPortfolioHtml(""); // Reset portfolio
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

    // Generate portfolio
    const generatePortfolio = useCallback(async () => {
        if (!userId || !summary) {
            return;
        }

        setIsGeneratingPortfolio(true);
        setError(null);

        try {
            const response = await fetch("/api/portfolio-generator", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    publish: false, // Default to private
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to generate portfolio",
                );
            }

            const data = await response.json();

            // Store the HTML in context
            if (data.html) {
                setPortfolioHtml(data.html);
            }

            // Store resume data in database
            if (userId && !userId.startsWith("temp-")) {
                try {
                    const supabase =
                        createSupabaseBrowserClient(supabaseOption);
                    await supabase.from("resume_summaries").upsert({
                        user_id: userId,
                        portfolio_html: data.html,
                        portfolio_url: data.deployUrl,
                        portfolio_public: data.isPublic,
                        updated_at: new Date().toISOString(),
                    });
                } catch (dbError) {
                    console.error(
                        "Failed to save portfolio to database:",
                        dbError,
                    );
                }
            }

            return data;
        } catch (error) {
            console.error("Portfolio generation error:", error);
            setError(
                error instanceof Error
                    ? error
                    : new Error("Failed to generate portfolio"),
            );
            return null;
        } finally {
            setIsGeneratingPortfolio(false);
        }
    }, [userId, summary, setPortfolioHtml]);

    // Reset the entire workflow
    const reset = useCallback(() => {
        setFiles([]);
        setExtractedText("");
        resetSummary();
        setPortfolioHtml("");
        setError(null);
        setStage("idle");
    }, [resetSummary, setPortfolioHtml]);

    // Loading states
    const isLoading = {
        pdfjs: isPDFJSLoading,
        summarizing: isSummarizing,
        portfolioGen: isGeneratingPortfolio,
        processing: isPDFJSLoading || isSummarizing || isGeneratingPortfolio,
    };

    // Export state and methods
    return {
        // State
        files,
        extractedText,
        summary,
        portfolioHtml,
        stage,
        error,
        userId,

        // Loading states for individual components
        isLoading,

        // Actions
        handleFileUpload,
        generateSummary, // Allow manual summary generation if needed
        generatePortfolio, // Allow manual portfolio generation
        reset,

        // Get full state object for easier consumption
        getState: (): PDFWorkflowState => ({
            files,
            extractedText,
            summary,
            stage,
            error,
            userId,
        }),
    };
};
