"use client";

import { generateHomePageAction } from "@/libs/actions/website-actions";
import { ApolloDialog } from "@/libs/components/onboarding/_components/apollo-dialog";
import { useOnboarding } from "@/libs/components/onboarding/onboarding.context";
import { type Template, templates } from "@/libs/constants/templates";
import { usePDFJS } from "@/libs/hooks/use-pdf";
import { Dialog } from "@/libs/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navigation } from "../common/nav";
import { Header } from "./_components/header";
import { TemplateCard } from "./_components/template-card";

export function OnboardingMain() {
    const { pdfContent, setPdfContent } = useOnboarding();
    const [open, setOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [llmError, setLlmError] = useState<string | null>(null);
    const router = useRouter();
    const { extractTextFromPDF } = usePDFJS();

    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        templates[0],
    );

    const { categories, selectedCategory } = useOnboarding();

    const handleTemplateClick = (template: Template) => {
        setSelectedTemplate(template);
        setOpen(true);
    };

    const handlePdfUpload = async (file: File) => {
        try {
            const extractedText = await extractTextFromPDF(file);
            setPdfContent(extractedText);
        } catch (error) {
            console.error("Error extracting text from PDF:", error);
            setLlmError("Failed to process PDF. Please try another file.");
        }
    };

    const handleGenerate = async () => {
        if (!pdfContent || !selectedTemplate) {
            setLlmError("Please upload your resume first");
            return;
        }

        setLlmError(null);
        setIsStreaming(true);

        try {
            const result = await generateHomePageAction({
                content: pdfContent,
                templateId: selectedTemplate.id,
                pageType: "homepage",
            });

            if (result.success && result.domain) {
                router.push(`/${result.domain}`);
            } else {
                setLlmError(result.error || "Failed to generate portfolio");
            }
        } catch (error) {
            console.error("Error generating homepage:", error);
            setLlmError(
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred",
            );
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <Dialog open={open}>
            <main className="relative min-h-screen w-full py-14 pt-10 flex flex-col items-center bg-gradient-to-b from-surface-0 to-surface-0/95">
                <img
                    className="absolute -top-7 w-[80vw] max-w-[900px] z-[2]"
                    src="/assets/blur.png"
                    alt=""
                />

                <Navigation />

                <Header />

                <div className="w-full z-10 max-w-[1200px] flex flex-col gap-y-10 mt-20 p-6">
                    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories
                            .filter((cat) => cat.value === selectedCategory)
                            .map(() => {
                                const template = templates.filter((t) =>
                                    t.id.startsWith(selectedCategory ?? ""),
                                );
                                return template.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() =>
                                            handleTemplateClick(template)
                                        }
                                    >
                                        <TemplateCard template={template} />
                                    </div>
                                ));
                            })}
                    </section>
                    <ApolloDialog
                        open={open}
                        onOpenChange={setOpen}
                        template={selectedTemplate ?? templates[0]}
                        onGenerate={handleGenerate}
                        onPdfUpload={handlePdfUpload}
                        isGenerating={isStreaming}
                        error={llmError ?? undefined}
                    />
                </div>

                <div className="relative px-6 w-full mt-34 flex justify-center">
                    <div className="flex-1 max-w-[1400px] bg-[#fafafa]  rounded-2xl flex flex-col items-center justify-center gap-5 p-6 py-20 w-full">
                        <div className="font-mono font-medium text-xs px-2 py-1 border border-white/40 rounded-full">
                            HOW IT WORKS
                        </div>
                        <h3 className="text-5xl/[116.667%] text-center font-semibold">
                            Three simple steps to
                            <br />
                            organized bliss
                        </h3>
                        <div className="relative flex mt-[4rem] flex-wrap gap-[4rem] justify-center items-center">
                            <img
                                src="/assets/upload.png"
                                alt="upload"
                                className="rounded-3xl"
                                style={{
                                    width: "100%",
                                    maxWidth: "500px",
                                    maxHeight: "500px",
                                }}
                            />

                            <img
                                src="/assets/templates.png"
                                alt="template"
                                style={{
                                    width: "100%",
                                    maxWidth: "500px",
                                    maxHeight: "500px",
                                }}
                            />
                            <img
                                src="/assets/deploy.png"
                                alt="deploy"
                                style={{
                                    width: "100%",
                                    maxWidth: "500px",
                                    maxHeight: "500px",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </Dialog>
    );
}
