"use client";

import { templates } from "@/libs/constants/templates";
import { Button } from "@/libs/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/libs/ui/dialog";
import { Marquee } from "@/libs/ui/marquee";
import { dataLayer } from "@/libs/utils/data-layer";
import { setTemplateInLocalStorage } from "@/libs/utils/misc";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileUploader } from "./_components/pdf-dropzone";
import { OnboardingProvider, useOnboarding } from "./onboarding.context";

export type Template = {
    id: string;
    name: string;
    description: string;
    image: string;
};

const PDFUpload = ({
    template,
}: {
    template: Template;
}) => {
    const { pdfContent } = useOnboarding();
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-8">
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
                        <h1 className="text-lg font-serif">{template.name}</h1>
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
            <Button
                onClick={async () => {
                    try {
                        setTemplateInLocalStorage(template.id);
                        await dataLayer.post("/api/portfolios/create", {
                            content: pdfContent,
                        });
                        router.push("/editor");
                    } catch (error) {
                        console.error(error);
                    }
                }}
                className="self-end gap-1"
            >
                Generate
                <ArrowRight className="-rotate-45" />
            </Button>
        </div>
    );
};

const Onboarding = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-16">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-3xl font-serif">
                    telling your story, should be easy
                </h1>
                <p className="text-lg font-serif text-muted-foreground">
                    Select one of the people's webspace to get started.
                </p>
            </div>
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                <Marquee>
                    {templates.map((template) => (
                        <Dialog key={template.id}>
                            <DialogTrigger asChild>
                                <div className="w-96 bg-background border border-foreground/20 rounded-xl p-2 cursor-pointer">
                                    <div className="relative border-foreground/20 border rounded-lg overflow-hidden">
                                        <Image
                                            className="w-full aspect-video object-cover object-top rounded-lg border"
                                            src={template.image}
                                            width={1080}
                                            height={1080}
                                            alt={template.name}
                                        />
                                        <Button
                                            className="absolute bottom-2 right-2 rounded-sm"
                                            variant="default"
                                            size="icon"
                                        >
                                            <ArrowRight className="-rotate-45" />
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
                            <DialogContent className="w-full sm:max-w-[700px]">
                                <DialogTitle className="sr-only">
                                    Upload Resume for {template.name}
                                </DialogTitle>
                                <PDFUpload template={template} />
                            </DialogContent>
                        </Dialog>
                    ))}
                </Marquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
            </div>
        </div>
    );
};

const OnboardingWrapper = () => {
    return (
        <OnboardingProvider>
            <Onboarding />
        </OnboardingProvider>
    );
};

export { OnboardingWrapper as Onboarding };
