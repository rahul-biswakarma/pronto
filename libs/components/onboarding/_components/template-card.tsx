import type { Template } from "@/libs/constants/templates";
import Image from "next/image";

interface TemplateCardProps {
    template: Template;
    onClick?: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div
                className="relative overflow-hidden rounded-3xl aspect-square bg-surface-1 transition-colors duration-300 ease-out flex items-center justify-center p-4 sm:p-6 md:p-8"
                onClick={onClick}
                role={onClick ? "button" : undefined}
            >
                {template.metadata?.isNew && (
                    <div className="absolute top-4 left-4 text-xs text-feno-text-3 px-2 py-1 rounded-lg bg-surface-2">
                        New
                    </div>
                )}
                <div className="absolute inset-0 bg-feno-surface-0/50 backdrop-blur-sm -z-10" />
                <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                        className="object-cover object-top aspect-video rounded-xl border w-full h-auto max-w-full max-h-full"
                        src={template.image}
                        width={1080}
                        height={1080}
                        alt={template.name}
                    />
                </div>
            </div>
        </div>
    );
}
