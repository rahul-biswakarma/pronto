import type { Template } from "@/libs/constants/templates";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
} from "@/libs/ui/dialog";
import { useState } from "react";
import { FileUploader } from "./pdf-dropzone";

interface UploadModalProps {
    open: boolean;
    template: Template | null;
    onClose: () => void;
    onUpload: (file: File) => void;
    isLoading?: boolean;
    error?: string | null;
}

export function UploadModal({
    open,
    template,
    onClose,
    onUpload,
    isLoading,
    error,
}: UploadModalProps) {
    const [localFile, setLocalFile] = useState<File | null>(null);

    // Handle file selection from FileUploader
    const handleFileChange = (file: File | null) => {
        setLocalFile(file);
        if (file) onUpload(file);
    };

    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                title={`Upload PDF for ${template.name}`}
                className="fade-in"
                hideTitle
                style={{
                    background: "var(--color-surface-0)",
                    fontFamily: "var(--font-sans)",
                }}
            >
                <div className="flex flex-col gap-6">
                    {/* Template Info */}
                    <div className="flex items-center gap-4">
                        <img
                            src={template.image}
                            alt={template.name}
                            className="w-16 h-16 rounded-lg object-cover border border-[var(--color-border-2)]"
                        />
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-[var(--color-text-1)]">
                                {template.name}
                            </span>
                            <span className="text-sm text-[var(--color-text-2)]">
                                {template.description}
                            </span>
                        </div>
                    </div>

                    {/* PDF Upload */}
                    <div>
                        <FileUploader
                            className="w-full"
                            style={{
                                border: "1px dashed var(--color-border-2)",
                                background: "var(--color-surface-1)",
                                fontFamily: "var(--font-sans)",
                                fontSize: "14px",
                            }}
                            onFileChange={handleFileChange}
                        />
                        <span className="block text-xs text-[var(--color-text-3)] mt-2">
                            Only PDF files are supported.
                        </span>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-500 text-sm" role="alert">
                            {error}
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-6">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold disabled:opacity-60 transition-colors"
                        disabled={!localFile || isLoading}
                        onClick={() => localFile && onUpload(localFile)}
                        aria-disabled={!localFile || isLoading}
                    >
                        {isLoading ? "Generating..." : "Generate"}
                    </button>
                    <DialogClose
                        className="px-4 py-2 rounded-md border border-[var(--color-border-2)] text-[var(--color-text-2)] bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors"
                        aria-label="Close"
                    >
                        Cancel
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
