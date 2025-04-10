"use client";

import { usePDFWorkflow } from "@/hooks/use-pdf-workflow";
import { Dropzone } from "@dropzone-ui/react";
import { Flex, Text } from "@radix-ui/themes";

interface FileUploaderProps {
    className?: string;
}

export function FileUploader({ className }: FileUploaderProps) {
    const { files, error, isLoading, handleFileUpload } = usePDFWorkflow();

    return (
        <Flex
            direction="column"
            gap="4"
            align="center"
            justify="center"
            style={{ maxWidth: "700px", width: "100%", margin: "0 auto" }}
            className={className}
        >
            <Dropzone
                onChange={handleFileUpload}
                maxFiles={1}
                value={files}
                accept="application/pdf"
                header={false}
                footer={false}
                disabled={isLoading.pdfjs || isLoading.processing}
                style={{
                    border: "2px dashed #333",
                    background: "#1a1a1a",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "100%",
                }}
                label={
                    isLoading.pdfjs
                        ? "Loading PDF.js library..."
                        : "Drag 'n' drop a PDF resume here, or click to select"
                }
            />

            {error && (
                <Text color="red" size="2">
                    {error.toString()}
                </Text>
            )}
        </Flex>
    );
}
