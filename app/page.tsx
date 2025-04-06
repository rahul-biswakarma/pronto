"use client";

import { Dropzone, type ExtFile, FileMosaic } from "@dropzone-ui/react";
import { useEffect, useState } from "react";
import { useAISummary } from "../hooks/use-ai-summary";
import { usePDFJS } from "../hooks/use-pdf";

export default function Home() {
    const [files, setFiles] = useState<ExtFile[]>([]);
    const [extractedText, setExtractedText] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    const { extractTextFromPDF, isLoading, error } = usePDFJS();
    const {
        summary,
        isSummarizing,
        summaryError,
        generateSummary,
        resetSummary,
    } = useAISummary();

    // Auto-generate summary when text is extracted
    useEffect(() => {
        if (extractedText && !isSummarizing && summary === "") {
            generateSummary(extractedText);
        }
    }, [extractedText, isSummarizing, summary, generateSummary]);

    const updateFiles = async (incomingFiles: ExtFile[]) => {
        setFiles(incomingFiles);
        setExtractedText(""); // Clear previous text
        resetSummary(); // Reset summary

        if (incomingFiles.length > 0 && incomingFiles[0].file) {
            try {
                setIsProcessing(true);
                const text = await extractTextFromPDF(incomingFiles[0].file);
                setExtractedText(text);
                // Summary will be auto-generated via useEffect
            } catch (err) {
                console.error("Failed to extract text from PDF:", err);
                setExtractedText(
                    "Error: Could not extract text from PDF file.",
                );
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center w-full min-h-screen p-4 bg-black text-white">
            <h1 className="text-2xl font-bold mb-6">
                PDF Text Extractor & Summarizer
            </h1>

            <div className="max-w-[700px] w-full mb-4">
                <Dropzone
                    onChange={updateFiles}
                    maxFiles={1}
                    value={files}
                    accept="application/pdf"
                    header={false}
                    footer={false}
                    disabled={isLoading || isProcessing || isSummarizing} // Disable during any processing
                    style={{
                        border: "2px dashed #333",
                        background: "#1a1a1a",
                        padding: "20px",
                        borderRadius: "8px",
                    }}
                    label={
                        isLoading
                            ? "Loading PDF.js library..."
                            : "Drag 'n' drop a PDF file here, or click to select"
                    }
                >
                    {files.length === 0 && !isLoading && (
                        <div className="text-center text-gray-400">
                            Upload a PDF to extract text and generate a summary
                        </div>
                    )}
                    {isLoading && (
                        <div className="text-center text-gray-400">
                            Loading PDF.js library...
                        </div>
                    )}
                    {files.map((file) => (
                        <FileMosaic key={file.id} {...file} preview info />
                    ))}
                </Dropzone>
            </div>

            {/* Processing indicators */}
            {(isProcessing || isSummarizing) && (
                <div className="max-w-[700px] w-full mt-4 p-4 border border-gray-600 rounded bg-[#1a1a1a] text-center">
                    <div className="flex items-center justify-center">
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        {isProcessing
                            ? "Processing PDF file..."
                            : "Generating AI summary..."}
                    </div>
                </div>
            )}

            {/* Errors */}
            {error && (
                <div className="max-w-[700px] w-full mt-4 p-4 border border-red-800 rounded bg-[#1a1a1a] text-center text-red-400">
                    Error: {error.message}
                </div>
            )}

            {summaryError && (
                <div className="max-w-[700px] w-full mt-4 p-4 border border-red-800 rounded bg-[#1a1a1a] text-center text-red-400">
                    Summary Error: {summaryError}
                </div>
            )}

            {/* Results section with tabs */}
            {(extractedText || summary) && !isProcessing && (
                <div className="max-w-[700px] w-full mt-4">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-700 mb-4">
                        <button
                            type="button"
                            className={`px-4 py-2 ${!summary ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}
                            onClick={() => {}} // These are visual tabs only, content is always shown
                        >
                            Extracted Text
                        </button>
                        {summary && (
                            <button
                                type="button"
                                className={`px-4 py-2 ${summary ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}
                                onClick={() => {}}
                            >
                                AI Summary
                            </button>
                        )}
                    </div>

                    {/* Summary section */}
                    {summary && (
                        <div className="p-4 border border-gray-600 rounded bg-[#1a1a1a] mb-4">
                            <h2 className="text-lg font-semibold mb-2">
                                AI Summary:
                            </h2>
                            <div className="text-sm text-gray-300 whitespace-pre-line">
                                {summary}
                            </div>
                        </div>
                    )}

                    {/* Extracted text section */}
                    <div className="p-4 border border-gray-600 rounded bg-[#1a1a1a]">
                        <h2 className="text-lg font-semibold mb-2">
                            Extracted Text:
                        </h2>
                        <pre className="whitespace-pre-wrap text-sm text-gray-300 max-h-[400px] overflow-y-auto">
                            {extractedText}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
