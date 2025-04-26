"use client";
import { ErrorToast } from "@/libs/components/onboarding/_components/error-toast";
import { LoaderScreen } from "@/libs/components/onboarding/_components/loader-screen";
import { UploadModal } from "@/libs/components/onboarding/_components/upload-modal";
import { useLLMGeneration } from "@/libs/components/onboarding/_components/use-llm-generation";
import { useTemplateData } from "@/libs/components/onboarding/_components/use-template-data";
import { OnboardingProvider } from "@/libs/components/onboarding/onboarding.context";
import type { Template } from "@/libs/constants/templates";
import { Label } from "@/libs/ui/label";
import React, { useState } from "react";
import { TemplateCard } from "./_components/template-card";

type Category = {
    title: string;
    filter: (template: Template) => boolean;
};

const categories: Category[] = [
    { title: "Portfolios", filter: (t) => t.id.startsWith("feno:") },
    // { title: "Articles", filter: (t) => t.id.startsWith("feno-article:") },
    // TODO: Add more categories as needed
];

type Step = "idle" | "modal" | "loading" | "success";

export function OnboardingMain() {
    const { data: templates, isLoading } = useTemplateData();
    const [step, setStep] = useState<Step>("idle");
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null,
    );
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const {
        html,
        isStreaming,
        error: llmError,
        startGeneration,
    } = useLLMGeneration();
    const [showError, setShowError] = useState<string | null>(null);

    const handleTemplateClick = (template: Template) => {
        setSelectedTemplate(template);
        setStep("modal");
    };

    const handleUpload = (file: File) => {
        setPdfFile(file);
    };

    const handleGenerate = async () => {
        if (!pdfFile || !selectedTemplate) {
            setShowError("Please upload a PDF and select a template.");
            return;
        }
        setStep("loading");
        const pdfContent = await fileToText(pdfFile);
        startGeneration({ pdfContent, templateId: selectedTemplate.id });
    };

    const handleModalClose = () => {
        setStep("idle");
        setSelectedTemplate(null);
        setPdfFile(null);
        setShowError(null);
    };

    React.useEffect(() => {
        if (llmError) setShowError(llmError);
    }, [llmError]);

    React.useEffect(() => {
        if (step === "loading" && !isStreaming && html) {
            setTimeout(() => setStep("success"), 400);
        }
    }, [step, isStreaming, html]);

    return (
        <OnboardingProvider>
            <main
                className="min-h-screen w-full flex flex-col items-center bg-surface-1"
                style={{ fontFamily: "var(--font-sans)" }}
            >
                <section className="mt-[130px] mb-8 text-center">
                    <Label className="text-[40px] font-medium">
                        <span className="font-italianno text-6xl">Telling</span>{" "}
                        your{" "}
                        <span className="font-italianno text-6xl">story</span>{" "}
                        should be{" "}
                        <span className="font-italianno text-6xl">simple</span>
                    </Label>
                    <p className="text-lg text-[var(--color-text-2)]">
                        We'll help you create a beautiful site in seconds,
                        without any coding.
                    </p>
                </section>
                <section className="w-full flex items-center justify-center mt-30 flex-wrap gap-x-4 gap-y-12">
                    {categories.map((cat) => {
                        const template = templates.filter(cat.filter);
                        return template.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onClick={() => handleTemplateClick(template)}
                            />
                        ));
                    })}
                </section>
                <div
                    className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-300 ${step === "modal" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none scale-95"}`}
                    aria-hidden={step !== "modal"}
                >
                    <UploadModal
                        open={step === "modal"}
                        template={selectedTemplate}
                        onClose={handleModalClose}
                        onUpload={handleUpload}
                        isLoading={step === "loading"}
                        error={showError}
                    />
                </div>
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${step === "loading" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none scale-95"}`}
                    aria-hidden={step !== "loading"}
                >
                    <LoaderScreen
                        htmlPreview={html}
                        isStreaming={isStreaming}
                    />
                </div>
                {step === "success" && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-6 py-3 rounded-lg shadow-xl fade-in">
                        <span className="font-semibold">
                            Site generated successfully!
                        </span>
                    </div>
                )}
                {showError && (
                    <ErrorToast
                        message={showError}
                        onClose={() => setShowError(null)}
                    />
                )}
            </main>
        </OnboardingProvider>
    );
}

export async function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
