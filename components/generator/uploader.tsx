"use client";

import { usePDFWorkflow } from "@/hooks/use-pdf-workflow";
import { Dropzone } from "@dropzone-ui/react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export const Uploader = () => {
    const router = useRouter();
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

    const handleGenerate = async () => {
        if (extractedText) {
            await generatePortfolio();
            if (portfolioHtml) {
                router.push("/editor");
            }
        }
    };

    return (
        <Flex
            direction="column"
            gap="4"
            align="center"
            justify="center"
            style={{ maxWidth: "700px", width: "100%", margin: "0 auto" }}
        >
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

            {extractedText && !portfolioHtml && (
                <Button
                    onClick={handleGenerate}
                    disabled={isLoading.processing || !extractedText}
                    style={{ marginTop: "16px" }}
                >
                    {isLoading.processing
                        ? "Generating..."
                        : "Generate Portfolio"}
                </Button>
            )}

            {stage === "completed" && (
                <Button
                    onClick={() => router.push("/editor")}
                    style={{ marginTop: "16px" }}
                >
                    View & Edit Portfolio
                </Button>
            )}
        </Flex>
    );
};
