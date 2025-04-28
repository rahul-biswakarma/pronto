"use client";

import { PdfDropzone } from "@/libs/components/onboarding/_components/pdf-dropzone";
import type { Template } from "@/libs/constants/templates";
import { Button } from "@/libs/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/libs/ui/dialog";
import { Separator } from "@/libs/ui/separator";
import { IconLoader2, IconX } from "@tabler/icons-react";
import Image from "next/image";
import type { FC } from "react";
import { useState } from "react";

interface ApolloDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: Template;
    onPdfUpload?: (file: File) => void;
    onGenerate?: () => void;
    isGenerating?: boolean;
    error?: string;
}

export const ApolloDialog: FC<ApolloDialogProps> = ({
    open,
    onOpenChange,
    template,
    onPdfUpload,
    onGenerate,
    isGenerating,
    error,
}) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const handlePdfUpload = (file: File | null) => {
        setPdfFile(file);
        if (file && onPdfUpload) {
            onPdfUpload(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                hideTitle
                title={template?.name}
                className="max-w-[90vw]  aspect-video bg-surface-0 rounded-2xl shadow-2xl border-0 overflow-y-auto sm:max-w-[90vw] gap-0 p-0"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <div className="flex justify-between sticky top-0 bg-surface-0 p-3 mb-1">
                    <div className="flex items-center gap-2">
                        <Image
                            className="p-1 bg-surface-1 rounded-lg border aspect-square"
                            src={template?.metadata?.favicon ?? ""}
                            alt={template?.name}
                            width={32}
                            height={32}
                        />
                        <h2 className="text-md">{template?.name}</h2>
                    </div>
                    <div className="flex items-center">
                        {template?.metadata?.isNew && (
                            <span className="bg-primary-500 text-primary-foreground px-2 py-1 rounded text-xs ml-2">
                                New
                            </span>
                        )}
                        <Separator
                            orientation="vertical"
                            className="mx-2 h-6"
                        />
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon">
                                <IconX />
                            </Button>
                        </DialogClose>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 px-4">
                    <div className="max-w-[90%] mx-auto w-full">
                        <Image
                            src={template?.image}
                            alt={template?.name}
                            width={1440}
                            height={1440}
                            className="rounded-xl w-full object-cover shadow-lg border border-black/10 -mt-0.5"
                            priority
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 flex flex-col gap-4 p-4 bg-gradient-to-t from-background z-10">
                    <div className="flex items-center justify-between gap-4 mt-2">
                        <span className="text-sm text-muted-foreground bg-surface-1 border rounded-lg px-2 py-1 w-fit">
                            {template?.description}
                        </span>
                        <button
                            type="button"
                            className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
                            onClick={onGenerate}
                            disabled={!pdfFile || isGenerating}
                        >
                            {isGenerating && (
                                <IconLoader2 className="animate-spin mr-2 w-4 h-4" />
                            )}
                            {isGenerating ? "Generating..." : "Generate"}
                        </button>
                    </div>
                    <PdfDropzone
                        onPdfUpload={handlePdfUpload}
                        disabled={isGenerating}
                        error={error}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
