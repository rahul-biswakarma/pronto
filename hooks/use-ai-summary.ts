"use client";
import { useState } from "react";

export const useAISummary = () => {
    const [summary, setSummary] = useState<string>("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const generateSummary = async (text: string) => {
        if (!text.trim()) {
            setSummaryError("No text to summarize");
            return;
        }

        try {
            setIsSummarizing(true);
            setSummaryError(null);

            const response = await fetch("/api/summarizer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to generate summary",
                );
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let result = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    result += chunk;
                    setSummary(result); // Update summary incrementally for streaming effect
                }
            } else {
                // Fallback for non-streaming response
                const text = await response.text();
                setSummary(text);
            }
        } catch (err) {
            console.error("Summary generation error:", err);
            setSummaryError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate summary",
            );
        } finally {
            setIsSummarizing(false);
        }
    };

    return {
        summary,
        isSummarizing,
        summaryError,
        generateSummary,
        resetSummary: () => {
            setSummary("");
            setSummaryError(null);
        },
    };
};
