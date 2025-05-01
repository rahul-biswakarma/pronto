"use client";

import { PdfDropzone } from "@/libs/components/onboarding/_components/pdf-dropzone";
import type { Template } from "@/libs/constants/templates";
import { Button } from "@/libs/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/libs/ui/dialog";
import { cn } from "@/libs/utils/misc";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import type { FC } from "react";
import { useState } from "react";
import {
    GENERATE_PICKUP_LINES,
    HEADING_PICKUP_LINES,
    UPLOAD_PICKUP_LINES,
} from "../constant";

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
                className="max-w-[95vw] md:max-w-[90vw] max-h-[90vh] aspect-auto md:aspect-video bg-surface-0 shadow-2xl border-none overflow-y-auto gap-0 p-0 rounded-3xl"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <div className="p-4 lg:p-10 grid max-md:grid-cols-[1fr] md:grid-cols-[40%_auto] lg:grid-cols-[30%_auto] gap-6 md:gap-10 max-h-[90vh] md:max-h-full h-full overflow-y-auto md:overflow-hidden">
                    <div className="flex flex-col gap-20 justify-between max-h-full overflow-y-auto no-scrollbar">
                        <div>
                            <h2 className="text-[28px]/[116.67%] lg:text-[40px]/[116.67%] font-semibold pt-3 md:pt-10">
                                {
                                    HEADING_PICKUP_LINES[
                                        Math.floor(
                                            Math.random() *
                                                HEADING_PICKUP_LINES.length,
                                        )
                                    ]
                                }
                            </h2>

                            <p className="mt-10 text-[var(--feno-text-3)] font-medium text-[16px]">
                                {
                                    UPLOAD_PICKUP_LINES[
                                        Math.floor(
                                            Math.random() *
                                                UPLOAD_PICKUP_LINES.length,
                                        )
                                    ]
                                }
                            </p>

                            <div className="pt-2">
                                <PdfDropzone
                                    onPdfUpload={handlePdfUpload}
                                    disabled={isGenerating}
                                    error={error}
                                />
                            </div>

                            <p
                                className={cn(
                                    "mt-6 md:mt-10 text-[var(--feno-text-3)] font-medium text-[14px] md:text-[16px]",
                                    !pdfFile
                                        ? "text-[var(--feno-text-3)]/30"
                                        : "text-[var(--feno-text-3)]",
                                )}
                            >
                                {
                                    GENERATE_PICKUP_LINES[
                                        Math.floor(
                                            Math.random() *
                                                GENERATE_PICKUP_LINES.length,
                                        )
                                    ]
                                }
                            </p>

                            <Button
                                className="bg-black mt-2 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
                                onClick={onGenerate}
                                disabled={!pdfFile || isGenerating}
                            >
                                {isGenerating && (
                                    <IconLoader2 className="animate-spin mr-2 w-4 h-4" />
                                )}
                                {isGenerating ? "Generating..." : "Generate"}
                            </Button>
                        </div>
                        <DialogClose asChild>
                            <div className="flex gap-1 items-center font-medium font-mono hover:border-b cursor-pointer w-fit border-black pl-1 pr-2.5">
                                <IconArrowLeft /> Back
                            </div>
                        </DialogClose>
                    </div>
                    <div className="overflow-y-auto no-scrollbar max-h-full rounded-3xl max-md:hidden">
                        <Image
                            src={template?.image}
                            alt={template?.name}
                            width={1440}
                            height={1440}
                            className="w-full object-cover shadow-lg border border-black/10 -mt-0.5"
                            priority
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
