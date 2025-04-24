"use client";

import { generatePortfolioAction } from "@/app/actions/portfolio-actions";
import { templates } from "@/libs/constants/templates";
import { Button } from "@/libs/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/libs/ui/dialog";
import { Marquee } from "@/libs/ui/marquee";
import Image from "next/image";

import { IconArrowRight, IconLoader } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { NewsLetter } from "../waitlist/waitlist";
import { FileUploader } from "./_components/pdf-dropzone";
import { OnboardingProvider, useOnboarding } from "./onboarding.context";

export type Template = {
    id: string;
    name: string;
    description: string;
    image: string;
};

const PDFUpload = ({ template }: { template: Template }) => {
    const { pdfContent, setSelectedTemplateId } = useOnboarding();

    const router = useRouter();

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!pdfContent) {
            setError("Please upload your resume first");
            return;
        }

        setError(null);

        startTransition(async () => {
            try {
                const result = await generatePortfolioAction({
                    content: pdfContent,
                    templateId: template.id,
                });

                if (result.success && result.portfolioId) {
                    setSelectedTemplateId(template.id);
                    router.push("/editor");
                } else {
                    setError(result.error || "Failed to generate portfolio");
                }
            } catch (err) {
                console.error("Error calling generatePortfolioAction:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred",
                );
            }
        });
    };
    return (
        <>
            <DialogTitle className="sr-only">
                Upload Resume for {template.name}
            </DialogTitle>
            <div className="flex flex-col items-center justify-center h-full w-full gap-8 bg-accent p-4">
                <div className="flex flex-col w-full gap-2">
                    <h1 className="text-md italic text-muted-foreground font-serif">
                        selected template for cloning
                    </h1>
                    <div className="flex gap-4 items-center w-full">
                        <Image
                            src={template.image}
                            width={1080}
                            height={1080}
                            alt={template.name}
                            className="w-20 h-20 rounded-lg"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-serif">
                                {template.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {template.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full gap-2">
                    <h1 className="text-md italic text-muted-foreground font-serif">
                        upload your resume here
                    </h1>
                    <FileUploader
                        style={{
                            border: "dashed 1px",
                            background: "var(--background)",
                            fontFamily: "var(--font-serif)",
                            fontSize: "14px",
                        }}
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm w-full">{error}</div>
                )}

                <Button
                    onClick={handleGenerate}
                    className="self-end gap-1"
                    disabled={!pdfContent || isPending}
                >
                    {isPending ? (
                        <>
                            <IconLoader className="h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            Generate
                            <IconArrowRight className="-rotate-45" />
                        </>
                    )}
                </Button>
            </div>
        </>
    );
};

const WaitListPopover = () => {
    return (
        <div className="flex flex-col mx-auto h-full w-full gap-0 rounded-xl p-1 bg-accent overflow-hidden">
            <div className="bg-white rounded-lg">
                <img
                    src="/image.png"
                    alt="story telling"
                    className="w-full aspect-[16/4] object-cover object-top"
                />
                <div className="flex flex-col gap-4 rounded-lg p-4 bg-transparent">
                    <p className="text-foreground font-sans text-[16px]">
                        We built tools to free us, yet chained ourselves to
                        website builders complex ux to build a simple enough
                        profiles. Sharing — that should be effortless — now
                        feels like wading through noise.
                        <br />
                        <br />
                        <span>
                            So we built{" "}
                            <span className="font-italianno text-4xl">
                                feno
                            </span>
                            , for people like you.
                        </span>
                    </p>
                    <NewsLetter />
                </div>
            </div>
        </div>
    );
};

const Onboarding = ({ authenticated }: { authenticated: boolean }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-16">
            <div className="flex flex-col items-center justify-center gap-1 px-4">
                <h1 className="text-3xl">
                    <span className="font-italianno text-5xl underline decoration-1 underline-offset-2">
                        telling
                    </span>{" "}
                    your{" "}
                    <span className="font-italianno text-5xl underline decoration-1 underline-offset-2">
                        story
                    </span>
                    , should be{" "}
                    <span className="font-italianno text-5xl underline decoration-1 underline-offset-2">
                        simple
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground">
                    building your online presence should be simple
                </p>
            </div>
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                <Marquee pauseOnHover>
                    {templates.map((template) => {
                        const { Renderer } = authenticated
                            ? {
                                  Renderer: PDFUpload,
                              }
                            : {
                                  Renderer: WaitListPopover,
                              };

                        return (
                            <Dialog key={template.id}>
                                <DialogTrigger className="relative" asChild>
                                    <div className="w-56 md:w-96 bg-accent border border-foreground/20 rounded-[12px] p-1 cursor-pointer">
                                        <div className="relative border-foreground/20 border rounded-[8px] overflow-hidden">
                                            <Image
                                                className="w-full aspect-video object-cover object-top -mt-1"
                                                src={template.image}
                                                width={1080}
                                                height={1080}
                                                alt={template.name}
                                            />
                                            <Button
                                                className="absolute bottom-2 right-2 rounded-sm border-accent/50"
                                                variant="default"
                                                size="icon"
                                            >
                                                <IconArrowRight className="-rotate-45 stroke-white" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-col px-2 pt-2 pb-1">
                                            <h3 className="text-sm">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {template.description}
                                            </p>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="w-full sm:max-w-[700px] p-0 bg-transparent border-0 shadow-none outline-none">
                                    <Renderer template={template} />
                                </DialogContent>
                            </Dialog>
                        );
                    })}
                </Marquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
            </div>
        </div>
    );
};

const OnboardingWrapper = ({ authenticated }: { authenticated: boolean }) => {
    return (
        <OnboardingProvider>
            <Onboarding authenticated={authenticated} />
        </OnboardingProvider>
    );
};

export { OnboardingWrapper as Onboarding };
