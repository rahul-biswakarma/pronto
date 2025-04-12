"use client";

import { usePDFJS } from "@/libs/hooks/use-pdf";
import { cn } from "@/libs/utils/misc";
import { Dropzone, type ExtFile } from "@dropzone-ui/react";
import { useState } from "react";
import { useOnboarding } from "../onboarding-context";

interface FileUploaderProps {
    className?: string;
    style?: React.CSSProperties;
}

export function FileUploader({ className, style }: FileUploaderProps) {
    const { setPdfContent } = useOnboarding();
    const { extractTextFromPDF } = usePDFJS();
    const [files, setFiles] = useState<ExtFile[]>([]);

    const updateFiles = async (incomingFiles: ExtFile[]) => {
        setFiles(incomingFiles);

        if (incomingFiles.length > 0 && extractTextFromPDF) {
            const file = incomingFiles[0];
            if (file.file) {
                try {
                    const fullText = await extractTextFromPDF(file.file);
                    setPdfContent(fullText);
                } catch (error) {
                    console.error("Error processing PDF:", error);
                }
            }
        }
    };

    return (
        <Dropzone
            maxFiles={1}
            accept="application/pdf"
            header={false}
            footer={false}
            style={style}
            value={files}
            onChange={updateFiles}
            className={cn(className, "cursor-pointer")}
        >
            {files.length > 0 && (
                <div className="flex flex-col gap-2 user-select-none cursor-pointer">
                    <p className="text-sm text-muted-foreground cursor-pointer">
                        {files[0].name}
                    </p>
                </div>
            )}
        </Dropzone>
    );
}
