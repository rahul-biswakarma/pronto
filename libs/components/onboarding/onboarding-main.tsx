"use client";
import { useLLMGeneration } from "@/libs/components/onboarding/_components/use-llm-generation";
import { useOnboarding } from "@/libs/components/onboarding/onboarding.context";
import { type Template, templates } from "@/libs/constants/templates";
import { Button } from "@/libs/ui/button";
import { Label } from "@/libs/ui/label";
import Image from "next/image";
import { useState } from "react";
import { Drawer } from "vaul";
import { FileUploader } from "./_components/pdf-dropzone";
import { TemplateCard } from "./_components/template-card";
type Category = {
    title: string;
    filter: (template: Template) => boolean;
    value: string;
};

const categories: Category[] = [
    {
        title: "Portfolios",
        filter: (t) => t.id.startsWith("feno:"),
        value: "feno:",
    },
    {
        title: "Articles",
        filter: (t) => t.id.startsWith("feno-article:"),
        value: "feno-article:",
    },
    // TODO: Add more categories as needed
];

type Step = "idle" | "modal" | "loading" | "success";

export function OnboardingMain() {
    const { pdfContent } = useOnboarding();

    const [step, setStep] = useState<Step>("idle");

    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        templates[0],
    );

    const [selectedCategory, setSelectedCategory] = useState<Category>(
        categories[0],
    );

    const {
        html,
        isStreaming,
        error: llmError,
        startGeneration,
    } = useLLMGeneration();

    const handleTemplateClick = (template: Template) => {
        setSelectedTemplate(template);
        setStep("modal");
    };

    const handleGenerate = async () => {
        console.log(pdfContent, selectedTemplate);

        if (!pdfContent || !selectedTemplate) {
            return;
        }
        startGeneration({ pdfContent, templateId: selectedTemplate.id });
    };

    return (
        <Drawer.Root open={step === "modal"}>
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
                    <div className="flex gap-x-2 items-center">
                        <div className="text-4xl font-italianno mr-4">
                            Filters:
                        </div>
                        {categories.map((cat) => {
                            return (
                                <div
                                    key={cat.title}
                                    className={`text-md px-3 py-2 rounded-full cursor-pointer transition-colors duration-300 ease-out border ${
                                        selectedCategory?.value === cat.value
                                            ? "bg-[var(--feno-surface-1-foreground)] text-[var(--feno-surface-1)]"
                                            : "bg-[var(--feno-surface-1)] text-[var(--feno-surface-1-foreground)]"
                                    }`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat.title}
                                </div>
                            );
                        })}
                    </div>
                    <section className="w-full grid grid-cols-3 items-center justify-center gap-x-4 gap-y-12">
                        {categories
                            .filter(
                                (cat) => cat.value === selectedCategory?.value,
                            )
                            .map((cat) => {
                                const template = templates.filter((t) =>
                                    t.id.startsWith(selectedCategory?.value),
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
                </div>
                <Drawer.Portal>
                    <Drawer.Overlay
                        className="fixed inset-0 bg-black/40"
                        onClick={() => setStep("idle")}
                    />

                    <Drawer.Content className="w-screen fixed bottom-0 left-0 right-0 outline-none overflow-hidden">
                        <div className=" p-4 rounded-t-[18px] bg-[var(--feno-surface-1)]">
                            <Drawer.Title className="hidden">
                                {selectedTemplate?.name}
                            </Drawer.Title>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="relative col-span-2">
                                    <div
                                        className="rounded-lg overflow-y-scroll max-h-[90vh]"
                                        style={{
                                            scrollbarWidth: "none",
                                            msOverflowStyle: "none",
                                        }}
                                    >
                                        <Image
                                            className="w-full -mt-1"
                                            width={1440}
                                            height={720}
                                            alt={selectedTemplate?.name || ""}
                                            src={selectedTemplate?.image || ""}
                                        />
                                        <div className="absolute w-full left-0 bottom-0 h-1/10 bg-gradient-to-t from-background" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-2">
                                    <FileUploader
                                        style={{
                                            border: "1px dashed",
                                            background: "var(--feno-surface-2)",
                                            fontFamily: "var(--font-sans)",
                                            fontSize: "14px",
                                            maxHeight: "100px",
                                        }}
                                    />
                                    <Button
                                        className="self-end"
                                        disabled={isStreaming}
                                        onClick={handleGenerate}
                                        // aria-disabled={isStreaming}
                                    >
                                        {isStreaming
                                            ? "Generating..."
                                            : "Generate"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </main>
        </Drawer.Root>
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
