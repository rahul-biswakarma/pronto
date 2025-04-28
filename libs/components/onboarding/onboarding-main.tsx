"use client";
import { useLLMGeneration } from "@/libs/components/onboarding/_components/use-llm-generation";
import { useOnboarding } from "@/libs/components/onboarding/onboarding.context";
import { type Template, templates } from "@/libs/constants/templates";
import { Label } from "@/libs/ui/label";
import { useState } from "react";
import { TemplateCard } from "./_components/template-card";
import { TemplateFilters } from "./template-filters";

import { ApolloDialog } from "@/components/onboarding/apollo-dialog";

import { Dialog } from "@/libs/ui/dialog";

export function OnboardingMain() {
    const { pdfContent } = useOnboarding();
    const [open, setOpen] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        templates[0],
    );

    const { categories, selectedCategory } = useOnboarding();

    const {
        html,
        isStreaming,
        error: llmError,
        startGeneration,
    } = useLLMGeneration();

    const handleTemplateClick = (template: Template) => {
        setSelectedTemplate(template);
        setOpen(true);
    };

    const handleGenerate = async () => {
        if (!pdfContent || !selectedTemplate) {
            return;
        }
        startGeneration({ pdfContent, templateId: selectedTemplate.id });
    };

    return (
        <Dialog open={open}>
            <main
                className="min-h-screen w-full p-16 flex flex-col items-center bg-surface-0 bg-cover bg-center"
                style={{
                    fontFamily: "var(--font-sans)",
                }}
            >
                <section className="mt-16 mb-8 text-center">
                    <Label className="text-[40px] font-medium text-center">
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
                <div className="max-w-[1440px] mt-24 w-full flex flex-col gap-y-8">
                    <TemplateFilters />
                    <section className="w-full grid grid-cols-3 items-center justify-center gap-x-4 gap-y-12">
                        {categories
                            .filter((cat) => cat.value === selectedCategory)
                            .map((cat) => {
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
                        isGenerating={isStreaming}
                        error={llmError ?? undefined}
                    />
                </div>
            </main>
        </Dialog>
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
