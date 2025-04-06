"use client";

import { Dropzone, FileMosaic } from "@dropzone-ui/react";
import { PortfolioPreview } from "../components/portfolio-preview";
import { usePDFWorkflow } from "../hooks/use-pdf-workflow";

export default function Home() {
    const {
        files,
        extractedText,
        summary,
        portfolioHtml,
        stage,
        error,
        isLoading,
        handleFileUpload,
        generatePortfolio,
        userId,
    } = usePDFWorkflow();

    return (
        <div className="flex flex-col justify-center items-center h-full p-4">
            <div className="w-full max-w-[700px] flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">PDF Resume Processor</h1>
                {stage !== "idle" && (
                    <div className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                        Status:{" "}
                        {stage.charAt(0).toUpperCase() +
                            stage.slice(1).replace("_", " ")}
                    </div>
                )}
            </div>

            <div className="max-w-[700px] w-full mb-4">
                <Dropzone
                    onChange={handleFileUpload}
                    maxFiles={1}
                    value={files}
                    accept="application/pdf"
                    header={false}
                    footer={false}
                    disabled={isLoading.pdfjs || isLoading.processing} // Disable during any processing
                    style={{
                        border: "2px dashed #333",
                        background: "#1a1a1a",
                        padding: "20px",
                        borderRadius: "8px",
                    }}
                    label={
                        isLoading.pdfjs
                            ? "Loading PDF.js library..."
                            : "Drag 'n' drop a PDF resume here, or click to select"
                    }
                >
                    {files.length === 0 && !isLoading.pdfjs && (
                        <div className="text-center text-gray-400">
                            Upload a PDF resume to extract text, generate a
                            summary, and create a portfolio
                        </div>
                    )}
                    {isLoading.pdfjs && (
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
            {isLoading.processing && (
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
                        {stage === "extraction"
                            ? "Processing PDF file..."
                            : stage === "summarizing"
                              ? "Generating AI summary..."
                              : "Creating portfolio website..."}
                    </div>
                </div>
            )}

            {/* Errors */}
            {error && (
                <div className="max-w-[700px] w-full mt-4 p-4 border border-red-800 rounded bg-[#1a1a1a] text-center text-red-400">
                    Error: {error instanceof Error ? error.message : error}
                </div>
            )}

            {/* Results section with tabs */}
            {(extractedText || summary || portfolioHtml) &&
                stage !== "error" && (
                    <div className="max-w-[700px] w-full mt-4">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-700 mb-4">
                            <button
                                type="button"
                                className={`px-4 py-2 ${!summary && !portfolioHtml ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}
                            >
                                Extracted Text
                            </button>
                            {summary && (
                                <button
                                    type="button"
                                    className={`px-4 py-2 ${summary && !portfolioHtml ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}
                                >
                                    AI Summary
                                </button>
                            )}
                            {portfolioHtml && (
                                <button
                                    type="button"
                                    className={`px-4 py-2 ${portfolioHtml ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}
                                >
                                    Portfolio
                                </button>
                            )}
                        </div>

                        {/* Portfolio section */}
                        {portfolioHtml && (
                            <div className="mb-6">
                                <PortfolioPreview html={portfolioHtml} />
                            </div>
                        )}

                        {/* Summary section */}
                        {summary && !portfolioHtml && (
                            <div className="p-4 border border-gray-600 rounded bg-[#1a1a1a] mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-semibold">
                                        AI Summary:
                                    </h2>
                                    {userId &&
                                        !userId.startsWith("temp-") &&
                                        !isLoading.portfolioGenerating &&
                                        stage !== "portfolio_generating" && (
                                            <button
                                                type="button"
                                                onClick={generatePortfolio}
                                                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                                            >
                                                Generate Portfolio
                                            </button>
                                        )}
                                    {userId && (
                                        <div className="text-yellow-400 text-sm border border-yellow-600 rounded px-2 py-1">
                                            Sign in to generate portfolio
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-gray-300 whitespace-pre-line">
                                    {summary}
                                </div>
                            </div>
                        )}

                        {/* Extracted text section */}
                        {extractedText && !portfolioHtml && !summary && (
                            <div className="p-4 border border-gray-600 rounded bg-[#1a1a1a]">
                                <h2 className="text-lg font-semibold mb-2">
                                    Extracted Text:
                                </h2>
                                <pre className="whitespace-pre-wrap text-sm text-gray-300 max-h-[400px] overflow-y-auto">
                                    {extractedText}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
}
