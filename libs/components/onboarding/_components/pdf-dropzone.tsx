"use client";

import { usePDFJS } from "@/libs/hooks/use-pdf";
import { Button } from "@/libs/ui/button";
import { FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useOnboarding } from "../onboarding.context";

interface PdfDropzoneProps {
    onPdfUpload: (file: File | null) => void;
    disabled?: boolean;
    error?: string;
}

export function PdfDropzone({
    onPdfUpload,
    disabled,
    error,
}: PdfDropzoneProps) {
    const { extractTextFromPDF } = usePDFJS();
    const { setPdfContent } = useOnboarding();
    const [dragActive, setDragActive] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            onPdfUpload(file);
            setPdfContent(await extractTextFromPDF(file));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            onPdfUpload(file);
            setPdfContent(await extractTextFromPDF(file));
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPdfFile(null);
        onPdfUpload(null);
        setPdfContent("");
    };

    return (
        <div className="w-full">
            <div
                className={`${dragActive ? "border-primary-500 bg-primary-50" : "border-black/10 bg-surface-1"} relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-colors select-none ${disabled ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                }}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                aria-label="Upload PDF"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled}
                />
                {pdfFile ? (
                    <div className="flex items-center gap-2">
                        <FileText className="text-primary-500" />
                        <span className="font-medium text-black/80">
                            {pdfFile.name}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemove}
                            aria-label="Remove PDF"
                            type="button"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-primary-500" />
                        <span className="text-black/70 font-medium">
                            Drag & Drop your Resume here, or{" "}
                            <span className="underline">click to upload</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Max 10MB. Only PDF files are supported.
                        </span>
                    </div>
                )}
            </div>
            {error && (
                <span className="text-red-500 text-sm ml-2 mt-2 block">
                    {error}
                </span>
            )}
        </div>
    );
}
