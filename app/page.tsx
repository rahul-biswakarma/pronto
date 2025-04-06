"use client";

import { Dropzone, FileMosaic } from "@dropzone-ui/react";
import { usePDFWorkflow } from "../hooks/use-pdf-workflow";

export default function Home() {
    const {
        files,
        extractedText,
        summary,
        stage,
        error,
        isLoading,
        handleFileUpload,
    } = usePDFWorkflow();

    return (
        <div className="flex flex-col justify-center items-center h-full p-4">
            <div className="w-full max-w-[700px] flex justify-between items-center mb-6">
                {stage !== "idle" && (
                    <div className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                        Status: {stage.charAt(0).toUpperCase() + stage.slice(1)}
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
                            : "Drag 'n' drop a PDF file here, or click to select"
                    }
                >
                    {files.length === 0 && !isLoading.pdfjs && (
                        <div className="text-center text-gray-400">
                            Upload a PDF to extract text and generate a summary
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
                    {stage}
                </div>
            )}

            {/* Errors */}
            {error && (
                <div className="max-w-[700px] w-full mt-4 p-4 border border-red-800 rounded bg-[#1a1a1a] text-center text-red-400">
                    Error: {error instanceof Error ? error.message : error}
                </div>
            )}
        </div>
    );
}
