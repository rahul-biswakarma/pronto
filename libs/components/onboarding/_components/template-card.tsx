import type { Template } from "@/libs/constants/templates";
import Image from "next/image";

interface TemplateCardProps {
    template: Template;
    onClick?: () => void;
    onDropPdf?: (file: File) => void; // Optional advanced UX
}

export function TemplateCard({
    template,
    onClick,
    onDropPdf,
}: TemplateCardProps) {
    return (
        <div className="flex flex-col gap-4">
            <div
                className="relative overflow-hidden rounded-3xl aspect-square px-8 bg-surface-1 transition-colors duration-300 ease-out flex items-center justify-center"
                style={{
                    minWidth: "max(25vw, 25vh)",
                    maxWidth: "max(25vw, 25vh)",
                }}
            >
                {template.metadata?.isNew && (
                    <div className="absolute top-4 left-4 text-xs text-feno-text-3 px-2 py-1 rounded-lg bg-surface-2">
                        New
                    </div>
                )}
                <div className="absolute inset-0 bg-feno-surface-0/50 backdrop-blur-sm -z-10" />
                <Image
                    className="object-cover object-top aspect-video rounded-xl border"
                    src={template.image}
                    width={1080}
                    height={1080}
                    alt={template.name}
                />
            </div>
        </div>
    );
}
